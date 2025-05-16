import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Assurez-vous que FormsModule est importé ici
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
    FormsModule, // Assurez-vous que FormsModule est dans le tableau des imports pour les composants standalone
    // HttpClientModule est importé dans le service
  ],
  templateUrl: './make-epreuve-by-ia.component.html',
  styleUrl: './make-epreuve-by-ia.component.css'
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
  duree = ''; // Conserver en string pour correspondre au backend "2h30"
  nombreExercices = 0;
  objectifsInput: string = ''; // Texte multiligne des objectifs
  initialPrompt: string = ''; // Texte du prompt initial
  fichier: File | null = null;

  // Propriété liée à l'input du chat (pour les modifications)
  // Cette propriété est utilisée avec [(ngModel)] dans le template
  nouvelleSuggestion = '';


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
    this.fichier = file;
  }

  genererEpreuve() {
    // Ajoutez ici des validations si nécessaire (champs obligatoires, format, etc.)
    if (!this.fichier) {
        this.addMessage('bot', 'Veuillez uploader le document de cours (PDF).');
        return;
     }
     // Vous pouvez ajouter d'autres validations pour les champs texte/nombre ici


    // Désactiver les boutons et activer le loader au début
    this.generateButtonDisabled = true;
    this.chatButtonsEnabled = false; // Désactive les boutons du chat
    this.isLoading = true;
    this.showResult = false; // Cache les résultats précédents
    this.rawEpreuveGeneree = ''; // Réinitialise les résultats bruts et parsés
    this.rawGrilleCorrection = ''; // Réinitialise aussi, même si non utilisée pour le parsing
    this.parsedEpreuve = null;
    this.parsedGrilleCorrection = null;


    // Ajoutez un message dans le chat pour indiquer que la soumission est en cours
    this.addMessage('user', 'Soumission du formulaire pour générer l\'épreuve...');

    // Crée l'objet formValues attendu par la méthode generateEpreuve du service
    const formValues = {
        matiere: this.matiere,
        niveau: this.niveau,
        duree: this.duree,
        nombreExercices: this.nombreExercices,
        objectifsInput: this.objectifsInput,
        initialPrompt: this.initialPrompt,
        fichier: this.fichier // Passe l'objet File
    };

    // Appelle la méthode generateEpreuve du service et s'abonne à l'Observable
    this.makeEpreuveByIaService.generateEpreuve(formValues).subscribe({
      next: (response) => {
        // Cette partie s'exécute si la requête HTTP réussit (code 2xx)
        console.log('Réponse API génération :', response);

        // Vérifiez la structure de la réponse API
        if (response.success && response.message) {
          // Si l'API indique un succès et que le message contient les données
          const apiMessage = response.message; // L'objet renvoyé dans 'message'

          // Stocke la chaîne brute complète (qui contient l'épreuve et la grille)
          // D'après votre API, l'épreuve et la grille sont dans apiMessage.epreuve_initiale
          this.rawEpreuveGeneree = apiMessage.epreuve_initiale || '';
          // rawGrilleCorrection est stockée ici pour l'enregistrement, même si elle est vide dans la réponse actuelle
          this.rawGrilleCorrection = apiMessage.grille_correction || ''; // Sera probablement vide


          console.log('Raw Epreuve Generee (contient épreuve et grille):', this.rawEpreuveGeneree); // Debug
          console.log('Raw Grille Correction (depuis API, probablement vide):', this.rawGrilleCorrection); // Debug


          // Parse les chaînes pour l'affichage structuré
          // On passe la chaîne complète (rawEpreuveGeneree) aux deux fonctions de parsing
          this.parsedEpreuve = this.parseEpreuve(this.rawEpreuveGeneree);
          this.parsedGrilleCorrection = this.parseGrilleCorrection(this.rawEpreuveGeneree); // <-- Changement ici : on passe la chaîne complète


           console.log('Parsed Epreuve:', this.parsedEpreuve); // Debug
           console.log('Parsed Grille Correction:', this.parsedGrilleCorrection); // Debug


           // Vérifie si le parsing a réussi avant d'afficher les résultats structurés
           // La condition vérifie toujours si les deux objets parsés existent
           if (this.parsedEpreuve && this.parsedGrilleCorrection) {
                this.showResult = true; // Affiche la zone de résultats structurés
                // Ajoutez un message de succès de l'IA dans le chat
               this.addMessage('bot', apiMessage.message || 'Votre épreuve a été générée avec succès !'); // Utilise le message textuel de l'API si présent
               // Activez les boutons du chat une fois l'épreuve générée
               this.chatButtonsEnabled = true;
               // Le bouton Générer reste désactivé

           } else {
                // Si le parsing échoue même si l'API a renvoyé success: true
                console.error('Erreur de parsing des données reçues de l\'API.');
                this.addMessage('bot', apiMessage.message || 'L\'épreuve a été générée, mais un problème est survenu lors de l\'affichage.');
                 // Optionnel : afficher les données brutes pour débogage si le parsing échoue
                 this.showResult = true; // Afficher la section des résultats pour voir le message d'erreur d'affichage
                 this.generateButtonDisabled = false; // Réactive le bouton Générer
           }


        } else {
          // Si l'API indique un échec logique (par exemple, validation côté serveur)
          console.error('Erreur logique API génération ou structure de réponse inattendue :', response);
          this.addMessage('bot', response.message?.message || 'Une erreur est survenue lors de la génération de l\'épreuve.');

          // En cas d'échec, réactiver le bouton Générer
           this.generateButtonDisabled = false;
           // Les boutons du chat restent désactivés si la génération échoue

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

  // Méthode de parsing de la chaîne brute de l'épreuve, basée sur la logique Python
  // Cette fonction extrait le bloc epreuve_debut...epreuve_fin
  private parseEpreuve(fullRawString: string): ParsedEpreuve | null { // Prend la chaîne complète en entrée
      console.log('--- Démarrage de parseEpreuve ---'); // Debug
      console.log('Entrée brute pour Epreuve (chaîne complète):', fullRawString); // Debug

      // Vérification basique des balises début/fin de l'épreuve
      const debutTag = 'epreuve_debut';
      const finTag = 'epreuve_fin';

      const startIndex = fullRawString.indexOf(debutTag);
      const endIndex = fullRawString.indexOf(finTag);

      // Vérifie si les balises existent et sont dans le bon ordre
      if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
          console.warn(`parseEpreuve: Balises ${debutTag}/${finTag} manquantes ou mal placées.`); // Debug
          console.log('--- Fin de parseEpreuve (null) ---'); // Debug
          return null;
      }

      // Extrait le contenu entre les balises de l'épreuve
      const epreuveContent = fullRawString.substring(startIndex + debutTag.length, endIndex).trim();
      console.log('Contenu de l\'épreuve (après nettoyage):', epreuveContent); // Debug


      // Sépare le contenu en lignes et nettoie chaque ligne
      const lines = epreuveContent.split('\n').map(line => line.trim());
      console.log('Lignes du contenu de l\'épreuve:', lines); // Debug


      const parsed: ParsedEpreuve = { titre: '', duree: '', exercices: [] };
      let currentExercice: ParsedExercice | null = null;
      let currentQuestion: ParsedQuestion | null = null;
      let inExercice = false;
      let inQuestion = false;

      for (const line of lines) {
           console.log('Traitement de la ligne:', line); // Debug

          // Parsing du titre et de la durée (au début de l'épreuve)
          if (line.startsWith('titre:')) {
               // Capture le titre complet tel qu'il est formaté dans la chaîne
              parsed.titre = line.replace('titre:', '').trim();
              console.log('Titre parsé:', parsed.titre); // Debug
          } else if (line.startsWith('duree:')) {
              parsed.duree = line.replace('duree:', '').trim();
              console.log('Durée parsée:', parsed.duree); // Debug
          }
          // Début d'un exercice
          else if (line === 'exo_debut') {
              currentExercice = { titre: '', type: '', questions: [] };
              inExercice = true;
              console.log('--- Début d\'un nouvel exercice ---'); // Debug
          }
          // Fin d'un exercice
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
          // Si on est dans un bloc d'exercice
          else if (inExercice) {
              // Parsing des détails de l'exercice (titre, type, consigne)
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
              // Début d'une question
              else if (line === 'q_debut') {
                  currentQuestion = { type: '', contenu: '', options: [] }; // Initialise options comme un tableau vide
                  inQuestion = true;
                  console.log('--- Début d\'une nouvelle question ---'); // Debug
              }
              // Fin d'une question
              else if (line === 'q_fin') {
                  if (currentExercice && currentQuestion) {
                       // Si la question n'est PAS un QCM, retire l'array options qui a été initialisé par défaut
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
              }
              // Si on est dans un bloc de question
              else if (inQuestion) {
                  // Parsing des détails de la question (type, contenu, options)
                  if (line.startsWith('type:')) {
                      if (currentQuestion) currentQuestion.type = line.replace('type:', '').trim();
                       console.log('Type de la question:', currentQuestion?.type); // Debug
                  } else if (line.startsWith('contenu:')) {
                      // Gère le contenu en prenant la ligne qui commence par 'contenu:'.
                      // Si le contenu est multiligne SANS préfixe 'contenu:' sur les lignes suivantes,
                      // la logique actuelle ne les ajoutera pas au contenu de la question.
                       if (currentQuestion) {
                           currentQuestion.contenu = line.replace('contenu:', '').trim();
                       }
                       console.log('Contenu de la question:', currentQuestion?.contenu); // Debug
                  } else if (line.startsWith('opt:')) {
                      // Si la ligne commence par 'opt:' ET que la question est un QCM
                      if (currentQuestion && currentQuestion.type.toLowerCase() === 'qcm' && currentQuestion.options) {
                          currentQuestion.options.push(line.replace('opt:', '').trim());
                          console.log('Option de question ajoutée:', currentQuestion.options[currentQuestion.options.length - 1]); // Debug
                      } else {
                           console.warn('parseEpreuve: Ligne "opt:" trouvée mais pas dans une question QCM ou currentQuestion/options manquant.'); // Debug
                      }
                  }
                  // Toute autre ligne à l'intérieur de q_debut/q_fin qui ne commence pas par type:, contenu:, ou opt: est ignorée.
                  // Si votre API génère du contenu multiligne SANS préfixe sur les lignes suivantes, cette logique devra être ajustée.
                  else {
                       console.log('parseEpreuve: Ignorance de ligne dans q_debut/q_fin qui ne commence pas par une balise connue:', line); // Debug
                  }
              }
          }
      }

      console.log('Traitement des lignes terminé.'); // Debug
      console.log('Objet parsé final avant validation:', parsed); // Debug

      // Vérifie si l'extraction du titre et de la durée a réussi
      if (!parsed.titre || !parsed.duree) {
           console.warn("parseEpreuve: Parsing de l'épreuve incomplet : titre ou durée manquante.", { titre: parsed.titre, duree: parsed.duree }); // Debug
           console.log('--- Fin de parseEpreuve (null) ---'); // Debug
           return null; // Retourne null si les informations de base sont manquantes
      }

      // Vérifie si au moins un exercice a été parsé (peut être optionnel selon votre besoin)
       if (parsed.exercices.length === 0) {
            console.warn("parseEpreuve: Aucun exercice trouvé dans la chaîne parsée."); // Debug
            // Décidez si vous voulez retourner null ici ou un objet d'épreuve sans exercices
            // Retournons l'objet même sans exercices si titre/durée sont là
       }

      console.log('--- parseEpreuve réussi ---', parsed); // Debug
      return parsed;
  }

  // Méthode de parsing de la chaîne brute de la grille de correction, basée sur la logique Python
  // Cette fonction extrait le bloc grille_debut...grille_fin de la chaîne complète
  private parseGrilleCorrection(fullRawString: string): ParsedGrilleCorrection | null { // Prend la chaîne complète
       console.log('--- Démarrage de parseGrilleCorrection ---'); // Debug
       console.log('Entrée brute pour Grille (chaîne complète):', fullRawString); // Debug

       // Vérification basique des balises début/fin de la grille
       const debutTag = 'grille_debut';
       const finTag = 'grille_fin';

       const startIndex = fullRawString.indexOf(debutTag);
       const endIndex = fullRawString.indexOf(finTag);


       if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
          console.warn(`parseGrilleCorrection: Balises ${debutTag}/${finTag} manquantes ou mal placées.`); // Debug
          console.log('--- Fin de parseGrilleCorrection (null) ---'); // Debug
          return null;
      }

      // Extrait le contenu entre les balises de la grille
      const grilleContent = fullRawString.substring(startIndex + debutTag.length, endIndex).trim();
      console.log('Contenu de la grille (après nettoyage):', grilleContent); // Debug


      // Sépare le contenu en lignes et nettoie chaque ligne
      const reponseLines = grilleContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      console.log('Lignes du contenu de la grille (filtrées):', reponseLines); // Debug


      const parsed: ParsedGrilleCorrection = { reponses: [] };

      for (const line of reponseLines) {
          console.log('Traitement de la ligne de grille:', line); // Debug

          // S'assurer que la ligne commence par "ex:" comme dans la logique Python
          if (!line.startsWith("ex:")) {
               console.warn("parseGrilleCorrection: Ligne ignorée (ne commence pas par 'ex:') :", line); // Debug
               continue;
          }

          // Sépare la ligne par '|'
          const parts = line.split('|').map(part => part.trim());
          console.log('Parties de la ligne de grille:', parts); // Debug

          // On s'attend à au moins 4 parties : ex, q, type, et la partie réponse/attendu/bareme
          if (parts.length >= 4) {
              const parsedReponse: any = {}; // Utilise any temporairement pour la flexibilité

              // Parse les parties spécifiques (ex, q, type, bareme)
              parts.forEach(part => {
                  const [key, ...valueParts] = part.split(':').map(s => s.trim());
                  const value = valueParts.join(':').trim(); // Gère les cas où la valeur contient ":"

                  if (key === 'ex') parsedReponse.ex = parseInt(value, 10);
                  else if (key === 'q') parsedReponse.q = parseInt(value, 10);
                  else if (key === 'type') parsedReponse.type = value;
                   // Le bareme est la dernière partie
                  else if (key === 'bareme') parsedReponse.bareme = parseFloat(value);
              });

              console.log('Parties de réponse basiques parsées:', parsedReponse); // Debug

              // Gère spécifiquement la 4ème partie (index 3) pour la réponse/attendu
              const reponsePart = parts[3];
              if (reponsePart.startsWith('rep:')) {
                   parsedReponse.rep = reponsePart.replace('rep:', '').trim();
                   console.log('Réponse de grille (rep):', parsedReponse.rep); // Debug
              } else if (reponsePart.startsWith('attendu:')) {
                   parsedReponse.attendu = reponsePart.replace('attendu:', '').trim();
                    console.log('Réponse de grille (attendu):', parsedReponse.attendu); // Debug
              } else {
                   console.warn("parseGrilleCorrection: Ligne de grille de correction mal formatée (partie réponse/attendu invalide) :", line); // Debug
                   continue; // Ignore la ligne si la partie réponse/attendu n'est pas reconnue
              }


               // Vérifier si les propriétés minimales sont présentes et que c'est une réponse valide
               // On vérifie que ex, q, type, bareme sont définis ET que soit rep soit attendu est défini
              if (parsedReponse.ex !== undefined && parsedReponse.q !== undefined && parsedReponse.type && parsedReponse.bareme !== undefined && (parsedReponse.rep !== undefined || parsedReponse.attendu !== undefined)) {
                   parsed.reponses.push(parsedReponse as ParsedReponse); // Caster vers le type final
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


      // Vérifie si des réponses ont été parsées
       if (parsed.reponses.length === 0 && reponseLines.length > 0) {
            console.warn("parseGrilleCorrection: Aucune réponse de grille n'a pu être parsée malgré des lignes présentes."); // Debug
            // Décidez si vous voulez retourner null ici ou un objet de grille vide
            // Retournons l'objet même sans réponses si le bloc grille était présent
       } else if (parsed.reponses.length === 0 && grilleContent.length > 0) {
            console.warn("parseGrilleCorrection: Contenu de la grille présent mais aucune réponse parsée."); // Debug
       }


      console.log('--- parseGrilleCorrection réussi ---', parsed); // Debug
      return parsed;
  }


  // Conserver les méthodes modifierEpreuve et enregistrerEpreuve pour plus tard
  // Elles utiliseront l'input du chat (nouvelleSuggestion) pour le prompt de modification
  // et enverront l'épreuve/grille actuelles.

  modifierEpreuve() {
     // Vérifiez si les boutons du chat sont activés
     if (!this.chatButtonsEnabled) {
        console.log("Boutons du chat désactivés, suggestion ignorée.");
        return; // Ne rien faire si les boutons sont désactivés
     }

     const userMessage = this.nouvelleSuggestion.trim();
     if (!userMessage) {
       return; // Ne rien faire si le message est vide
     }

     // Ajoutez le message de l'utilisateur au chat
     this.addMessage('user', userMessage, userMessage.length > 50);

     // Désactivez temporairement les boutons du chat et activez le loader
     this.chatButtonsEnabled = false;
     this.isLoading = true;

     // Préparez les données à envoyer à l'API pour la modification
     const modificationData = {
       suggestion: userMessage,
       // Incluez la chaîne brute complète actuelle pour la modification
       // Votre backend de modification devra extraire l'épreuve et la grille de cette chaîne
       epreuveActuelle: this.rawEpreuveGeneree,
       // On n'envoie pas grilleActuelle: this.rawGrilleCorrection car elle est vide
       // Si votre backend de modification attend la grille séparément, vous devrez extraire la grille ici avant d'envoyer
       // Par exemple: grilleActuelle: this.extractGrilleFromRawString(this.rawEpreuveGeneree)
       // Où extractGrilleFromRawString serait une nouvelle méthode similaire à parseGrilleCorrection mais retournant la sous-chaîne brute
     };

     // Appelle la méthode modifyEpreuve du service et s'abonne à l'Observable
     this.makeEpreuveByIaService.modifyEpreuve(modificationData).subscribe({
       next: (response) => {
         console.log('Réponse API modification :', response);

         if (response.success && response.message) {
           // Si l'API indique un succès et renvoie les données modifiées
           const apiMessage = response.message;

           // Stocke la nouvelle chaîne brute complète modifiée
           // Assurez-vous que votre API de modification renvoie la chaîne complète modifiée sous epreuve_modifiee
           this.rawEpreuveGeneree = apiMessage.epreuve_modifiee || apiMessage.epreuve_initiale || this.rawEpreuveGeneree; // Utilise la version modifiée si présente, sinon l'initiale, sinon l'ancienne
           // La grille modifiée sera aussi dans cette nouvelle chaîne complète

           // Parse les nouvelles chaînes pour l'affichage
           // On passe la nouvelle chaîne complète aux deux fonctions de parsing
           this.parsedEpreuve = this.parseEpreuve(this.rawEpreuveGeneree);
           this.parsedGrilleCorrection = this.parseGrilleCorrection(this.rawEpreuveGeneree); // <-- Changement ici


            // Vérifie si le parsing a réussi avant d'afficher les résultats structurés
           if (this.parsedEpreuve && this.parsedGrilleCorrection) {
                this.showResult = true; // Affiche la zone de résultats structurés
                // Ajoutez un message de succès de l'IA dans le chat
               this.addMessage('bot', apiMessage.message || 'Épreuve modifiée avec succès !'); // Utilise le message textuel de l'API si présent

           } else {
                // Si le parsing échoue même si l'API a renvoyé success: true
                console.error('Erreur de parsing des données reçues de l\'API après modification.');
                this.addMessage('bot', apiMessage.message || 'L\'épreuve a été modifiée, mais un problème est survenu lors de l\'affichage.');
                // Optionnel : afficher les données brutes pour débogage si le parsing échoue
                // this.showResult = true; // Peut être utile pour voir les données brutes
           }


         } else {
           // Si l'API indique un échec logique
           console.error('Erreur logique API modification :', response.message);
           this.addMessage('bot', response.message?.message || 'Une erreur est survenue lors de la modification.');
         }
       },
       error: (error) => {
         // Gère les erreurs HTTP
         console.error('Erreur HTTP lors de la modification :', error);
          let errorMessage = 'Désolé, une erreur technique est survenue lors de la modification.';
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
         // S'exécute à la fin de la requête
         this.isLoading = false; // Désactive le loader
         this.chatButtonsEnabled = true; // Réactive les boutons du chat
         this.nouvelleSuggestion = ''; // Vide l'input après envoi
         this.scrollToBottom(); // Faites défiler le chat
       }
     });
   }

  enregistrerEpreuve() {
     // Vérifiez si les boutons du chat sont activés et si une épreuve a été générée
     if (!this.chatButtonsEnabled || !this.rawEpreuveGeneree) {
        console.log("Enregistrement impossible : boutons désactivés ou aucune épreuve générée.");
        // Optionnel : ajouter un message dans le chat
        // this.addMessage('bot', 'Impossible d\'enregistrer. Générez une épreuve d\'abord.');
        return; // Ne rien faire si les boutons sont désactivés ou l'épreuve est vide
     }

     const saveData = {
       // Envoie la chaîne brute complète pour l'enregistrement
       // Votre backend devra extraire l'épreuve et la grille de cette chaîne
       epreuve: this.rawEpreuveGeneree,
       // On n'envoie pas grille: this.rawGrilleCorrection car elle est vide
       // Si votre backend d'enregistrement attend la grille séparément, vous devrez extraire la grille ici avant d'envoyer
       // Par exemple: grille: this.extractGrilleFromRawString(this.rawEpreuveGeneree)
       // Où extractGrilleFromRawString serait une nouvelle méthode similaire à parseGrilleCorrection mais retournant la sous-chaîne brute
     };

      // Optionnel: Afficher un message dans le chat indiquant que l'enregistrement est en cours
      this.addMessage('user', 'Demande d\'enregistrement de l\'épreuve...');


     // Appelle la méthode saveEpreuve du service et s'abonne à l'Observable
     this.makeEpreuveByIaService.saveEpreuve(saveData).subscribe({
       next: (response) => {
         console.log('Réponse API sauvegarde :', response);

         if (response.success) {
           // Si l'API indique un succès
           this.addMessage('bot', response.message || 'Épreuve enregistrée avec succès !');
           // Optionnel : désactiver le bouton d'enregistrement après succès ou le lier à un état
         } else {
           // Si l'API indique un échec logique
           console.error('Erreur logique API sauvegarde :', response.message);
           this.addMessage('bot', response.message || 'Une erreur est survenue lors de l\'enregistrement.');
           // Optionnel: Afficher un message d'erreur plus visible
         }
       },
       error: (error) => {
         // Gère les erreurs HTTP
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
            this.scrollToBottom(); // Faites défiler le chat
       }
     });
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
