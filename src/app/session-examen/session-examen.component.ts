import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable, forkJoin, map } from 'rxjs';
import { Router } from '@angular/router';
import { SessionExamensService } from '../services/session/session-examens.service';
import { FiliereService } from '../services/filiere/filiere.service';
import { OptionEtudeService } from '../services/option/option-etude.service';
import { MatiereService } from '../services/matiere/matiere.service';
import { AffectationEpreuveService } from '../services/affectation/affectation-epreuve.service';
import { GetPasswordService } from '../services/get_info/get-password.service';
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
  nom_session: string;
  date_debut_session: string;
  date_fin_session: string;
  statut_session: string;
}

interface SessionExamenUpdate {
  nom_session?: string;
  date_debut_session?: string;
  date_fin_session?: string;
  statut_session?: string;
}

interface Filiere {
  id_filiere: number;
  nom_filiere: string;
}

interface OptionEtude {
  id_option_etude: number;
  nom_option: string;
  id_filiere: number;
}

interface Professeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  classe: string;
  matiere: string;
}

interface Matiere {
  id_matiere: number;
  nom_matiere: string;
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
  affectationForm: FormGroup;
  isEditMode: boolean = false;
  currentSessionId: number | null = null;
  searchTerm: string = '';
  selectedStatus: string | null = null;
  availableStatuses: string[] = ['Planifiée', 'En cours', 'Terminée', 'Annulée'];
  selectedCreationYear: number | null = null;
  availableCreationYears: number[] = [];
  showSessionModal: boolean = false;
  showAffectationModal: boolean = false;
  private toastTimeout: any;

  // Données pour l'affectation
  filieres: Filiere[] = [];
  options: OptionEtude[] = [];
  professeurs: Professeur[] = [];
  matieres: Matiere[] = [];
  filteredOptions: OptionEtude[] = [];
  filteredProfesseurs: Professeur[] = [];
  filteredMatieres: Matiere[] = [];
  currentSessionIdForAffectation: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sessionService: SessionExamensService,
    private filiereService: FiliereService,
    private optionService: OptionEtudeService,
    private matiereService: MatiereService,
    private affectationService: AffectationEpreuveService,
    private getPasswordService: GetPasswordService
  ) {
    this.sessionForm = this.fb.group({
      nom: ['', Validators.required],
      date_debut: ['', Validators.required],
      date_fin: ['', Validators.required],
      statut: ['Planifiée', Validators.required]
    });

    this.affectationForm = this.fb.group({
      filiere: ['', Validators.required],
      option_etude: ['', Validators.required],
      professeur: ['', Validators.required],
      matiere: ['', Validators.required],
      date_examen: ['', Validators.required],
      heure_debut: ['', Validators.required],
      duree: [2, [Validators.required, Validators.min(1)]],
      date_limite: ['', Validators.required],
      commentaire: ['']
    });
  }

  ngOnInit(): void {
    this.loadSessions();
    this.loadDataForAffectation();
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

  loadDataForAffectation(): void {
    forkJoin({
      filieres: this.filiereService.lireFilieres().pipe(map(response => response.message as Filiere[])),
      options: this.optionService.lireOptions().pipe(map(response => response.message as unknown as OptionEtude[])),
      professeurs: this.getPasswordService.recuProf().pipe(
        map((profs: any[]) => profs.map(p => ({
          id: p.id,
          nom: p.nom,
          prenom: p.prenom,
          email: p.email,
          classe: p.classe,
          matiere: p.matiere
        })))
      ),
      matieres: this.matiereService.lireMatieres().pipe(map(response => response.message as Matiere[]))
    }).subscribe({
      next: (results) => {
        this.filieres = results.filieres;
        this.options = results.options;
        this.professeurs = results.professeurs;
        this.matieres = results.matieres;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
        this.showToast('Erreur', 'Impossible de charger les données pour l\'affectation', 'danger');
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
    this.sessionForm.reset({
      statut: 'Planifiée'
    });
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

  openAffectationModal(sessionId: number): void {
    this.currentSessionIdForAffectation = sessionId;
    this.affectationForm.reset();
    this.showAffectationModal = true;
  }

  onFiliereChange(): void {
    const filiereId = this.affectationForm.get('filiere')?.value;
    this.filteredOptions = this.options.filter(option => option.id_filiere === filiereId);
    this.affectationForm.get('option_etude')?.reset();
    this.affectationForm.get('professeur')?.reset();
    this.affectationForm.get('matiere')?.reset();
  }

  onOptionChange(): void {
    const optionId = this.affectationForm.get('option_etude')?.value;
    const selectedOption = this.options.find(o => o.id_option_etude === optionId);
    
    if (selectedOption) {
      // Filtre insensible à la casse avec trim()
      this.filteredProfesseurs = this.professeurs.filter(
        prof => prof.classe.trim().toLowerCase() === selectedOption.nom_option.trim().toLowerCase()
      );
    }
    
    this.affectationForm.get('professeur')?.reset();
    this.affectationForm.get('matiere')?.reset();
  }
  
  onProfesseurChange(): void {
    const professeurId = this.affectationForm.get('professeur')?.value;
    const selectedProfesseur = this.professeurs.find(p => p.id === professeurId);
    
    if (selectedProfesseur) {
      // Filtre insensible à la casse avec trim()
      this.filteredMatieres = this.matieres.filter(
        matiere => matiere.nom_matiere.trim().toLowerCase() === selectedProfesseur.matiere.trim().toLowerCase()
      );
    }
    
    this.affectationForm.get('matiere')?.reset();
  }

  saveAffectation(): void {
    if (this.affectationForm.invalid || !this.currentSessionIdForAffectation) {
      return;
    }

    const formValue = this.affectationForm.value;
    const affectationData = {
      id_session_examen: this.currentSessionIdForAffectation,
      id_matiere: formValue.matiere,
      id_option_etude: formValue.option_etude,
      id_professeur: formValue.professeur,
      date_limite_soumission_prof: formValue.date_limite,
      date_examen_etudiant: formValue.date_examen,
      heure_debut_examen: formValue.heure_debut + ':00', // Ajouter les secondes
      duree_examen_prevue: formValue.duree,
      id_epreuve: null,
      statut_affectation: "assignee",
      commentaires_service_examens: formValue.commentaire || null,
      assigned_by: undefined
    };

    this.affectationService.creerAffectation(affectationData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showToast('Succès', 'Affectation créée avec succès !', 'success');
          this.showAffectationModal = false;
        } else {
          this.showToast('Erreur', 'Erreur lors de la création de l\'affectation', 'danger');
        }
      },
      error: (err) => {
        console.error('Erreur lors de la création de l\'affectation:', err);
        this.showToast('Erreur', 'Impossible de créer l\'affectation', 'danger');
      }
    });
  }

  saveSession(): void {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      this.showToast('Erreur', 'Veuillez remplir tous les champs requis.', 'danger');
      return;
    }
  
    const formValue = this.sessionForm.value;
  
    const apiPayload = {
      nom_session: formValue.nom,
      date_debut_session: formValue.date_debut,
      date_fin_session: formValue.date_fin,
      statut_session: formValue.statut
    };

    if (this.isEditMode && this.currentSessionId !== null) {
  
      this.sessionService.mettreAJourSession(this.currentSessionId, apiPayload).subscribe({
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
      this.sessionService.creerSession(apiPayload).subscribe({
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