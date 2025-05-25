import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable, of, forkJoin } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Router } from '@angular/router';

// Declarations for parent components
import { HeaderComponent } from '../header/header.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component';

// --- Interface definitions for (simulated) data ---
interface SessionExamenRead {
  id_session: number;
  nom: string;
  date_debut: Date;
  date_fin: Date;
  statut: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
  created_at: Date;
  updated_at: Date;
}

interface Matiere {
  id_matiere: number;
  nom_matiere: string;
}

interface Professeur {
  id_professeur: number;
  nom_professeur: string;
}

// Repr\u00E9sente une \u00E9preuve qui a \u00E9t\u00E9 compos\u00E9e et corrig\u00E9e
interface EpreuveCorrigeeRead {
  id_epreuve: number;
  titre: string;
  date_composition: Date;
  duree: number; // en minutes
  id_session: number;
  nom_session: string;
  id_matiere: number;
  nom_matiere: string;
  id_professeur: number;
  nom_professeur: string;
  statut_correction: 'Corrigée' | 'En attente';
  created_at: Date;
  updated_at: Date;
}

// R\u00E9sultat d'un \u00E9tudiant pour une \u00E9preuve donn\u00E9e
interface EtudiantResultat {
  id_etudiant: number;
  nom_etudiant: string;
  note_obtenue: number; // sur 20
}

// --- End of interface definitions ---


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

  sessions: SessionExamenRead[] = []; // Pour le filtre de session
  availableStatutCorrection: ('Corrigée' | 'En attente')[] = ['Corrigée', 'En attente'];

  showResultsModal: boolean = false;
  selectedEpreuve: EpreuveCorrigeeRead | null = null;
  selectedEpreuveResults: EtudiantResultat[] = [];

  private toastTimeout: any;

  // Donn\u00E9es simul\u00E9es
  private mockSessions: SessionExamenRead[] = [
    {
      id_session: 1,
      nom: 'Session Hiver 2024',
      date_debut: new Date('2024-01-15T09:00:00Z'),
      date_fin: new Date('2024-01-25T17:00:00Z'),
      statut: 'Terminée',
      created_at: new Date('2023-10-01T10:00:00Z'),
      updated_at: new Date('2024-01-25T18:00:00Z')
    },
    {
      id_session: 2,
      nom: 'Session Printemps 2025',
      date_debut: new Date('2025-03-01T09:00:00Z'),
      date_fin: new Date('2025-03-15T17:00:00Z'),
      statut: 'Planifiée',
      created_at: new Date('2024-11-01T10:00:00Z'),
      updated_at: new Date('2024-11-01T10:00:00Z')
    },
    {
      id_session: 3,
      nom: 'Session Été 2024',
      date_debut: new Date('2024-07-01T09:00:00Z'),
      date_fin: new Date('2024-07-10T17:00:00Z'),
      statut: 'En cours',
      created_at: new Date('2024-04-15T10:00:00Z'),
      updated_at: new Date('2024-07-05T11:30:00Z')
    },
  ];

  private mockEpreuvesCorrigees: EpreuveCorrigeeRead[] = [
    {
      id_epreuve: 101,
      titre: 'Examen Final - Algèbre',
      date_composition: new Date('2024-01-22T09:00:00Z'),
      duree: 120,
      id_session: 1, nom_session: 'Session Hiver 2024',
      id_matiere: 1, nom_matiere: 'Mathématiques',
      id_professeur: 101, nom_professeur: 'Dr. Dupont',
      statut_correction: 'Corrigée',
      created_at: new Date('2024-01-25T10:00:00Z'),
      updated_at: new Date('2024-01-26T14:00:00Z')
    },
    {
      id_epreuve: 102,
      titre: 'Projet - Programmation Orientée Objet',
      date_composition: new Date('2024-01-24T14:00:00Z'),
      duree: 180,
      id_session: 1, nom_session: 'Session Hiver 2024',
      id_matiere: 3, nom_matiere: 'Informatique',
      id_professeur: 102, nom_professeur: 'Mme. Martin',
      statut_correction: 'Corrigée',
      created_at: new Date('2024-01-26T10:00:00Z'),
      updated_at: new Date('2024-01-27T11:00:00Z')
    },
    {
      id_epreuve: 103,
      titre: 'Partiel - Mécanique des Fluides',
      date_composition: new Date('2025-03-12T09:00:00Z'),
      duree: 90,
      id_session: 2, nom_session: 'Session Printemps 2025',
      id_matiere: 2, nom_matiere: 'Physique',
      id_professeur: 103, nom_professeur: 'M. Dubois',
      statut_correction: 'En attente', // Pas encore corrig\u00E9e
      created_at: new Date('2025-03-12T12:00:00Z'),
      updated_at: new Date('2025-03-12T12:00:00Z')
    },
    {
      id_epreuve: 104,
      titre: 'Examen de Synth\u00E8se - Chimie Organique',
      date_composition: new Date('2024-07-07T10:00:00Z'),
      duree: 150,
      id_session: 3, nom_session: 'Session \u00C9t\u00E9 2024',
      id_matiere: 4, nom_matiere: 'Chimie',
      id_professeur: 104, nom_professeur: 'Mlle. Lefevre',
      statut_correction: 'Corrigée',
      created_at: new Date('2024-07-08T10:00:00Z'),
      updated_at: new Date('2024-07-09T15:00:00Z')
    }
  ];

  private mockResultatsEtudiants: { [key: number]: EtudiantResultat[] } = {
    101: [ // Examen Final - Alg\u00E8bre
      { id_etudiant: 1, nom_etudiant: 'Alice Dubois', note_obtenue: 15.5 },
      { id_etudiant: 2, nom_etudiant: 'Bob Martin', note_obtenue: 9.0 },
      { id_etudiant: 3, nom_etudiant: 'Charlie Bernard', note_obtenue: 12.75 },
      { id_etudiant: 4, nom_etudiant: 'Diana Petit', note_obtenue: 18.25 },
      { id_etudiant: 5, nom_etudiant: 'Eve Lambert', note_obtenue: 7.5 }
    ],
    102: [ // Projet - Programmation Orient\u00E9e Objet
      { id_etudiant: 1, nom_etudiant: 'Alice Dubois', note_obtenue: 17.0 },
      { id_etudiant: 2, nom_etudiant: 'Bob Martin', note_obtenue: 11.5 },
      { id_etudiant: 6, nom_etudiant: 'Frank White', note_obtenue: 14.0 }
    ],
    103: [], // Partiel - M\u00E9canique des Fluides (pas encore de r\u00E9sultats)
    104: [ // Examen de Synth\u00E8se - Chimie Organique
      { id_etudiant: 3, nom_etudiant: 'Charlie Bernard', note_obtenue: 10.0 },
      { id_etudiant: 5, nom_etudiant: 'Eve Lambert', note_obtenue: 13.5 },
      { id_etudiant: 7, nom_etudiant: 'Grace Taylor', note_obtenue: 8.0 }
    ]
  };

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEpreuvesCorrigees();
  }

  /**
   * Charge les donn\u00E9es des \u00E9preuves corrig\u00E9es.
   */
  loadEpreuvesCorrigees(): void {
    forkJoin({
      sessions: this._get_all_sessions_examen(),
      epreuves: this._get_all_corrected_epreuves()
    }).subscribe({
      next: (results) => {
        this.sessions = results.sessions;
        this.epreuvesCorrigees = results.epreuves;
        this.filterEpreuvesCorrigees(); // Appliquer le filtre initial
        this.showToast('Info', 'Épreuves corrigées chargées (simulé).', 'info');
      },
      error: (err) => {
        console.error('Erreur lors du chargement des \u00E9preuves corrig\u00E9es (simulé) :', err);
        this.showToast('Erreur', 'Impossible de charger les \u00E9preuves corrig\u00E9es (simulé).', 'danger');
      }
    });
  }

  /**
   * Filtre les \u00E9preuves corrig\u00E9es affich\u00E9es en fonction des crit\u00E8res de recherche et des filtres.
   */
  filterEpreuvesCorrigees(): void {
    let tempEpreuves = [...this.epreuvesCorrigees];

    // Filtrer par session s\u00E9lectionn\u00E9e
    if (this.selectedSessionId !== null) {
      tempEpreuves = tempEpreuves.filter(epreuve => epreuve.id_session === this.selectedSessionId);
    }

    // Filtrer par statut de correction s\u00E9lectionn\u00E9
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

  /**
   * Ouvre la modale des r\u00E9sultats pour une \u00E9preuve sp\u00E9cifique.
   * @param epreuve L'\u00E9preuve dont on veut afficher les r\u00E9sultats.
   */
  openResultsModal(epreuve: EpreuveCorrigeeRead): void {
    this.selectedEpreuve = epreuve;
    this._get_epreuve_results(epreuve.id_epreuve).subscribe({
      next: (results) => {
        this.selectedEpreuveResults = results;
        this.showResultsModal = true;
        this.showToast('Info', `R\u00E9sultats pour "${epreuve.titre}" charg\u00E9s.`, 'info');
      },
      error: (err) => {
        console.error('Erreur lors du chargement des r\u00E9sultats (simulé) :', err);
        this.showToast('Erreur', 'Impossible de charger les r\u00E9sultats (simulé).', 'danger');
      }
    });
  }

  /**
   * Affiche un message Toast.
   * @param title Titre du Toast.
   * @param message Contenu du message.
   * @param type Type de message pour le style (success, danger, info).
   */
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

  /**
   * Cache le message Toast.
   */
  hideToast(): void {
    const toastElement = document.getElementById('resultatCompositionToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  // --- M\u00E9thodes de simulation du service ---

  private _get_all_sessions_examen(): Observable<SessionExamenRead[]> {
    return of([...this.mockSessions]).pipe(delay(300));
  }

  private _get_all_corrected_epreuves(): Observable<EpreuveCorrigeeRead[]> {
    // Simule le r\u00E9cup\u00E9ration des \u00E9preuves qui ont \u00E9t\u00E9 corrig\u00E9es ou sont en attente
    return of([...this.mockEpreuvesCorrigees]).pipe(delay(500));
  }

  private _get_epreuve_results(id_epreuve: number): Observable<EtudiantResultat[]> {
    // Simule le r\u00E9cup\u00E9ration des r\u00E9sultats pour une \u00E9preuve donn\u00E9e
    const results = this.mockResultatsEtudiants[id_epreuve] || [];
    return of([...results]).pipe(delay(400));
  }
}
