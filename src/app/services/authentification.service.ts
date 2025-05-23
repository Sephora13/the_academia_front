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

  private apiUrl = 'https://the-academia-nestapi.onrender.com/auth/SignIn';
  private apiUrl1 = 'https://the-academia-nestapi.onrender.com/users/verify-activation-code';
  private apiUrl2 = 'https://the-academia-nestapi.onrender.com/users/register ';
  private apiUrl3 ='https://the-academia-nestapi.onrender.com/auth/signProf';
  private apiUrl4 ='https://the-academia-nestapi.onrender.com/auth/signAdmin';
  private apiUrl5 = 'https://the-academia-nestapi.onrender.com/users/create-prof ';
  private apiUrl6 = 'https://the-academia-nestapi.onrender.com/users/create-exam_service ';
  private apiUrl7 = 'https://the-academia-nestapi.onrender.com/users/create-coordinateur ';
  private apiUrl8 ='https://the-academia-nestapi.onrender.com/auth/signCoord';
  private apiUrl9 ='https://the-academia-nestapi.onrender.com/auth/signExam';


  //creation de compte etudiant
  signUp(
    matricule: string,
    email: string,
    nom: string,
    prenom: string,
    filiere: string,
    classe: string,
    password: string,
    confirmPassword: string): Observable<any>{
      const body = {
        matricule,
        email,
        nom,
        prenom,
        filiere,
        classe,
        password,
        confirmPassword
      };
  
      return this.http.post(this.apiUrl2, body);
    }

    //connexion d'un etudiant
    signIn(email: string, password: string): Observable<any> {
      return this.http.post(this.apiUrl, { email, password }).pipe(
        tap((response: any) => {
          if (response.access_token) {
            localStorage.setItem('token', response.access_token);
            this.saveUserRole(response.access_token);
            // Enregistrement des informations de l'utilisateur
            localStorage.setItem('user_id', response.User.id);
            localStorage.setItem('user_name', response.User.name);
            localStorage.setItem('user_prenom', response.User.prenom);
            localStorage.setItem('user_email', response.User.email);
            localStorage.setItem('user_classe', response.User.classe);
            localStorage.setItem('user_filiere', response.User.filiere);
          } 
        }),
        catchError(error => throwError(() => error))
      );
    }


    // Connexion du professeur
    signInProf(email: string, password: string): Observable<any> {
      return this.http.post(this. apiUrl3, { email, password }).pipe(
        tap((response: any) => {
          if (response.access_token) {
            localStorage.setItem('token', response.access_token);
            this.saveUserRole(response.access_token);

            // Enregistrement des informations de l'utilisateur
            localStorage.setItem('user_id', response.User.id);
            localStorage.setItem('user_nom', response.User.nom);
            localStorage.setItem('user_prenom', response.User.prenom);
            localStorage.setItem('user_email', response.User.email);
            localStorage.setItem('user_filiere', response.User.filiere);
            localStorage.setItem('user_matiere', response.User.matiere);
        
          }
        }),
        catchError(error => throwError(() => error))
      );
    }

    
    // Méthode de connexion pour l'admin
    signInAdmin(login: string, password: string): Observable<any> {
      return this.http.post(this.apiUrl4, { login, password }).pipe(
        tap((response: any) => {
          if (response.access_token) {
            localStorage.setItem('token', response.access_token);
            this.saveUserRole(response.access_token);
            this.saveAdminInfo(response.User);
          } else {
            this.logout();
          }
        })
      );
    }

     // Méthode de connexion pour le coordinateur
     signCoord(login: string, password: string): Observable<any> {
      return this.http.post(this.apiUrl8, { login, password }).pipe(
        tap((response: any) => {
          if (response.access_token) {
            localStorage.setItem('token', response.access_token);
            this.saveUserRole(response.access_token);
            this.saveAdminInfo(response.User);
          } else {
            this.logout();
          }
        })
      );
    }

     // Méthode de connexion pour le coordinateur
     sign_examService(login: string, password: string): Observable<any> {
      return this.http.post(this.apiUrl9, { login, password }).pipe(
        tap((response: any) => {
          if (response.access_token) {
            localStorage.setItem('token', response.access_token);
            this.saveUserRole(response.access_token);
            this.saveAdminInfo(response.User);
          } else {
            this.logout();
          }
        })
      );
    }


    createCoordinateur(
      login:string, password:string
    ): Observable<any> {
      return this.http.post(this.apiUrl7, {login, password});
    }

    createExamService(
      login:string, password:string
    ): Observable<any> {
      return this.http.post(this.apiUrl6, {login,password});
    }

    //methode de création d'un professeur par l'admin 
    createProf(name: string,
      prenom: string,
      email: string,
      password: string,
      filiere: string,
      matiere: string): Observable<any> {
        const body = {
          name,
          prenom,
          email,
          password,
          filiere,
          matiere
        };
        
        return this.http.post(this.apiUrl5, body);
      }


    // Méthode pour sauvegarder les informations de l'admin
    private saveAdminInfo(user: any) {
      localStorage.setItem('admin_id', user.id.toString());
    }

    // Méthode pour obtenir les informations de l'admin
    getAdminInfo() {
      return {
        nom: localStorage.getItem('admin_nom'),
        prenom: localStorage.getItem('admin_prenom'),
        id: localStorage.getItem('admin_id')
      };
    }


    // Méthode pour récupérer les informations deS professeurs
    getUserInfo(): { id: number, nom: string, prenom: string, email: string, filiere:string, matiere: string } | null {
      const id = localStorage.getItem('user_id');
      const nom = localStorage.getItem('user_nom');
      const prenom = localStorage.getItem('user_prenom');
      const email = localStorage.getItem('user_email');
      const filiere = localStorage.getItem('user_filiere');
      const matiere = localStorage.getItem('user_matiere')
      
      if (id && nom && prenom && email && filiere && matiere) {
        return {
          id: parseInt(id),
          nom,
          prenom,
          email,
          filiere, 
          matiere
        };
      }
      return null;
    }


    //recuperer les informations des ettudiants
    getUserInfo2(): { id: number, nom: string, prenom: string, email: string, filiere : string, classe: string } | null {
      const id = localStorage.getItem('user_id');
      const nom = localStorage.getItem('user_name');
      const prenom = localStorage.getItem('user_prenom');
      const email = localStorage.getItem('user_email');
      const filiere = localStorage.getItem('user_filiere');
      const classe = localStorage.getItem('user_classe')
      
      if (id && nom && prenom && email && filiere && classe ) {
        return {
          id: parseInt(id),
          nom,
          prenom,
          email,
          filiere,
          classe
        };
      }
      return null;
    }


    // Méthode pour vérifier le code d'activation
    verifyActivationCode(email: string, code: string): Observable<any> {
      const body = { email, code };
      return this.http.post(this.apiUrl1, body);
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
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_nom');
      localStorage.removeItem('user_prenom');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_filiere');
      localStorage.removeItem('user_matiere')
    }
  
}

