import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private apiUrl = 'http://localhost:8000/api/chat/stream'; // Your FastAPI streaming endpoint

  constructor() { }

  /**
   * Connects to the streaming API and returns an Observable of message chunks.
   * @param message The user's message to send to the backend.
   * @returns An Observable that emits each chunk of the AI's response.
   */
  sendMessageStream(message: string): Observable<string> {
    return new Observable<string>(observer => {
      // Create the request body
      const body = JSON.stringify({ message });

      // The EventSource API is the browser's built-in way to handle Server-Sent Events.
      // We cannot use HttpClient for this, as it's designed for single responses.
      // Note: For EventSource with POST, we need a different approach. A simple EventSource
      // only supports GET. A common workaround is to use the fetch API with a reader.
      
      const postStream = async () => {
        try {
          const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream'
            },
            body: body,
          });

          if (!response.body) {
            throw new Error("Response body is null");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            // The data comes in a "data: {content}\n\n" format. We need to parse it.
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n\n').filter(line => line.trim() !== '');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.substring(6);
                observer.next(data);
              }
            }
          }
          observer.complete();
        } catch (err) {
          observer.error(err);
        }
      };

      postStream();

      // Return a teardown function to close the connection if the subscriber unsubscribes
      return () => {
        // Logic to abort the fetch if necessary, can be complex to implement
        console.log("Unsubscribed from chat stream.");
      };
    });
  }
}
