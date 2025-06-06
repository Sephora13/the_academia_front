import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config/config';

export interface CopieNumerique {
  id_copie_numerique: number;
  id_etudiant: number;
  id_epreuve: number;
  date_soumission: string;
  note_finale?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CopieNumeriqueCreate {
  id_etudiant: number;
  id_epreuve: number;
}

export interface CopieNumeriqueUpdate {
  id_etudiant?: number;
  id_epreuve?: number;
}

export interface SoumissionCopieNumerique {
  id_etudiant: number;
  id_epreuve: number;
  reponses_qcm?: any[];
  reponses_code?: any[];
  reponses_courtes?: any[];
}

interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: T;
}

@Injectable({
  providedIn: 'root'
})
export class CopieNumeriqueService {
  private apiUrl = `${AppConfig.apiUrl}/copies`;

  constructor(private httpClient: HttpClient) { }

  creerCopie(payload: CopieNumeriqueCreate): Observable<ApiResponse<{ id_copie_numerique: number }>> {
    return this.httpClient.post<ApiResponse<{ id_copie_numerique: number }>>(this.apiUrl, payload);
  }

  soumettreCopie(payload: SoumissionCopieNumerique): Observable<ApiResponse<CopieNumerique>> {
    const url = `${this.apiUrl}/soumettre_copie`;
    return this.httpClient.post<ApiResponse<CopieNumerique>>(url, payload);
  }

  lireCopie(id_copie: number): Observable<ApiResponse<CopieNumerique>> {
    const url = `${this.apiUrl}/${id_copie}`;
    return this.httpClient.get<ApiResponse<CopieNumerique>>(url);
  }

  lireToutesLesCopies(): Observable<ApiResponse<CopieNumerique[]>> {
    return this.httpClient.get<ApiResponse<CopieNumerique[]>>(this.apiUrl);
  }

  mettreAJourCopie(id_copie: number, payload: CopieNumeriqueUpdate): Observable<ApiResponse<CopieNumerique>> {
    const url = `${this.apiUrl}/${id_copie}`;
    return this.httpClient.put<ApiResponse<CopieNumerique>>(url, payload);
  }

  supprimerCopie(id_copie: number): Observable<ApiResponse<string>> {
    const url = `${this.apiUrl}/${id_copie}`;
    return this.httpClient.delete<ApiResponse<string>>(url);
  }
}