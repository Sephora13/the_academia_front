import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // N\u00E9cessaire pour ngModel
import { Observable, of, forkJoin } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router'; // Pour la navigation


// --- D\u00E9finition des interfaces pour les donn\u00E9es simul\u00E9es ---
interface SessionExamen {
  id_session: number;
  nom: string;
}

interface Matiere {
  id_matiere: number;
  nom_matiere: string;
}

interface EpreuveARendre {
  id_affectation: number; // ID unique de l'affectation
  id_epreuve?: number; // Optionnel, si l'\u00E9preuve a d\u00E9j\u00E0 \u00E9t\u00E9 cr\u00E9\u00E9e et remise
  titre_epreuve: string; // Le titre sugg\u00E9r\u00E9 ou le nom de l'\u00E9preuve
  id_session: number;
  nom_session: string;
  id_matiere: number;
  nom_matiere: string;
  date_limite_soumission: Date;
  statut: 'En attente de cr\u00E9ation' | 'Remise' | 'En retard';
  created_at: Date;
  updated_at: Date;
}

// --- Fin des d\u00E9finitions d'interfaces ---


@Component({
  selector: 'app-epreuve-a-rendre',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
],
  templateUrl: './epreuve-a-rendre.component.html',
  styleUrls: ['./epreuve-a-rendre.component.css']
})
export class EpreuveARendreComponent implements OnInit {
  epreuvesARendre: EpreuveARendre[] = [];
  filteredEpreuvesARendre: EpreuveARendre[] = [];
  searchTerm: string = '';
  selectedSessionId: number | null = null;
  selectedStatut: 'En attente de cr\u00E9ation' | 'Remise' | 'En retard' | null = null;

  sessions: SessionExamen[] = []; // Pour le filtre de session
  availableStatuts: ('En attente de cr\u00E9ation' | 'Remise' | 'En retard')[] = ['En attente de cr\u00E9ation', 'Remise', 'En retard'];

  private toastTimeout: any;

  // Donn\u00E9es simul\u00E9es
  private mockSessions: SessionExamen[] = [
    { id_session: 1, nom: 'Session Hiver 2024' },
    { id_session: 2, nom: 'Session Printemps 2025' },
    { id_session: 3, nom: 'Session \u00C9t\u00E9 2024' },
  ];

  private mockMatieres: Matiere[] = [
    { id_matiere: 1, nom_matiere: 'Math\u00E9matiques' },
    { id_matiere: 2, nom_matiere: 'Physique' },
    { id_matiere: 3, nom_matiere: 'Informatique' },
    { id_matiere: 4, nom_matiere: 'Chimie' },
  ];

  private mockEpreuvesARendre: EpreuveARendre[] = [
    {
      id_affectation: 1,
      titre_epreuve: 'Examen de Fin de Semestre - Alg\u00E8bre Lin\u00E9aire',
      id_session: 1, nom_session: 'Session Hiver 2024',
      id_matiere: 1, nom_matiere: 'Math\u00E9matiques',
      date_limite_soumission: new Date('2024-06-15T23:59:59Z'),
      statut: 'En attente de cr\u00E9ation',
      created_at: new Date('2024-05-20T10:00:00Z'),
      updated_at: new Date('2024-05-20T10:00:00Z')
    },
    {
      id_affectation: 2,
      titre_epreuve: 'Projet de Synth\u00E8se - D\u00E9veloppement Web',
      id_session: 1, nom_session: 'Session Hiver 2024',
      id_matiere: 3, nom_matiere: 'Informatique',
      date_limite_soumission: new Date('2024-05-25T23:59:59Z'),
      statut: 'En retard', // Simule un d\u00E9lai
      created_at: new Date('2024-05-10T14:00:00Z'),
      updated_at: new Date('2024-05-26T09:00:00Z')
    },
    {
      id_affectation: 3,
      id_epreuve: 201, // Supposons que l'\u00E9preuve 201 a \u00E9t\u00E9 cr\u00E9\u00E9e
      titre_epreuve: 'Partiel - Thermodynamique',
      id_session: 2, nom_session: 'Session Printemps 2025',
      id_matiere: 2, nom_matiere: 'Physique',
      date_limite_soumission: new Date('2025-04-10T23:59:59Z'),
      statut: 'Remise',
      created_at: new Date('2025-03-01T09:00:00Z'),
      updated_at: new Date('2025-03-05T16:00:00Z')
    },
    {
      id_affectation: 4,
      titre_epreuve: 'Devoir Surveill\u00E9 - R\u00E9seaux Informatiques',
      id_session: 3, nom_session: 'Session \u00C9t\u00E9 2024',
      id_matiere: 3, nom_matiere: 'Informatique',
      date_limite_soumission: new Date('2024-07-01T23:59:59Z'),
      statut: 'En attente de cr\u00E9ation',
      created_at: new Date('2024-06-10T11:00:00Z'),
      updated_at: new Date('2024-06-10T11:00:00Z')
    }
  ];

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEpreuvesARendre();
  }

  /**
   * Charge les donn\u00E9es des \u00E9preuves \u00E0 rendre.
   */
  loadEpreuvesARendre(): void {
    forkJoin({
      sessions: this._get_all_sessions(),
      matieres: this._get_all_matieres(), // Not directly used in EpreuveARendre, but good to have for consistency
      epreuves: this._get_all_epreuves_a_rendre()
    }).subscribe({
      next: (results) => {
        this.sessions = results.sessions;
        // Enrichir les epreuvesARendre avec les noms de session et mati\u00E8re si n\u00E9cessaire,
        // bien que mes mock data les incluent d\u00E9j\u00E0 pour simplifier.
        this.epreuvesARendre = results.epreuves;
        this.filterEpreuvesARendre(); // Appliquer le filtre initial
        this.showToast('Info', '\u00C9preuves \u00E0 rendre charg\u00E9es (simulé).', 'info');
      },
      error: (err) => {
        console.error('Erreur lors du chargement des \u00E9preuves \u00E0 rendre (simulé) :', err);
        this.showToast('Erreur', 'Impossible de charger les \u00E9preuves \u00E0 rendre (simulé).', 'danger');
      }
    });
  }

  /**
   * Filtre les \u00E9preuves \u00E0 rendre affich\u00E9es en fonction des crit\u00E8res de recherche et des filtres.
   */
  filterEpreuvesARendre(): void {
    let tempEpreuves = [...this.epreuvesARendre];

    // Filtrer par session s\u00E9lectionn\u00E9e
    if (this.selectedSessionId !== null) {
      tempEpreuves = tempEpreuves.filter(epreuve => epreuve.id_session === this.selectedSessionId);
    }

    // Filtrer par statut s\u00E9lectionn\u00E9
    if (this.selectedStatut !== null) {
      tempEpreuves = tempEpreuves.filter(epreuve => epreuve.statut === this.selectedStatut);
    }

    // Filtrer par terme de recherche
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempEpreuves = tempEpreuves.filter(epreuve =>
        epreuve.titre_epreuve.toLowerCase().includes(lowerCaseSearchTerm) ||
        epreuve.nom_matiere.toLowerCase().includes(lowerCaseSearchTerm) ||
        epreuve.nom_session.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    this.filteredEpreuvesARendre = tempEpreuves;
  }

  /**
   * Navigue vers la page de cr\u00E9ation d'\u00E9preuve pour une affectation sp\u00E9cifique.
   * @param idAffectation L'ID de l'affectation pour laquelle cr\u00E9er l'\u00E9preuve.
   */
  goToCreateEpreuve(idAffectation: number): void {
    // Naviguez vers la page de cr\u00E9ation d'\u00E9preuve, en passant l'ID de l'affectation
    // La route '/creer-epreuve' sera \u00E0 d\u00E9finir dans votre module de routage Angular.
    this.router.navigate(['professeur/creer_epreuve', idAffectation]);
    this.showToast('Info', `Redirection vers la cr\u00E9ation de l'\u00E9preuve pour l'affectation #${idAffectation}.`, 'info');
  }

  /**
   * Affiche un message Toast.
   * @param title Titre du Toast.
   * @param message Contenu du message.
   * @param type Type de message pour le style (success, danger, info).
   */
  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('epreuveARendreToast');
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
    const toastElement = document.getElementById('epreuveARendreToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  // --- M\u00E9thodes de simulation du service ---

  private _get_all_sessions(): Observable<SessionExamen[]> {
    return of([...this.mockSessions]).pipe(delay(300));
  }

  private _get_all_matieres(): Observable<Matiere[]> {
    return of([...this.mockMatieres]).pipe(delay(300));
  }

  private _get_all_epreuves_a_rendre(): Observable<EpreuveARendre[]> {
    // Simule la r\u00E9cup\u00E9ration des affectations d'\u00E9preuves pour le professeur connect\u00E9
    return of([...this.mockEpreuvesARendre]).pipe(delay(500));
  }
}
