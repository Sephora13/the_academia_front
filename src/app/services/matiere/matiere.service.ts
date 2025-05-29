import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config/config';

export interface Matiere {
  id_matiere: number;
  nom_matiere: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MatiereCreate {
  nom_matiere: string;
  description?: string;
}

export interface MatiereUpdate {
  nom_matiere?: string;
  description?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: T;
}

@Injectable({
  providedIn: 'root'
})
export class MatiereService {
  private apiUrl = `${AppConfig.apiUrl}/matieres`;

  constructor(private httpClient: HttpClient) {}

  creerMatiere(payload: MatiereCreate): Observable<ApiResponse<Matiere>> {
    return this.httpClient.post<ApiResponse<Matiere>>(this.apiUrl, payload);
  }

  lireMatieres(): Observable<ApiResponse<Matiere[]>> {
    return this.httpClient.get<ApiResponse<Matiere[]>>(this.apiUrl);
  }

  lireMatiere(id_matiere: number): Observable<ApiResponse<Matiere>> {
    const url = `${this.apiUrl}/${id_matiere}`;
    return this.httpClient.get<ApiResponse<Matiere>>(url);
  }

  mettreAJourMatiere(id_matiere: number, payload: MatiereUpdate): Observable<ApiResponse<Matiere>> {
    const url = `${this.apiUrl}/${id_matiere}`;
    return this.httpClient.put<ApiResponse<Matiere>>(url, payload);
  }

  supprimerMatiere(id_matiere: number): Observable<ApiResponse<string>> {
    const url = `${this.apiUrl}/${id_matiere}`;
    return this.httpClient.delete<ApiResponse<string>>(url);
  }
}