import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CopieNumeriqueService } from '../services/copie/copie-numerique.service';
import { EpreuveService } from '../services/epreuve/epreuve.service';
import { SessionExamensService } from '../services/session/session-examens.service';
import { MatiereService } from '../services/matiere/matiere.service';
import { GetPasswordService } from '../services/get_info/get-password.service';
import { AffectationEpreuveService } from '../services/affectation/affectation-epreuve.service';

@Component({
  selector: 'app-resultats-epreuve-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultats-epreuve-details.component.html',
  styleUrls: ['./resultats-epreuve-details.component.css']
})
export class ResultatsEpreuveDetailsComponent implements OnInit {
  epreuveId!: number;
  epreuve: any;
  session: any;
  matiere: any;
  professeur: any;
  resultats: any[] = [];
  isLoading = true;
  average = 0;
  successRate = 0;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private copieService: CopieNumeriqueService,
    private epreuveService: EpreuveService,
    private sessionService: SessionExamensService,
    private matiereService: MatiereService,
    private getPasswordService: GetPasswordService,
    private affectationService: AffectationEpreuveService,
  ) {}

  ngOnInit(): void {
    this.epreuveId = +this.route.snapshot.paramMap.get('id')!;
    this.loadResults();
  }

  loadResults(): void {
    forkJoin({
      epreuve: this.epreuveService.lireEpreuve(this.epreuveId),
      copies: this.copieService.lireToutesLesCopies(),
      sessions: this.sessionService.listerSessions(),
      matieres: this.matiereService.lireMatieres(),
      professeurs: this.getPasswordService.recuProf(),
      affectations: this.affectationService.listerAffectations(),
      etudiants: this.getPasswordService.recuStudent()
    }).subscribe({
      next: (results) => {
        this.epreuve = results.epreuve?.message;
        const copies = Array.isArray(results.copies.message[0]) ? results.copies.message[0] : results.copies.message;
        const affectation = results.affectations.message.find((a: any) => a.id_epreuve === this.epreuveId);

        this.session = results.sessions.message.find((s: any) => s.id_session_examen === affectation?.id_session_examen);
        this.matiere = results.matieres.message.find((m: any) => m.id_matiere === affectation?.id_matiere);
        this.professeur = results.professeurs.find((p: any) => p.id === affectation?.id_professeur);

        const epreuveCopies = copies.filter((c: any) => c.id_epreuve === this.epreuveId && c.statut === true);

        const etudiants = Array.isArray(results.etudiants) ? results.etudiants : results.etudiants?.message || [];

        this.resultats = epreuveCopies.map(copie => {
          const etudiant = etudiants.find((e: any) => e.id === copie.id_etudiant);
          return {
            id_etudiant: copie.id_etudiant,
            matricule_etudiant: etudiant.matricule,
            nom_etudiant: etudiant ? `${etudiant.nom} ${etudiant.prenom}` : `ID ${copie.id_etudiant}`,
            note_obtenue: copie.note_finale || 0
          };
        }).sort((a, b) => b.note_obtenue - a.note_obtenue);

        this.calculateStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données :', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    if (this.resultats.length === 0) return;

    const total = this.resultats.reduce((sum, result) => sum + result.note_obtenue, 0);
    this.average = total / this.resultats.length;

    const passed = this.resultats.filter(r => r.note_obtenue >= 10).length;
    this.successRate = (passed / this.resultats.length) * 100;
  }

  getStatusClass(note: number): string {
    return note >= 10 ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
  }

  getStatusText(note: number): string {
    return note >= 10 ? 'Réussi' : 'Échec';
  }

  viewCopie(etudiantId: number): void {
    console.log(`Voir copie de l'étudiant ${etudiantId}`);
  }
}
