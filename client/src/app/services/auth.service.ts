import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment.development';
import { envType } from '../models/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private apiUrl: string = (environment as envType).apiUrl;


  constructor(private http: HttpClient) {
    console.log(this.apiUrl);
  }

  loginWithGoogle(): void {
    // This URL must match the route that triggers your backend's Google OAuth strategy.
    window.location.href = `${this.apiUrl}/google`;
  }

  /**
   * Initiates the GitHub OAuth flow by redirecting the browser to the backend.
   */
  loginWithGitHub(): void {
    // This URL must match the route that triggers your backend's GitHub OAuth strategy.
    window.location.href = `${this.apiUrl}/github`;
  }

  signup(credentials: { name: string, email: string, password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/signup`, credentials);
  }

  login(credentials: { email: string, password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials);
  }

  logout(): Observable<void> {
    return of(undefined);
  }

  /**
   * CORRECTED: Gets user details by sending the stored token for server-side validation.
   * This is the secure way to re-establish a session.
   */
  getUserDetails(token: string) {
    if (!token) {
      // If no token exists, return an observable that immediately errors.
      return throwError(() => new Error('No token found'));
    }

    // Create headers to send the token to the backend.
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Your backend should have a protected endpoint like '/me' or '/profile'
    // that validates the token and returns the user data.
    console.log(this.apiUrl)
    return this.http.get<User>(`${this.apiUrl}/get-user-details`, { headers });
  }
}

