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
  user: { id: number, nom: string, prenom: string } | null = null;
  examInfo: any = {};
  id_epreuve: number = 0;

  partie1: any[] = []; // QCM
  partie2: any[] = []; // Questions de Code
  partie3: any[] = []; // Réponses Courtes

  selectedOptions: { [key: number]: string } = {};
  codeAnswers: string[] = [];
  shortAnswers: string[] = [];

  @ViewChildren("editor") codeEditors!: QueryList<ElementRef>;

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

  selectOption(questionId: number, option: string) {
    this.selectedOptions[questionId] = option;
  }

  saveShortAnswer(index: number, event: Event) {
    const target = event.target as HTMLTextAreaElement | null;
    if (target) {
      this.shortAnswers[index] = target.value;
    }
  }

  submitExam() {
    this.user = this.auth.getUserInfo2();
    if (!this.user) {
      console.log("Utilisateur non authentifié.");
      return;
    }

    const payloadCopie = {
      id_etudiant: this.user.id,
      id_epreuve: this.id_epreuve,
      reponses_qcm: this.selectedOptions,
      reponses_code: this.codeAnswers,
      reponses_courtes: this.shortAnswers
    };

    console.log("Soumission de la copie numérique :", payloadCopie);

    this.compositionService.soumettreCopie(payloadCopie).subscribe({
      next: (res) => {
        console.log("✅ Copie soumise avec succès", res);
      },
      error: (err) => {
        console.error("❌ Erreur lors de la soumission de la copie :", err);
      }
    });
  }

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
