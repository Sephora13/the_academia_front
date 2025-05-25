import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component'; 
import { FiliereService } from '../services/filiere.service';

// Interfaces pour les données de filière
interface FiliereRead {
  id_filiere: number;
  nom_filiere: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface FiliereCreate {
  nom_filiere: string;
  description?: string;
}

interface FiliereUpdate {
  nom_filiere?: string;
  description?: string;
}

interface ApiResponse {
  success: boolean;
  status: number;
  message: FiliereRead[];
}

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
  showFiliereModal: boolean = false;
  private toastTimeout: any;

  constructor(
    private fb: FormBuilder,
    private filiereService: FiliereService
  ) {
    this.filiereForm = this.fb.group({
      nom_filiere: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadFilieres();
  }

  loadFilieres(): void {
    this.filiereService.lireFilieres().subscribe({
      next: (response: ApiResponse) => {
        if (response.success && response.message) {
          this.filieres = response.message;
          this.filterFilieres();
          this.showToast('Info', 'Filières chargées avec succès.', 'info');
        } else {
          this.showToast('Info', 'Aucune filière trouvée.', 'info');
          this.filieres = [];
          this.filterFilieres();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des filières :', err);
        this.showToast('Erreur', 'Impossible de charger les filières.', 'danger');
        this.filieres = [];
        this.filterFilieres();
      }
    });
  }

  filterFilieres(): void {
    if (!this.filieres || !Array.isArray(this.filieres)) {
      this.filteredFilieres = [];
      return;
    }

    if (this.searchTerm) {
      this.filteredFilieres = this.filieres.filter(filiere =>
        filiere.nom_filiere.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (filiere.description && filiere.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    } else {
      this.filteredFilieres = [...this.filieres];
    }
  }

  openAddFiliereModal(): void {
    this.isEditMode = false;
    this.currentFiliereId = null;
    this.filiereForm.reset();
    this.showFiliereModal = true;
  }

  openEditFiliereModal(filiere: FiliereRead): void {
    this.isEditMode = true;
    this.currentFiliereId = filiere.id_filiere;
    this.filiereForm.patchValue({
      nom_filiere: filiere.nom_filiere,
      description: filiere.description
    });
    this.showFiliereModal = true;
  }

  saveFiliere(): void {
    if (this.filiereForm.invalid) {
      this.filiereForm.markAllAsTouched();
      this.showToast('Erreur', 'Veuillez remplir tous les champs requis.', 'danger');
      return;
    }

    const filiereData = this.filiereForm.value;

    if (this.isEditMode && this.currentFiliereId !== null) {
      this.filiereService.mettreAJourFiliere(this.currentFiliereId, filiereData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showToast('Succès', 'Filière modifiée avec succès !', 'success');
            this.loadFilieres();
            this.showFiliereModal = false;
          } else {
            this.showToast('Erreur', response.message || 'Erreur lors de la modification', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la modification de la filière :', err);
          this.showToast('Erreur', 'Impossible de modifier la filière.', 'danger');
        }
      });
    } else {
      this.filiereService.creerFiliere(filiereData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showToast('Succès', 'Filière ajoutée avec succès !', 'success');
            this.loadFilieres();
            this.showFiliereModal = false;
          } else {
            this.showToast('Erreur', response.message || 'Erreur lors de l\'ajout', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de la filière :', err);
          this.showToast('Erreur', 'Impossible d\'ajouter la filière.', 'danger');
        }
      });
    }
  }

  confirmDeleteFiliere(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette filière ? Cette action est irréversible.')) {
      this.filiereService.supprimerFiliere(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showToast('Succès', 'Filière supprimée avec succès !', 'success');
            this.loadFilieres();
          } else {
            this.showToast('Erreur', response.message || 'Erreur lors de la suppression', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la filière :', err);
          this.showToast('Erreur', 'Une erreur est survenue lors de la suppression.', 'danger');
        }
      });
    }
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('filiereToast');
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
    const toastElement = document.getElementById('filiereToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}