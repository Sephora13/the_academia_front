import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import * as ace from "ace-builds";
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';
import { CompositionService } from '../services/composition.service';

@Component({
  selector: 'app-new-composition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-composition.component.html',
  styleUrls: ['./new-composition.component.css']
})
export class NewCompositionComponent implements AfterViewInit {
  // Informations de l'utilisateur connecté
  user: { id: number, nom: string, prenom: string } | null = null;

  // Informations de l'épreuve
  examInfo: any = {};
  id_epreuve: number = 0;

  // Conteneurs de questions
  partie1: any[] = []; // QCM
  partie2: any[] = []; // Questions de Code
  partie3: any[] = []; // Questions Réponses Courtes

  // Réponses stockées
  selectedOptions: { [key: string]: string } = {};
  codeAnswers: string[] = [];
  shortAnswers: string[] = [];

  // Gestionnaire d'éditeurs de code ACE
  @ViewChildren("editor") codeEditors!: QueryList<ElementRef>;

  // Indicateurs de chargement et d'erreur pour l'appel API
  loading = true;
  error: string | null = null;

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private auth: AuthentificationService,
    private compositionService: CompositionService
  ) {
    this.id_epreuve = this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.loadExamInfo();
    this.loadQuestions();
  }

  // Méthode pour récupérer les informations de l'épreuve
  loadExamInfo(): void {
    this.loading = true;
    this.error = null;

    this.compositionService.showInfoEp(this.id_epreuve).subscribe({
      next: (response) => {
        if (response.success) {
          this.examInfo = response.message;
        } else {
          this.error = "Impossible de récupérer les informations de l'épreuve.";
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement épreuve :', err);
        this.error = this.handleError(err);
        this.loading = false;
      }
    });
  }

  // Méthode pour récupérer les questions
  loadQuestions(): void {
    this.loading = true;
    this.compositionService.showQuesByEp(this.id_epreuve).subscribe({
      next: (response) => {
        if (response.success) {
          response.message.forEach((question: any) => {
            switch (question.type_question) {
              case "QCM":
                this.partie1.push(question);
                break;
              case "code":
                this.partie2.push(question);
                break;
              case "ouverte":
                this.partie3.push(question);
                break;
            }
          });
        } else {
          this.error = "Impossible de récupérer les questions.";
        }
        this.loading = false;
      },
      error: (err) => {
        console.error("Erreur chargement questions :", err);
        this.error = this.handleError(err);
        this.loading = false;
      }
    });
  }

  // Initialisation des éditeurs de code ACE
  ngAfterViewInit(): void {
    this.codeEditors.changes.subscribe(() => {
      this.codeEditors.forEach((editor, index) => {
        const aceEditor = ace.edit(editor.nativeElement);
        ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
        aceEditor.setOptions({
          fontSize: "14px",
          theme: 'ace/theme/twilight',
          mode: 'ace/mode/javascript'
        });
        aceEditor.session.setValue("");
        aceEditor.on("change", () => {
          this.codeAnswers[index] = aceEditor.getValue();
        });
      });
    });
  }

  // Enregistrement des réponses QCM
  selectOption(question: string, option: string) {
    this.selectedOptions[question] = option;
  }

  // Enregistrement des réponses courtes
  saveShortAnswer(index: number, event: Event) {
    const target = event.target as HTMLTextAreaElement | null;
    if (target) {
      this.shortAnswers[index] = target.value;
    }
  }

  // Méthode pour soumettre l'épreuve
  submitExam() {
    if (!this.user) {
      alert("Utilisateur non authentifié.");
      return;
    }
  
    const payloadCopie = {
      id_etudiant: this.user.id,
      id_epreuve: this.id_epreuve,
      reponses_qcm: this.selectedOptions,
      reponses_code: this.codeAnswers,
      reponses_ouvertes: this.shortAnswers
    };
  
    console.log("Soumission de la copie numérique :", payloadCopie);
  
    this.compositionService.creerCopie(payloadCopie).subscribe({
      next: (response) => {
        if (response.success && response.message && response.message.id_copie_numerique) {
          const idCopie = response.message.id_copie_numerique;
  
          console.log("Copie créée avec ID :", idCopie);
  
          // Appel de la correction après la création de la copie
          this.compositionService.corrigerCopie(idCopie).subscribe({
            next: (res) => {
              if (res.success) {
                alert("Épreuve soumise et corrigée avec succès. Note : " + res.message.note_finale);
                console.log("Résultat de la correction :", res.message);
              } else {
                alert("La copie a été soumise mais la correction a échoué.");
              }
            },
            error: (err) => {
              console.error("Erreur lors de la correction :", err);
              alert("Erreur lors de la correction de la copie.");
            }
          });
  
        } else {
          alert("Échec lors de la création de la copie.");
        }
      },
      error: (error) => {
        console.error("Erreur soumission copie :", error);
        alert("Erreur lors de la soumission de l'épreuve.");
      }
    });
  }
  

  // Gestion des erreurs HTTP
  private handleError(err: any): string {
    if (err.status === 0) {
      return 'Connexion au serveur impossible.';
    } else if (err.status >= 400 && err.status < 500) {
      return `Erreur client (${err.status}): ${err.error?.message || err.error?.detail || err.statusText}`;
    } else if (err.status >= 500) {
      return `Erreur serveur (${err.status}): ${err.error?.message || err.error?.detail || err.statusText}`;
    }
    return 'Erreur inconnue.';
  }
}
