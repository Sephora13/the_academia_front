import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import {jwtDecode} from 'jwt-decode';
import { HttpClient,
  HttpHeaders,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HTTP_INTERCEPTORS } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {

  constructor(private http : HttpClient) {}

  private apiUrl = 'http://localhost:3000/auth/SignIn';

  signIn(email: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { email, password }).pipe(
      tap((response: any) => {
        if (response.access_token) {
          localStorage.setItem('token', response.access_token);
          this.saveUserRole(response.access_token);
        } else {
          this.logout();
        }
      })
    );
  }
  
  // Méthode pour décoder le token JWT et récupérer le rôle
  private saveUserRole(token: string) {
    try {
      const decodedToken: any = jwtDecode(token);
      const roles = decodedToken.roles;
      if (Array.isArray(roles) && roles.length > 0) {
        localStorage.setItem('role', roles[0]); // Stocker le premier rôle
      } else {
        this.logout();
      }
    } catch (error) {
      this.logout(); // Si le token est invalide, on efface les données
    }
  }
  
  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.roles ? decoded.roles[0] : null;
      } catch {
        this.logout();
      }
    }
    return null;
  }
  
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
  
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now(); // Vérifie si le token est expiré
    } catch {
      this.logout();
      return false;
    }
  }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
  

}

