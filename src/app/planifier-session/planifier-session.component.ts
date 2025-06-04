import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

/* UI composants standalone */
import { HeaderComponent } from '../header/header.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component';

/* Services */
import { SessionExamensService } from '../services/session/session-examens.service';
import { AffectationEpreuveService } from '../services/affectation/affectation-epreuve.service';
import { FiliereService } from '../services/filiere/filiere.service';
import { OptionEtudeService } from '../services/option/option-etude.service';
import { MatiereService } from '../services/matiere/matiere.service';
import { GetPasswordService } from '../services/get_info/get-password.service';

/* Types */
import { SessionExamen } from '../services/session/session-examens.service';

interface AffectationEpreuveRead {
  id_affectation_epreuve: number;
  id_session_examen: number;
  id_filiere: number;
  nom_filiere: string;
  id_option_etude: number;
  nom_option: string;
  id_matiere: number;
  nom_matiere: string;
  id_professeur: number;
  nom_professeur: string;
  date_limite_soumission_prof: string;
  date_examen_etudiant: string;
  heure_debut_examen: string;
  heure_fin_examen: string;
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

  /* ─── Données session & épreuves ─────────────────────────── */
  sessionId: number | null = null;
  session: SessionExamen | null = null;
  affectations: AffectationEpreuveRead[] = [];
  filteredAffectations: AffectationEpreuveRead[] = [];
  sortCriteria = 'date_examen_etudiant';
  isLoading = true;

  /* ─── Sources de données référentielles ──────────────────── */
  filieres: any[] = [];
  options: any[] = [];
  matieres: any[] = [];
  professeurs: any[] = [];

  /* ─── Formulaire modal ───────────────────────────────────── */
  affectationForm: FormGroup;
  isEditMode = false;
  showAffectationModal = false;
  currentAffectationId: number | null = null;

  /* ─── Divers ─────────────────────────────────────────────── */
  availableStatuses = ['assignee', 'en_cours', 'terminee', 'annulee'];
  private toastTimeout: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sessionSrv: SessionExamensService,
    private affectationSrv: AffectationEpreuveService,
    private filiereSrv: FiliereService,
    private optionSrv: OptionEtudeService,
    private matiereSrv: MatiereService,
    private profSrv: GetPasswordService
  ) {

    this.affectationForm = this.fb.group({
      id_filiere: [null, Validators.required],
      id_option_etude: [null, Validators.required],
      id_matiere: [null, Validators.required],
      id_professeur: [null, Validators.required],

      date_limite_soumission_prof: ['', Validators.required],
      date_examen_etudiant: ['', Validators.required],
      heure_debut_examen: ['', Validators.required],
      heure_fin_examen: ['', Validators.required],
      duree_examen_prevue: [30, [Validators.required, Validators.min(1)]],

      statut_affectation: ['assignee', Validators.required],
      commentaires_service_examens: ['']
    });
  }

  /* ══════════════════ Cycle de vie ══════════════════ */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.sessionId = Number(params.get('id'));
      if (!this.sessionId) {
        this.showToast('Erreur', 'ID de session manquant.', 'danger');
        this.router.navigate(['/sessions']);
        return;
      }
  
      this.loadReferenceData().then(() => {
        this.loadSessionData();
      });
    });
  }
  
  /* ══════════════════ Chargement ══════════════════ */
  private async loadReferenceData() {
    try {
      const result = await forkJoin([
        this.filiereSrv.lireFilieres(),
        this.optionSrv.lireOptions(),
        this.matiereSrv.lireMatieres(),
        this.profSrv.recuProf()
      ]).toPromise();
  
      if (!result) throw new Error('Résultat indéfini');
  
      const [filieresRes, optionsRes, matieresRes, profsRes] = result;
  
      this.filieres = filieresRes?.message ?? [];
      this.options = Array.isArray(optionsRes?.message) ? optionsRes.message : [];
      this.matieres = matieresRes?.message ?? [];
      
      // Correction du mapping des professeurs
      this.professeurs = (profsRes ?? []).map((p: any) => ({
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        email: p.email,
        classe: p.classe, // Utilisation de 'classe'
        matiere: p.matiere
      }));
  
    } catch (err) {
      console.error(err);
      this.showToast('Erreur', 'Impossible de récupérer les référentiels', 'danger');
    }
  }
  

  private async loadSessionData() {
    try {
      const result = await forkJoin([
        this.sessionSrv.getSession(this.sessionId!),
        this.affectationSrv.listerParSession(this.sessionId!)
      ]).toPromise();
  
      if (!result) {
        throw new Error('Résultat undefined');
      }
  
      const [sessionRes, affectRes] = result;
  
      if (sessionRes?.success) {
        this.session = sessionRes.message;
      }
  
      this.affectations = (affectRes?.message ?? []).map((a: any) => ({
        ...a,
        nom_filiere: this.getFiliereName(a.id_filiere),
        nom_option: this.getOptionName(a.id_option_etude),
        nom_matiere: this.getMatiereName(a.id_matiere),
        nom_professeur: this.getProfName(a.id_professeur)
      }));
  
      this.sortAffectations();
      this.isLoading = false;
  
    } catch (err) {
      console.error(err);
      this.showToast('Erreur', 'Échec du chargement de la session', 'danger');
      this.isLoading = false;
    }
  }
  

  /* ══════════════════ Helpers d’affichage ══════════ */
  private getFiliereName = (id: number) =>
    this.filieres.find(f => f.id_filiere === id)?.nom_filiere || 'Inconnu';

  private getOptionName = (id: number) =>
    this.options.find(o => o.id_option_etude === id)?.nom_option || 'Inconnu';

  private getMatiereName = (id: number) =>
    this.matieres.find(m => m.id_matiere === id)?.nom_matiere || 'Inconnu';

  private getProfName = (id: number) => {
    const p = this.professeurs.find(pr => pr.id === id);
    return p ? `${p.prenom} ${p.nom}` : 'Inconnu';
  };

  /* ══════════════════ Tri cartes ══════════════════ */
  sortAffectations() {
    const cmp = (a: any, b: any) => a < b ? -1 : a > b ? 1 : 0;

    this.filteredAffectations = [...this.affectations].sort((a, b) => {
      switch (this.sortCriteria) {
        case 'date_examen_etudiant':
          return cmp(new Date(a.date_examen_etudiant), new Date(b.date_examen_etudiant));
        case 'nom_matiere': return cmp(a.nom_matiere.toLowerCase(), b.nom_matiere.toLowerCase());
        case 'nom_professeur': return cmp(a.nom_professeur.toLowerCase(), b.nom_professeur.toLowerCase());
        case 'statut_affectation': return cmp(a.statut_affectation, b.statut_affectation);
        default: return 0;
      }
    });
  }

  /* ══════════════════ Filtres dynamiques ══════════ */
  get filteredOptions() {
    const idFiliere = this.affectationForm.get('id_filiere')?.value;
    return this.options.filter(o => o.id_filiere === idFiliere);
  }

  get filteredMatieres() {
    const idProf = this.affectationForm.get('id_professeur')?.value;
    const prof = this.professeurs.find(p => p.id === idProf);
  
    if (!prof || !prof.matiere) return [];
  
    // Normalisation de la chaîne
    const matiereNom = prof.matiere.trim().toLowerCase();
    return this.matieres.filter(m => 
      m.nom_matiere.trim().toLowerCase() === matiereNom
    );
  }
  
  get filteredProfesseurs() {
    const idOption = this.affectationForm.get('id_option_etude')?.value;
    const option = this.options.find(o => o.id_option_etude === idOption);
    if (!option) return [];
  
    // Normalisation de la chaîne
    const nomOption = option.nom_option.trim().toLowerCase();
    
    return this.professeurs.filter(p =>
      p.classe.trim().toLowerCase() === nomOption
    );
  }
  

  /* ══════════════════ Ouverture modale ══════════ */
  openAddAffectationModal() {
    this.isEditMode = false;
    this.currentAffectationId = null;
    this.affectationForm.reset({ statut_affectation: 'assignee' });
    this.showAffectationModal = true;
  }

  openEditAffectationModal(a: AffectationEpreuveRead) {
    this.isEditMode = true;
    this.currentAffectationId = a.id_affectation_epreuve;

    this.affectationForm.patchValue({
      id_filiere: a.id_filiere,
      id_option_etude: a.id_option_etude,
      id_matiere: a.id_matiere,
      id_professeur: a.id_professeur,

      date_limite_soumission_prof: a.date_limite_soumission_prof.split('T')[0],
      date_examen_etudiant: a.date_examen_etudiant.split('T')[0],
      heure_debut_examen: a.heure_debut_examen,
      heure_fin_examen: a.heure_fin_examen,
      duree_examen_prevue: a.duree_examen_prevue,
      statut_affectation: a.statut_affectation,
      commentaires_service_examens: a.commentaires_service_examens
    });

    this.showAffectationModal = true;
  }

  /* ══════════════════ CRUD ══════════════════ */
  async saveAffectation() {
    if (this.affectationForm.invalid) {
      this.affectationForm.markAllAsTouched();
      return this.showToast('Erreur', 'Formulaire incomplet', 'danger');
    }

    /* normalisation ISO des dates */
    const data = {
      ...this.affectationForm.value,
      id_session_examen: this.sessionId,
      date_limite_soumission_prof: new Date(this.affectationForm.value.date_limite_soumission_prof).toISOString(),
      date_examen_etudiant: new Date(this.affectationForm.value.date_examen_etudiant).toISOString()
    };

    try {
      if (this.isEditMode && this.currentAffectationId) {
        await this.affectationSrv.mettreAJourAffectation(this.currentAffectationId, data).toPromise();
        this.showToast('Succès', 'Affectation mise à jour', 'success');
      } else {
        await this.affectationSrv.creerAffectation(data).toPromise();
        this.showToast('Succès', 'Affectation créée', 'success');
      }
      await this.loadSessionData();
      this.showAffectationModal = false;
    } catch (err) {
      console.error(err);
      this.showToast('Erreur', 'Échec de la sauvegarde', 'danger');
    }
  }

  async deleteAffectation(id: number) {
    if (!confirm('Supprimer cette affectation ?')) return;
    try {
      await this.affectationSrv.supprimerAffectation(id).toPromise();
      this.showToast('Succès', 'Affectation supprimée', 'success');
      this.loadSessionData();
    } catch (err) {
      console.error(err);
      this.showToast('Erreur', 'Suppression impossible', 'danger');
    }
  }

  /* ══════════════════ Toast ══════════════════ */
  showToast(title: string, msg: string, type: 'success' | 'danger' | 'info') {
    const el = document.getElementById('planifierSessionToast');
    if (!el) return;
    el.querySelector('.toast-title')!.textContent = title;
    el.querySelector('.toast-message')!.textContent = msg;

    const color = type === 'success' ? 'bg-green-700' :
      type === 'danger' ? 'bg-red-700' : 'bg-blue-700';
    el.querySelector('.toast-header-bg')!.className = `toast-header-bg ${color}`;

    el.classList.replace('opacity-0', 'opacity-100');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => el.classList.replace('opacity-100', 'opacity-0'), 3000);
  }
}
