import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Définir une interface pour les messages du chat
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  isLong?: boolean;
}

@Component({
  selector: 'app-make-epreuve-by-ia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './make-epreuve-by-ia.component.html',
  styleUrl: './make-epreuve-by-ia.component.css'
})
export class MakeEpreuveByIaComponent implements AfterViewInit {
  @ViewChild('chatBody') private chatBodyRef?: ElementRef;

  isLoading = false;
  showResult = false;

  // Propriétés pour gérer l'état des boutons (conservées des modifications précédentes)
  chatButtonsEnabled = false;
  generateButtonDisabled = false;

  // Propriétés liées aux champs du formulaire
  matiere = '';
  niveau = '';
  duree = ''; // Conserver en string si l'API l'attend ainsi ("2h00")
  nombreExercices = 0;
  objectifsInput: string = ''; // Nouveau champ pour les objectifs (texte multiligne)
  initialPrompt: string = ''; // Nouveau champ pour le prompt initial
  fichier: File | null = null;

  // Propriété liée à l'input du chat (pour les modifications)
  nouvelleSuggestion = '';

  // Propriétés pour les résultats générés
  epreuveGeneree = '';
  grilleCorrection = '';

  // Tableau pour stocker les messages du chat
  messages: ChatMessage[] = [
      { sender: 'bot', text: 'Bonjour ! Je suis votre assistant IA, prêt à vous aider à créer une épreuve sur mesure. Remplissez simplement le formulaire à gauche pour commencer.' }
  ];

  // Définissez l'URL de base de votre API Render
  private apiUrl = 'https://votre-api-render.onrender.com'; // <-- REMPLACEZ CECI PAR VOTRE VRAIE URL

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngAfterViewInit(): void {
     this.scrollToBottom();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.fichier = file;
  }

  genererEpreuve() {
    // Ajoutez ici des validations si nécessaire (champs obligatoires, format, etc.)
    // if (!this.matiere || !this.niveau || this.nombreExercices <= 0 || !this.duree || !this.objectifsInput || !this.initialPrompt) {
    //   this.addMessage('bot', 'Veuillez remplir tous les champs obligatoires du formulaire.');
    //   return;
    // }


    // Désactiver les boutons et activer le loader au début
    this.generateButtonDisabled = true;
    this.chatButtonsEnabled = false; // Désactive les boutons du chat
    this.isLoading = true;
    this.showResult = false;
    this.epreuveGeneree = '';
    this.grilleCorrection = '';

    // Ajoutez un message dans le chat pour indiquer que la soumission est en cours
    this.addMessage('user', 'Soumission du formulaire pour générer l\'épreuve...');

    // Préparez les objectifs : diviser le texte par les sauts de ligne et filtrer les lignes vides
    const objectifsArray = this.objectifsInput.split('\n').map(obj => obj.trim()).filter(obj => obj.length > 0);


    // Créez un objet FormData pour envoyer les données du formulaire et le fichier
    const formData = new FormData();
    formData.append('matiere', this.matiere);
    formData.append('niveau', this.niveau);
    formData.append('duree', this.duree); // Envoyer la durée comme string "2h00"
    formData.append('Nombre_d_exercice', this.nombreExercices.toString()); // S'assurer que le nom du champ correspond à l'API
    formData.append('prompt', this.initialPrompt); // Ajouter le prompt initial

    // Ajoutez chaque objectif individuellement au FormData
    objectifsArray.forEach((objectif, index) => {
        formData.append(`objectifs[${index}]`, objectif); // Assurez-vous que votre backend peut parser ce format (objectifs[0], objectifs[1], ...)
        // Alternativement, si votre backend attend un JSON stringifié pour les objectifs:
        // formData.append('objectifs', JSON.stringify(objectifsArray)); // À vérifier avec votre API
    });


    if (this.fichier) {
      formData.append('cours', this.fichier, this.fichier.name); // 'cours' doit correspondre au nom de champ attendu par votre backend
    } else {
       // Gérer le cas où aucun fichier n'est sélectionné si votre API le permet
       // Si le fichier est obligatoire, ajoutez une validation au début de la méthode
    }


    // Effectuez l'appel HTTP POST vers votre API
    // Remplacez '/api/generate' par l'endpoint exact de votre API pour la génération
    this.http.post<any>(`${this.apiUrl}/api/generate`, formData).subscribe({
      next: (response) => {
        // Cette partie s'exécute si la requête HTTP réussit (code 2xx)
        console.log('Réponse API génération :', response);

        if (response.success) {
          // Si l'API indique un succès
          // Assurez-vous que response.data ou response.message contient l'épreuve et la grille
          // Adaptez les noms de propriétés (epreuve, grille) à la structure réelle de votre API
          this.epreuveGeneree = response.data?.epreuve || 'Épreuve non disponible';
          this.grilleCorrection = response.data?.grille || 'Grille de correction non disponible';
          this.showResult = true; // Affiche la zone de résultats

          // Ajoutez un message de succès de l'IA dans le chat
          this.addMessage('bot', response.message || 'Votre épreuve a été générée avec succès !');

          // Activez les boutons du chat une fois l'épreuve générée
          this.chatButtonsEnabled = true;
          // Le bouton Générer reste désactivé

        } else {
          // Si l'API indique un échec logique (par exemple, validation côté serveur)
          console.error('Erreur logique API génération :', response.message);
          this.addMessage('bot', response.message || 'Une erreur est survenue lors de la génération de l\'épreuve.');

          // En cas d'échec, vous pourriez vouloir réactiver le bouton Générer ou non, selon la logique désirée
           this.generateButtonDisabled = false; // Exemple : réactiver pour permettre de corriger le formulaire

        }
      },
      error: (error) => {
        // Cette partie s'exécute si la requête HTTP échoue (erreur réseau, erreur serveur 4xx/5xx)
        console.error('Erreur HTTP lors de la génération :', error);
        let errorMessage = 'Désolé, une erreur technique est survenue lors de la génération de l\'épreuve.';
        if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur API. Vérifiez l\'URL ou l\'état du service.';
        } else if (error.status >= 400 && error.status < 500) {
             errorMessage = `Erreur client (${error.status}): ${error.error?.message || error.statusText}`;
        } else if (error.status >= 500) {
             errorMessage = `Erreur serveur (${error.status}): ${error.error?.message || error.statusText}`;
        }
        this.addMessage('bot', errorMessage);

        // En cas d'erreur, réactiver le bouton Générer
        this.generateButtonDisabled = false;
        // Les boutons du chat restent désactivés si la génération échoue
      },
      complete: () => {
        // Cette partie s'exécute à la fin de la requête, qu'elle soit réussie ou en erreur
        this.isLoading = false; // Désactive le loader
        this.scrollToBottom(); // Faites défiler le chat
      }
    });
  }

  // Conserver les méthodes modifierEpreuve et enregistrerEpreuve pour plus tard
  // Elles utiliseront l'input du chat (nouvelleSuggestion) pour le prompt de modification
  // et enverront l'épreuve/grille actuelles.

  modifierEpreuve() {
     // ... implémentation utilisant this.nouvelleSuggestion et appelant l'API de modification ...
     console.log("Modifier épreuve appelée avec suggestion:", this.nouvelleSuggestion);
      // Placeholder pour l'appel API de modification
      this.addMessage('bot', 'Fonction de modification non encore connectée à l\'API.');
      this.nouvelleSuggestion = ''; // Vide l'input du chat
      this.scrollToBottom();
  }

  enregistrerEpreuve() {
     // ... implémentation appelant l'API de sauvegarde ...
     console.log("Enregistrer épreuve appelée.");
      // Placeholder pour l'appel API de sauvegarde
      this.addMessage('bot', 'Fonction d\'enregistrement non encore connectée à l\'API.');
      this.scrollToBottom();
  }


  // Méthode pour ajouter un message au tableau et faire défiler
  addMessage(sender: 'user' | 'bot', text: string, isLong: boolean = false): void {
      this.messages.push({ sender, text, isLong });
      this.scrollToBottom(); // Fait défiler à chaque nouveau message
  }


  // Méthode pour faire défiler la boîte de chat vers le bas
  private scrollToBottom(): void {
    // Utilise un petit délai pour s'assurer que le DOM a été mis à jour
    setTimeout(() => {
      if (this.chatBodyRef && this.chatBodyRef.nativeElement) {
        this.chatBodyRef.nativeElement.scrollTop = this.chatBodyRef.nativeElement.scrollHeight;
      }
    }, 50); // Un délai légèrement plus long peut aider à la fiabilité
  }
}
