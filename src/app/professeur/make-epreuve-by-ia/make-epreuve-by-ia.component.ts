import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core'; // Importe AfterViewInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';


import { MakeEpreuveByIaService } from '../../services/professeur/make-epreuve-by-ia.service'; // Importe le service API
import { AuthentificationService } from '../../services/authentification.service';
import { AffectationEpreuveService } from '../../services/affectation-epreuve.service';
import { MatiereService } from '../../services/matiere.service';
import { OptionEtudeService } from '../../services/option-etude.service';

// Définir une interface pour les messages du chat pour une meilleure structuration
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  isLong?: boolean; // Optionnel, si tu as besoin de styles spécifiques pour les longs messages
  icon?: string; // Propriété pour l'icône (SVG inline ou classe)
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
  questionText?: string; // Champ pour le texte de la question
}




@Component({
  selector: 'app-make-epreuve-by-ia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule // HttpClientModule est nécessaire ici si tu utilises HttpClient directement
  ],
  templateUrl: './make-epreuve-by-ia.component.html',
  styleUrls: ['./make-epreuve-by-ia.component.css'] // Correction de styleUrl à styleUrls
})
export class MakeEpreuveByIaComponent implements AfterViewInit { // Implémente AfterViewInit
  @ViewChild('chatBody') private chatBodyRef?: ElementRef; // Référence à l'élément chat-body

  user: { id: number, nom: string, prenom: string } | null = null;
  idAffectation: number | null = null;


  isLoading = false; // Pour afficher le loader
  showResult = false; // Pour afficher/cacher les résultats générés

  // Propriétés pour gérer l'état des boutons
  chatButtonsEnabled = false;
  generateButtonDisabled = false;

  // Propriétés liées aux champs du formulaire
  matiere = '';
  niveau = '';
  duree = ''; // Conserver en string si l'API l'attend ainsi ("2h00")
  nombreExercices = 0;
  objectifsInput: string = '';
  initialPrompt: string = '';
  fichier: File | null = null; // Stocke le fichier pour les modifications

  // Propriété liée à l'input du chat (pour les modifications)
  nouvelleSuggestion = '';

  professeurId: number | null = 2;
  rawEpreuveGeneree = '';
  parsedEpreuve: ParsedEpreuve | null = null;
  parsedGrilleCorrection: ParsedGrilleCorrection | null = null;
  messages: ChatMessage[] = [
    { sender: 'bot', text: 'Bonjour ! Je suis votre assistant IA, prêt à vous aider à créer une épreuve sur mesure. Remplissez simplement le formulaire à gauche pour commencer.', icon: 'ai' }
  ];
  constructor(
    private router: Router,
    private auth: AuthentificationService,
    private makeEpreuveByIaService: MakeEpreuveByIaService,
    private route: ActivatedRoute,
    private affectationService: AffectationEpreuveService,
    private optionService: OptionEtudeService,
    private matiereService: MatiereService,
  ) { }

  ngOnInit(): void {
    // Récupérez les informations de l'utilisateur connecté
    this.user = this.auth.getUserInfo();
    if (this.user && this.user.id) {
      this.professeurId = this.user.id
    }
    this.idAffectation = +this.route.snapshot.paramMap.get('idAffectation')!;
    this.loadAffectationInfo();
  }

  private loadAffectationInfo(): void {
    if (this.idAffectation) {
      this.affectationService.getAffectation(this.idAffectation).subscribe({
        next: (response) => {
          if (response.success) {
            const affectation = response.message;

            // Récupérer les informations complètes
            forkJoin({
              matiere: this.matiereService.lireMatiere(affectation.id_matiere),
              option: this.optionService.lireOption(affectation.id_option_etude)
            }).subscribe({
              next: (results) => {
                this.matiere = results.matiere.message.nom_matiere;
                const message = results.option.message;
                if (typeof message === 'object' && !Array.isArray(message)) {
                  // Ici TypeScript sait que c'est un OptionEtude
                  this.niveau = message.nom_option;
                } else {
                  console.error("Le message retourné n'est pas une OptionEtude", message);
                }

                // Formater la durée (si disponible)
                if (affectation.duree_examen_prevue) {
                  const hours = Math.floor(affectation.duree_examen_prevue / 60);
                  const minutes = affectation.duree_examen_prevue % 60;
                  this.duree = `${hours}h${minutes.toString().padStart(2, '0')}min`;
                }
              },
              error: (err) => console.error('Erreur chargement infos', err)
            });
          }
        },
        error: (error) => console.error('Erreur chargement affectation', error)
      });
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }


  onFileChange(event: any) {
    const file = event.target.files[0];
    this.fichier = file;
  }

  private validateFields(): boolean {
    // Vérifier la durée
    const durationRegex = /^\d+h\d{1,2}min$/;
    if (!durationRegex.test(this.duree)) {
      this.addMessage('bot', 'Format de durée invalide. Utilisez le format "XXhXXmin" (ex: 2h30min)');
      return false;
    }

    // Vérifier le nombre d'exercices
    if (this.nombreExercices <= 0) {
      this.addMessage('bot', 'Le nombre d\'exercices doit être supérieur à 0');
      return false;
    }

    // Vérifier le fichier
    if (!this.fichier) {
      this.addMessage('bot', 'Veuillez uploader le document de cours (PDF)');
      return false;
    }

    return true;
  }


  genererEpreuve() {
    if (!this.validateFields()) return;
    this.generateButtonDisabled = true;
    this.chatButtonsEnabled = false;
    this.isLoading = true;
    this.showResult = false;
    this.rawEpreuveGeneree = '';
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
      objectifsInput: this.objectifsInput,
      initialPrompt: this.initialPrompt,
      fichier: this.fichier
    };

    this.makeEpreuveByIaService.generateEpreuve(formValues).subscribe({
      next: (response) => {
        console.log('Réponse API génération :', response);

        if (response.success && response.message) {
          const apiMessage = response.message;

          this.rawEpreuveGeneree = apiMessage.epreuve_initiale || '';
          console.log('Raw Epreuve Generee (contient épreuve et grille):', this.rawEpreuveGeneree);

          // **Utilise les méthodes du parsing
          this.parsedEpreuve = this.parseEpreuve(this.rawEpreuveGeneree);
          // Passe maintenant parsedEpreuve à parseGrilleCorrection pour qu'il puisse chercher le texte de la question
          this.parsedGrilleCorrection = this.parseGrilleCorrection(this.rawEpreuveGeneree, this.parsedEpreuve);


          if (this.parsedEpreuve && this.parsedGrilleCorrection) {
            this.showResult = true;
            this.addMessage('bot', apiMessage.message || 'Votre épreuve a été générée avec succès !', false, 'ai');
            this.chatButtonsEnabled = true;
          } else {
            console.error('Erreur de parsing des données reçues de l\'API.');
            this.addMessage('bot', apiMessage.message || 'L\'épreuve a été générée, mais un problème est survenu lors de l\'affichage.');
            this.showResult = true;
            this.generateButtonDisabled = false;
          }
        } else {
          console.error('Erreur logique API génération ou structure de réponse inattendue :', response);
          this.addMessage('bot', response.message?.message || 'Une erreur est survenue lors de la génération de l\'épreuve.');
          this.generateButtonDisabled = false;
        }
      },
      error: (error) => {
        console.error('Erreur HTTP lors de la génération :', error);
        let errorMessage = 'Désolé, une erreur technique est survenue lors de la génération de l\'épreuve.';
        if (error.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur API. Vérifiez l\'URL ou l\'état du service.';
        } else if (error.status >= 400 && error.status < 500) {
          errorMessage = `Erreur client (${error.status}): ${error.error?.detail || error.error?.message || error.statusText}`;
        } else if (error.status >= 500) {
          errorMessage = `Erreur serveur (${error.status}): ${error.error?.detail || error.error?.message || error.statusText}`;
        }
        this.addMessage('bot', errorMessage);
        this.generateButtonDisabled = false;
      },
      complete: () => {
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  // Méthode de parsing de la chaîne brute de l'épreuve (intégrée au composant)
  private parseEpreuve(fullRawString: string): ParsedEpreuve | null {
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
    let inQuestionContent = false; // Ajout pour gérer le contenu multiligne

    for (const line of lines) {
      console.log('Traitement de la ligne:', line); // Debug: Log chaque ligne traitée

      // Prioritize question parsing within an exercise
      if (inQuestion) {
        if (line === 'q_fin') {
          if (currentExercice && currentQuestion) {
            // Supprime la propriété options si ce n'est pas un QCM
            if (currentQuestion.type.toLowerCase() !== 'qcm') {
              delete currentQuestion.options;
              console.log(`Question Ex${parsed.exercices.length + 1} Q${currentExercice.questions.length + 1}: Type ${currentQuestion.type}, options supprimées.`); // Debug
            } else {
              console.log(`Question Ex${parsed.exercices.length + 1} Q${currentExercice.questions.length + 1}: Type QCM, options conservées.`, currentQuestion.options); // Debug: Log les options finales pour le QCM
            }
            currentExercice.questions.push(currentQuestion);
            console.log('--- Fin de la question, ajoutée à currentExercice.questions ---', currentQuestion); // Debug
          } else {
            console.warn('parseEpreuve: Trouvé q_fin sans currentExercice ou currentQuestion actif.'); // Debug
          }
          currentQuestion = null;
          inQuestion = false;
          inQuestionContent = false; // Réinitialise l'état du contenu multiligne
        } else if (line.startsWith('type:')) {
          if (currentQuestion) {
            currentQuestion.type = line.replace('type:', '').trim();
            console.log('Type de la question (assigné):', currentQuestion.type); // Debug: Log le type de la question assigné
          }
          inQuestionContent = false; // Le type n'est pas du contenu de question
        } else if (line.startsWith('contenu:')) {
          if (currentQuestion) {
            currentQuestion.contenu = line.replace('contenu:', '').trim();
            inQuestionContent = true; // Active l'état du contenu multiligne
          }
          console.log('Contenu de la question (initial):', currentQuestion?.contenu); // Debug;
        } else if (line.startsWith('opt:')) {
          if (currentQuestion && currentQuestion.type.toLowerCase() === 'qcm' && currentQuestion.options) {
            currentQuestion.options.push(line.replace('opt:', '').trim());
            inQuestionContent = false; // Désactive l'état du contenu multiligne après une option
            console.log('Option de question ajoutée:', currentQuestion.options[currentQuestion.options.length - 1]); // Debug: Log chaque option ajoutée
          } else {
            console.warn('parseEpreuve: Ligne "opt:" trouvée mais pas dans une question QCM ou currentQuestion/options manquant.'); // Debug
          }
        }
        // Gère le contenu multiligne pour le contenu de la question
        else if (inQuestionContent && currentQuestion && currentQuestion.contenu !== undefined) {
          currentQuestion.contenu += '\n' + line;
          console.log('parseEpreuve: Ajout de ligne au contenu multiligne:', line); // Debug
        }
        else {
          console.log('parseEpreuve: Ignorance de ligne dans q_debut/q_fin qui ne correspond pas à une balise ou au contenu:', line); // Debug
        }
      }
      // Then handle exercise parsing
      else if (inExercice) {
        if (line === 'exo_fin') {
          if (currentExercice) {
            parsed.exercices.push(currentExercice);
            console.log('--- Fin de l\'exercice, ajouté à parsed.exercices ---', currentExercice); // Debug
          } else {
            console.warn('parseEpreuve: Trouvé exo_fin sans currentExercice actif.'); // Debug
          }
          currentExercice = null;
          inExercice = false;
        } else if (line === 'q_debut') {
          currentQuestion = { type: '', contenu: '', options: [] };
          inQuestion = true;
          inQuestionContent = false; // Réinitialise l'état du contenu multiligne
          console.log('--- Début d\'une nouvelle question ---'); // Debug
        } else if (line.startsWith('titre:')) {
          if (currentExercice) currentExercice.titre = line.replace('titre:', '').trim();
          console.log('Titre de l\'exercice:', currentExercice?.titre); // Debug
        } else if (line.startsWith('type:')) {
          if (currentExercice) currentExercice.type = line.replace('type:', '').trim();
          console.log('Type de l\'exercice (assigné):', currentExercice?.type); // Debug: Log le type de l'exercice assigné
        } else if (line.startsWith('consigne:')) {
          if (currentExercice) currentExercice.consigne = line.replace('consigne:', '').trim();
          console.log('Consigne de l\'exercice:', currentExercice?.consigne); // Debug
        }
        else {
          console.log('parseEpreuve: Ignorance de ligne dans exo_debut/exo_fin qui ne correspond pas à une balise d\'exercice/question:', line); // Debug
        }
      }
      // Finally handle global parsing
      else {
        if (line.startsWith('epreuve_debut') || line.startsWith('epreuve_fin') || line.startsWith('grille_debut') || line.startsWith('grille_fin')) {
          // Ignore les balises de début/fin de l'épreuve et de la grille ici, elles sont gérées par le substring
        } else if (line.startsWith('titre:')) {
          parsed.titre = line.replace('titre:', '').trim();
          console.log('Titre parsé:', parsed.titre); // Debug
        } else if (line.startsWith('duree:')) {
          parsed.duree = line.replace('duree:', '').trim();
          console.log('Durée parsée:', parsed.duree); // Debug
        } else if (line === 'exo_debut') {
          currentExercice = { titre: '', type: '', questions: [] };
          inExercice = true;
          console.log('--- Début d\'un nouvel exercice ---'); // Debug
        }
        else {
          console.log('parseEpreuve: Ignorance de ligne hors des blocs attendus:', line); // Debug
        }
      }
    }

    console.log('Traitement des lignes terminé.'); // Debug
    console.log('Objet parsé final avant validation:', parsed); // Debug: Log l'objet parsedEpreuve final

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

  // Méthode de parsing de la chaîne brute de la grille de correction (intégrée au composant)
  // Accepte maintenant l'épreuve parsée en argument pour trouver le texte de la question
  private parseGrilleCorrection(fullRawString: string, parsedEpreuve: ParsedEpreuve | null): ParsedGrilleCorrection | null {
    console.log('--- Démarrage de parseGrilleCorrection ---'); // Debug
    console.log('Entrée brute pour Grille (chaîne complète):', fullRawString); // Debug
    console.log('Epreuve parsée fournie pour lookup:', parsedEpreuve); // Debug


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
        const parsedReponse: any = {}; // Utilise any temporairement pour construire l'objet

        // Parse les parties ex, q, type, bareme
        parts.forEach(part => {
          const [key, ...valueParts] = part.split(':').map(s => s.trim());
          const value = valueParts.join(':').trim(); // Gère les cas où la valeur contient ':'

          if (key === 'ex') parsedReponse.ex = parseInt(value, 10);
          else if (key === 'q') parsedReponse.q = parseInt(value, 10);
          else if (key === 'type') parsedReponse.type = value; // Capture le type
          else if (key === 'bareme') parsedReponse.bareme = parseFloat(value);
        });

        console.log('Parties de réponse basiques parsées:', parsedReponse); // Debug

        // La partie réponse/attendu est toujours la 4ème partie (index 3)
        const reponsePart = parts[3];
        if (reponsePart.startsWith('rep:')) {
          parsedReponse.rep = reponsePart.replace('rep:', '').trim();
          console.log('Réponse de grille (rep):', parsedReponse.rep); // Debug
        } else if (reponsePart.startsWith('attendu:')) {
          parsedReponse.attendu = reponsePart.replace('attendu:', '').trim();
          console.log('Réponse de grille (attendu):', parsedReponse.attendu); // Debug
        } else {
          console.warn("parseGrilleCorrection: Ligne de grille de correction mal formatée (partie réponse/attendu invalide) :", line); // Debug
          continue; // Ignore cette ligne si la partie réponse/attendu est invalide
        }

        // Cherche le texte de la question correspondante
        if (parsedEpreuve && parsedReponse.ex !== undefined && parsedReponse.q !== undefined) {
          // Les numéros d'exercice et de question sont généralement basés sur 1 dans la sortie IA
          const exerciceIndex = parsedReponse.ex - 1;
          const questionIndex = parsedReponse.q - 1;

          if (exerciceIndex >= 0 && exerciceIndex < parsedEpreuve.exercices.length) {
            const exercice = parsedEpreuve.exercices[exerciceIndex];
            if (questionIndex >= 0 && questionIndex < exercice.questions.length) {
              parsedReponse.questionText = exercice.questions[questionIndex].contenu;
              console.log(`Trouvé texte question Ex${parsedReponse.ex} Q${parsedReponse.q}:`, parsedReponse.questionText); // Debug
            } else {
              console.warn(`parseGrilleCorrection: Question Ex${parsedReponse.ex} Q${parsedReponse.q} non trouvée dans parsedEpreuve.`, parsedReponse); // Debug
            }
          } else {
            console.warn(`parseGrilleCorrection: Exercice Ex${parsedReponse.ex} non trouvé dans parsedEpreuve.`, parsedReponse); // Debug
          }
        } else {
          console.warn("parseGrilleCorrection: parsedEpreuve est null ou ex/q manquants, impossible de chercher le texte de la question.", { parsedEpreuve: parsedEpreuve, parsedReponse: parsedReponse }); // Debug
        }
        // FIN AJOUT --->


        // Valide les champs essentiels avant d'ajouter la réponse parsée
        if (parsedReponse.ex !== undefined && parsedReponse.q !== undefined && parsedReponse.type && parsedReponse.bareme !== undefined && (parsedReponse.rep !== undefined || parsedReponse.attendu !== undefined)) {
          parsed.reponses.push(parsedReponse as ParsedReponse); // Cast en ParsedReponse
          console.log('parseGrilleCorrection: Réponse parsée et ajoutée avec succès:', parsedReponse); // Debug
        } else {
          console.warn("parseGrilleCorrection: Ligne de grille de correction mal formatée (champs manquants ou invalides) :", line, parsedReponse); // Debug
        }
      } else {
        console.warn("parseGrilleCorrection: Ligne de grille de correction ignorée (format invalide - moins de 4 parties attendues) :", line); // Debug
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
    this.isLoading = true; // Activer le loader

    // Lire le contenu du fichier PDF en base64
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const pdfBase64 = e.target.result; // Le contenu base64 (Data URL)

      // Préparez les données à envoyer à l'API pour la modification
      const modificationData = {
        epreuve_initiale: this.rawEpreuveGeneree, // Envoie la cha\u00EEne brute actuelle
        nouveau_prompt: userMessage,
        contenu_pdf: pdfBase64 // Envoyer le contenu base64
      };

      // Appelle la méthode modifyEpreuve du service ou utilise HttpClient directement
      // this.http.post<any>(`${this.apiUrl}/api/personnaliser_epreuve`, modificationData).subscribe({ // Si tu utilises HttpClient directement
      this.makeEpreuveByIaService.modifyEpreuve(modificationData).subscribe({ // Si tu utilises un service API
        next: (response) => {
          console.log('Réponse API modification :', response);

          // Assurez-vous que la structure de la réponse correspond \u00E0 votre API
          // L'API renvoie {"epreuve_personnalisee": "..."} dans le champ "message" si success est true
          if (response.success && response.message && response.message.epreuve_personnalisee !== undefined) {
            const epreuveModifieeBrute = response.message.epreuve_personnalisee;

            // Stocke la nouvelle cha\u00EEne brute complète modifiée
            this.rawEpreuveGeneree = epreuveModifieeBrute;

            // **UTILISE LE SERVICE DE PARSING** (ou les méthodes locales si tu ne l'as pas créé)
            this.parsedEpreuve = this.parseEpreuve(this.rawEpreuveGeneree); // Utilise la méthode de parsing locale
            // Passe maintenant parsedEpreuve à parseGrilleCorrection pour qu'il puisse chercher le texte de la question
            this.parsedGrilleCorrection = this.parseGrilleCorrection(this.rawEpreuveGeneree, this.parsedEpreuve); // Utilise la méthode de parsing locale


            // Vérifie si le parsing a réussi avant d'afficher les résultats structurés
            if (this.parsedEpreuve && this.parsedGrilleCorrection) {
              this.showResult = true; // Affiche la zone de résultats structurés
              this.addMessage('bot', 'J\'ai appliqué vos modifications à l\'épreuve !', false, 'ai'); // Message de succès
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
          // S'exécute \u00E0 la fin de la requête
          this.isLoading = false; // Désactive le loader
          // Réactive les boutons du chat seulement si l'épreuve parsée existe toujours
          if (this.parsedEpreuve) {
            this.chatButtonsEnabled = true;
          }
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

    this.isLoading = true; // Activer le loader pour l'enregistrement
    this.chatButtonsEnabled = false; // Désactiver les boutons du chat pendant l'enregistrement


    const saveData = {
      // Envoie la cha\u00EEne brute complète pour l'enregistrement
      texte_epreuve: this.rawEpreuveGeneree,
      // Inclut l'ID du professeur
      id_professeur: this.professeurId
    };

    this.addMessage('user', 'Demande d\'enregistrement de l\'épreuve...');


    // Utilise HttpClient directement ou ton service API si tu l'as créé
    // this.http.post<any>(`${this.apiUrl}/api/save_epreuve`, saveData).subscribe({ // Si tu utilises HttpClient directement
    this.makeEpreuveByIaService.saveEpreuve(saveData).subscribe({ // Si tu utilises un service API
      next: (response) => {
        console.log('Réponse API sauvegarde :', response);

        if (response.success) {
          const successMessage = response.message?.message || 'Épreuve enregistrée avec succès !';
          const epreuveId = response.message?.id_epreuve;
          this.addMessage('bot', epreuveId ? `${successMessage}` : successMessage, false, 'ai');
          if (epreuveId) {
            this.affectationService.mettreAJourIdProfDansAffectation(this.idAffectation!, epreuveId).subscribe({
              next: (response) => {
                if (response.success){
                  console.log('affectation mise à jour');
                  this.router.navigate(['/professeur/show_epreuve']);
                } else {
                  console.error('Erreur lors de la tentative de mise à jour de affectation :', response.message);
                }
              }
            })
          }

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
          errorMessage = `Erreur serveur (${error.status}): ${error.error?.detail || error.error?.message || error.statusText}`;
        }
        this.addMessage('bot', errorMessage);
      },
      complete: () => {
        this.isLoading = false; // Désactive le loader même en cas d'erreur
        // Réactive les boutons du chat seulement si l'épreuve parsée existe toujours
        if (this.parsedEpreuve) {
          this.chatButtonsEnabled = true;
        }
        this.scrollToBottom();
      }
    });
  }


  // Méthode pour ajouter un message au tableau et faire défiler
  addMessage(sender: 'user' | 'bot', text: string, isLong: boolean = false, icon?: string): void {
    this.messages.push({ sender, text, isLong, icon });
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
