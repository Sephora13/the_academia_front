import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config/config';

export interface SessionExamen {
  id_session_examen: number;
  nom_session: string;
  date_debut_session: string;
  date_fin_session: string;
  statut_session: string;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
}

export interface SessionExamenCreate {
  nom_session: string;  
  date_debut_session: string; 
  date_fin_session: string; 
  statut_session: string; 
}

export interface SessionExamenUpdate {
  nom_session?: string;
  date_debut_session?: string;
  date_fin_session?: string;
  statut_session?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: T;
}

@Injectable({
  providedIn: 'root'
})
export class SessionExamensService {
  private apiUrl = `${AppConfig.apiUrl}/api/exam-service/sessions`;

  constructor(private httpClient: HttpClient) {}

  listerSessions(): Observable<ApiResponse<SessionExamen[]>> {
    return this.httpClient.get<ApiResponse<SessionExamen[]>>(this.apiUrl);
  }

  creerSession(payload: SessionExamenCreate): Observable<ApiResponse<SessionExamen>> {
    return this.httpClient.post<ApiResponse<SessionExamen>>(this.apiUrl, payload);
  }

  getSession(id_session_examen: number): Observable<ApiResponse<SessionExamen>> {
    const url = `${this.apiUrl}/${id_session_examen}`;
    return this.httpClient.get<ApiResponse<SessionExamen>>(url);
  }

  mettreAJourSession(
    id_session_examen: number, 
    payload: SessionExamenUpdate
  ): Observable<ApiResponse<SessionExamen>> {
    const url = `${this.apiUrl}/${id_session_examen}`;
    return this.httpClient.put<ApiResponse<SessionExamen>>(url, payload);
  }

  supprimerSession(id_session_examen: number): Observable<ApiResponse<string>> {
    const url = `${this.apiUrl}/${id_session_examen}`;
    return this.httpClient.delete<ApiResponse<string>>(url);
  }
}