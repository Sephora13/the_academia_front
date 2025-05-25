import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { HeaderComponent } from '../header/header.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component';
import { OptionEtudeService } from '../services/option-etude.service';
import { FiliereService } from '../services/filiere.service';

// Interfaces pour les données
interface FiliereRead {
  id_filiere: number;
  nom_filiere: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface OptionEtudeRead {
  id_option_etude: number;
  nom_option: string;
  id_filiere: number;
  niveau?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface OptionEtudeCreate {
  nom_option: string;
  id_filiere: number;
  niveau?: string;
  description?: string;
}

interface ApiResponse {
  success: boolean;
  status: number;
  message: any;
}

@Component({
  selector: 'app-option',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    DashboardExamServiceComponent
  ],
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.css']
})
export class OptionComponent implements OnInit {
  filieres: FiliereRead[] = [];
  options: OptionEtudeRead[] = [];
  filteredOptions: OptionEtudeRead[] = [];
  optionForm: FormGroup;
  isEditMode: boolean = false;
  currentOptionId: number | null = null;
  searchTerm: string = '';
  selectedFiliereId: number | null = null;
  showOptionModal: boolean = false;
  private toastTimeout: any;

  constructor(
    private fb: FormBuilder,
    private optionService: OptionEtudeService,
    private filiereService: FiliereService
  ) {
    this.optionForm = this.fb.group({
      nom_option: ['', Validators.required],
      id_filiere: [null, Validators.required],
      niveau: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      filieres: this.filiereService.lireFilieres(),
      options: this.optionService.lireOptions()
    }).subscribe({
      next: (results: { filieres: ApiResponse, options: ApiResponse }) => {
        if (results.filieres.success && results.filieres.message) {
          this.filieres = results.filieres.message;
        }
        if (results.options.success && results.options.message) {
          this.options = results.options.message;
          this.filterOptions();
          this.showToast('Info', 'Données chargées avec succès.', 'info');
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données :', err);
        this.showToast('Erreur', 'Impossible de charger les données.', 'danger');
      }
    });
  }

  filterOptions(): void {
    if (!this.options || !Array.isArray(this.options)) {
      this.filteredOptions = [];
      return;
    }

    let tempOptions = [...this.options];

    // Filtrer par filière sélectionnée
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

  getFiliereName(filiereId: number): string {
    const filiere = this.filieres.find(f => f.id_filiere === filiereId);
    return filiere ? filiere.nom_filiere : 'Inconnu';
  }

  openAddOptionModal(): void {
    this.isEditMode = false;
    this.currentOptionId = null;
    this.optionForm.reset();
    if (this.selectedFiliereId !== null) {
      this.optionForm.patchValue({ id_filiere: this.selectedFiliereId });
    }
    this.showOptionModal = true;
  }

  openEditOptionModal(option: OptionEtudeRead): void {
    this.isEditMode = true;
    this.currentOptionId = option.id_option_etude;
    this.optionForm.patchValue(option);
    this.showOptionModal = true;
  }

  saveOption(): void {
    if (this.optionForm.invalid) {
      this.optionForm.markAllAsTouched();
      this.showToast('Erreur', 'Veuillez remplir tous les champs requis.', 'danger');
      return;
    }

    const optionData = this.optionForm.value;

    if (this.isEditMode && this.currentOptionId !== null) {
      this.optionService.mettreAJourOption(this.currentOptionId, optionData).subscribe({
        next: (response: ApiResponse) => {
          if (response.success) {
            this.showToast('Succès', 'Option modifiée avec succès !', 'success');
            this.loadData();
            this.showOptionModal = false;
          } else {
            this.showToast('Erreur', response.message || 'Erreur lors de la modification', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la modification de l\'option :', err);
          this.showToast('Erreur', 'Impossible de modifier l\'option.', 'danger');
        }
      });
    } else {
      this.optionService.creerOption(optionData).subscribe({
        next: (response: ApiResponse) => {
          if (response.success) {
            this.showToast('Succès', 'Option ajoutée avec succès !', 'success');
            this.loadData();
            this.showOptionModal = false;
          } else {
            this.showToast('Erreur', response.message || 'Erreur lors de l\'ajout', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de l\'option :', err);
          this.showToast('Erreur', 'Impossible d\'ajouter l\'option.', 'danger');
        }
      });
    }
  }

  confirmDeleteOption(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette option ? Cette action est irréversible.')) {
      this.optionService.supprimerOption(id).subscribe({
        next: (response: ApiResponse) => {
          if (response.success) {
            this.showToast('Succès', 'Option supprimée avec succès !', 'success');
            this.loadData();
          } else {
            this.showToast('Erreur', response.message || 'Erreur lors de la suppression', 'danger');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'option :', err);
          this.showToast('Erreur', 'Une erreur est survenue lors de la suppression.', 'danger');
        }
      });
    }
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('optionToast');
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
    const toastElement = document.getElementById('optionToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}