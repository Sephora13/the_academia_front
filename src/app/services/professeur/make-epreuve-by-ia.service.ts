import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Importez Observable

@Injectable({
  providedIn: 'root' // Cela rend le service disponible dans toute l'application
})
export class MakeEpreuveByIaService {

  // Définissez l'URL de base de votre API Render ici
  // REMPLACEZ 'https://votre-api-render.onrender.com' par l'URL réelle de votre API
  private apiUrl = 'https://votre-api-render.onrender.com';

  constructor(private http: HttpClient) { }

  // Méthode pour appeler l'API de génération d'épreuve
  // Elle prendra les données du formulaire (y compris le fichier) et retournera un Observable
  // Remplacez 'any' par une interface plus spécifique pour le type de retour de votre API si vous en avez une
  generateEpreuve(formData: FormData): Observable<any> {
    // Remplacez '/api/generate' par l'endpoint exact de votre API pour la génération
    return this.http.post<any>(`${this.apiUrl}/api/generate`, formData);
  }

  // Méthode pour appeler l'API de modification d'épreuve
  // Elle prendra les données de modification (suggestion, épreuve/grille actuelles)
  // Remplacez 'any' par une interface plus spécifique pour le type de retour
  modifyEpreuve(modificationData: any): Observable<any> {
     // Remplacez '/api/modify' par l'endpoint exact de votre API pour la modification
     return this.http.post<any>(`${this.apiUrl}/api/modify`, modificationData);
     // Utilisez .put() si votre API utilise le verbe PUT pour les modifications
     // return this.http.put<any>(`${this.apiUrl}/api/modify`, modificationData);
  }

  // Méthode pour appeler l'API de sauvegarde d'épreuve
  // Elle prendra l'épreuve et la grille à sauvegarder
  // Remplacez 'any' par une interface plus spécifique pour le type de retour
  saveEpreuve(saveData: any): Observable<any> {
     // Remplacez '/api/save' par l'endpoint exact de votre API pour la sauvegarde
     return this.http.post<any>(`${this.apiUrl}/api/save`, saveData);
     // Utilisez .put() si votre API utilise le verbe PUT pour les sauvegardes
     // return this.http.put<any>(`${this.apiUrl}/api/save`, saveData);
  }

  // Vous pouvez ajouter d'autres méthodes ici pour d'autres appels API liés aux épreuves
}
