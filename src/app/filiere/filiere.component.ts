import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { HeaderComponent } from '../header/header.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component'; 

// --- D\u00E9finition des interfaces pour les donn\u00E9es de fili\u00E8re (simul\u00E9es) ---
interface FiliereRead {
  id_filiere: number;
  nom_filiere: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

interface FiliereCreate {
  nom_filiere: string;
  description?: string;
}

interface FiliereUpdate {
  nom_filiere?: string;
  description?: string;
}
// --- Fin des d\u00E9finitions d'interfaces ---


@Component({
  selector: 'app-filiere',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    DashboardExamServiceComponent,
    FormsModule
  ],
  templateUrl: './filiere.component.html',
  styleUrls: ['./filiere.component.css']
})
export class FiliereComponent implements OnInit {
  filieres: FiliereRead[] = [];
  filteredFilieres: FiliereRead[] = [];
  filiereForm: FormGroup;
  isEditMode: boolean = false;
  currentFiliereId: number | null = null;
  searchTerm: string = '';
  showFiliereModal: boolean = false; // Contr\u00F4le la visibilit\u00E9 de la modale
  private toastTimeout: any; // Pour g\u00E9rer le timeout du toast

  // Donn\u00E9es de fili\u00E8re simul\u00E9es
  private mockFilieres: FiliereRead[] = [
    { id_filiere: 1, nom_filiere: 'Génie Logiciel', description: 'Développement de logiciels et applications.', created_at: new Date(), updated_at: new Date() },
    { id_filiere: 2, nom_filiere: 'Réseaux et Télécommunications', description: 'Conception et gestion des infrastructures réseau.', created_at: new Date(), updated_at: new Date() },
    { id_filiere: 3, nom_filiere: 'Intelligence Artificielle', description: 'Apprentissage automatique et science des données.', created_at: new Date(), updated_at: new Date() },
    { id_filiere: 4, nom_filiere: 'Cybersécurité', description: 'Protection des systèmes et données informatiques.', created_at: new Date(), updated_at: new Date() }
  ];
  private nextFiliereId = 5; // Pour g\u00E9n\u00E9rer de nouveaux IDs

  constructor(
    private fb: FormBuilder,
  ) {
    this.filiereForm = this.fb.group({
      nom_filiere: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadFilieres();
  }

  /**
   * Simule le chargement de toutes les fili\u00E8res depuis un service.
   */
  loadFilieres(): void {
    this._get_all_filieres().subscribe({
      next: (data: FiliereRead[]) => {
        this.filieres = data;
        this.filterFilieres(); // Appliquer le filtre initial au chargement
        this.showToast('Info', 'Filières chargées (simulé).', 'info');
      },
      error: (err) => {
        console.error('Erreur lors du chargement des filières (simulé) :', err);
        this.showToast('Erreur', 'Impossible de charger les filières (simulé).', 'danger');
      }
    });
  }

  /**
   * Filtre les fili\u00E8res affich\u00E9es en fonction du terme de recherche.
   */
  filterFilieres(): void {
    if (this.searchTerm) {
      this.filteredFilieres = this.filieres.filter(filiere =>
        filiere.nom_filiere.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (filiere.description && filiere.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    } else {
      this.filteredFilieres = [...this.filieres];
    }
  }

  /**
   * Ouvre la modale pour ajouter une nouvelle fili\u00E8re.
   */
  openAddFiliereModal(): void {
    this.isEditMode = false;
    this.currentFiliereId = null;
    this.filiereForm.reset(); // R\u00E9initialise le formulaire
    this.showFiliereModal = true; // Affiche la modale
  }

  /**
   * Ouvre la modale pour modifier une fili\u00E8re existante.
   * @param filiere La fili\u00E8re \u00E0 modifier.
   */
  openEditFiliereModal(filiere: FiliereRead): void {
    this.isEditMode = true;
    this.currentFiliereId = filiere.id_filiere;
    this.filiereForm.patchValue(filiere); // Remplit le formulaire avec les donn\u00E9es de la fili\u00E8re
    this.showFiliereModal = true; // Affiche la modale
  }

  /**
   * Sauvegarde une fili\u00E8re (cr\u00E9ation ou modification) via le service simul\u00E9.
   */
  saveFiliere(): void {
    if (this.filiereForm.invalid) {
      this.filiereForm.markAllAsTouched(); // Affiche les erreurs de validation
      this.showToast('Erreur', 'Veuillez remplir tous les champs requis.', 'danger');
      return;
    }

    const filiereData: FiliereCreate | FiliereUpdate = this.filiereForm.value;

    if (this.isEditMode && this.currentFiliereId !== null) {
      this._update_filiere(this.currentFiliereId, filiereData as FiliereUpdate).subscribe({
        next: (updatedFiliere) => {
          if (updatedFiliere) {
            this.showToast('Succès', 'Filière modifiée avec succès !', 'success');
            this.loadFilieres(); // Recharger la liste
            this.showFiliereModal = false; // Cache la modale
          } else {
            this.showToast('Erreur', 'Filière non trouvée pour la modification.', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la modification de la filière (simulé) :', err);
          this.showToast('Erreur', 'Impossible de modifier la filière (simulé).', 'danger');
        }
      });
    } else {
      this._create_filiere(filiereData as FiliereCreate).subscribe({
        next: (newFiliere) => {
          this.showToast('Succès', 'Filière ajoutée avec succès !', 'success');
          this.loadFilieres(); // Recharger la liste
          this.showFiliereModal = false; // Cache la modale
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de la filière (simulé) :', err);
          this.showToast('Erreur', 'Impossible d\'ajouter la filière (simulé).', 'danger');
        }
      });
    }
  }

  /**
   * Demande confirmation et supprime une fili\u00E8re via le service simul\u00E9.
   * @param id L'ID de la fili\u00E8re \u00E0 supprimer.
   */
  confirmDeleteFiliere(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette filière ? Cette action est irréversible.')) {
      this._delete_filiere(id).subscribe({
        next: (success) => {
          if (success) {
            this.showToast('Succès', 'Filière supprimée avec succès !', 'success');
            this.loadFilieres(); // Recharger la liste
          } else {
            this.showToast('Erreur', 'Impossible de supprimer la filière (non trouvée).', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la filière (simulé) :', err);
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
    const toastElement = document.getElementById('filiereToast');
    if (toastElement) {
      const toastTitleElement = toastElement.querySelector('.toast-title');
      const toastMessageElement = toastElement.querySelector('.toast-message');

      if (toastTitleElement && toastMessageElement) {
        toastTitleElement.textContent = title;
        toastMessageElement.textContent = message;

        // R\u00E9initialise et ajoute la classe de couleur pour le header et body du toast
        const header = toastElement.querySelector('.toast-header-bg') as HTMLElement;
        const body = toastElement.querySelector('.toast-body-bg') as HTMLElement;

        // Nettoyage des classes pr\u00E9c\u00E9dentes
        header.classList.remove('bg-green-700', 'bg-red-700', 'bg-blue-700');
        body.classList.remove('bg-green-800', 'bg-red-800', 'bg-blue-800');

        // Ajout des nouvelles classes Tailwind
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

        // Affiche le toast
        toastElement.classList.remove('opacity-0', 'pointer-events-none');
        toastElement.classList.add('opacity-100');

        // Cache le toast apr\u00E8s 3 secondes
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
    const toastElement = document.getElementById('filiereToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }


  // --- M\u00E9thodes de simulation du service ---

  private _get_all_filieres(): Observable<FiliereRead[]> {
    return of([...this.mockFilieres]).pipe(delay(500));
  }

  private _create_filiere(filiere: FiliereCreate): Observable<FiliereRead> {
    const newFiliere: FiliereRead = {
      id_filiere: this.nextFiliereId++,
      nom_filiere: filiere.nom_filiere,
      description: filiere.description,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.mockFilieres.push(newFiliere);
    return of(newFiliere).pipe(delay(500));
  }

  private _update_filiere(id: number, filiere: FiliereUpdate): Observable<FiliereRead | null> {
    const index = this.mockFilieres.findIndex(f => f.id_filiere === id);
    if (index > -1) {
      const updatedFiliere = { ...this.mockFilieres[index], ...filiere, updated_at: new Date() };
      this.mockFilieres[index] = updatedFiliere;
      return of(updatedFiliere).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  private _delete_filiere(id: number): Observable<boolean> {
    const initialLength = this.mockFilieres.length;
    this.mockFilieres = this.mockFilieres.filter(filiere => filiere.id_filiere !== id);
    return of(this.mockFilieres.length < initialLength).pipe(delay(500));
  }
}
