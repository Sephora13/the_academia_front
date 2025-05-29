import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Nécessaire pour ngModel
import { Router, RouterModule } from '@angular/router';
import { AuthentificationService } from '../../services/authentification/authentification.service';
import { MakeEpreuveByIaService } from '../../services/professeur/make-epreuve-by-ia.service';
import { Observable, of, forkJoin } from 'rxjs';
import { delay } from 'rxjs/operators';

// --- Définition des interfaces pour les données ---
interface Epreuve {
  id_epreuve: number;
  titre_epreuve: string;
  duree: string;
  niveau: string;
  date: Date;
  id_professeur: number;
  id_affectation: number;
  icon?: string;
  id_session: number | null;
  statut: string | null;
}

interface SessionExamen {
  id_session: number;
  nom: string;
}

@Component({
  selector: 'app-show-epreuve',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './show-epreuve.component.html',
  styleUrls: ['./show-epreuve.component.css']
})
export class ShowEpreuveComponent implements OnInit {
  user: { id: number, nom: string, prenom: string } | null = null;
  epreuves: Epreuve[] = [];
  filteredEpreuvesARendre: Epreuve[] = [];
  searchTerm: string = '';
  selectedSessionId: number | null = null;
  selectedStatut: 'En attente de création' | 'Remise' | 'En retard' | null = null;
  sessions: SessionExamen[] = [];
  availableStatuts: ('En attente de création' | 'Remise' | 'En retard')[] = ['En attente de création', 'Remise', 'En retard'];
  loading = true;
  error: string | null = null;
  private toastTimeout: any;

  constructor(
    private router: Router,
    private auth: AuthentificationService,
    private makeEpreuveByIaService: MakeEpreuveByIaService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    if (this.user && this.user.id) {
      this.loadEpreuves(this.user.id);
    } else {
      console.error("ID professeur manquant. Impossible de charger les épreuves.");
      this.error = "Impossible de charger les épreuves : informations utilisateur manquantes.";
      this.loading = false;
    }
  }

  loadEpreuves(idProfesseur: number): void {
    this.loading = true;
    this.error = null;

    this.makeEpreuveByIaService.getEpreuvesByProfesseurId(idProfesseur).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.message)) {
          this.epreuves = response.message.map((epreuveItem: any) => ({
            id_epreuve: epreuveItem.id_epreuve,
            titre: epreuveItem.titre,
            duree: epreuveItem.duree,
            niveau: epreuveItem.niveau,
            date: new Date(epreuveItem.created_at),
            id_professeur: epreuveItem.id_professeur,
            icon: 'https://cdn-icons-png.flaticon.com/128/1945/1945985.png'
          }));
          this.filterEpreuvesARendre(); // Appliquer le filtre initial
        } else {
          this.error = response.message?.message || response.message || 'Une erreur est survenue lors du chargement des épreuves.';
          this.epreuves = [];
        }
      },
      error: (err) => {
        this.error = 'Désolé, une erreur technique est survenue lors du chargement des épreuves.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  filterEpreuvesARendre(): void {
    let tempEpreuves = [...this.epreuves];

    if (this.selectedSessionId !== null) {
      tempEpreuves = tempEpreuves.filter(epreuve => epreuve.id_session === this.selectedSessionId);
    }

    if (this.selectedStatut !== null) {
      tempEpreuves = tempEpreuves.filter(epreuve => epreuve.statut === this.selectedStatut);
    }

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempEpreuves = tempEpreuves.filter(epreuve =>
        epreuve.titre_epreuve.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    this.filteredEpreuvesARendre = tempEpreuves;
  }

  goToCreateEpreuve(idAffectation: number): void {
    this.router.navigate(['professeur/creer_epreuve', idAffectation]);
    this.showToast('Info', `Redirection vers la création de l'épreuve pour l'affectation #${idAffectation}.`, 'info');
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('epreuveARendreToast');
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
    const toastElement = document.getElementById('epreuveARendreToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}