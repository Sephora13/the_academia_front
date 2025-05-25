import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable, of, forkJoin } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// D\u00E9clarations pour les composants parents
import { HeaderComponent } from '../header/header.component'; // Ajustez le chemin
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component'; // Ajustez le chemin

// --- D\u00E9finition des interfaces pour les donn\u00E9es (simul\u00E9es) ---
interface FiliereRead {
  id_filiere: number;
  nom_filiere: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

interface OptionEtudeRead {
  id_option_etude: number;
  nom_option: string;
  id_filiere: number;
  niveau?: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

interface MatiereRead {
  id_matiere: number;
  nom_matiere: string;
  code_matiere?: string; // Nouveau champ
  id_filiere: number;
  id_option?: number | null; // Peut \u00EAtre nul
  description?: string;
  created_at: Date;
  updated_at: Date;
}

interface MatiereCreate {
  nom_matiere: string;
  code_matiere?: string;
  id_filiere: number;
  id_option?: number | null;
  description?: string;
}

interface MatiereUpdate {
  nom_matiere?: string;
  code_matiere?: string;
  id_filiere?: number;
  id_option?: number | null;
  description?: string;
}
// --- Fin des d\u00E9finitions d'interfaces ---


@Component({
  selector: 'app-matiere',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    DashboardExamServiceComponent
  ],
  templateUrl: './matiere.component.html',
  styleUrls: ['./matiere.component.css']
})
export class MatiereComponent implements OnInit {
  filieres: FiliereRead[] = [];
  options: OptionEtudeRead[] = [];
  matieres: MatiereRead[] = [];
  filteredMatieres: MatiereRead[] = [];
  matiereForm: FormGroup;
  isEditMode: boolean = false;
  currentMatiereId: number | null = null;
  searchTerm: string = '';
  selectedFiliereId: number | null = null; // Pour filtrer les mati\u00E8res par fili\u00E8re
  selectedOptionId: number | null = null; // Pour filtrer les mati\u00E8res par option
  showMatiereModal: boolean = false;
  private toastTimeout: any;

  // Utilis\u00E9 pour peupler le s\u00E9lecteur d'options dans le formulaire de la modale
  filteredOptionsForForm: OptionEtudeRead[] = [];

  // Donn\u00E9es simul\u00E9es (doivent \u00EAtre coh\u00E9rentes)
  private mockFilieres: FiliereRead[] = [
    { id_filiere: 1, nom_filiere: 'Génie Logiciel', description: 'Développement de logiciels et applications.', created_at: new Date(), updated_at: new Date() },
    { id_filiere: 2, nom_filiere: 'Réseaux et Télécommunications', description: 'Conception et gestion des infrastructures réseau.', created_at: new Date(), updated_at: new Date() },
    { id_filiere: 3, nom_filiere: 'Intelligence Artificielle', description: 'Apprentissage automatique et science des données.', created_at: new Date(), updated_at: new Date() },
  ];
  private mockOptions: OptionEtudeRead[] = [
    { id_option_etude: 101, nom_option: 'SIL', id_filiere: 1, niveau: 'L3', description: 'Systèmes d\'Information et Logiciels', created_at: new Date(), updated_at: new Date() },
    { id_option_etude: 102, nom_option: 'GLA', id_filiere: 1, niveau: 'M1', description: 'Génie Logiciel Avancé', created_at: new Date(), updated_at: new Date() },
    { id_option_etude: 103, nom_option: 'RTEL', id_filiere: 2, niveau: 'L3', description: 'Réseaux et Télécommunications', created_at: new Date(), updated_at: new Date() },
    { id_option_etude: 104, nom_option: 'IA-ML', id_filiere: 3, niveau: 'M2', description: 'Intelligence Artificielle et Machine Learning', created_at: new Date(), updated_at: new Date() },
    { id_option_etude: 105, nom_option: 'CYB', id_filiere: 2, niveau: 'M1', description: 'Cybersécurité des Réseaux', created_at: new Date(), updated_at: new Date() },
  ];
  private mockMatieres: MatiereRead[] = [
    { id_matiere: 1, nom_matiere: 'Algorithmique Avancée', code_matiere: 'ALG301', id_filiere: 1, id_option: 101, description: 'Approfondissement des structures de données.', created_at: new Date(), updated_at: new Date() },
    { id_matiere: 2, nom_matiere: 'Programmation Orientée Objet', code_matiere: 'POO302', id_filiere: 1, id_option: 101, description: 'Principes de la POO avec Java/C#.', created_at: new Date(), updated_at: new Date() },
    { id_matiere: 3, nom_matiere: 'Réseaux Informatiques', code_matiere: 'RES301', id_filiere: 2, id_option: 103, description: 'Fondamentaux des réseaux TCP/IP.', created_at: new Date(), updated_at: new Date() },
    { id_matiere: 4, nom_matiere: 'Base de Données Relationnelles', code_matiere: 'BDD303', id_filiere: 1, id_option: null, description: 'Conception et manipulation de bases de données.', created_at: new Date(), updated_at: new Date() },
    { id_matiere: 5, nom_matiere: 'Intelligence Artificielle', code_matiere: 'IA401', id_filiere: 3, id_option: 104, description: 'Introduction aux concepts de l\'IA.', created_at: new Date(), updated_at: new Date() },
    { id_matiere: 6, nom_matiere: 'Sécurité des Systèmes', code_matiere: 'SEC402', id_filiere: 2, id_option: 105, description: 'Techniques de protection des systèmes informatiques.', created_at: new Date(), updated_at: new Date() },
  ];
  private nextMatiereId = 7;

  constructor(
    private fb: FormBuilder,
  ) {
    this.matiereForm = this.fb.group({
      nom_matiere: ['', Validators.required],
      code_matiere: [''],
      id_filiere: [null, Validators.required],
      id_option: [null], // Peut \u00EAtre nul
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadDependenciesAndMatieres();
    // Surveille les changements de la fili\u00E8re dans le formulaire pour filtrer les options
    this.matiereForm.get('id_filiere')?.valueChanges.subscribe(filiereId => {
      this.onFiliereChange(filiereId);
    });
  }

  /**
   * Charge les fili\u00E8res, options et mati\u00E8res depuis les services simul\u00E9s.
   */
  loadDependenciesAndMatieres(): void {
    forkJoin({
      filieres: this._get_all_filieres(),
      options: this._get_all_options_etude(),
      matieres: this._get_all_matieres()
    }).subscribe({
      next: (results) => {
        this.filieres = results.filieres;
        this.options = results.options;
        this.matieres = results.matieres;
        this.filterMatieres(); // Appliquer le filtre initial
        this.showToast('Info', 'Données chargées (simulé).', 'info');
      },
      error: (err) => {
        console.error('Erreur lors du chargement des donn\u00E9es (simulé) :', err);
        this.showToast('Erreur', 'Impossible de charger les donn\u00E9es (simulé).', 'danger');
      }
    });
  }

  /**
   * Filtre les mati\u00E8res affich\u00E9es en fonction du terme de recherche, de la fili\u00E8re et de l'option s\u00E9lectionn\u00E9es.
   */
  filterMatieres(): void {
    let tempMatieres = [...this.matieres];

    // Filtrer par fili\u00E8re s\u00E9lectionn\u00E9e
    if (this.selectedFiliereId !== null) {
      tempMatieres = tempMatieres.filter(matiere => matiere.id_filiere === this.selectedFiliereId);
    }

    // Filtrer par option s\u00E9lectionn\u00E9e
    if (this.selectedOptionId !== null) {
      tempMatieres = tempMatieres.filter(matiere => matiere.id_option === this.selectedOptionId);
    }

    // Filtrer par terme de recherche
    if (this.searchTerm) {
      tempMatieres = tempMatieres.filter(matiere =>
        matiere.nom_matiere.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (matiere.code_matiere && matiere.code_matiere.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (matiere.description && matiere.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        this.getFiliereName(matiere.id_filiere).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getOptionName(matiere.id_option).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.filteredMatieres = tempMatieres;
  }

  /**
   * R\u00E9cup\u00E8re le nom de la fili\u00E8re \u00E0 partir de son ID.
   * @param filiereId L'ID de la fili\u00E8re.
   * @returns Le nom de la fili\u00E8re ou 'Inconnu' si non trouv\u00E9.
   */
  getFiliereName(filiereId: number): string {
    const filiere = this.filieres.find(f => f.id_filiere === filiereId);
    return filiere ? filiere.nom_filiere : 'Inconnu';
  }

  /**
   * R\u00E9cup\u00E8re le nom de l'option \u00E0 partir de son ID.
   * @param optionId L'ID de l'option.
   * @returns Le nom de l'option ou 'N/A' si non trouv\u00E9 ou nul.
   */
  getOptionName(optionId: number | null | undefined): string {
    if (optionId === null || optionId === undefined) return 'N/A';
    const option = this.options.find(o => o.id_option_etude === optionId);
    return option ? option.nom_option : 'Inconnu';
  }

  /**
   * G\u00E8re le changement de fili\u00E8re dans le formulaire pour filtrer les options disponibles.
   * @param filiereId L'ID de la fili\u00E8re s\u00E9lectionn\u00E9e.
   */
  onFiliereChange(filiereId: number | null): void {
    if (filiereId !== null) {
      this.filteredOptionsForForm = this.options.filter(option => option.id_filiere === filiereId);
    } else {
      this.filteredOptionsForForm = []; // Aucune option si aucune fili\u00E8re s\u00E9lectionn\u00E9e
    }
    // R\u00E9initialise l'option s\u00E9lectionn\u00E9e si elle n'appartient plus \u00E0 la fili\u00E8re
    const currentOptionId = this.matiereForm.get('id_option')?.value;
    if (currentOptionId && !this.filteredOptionsForForm.some(opt => opt.id_option_etude === currentOptionId)) {
      this.matiereForm.get('id_option')?.setValue(null);
    }
  }

  /**
   * Ouvre la modale pour ajouter une nouvelle mati\u00E8re.
   */
  openAddMatiereModal(): void {
    this.isEditMode = false;
    this.currentMatiereId = null;
    this.matiereForm.reset();
    this.matiereForm.get('id_filiere')?.setValue(null); // S'assurer que la fili\u00E8re est r\u00E9initialis\u00E9e
    this.matiereForm.get('id_option')?.setValue(null); // S'assurer que l'option est r\u00E9initialis\u00E9e
    this.filteredOptionsForForm = []; // R\u00E9initialise les options du formulaire
    this.showMatiereModal = true;
  }

  /**
   * Ouvre la modale pour modifier une mati\u00E8re existante.
   * @param matiere La mati\u00E8re \u00E0 modifier.
   */
  openEditMatiereModal(matiere: MatiereRead): void {
    this.isEditMode = true;
    this.currentMatiereId = matiere.id_matiere;
    this.matiereForm.patchValue(matiere);
    // D\u00E9clenche le filtrage des options pour le formulaire
    this.onFiliereChange(matiere.id_filiere);
    this.showMatiereModal = true;
  }

  /**
   * Sauvegarde une mati\u00E8re (cr\u00E9ation ou modification) via le service simul\u00E9.
   */
  saveMatiere(): void {
    if (this.matiereForm.invalid) {
      this.matiereForm.markAllAsTouched();
      this.showToast('Erreur', 'Veuillez remplir tous les champs requis.', 'danger');
      return;
    }

    const matiereData: MatiereCreate | MatiereUpdate = this.matiereForm.value;

    if (this.isEditMode && this.currentMatiereId !== null) {
      this._update_matiere(this.currentMatiereId, matiereData as MatiereUpdate).subscribe({
        next: (updatedMatiere) => {
          if (updatedMatiere) {
            this.showToast('Succès', 'Matière modifiée avec succès !', 'success');
            this.loadDependenciesAndMatieres();
            this.showMatiereModal = false;
          } else {
            this.showToast('Erreur', 'Matière non trouvée pour la modification.', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la modification de la mati\u00E8re (simulé) :', err);
          this.showToast('Erreur', 'Impossible de modifier la mati\u00E8re (simulé).', 'danger');
        }
      });
    } else {
      this._create_matiere(matiereData as MatiereCreate).subscribe({
        next: (newMatiere) => {
          this.showToast('Succès', 'Matière ajoutée avec succès !', 'success');
          this.loadDependenciesAndMatieres();
          this.showMatiereModal = false;
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de la mati\u00E8re (simulé) :', err);
          this.showToast('Erreur', 'Impossible d\'ajouter la mati\u00E8re (simulé).', 'danger');
        }
      });
    }
  }

  /**
   * Demande confirmation et supprime une mati\u00E8re via le service simul\u00E9.
   * @param id L'ID de la mati\u00E8re \u00E0 supprimer.
   */
  confirmDeleteMatiere(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ? Cette action est irréversible.')) {
      this._delete_matiere(id).subscribe({
        next: (success) => {
          if (success) {
            this.showToast('Succès', 'Matière supprimée avec succès !', 'success');
            this.loadDependenciesAndMatieres();
          } else {
            this.showToast('Erreur', 'Impossible de supprimer la mati\u00E8re (non trouvée).', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la mati\u00E8re (simulé) :', err);
          this.showToast('Erreur', 'Une erreur est survenue lors de la suppression (simulé).', 'danger');
        }
      });
    }
  }

  /**
   * Affiche un message Toast.
   * @param title Titre du Toast.
   * @param message Contenu du message.
   * @param type Type de message pour le style (success, danger, info).
   */
  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('matiereToast'); // Utilise l'ID sp\u00E9cifique \u00E0 la mati\u00E8re
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
    const toastElement = document.getElementById('matiereToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  // --- M\u00E9thodes de simulation du service ---

  private _get_all_filieres(): Observable<FiliereRead[]> {
    return of([...this.mockFilieres]).pipe(delay(300));
  }

  private _get_all_options_etude(): Observable<OptionEtudeRead[]> {
    return of([...this.mockOptions]).pipe(delay(400));
  }

  private _get_all_matieres(): Observable<MatiereRead[]> {
    return of([...this.mockMatieres]).pipe(delay(500));
  }

  private _create_matiere(matiere: MatiereCreate): Observable<MatiereRead> {
    const newMatiere: MatiereRead = {
      id_matiere: this.nextMatiereId++,
      nom_matiere: matiere.nom_matiere,
      code_matiere: matiere.code_matiere,
      id_filiere: matiere.id_filiere,
      id_option: matiere.id_option,
      description: matiere.description,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.mockMatieres.push(newMatiere);
    return of(newMatiere).pipe(delay(500));
  }

  private _update_matiere(id: number, matiere: MatiereUpdate): Observable<MatiereRead | null> {
    const index = this.mockMatieres.findIndex(m => m.id_matiere === id);
    if (index > -1) {
      const updatedMatiere = { ...this.mockMatieres[index], ...matiere, updated_at: new Date() };
      this.mockMatieres[index] = updatedMatiere;
      return of(updatedMatiere).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  private _delete_matiere(id: number): Observable<boolean> {
    const initialLength = this.mockMatieres.length;
    this.mockMatieres = this.mockMatieres.filter(matiere => matiere.id_matiere !== id);
    return of(this.mockMatieres.length < initialLength).pipe(delay(500));
  }
}
