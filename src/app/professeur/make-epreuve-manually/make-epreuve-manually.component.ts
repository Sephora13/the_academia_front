import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { MakeEpreuveByIaService } from '../../services/professeur/make-epreuve-by-ia.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthentificationService } from '../../services/authentification/authentification.service';
import { AffectationEpreuveService } from '../../services/affectation/affectation-epreuve.service';

@Component({
  selector: 'app-make-epreuve-manually',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './make-epreuve-manually.component.html',
  styleUrls: ['./make-epreuve-manually.component.css']
})
export class MakeEpreuveManuallyComponent implements OnInit {
  
  user: { id: number, nom: string, prenom: string } | null = null;
  epreuveFile: File | null = null;
  fileNameDisplay: string = 'Aucun fichier choisi';
  loading = false;
  message: string = '';
  isSaveButtonEnabled = false;
  analyzedEpreuveText: string | null = null;
  professeurId: number | null = null;
  idAffectation: number | null = null;

  constructor(
    private makeEpreuveService: MakeEpreuveByIaService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthentificationService,
    private affectationService: AffectationEpreuveService,
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    this.idAffectation = +this.route.snapshot.paramMap.get('idAffectation')!;

    if (this.user && this.user.id) {
      this.professeurId = this.user.id;
      console.log("ID Professeur récupéré:", this.professeurId);
    } else {
      console.warn("Impossible de récupérer l'ID du professeur. L'utilisateur n'est peut-être pas connecté.");
      this.message = "Veuillez vous connecter pour importer une épreuve.";
    }
  }

  handleFileInput(event: any): void {
    const files = event.target.files;

    if (files && files.length > 0) {
      this.epreuveFile = files[0];
      this.fileNameDisplay = this.epreuveFile?.name || 'Aucun fichier choisi';
      this.isSaveButtonEnabled = false;
      this.analyzedEpreuveText = null;
      this.message = '';
      this.analyzeFile();
    } else {
      this.resetFileInput();
    }
  }

  resetFileInput(): void {
    this.epreuveFile = null;
    this.fileNameDisplay = 'Aucun fichier choisi';
    this.isSaveButtonEnabled = false;
    this.analyzedEpreuveText = null;
    this.message = '';
  }

  analyzeFile(): void {
    if (!this.epreuveFile) {
      this.message = "Aucun fichier à analyser.";
      return;
    }

    this.loading = true;
    this.message = 'Analyse du fichier en cours... Patientez un moment.';

    this.makeEpreuveService.analyzeAndTagEpreuve(this.epreuveFile)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de l\'appel à analyzeAndTagEpreuve:', error);
          this.message = 'Erreur lors de l\'analyse : ' + (error.error?.message || error.message || 'Une erreur inconnue est survenue.');
          this.loading = false;
          this.isSaveButtonEnabled = false;
          return of(null);
        })
      )
      .subscribe(response => {
        this.loading = false;

        if (response && response.success) {
          this.analyzedEpreuveText = response.message?.epreuve_balisee;

          if (this.analyzedEpreuveText) {
            this.isSaveButtonEnabled = true;
            this.message = 'Analyse réussie. Vous pouvez maintenant enregistrer l’épreuve.';
          } else {
            console.warn("❌ Texte balisé non reçu malgré une réponse 'success'.");
            this.message = 'L\'analyse semble avoir réussi, mais aucun texte balisé n\'a été reçu.';
            this.isSaveButtonEnabled = false;
          }
        } else if (response && !response.success) {
          this.message = 'L\'analyse a échoué : ' + (response.message || 'Raison inconnue.');
          this.isSaveButtonEnabled = false;
        }
      });
  }

  /**
   * Appelle le service pour enregistrer l'épreuve analysée.
   */
  saveAnalyzedEpreuve(): void {
    console.log("saveAnalyzedEpreuve appelée.");
    console.log("État au début de saveAnalyzedEpreuve:",
      "isSaveButtonEnabled:", this.isSaveButtonEnabled,
      "loading:", this.loading,
      "analyzedEpreuveText présent:", !!this.analyzedEpreuveText,
      "professeurId présent:", !!this.professeurId
    );

    if (!this.analyzedEpreuveText || this.professeurId === null) {
      this.message = "L'épreuve n'a pas été analysée correctement ou l'ID du professeur est manquant. Veuillez réessayer l'analyse.";
      console.error("Tentative d'enregistrement sans texte analysé ou ID professeur.");
      this.isSaveButtonEnabled = false;
      return;
    }

    this.loading = true;
    this.message = 'Enregistrement en cours... Patientez un moment.';
    this.isSaveButtonEnabled = false;

    const saveData = {
      texte_epreuve: this.analyzedEpreuveText,
      id_professeur: this.professeurId
    };

    this.makeEpreuveService.saveEpreuveManually(saveData)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de l\'appel à saveEpreuveManually:', error);
          this.message = 'Erreur lors de l\'enregistrement : ' + (error.error?.message || error.message || 'Une erreur inconnue est survenue.');
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(response => {
        this.loading = false;

        if (response && response.success) {
          console.log(response); 
          this.message = 'Épreuve enregistrée avec succès !';
          const epreuveId = response.message?.id_epreuve;
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
        } else if (response && !response.success) {
          this.message = 'L\'enregistrement a échoué : ' + (response.message || 'Raison inconnue.');
        }
      });
  }
}
