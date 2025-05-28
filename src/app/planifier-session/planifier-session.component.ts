import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

// Components
import { HeaderComponent } from '../header/header.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component';

// Services
import { SessionExamensService } from '../services/session-examens.service';
import { AffectationEpreuveService } from '../services/affectation-epreuve.service';
import { MatiereService } from '../services/matiere.service';
import { OptionEtudeService } from '../services/option-etude.service';
import { GetPasswordService } from '../services/get-password.service';

// Interfaces
import { SessionExamen } from '../services/session-examens.service';

interface AffectationEpreuveRead {
  id_affectation_epreuve: number;
  id_session_examen: number;
  id_matiere: number;
  nom_matiere: string;
  id_option_etude: number;
  nom_option: string;
  id_professeur: number;
  nom_professeur: string;
  date_limite_soumission_prof: string;
  date_examen_etudiant: string;
  heure_debut_examen: string;
  duree_examen_prevue: number;
  statut_affectation: string;
  commentaires_service_examens?: string;
  created_at: string;
  updated_at: string;
}



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
  session: SessionExamen | null = null;
  affectations: AffectationEpreuveRead[] = [];
  filteredAffectations: AffectationEpreuveRead[] = [];
  affectationForm: FormGroup;
  isEditMode: boolean = false;
  currentAffectationId: number | null = null;
  showAffectationModal: boolean = false;
  sortCriteria: string = 'date_examen_etudiant';
  isLoading = true;

  // Data sources
  matieres: any[] = [];
  options: any[] = [];
  professeurs: any[] = [];
  availableAffectationStatuses: string[] = ['assignee', 'en_cours', 'terminee', 'annulee'];

  private toastTimeout: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionExamensService,
    private affectationService: AffectationEpreuveService,
    private matiereService: MatiereService,
    private optionService: OptionEtudeService,
    private professeurService: GetPasswordService
  ) {
    this.affectationForm = this.fb.group({
      id_matiere: [null, Validators.required],
      id_option_etude: [null, Validators.required],
      id_professeur: [null, Validators.required],
      date_limite_soumission_prof: ['', Validators.required],
      date_examen_etudiant: ['', Validators.required],
      heure_debut_examen: ['', Validators.required],
      heure_fin_examen:   ['', Validators.required],
      duree_examen_prevue: ['', [Validators.required, Validators.min(1)]],
      statut_affectation: ['assignee', Validators.required],
      commentaires_service_examens: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(params => {
      this.sessionId = Number(params.get('id'));
      if (this.sessionId) {
        this.loadData();
      } else {
        this.showToast('Erreur', 'ID de session manquant.', 'danger');
        this.router.navigate(['/sessions']);
      }
    });
  }

  async loadData(): Promise<void> {
    try {
      const results = await forkJoin([
        this.sessionService.getSession(this.sessionId!),
        this.affectationService.listerParSession(this.sessionId!),
        this.matiereService.lireMatieres(),
        this.optionService.lireOptions(),
        this.professeurService.recuProf()
      ]).toPromise();

      if (!results) throw new Error('Aucune donnée reçue');

      const [sessionRes, affectationsRes, matieresRes, optionsRes, professeursRes] = results;

      if (sessionRes?.success) {
        this.session = sessionRes.message as unknown as SessionExamen;
      }

      this.matieres = matieresRes?.message || [];
      this.options = (optionsRes?.message as any[]) || [];
      this.professeurs = professeursRes || [];

      this.affectations = (affectationsRes?.message || []).map((aff: any) => ({
        ...aff,
        nom_matiere: this.getMatiereName(aff.id_matiere),
        nom_option: this.getOptionName(aff.id_option_etude),
        nom_professeur: this.getProfesseurName(aff.id_professeur)
      }));

      this.sortAffectations();
      this.isLoading = false;

    } catch (error) {
      console.error('Erreur de chargement:', error);
      this.showToast('Erreur', 'Échec du chargement des données', 'danger');
      this.isLoading = false;
    }
  }

  private getMatiereName(matiereId: number): string {
    return this.matieres.find(m => m.id_matiere === matiereId)?.nom_matiere || 'Inconnu';
  }

  private getOptionName(optionId: number): string {
    return this.options.find(o => o.id_option_etude === optionId)?.nom_option || 'Inconnu';
  }

  private getProfesseurName(professeurId: number): string {
    const prof = this.professeurs.find(p => p.id_professeur === professeurId);
    return prof ? `${prof.prenom} ${prof.nom}` : 'Inconnu';
  }

  sortAffectations(): void {
    if (!this.sortCriteria) {
      this.filteredAffectations = [...this.affectations];
      return;
    }

    this.filteredAffectations = [...this.affectations].sort((a, b) => {
      const valA = this.getSortValue(a);
      const valB = this.getSortValue(b);

      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  }

  private getSortValue(aff: AffectationEpreuveRead): any {
    switch (this.sortCriteria) {
      case 'date_examen_etudiant':
        return new Date(aff.date_examen_etudiant).getTime();
      case 'nom_matiere':
        return aff.nom_matiere.toLowerCase();
      case 'nom_professeur':
        return aff.nom_professeur.toLowerCase();
      case 'statut_affectation':
        return aff.statut_affectation.toLowerCase();
      default:
        return 0;
    }
  }

  openAddAffectationModal(): void {
    this.isEditMode = false;
    this.currentAffectationId = null;
    this.affectationForm.reset({
      statut_affectation: 'assignee'
    });
    this.showAffectationModal = true;
    // Après le chargement des données, ajouter :
    console.log('Matieres:', this.matieres);
    console.log('Options:', this.options);
    console.log('Professeurs:', this.professeurs);
  }

  openEditAffectationModal(affectation: AffectationEpreuveRead): void {
    this.isEditMode = true;
    this.currentAffectationId = affectation.id_affectation_epreuve;
    
    this.affectationForm.patchValue({
      id_matiere: affectation.id_matiere,
      id_option_etude: affectation.id_option_etude,
      id_professeur: affectation.id_professeur,
      date_limite_soumission_prof: affectation.date_limite_soumission_prof.split('T')[0],
      date_examen_etudiant: affectation.date_examen_etudiant.split('T')[0],
      heure_debut_examen: affectation.heure_debut_examen,
      duree_examen_prevue: affectation.duree_examen_prevue.toString(),
      statut_affectation: affectation.statut_affectation,
      commentaires_service_examens: affectation.commentaires_service_examens
    });
    
    this.showAffectationModal = true;
  }

  async saveAffectation(): Promise<void> {
    if (this.affectationForm.invalid) {
      this.affectationForm.markAllAsTouched();
      this.showToast('Erreur', 'Veuillez remplir tous les champs requis', 'danger');
      return;
    }

    const formValue = this.affectationForm.value;
    const affectationData = {
      ...formValue,
      id_session_examen: this.sessionId,
      duree_examen_prevue: Number(formValue.duree_examen_prevue)
    };

    try {
      if (this.isEditMode && this.currentAffectationId) {
        await this.affectationService.mettreAJourAffectation(
          this.currentAffectationId,
          affectationData
        ).toPromise();
        this.showToast('Succès', 'Affectation modifiée avec succès', 'success');
      } else {
        await this.affectationService.creerAffectation(affectationData).toPromise();
        this.showToast('Succès', 'Affectation créée avec succès', 'success');
      }

      this.loadData();
      this.showAffectationModal = false;

    } catch (error) {
      console.error('Erreur:', error);
      this.showToast('Erreur', 'Échec de la sauvegarde', 'danger');
    }
  }

  async deleteAffectation(id: number): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      try {
        await this.affectationService.supprimerAffectation(id).toPromise();
        this.showToast('Succès', 'Affectation supprimée', 'success');
        this.loadData();
      } catch (error) {
        console.error('Erreur:', error);
        this.showToast('Erreur', 'Échec de la suppression', 'danger');
      }
    }
  }

  // Toast methods
  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('planifierToast');
    if (toastElement) {
      toastElement.querySelector('.toast-title')!.textContent = title;
      toastElement.querySelector('.toast-message')!.textContent = message;

      const headerClass = type === 'success' ? 'bg-green-700' :
                        type === 'danger' ? 'bg-red-700' : 'bg-blue-700';
      
      toastElement.querySelector('.toast-header')!.className = `toast-header ${headerClass}`;
      toastElement.classList.remove('opacity-0');
      toastElement.classList.add('opacity-100');

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => this.hideToast(), 3000);
    }
  }

  hideToast(): void {
    const toastElement = document.getElementById('planifierToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0');
    }
  }
}