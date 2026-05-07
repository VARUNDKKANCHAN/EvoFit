import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import SystemMessage, HumanMessage
from sqlalchemy.orm import Session
from backend.database.models import WorkoutSession, User, UserProfile, BodyMetric
from backend.database.database import SessionLocal

load_dotenv()

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
CHROMA_DB_DIR = os.path.join(ROOT_DIR, "data/chroma_db")
KNOWLEDGE_FILE = os.path.join(ROOT_DIR, "data/knowledge/exercise_guides.md")

class ChatService:
    def __init__(self):
        # Use a lightweight embedding model
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_store = self._init_vector_store()
        self.llm = ChatGroq(
            groq_api_key=GROQ_API_KEY,
            model_name="llama-3.1-8b-instant",
            temperature=0.2
        )

    def _init_vector_store(self):
        if not os.path.exists(CHROMA_DB_DIR):
            os.makedirs(CHROMA_DB_DIR)
        
        return Chroma(
            persist_directory=CHROMA_DB_DIR,
            embedding_function=self.embeddings
        )

    def index_knowledge_base(self):
        """Index the exercise_guides.md into ChromaDB."""
        if not os.path.exists(KNOWLEDGE_FILE):
            print(f"Knowledge file not found at {KNOWLEDGE_FILE}")
            return

        with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
            text = f.read()

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = splitter.split_text(text)
        
        # Add to vector store
        self.vector_store.add_texts(chunks)
        print(f"Successfully indexed {len(chunks)} chunks into ChromaDB.")

    def get_user_context(self, user_id: int, db: Session):
        """Fetch user-specific workout data and body metrics to personalize the chat."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return "No user data found."

        # Fetch Profile and latest Body Metrics
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        latest_metric = db.query(BodyMetric).filter(BodyMetric.user_id == user_id).order_by(BodyMetric.log_date.desc()).first()
        
        context = f"User Profile:\n- Name: {user.username}\n- Level: {user.level}\n- Total XP: {user.xp}\n"
        
        if profile:
            context += f"- Age: {profile.age if profile.age else 'N/A'}\n"
            context += f"- Gender: {profile.gender if profile.gender else 'N/A'}\n"
            context += f"- Height: {profile.height_cm if profile.height_cm else 'N/A'} cm\n"
            context += f"- Fitness Goal: {profile.fitness_goal if profile.fitness_goal else 'N/A'}\n"
        
        # Priority on dynamic weight log, fallback to profile static weight
        current_weight = latest_metric.weight if latest_metric else (profile.weight_kg if profile else None)
        context += f"- Current Weight: {current_weight if current_weight else 'N/A'} kg\n\n"

        sessions = db.query(WorkoutSession).filter(WorkoutSession.user_id == user_id).order_by(WorkoutSession.created_at.desc()).limit(5).all()
        
        context += "Recent Workout History:\n"
        if not sessions:
            context += "- No sessions recorded yet.\n"
        else:
            for s in sessions:
                context += f"- Date: {s.date}, Exercise: {s.exercise}, Reps: {s.reps_actual}, Form Score: {s.form_score}%\n"

        # Fetch Weekly Targets
        from backend.database.models import Target
        from datetime import date
        today = date.today()
        targets = db.query(Target).filter(
            Target.user_id == user_id,
            Target.end_date >= today
        ).all()
        
        context += "\nCurrent Weekly Targets:\n"
        if not targets:
            context += "- No active targets.\n"
        else:
            for t in targets:
                # Get current reps done towards this target
                from sqlalchemy import func
                reps_done = db.query(func.sum(WorkoutSession.reps_actual)).filter(
                    WorkoutSession.user_id == user_id,
                    WorkoutSession.exercise == t.exercise,
                    WorkoutSession.date >= t.start_date,
                    WorkoutSession.date <= t.end_date
                ).scalar() or 0
        # Recovery Estimator Engine
        from datetime import timedelta
        from sqlalchemy import func
        forty_eight_hours_ago = today - timedelta(days=2)
        recent_volume = db.query(
            WorkoutSession.exercise,
            func.sum(WorkoutSession.reps_actual).label("reps")
        ).filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.date >= forty_eight_hours_ago
        ).group_by(WorkoutSession.exercise).all()

        muscle_map = {
            "bench": "Chest & Triceps",
            "ohp": "Shoulders & Triceps",
            "squat": "Legs",
            "dead": "Legs & Lower Back",
            "row": "Back & Biceps"
        }

        recovering_muscles = []
        for ex, reps in recent_volume:
            if reps and reps > 40:
                muscle = muscle_map.get(ex, ex.capitalize())
                if muscle not in recovering_muscles:
                    recovering_muscles.append(muscle)
                    
        all_muscles = list(set(muscle_map.values()))
        fresh_muscles = [m for m in all_muscles if m not in recovering_muscles]
        
        context += "\nRecovery Status:\n"
        if recovering_muscles:
            rec_str = " & ".join(recovering_muscles[:2])
            suggest_str = fresh_muscles[0] if fresh_muscles else "Light Cardio"
            context += f"- {rec_str} require 48 hours of recovery.\n- Suggested next workout focus: {suggest_str}.\n"
        else:
            context += "- All muscle groups are fully recovered. Ready for any workout.\n"

        return context

    def get_chat_response(self, query: str, user_id: int):
        """Generate a personalized RAG response."""
        db = SessionLocal()
        try:
            # 1. Retrieve knowledge context from ChromaDB
            docs = self.vector_store.similarity_search(query, k=3)
            kb_context = "\n".join([d.page_content for d in docs])

            # 2. Retrieve user context from SQL DB
            user_context = self.get_user_context(user_id, db)

            # 3. Construct System Prompt
            system_prompt = f"""
            You are EvoFit AI, a professional, high-performance fitness coach and assistant.
            Your goal is to provide accurate, personalized, and encouraging advice to the user.
            
            Use the following context to answer the user's question:
            
            [KNOWLEDGE BASE CONTEXT]
            {kb_context}
            
            [USER WORKOUT CONTEXT]
            {user_context}
            
            RULES:
            1. If the user asks about exercise form or technique, refer to the Knowledge Base.
            2. If the user asks about their progress or history, refer to the User Workout Context.
            3. Be concise and professional. Use bullet points for steps.
            4. If you don't have information in the context, be honest and suggest they track more workouts.
            5. Always maintain a motivational "coach" persona.
            """

            # 4. Check Daily Limit and Reset if needed
            from datetime import date
            today = date.today()
            user = db.query(User).filter(User.id == user_id).first()
            
            if user:
                # Daily Reset Logic
                if user.last_rag_use_date != today:
                    user.rag_tokens_today = 0
                    user.last_rag_use_date = today
                    db.commit()
                
                # Limit Check
                if user.rag_tokens_today >= user.rag_tokens_daily_limit:
                    return f"Daily AI limit reached ({user.rag_tokens_daily_limit} tokens). Please try again tomorrow or contact an administrator to increase your limit."

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=query)
            ]

            # 5. Call Groq LLM
            response = self.llm.invoke(messages)
            
            # 6. Extract token usage and update user stats
            try:
                usage = response.response_metadata.get("token_usage", {})
                total_tokens = usage.get("total_tokens", 0)
                
                if total_tokens > 0 and user:
                    user.rag_tokens_total += total_tokens
                    user.rag_tokens_today += total_tokens
                    db.commit()
            except Exception as e:
                print(f"Error updating RAG token usage: {e}")
                
            return response.content

        except Exception as e:
            print(f"Error in get_chat_response: {e}")
            return f"I'm sorry, I encountered an error while processing your request: {str(e)}"
        finally:
            db.close()

# Singleton instance for the application
chat_service = ChatService()
