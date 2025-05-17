import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config/config'; // Assuming AppConfig is used for apiUrl

// Interface pour le corps de la requête de modification
interface ModificationRequestBody {
  epreuve_initiale: string;
  nouveau_prompt: string;
  contenu_pdf: string; // Supposons que le backend attend le contenu en string (ex: base64)
}


@Injectable({
  providedIn: 'root'
})
export class MakeEpreuveByIaService {

  private apiUrl = AppConfig.apiUrl; // Utilise AppConfig pour l'URL de l'API

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
    // Remplacez '/generer_epreuve/' par l'endpoint exact de votre API pour la génération
    // HttpClient gère automatiquement le type de contenu 'multipart/form-data' avec FormData
    return this.http.post<any>(`${this.apiUrl}/generer_epreuve/`, formData);
  }

  /**
   * Appelle l'API de modification d'épreuve.
   * @param modificationData Les données nécessaires à la modification (épreuve brute, nouveau prompt, contenu PDF en base64).
   * @returns Un Observable contenant la réponse de l'API.
   */
  modifyEpreuve(modificationData: ModificationRequestBody): Observable<any> {
     console.log('Appel modifyEpreuve avec données:', modificationData); // Log de débogage
     // L'endpoint de personnalisation attend un objet JSON avec epreuve_initiale, nouveau_prompt, contenu_pdf
     // Remplacez '/personnaliser_epreuve/' par l'endpoint exact de votre API pour la modification
     return this.http.post<any>(`${this.apiUrl}/personnaliser_epreuve/`, modificationData);
  }

  /**
   * Appelle l'API de sauvegarde d'épreuve.
   * @param saveData Un objet contenant la chaîne brute de l'épreuve et l'ID du professeur.
   * @returns Un Observable contenant la réponse de l'API.
   */
  saveEpreuve(saveData: { texte_epreuve: string; id_professeur: number | null }): Observable<any> {
     console.log('Appel saveEpreuve avec données:', saveData); // Log de débogage
     // L'endpoint d'enregistrement attend un objet JSON avec texte_epreuve et id_professeur
     // Remplacez '/enregistrer_epreuve/' par l'endpoint exact de votre API pour la sauvegarde
     return this.http.post<any>(`${this.apiUrl}/enregistrer_epreuve/`, saveData);
  }

  // Vous pouvez ajouter d'autres méthodes ici pour d'autres appels API liés aux épreuves
}
