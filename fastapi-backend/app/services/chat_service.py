import os
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import AIMessage

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
        model_name="llama-3.3-70b-versatile",
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
    ("system", "You are a helpful AI assistant named Ultron. Your goal is to be friendly, informative, and provide accurate answers based on the conversation history. Format tables using markdown with clear separators."),
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

async def stream_groq_message(message: str, session_id: str):
    config = {"configurable": {"session_id": session_id}}

    buffer = ""
    buffering_table = False

    async for chunk in chain_with_history.astream({"input": message}, config=config):
        token = chunk.content if isinstance(chunk, AIMessage) else str(chunk)

        # Detect if a Markdown table / image block is starting
        if ("| " in token or token.strip().startswith("```")) and not buffering_table:
            buffering_table = True

        if buffering_table:
            buffer += token
            # Table / code block normally ends with **double newline**
            if "\n\n" in buffer or token.strip().endswith("```"):
                yield buffer  # Send full table / code / image
                buffer = ""
                buffering_table = False
        else:
            # Normal streaming token by token
            yield token


def get_chat_history(session_id: str):
    """
    Retrieves the message history and formats it for the frontend.
    """
    if session_id in session_store:
        history = get_session_history(session_id)
        formatted_messages = []
        for msg in history.messages:
            if msg.type == "human":
                 formatted_messages.append({"sender": "user", "content": [{"type": "text", "value": msg.content}]})
            elif msg.type == "ai":
                 formatted_messages.append({"sender": "ai", "content": [{"type": "text", "value": msg.content}]})
        return formatted_messages
    return []

