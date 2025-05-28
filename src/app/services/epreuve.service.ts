import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config/config';

export interface Epreuve {
  id: number;
  titre: string;
  description?: string;
  niveau: string;
  id_matiere: number;
  id_professeur: number;
  created_at: string;
  updated_at: string;
}

export interface EpreuveCreate {
  titre: string;
  description?: string;
  niveau: string;
  id_matiere: number;
  id_professeur: number;
}

export interface EpreuveUpdate {
  titre?: string;
  description?: string;
  niveau?: string;
  id_matiere?: number;
  id_professeur?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: T;
}

@Injectable({
  providedIn: 'root'
})
export class EpreuveService {
  private apiUrl = `${AppConfig.apiUrl}/epreuves`;

  constructor(private httpClient: HttpClient) {}

  creerEpreuve(payload: EpreuveCreate): Observable<ApiResponse<Epreuve>> {
    return this.httpClient.post<ApiResponse<Epreuve>>(this.apiUrl, payload);
  }

  lireEpreuves(): Observable<ApiResponse<Epreuve[]>> {
    return this.httpClient.get<ApiResponse<Epreuve[]>>(this.apiUrl);
  }

  lireEpreuve(id: number): Observable<ApiResponse<Epreuve>> {
    const url = `${this.apiUrl}/${id}`;
    return this.httpClient.get<ApiResponse<Epreuve>>(url);
  }

  mettreAJourEpreuve(id: number, payload: EpreuveUpdate): Observable<ApiResponse<Epreuve>> {
    const url = `${this.apiUrl}/${id}`;
    return this.httpClient.put<ApiResponse<Epreuve>>(url, payload);
  }

  supprimerEpreuve(id: number): Observable<ApiResponse<string>> {
    const url = `${this.apiUrl}/${id}`;
    return this.httpClient.delete<ApiResponse<string>>(url);
  }

  lireEpreuvesParProfesseur(idProf: number): Observable<ApiResponse<Epreuve[]>> {
    const url = `${this.apiUrl}/professeur/${idProf}`;
    return this.httpClient.get<ApiResponse<Epreuve[]>>(url);
  }
}
