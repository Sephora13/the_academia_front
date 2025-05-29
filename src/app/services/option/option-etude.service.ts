import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config/config';

interface OptionEtude {
  id_option: number;
  nom_option: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface OptionEtudeCreate {
  nom_option: string;
  description?: string;
}

interface ApiResponse {
  success: boolean;
  status: number;
  message: OptionEtude | OptionEtude[] | string;
}

@Injectable({
  providedIn: 'root'
})
export class OptionEtudeService {
  private apiUrl = `${AppConfig.apiUrl}/options`;

  constructor(private httpClient: HttpClient) {}

  /**
   * Créer une nouvelle option d'étude
   * @param payload Données de l'option à créer
   */
  creerOption(payload: OptionEtudeCreate): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(this.apiUrl, payload);
  }

  /**
   * Lire toutes les options d'étude
   */
  lireOptions(): Observable<ApiResponse> {
    return this.httpClient.get<ApiResponse>(this.apiUrl);
  }

  /**
   * Lire une option d'étude spécifique
   * @param id_option ID de l'option à récupérer
   */
  lireOption(id_option: number): Observable<ApiResponse> {
    const url = `${this.apiUrl}/${id_option}`;
    return this.httpClient.get<ApiResponse>(url);
  }

  /**
   * Mettre à jour une option d'étude
   * @param id_option ID de l'option à mettre à jour
   * @param payload Données à mettre à jour
   */
  mettreAJourOption(id_option: number, payload: OptionEtudeCreate): Observable<ApiResponse> {
    const url = `${this.apiUrl}/${id_option}`;
    return this.httpClient.put<ApiResponse>(url, payload);
  }

  /**
   * Supprimer une option d'étude
   * @param id_option ID de l'option à supprimer
   */
  supprimerOption(id_option: number): Observable<ApiResponse> {
    const url = `${this.apiUrl}/${id_option}`;
    return this.httpClient.delete<ApiResponse>(url);
  }
}