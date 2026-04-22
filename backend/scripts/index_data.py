import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from backend.services.chat_service import chat_service

def run_indexing():
    print("Starting knowledge base indexing...")
    chat_service.index_knowledge_base()
    print("Indexing complete.")

if __name__ == "__main__":
    run_indexing()
