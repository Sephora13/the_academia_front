import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Importe le service avec le chemin correct
import { MakeEpreuveByIaService } from '../../services/professeur/make-epreuve-by-ia.service';

// Définir des interfaces pour les messages du chat
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  isLong?: boolean;
}

// Interfaces pour les données de l'épreuve parsée
interface ParsedEpreuve {
  titre: string;
  duree: string;
  exercices: ParsedExercice[];
}

interface ParsedExercice {
  titre: string;
  type: string; // 'QCM' ou 'ouverte' ou 'code'
  consigne?: string;
  questions: ParsedQuestion[];
}

interface ParsedQuestion {
  type: string; // 'QCM' ou 'ouverte' ou 'code'
  contenu: string;
  options?: string[]; // Uniquement pour les QCM
}

// Interfaces pour les données de la grille de correction parsée
interface ParsedGrilleCorrection {
  reponses: ParsedReponse[];
}

interface ParsedReponse {
  ex: number;
  q: number;
  type: string;
  rep?: string; // Pour QCM
  attendu?: string; // Pour ouverte/code
  bareme: number;
}


@Component({
  selector: 'app-make-epreuve-by-ia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // HttpClientModule est importé dans le service, pas besoin ici si le service est injecté
  ],
  templateUrl: './make-epreuve-by-ia.component.html',
  styleUrls: ['./make-epreuve-by-ia.component.css']
})
export class MakeEpreuveByIaComponent implements AfterViewInit {
  @ViewChild('chatBody') private chatBodyRef?: ElementRef;

  isLoading = false;
  showResult = false;

  // Propriétés pour gérer l'état des boutons
  chatButtonsEnabled = false;
  generateButtonDisabled = false;

  // Propriétés liées aux champs du formulaire
  matiere = '';
  niveau = '';
  duree = '';
  nombreExercices = 0;
  objectifsInput: string = '';
  initialPrompt: string = '';
  fichier: File | null = null; // Stocke le fichier pour les modifications

  // Propriété liée à l'input du chat (pour les modifications)
  nouvelleSuggestion = '';

  // Propriété pour l'ID du professeur (à obtenir de votre système d'authentification)
  // REMPLACER 1 par la logique pour obtenir l'ID réel de l'utilisateur connecté
  professeurId: number | null = 2;


  // Propriétés pour les résultats générés (chaînes brutes de l'API)
  rawEpreuveGeneree = ''; // Pour stocker la chaîne brute de l'épreuve (qui contient aussi la grille)
  rawGrilleCorrection = ''; // Cette propriété ne sera plus utilisée directement pour le parsing de la grille


  // Propriétés pour les résultats parsés (structurés pour l'affichage)
  parsedEpreuve: ParsedEpreuve | null = null;
  parsedGrilleCorrection: ParsedGrilleCorrection | null = null;


  // Tableau pour stocker les messages du chat
  messages: ChatMessage[] = [
      { sender: 'bot', text: 'Bonjour ! Je suis votre assistant IA, prêt à vous aider à créer une épreuve sur mesure. Remplissez simplement le formulaire à gauche pour commencer.' }
  ];

  constructor(
    private router: Router,
    private makeEpreuveByIaService: MakeEpreuveByIaService // Injection du service
  ) {}

  ngAfterViewInit(): void {
     this.scrollToBottom();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.fichier = file; // Stocke le fichier ici pour les modifications futures
  }

  genererEpreuve() {
    // Ajoutez ici des validations si nécessaire (champs obligatoires, format, etc.)
     if (!this.fichier) {
        this.addMessage('bot', 'Veuillez uploader le document de cours (PDF).');
        return;
     }

    this.generateButtonDisabled = true;
    this.chatButtonsEnabled = false;
    this.isLoading = true;
    this.showResult = false;
    this.rawEpreuveGeneree = '';
    this.rawGrilleCorrection = '';
    this.parsedEpreuve = null;
    this.parsedGrilleCorrection = null;


    this.addMessage('user', 'Soumission du formulaire pour générer l\'épreuve...');

    const objectifsArray = this.objectifsInput.split('\n')
        .map(obj => obj.trim())
        .filter(obj => obj.length > 0);

    const formValues = {
        matiere: this.matiere,
        niveau: this.niveau,
        duree: this.duree,
        nombreExercices: this.nombreExercices,
        objectifsInput: this.objectifsInput, // Garder l'input string pour le parsing
        initialPrompt: this.initialPrompt,
        fichier: this.fichier // Passer le fichier
    };


    this.makeEpreuveByIaService.generateEpreuve(formValues).subscribe({
      next: (response) => {
        console.log('Réponse API génération :', response);

        if (response.success && response.message) {
          const apiMessage = response.message;

          this.rawEpreuveGeneree = apiMessage.epreuve_initiale || '';
          this.rawGrilleCorrection = apiMessage.grille_correction || ''; // Sera probablement vide


          console.log('Raw Epreuve Generee (contient épreuve et grille):', this.rawEpreuveGeneree);
          console.log('Raw Grille Correction (depuis API, probablement vide):', this.rawGrilleCorrection);


          this.parsedEpreuve = this.parseEpreuve(this.rawEpreuveGeneree);
          this.parsedGrilleCorrection = this.parseGrilleCorrection(this.rawEpreuveGeneree);


           if (this.parsedEpreuve && this.parsedGrilleCorrection) {
                this.showResult = true;
               this.addMessage('bot', apiMessage.message || 'Votre épreuve a été générée avec succès !');
               this.chatButtonsEnabled = true; // Active les boutons du chat
               // Le bouton Générer reste désactivé

           } else {
                console.error('Erreur de parsing des données reçues de l\'API.');
                this.addMessage('bot', apiMessage.message || 'L\'épreuve a été générée, mais un problème est survenu lors de l\'affichage.');
                 this.showResult = true; // Afficher la section des résultats pour voir le message d'erreur d'affichage
                 this.generateButtonDisabled = false; // Réactive le bouton Générer
           }


        } else {
          console.error('Erreur logique API génération ou structure de réponse inattendue :', response);
          this.addMessage('bot', response.message?.message || 'Une erreur est survenue lors de la génération de l\'épreuve.');
           this.generateButtonDisabled = false; // Réactive le bouton Générer
        }
      },
      error: (error) => {
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

        this.generateButtonDisabled = false; // Réactive le bouton Générer
      },
      complete: () => {
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  // Méthode de parsing de la chaîne brute de l'épreuve
  private parseEpreuve(fullRawString: string): ParsedEpreuve | null {
      // ... (logique de parsing existante) ...
       console.log('--- Démarrage de parseEpreuve ---'); // Debug
      console.log('Entrée brute pour Epreuve (chaîne complète):', fullRawString); // Debug

      const debutTag = 'epreuve_debut';
      const finTag = 'epreuve_fin';

      const startIndex = fullRawString.indexOf(debutTag);
      const endIndex = fullRawString.indexOf(finTag);

      if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
          console.warn(`parseEpreuve: Balises ${debutTag}/${finTag} manquantes ou mal placées.`); // Debug
          console.log('--- Fin de parseEpreuve (null) ---'); // Debug
          return null;
      }

      const epreuveContent = fullRawString.substring(startIndex + debutTag.length, endIndex).trim();
      console.log('Contenu de l\'épreuve (après nettoyage):', epreuveContent); // Debug

      const lines = epreuveContent.split('\n').map(line => line.trim());
      console.log('Lignes du contenu de l\'épreuve:', lines); // Debug

      const parsed: ParsedEpreuve = { titre: '', duree: '', exercices: [] };
      let currentExercice: ParsedExercice | null = null;
      let currentQuestion: ParsedQuestion | null = null;
      let inExercice = false;
      let inQuestion = false;
      let inQuestionContent = false;

      for (const line of lines) {
           console.log('Traitement de la ligne:', line); // Debug

          if (line.startsWith('titre:')) {
              parsed.titre = line.replace('titre:', '').trim();
              console.log('Titre parsé:', parsed.titre); // Debug
          } else if (line.startsWith('duree:')) {
              parsed.duree = line.replace('duree:', '').trim();
              console.log('Durée parsée:', parsed.duree); // Debug
          }
          else if (line === 'exo_debut') {
              currentExercice = { titre: '', type: '', questions: [] };
              inExercice = true;
              console.log('--- Début d\'un nouvel exercice ---'); // Debug
          }
          else if (line === 'exo_fin') {
              if (currentExercice) {
                  parsed.exercices.push(currentExercice);
                  console.log('--- Fin de l\'exercice, ajouté à parsed.exercices ---', currentExercice); // Debug
              } else {
                   console.warn('parseEpreuve: Trouvé exo_fin sans currentExercice actif.'); // Debug
              }
              currentExercice = null;
              inExercice = false;
          }
          else if (inExercice) {
              if (line.startsWith('titre:')) {
                  if (currentExercice) currentExercice.titre = line.replace('titre:', '').trim();
                  console.log('Titre de l\'exercice:', currentExercice?.titre); // Debug
              } else if (line.startsWith('type:')) {
                  if (currentExercice) currentExercice.type = line.replace('type:', '').trim();
                   console.log('Type de l\'exercice:', currentExercice?.type); // Debug
              } else if (line.startsWith('consigne:')) {
                   if (currentExercice) currentExercice.consigne = line.replace('consigne:', '').trim();
                    console.log('Consigne de l\'exercice:', currentExercice?.consigne); // Debug
              }
              else if (line === 'q_debut') {
                  currentQuestion = { type: '', contenu: '', options: [] };
                  inQuestion = true;
                  inQuestionContent = false;
                  console.log('--- Début d\'une nouvelle question ---'); // Debug
              }
              else if (line === 'q_fin') {
                  if (currentExercice && currentQuestion) {
                       if (currentQuestion.type.toLowerCase() !== 'qcm') {
                           delete currentQuestion.options;
                       }
                      currentExercice.questions.push(currentQuestion);
                      console.log('--- Fin de la question, ajoutée à currentExercice.questions ---', currentQuestion); // Debug
                  } else {
                       console.warn('parseEpreuve: Trouvé q_fin sans currentExercice ou currentQuestion actif.'); // Debug
                  }
                  currentQuestion = null;
                  inQuestion = false;
                  inQuestionContent = false;
              }
              else if (inQuestion) {
                  if (line.startsWith('type:')) {
                      if (currentQuestion) currentQuestion.type = line.replace('type:', '').trim();
                       console.log('Type de la question:', currentQuestion?.type); // Debug
                  } else if (line.startsWith('contenu:')) {
                       if (currentQuestion) {
                           currentQuestion.contenu = line.replace('contenu:', '').trim();
                           inQuestionContent = true;
                       }
                       console.log('Contenu de la question (initial):', currentQuestion?.contenu); // Debug;
                  } else if (line.startsWith('opt:')) {
                      if (currentQuestion && currentQuestion.type.toLowerCase() === 'qcm' && currentQuestion.options) {
                          currentQuestion.options.push(line.replace('opt:', '').trim());
                          inQuestionContent = false;
                          console.log('Option de question ajoutée:', currentQuestion.options[currentQuestion.options.length - 1]); // Debug
                      } else {
                           console.warn('parseEpreuve: Ligne "opt:" trouvée mais pas dans une question QCM ou currentQuestion/options manquant.'); // Debug
                      }
                  }
                  else if (inQuestionContent && currentQuestion && currentQuestion.contenu !== undefined) {
                       currentQuestion.contenu += '\n' + line;
                       console.log('parseEpreuve: Ajout de ligne au contenu multiligne:', line); // Debug
                  }
                  else {
                       console.log('parseEpreuve: Ignorance de ligne dans q_debut/q_fin qui ne correspond pas à une balise ou au contenu:', line); // Debug
                  }
              }
          }
      }

      console.log('Traitement des lignes terminé.'); // Debug
      console.log('Objet parsé final avant validation:', parsed); // Debug

      if (!parsed.titre || !parsed.duree) {
           console.warn("parseEpreuve: Parsing de l'épreuve incomplet : titre ou durée manquante.", { titre: parsed.titre, duree: parsed.duree }); // Debug
           console.log('--- Fin de parseEpreuve (null) ---'); // Debug
           return null;
      }

       if (parsed.exercices.length === 0) {
            console.warn("parseEpreuve: Aucun exercice trouvé dans la chaîne parsée."); // Debug
       }

      console.log('--- parseEpreuve réussi ---', parsed); // Debug
      return parsed;
  }

  // Méthode de parsing de la chaîne brute de la grille de correction
  private parseGrilleCorrection(fullRawString: string): ParsedGrilleCorrection | null {
      // ... (logique de parsing existante) ...
       console.log('--- Démarrage de parseGrilleCorrection ---'); // Debug
       console.log('Entrée brute pour Grille (chaîne complète):', fullRawString); // Debug

       const debutTag = 'grille_debut';
       const finTag = 'grille_fin';

       const startIndex = fullRawString.indexOf(debutTag);
       const endIndex = fullRawString.indexOf(finTag);


       if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
          console.warn(`parseGrilleCorrection: Balises ${debutTag}/${finTag} manquantes ou mal placées.`); // Debug
          console.log('--- Fin de parseGrilleCorrection (null) ---'); // Debug
          return null;
      }

      const grilleContent = fullRawString.substring(startIndex + debutTag.length, endIndex).trim();
      console.log('Contenu de la grille (après nettoyage):', grilleContent); // Debug

      const reponseLines = grilleContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      console.log('Lignes du contenu de la grille (filtrées):', reponseLines); // Debug

      const parsed: ParsedGrilleCorrection = { reponses: [] };

      for (const line of reponseLines) {
          console.log('Traitement de la ligne de grille:', line); // Debug

          if (!line.startsWith("ex:")) {
               console.warn("parseGrilleCorrection: Ligne ignorée (ne commence pas par 'ex:') :", line); // Debug
               continue;
          }

          const parts = line.split('|').map(part => part.trim());
          console.log('Parties de la ligne de grille:', parts); // Debug

          if (parts.length >= 4) {
              const parsedReponse: any = {};

              parts.forEach(part => {
                  const [key, ...valueParts] = part.split(':').map(s => s.trim());
                  const value = valueParts.join(':').trim();

                  if (key === 'ex') parsedReponse.ex = parseInt(value, 10);
                  else if (key === 'q') parsedReponse.q = parseInt(value, 10);
                  else if (key === 'type') parsedReponse.type = value;
                  else if (key === 'bareme') parsedReponse.bareme = parseFloat(value);
              });

              console.log('Parties de réponse basiques parsées:', parsedReponse); // Debug

              const reponsePart = parts[3];
              if (reponsePart.startsWith('rep:')) {
                   parsedReponse.rep = reponsePart.replace('rep:', '').trim();
                   console.log('Réponse de grille (rep):', parsedReponse.rep); // Debug
              } else if (reponsePart.startsWith('attendu:')) {
                   parsedReponse.attendu = reponsePart.replace('attendu:', '').trim();
                    console.log('Réponse de grille (attendu):', parsedReponse.attendu); // Debug
              } else {
                   console.warn("parseGrilleCorrection: Ligne de grille de correction mal formatée (partie réponse/attendu invalide) :", line); // Debug
                   continue;
              }

              if (parsedReponse.ex !== undefined && parsedReponse.q !== undefined && parsedReponse.type && parsedReponse.bareme !== undefined && (parsedReponse.rep !== undefined || parsedReponse.attendu !== undefined)) {
                   parsed.reponses.push(parsedReponse as ParsedReponse);
                   console.log('parseGrilleCorrection: Réponse parsée et ajoutée avec succès:', parsedReponse); // Debug
              } else {
                   console.warn("parseGrilleCorrection: Ligne de grille de correction mal formatée (champs manquants ou invalides) :", line, parsedReponse); // Debug
              }
          } else {
               console.warn("parseGrilleCorrection: Ligne de grille de correction ignorée (format invalide - moins de 4 parties) :", line); // Debug
          }
      }

      console.log('Traitement des lignes de grille terminé.'); // Debug
      console.log('Objet grille parsé final avant validation:', parsed); // Debug

       if (parsed.reponses.length === 0 && reponseLines.length > 0) {
            console.warn("parseGrilleCorrection: Aucune réponse de grille n'a pu être parsée malgré des lignes présentes."); // Debug
       } else if (parsed.reponses.length === 0 && grilleContent.length > 0) {
            console.warn("parseGrilleCorrection: Contenu de la grille présent mais aucune réponse parsée."); // Debug
       }

      console.log('--- parseGrilleCorrection réussi ---', parsed); // Debug
      return parsed;
  }


  modifierEpreuve() {
     // Vérifiez si les boutons du chat sont activés, si une épreuve a été générée et si le fichier PDF est disponible
     if (!this.chatButtonsEnabled || !this.rawEpreuveGeneree || !this.fichier) {
        console.log("Modification impossible : boutons désactivés, aucune épreuve générée, ou fichier PDF manquant.");
        this.addMessage('bot', 'Impossible de modifier. Générez une épreuve d\'abord en fournissant un document PDF.');
        return;
     }

     const userMessage = this.nouvelleSuggestion.trim();
     if (!userMessage) {
       this.addMessage('bot', 'Veuillez entrer une suggestion de modification.');
       return;
     }

     // Ajoutez le message de l'utilisateur au chat
     this.addMessage('user', userMessage, userMessage.length > 50);

     // Désactivez temporairement les boutons du chat et activez le loader
     this.chatButtonsEnabled = false;
     this.isLoading = true;

     // Lire le contenu du fichier PDF en base64
     const reader = new FileReader();
     reader.onload = (e: any) => {
       const pdfBase64 = e.target.result; // Le contenu base64 (Data URL)

       // Préparez les données à envoyer à l'API pour la modification
       const modificationData = {
         epreuve_initiale: this.rawEpreuveGeneree,
         nouveau_prompt: userMessage,
         contenu_pdf: pdfBase64 // Envoyer le contenu base64
       };

       // Appelle la méthode modifyEpreuve du service et s'abonne à l'Observable
       this.makeEpreuveByIaService.modifyEpreuve(modificationData).subscribe({
         next: (response) => {
           console.log('Réponse API modification :', response);

           // Assurez-vous que la structure de la réponse correspond à votre API
           // L'API renvoie {"epreuve_personnalisee": "..."} dans le champ "message" si success est true
           if (response.success && response.message && response.message.epreuve_personnalisee !== undefined) {
             const epreuveModifieeBrute = response.message.epreuve_personnalisee;

             // Stocke la nouvelle chaîne brute complète modifiée
             this.rawEpreuveGeneree = epreuveModifieeBrute;

             // Parse les nouvelles chaînes pour l'affichage
             this.parsedEpreuve = this.parseEpreuve(this.rawEpreuveGeneree);
             this.parsedGrilleCorrection = this.parseGrilleCorrection(this.rawEpreuveGeneree);


              // Vérifie si le parsing a réussi avant d'afficher les résultats structurés
             if (this.parsedEpreuve && this.parsedGrilleCorrection) {
                  this.showResult = true; // Affiche la zone de résultats structurés
                 this.addMessage('bot', 'J\'ai appliqué vos modifications à l\'épreuve !'); // Message de succès
             } else {
                  console.error('Erreur de parsing des données modifiées reçues de l\'API.');
                  this.addMessage('bot', 'L\'épreuve a été modifiée, mais un problème est survenu lors de l\'affichage.');
                  this.showResult = true; // Afficher la section des résultats pour voir le message d'erreur d'affichage
             }

           } else {
             // Si l'API indique un échec logique ou structure de réponse inattendue
             console.error('Erreur logique API modification ou structure de réponse inattendue :', response);
             // Afficher le message d'erreur de l'API (peut être dans response.message.detail ou response.message)
             this.addMessage('bot', response.message?.detail || response.message || 'Une erreur est survenue lors de la modification.');
           }
         },
         error: (error) => {
           // Gère les erreurs HTTP
           console.error('Erreur HTTP lors de la modification :', error);
            let errorMessage = 'Désolé, une erreur technique est survenue lors de la modification.';
           if (error.status === 0) {
               errorMessage = 'Impossible de se connecter au serveur API.';
           } else if (error.status >= 400 && error.status < 500) {
                // Afficher le message d'erreur du backend si disponible (peut être dans error.error.detail ou error.error.message)
                errorMessage = `Erreur client (${error.status}): ${error.error?.detail || error.error?.message || error.statusText}`;
           } else if (error.status >= 500) {
                // Afficher le message d'erreur du backend si disponible
                errorMessage = `Erreur serveur (${error.status}): ${error.error?.detail || error.error?.message || error.statusText}`;
           }
           this.addMessage('bot', errorMessage);
         },
          complete: () => {
           // S'exécute à la fin de la requête
           this.isLoading = false; // Désactive le loader
           this.chatButtonsEnabled = true; // Réactive les boutons du chat
           this.nouvelleSuggestion = ''; // Vide l'input après envoi
           this.scrollToBottom(); // Faites défiler le chat
         }
       });
     };

     // Lire le fichier en tant que Data URL (base64)
     reader.readAsDataURL(this.fichier);
   }

  enregistrerEpreuve() {
     // Vérifiez si les boutons du chat sont activés et si une épreuve a été générée
     if (!this.chatButtonsEnabled || !this.rawEpreuveGeneree) {
        console.log("Enregistrement impossible : boutons désactivés ou aucune épreuve générée.");
        this.addMessage('bot', 'Impossible d\'enregistrer. Générez une épreuve d\'abord.');
        return;
     }

     // Vérifiez si l'ID du professeur est disponible
     if (this.professeurId === null) {
         console.warn("Enregistrement impossible : ID professeur manquant.");
         this.addMessage('bot', 'Impossible d\'enregistrer : votre ID utilisateur est manquant.');
         return;
     }


     const saveData = {
       // Envoie la chaîne brute complète pour l'enregistrement
       texte_epreuve: this.rawEpreuveGeneree,
       // Inclut l'ID du professeur
       id_professeur: this.professeurId
     };

      this.addMessage('user', 'Demande d\'enregistrement de l\'épreuve...');


     this.makeEpreuveByIaService.saveEpreuve(saveData).subscribe({
       next: (response) => {
         console.log('Réponse API sauvegarde :', response);

         if (response.success) {
           const successMessage = response.message?.message || 'Épreuve enregistrée avec succès !';
           const epreuveId = response.message?.id_epreuve;
           this.addMessage('bot', epreuveId ? `${successMessage} (ID: ${epreuveId})` : successMessage);

         } else {
           console.error('Erreur logique API sauvegarde :', response.message);
           this.addMessage('bot', response.message?.message || 'Une erreur est survenue lors de l\'enregistrement.');
         }
       },
       error: (error) => {
         console.error('Erreur HTTP lors de la sauvegarde :', error);
          let errorMessage = 'Désolé, une erreur technique est survenue lors de l\'enregistrement.';
         if (error.status === 0) {
             errorMessage = 'Impossible de se connecter au serveur API.';
         } else if (error.status >= 400 && error.status < 500) {
              errorMessage = `Erreur client (${error.status}): ${error.error?.message || error.statusText}`;
         } else if (error.status >= 500) {
              errorMessage = `Erreur serveur (${error.status}): ${error.error?.message || error.statusText}`;
         }
         this.addMessage('bot', errorMessage);
       },
       complete: () => {
            this.scrollToBottom();
       }
     });
   }


  // Méthode pour ajouter un message au tableau et faire défiler
  addMessage(sender: 'user' | 'bot', text: string, isLong: boolean = false): void {
      this.messages.push({ sender, text, isLong });
      this.scrollToBottom();
  }


  // Méthode pour faire défiler la boîte de chat vers le bas
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatBodyRef && this.chatBodyRef.nativeElement) {
        this.chatBodyRef.nativeElement.scrollTop = this.chatBodyRef.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
