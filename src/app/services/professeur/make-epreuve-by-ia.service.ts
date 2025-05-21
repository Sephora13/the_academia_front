import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config/config'; // Assuming AppConfig is used for apiUrl

// Interface pour le corps de la requête de modification
interface ModificationRequestBody {
  epreuve_initiale: string;
  nouveau_prompt: string;
  contenu_pdf: string; // Supposons que le backend attend le contenu en string (ex: base64)
}

// Interface pour le corps de la requête d'enregistrement manuel
interface SaveManuallyRequestBody {
  texte_epreuve: string;
  id_professeur: number | null;
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
        console.warn("Aucun fichier PDF n'a été sélectionné pour la génération.");
    }


    // 6. Effectuer l'appel HTTP POST vers votre API avec le FormData
    // L'endpoint de génération est '/generer_epreuve/'
    return this.http.post<any>(`${this.apiUrl}/generer_epreuve/`, formData);
  }

  /**
   * Appelle l'API de modification d'épreuve.
   * @param modificationData Les données nécessaires à la modification (épreuve brute, nouveau prompt, contenu PDF en base64).
   * @returns Un Observable contenant la réponse de l'API.
   */
  modifyEpreuve(modificationData: ModificationRequestBody): Observable<any> {
     console.log('Appel modifyEpreuve avec données:', modificationData); // Log de débogage
     // L'endpoint de personnalisation est '/personnaliser_epreuve/'
     return this.http.post<any>(`${this.apiUrl}/personnaliser_epreuve/`, modificationData);
  }

  /**
   * Appelle l'API de sauvegarde d'épreuve (endpoint original).
   * @param saveData Un objet contenant la chaîne brute de l'épreuve et l'ID du professeur.
   * @returns Un Observable contenant la réponse de l'API.
   */
  saveEpreuve(saveData: { texte_epreuve: string; id_professeur: number | null }): Observable<any> {
     console.log('Appel saveEpreuve (original) avec données:', saveData); // Log de débogage
     // L'endpoint d'enregistrement original est '/enregistrer_epreuve/'
     return this.http.post<any>(`${this.apiUrl}/enregistrer_epreuve/`, saveData);
  }

  /**
   * Appelle l'API pour récupérer la liste des épreuves d'un professeur.
   * Utilise un paramètre de requête pour filtrer par ID professeur.
   * @param idProfesseur L'ID du professeur dont on veut récupérer les épreuves.
   * @returns Un Observable contenant la liste des épreuves.
   */
  getEpreuvesByProfesseurId(idProfesseur: number): Observable<any> {
    // Construit l'URL en incluant l'ID du professeur comme paramètre de chemin
    // L'URL correcte doit être /epreuves/professeur/{id_professeur}
    const url = `${this.apiUrl}/epreuves/professeur/${idProfesseur}`;

    console.log("Appel API pour getEpreuvesByProfesseurId:", url);
    return this.http.get<any>(url);
  }


  // --- NOUVELLES FONCTIONS POUR L'ANALYSE ET L'ENREGISTREMENT MANUEL ---

  /**
   * Appelle l'API pour analyser un PDF contenant l'épreuve et la grille balisée manuellement.
   * Cet endpoint est '/analyser_epreuve_avec_grille/'.
   * @param pdfFile Le fichier PDF à analyser.
   * @returns Un Observable contenant la réponse de l'API avec l'épreuve balisée.
   */
  analyzeAndTagEpreuve(pdfFile: File): Observable<any> {
    console.log('Appel analyzeAndTagEpreuve avec fichier:', pdfFile.name); // Log de débogage

    const formData = new FormData();
    formData.append('pdf_file', pdfFile, pdfFile.name);

    // L'endpoint d'analyse manuelle est '/analyser_epreuve_avec_grille/'
    return this.http.post<any>(`${this.apiUrl}/analyser_epreuve_avec_grille/`, formData);
  }

  /**
   * Appelle l'API pour enregistrer manuellement une épreuve balisée.
   * Cet endpoint est utilisé après l'analyse d'un PDF balisé manuellement.
   * L'endpoint est '/enregistrer_epreuve/manually'.
   * @param saveData Un objet contenant la chaîne brute de l'épreuve balisée et l'ID du professeur.
   * @returns Un Observable contenant la réponse de l'API.
   */
  saveEpreuveManually(saveData: SaveManuallyRequestBody): Observable<any> {
     console.log('Appel saveEpreuveManually avec données:', saveData); 
     const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });// Log de débogage
     // L'endpoint d'enregistrement manuel est '/enregistrer_epreuve/manually'
     return this.http.post<any>(`${this.apiUrl}/enregistrer_epreuve/manually`, saveData);
  }

}