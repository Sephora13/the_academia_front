import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AffectationEpreuveService } from '../../services/affectation/affectation-epreuve.service';
import { MatiereService } from '../../services/matiere/matiere.service';
import { SessionExamensService } from '../../services/session/session-examens.service';
import { OptionEtudeService } from '../../services/option/option-etude.service';
import { AuthentificationService } from '../../services/authentification/authentification.service';

interface EpreuveARendre {
  id_affectation: number;
  titre_epreuve: string;
  nom_session: string;
  nom_matiere: string;
  nom_option: string;
  date_limite_soumission: Date;
  statut: 'En attente' | 'Remise' | 'En retard';
}
interface SessionExamen {
  id: number;
  nom_session: string;
}
interface OptionEtude {
  id_option: number;
  nom_option: string;
}

@Component({
  selector: 'app-epreuve-a-rendre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './epreuve-a-rendre.component.html',
  styleUrls: ['./epreuve-a-rendre.component.css']
})
export class EpreuveARendreComponent implements OnInit {
  user: { id: number, nom: string, prenom: string } | null = null;
  epreuvesARendre: EpreuveARendre[] = [];
  filteredEpreuvesARendre: EpreuveARendre[] = [];
  searchTerm: string = '';
  selectedSessionId: number | null = null;
  selectedStatut: 'En attente' | 'Remise' | 'En retard' | null = null;

  sessions: SessionExamen[] = [];
  option: OptionEtude[] = [];
  availableStatuts: ('En attente' | 'Remise' | 'En retard')[] = ['En attente', 'Remise', 'En retard'];

  private toastTimeout: any;

  constructor(
    private router: Router,
    private affectationService: AffectationEpreuveService,
    private matiereService: MatiereService,
    private sessionService: SessionExamensService,
    private optionService: OptionEtudeService,
    private authService: AuthentificationService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadEpreuvesARendre();
  }

  private async loadEpreuvesARendre(): Promise<void> {
    try {
      this.user = this.authService.getUserInfo();
      if (this.user?.id) {
        const affectationsResponse = await this.affectationService
          .listerParProfesseur(this.user.id)
          .toPromise();
  
        if (!affectationsResponse?.success) throw new Error('Erreur de chargement');
  
        this.epreuvesARendre = [];
        this.sessions = [];
  
        for (const affectation of affectationsResponse.message) {
          const [matiere, session, option] = await Promise.all([
            this.matiereService.lireMatiere(affectation.id_matiere).toPromise(),
            this.sessionService.getSession(affectation.id_session_examen).toPromise(),
            this.optionService.lireOption(affectation.id_option_etude).toPromise()
          ]);
  
          if (session?.success) {
            this.sessions.push({
              id: session.message.id_session_examen,
              nom_session: session.message.nom_session
            });
          }
  
          const dateLimite = new Date(affectation.date_limite_soumission_prof);
          const now = new Date();
          const opt = option?.message as OptionEtude;
          const statut = affectation.id_epreuve 
            ? 'Remise' 
            : dateLimite < now 
              ? 'En retard' 
              : 'En attente';
  
          this.epreuvesARendre.push({
            id_affectation: affectation.id_affectation_epreuve,
            titre_epreuve: `${matiere?.message.nom_matiere} - ${opt.nom_option}`,
            nom_session: session?.message.nom_session || 'Non défini',
            nom_matiere: matiere?.message.nom_matiere || 'Non défini',
            nom_option: opt.nom_option || 'Non défini',
            date_limite_soumission: dateLimite,
            statut
          });
        }
        this.filterEpreuvesARendre();
      }
    } catch (error) {
      console.error('Erreur:', error);
      this.showToast('Erreur', 'Impossible de charger les épreuves', 'danger');
    }
  }

  /**
   * Filtre les épreuves \u00E0 rendre affichées en fonction des crit\u00E8res de recherche et des filtres.
   */
  filterEpreuvesARendre(): void {
    let tempEpreuves = [...this.epreuvesARendre];

    // Filtrer par session sélectionnée
    if (this.selectedSessionId !== null) {
      tempEpreuves = tempEpreuves.filter(epreuve => 
        this.sessions.some(s => s.id === this.selectedSessionId && s.nom_session === epreuve.nom_session)
      );
    }

    // Filtrer par statut sélectionné
    if (this.selectedStatut !== null) {
      tempEpreuves = tempEpreuves.filter(epreuve => epreuve.statut === this.selectedStatut);
    }

    // Filtrer par terme de recherche
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempEpreuves = tempEpreuves.filter(epreuve =>
        epreuve.titre_epreuve.toLowerCase().includes(lowerCaseSearchTerm) ||
        epreuve.nom_matiere.toLowerCase().includes(lowerCaseSearchTerm) ||
        epreuve.nom_session.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    this.filteredEpreuvesARendre = tempEpreuves;
  }

  /**
   * Navigue vers la page de création d'épreuve pour une affectation spécifique.
   * @param idAffectation L'ID de l'affectation pour laquelle créer l'épreuve.
   */
  goToCreateEpreuve(idAffectation: number): void {
    // Naviguez vers la page de création d'épreuve, en passant l'ID de l'affectation
    // La route '/creer-epreuve' sera \u00E0 définir dans votre module de routage Angular.
    this.router.navigate(['professeur/creer_epreuve', idAffectation]);
    this.showToast('Info', `Redirection vers la création de l'épreuve pour l'affectation #${idAffectation}.`, 'info');
  }

  /**
   * Affiche un message Toast.
   * @param title Titre du Toast.
   * @param message Contenu du message.
   * @param type Type de message pour le style (success, danger, info).
   */
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

  /**
   * Cache le message Toast.
   */
  hideToast(): void {
    const toastElement = document.getElementById('epreuveARendreToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}
