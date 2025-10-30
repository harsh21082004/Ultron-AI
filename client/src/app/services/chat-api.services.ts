import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatMessage } from '../store/chat/chat.state';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  // This is the URL for your Python FastAPI streaming backend
  private apiUrl = 'http://localhost:8000/api/chat'; 

  constructor(private http: HttpClient) { }

  /**
   * Connects to the streaming API and returns an Observable of message chunks.
   * @param message The user's message to send to the backend.
   * @param chatId The unique ID for the current chat session.
   * @returns An Observable that emits each chunk of the AI's response.
   */

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * --- NEW METHOD ---
   * Calls the FastAPI backend to generate a title for a given chat history.
   * @param messages The array of all messages in the conversation.
   * @returns An Observable that emits the title object: { title: string }.
   */
  generateTitle(messages: ChatMessage[]): Observable<{ title: string }> {
    // This endpoint must match the new route you create in your FastAPI main.py
    return this.http.post<{ title: string }>(`${this.apiUrl}/generate-title`, 
      { messages }, 
      { headers: this.getAuthHeaders() }
    );
  }

  sendMessageStream(message: string, chatId: string): Observable<string> {
    return new Observable<string>(observer => {
      const token = localStorage.getItem('token');
      if (!token) {
        observer.error('No authentication token found.');
        return;
      }

      const postStream = async () => {
        try {
          // CORRECTED: The chatId is now correctly passed as a path parameter.
          const response = await fetch(`${this.apiUrl}/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream',
              'Authorization': `Bearer ${token}` // Secure the request
            },
            body: JSON.stringify({ message }),
          });

          if (response.status === 401) {
             throw new Error("Unauthorized: Invalid or expired token.");
          }
          if (!response.body) {
            throw new Error("Response body is null");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break; // The stream has finished
            
            const data = decoder.decode(value);
            observer.next(data);
          }
          // When the loop finishes, the stream is complete.
          observer.complete();
        } catch (err) {
          observer.error(err);
        }
      };

      postStream();
    });
  }
}

