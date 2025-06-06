// dashboard-prof.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthentificationService } from '../../services/authentification/authentification.service';
import { AffectationEpreuveService } from '../../services/affectation/affectation-epreuve.service';
import { forkJoin } from 'rxjs';
import { MatiereService } from '../../services/matiere/matiere.service';
import { SessionExamensService } from '../../services/session/session-examens.service';
import { OptionEtudeService } from '../../services/option/option-etude.service';
import { EpreuveService } from '../../services/epreuve/epreuve.service';

interface EpreuveARendre {
  id_affectation: number;
  titre_epreuve: string;
  nom_session: string;
  nom_matiere: string;
  date_limite_soumission: Date;
  statut: 'En attente' | 'Remise' | 'En retard';
}

@Component({
  selector: 'app-professeur-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe
  ],
  templateUrl: './dashboard-prof.component.html',
  styleUrls: ['./dashboard-prof.component.css']
})
export class ProfesseurDashboardComponent implements OnInit {
  user: any = null;
  createdExamsCount = 0;
  examsToSubmitCount = 0;
  overdueExamsCount = 0;
  correctionsPending = 0;
  examsToSubmit: EpreuveARendre[] = [];
  recentExams: any[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private auth: AuthentificationService,
    private affectationService: AffectationEpreuveService,
    private matiereService: MatiereService,
    private sessionService: SessionExamensService,
    private optionService: OptionEtudeService,
    private epreuveService: EpreuveService
  ) { }

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    this.loadProfessorData();
  }

  async loadProfessorData() {
    try {
      // Récupérer toutes les affectations pour ce professeur
      const affectationsResponse = await this.affectationService.listerParProfesseur(this.user.id).toPromise();
      
      if (!affectationsResponse?.success) {
        throw new Error('Erreur de chargement des affectations');
      }
      
      const affectations = affectationsResponse.message;
      const now = new Date();
      
      // Filtrer les affectations sans épreuve (non rendues)
      const affectationsSansEpreuve = affectations.filter(a => !a.id_epreuve);
      this.examsToSubmitCount = affectationsSansEpreuve.length;
      
      // Traitement des affectations non rendues
      const examsToSubmitTemp: EpreuveARendre[] = [];
      this.overdueExamsCount = 0;
      
      for (const affectation of affectationsSansEpreuve) {
        const [matiere, session] = await Promise.all([
          this.matiereService.lireMatiere(affectation.id_matiere).toPromise(),
          this.sessionService.getSession(affectation.id_session_examen).toPromise()
        ]);
        
        const dateLimite = new Date(affectation.date_limite_soumission_prof);
        const statut = dateLimite < now ? 'En retard' : 'En attente';
        
        if (statut === 'En retard') this.overdueExamsCount++;
        
        examsToSubmitTemp.push({
          id_affectation: affectation.id_affectation_epreuve,
          titre_epreuve: matiere?.message.nom_matiere || 'Matière inconnue',
          nom_session: session?.message.nom_session || 'Session inconnue',
          nom_matiere: matiere?.message.nom_matiere || 'Matière inconnue',
          date_limite_soumission: dateLimite,
          statut
        });
      }
      
      // Trier par date limite et limiter à 3
      this.examsToSubmit = examsToSubmitTemp
        .sort((a, b) => a.date_limite_soumission.getTime() - b.date_limite_soumission.getTime())
        .slice(0, 3);
      
      // Récupération des examens créés
      const examsResponse = await this.epreuveService.lireEpreuvesParProfesseur(this.user.id).toPromise();
      this.createdExamsCount = examsResponse?.message?.length || 0;
      
      // Dernières épreuves créées (limité à 3)
      this.recentExams = (examsResponse?.message || [])
        .sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
      
      this.isLoading = false;
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      this.isLoading = false;
    }
  }

  createNewExam(): void {
    this.router.navigate(['/create-exam']);
  }

  viewExamsToSubmit(): void {
    this.router.navigate(['professeur/epreuve_a_rendre']);
  }

  viewExamDetails(examId: number): void {
    this.router.navigate(['/exam-details', examId]);
  }

  goToCreateEpreuve(affectationId: number): void {
    this.router.navigate(['professeur/creer_epreuve', affectationId]);
  }
}