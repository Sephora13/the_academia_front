import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config/config';

@Injectable({
  providedIn: 'root'
})
export class MakeEpreuveByIaService {

  private apiUrl = AppConfig.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Appelle l'API de génération d'épreuve.
   * Construit un objet FormData contenant les contraintes JSON et le fichier PDF.
   * @param formValues Un objet contenant les valeurs du formulaire (matiere, niveau, etc.)
   * et le fichier PDF.
   * @returns Un Observable contenant la réponse de l'API.
   */
  generateEpreuve(formValues: {
      matiere: string;
      niveau: string;
      duree: string;
      nombreExercices: number;
      objectifsInput: string;
      initialPrompt: string;
      fichier: File | null;
  }): Observable<any> {

    const objectifsArray = formValues.objectifsInput.split('\n')
        .map(obj => obj.trim())
        .filter(obj => obj.length > 0);

    // 1. Créer l'objet constraints qui correspond à la structure attendue par le backend
    const constraints = {
        matiere: formValues.matiere,
        niveau: formValues.niveau,
        duree: formValues.duree,
        Nombre_d_exercice: formValues.nombreExercices.toString(),
        objectifs: objectifsArray,
        prompt: formValues.initialPrompt
    };

    // 2. Convertir l'objet constraints en chaîne JSON
    const constraintsJsonString = JSON.stringify(constraints);

    // 3. Créer un objet FormData
    const formData = new FormData();

    // 4. Ajouter la chaîne JSON constraints au FormData
    // La clé 'constraints' doit correspondre à ce que votre backend attend
    formData.append('constraints', constraintsJsonString);

    // 5. Ajouter le fichier PDF au FormData
    // La clé 'pdf_file' doit correspondre à ce que votre backend attend
    if (formValues.fichier) {
        formData.append('pdf_file', formValues.fichier, formValues.fichier.name);
    } else {
        // Gérer le cas où le fichier est manquant si nécessaire (peut-être une validation côté frontend)
        console.warn("Aucun fichier PDF n'a été sélectionné.");
    }


    // 6. Effectuer l'appel HTTP POST vers votre API avec le FormData
    // Remplacez '/api/generate' par l'endpoint exact de votre API pour la génération
    // HttpClient gère automatiquement le type de contenu 'multipart/form-data' avec FormData
    return this.http.post<any>(`${this.apiUrl}/generer_epreuve/`, formData);
  }

  /**
   * Appelle l'API de modification d'épreuve.
   * @param modificationData Les données nécessaires à la modification (suggestion, épreuve/grille actuelles).
   * @returns Un Observable contenant la réponse de l'API.
   */
  modifyEpreuve(modificationData: any): Observable<any> {
     // Remplacez '/api/modify' par l'endpoint exact de votre API pour la modification
     // Utilisez .put() si votre API utilise le verbe PUT pour les modifications
     return this.http.post<any>(`${this.apiUrl}/api/modify`, modificationData);
     // return this.http.put<any>(`${this.apiUrl}/api/modify`, modificationData);
  }

  /**
   * Appelle l'API de sauvegarde d'épreuve.
   * @param saveData L'épreuve et la grille de correction à sauvegarder.
   * @returns Un Observable contenant la réponse de l'API.
   */
  saveEpreuve(saveData: any): Observable<any> {
     // Remplacez '/api/save' par l'endpoint exact de votre API pour la sauvegarde
     // Utilisez .put() si votre API utilise le verbe PUT pour les sauvegardes
     return this.http.post<any>(`${this.apiUrl}/api/save`, saveData);
     // return this.http.put<any>(`${this.apiUrl}/api/save`, saveData);
  }

  // Vous pouvez ajouter d'autres méthodes ici pour d'autres appels API liés aux épreuves
}
