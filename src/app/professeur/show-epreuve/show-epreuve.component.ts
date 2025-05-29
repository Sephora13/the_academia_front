import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthentificationService } from '../../services/authentification.service';
import { AffectationEpreuveService } from '../../services/affectation-epreuve.service';
import { MatiereService } from '../../services/matiere.service';
import { SessionExamensService } from '../../services/session-examens.service';

interface EpreuveARendre {
  id_affectation: number;
  titre_epreuve: string;
  nom_session: string;
  nom_matiere: string;
  date_limite_soumission: Date;
  statut: 'En attente de création' | 'Remise' | 'En retard';
  id_epreuve?: number;
}

interface SessionExamen {
  id_session: number;
  nom: string;
}

@Component({
  selector: 'app-show-epreuve',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './show-epreuve.component.html',
  styleUrls: ['./show-epreuve.component.css']
})
export class ShowEpreuveComponent implements OnInit {
  user: { id: number, nom: string, prenom: string } | null = null;
  epreuves: EpreuveARendre[] = [];
  filteredEpreuvesARendre: EpreuveARendre[] = [];
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
    private affectationService: AffectationEpreuveService,
    private matiereService: MatiereService,
    private sessionService: SessionExamensService
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

    // Charger les données nécessaires
    forkJoin({
      affectations: this.affectationService.listerParProfesseur(idProfesseur),
      matieres: this.matiereService.lireMatieres(),
      sessions: this.sessionService.listerSessions()
    }).subscribe({
      next: (results: any) => {
        if (results.affectations.success && results.matieres.success && results.sessions.success) {
          const affectations = results.affectations.message;
          const matieres = results.matieres.message;
          this.sessions = results.sessions.message;

          // Préparer les promesses pour les noms de session
          const sessionPromises = affectations.map((affectation: any) => 
            this.sessionService.getSession(affectation.id_session_examen).toPromise()
          );

          // Résoudre toutes les promesses de session
          Promise.all(sessionPromises).then(sessionResponses => {
            this.epreuves = affectations.map((affectation: any, index: number) => {
              const sessionResponse = sessionResponses[index];
              const matiere = matieres.find((m: any) => m.id_matiere === affectation.id_matiere);
              const nom_session = sessionResponse?.success 
                ? sessionResponse.message.nom_session 
                : 'Session inconnue';

              // Calculer le statut
              const now = new Date();
              const dateLimite = new Date(affectation.date_limite_soumission_prof);
              let statut: 'En attente de création' | 'Remise' | 'En retard';
              
              if (affectation.id_epreuve) {
                statut = 'Remise';
              } else if (dateLimite < now) {
                statut = 'En retard';
              } else {
                statut = 'En attente de création';
              }

              return {
                id_affectation: affectation.id_affectation_epreuve,
                titre_epreuve: matiere?.nom_matiere 
                  ? `Épreuve de ${matiere.nom_matiere}` 
                  : 'Épreuve sans titre',
                nom_matiere: matiere?.nom_matiere || 'Matière inconnue',
                nom_session: nom_session,
                date_limite_soumission: dateLimite,
                statut: statut,
                id_epreuve: affectation.id_epreuve
              };
            });
            
            this.filterEpreuvesARendre();
            this.loading = false;
          });
        } else {
          this.error = 'Erreur lors du chargement des données.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Désolé, une erreur technique est survenue lors du chargement des épreuves.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  filterEpreuvesARendre(): void {
    let tempEpreuves = [...this.epreuves];

    if (this.selectedSessionId !== null) {
      tempEpreuves = tempEpreuves.filter(epreuve => 
        this.sessions.some(s => s.id_session === this.selectedSessionId && s.nom === epreuve.nom_session)
      );
    }

    if (this.selectedStatut !== null) {
      tempEpreuves = tempEpreuves.filter(epreuve => epreuve.statut === this.selectedStatut);
    }

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

  goToCreateEpreuve(idAffectation: number): void {
    this.router.navigate(['professeur/creer_epreuve', idAffectation]);
    this.showToast('Info', `Redirection vers la création de l'épreuve pour l'affectation #${idAffectation}.`, 'info');
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    
  }

  hideToast(): void {
    
  }
}