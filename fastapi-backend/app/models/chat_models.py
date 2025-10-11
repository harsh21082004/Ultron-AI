from pydantic import BaseModel

# This model defines the expected structure for an incoming chat request.
# FastAPI will automatically validate that the request body has a 'message' field of type string.
class ChatRequest(BaseModel):
    message: str

# This model defines the structure of the non-streaming response that our API will send back.
class ChatResponse(BaseModel):
    reply: str

