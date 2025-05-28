import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config/config';
import { formatDate } from '@angular/common';

// Interfaces correspondant au modèle API
export interface AffectationEpreuve {
  id_affectation_epreuve: number;
  id_session_examen: number;
  id_matiere: number;
  id_option_etude: number;
  id_professeur: number;
  date_limite_soumission_prof: string;
  date_examen_etudiant: string;
  heure_debut_examen: string;
  duree_examen_prevue: number;
  statut_affectation: string;
  commentaires_service_examens?: string;
  assigned_by?: number;
  created_at: string;
  updated_at: string;
  id_epreuve?: number;
}

export interface AffectationEpreuveCreate {
  id_session_examen: number;
  id_matiere: number;
  id_option_etude: number;
  id_professeur: number;
  date_limite_soumission_prof: Date;
  date_examen_etudiant: Date;
  heure_debut_examen: string;
  duree_examen_prevue: number;
  statut_affectation?: string;
  commentaires_service_examens?: string;
  assigned_by?: number;
}

export interface AffectationEpreuveUpdate {
  id_session_examen?: number;
  id_matiere?: number;
  id_option_etude?: number;
  id_professeur?: number;
  date_limite_soumission_prof?: Date;
  date_examen_etudiant?: Date;
  heure_debut_examen?: string;
  duree_examen_prevue?: number;
  statut_affectation?: string;
  commentaires_service_examens?: string;
  assigned_by?: number;
  id_epreuve?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: T;
}

@Injectable({
  providedIn: 'root'
})
export class AffectationEpreuveService {
  private apiUrl = `${AppConfig.apiUrl}/api/exam-service/affectations`;

  constructor(private http: HttpClient) { }

  listerAffectations(): Observable<ApiResponse<AffectationEpreuve[]>> {
    return this.http.get<ApiResponse<AffectationEpreuve[]>>(this.apiUrl);
  }

  listerParSession(sessionId: number): Observable<ApiResponse<AffectationEpreuve[]>> {
    return this.http.get<ApiResponse<AffectationEpreuve[]>>(`${this.apiUrl}/by-session/${sessionId}`);
  }

  getAffectation(id: number): Observable<ApiResponse<AffectationEpreuve>> {
    return this.http.get<ApiResponse<AffectationEpreuve>>(`${this.apiUrl}/${id}`);
  }

  creerAffectation(payload: AffectationEpreuveCreate): Observable<ApiResponse<AffectationEpreuve>> {
    const formattedPayload = this.formatDates(payload);
    return this.http.post<ApiResponse<AffectationEpreuve>>(this.apiUrl, formattedPayload);
  }

  mettreAJourAffectation(id: number, payload: AffectationEpreuveUpdate): Observable<ApiResponse<AffectationEpreuve>> {
    const formattedPayload = this.formatDates(payload);
    return this.http.put<ApiResponse<AffectationEpreuve>>(`${this.apiUrl}/${id}`, formattedPayload);
  }

  supprimerAffectation(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }

  ajouterEpreuve(idAffectation: number, epreuveId: number): Observable<ApiResponse<AffectationEpreuve>> {
    return this.http.put<ApiResponse<AffectationEpreuve>>(
      `${this.apiUrl}/${idAffectation}/add-epreuve`,
      { epreuve_id: epreuveId }
    );
  }

  listerParProfesseur(professeurId: number): Observable<ApiResponse<AffectationEpreuve[]>> {
    return this.http.get<ApiResponse<AffectationEpreuve[]>>(`${this.apiUrl}/by-professeur/${professeurId}`);
  }
  
  private formatDates(payload: any): any {
    return {
      ...payload,
      date_limite_soumission_prof: formatDate(payload.date_limite_soumission_prof, 'yyyy-MM-dd', 'en'),
      date_examen_etudiant: formatDate(payload.date_examen_etudiant, 'yyyy-MM-dd', 'en')
    };
  }

  // Pour le suivi des dépôts
  marquerCommeRemis(idAffectation: number, epreuveId: number): Observable<ApiResponse<AffectationEpreuve>> {
    return this.ajouterEpreuve(idAffectation, epreuveId);
  }
}