import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable, of, forkJoin } from 'rxjs';
import { MatiereService } from '../services/matiere.service'; // Importez le service

// Déclarations pour les composants parents
import { HeaderComponent } from '../header/header.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component';


// Interfaces simplifiées
interface MatiereRead {
  id_matiere: number;
  nom_matiere: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

interface MatiereCreate {
  nom_matiere: string;
  description?: string;
}

interface MatiereUpdate {
  nom_matiere?: string;
  description?: string;
}

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
  matieres: MatiereRead[] = [];
  filteredMatieres: MatiereRead[] = [];
  matiereForm: FormGroup;
  isEditMode: boolean = false;
  currentMatiereId: number | null = null;
  searchTerm: string = '';
  showMatiereModal: boolean = false;
  private toastTimeout: any;

  constructor(
    private fb: FormBuilder,
    private matiereService: MatiereService
  ) {
    this.matiereForm = this.fb.group({
      nom_matiere: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadMatieres();
  }

  loadMatieres(): void {
    this.matiereService.lireMatieres().subscribe({
      next: (response) => {
        if (response.success) {
          this.matieres = (response.message as any[]).map(matiere => ({
            id_matiere: matiere.id_matiere,
            nom_matiere: matiere.nom_matiere,
            description: matiere.description,
            created_at: new Date(matiere.created_at),
            updated_at: new Date(matiere.updated_at)
          }));
          this.filterMatieres();
          this.showToast('Info', 'Données chargées.', 'info');
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des matières:', err);
        this.showToast('Erreur', 'Impossible de charger les matières.', 'danger');
      }
    });
  }

  filterMatieres(): void {
    if (this.searchTerm) {
      this.filteredMatieres = this.matieres.filter(matiere =>
        matiere.nom_matiere.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (matiere.description && matiere.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    } else {
      this.filteredMatieres = [...this.matieres];
    }
  }

  openAddMatiereModal(): void {
    this.isEditMode = false;
    this.currentMatiereId = null;
    this.matiereForm.reset();
    this.showMatiereModal = true;
  }

  openEditMatiereModal(matiere: MatiereRead): void {
    this.isEditMode = true;
    this.currentMatiereId = matiere.id_matiere;
    this.matiereForm.patchValue({
      nom_matiere: matiere.nom_matiere,
      description: matiere.description
    });
    this.showMatiereModal = true;
  }

  saveMatiere(): void {
    if (this.matiereForm.invalid) {
      this.matiereForm.markAllAsTouched();
      this.showToast('Erreur', 'Veuillez remplir tous les champs requis.', 'danger');
      return;
    }

    const formValue = this.matiereForm.value;

    if (this.isEditMode && this.currentMatiereId !== null) {
      const updateData: MatiereUpdate = {
        nom_matiere: formValue.nom_matiere,
        description: formValue.description
      };

      this.matiereService.mettreAJourMatiere(this.currentMatiereId, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showToast('Succès', 'Matière modifiée avec succès !', 'success');
            this.loadMatieres();
            this.showMatiereModal = false;
          }
        },
        error: (err) => {
          console.error('Erreur lors de la modification de la matière:', err);
          this.showToast('Erreur', 'Impossible de modifier la matière.', 'danger');
        }
      });
    } else {
      const createData: MatiereCreate = {
        nom_matiere: formValue.nom_matiere,
        description: formValue.description
      };

      this.matiereService.creerMatiere(createData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showToast('Succès', 'Matière ajoutée avec succès !', 'success');
            this.loadMatieres();
            this.showMatiereModal = false;
          }
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de la matière:', err);
          this.showToast('Erreur', 'Impossible d\'ajouter la matière.', 'danger');
        }
      });
    }
  }

  confirmDeleteMatiere(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ? Cette action est irréversible.')) {
      this.matiereService.supprimerMatiere(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showToast('Succès', 'Matière supprimée avec succès !', 'success');
            this.loadMatieres();
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la matière:', err);
          this.showToast('Erreur', 'Une erreur est survenue lors de la suppression.', 'danger');
        }
      });
    }
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('matiereToast');
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
    const toastElement = document.getElementById('matiereToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}
