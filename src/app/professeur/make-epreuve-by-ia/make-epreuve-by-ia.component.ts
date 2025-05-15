import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core'; // Importe AfterViewInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Définir une interface pour les messages du chat pour une meilleure structuration
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  isLong?: boolean; // Optionnel, si tu as besoin de styles spécifiques pour les longs messages
}

@Component({
  selector: 'app-make-epreuve-by-ia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './make-epreuve-by-ia.component.html',
  styleUrl: './make-epreuve-by-ia.component.css'
})
export class MakeEpreuveByIaComponent implements AfterViewInit { // Implémente AfterViewInit
  @ViewChild('chatBody') private chatBodyRef?: ElementRef; // Référence à l'élément chat-body

  isLoading = false; // Pour afficher le loader
  showResult = false; // Pour afficher/cacher les résultats générés

  matiere = '';
  niveau = '';
  duree = '';
  nombreExercices = 0;
  // objectifs: string[] = [];
  prompt = '';
  fichier: File | null = null;
  nouvelleSuggestion = '';

  epreuveGeneree = '';
  grilleCorrection = '';

  // Tableau pour stocker les messages du chat
  messages: ChatMessage[] = [
      { sender: 'bot', text: 'Bonjour. Veuillez remplir le formulaire' } // Message initial du bot
  ];

  constructor(private router: Router) {}

  // Utilise ngAfterViewInit pour accéder à la référence DOM après que la vue a été initialisée
  ngAfterViewInit(): void {
     this.scrollToBottom(); // Fait défiler vers le bas une fois au début
  }


  onFileChange(event: any) {
    const file = event.target.files[0];
    this.fichier = file;
    // Optionnel: Afficher le nom du fichier sélectionné dans l'interface utilisateur
    // console.log("Fichier sélectionné : ", this.fichier?.name);
  }

  genererEpreuve() {
    // Tu peux réactiver les validations plus tard si besoin
    // if (!this.matiere || !this.niveau || this.nombreExercices <= 0 || !this.duree || !this.fichier) {
    //     alert("Veuillez remplir tous les champs du formulaire et uploader le document de cours.");
    //     return;
    // }

    this.isLoading = true; // Active le loader
    this.showResult = false; // Cache les résultats précédents
    this.epreuveGeneree = ''; // Réinitialise les résultats
    this.grilleCorrection = '';

    // Ajoute le message de l'utilisateur au chat (Formulaire soumis)
    this.addMessage('user', 'Formulaire soumis');


    // Simule l'appel IA (remplace par ton appel API plus tard)
    console.log("Génération de l'épreuve pour :", {
        matiere: this.matiere,
        niveau: this.niveau,
        nombreExercices: this.nombreExercices,
        duree: this.duree,
        fichier: this.fichier?.name // Affiche le nom du fichier
    });

    // Simule la réponse de l'IA après un délai
    setTimeout(() => {
      this.isLoading = false; // Désactive le loader
      this.showResult = true; // Affiche les résultats générés

      // Remplace ces textes statiques par la réponse réelle de ton backend/IA
      this.epreuveGeneree = `Épreuve de ${this.matiere} - Niveau ${this.niveau}\n\nDurée : ${this.duree} minutes\nNombre d'exercices : ${this.nombreExercices}\n\nExercice 1 : ...\nExercice 2 : ...`;
      this.grilleCorrection = `Grille de correction pour ${this.matiere}\n\nExercice 1 Correction : ...\nExercice 2 Correction : ...`;

      // Ajoute le message du bot avec les résultats au chat
      this.addMessage('bot', 'Voilà l’épreuve et la grille générée :'); // Tu peux ajuster ce message

      this.scrollToBottom(); // Fait défiler vers le bas
    }, 3000); // à remplacer par l’appel réel à ton backend
  }

  enregistrerEpreuve() {
    // Logique à remplacer par ton API de sauvegarde
    // Tu enverras epreuveGeneree et grilleCorrection à ton backend
    console.log("Enregistrement de l'épreuve et de la grille...");
    console.log("Épreuve :", this.epreuveGeneree);
    console.log("Grille :", this.grilleCorrection);

    // Simule la sauvegarde
    setTimeout(() => {
        alert("Épreuve et grille enregistrées !");
        // Tu pourrais vouloir rediriger l'utilisateur ou afficher un message de succès plus élaboré
    }, 1000);
  }

  modifierEpreuve() {
    const userMessage = this.nouvelleSuggestion.trim();
    if (!userMessage) {
      return; // Ne rien faire si le message est vide
    }

    // Ajoute le message de l'utilisateur au chat
    this.addMessage('user', userMessage, userMessage.length > 50); // Marque comme long si besoin


    // Tu enverras userMessage à ton backend qui interagira avec l'IA pour modifier l'épreuve/grille
    console.log("Nouvelle suggestion envoyée à l'IA :", userMessage);

    this.prompt = userMessage; // Met à jour le prompt pour une éventuelle régénération
    this.nouvelleSuggestion = ''; // Vide l'input du chat


    // Ici, tu pourrais déclencher un nouvel appel à ton backend avec le nouveau prompt
    // pour que l'IA modifie l'épreuve. Le backend renverrait l'épreuve et la grille modifiées.
    // Pour cet exemple, je vais juste simuler une réponse de l'IA.
    this.isLoading = true; // Simule le chargement pendant que l'IA traite la suggestion


     // Simule la réponse de l'IA après un délai
     setTimeout(() => {
        this.isLoading = false; // Désactive le loader

        // Simule la modification de l'épreuve/grille en fonction du prompt
        // Tu devras mettre à jour this.epreuveGeneree et this.grilleCorrection avec les vrais résultats
        const botResponseText = `J'ai pris en compte votre suggestion : "${userMessage}". Voici les ajustements...`; // Message de confirmation

        // Ajoute la réponse du bot au chat
        this.addMessage('bot', botResponseText, botResponseText.length > 50);


        this.scrollToBottom(); // Fait défiler vers le bas

      }, 2000); // Délai simulé pour la réponse de l'IA
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