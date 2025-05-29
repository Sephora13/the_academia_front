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

export class GetPasswordService {

  constructor(private http : HttpClient) {}
   private apiUrl = 'https://the-academia-nestapi.onrender.com/users/printProf';
   private apiUrl1 = 'https://the-academia-nestapi.onrender.com/users/count';
   private apiUrl2 = 'https://the-academia-nestapi.onrender.com/users/countProf';
   //private apiUrl3 = 'https://the-academia-nestapi.onrender.com/users/countExam_service';
   private apiUrl4 = 'https://the-academia-nestapi.onrender.com/users/printStudent';


   //recupérer les professeurs inscrit
   recuProf(): Observable <any>{
    return this.http.get<any>(this.apiUrl)
   }

   //recupérer les informations des etudiants
   recuStudent():Observable<any>{
    return this.http.get<any>(this.apiUrl4)
   }

   //count etudiants
   countUser(): Observable <any>{
    return this.http.get<any>(this.apiUrl1)
   }

   //count professeur
   countProf():Observable <any>{
    return this.http.get<any>(this.apiUrl2)
   }

   
   /*

   //count service des examens
   countExam_service(): Observable<any>{
    return this.http.get<any>(this.apiUrl3)
   }
   */
}
