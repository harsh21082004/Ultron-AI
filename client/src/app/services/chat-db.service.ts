import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage } from '../store/chat/chat.state';

@Injectable({
  providedIn: 'root'
})
export class ChatDbService {
  // This is the URL for your Node.js/Express backend
  private apiUrl = 'http://localhost:3000/api/chats'; 

  constructor(private http: HttpClient) { }

  /**
   * Helper function to get the authentication headers with the JWT.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Saves the entire chat history to the database via the Express backend.
   * @param chatId The ID of the current chat session.
   * @param messages The array of all messages in the conversation.
   */
  saveChat(chatId: string, messages: ChatMessage[]): Observable<any> {
    // Safely find the first user message to create a title
    const firstUserMessage = messages.find(m => m.sender === 'user');
    const firstTextContent = firstUserMessage?.content.find(c => c.type === 'text');
    const title = (firstTextContent?.value as string)?.substring(0, 50) || 'New Chat';

    const payload = { chatId, messages, title };
    
    // Makes a POST request to your Express server's /api/chats endpoint
    return this.http.post(`${this.apiUrl}/save`, payload, { headers: this.getAuthHeaders() });
  }

  /**
   * Fetches the chat history for a given chat ID from the database.
   * @param chatId The unique ID for the chat session.
   * @returns An Observable array of ChatMessages.
   */
  getChatHistory(chatId: string): Observable<ChatMessage[]> {
    // This assumes your Express backend has a GET endpoint like /api/chats/:id
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/get/${chatId}`, {
      headers: this.getAuthHeaders()
    });
  }
}

