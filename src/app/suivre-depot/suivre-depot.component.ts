import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { Router } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component';
import { 
  AffectationEpreuveService,
  AffectationEpreuve
} from '../services/affectation-epreuve.service';
import { 
  SessionExamensService,
  SessionExamen 
} from '../services/session-examens.service';
import { MatiereService } from '../services/matiere.service';
import { OptionEtudeService } from '../services/option-etude.service';
import { GetPasswordService } from '../services/get-password.service';

interface Professor {
  nom: string;
  prenom: string;
  email: string;
}

interface AffectationEpreuveForSuivi extends AffectationEpreuve {
  nom_session: string;
  nom_matiere: string;
  nom_option: string;
  nom_professeur: string;
  statut_remise?: 'Remis à temps' | 'Remis en retard' | 'Non remis';
}

@Component({
  selector: 'app-suivre-depot',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    DashboardExamServiceComponent
  ],
  templateUrl: './suivre-depot.component.html',
  styleUrls: ['./suivre-depot.component.css']
})
export class SuivreDepotComponent implements OnInit {
  suiviDepots: AffectationEpreuveForSuivi[] = [];
  filteredSuiviDepots: AffectationEpreuveForSuivi[] = [];
  searchTerm: string = '';
  selectedSessionId: number | null = null;
  selectedStatutRemise: 'Remis à temps' | 'Remis en retard' | 'Non remis' | null = null;
  isLoading = true;

  sessions: SessionExamen[] = [];
  professors: Professor[] = [];
  availableStatutRemise = ['Remis à temps', 'Remis en retard', 'Non remis'];

  private toastTimeout: any;

  constructor(
    private router: Router,
    private affectationService: AffectationEpreuveService,
    private sessionService: SessionExamensService,
    private matiereService: MatiereService,
    private optionService: OptionEtudeService,
    private professorService: GetPasswordService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      const results = await forkJoin([
        this.sessionService.listerSessions(),
        this.affectationService.listerAffectations(),
        this.professorService.recuProf()
      ]).toPromise();
  
      if (!results) {
        throw new Error('Aucune donnée reçue');
      }
  
      const [sessionsRes, affectationsRes, professorsRes] = results;
  
      this.sessions = sessionsRes?.message || [];
      this.professors = professorsRes || [];
  
      const affectationsWithDetails = await Promise.all(
        (affectationsRes?.message || []).map(async (aff: AffectationEpreuve) => {
          const professor = this.getProfessorInfo(aff.id_professeur);
          
          return {
            ...aff,
            nom_session: this.getSessionName(aff.id_session_examen),
            nom_matiere: await this.getMatiereName(aff.id_matiere),
            nom_option: await this.getOptionName(aff.id_option_etude),
            nom_professeur: professor ? `${professor.prenom} ${professor.nom}` : 'Professeur inconnu',
            statut_remise: this.calculateStatutRemise(aff)
          };
        })
      );
  
      this.suiviDepots = affectationsWithDetails;
      this.filterSuiviDepots();
      this.isLoading = false;
  
    } catch (error) {
      console.error('Erreur de chargement:', error);
      this.showToast('Erreur', 'Échec du chargement des données', 'danger');
      this.isLoading = false;
    }
  }

  private getProfessorInfo(id_professeur: number): Professor | undefined {
    // Cette fonction doit être adaptée selon comment l'ID professeur est stocké dans votre système
    // Ici on suppose que l'index du tableau correspond à l'ID (à ajuster)
    return this.professors[id_professeur - 2];
  }

  private getSessionName(sessionId: number): string {
    const session = this.sessions.find(s => s.id_session_examen === sessionId);
    return session?.nom_session || 'Session inconnue';
  }

  private async getMatiereName(matiereId: number): Promise<string> {
    try {
      const res = await this.matiereService.lireMatiere(matiereId).toPromise();
      return res?.message?.nom_matiere || 'Matière inconnue';
    } catch (error) {
      return 'Matière inconnue';
    }
  }
  
  private async getOptionName(optionId: number): Promise<string> {
    try {
      const res = await this.optionService.lireOption(optionId).toPromise();
      
      // Vérification de type explicite
      if (res && typeof res.message !== 'string' && !Array.isArray(res.message)) {
        return res.message.nom_option;
      }
      return 'Option inconnue';
      
    } catch (error) {
      return 'Option inconnue';
    }
  }

  calculateStatutRemise(affectation: AffectationEpreuve): 'Remis à temps' | 'Remis en retard' | 'Non remis' {
    if (!affectation.id_epreuve) return 'Non remis';
  
    const createdAt = new Date(affectation.created_at);
    const updatedAt = new Date(affectation.updated_at);
  
    // Si l'affectation n'a jamais été modifiée
    if (updatedAt.getTime() === createdAt.getTime()) return 'Non remis';
  
    const dateLimite = new Date(affectation.date_limite_soumission_prof);
    dateLimite.setHours(23, 59, 59); // La remise peut se faire jusqu'à la fin du jour
  
    return updatedAt <= dateLimite ? 'Remis à temps' : 'Remis en retard';
  }
  

  filterSuiviDepots(): void {
    let tempSuivi = [...this.suiviDepots];

    if (this.selectedSessionId !== null) {
      tempSuivi = tempSuivi.filter(s => s.id_session_examen === this.selectedSessionId);
    }

    if (this.selectedStatutRemise !== null) {
      tempSuivi = tempSuivi.filter(s => s.statut_remise === this.selectedStatutRemise);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      tempSuivi = tempSuivi.filter(s =>
        s.nom_session.toLowerCase().includes(term) ||
        s.nom_matiere.toLowerCase().includes(term) ||
        s.nom_professeur.toLowerCase().includes(term) ||
        (s.commentaires_service_examens?.toLowerCase().includes(term)) ||
        s.statut_remise?.toLowerCase().includes(term)
      );
    }

    this.filteredSuiviDepots = tempSuivi;
  }

  markAsRemis(idAffectation: number): void {
    this.affectationService.ajouterEpreuve(idAffectation, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadData();
          this.showToast('Succès', 'Épreuve marquée comme remise', 'success');
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.showToast('Erreur', 'Échec de la mise à jour', 'danger');
      }
    });
  }

  viewAffectationDetails(idAffectation: number): void {
    this.router.navigate(['/affectations', idAffectation]);
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('suivreDepotToast');
    if (toastElement) {
      const toastTitle = toastElement.querySelector('.toast-title');
      const toastMessage = toastElement.querySelector('.toast-message');

      if (toastTitle && toastMessage) {
        toastTitle.textContent = title;
        toastMessage.textContent = message;

        const headerClass = type === 'success' ? 'bg-green-700' : 
                          type === 'danger' ? 'bg-red-700' : 'bg-blue-700';
        
        const bodyClass = type === 'success' ? 'bg-green-800' : 
                         type === 'danger' ? 'bg-red-800' : 'bg-blue-800';

        toastElement.querySelector('.toast-header-bg')?.classList.add(headerClass);
        toastElement.querySelector('.toast-body-bg')?.classList.add(bodyClass);

        toastElement.classList.remove('opacity-0');
        toastElement.classList.add('opacity-100');

        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => this.hideToast(), 3000);
      }
    }
  }

  hideToast(): void {
    const toastElement = document.getElementById('suivreDepotToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0');
    }
  }
}