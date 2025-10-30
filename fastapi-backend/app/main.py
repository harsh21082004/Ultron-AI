from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models.chat_models import ChatRequest, ChatResponse
from .services import chat_service
from fastapi.responses import StreamingResponse
from typing import List
from pydantic import BaseModel

# Initialize the FastAPI application
app = FastAPI(
    title="AI Chatbot API",
    description="An API for the AI Chatbot powered by Groq and LangChain.",
    version="1.0.0"
)

# --- CORS (Cross-Origin Resource Sharing) Middleware ---
# This is crucial for allowing your Angular frontend (running on http://localhost:4200)
# to communicate with this backend (running on http://localhost:8000).
origins = [
    "http://localhost:4200", # Your Angular app's origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# --- API Endpoints ---

@app.get("/", tags=["Root"])
async def read_root():
    """A simple root endpoint to confirm the API is running."""
    return {"message": "Welcome to the Ultron AI Chatbot API!"}


@app.get("/api/chat/{session_id}", tags=["Chat"])
async def handle_get_chat_history(session_id: str) -> List[dict]:
    """
    Retrieves the message history for a specific chat session.
    """
    return chat_service.get_chat_history(session_id)


@app.post("/api/chat/stream", tags=["Chat"])
async def handle_chat_stream(request: ChatRequest, session_id: str = "default_session"):
    """
    Receives a user's message, processes it using the streaming Groq chain,
    and streams the response back to the client word by word.
    """
    # This returns a StreamingResponse, which FastAPI handles specially.
    # It will keep the connection open and send data as it's yielded from the service.
    return StreamingResponse(
        chat_service.stream_groq_message(request.message, session_id),
        media_type="text/event-stream"
    )

class TitleRequest(BaseModel):
    messages: List[dict]

@app.post("/api/chat/generate-title")
async def generate_title_route(request: TitleRequest):
    """
    Receives a chat history and returns an AI-generated title.
    """
    try:
        # Get the messages from the request body
        messages = request.messages
        
        # Call your service function
        title = await chat_service.generate_chat_title(messages)
        
        return {"title": title}
    except Exception as e:
        return {"error": str(e)}, 500