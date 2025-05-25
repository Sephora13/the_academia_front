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

interface Option {
  id_option: number;
  nom_option: string;
}

interface Professeur {
  id_professeur: number;
  nom_professeur: string;
}

// Interface pour les affectations, enrichie pour le suivi
interface AffectationEpreuveForSuivi {
  id_affectation: number;
  id_session: number;
  nom_session: string; // Ajout\u00E9 pour l'affichage direct
  id_matiere: number;
  nom_matiere: string;
  id_option: number;
  nom_option: string;
  id_professeur: number;
  nom_professeur: string;
  date_limite_soumission: Date;
  date_examen_etudiant: Date;
  heure_debut_examen: string;
  heure_fin_examen: string;
  statut_affectation: 'Planifiée' | 'Assignée' | 'Terminée' | 'Annulée';
  commentaires?: string;
  date_remise_professeur: Date | null; // Date r\u00E9elle de remise par le professeur
  statut_remise?: 'Remis \u00E0 temps' | 'Remis en retard' | 'Non remis'; // Statut calcul\u00E9
  created_at: Date;
  updated_at: Date;
}

// --- End of interface definitions ---


@Component({
  selector: 'app-suivre-depot',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    DashboardExamServiceComponent
  ],
  templateUrl: './suivre-depot.component.html',
  styleUrls: ['./suivre-depot.component.css']
})
export class SuivreDepotComponent implements OnInit {
  suiviDepots: AffectationEpreuveForSuivi[] = [];
  filteredSuiviDepots: AffectationEpreuveForSuivi[] = [];
  searchTerm: string = '';
  selectedSessionId: number | null = null;
  selectedStatutRemise: 'Remis \u00E0 temps' | 'Remis en retard' | 'Non remis' | null = null;

  sessions: SessionExamenRead[] = []; // Pour le filtre de session
  availableStatutRemise: ('Remis \u00E0 temps' | 'Remis en retard' | 'Non remis')[] = ['Remis \u00E0 temps', 'Remis en retard', 'Non remis'];

  private toastTimeout: any;

  // Donn\u00E9es simul\u00E9es (doivent \u00EAtre coh\u00E9rentes avec les affectations et sessions)
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

  private mockAffectationsForSuivi: AffectationEpreuveForSuivi[] = [
    {
      id_affectation: 1,
      id_session: 1, nom_session: 'Session Hiver 2024',
      id_matiere: 1, nom_matiere: 'Mathématiques',
      id_option: 1, nom_option: 'Sciences',
      id_professeur: 101, nom_professeur: 'Dr. Dupont',
      date_limite_soumission: new Date('2024-01-20T23:59:59Z'),
      date_examen_etudiant: new Date('2024-01-22T09:00:00Z'),
      heure_debut_examen: '09:00',
      heure_fin_examen: '11:00',
      statut_affectation: 'Terminée',
      commentaires: 'Examen final',
      date_remise_professeur: new Date('2024-01-19T15:30:00Z'), // Remis \u00E0 temps
      created_at: new Date('2023-12-01T10:00:00Z'),
      updated_at: new Date('2024-01-19T15:30:00Z')
    },
    {
      id_affectation: 2,
      id_session: 1, nom_session: 'Session Hiver 2024',
      id_matiere: 3, nom_matiere: 'Informatique',
      id_option: 1, nom_option: 'Sciences',
      id_professeur: 102, nom_professeur: 'Mme. Martin',
      date_limite_soumission: new Date('2024-01-23T23:59:59Z'),
      date_examen_etudiant: new Date('2024-01-24T14:00:00Z'),
      heure_debut_examen: '14:00',
      heure_fin_examen: '16:00',
      statut_affectation: 'Terminée',
      commentaires: 'Projet de programmation',
      date_remise_professeur: new Date('2024-01-24T10:00:00Z'), // Remis en retard
      created_at: new Date('2023-12-05T10:00:00Z'),
      updated_at: new Date('2024-01-24T10:00:00Z')
    },
    {
      id_affectation: 3,
      id_session: 2, nom_session: 'Session Printemps 2025',
      id_matiere: 2, nom_matiere: 'Physique',
      id_option: 1, nom_option: 'Sciences',
      id_professeur: 103, nom_professeur: 'M. Dubois',
      date_limite_soumission: new Date('2025-03-10T23:59:59Z'),
      date_examen_etudiant: new Date('2025-03-12T09:00:00Z'),
      heure_debut_examen: '09:00',
      heure_fin_examen: '12:00',
      statut_affectation: 'Planifiée',
      commentaires: 'Examen th\u00E9orique',
      date_remise_professeur: null, // Non remis
      created_at: new Date('2024-12-01T10:00:00Z'),
      updated_at: new Date('2024-12-01T10:00:00Z')
    },
    {
      id_affectation: 4,
      id_session: 3, nom_session: 'Session \u00C9t\u00E9 2024',
      id_matiere: 4, nom_matiere: 'Chimie',
      id_option: 1, nom_option: 'Sciences',
      id_professeur: 104, nom_professeur: 'Mlle. Lefevre',
      date_limite_soumission: new Date('2024-07-05T23:59:59Z'),
      date_examen_etudiant: new Date('2024-07-07T10:00:00Z'),
      heure_debut_examen: '10:00',
      heure_fin_examen: '13:00',
      statut_affectation: 'Assign\u00E9e',
      commentaires: 'Examen pratique',
      date_remise_professeur: null, // Non remis
      created_at: new Date('2024-05-01T10:00:00Z'),
      updated_at: new Date('2024-06-15T10:00:00Z')
    },
    {
      id_affectation: 5,
      id_session: 3, nom_session: 'Session \u00C9t\u00E9 2024',
      id_matiere: 5, nom_matiere: 'Fran\u00E7ais',
      id_option: 2, nom_option: 'Litt\u00E9raire',
      id_professeur: 101, nom_professeur: 'Dr. Dupont',
      date_limite_soumission: new Date('2024-07-08T23:59:59Z'),
      date_examen_etudiant: new Date('2024-07-09T09:00:00Z'),
      heure_debut_examen: '09:00',
      heure_fin_examen: '11:00',
      statut_affectation: 'Assign\u00E9e',
      commentaires: 'Rapport de lecture',
      date_remise_professeur: new Date('2024-07-08T10:00:00Z'), // Remis \u00E0 temps
      created_at: new Date('2024-05-05T10:00:00Z'),
      updated_at: new Date('2024-07-08T10:00:00Z')
    }
  ];
  private nextSuiviId = 6; // Pour les IDs de suivi si n\u00E9cessaire, mais on utilise id_affectation ici

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSuiviDepots();
  }

  /**
   * Charge les donn\u00E9es de suivi des d\u00E9p\u00F4ts et pr\u00E9-calcule le statut de remise.
   */
  loadSuiviDepots(): void {
    forkJoin({
      sessions: this._get_all_sessions_examen(),
      affectations: this._get_all_affectations_for_suivi()
    }).subscribe({
      next: (results) => {
        this.sessions = results.sessions;
        this.suiviDepots = results.affectations.map(affectation => {
          // Calculer le statut de remise pour chaque affectation
          const statutRemise = this.calculateStatutRemise(affectation);
          return { ...affectation, statut_remise: statutRemise };
        });
        this.filterSuiviDepots(); // Appliquer le filtre initial
        this.showToast('Info', 'Données de suivi chargées (simulé).', 'info');
      },
      error: (err) => {
        console.error('Erreur lors du chargement des donn\u00E9es de suivi (simulé) :', err);
        this.showToast('Erreur', 'Impossible de charger les donn\u00E9es de suivi (simulé).', 'danger');
      }
    });
  }

  /**
   * Calcule le statut de remise d'une affectation.
   * @param affectation L'affectation \u00E0 \u00E9valuer.
   * @returns Le statut de remise ('Remis \u00E0 temps', 'Remis en retard', 'Non remis').
   */
  calculateStatutRemise(affectation: AffectationEpreuveForSuivi): 'Remis \u00E0 temps' | 'Remis en retard' | 'Non remis' {
    if (!affectation.date_remise_professeur) {
      return 'Non remis';
    }

    const dateRemise = new Date(affectation.date_remise_professeur);
    const dateLimite = new Date(affectation.date_limite_soumission);

    // Pour comparer uniquement la date (ignorer l'heure de la date limite si elle est 23:59:59)
    dateLimite.setHours(23, 59, 59, 999);

    if (dateRemise <= dateLimite) {
      return 'Remis \u00E0 temps';
    } else {
      return 'Remis en retard';
    }
  }

  /**
   * Filtre les entr\u00E9es de suivi affich\u00E9es en fonction du terme de recherche, de la session et du statut de remise.
   */
  filterSuiviDepots(): void {
    let tempSuivi = [...this.suiviDepots];

    // Filtrer par session s\u00E9lectionn\u00E9e
    if (this.selectedSessionId !== null) {
      tempSuivi = tempSuivi.filter(suivi => suivi.id_session === this.selectedSessionId);
    }

    // Filtrer par statut de remise s\u00E9lectionn\u00E9
    if (this.selectedStatutRemise !== null) {
      tempSuivi = tempSuivi.filter(suivi => suivi.statut_remise === this.selectedStatutRemise);
    }

    // Filtrer par terme de recherche
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempSuivi = tempSuivi.filter(suivi =>
        suivi.nom_session.toLowerCase().includes(lowerCaseSearchTerm) ||
        suivi.nom_matiere.toLowerCase().includes(lowerCaseSearchTerm) ||
        suivi.nom_professeur.toLowerCase().includes(lowerCaseSearchTerm) ||
        (suivi.commentaires && suivi.commentaires.toLowerCase().includes(lowerCaseSearchTerm)) ||
        suivi.statut_remise?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    this.filteredSuiviDepots = tempSuivi;
  }

  /**
   * Simule le marquage d'une \u00E9preuve comme "remise".
   * Dans un vrai syst\u00E8me, cela appellerait un service pour mettre \u00E0 jour la base de donn\u00E9es.
   * @param idSuivi L'ID de l'entr\u00E9e de suivi (ici, id_affectation).
   */
  markAsRemis(idSuivi: number): void {
    // Simuler la mise \u00E0 jour
    this._mark_affectation_as_remis(idSuivi).subscribe({
      next: (updatedSuivi) => {
        if (updatedSuivi) {
          this.showToast('Succès', 'Épreuve marquée comme remise !', 'success');
          this.loadSuiviDepots(); // Recharger les donn\u00E9es pour rafra\u00EEchir le statut
        } else {
          this.showToast('Erreur', 'Impossible de marquer l\'\u00E9preuve comme remise.', 'danger');
        }
      },
      error: (err) => {
        console.error('Erreur lors du marquage comme remis (simulé) :', err);
        this.showToast('Erreur', 'Une erreur est survenue lors du marquage (simulé).', 'danger');
      }
    });
  }

  /**
   * Redirige vers la page de d\u00E9tails de l'affectation si n\u00E9cessaire.
   * @param idAffectation L'ID de l'affectation.
   */
  viewAffectationDetails(idAffectation: number): void {
    // Exemple de navigation, \u00E0 adapter \u00E0 votre routage r\u00E9el
    // this.router.navigate(['/affectation-details', idAffectation]);
    this.showToast('Info', `Redirection vers les d\u00E9tails de l'affectation ${idAffectation} (non impl\u00E9ment\u00E9).`, 'info');
    console.log(`Naviguer vers les d\u00E9tails de l'affectation ${idAffectation}`);
  }

  /**
   * Affiche un message Toast.
   * @param title Titre du Toast.
   * @param message Contenu du message.
   * @param type Type de message pour le style (success, danger, info).
   */
  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('suivreDepotToast');
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
    const toastElement = document.getElementById('suivreDepotToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  // --- M\u00E9thodes de simulation du service ---

  private _get_all_sessions_examen(): Observable<SessionExamenRead[]> {
    return of([...this.mockSessions]).pipe(delay(300));
  }

  private _get_all_affectations_for_suivi(): Observable<AffectationEpreuveForSuivi[]> {
    return of([...this.mockAffectationsForSuivi]).pipe(delay(500));
  }

  private _mark_affectation_as_remis(idAffectation: number): Observable<AffectationEpreuveForSuivi | null> {
    const index = this.mockAffectationsForSuivi.findIndex(a => a.id_affectation === idAffectation);
    if (index > -1) {
      const updatedAffectation = {
        ...this.mockAffectationsForSuivi[index],
        date_remise_professeur: new Date(), // Marque avec la date/heure actuelle
        updated_at: new Date()
      };
      this.mockAffectationsForSuivi[index] = updatedAffectation;
      return of(updatedAffectation).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }
}
