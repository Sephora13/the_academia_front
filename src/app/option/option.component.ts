import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable, of, forkJoin } from 'rxjs'; // Importe forkJoin
import { delay } from 'rxjs/operators';

// D\u00E9clarations pour les composants parents
import { HeaderComponent } from '../header/header.component'; // Ajustez le chemin
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component'; // Ajustez le chemin

// --- D\u00E9finition des interfaces pour les donn\u00E9es d'option et de fili\u00E8re (simul\u00E9es) ---
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

interface OptionEtudeCreate {
  nom_option: string;
  id_filiere: number;
  niveau?: string;
  description?: string;
}

interface OptionEtudeUpdate {
  nom_option?: string;
  id_filiere?: number;
  niveau?: string;
  description?: string;
}
// --- Fin des d\u00E9finitions d'interfaces ---


@Component({
  selector: 'app-option',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // N\u00E9cessaire pour [(ngModel)] sur le select et search input
    HeaderComponent,
    DashboardExamServiceComponent
  ],
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.css'] // Partage le m\u00EAme CSS pour les animations
})
export class OptionComponent implements OnInit {
  filieres: FiliereRead[] = []; // Liste des fili\u00E8res pour le filtre et le formulaire
  options: OptionEtudeRead[] = [];
  filteredOptions: OptionEtudeRead[] = [];
  optionForm: FormGroup;
  isEditMode: boolean = false;
  currentOptionId: number | null = null;
  searchTerm: string = '';
  selectedFiliereId: number | null = null; // Pour filtrer les options par fili\u00E8re
  showOptionModal: boolean = false;
  private toastTimeout: any;

  // Donn\u00E9es simul\u00E9es (doivent \u00EAtre coh\u00E9rentes entre fili\u00E8res et options)
  private mockFilieres: FiliereRead[] = [
    { id_filiere: 1, nom_filiere: 'Génie Logiciel', description: 'Développement de logiciels et applications.', created_at: new Date(), updated_at: new Date() },
    { id_filiere: 2, nom_filiere: 'Réseaux et Télécommunications', description: 'Conception et gestion des infrastructures réseau.', created_at: new Date(), updated_at: new Date() },
    { id_filiere: 3, nom_filiere: 'Intelligence Artificielle', description: 'Apprentissage automatique et science des données.', created_at: new Date(), updated_at: new Date() },
  ];
  private mockOptions: OptionEtudeRead[] = [
    { id_option_etude: 101, nom_option: 'SIL', id_filiere: 1, niveau: 'L3', description: 'Systèmes d\'Information et Logiciels', created_at: new Date(), updated_at: new Date() },
    { id_option_etude: 102, nom_option: 'GL', id_filiere: 1, niveau: 'M1', description: 'Génie Logiciel Avancé', created_at: new Date(), updated_at: new Date() },
    { id_option_etude: 103, nom_option: 'RT', id_filiere: 2, niveau: 'L3', description: 'Réseaux et Télécommunications', created_at: new Date(), updated_at: new Date() },
    { id_option_etude: 104, nom_option: 'IA-ML', id_filiere: 3, niveau: 'M2', description: 'Intelligence Artificielle et Machine Learning', created_at: new Date(), updated_at: new Date() },
    { id_option_etude: 105, nom_option: 'CYB', id_filiere: 2, niveau: 'M1', description: 'Cybersécurité des Réseaux', created_at: new Date(), updated_at: new Date() },
  ];
  private nextOptionId = 106; // Pour g\u00E9n\u00E9rer de nouveaux IDs

  constructor(
    private fb: FormBuilder,
  ) {
    this.optionForm = this.fb.group({
      nom_option: ['', Validators.required],
      id_filiere: [null, Validators.required], // Doit \u00EAtre s\u00E9lectionn\u00E9
      niveau: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Charger les fili\u00E8res d'abord, puis les options
    forkJoin({
      filieres: this._get_all_filieres(),
      options: this._get_all_options_etude()
    }).subscribe({
      next: (results) => {
        this.filieres = results.filieres;
        this.options = results.options;
        this.filterOptions(); // Appliquer le filtre initial
        this.showToast('Info', 'Données chargées (simulé).', 'info');
      },
      error: (err) => {
        console.error('Erreur lors du chargement des donn\u00E9es (simulé) :', err);
        this.showToast('Erreur', 'Impossible de charger les donn\u00E9es (simulé).', 'danger');
      }
    });
  }

  /**
   * Filtre les options affich\u00E9es en fonction du terme de recherche et de la fili\u00E8re s\u00E9lectionn\u00E9e.
   */
  filterOptions(): void {
    let tempOptions = [...this.options];

    // Filtrer par fili\u00E8re s\u00E9lectionn\u00E9e
    if (this.selectedFiliereId !== null) {
      tempOptions = tempOptions.filter(option => option.id_filiere === this.selectedFiliereId);
    }

    // Filtrer par terme de recherche
    if (this.searchTerm) {
      tempOptions = tempOptions.filter(option =>
        option.nom_option.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (option.description && option.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (option.niveau && option.niveau.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        this.getFiliereName(option.id_filiere).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.filteredOptions = tempOptions;
  }

  /**
   * R\u00E9cup\u00E8re le nom de la fili\u00E8re \u00E0 partir de son ID.
   * Utile pour l'affichage dans le tableau.
   * @param filiereId L'ID de la fili\u00E8re.
   * @returns Le nom de la fili\u00E8re ou 'Inconnu' si non trouv\u00E9.
   */
  getFiliereName(filiereId: number): string {
    const filiere = this.filieres.find(f => f.id_filiere === filiereId);
    return filiere ? filiere.nom_filiere : 'Inconnu';
  }

  /**
   * Ouvre la modale pour ajouter une nouvelle option.
   */
  openAddOptionModal(): void {
    this.isEditMode = false;
    this.currentOptionId = null;
    this.optionForm.reset();
    // Pr\u00E9-s\u00E9lectionner la fili\u00E8re si une est d\u00E9j\u00E0 filtr\u00E9e
    if (this.selectedFiliereId !== null) {
      this.optionForm.patchValue({ id_filiere: this.selectedFiliereId });
    }
    this.showOptionModal = true;
  }

  /**
   * Ouvre la modale pour modifier une option existante.
   * @param option L'option \u00E0 modifier.
   */
  openEditOptionModal(option: OptionEtudeRead): void {
    this.isEditMode = true;
    this.currentOptionId = option.id_option_etude;
    this.optionForm.patchValue(option); // Remplit le formulaire
    this.showOptionModal = true;
  }

  /**
   * Sauvegarde une option (cr\u00E9ation ou modification) via le service simul\u00E9.
   */
  saveOption(): void {
    if (this.optionForm.invalid) {
      this.optionForm.markAllAsTouched();
      this.showToast('Erreur', 'Veuillez remplir tous les champs requis.', 'danger');
      return;
    }

    const optionData: OptionEtudeCreate | OptionEtudeUpdate = this.optionForm.value;

    if (this.isEditMode && this.currentOptionId !== null) {
      this._update_option_etude(this.currentOptionId, optionData as OptionEtudeUpdate).subscribe({
        next: (updatedOption) => {
          if (updatedOption) {
            this.showToast('Succès', 'Option modifiée avec succès !', 'success');
            this.loadOptionsAndFilieres(); // Recharger les donn\u00E9es
            this.showOptionModal = false;
          } else {
            this.showToast('Erreur', 'Option non trouvée pour la modification.', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la modification de l\'option (simulé) :', err);
          this.showToast('Erreur', 'Impossible de modifier l\'option (simulé).', 'danger');
        }
      });
    } else {
      this._create_option_etude(optionData as OptionEtudeCreate).subscribe({
        next: (newOption) => {
          this.showToast('Succès', 'Option ajoutée avec succès !', 'success');
          this.loadOptionsAndFilieres(); // Recharger les donn\u00E9es
          this.showOptionModal = false;
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de l\'option (simulé) :', err);
          this.showToast('Erreur', 'Impossible d\'ajouter l\'option (simulé).', 'danger');
        }
      });
    }
  }

  /**
   * Demande confirmation et supprime une option via le service simul\u00E9.
   * @param id L'ID de l'option \u00E0 supprimer.
   */
  confirmDeleteOption(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette option ? Cette action est irréversible.')) {
      this._delete_option_etude(id).subscribe({
        next: (success) => {
          if (success) {
            this.showToast('Succès', 'Option supprimée avec succès !', 'success');
            this.loadOptionsAndFilieres(); // Recharger les donn\u00E9es
          } else {
            this.showToast('Erreur', 'Impossible de supprimer l\'option (non trouvée).', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'option (simulé) :', err);
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
    const toastElement = document.getElementById('optionToast'); // Utilise l'ID sp\u00E9cifique \u00E0 l'option
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
    const toastElement = document.getElementById('optionToast');
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
    return of([...this.mockOptions]).pipe(delay(500));
  }

  private _create_option_etude(option: OptionEtudeCreate): Observable<OptionEtudeRead> {
    const newOption: OptionEtudeRead = {
      id_option_etude: this.nextOptionId++,
      nom_option: option.nom_option,
      id_filiere: option.id_filiere,
      niveau: option.niveau,
      description: option.description,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.mockOptions.push(newOption);
    return of(newOption).pipe(delay(500));
  }

  private _update_option_etude(id: number, option: OptionEtudeUpdate): Observable<OptionEtudeRead | null> {
    const index = this.mockOptions.findIndex(o => o.id_option_etude === id);
    if (index > -1) {
      const updatedOption = { ...this.mockOptions[index], ...option, updated_at: new Date() };
      this.mockOptions[index] = updatedOption;
      return of(updatedOption).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  private _delete_option_etude(id: number): Observable<boolean> {
    const initialLength = this.mockOptions.length;
    this.mockOptions = this.mockOptions.filter(option => option.id_option_etude !== id);
    return of(this.mockOptions.length < initialLength).pipe(delay(500));
  }

  // Helper pour recharger les deux listes apr\u00E8s une op\u00E9ration CRUD
  private loadOptionsAndFilieres(): void {
    forkJoin({
      filieres: this._get_all_filieres(),
      options: this._get_all_options_etude()
    }).subscribe({
      next: (results) => {
        this.filieres = results.filieres;
        this.options = results.options;
        this.filterOptions();
      },
      error: (err) => {
        console.error('Erreur lors du rechargement des donn\u00E9es (simulé) :', err);
      }
    });
  }
}
