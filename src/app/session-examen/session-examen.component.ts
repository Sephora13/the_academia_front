import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SessionExamensService } from '../services/session/session-examens.service';

// Déclarations pour les composants parents
import { HeaderComponent } from '../header/header.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component';

// Interfaces
interface SessionExamenRead {
  id_session: number;
  nom: string;
  date_debut: Date;
  date_fin: Date;
  statut: string;
  created_at: Date;
  updated_at: Date;
}

interface SessionExamenCreate {
  nom: string;
  date_debut: string;
  date_fin: string;
  statut: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
}

interface SessionExamenUpdate {
  nom?: string;
  date_debut?: string;
  date_fin?: string;
  statut?: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
}

@Component({
  selector: 'app-session-examen',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    DashboardExamServiceComponent
  ],
  templateUrl: './session-examen.component.html',
  styleUrls: ['./session-examen.component.css']
})
export class SessionExamenComponent implements OnInit {
  sessions: SessionExamenRead[] = [];
  filteredSessions: SessionExamenRead[] = [];
  sessionForm: FormGroup;
  isEditMode: boolean = false;
  currentSessionId: number | null = null;
  searchTerm: string = '';
  selectedStatus: string | null = null;
  availableStatuses: string[] = ['Planifiée', 'En cours', 'Terminée', 'Annulée'];
  selectedCreationYear: number | null = null;
  availableCreationYears: number[] = [];
  showSessionModal: boolean = false;
  private toastTimeout: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sessionService: SessionExamensService
  ) {
    this.sessionForm = this.fb.group({
      nom: ['', Validators.required],
      date_debut: ['', Validators.required],
      date_fin: ['', Validators.required],
      statut: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionService.listerSessions().subscribe({
      next: (response) => {
        if (response.success) {
          this.sessions = (response.message as any[]).map(session => ({
            id_session: session.id_session_examen,
            nom: session.nom_session,
            date_debut: new Date(session.date_debut_session),
            date_fin: new Date(session.date_fin_session),
            statut: session.statut_session,
            created_at: new Date(session.created_at),
            updated_at: new Date(session.updated_at)
          }));
          
          this.availableCreationYears = [...new Set(this.sessions.map(s => s.created_at.getFullYear()))].sort((a, b) => b - a);
          this.filterSessions();
          this.showToast('Info', 'Données chargées.', 'info');
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des sessions:', err);
        this.showToast('Erreur', 'Impossible de charger les sessions.', 'danger');
      }
    });
  }

  filterSessions(): void {
    let tempSessions = [...this.sessions];

    // Filtrer par statut sélectionné
    if (this.selectedStatus !== null) {
      tempSessions = tempSessions.filter(session => session.statut === this.selectedStatus);
    }

    // Filtrer par année de création
    if (this.selectedCreationYear !== null) {
      tempSessions = tempSessions.filter(session => session.created_at.getFullYear() === this.selectedCreationYear);
    }

    // Filtrer par terme de recherche
    if (this.searchTerm) {
      tempSessions = tempSessions.filter(session =>
        session.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        session.statut.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Trier par date de création (récentes en premier)
    this.filteredSessions = tempSessions.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  openAddSessionModal(): void {
    this.isEditMode = false;
    this.currentSessionId = null;
    this.sessionForm.reset();
    this.showSessionModal = true;
  }

  openEditSessionModal(session: SessionExamenRead): void {
    this.isEditMode = true;
    this.currentSessionId = session.id_session;
    
    // Formater les dates pour les champs input type="date"
    const formattedDateDebut = session.date_debut.toISOString().substring(0, 10);
    const formattedDateFin = session.date_fin.toISOString().substring(0, 10);
  
    this.sessionForm.patchValue({
      nom: session.nom,
      date_debut: formattedDateDebut,
      date_fin: formattedDateFin,
      statut: session.statut
    });
    this.showSessionModal = true;
  }

  // Dans la méthode saveSession()
  saveSession(): void {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      this.showToast('Erreur', 'Veuillez remplir tous les champs requis.', 'danger');
      return;
    }
  
    const formValue = this.sessionForm.value;
  
    if (this.isEditMode && this.currentSessionId !== null) {
      const updateData: SessionExamenUpdate = {
        nom: formValue.nom,
        date_debut: formValue.date_debut,
        date_fin: formValue.date_fin,
        statut: formValue.statut
      };
  
      this.sessionService.mettreAJourSession(this.currentSessionId, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showToast('Succès', 'Session modifiée avec succès !', 'success');
            this.loadSessions();
            this.showSessionModal = false;
          }
        },
        error: (err) => {
          console.error('Erreur lors de la modification de la session:', err);
          this.showToast('Erreur', 'Impossible de modifier la session.', 'danger');
        }
      });
    } else {
      const createData: SessionExamenCreate = {
        nom: formValue.nom,
        date_debut: formValue.date_debut,
        date_fin: formValue.date_fin,
        statut: formValue.statut
      };
  
      this.sessionService.creerSession(createData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showToast('Succès', 'Session ajoutée avec succès !', 'success');
            this.loadSessions();
            this.showSessionModal = false;
          }
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de la session:', err);
          this.showToast('Erreur', 'Impossible d\'ajouter la session.', 'danger');
        }
      });
    }
  }

  confirmDeleteSession(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.')) {
      this.sessionService.supprimerSession(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showToast('Succès', 'Session supprimée avec succès !', 'success');
            this.loadSessions();
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la session:', err);
          this.showToast('Erreur', 'Une erreur est survenue lors de la suppression.', 'danger');
        }
      });
    }
  }

  viewSessionDetails(id: number): void {
    this.router.navigate(['/planifier_session', id]);
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('sessionExamenToast');
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
    const toastElement = document.getElementById('sessionExamenToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}