import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

// Components
import { HeaderComponent } from '../header/header.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component';

// Services
import { CopieNumeriqueService } from '../services/copie/copie-numerique.service';
import { EpreuveService } from '../services/epreuve/epreuve.service';
import { SessionExamensService } from '../services/session/session-examens.service';
import { MatiereService } from '../services/matiere/matiere.service';
import { GetPasswordService } from '../services/get_info/get-password.service';
import { AffectationEpreuve } from '../services/affectation/affectation-epreuve.service';
import { AffectationEpreuveService} from '../services/affectation/affectation-epreuve.service';


// Interfaces
interface SessionExamenRead {
  id_session_examen: number;
  nom: string;
  date_debut: Date;
  date_fin: Date;
  statut: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
  created_at: Date;
  updated_at: Date;
}

interface EpreuveCorrigeeRead {
  id_epreuve: number;
  titre: string;
  date_composition: Date;
  id_session: number;
  nom_session: string;
  id_matiere: number;
  nom_matiere: string;
  id_professeur: number;
  nom_professeur: string;
  statut_correction: 'Corrigée' | 'En attente';
}

interface Epreuve {
  id_epreuve: number;
  titre: string;
  created_at: string;
}

@Component({
  selector: 'app-resultat-composition',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    DashboardExamServiceComponent
  ],
  templateUrl: './resultats-epreuve.component.html',
  styleUrls: ['./resultats-epreuve.component.css']
})
export class ResultatsEpreuveComponent implements OnInit {
  epreuvesCorrigees: EpreuveCorrigeeRead[] = [];
  filteredEpreuvesCorrigees: EpreuveCorrigeeRead[] = [];
  searchTerm: string = '';
  selectedSessionId: number | null = null;
  selectedStatutCorrection: 'Corrigée' | 'En attente' | null = null;

  sessions: SessionExamenRead[] = [];
  availableStatutCorrection: ('Corrigée' | 'En attente')[] = ['Corrigée', 'En attente'];
  
  private toastTimeout: any;

  showResultsModal: boolean = false;
  selectedEpreuve: EpreuveCorrigeeRead | null = null;
  selectedEpreuveResults: any[] = [];
  affectations: AffectationEpreuve[] = [];
  professeurs: any[] = [];
  matieres: any[] = [];

  constructor(
    private router: Router,
    private copieService: CopieNumeriqueService,
    private epreuveService: EpreuveService,
    private sessionService: SessionExamensService,
    private matiereService: MatiereService,
    private getPasswordService: GetPasswordService,
    private affectationEpreuveService: AffectationEpreuveService
  ) { }

  ngOnInit(): void {
    this.loadEpreuvesCorrigees();
    console.log('Epreuves corrigées chargées :', this.epreuvesCorrigees);
    console.log('Epreuves filtrées :', this.filteredEpreuvesCorrigees);

  }

  // Mettre à jour la fonction loadEpreuvesCorrigees()
  loadEpreuvesCorrigees(): void {
    forkJoin({
      affectations: this.affectationEpreuveService.listerAffectations(),
      epreuves: this.epreuveService.lireEpreuves(),
      sessions: this.sessionService.listerSessions(),
      matieres: this.matiereService.lireMatieres(),
      professeurs: this.getPasswordService.recuProf()
    }).subscribe({
      next: (results) => {
        const affectations = results.affectations.message;
        const epreuves = results.epreuves.message;
        const sessions = results.sessions.message;
        const matieres = results.matieres.message;
        const professeurs = results.professeurs;

        this.affectations = affectations;
        this.matieres = matieres;
        this.professeurs = professeurs;

        const epreuvesCorrigeesIds = affectations
          .filter(a => a.id_epreuve !== null && a.id_epreuve !== undefined)
          .map(a => a.id_epreuve);

          this.epreuvesCorrigees = epreuves
          .filter((e: any) => epreuvesCorrigeesIds.includes(e.id_epreuve))
          .map((epreuve: any) => {
            const affectation = affectations.find((a: any) => a.id_epreuve === epreuve.id_epreuve);
            const session = sessions.find((s: any) => s.id_session_examen === affectation?.id_session_examen);
            const matiere = matieres.find((m: any) => m.id_matiere === affectation?.id_matiere);
            const professeur = professeurs.find((p: any) => p.id === affectation?.id_professeur);
        
            return {
              id_epreuve: epreuve.id_epreuve,
              titre: epreuve.titre,
              date_composition: new Date(epreuve.created_at),
              id_session: session?.id_session_examen || 0,
              nom_session: session?.nom_session || 'Inconnue',
              id_matiere: affectation?.id_matiere ?? 0,
              nom_matiere: matiere?.nom_matiere || 'Inconnue',
              id_professeur: affectation?.id_professeur ?? 0,
              nom_professeur: professeur ? `${professeur.nom} ${professeur.prenom}` : 'Inconnu',
              statut_correction: 'Corrigée' as const
            } satisfies EpreuveCorrigeeRead;
          });
        

        this.sessions = sessions.map((s: any) => ({
          id_session_examen: s.id_session_examen,
          nom: s.nom_session,
          date_debut: new Date(s.date_debut_session),
          date_fin: new Date(s.date_fin_session),
          statut: s.statut_session,
          created_at: new Date(s.created_at),
          updated_at: new Date(s.updated_at)
        }));

        this.filterEpreuvesCorrigees();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  
  filterEpreuvesCorrigees(): void {
    let tempEpreuves = [...this.epreuvesCorrigees];

    // Filtrer par session sélectionnée
    if (this.selectedSessionId !== null) {
      tempEpreuves = tempEpreuves.filter(epreuve => epreuve.id_session === this.selectedSessionId);
    }

    // Filtrer par statut de correction sélectionné
    if (this.selectedStatutCorrection !== null) {
      tempEpreuves = tempEpreuves.filter(epreuve => epreuve.statut_correction === this.selectedStatutCorrection);
    }

    // Filtrer par terme de recherche
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempEpreuves = tempEpreuves.filter(epreuve =>
        epreuve.titre.toLowerCase().includes(lowerCaseSearchTerm) ||
        epreuve.nom_matiere.toLowerCase().includes(lowerCaseSearchTerm) ||
        epreuve.nom_session.toLowerCase().includes(lowerCaseSearchTerm) ||
        epreuve.nom_professeur.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    this.filteredEpreuvesCorrigees = tempEpreuves;
  }

  openResultsModal(epreuve: EpreuveCorrigeeRead): void {
    this.router.navigate(['/resultats-epreuve-details', epreuve.id_epreuve]);
  }

  getSessionName(id_session: number): string {
    const session = this.sessions.find(s => s.id_session_examen === id_session);
    return session?.nom || 'Inconnue';
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('resultatCompositionToast');
    if (toastElement) {
      const toastTitleElement = toastElement.querySelector('.toast-title');
      const toastMessageElement = toastElement.querySelector('.toast-message');

      if (toastTitleElement && toastMessageElement) {
        toastTitleElement.textContent = title;
        toastMessageElement.textContent = message;

        const header = toastElement.querySelector('.toast-header-bg') as HTMLElement;
        const body = toastElement.querySelector('.toast-body-bg') as HTMLElement;

        header.classList.remove('bg-green-700', 'bg-red-700', 'bg-blue-700');
        body.classList.remove('bg-green-800', 'bg-red-800', 'bg-blue-800');

        if (type === 'success') {
          header.classList.add('bg-green-700');
          body.classList.add('bg-green-800');
        } else if (type === 'danger') {
          header.classList.add('bg-red-700');
          body.classList.add('bg-red-800');
        } else if (type === 'info') {
          header.classList.add('bg-blue-700');
          body.classList.add('bg-blue-800');
        }

        toastElement.classList.remove('opacity-0', 'pointer-events-none');
        toastElement.classList.add('opacity-100');

        if (this.toastTimeout) {
          clearTimeout(this.toastTimeout);
        }
        this.toastTimeout = setTimeout(() => {
          this.hideToast();
        }, 3000);
      }
    }
  }

  hideToast(): void {
    const toastElement = document.getElementById('resultatCompositionToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}