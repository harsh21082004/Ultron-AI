import os
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import AIMessageChunk

# Load environment variables from the .env file
load_dotenv()

# --- MODEL INITIALIZATION ---

def get_groq_model():
    """Initializes and returns the Groq model."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in .env file.")
    return ChatGroq(
        groq_api_key=api_key,
        model_name="llama-3.1-8b-instant",
        temperature=0.7
    )

# --- MEMORY MANAGEMENT ---
session_store = {}

def get_session_history(session_id: str):
    """Retrieves or creates a message history object for a given session ID."""
    if session_id not in session_store:
        session_store[session_id] = InMemoryChatMessageHistory()
    return session_store[session_id]

# --- PROMPT TEMPLATE ---
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful AI assistant named Ultron. Your goal is to be friendly, informative, and provide accurate answers based on the conversation history."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
])


# --- CHAIN CREATION (Using modern LCEL syntax) ---
model = get_groq_model()
runnable = prompt | model

chain_with_history = RunnableWithMessageHistory(
    runnable,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)


# --- SERVICE FUNCTIONS ---

async def stream_groq_message(message: str, session_id: str = "default_session"):
    """
    Processes a message with the Groq model and yields the response in chunks (streaming)
    in the Server-Sent Events (SSE) format.
    """
    try:
        config = {"configurable": {"session_id": session_id}}
        
        async for chunk in chain_with_history.astream({"input": message}, config=config):
            if isinstance(chunk, AIMessageChunk) and chunk.content:
                # CORRECTED: Format the chunk for Server-Sent Events (SSE).
                # The client expects a 'data: ' prefix and two newlines.
                yield f"data: {chunk.content}\n\n"

    except Exception as e:
        print(f"Error with Groq Streaming Chain: {e}")
        # Also format the error for SSE to ensure the client receives it.
        yield f"data: An error occurred while streaming the response.\n\n"

# --- Placeholder functions for future expansion ---

async def generate_image(prompt: str):
    print(f"Placeholder for image generation with prompt: {prompt}")
    return {"status": "Image generation not yet implemented."}

async def generate_video(prompt: str):
    print(f"Placeholder for video generation with prompt: {prompt}")
    return {"status": "Video generation not yet implemented."}

