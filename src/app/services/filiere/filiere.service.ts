import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config/config';

@Injectable({
  providedIn: 'root'
})
export class FiliereService {

  private apiUrl = `${AppConfig.apiUrl}/filieres`;

  constructor(private httpClient: HttpClient) {}

  // Créer une nouvelle filière
  creerFiliere(payload: any): Observable<any> {
    return this.httpClient.post<any>(this.apiUrl, payload);
  }

  // Lire toutes les filières
  lireFilieres(): Observable<any> {
    return this.httpClient.get<any>(this.apiUrl);
  }

  // Lire une filière par son ID
  lireFiliere(id_filiere: number): Observable<any> {
    const url = `${this.apiUrl}/${id_filiere}`;
    return this.httpClient.get<any>(url);
  }
  

  // Mettre à jour une filière
  mettreAJourFiliere(id_filiere: number, payload: any): Observable<any> {
    const url = `${this.apiUrl}/${id_filiere}`;
    return this.httpClient.put<any>(url, payload);
  }

  // Supprimer une filière
  supprimerFiliere(id_filiere: number): Observable<any> {
    const url = `${this.apiUrl}/${id_filiere}`;
    return this.httpClient.delete<any>(url);
  }
}
