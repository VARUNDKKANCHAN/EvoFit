
import sys
try:
    import langchain
    print(f"LangChain version: {langchain.__version__}")
except ImportError:
    print("LangChain NOT found.")

try:
    import chromadb
    print(f"ChromaDB version: {chromadb.__version__}")
except ImportError:
    print("ChromaDB NOT found.")

try:
    import sentence_transformers
    print("Sentence Transformers found.")
except ImportError:
    print("Sentence Transformers NOT found.")

try:
    import sqlalchemy
    print(f"SQLAlchemy version: {sqlalchemy.__version__}")
except ImportError:
    print("SQLAlchemy NOT found.")

try:
    import groq
    print("Groq SDK found.")
except ImportError:
    print("Groq SDK NOT found.")

try:
    import google.generativeai as genai
    print("Google GenAI SDK found.")
except ImportError:
    print("Google GenAI SDK NOT found.")
