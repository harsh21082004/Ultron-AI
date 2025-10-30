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

title_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Your task is to generate a concise, 2-5 word title for the following conversation. Do not add any prefix like 'Title:'. Do not use quotes. Just return the plain text title."),
    ("user", "{conversation_history}")
])


# --- CHAIN CREATION (Using modern LCEL syntax) ---
model = get_groq_model()
runnable = prompt | model

title_chain = title_prompt | model

chain_with_history = RunnableWithMessageHistory(
    runnable,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)


# --- SERVICE FUNCTIONS ---

async def generate_chat_title(messages: list) -> str:
    """
    Generates a concise title for a chat history.
    'messages' is the list of ChatMessage objects from the frontend.
    """
    # 1. Format the message list from the frontend into a simple string
    conversation_str = ""
    for msg in messages:
        sender = "User" if msg.get('sender') == 'user' else "AI"
        # Combine all content blocks into one string for this message
        content = " ".join([block.get('value', '') for block in msg.get('content', []) if block.get('type') == 'text'])
        conversation_str += f"{sender}: {content}\n"
    
    if not conversation_str.strip():
        return "New Chat" # Fallback if history is empty

    # 2. Invoke the title chain
    # .ainvoke() returns a BaseMessage (like AIMessage)
    try:
        response_message = await title_chain.ainvoke({"conversation_history": conversation_str})
        # Clean up the title, remove quotes or extra newlines
        title = response_message.content.strip().replace('"', '').split('\n')[0]
        return title if title else "New Chat"
    except Exception as e:
        print(f"Error generating title: {e}")
        return "New Chat" # Fallback

async def stream_groq_message(message: str, session_id: str):
    """
    Streams the Groq response token by token without any
    backend buffering.
    """
    config = {"configurable": {"session_id": session_id}}

    async for chunk in chain_with_history.astream({"input": message}, config=config):
        # Directly yield the content of the chunk.
        # The frontend will handle parsing and buffering.
        token = chunk.content if isinstance(chunk, AIMessage) else str(chunk)
        if token:
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

