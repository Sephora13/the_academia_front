import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

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

interface AffectationEpreuveRead {
  id_affectation: number;
  id_session: number;
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
  created_at: Date;
  updated_at: Date;
}

interface AffectationEpreuveCreate {
  id_session: number;
  id_matiere: number;
  id_option: number;
  id_professeur: number;
  date_limite_soumission: Date;
  date_examen_etudiant: Date;
  heure_debut_examen: string;
  heure_fin_examen: string;
  statut_affectation: 'Planifiée' | 'Assignée' | 'Terminée' | 'Annulée';
  commentaires?: string;
}

interface AffectationEpreuveUpdate {
  id_matiere?: number;
  id_option?: number;
  id_professeur?: number;
  date_limite_soumission?: Date;
  date_examen_etudiant?: Date;
  heure_debut_examen?: string;
  heure_fin_examen?: string;
  statut_affectation?: 'Planifiée' | 'Assignée' | 'Terminée' | 'Annulée';
  commentaires?: string;
}
// --- End of interface definitions ---


@Component({
  selector: 'app-planifier-session',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    DashboardExamServiceComponent
  ],
  templateUrl: './planifier-session.component.html',
  styleUrls: ['./planifier-session.component.css']
})
export class PlanifierSessionComponent implements OnInit {
  sessionId: number | null = null;
  session: SessionExamenRead | null = null;
  affectations: AffectationEpreuveRead[] = [];
  filteredAffectations: AffectationEpreuveRead[] = [];
  affectationForm: FormGroup;
  isEditMode: boolean = false;
  currentAffectationId: number | null = null;
  showAffectationModal: boolean = false;
  private toastTimeout: any;

  // IMPORTANT: Définit le critère de tri par défaut ici.
  // Il doit correspondre à une des valeurs d'option dans le HTML.
  sortCriteria: string = 'date_examen_etudiant';

  // Dropdown data (simulated)
  matieres: Matiere[] = [
    { id_matiere: 1, nom_matiere: 'Mathématiques' },
    { id_matiere: 2, nom_matiere: 'Physique' },
    { id_matiere: 3, nom_matiere: 'Informatique' },
    { id_matiere: 4, nom_matiere: 'Chimie' },
    { id_matiere: 5, nom_matiere: 'Français' }
  ];

  options: Option[] = [
    { id_option: 1, nom_option: 'Sciences' },
    { id_option: 2, nom_option: 'Littéraire' },
    { id_option: 3, nom_option: 'Technique' },
    { id_option: 4, nom_option: 'Professionnel' }
  ];

  professeurs: Professeur[] = [
    { id_professeur: 101, nom_professeur: 'Dr. Dupont' },
    { id_professeur: 102, nom_professeur: 'Mme. Martin' },
    { id_professeur: 103, nom_professeur: 'M. Dubois' },
    { id_professeur: 104, nom_professeur: 'Mlle. Lefevre' }
  ];

  availableAffectationStatuses: string[] = ['Planifiée', 'Assignée', 'Terminée', 'Annulée'];

  // Simulated data for sessions and affectations
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

  private mockAffectations: AffectationEpreuveRead[] = [
    {
      id_affectation: 1,
      id_session: 1,
      id_matiere: 1, nom_matiere: 'Mathématiques',
      id_option: 1, nom_option: 'Sciences',
      id_professeur: 101, nom_professeur: 'Dr. Dupont',
      date_limite_soumission: new Date('2024-01-20T23:59:59Z'),
      date_examen_etudiant: new Date('2024-01-22T09:00:00Z'),
      heure_debut_examen: '09:00',
      heure_fin_examen: '11:00',
      statut_affectation: 'Terminée',
      commentaires: 'Examen final',
      created_at: new Date('2023-12-01T10:00:00Z'),
      updated_at: new Date('2024-01-22T12:00:00Z')
    },
    {
      id_affectation: 2,
      id_session: 1,
      id_matiere: 3, nom_matiere: 'Informatique',
      id_option: 1, nom_option: 'Sciences',
      id_professeur: 102, nom_professeur: 'Mme. Martin',
      date_limite_soumission: new Date('2024-01-23T23:59:59Z'),
      date_examen_etudiant: new Date('2024-01-24T14:00:00Z'),
      heure_debut_examen: '14:00',
      heure_fin_examen: '16:00',
      statut_affectation: 'Terminée',
      commentaires: 'Projet de programmation',
      created_at: new Date('2023-12-05T10:00:00Z'),
      updated_at: new Date('2024-01-24T17:00:00Z')
    },
    {
      id_affectation: 3,
      id_session: 2,
      id_matiere: 2, nom_matiere: 'Physique',
      id_option: 1, nom_option: 'Sciences',
      id_professeur: 103, nom_professeur: 'M. Dubois',
      date_limite_soumission: new Date('2025-03-10T23:59:59Z'),
      date_examen_etudiant: new Date('2025-03-12T09:00:00Z'),
      heure_debut_examen: '09:00',
      heure_fin_examen: '12:00',
      statut_affectation: 'Planifiée',
      commentaires: 'Examen théorique',
      created_at: new Date('2024-12-01T10:00:00Z'),
      updated_at: new Date('2024-12-01T10:00:00Z')
    },
    {
      id_affectation: 4,
      id_session: 3,
      id_matiere: 4, nom_matiere: 'Chimie',
      id_option: 1, nom_option: 'Sciences',
      id_professeur: 104, nom_professeur: 'Mlle. Lefevre',
      date_limite_soumission: new Date('2024-07-05T23:59:59Z'),
      date_examen_etudiant: new Date('2024-07-07T10:00:00Z'),
      heure_debut_examen: '10:00',
      heure_fin_examen: '13:00',
      statut_affectation: 'Assignée',
      commentaires: 'Examen pratique',
      created_at: new Date('2024-05-01T10:00:00Z'),
      updated_at: new Date('2024-06-15T10:00:00Z')
    }
  ];
  private nextAffectationId = 5;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.affectationForm = this.fb.group({
      id_matiere: [null, Validators.required],
      id_option: [null, Validators.required],
      id_professeur: [null, Validators.required],
      date_limite_soumission: ['', Validators.required],
      date_examen_etudiant: ['', Validators.required],
      heure_debut_examen: ['', Validators.required],
      heure_fin_examen: ['', Validators.required],
      statut_affectation: [null, Validators.required],
      commentaires: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.sessionId = Number(params.get('id'));
      if (this.sessionId) {
        this.loadSessionDetails(this.sessionId);
        this.loadAffectations(this.sessionId);
      } else {
        this.showToast('Erreur', 'ID de session manquant.', 'danger');
        this.router.navigate(['/sessions']);
      }
    });
  }

  loadSessionDetails(id: number): void {
    this._get_session_by_id(id).subscribe({
      next: (data: SessionExamenRead | null) => {
        if (data) {
          this.session = data;
          this.showToast('Info', `Détails de la session "${data.nom}" chargés.`, 'info');
        } else {
          this.showToast('Erreur', 'Session non trouvée.', 'danger');
          this.router.navigate(['/sessions']);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails de la session (simulé) :', err);
        this.showToast('Erreur', 'Impossible de charger les détails de la session (simulé).', 'danger');
        this.router.navigate(['/sessions']);
      }
    });
  }

  loadAffectations(sessionId: number): void {
    this._get_all_affectations_by_session_id(sessionId).subscribe({
      next: (data: AffectationEpreuveRead[]) => {
        this.affectations = data;
        this.sortAffectations(); // Applique le tri par défaut après le chargement
        this.showToast('Info', 'Affectations chargées (simulé).', 'info');
      },
      error: (err) => {
        console.error('Erreur lors du chargement des affectations (simulé) :', err);
        this.showToast('Erreur', 'Impossible de charger les affectations (simulé).', 'danger');
      }
    });
  }

  /**
   * Sorts the affectations based on the selected criteria.
   */
  sortAffectations(): void {
    if (!this.sortCriteria) {
      // Si aucun critère n'est sélectionné, affiche les affectations dans leur ordre d'arrivée
      this.filteredAffectations = [...this.affectations];
      return;
    }

    this.filteredAffectations = [...this.affectations].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (this.sortCriteria) {
        case 'date_examen_etudiant':
          valA = a.date_examen_etudiant.getTime(); // Compare timestamps
          valB = b.date_examen_etudiant.getTime();
          break;
        case 'nom_matiere':
          valA = a.nom_matiere.toLowerCase();
          valB = b.nom_matiere.toLowerCase();
          break;
        case 'nom_professeur':
          valA = a.nom_professeur.toLowerCase();
          valB = b.nom_professeur.toLowerCase();
          break;
        case 'statut_affectation':
          // Pour le statut, on peut vouloir un ordre spécifique ou juste alphabétique
          // Pour l'instant, c'est alphabétique
          valA = a.statut_affectation.toLowerCase();
          valB = b.statut_affectation.toLowerCase();
          break;
        default:
          return 0; // Ne trie pas si le critère est inconnu
      }

      if (valA < valB) {
        return -1;
      }
      if (valA > valB) {
        return 1;
      }
      return 0;
    });
  }

  openAddAffectationModal(): void {
    this.isEditMode = false;
    this.currentAffectationId = null;
    this.affectationForm.reset();
    this.affectationForm.get('id_matiere')?.setValue(null);
    this.affectationForm.get('id_option')?.setValue(null);
    this.affectationForm.get('id_professeur')?.setValue(null);
    this.affectationForm.get('statut_affectation')?.setValue(null);
    this.showAffectationModal = true;
  }

  openEditAffectationModal(affectation: AffectationEpreuveRead): void {
    this.isEditMode = true;
    this.currentAffectationId = affectation.id_affectation;
    const formattedDateLimite = affectation.date_limite_soumission.toISOString().substring(0, 10);
    const formattedDateExamen = affectation.date_examen_etudiant.toISOString().substring(0, 10);

    this.affectationForm.patchValue({
      id_matiere: affectation.id_matiere,
      id_option: affectation.id_option,
      id_professeur: affectation.id_professeur,
      date_limite_soumission: formattedDateLimite,
      date_examen_etudiant: formattedDateExamen,
      heure_debut_examen: affectation.heure_debut_examen,
      heure_fin_examen: affectation.heure_fin_examen,
      statut_affectation: affectation.statut_affectation,
      commentaires: affectation.commentaires
    });
    this.showAffectationModal = true;
  }

  saveAffectation(): void {
    if (this.affectationForm.invalid) {
      this.affectationForm.markAllAsTouched();
      this.showToast('Erreur', 'Veuillez remplir tous les champs requis.', 'danger');
      return;
    }

    if (!this.sessionId) {
      this.showToast('Erreur', 'ID de session non défini. Impossible de sauvegarder l\'affectation.', 'danger');
      return;
    }

    const affectationData: AffectationEpreuveCreate | AffectationEpreuveUpdate = {
      ...this.affectationForm.value,
      date_limite_soumission: new Date(this.affectationForm.value.date_limite_soumission),
      date_examen_etudiant: new Date(this.affectationForm.value.date_examen_etudiant)
    };

    if (this.isEditMode && this.currentAffectationId !== null) {
      this._update_affectation_epreuve(this.currentAffectationId, affectationData as AffectationEpreuveUpdate).subscribe({
        next: (updatedAffectation) => {
          if (updatedAffectation) {
            this.showToast('Succès', 'Affectation modifiée avec succès !', 'success');
            this.loadAffectations(this.sessionId!);
            this.showAffectationModal = false;
          } else {
            this.showToast('Erreur', 'Affectation non trouvée pour la modification.', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la modification de l\'affectation (simulé) :', err);
          this.showToast('Erreur', 'Impossible de modifier l\'affectation (simulé).', 'danger');
        }
      });
    } else {
      const newAffectationData: AffectationEpreuveCreate = {
        ...affectationData as AffectationEpreuveCreate,
        id_session: this.sessionId
      };
      this._create_affectation_epreuve(newAffectationData).subscribe({
        next: (newAffectation) => {
          this.showToast('Succès', 'Affectation ajoutée avec succès !', 'success');
          this.loadAffectations(this.sessionId!);
          this.showAffectationModal = false;
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de l\'affectation (simulé) :', err);
          this.showToast('Erreur', 'Impossible d\'ajouter l\'affectation (simulé).', 'danger');
        }
      });
    }
  }

  confirmDeleteAffectation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette affectation ? Cette action est irréversible.')) {
      this._delete_affectation_epreuve(id).subscribe({
        next: (success) => {
          if (success) {
            this.showToast('Succès', 'Affectation supprimée avec succès !', 'success');
            this.loadAffectations(this.sessionId!);
          } else {
            this.showToast('Erreur', 'Impossible de supprimer l\'affectation (non trouvée).', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'affectation (simulé) :', err);
          this.showToast('Erreur', 'Une erreur est survenue lors de la suppression (simulé).', 'danger');
        }
      });
    }
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('planifierSessionToast');
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
    const toastElement = document.getElementById('planifierSessionToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  // --- Simulated service methods ---

  private _get_session_by_id(id: number): Observable<SessionExamenRead | null> {
    const session = this.mockSessions.find(s => s.id_session === id);
    return of(session || null).pipe(delay(300));
  }

  private _get_all_affectations_by_session_id(sessionId: number): Observable<AffectationEpreuveRead[]> {
    const affectationsForSession = this.mockAffectations.filter(a => a.id_session === sessionId);
    return of([...affectationsForSession]).pipe(delay(500));
  }

  private _create_affectation_epreuve(affectation: AffectationEpreuveCreate): Observable<AffectationEpreuveRead> {
    const newAffectation: AffectationEpreuveRead = {
      id_affectation: this.nextAffectationId++,
      id_session: affectation.id_session,
      id_matiere: affectation.id_matiere,
      nom_matiere: this.matieres.find(m => m.id_matiere === affectation.id_matiere)?.nom_matiere || 'Inconnu',
      id_option: affectation.id_option,
      nom_option: this.options.find(o => o.id_option === affectation.id_option)?.nom_option || 'Inconnu',
      id_professeur: affectation.id_professeur,
      nom_professeur: this.professeurs.find(p => p.id_professeur === affectation.id_professeur)?.nom_professeur || 'Inconnu',
      date_limite_soumission: affectation.date_limite_soumission,
      date_examen_etudiant: affectation.date_examen_etudiant,
      heure_debut_examen: affectation.heure_debut_examen,
      heure_fin_examen: affectation.heure_fin_examen,
      statut_affectation: affectation.statut_affectation,
      commentaires: affectation.commentaires,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.mockAffectations.push(newAffectation);
    return of(newAffectation).pipe(delay(500));
  }

  private _update_affectation_epreuve(id: number, affectation: AffectationEpreuveUpdate): Observable<AffectationEpreuveRead | null> {
    const index = this.mockAffectations.findIndex(a => a.id_affectation === id);
    if (index > -1) {
      const existingAffectation = this.mockAffectations[index];
      const updatedAffectation = {
        ...existingAffectation,
        ...affectation,
        nom_matiere: affectation.id_matiere ? (this.matieres.find(m => m.id_matiere === affectation.id_matiere)?.nom_matiere || 'Inconnu') : existingAffectation.nom_matiere,
        nom_option: affectation.id_option ? (this.options.find(o => o.id_option === affectation.id_option)?.nom_option || 'Inconnu') : existingAffectation.nom_option,
        nom_professeur: affectation.id_professeur ? (this.professeurs.find(p => p.id_professeur === affectation.id_professeur)?.nom_professeur || 'Inconnu') : existingAffectation.nom_professeur,
        updated_at: new Date()
      };
      this.mockAffectations[index] = updatedAffectation;
      return of(updatedAffectation).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  private _delete_affectation_epreuve(id: number): Observable<boolean> {
    const initialLength = this.mockAffectations.length;
    this.mockAffectations = this.mockAffectations.filter(affectation => affectation.id_affectation !== id);
    return of(this.mockAffectations.length < initialLength).pipe(delay(500));
  }
}