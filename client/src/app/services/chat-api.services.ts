import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  // This is the URL for your Python FastAPI streaming backend
  private apiUrl = 'http://localhost:8000/api/chat'; 

  constructor() { }

  /**
   * Connects to the streaming API and returns an Observable of message chunks.
   * @param message The user's message to send to the backend.
   * @param chatId The unique ID for the current chat session.
   * @returns An Observable that emits each chunk of the AI's response.
   */
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

