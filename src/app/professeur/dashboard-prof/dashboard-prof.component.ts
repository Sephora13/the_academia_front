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
  examsToSubmit: any[] = [];
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
      this.examsToSubmitCount = affectations.length;
      
      // Traitement des affectations
      const now = new Date();
      this.overdueExamsCount = 0;
      const examsToSubmitTemp = [];
      
      for (const affectation of affectations) {
        // Récupérer les détails supplémentaires
        const [matiere, session, option] = await Promise.all([
          this.matiereService.lireMatiere(affectation.id_matiere).toPromise(),
          this.sessionService.getSession(affectation.id_session_examen).toPromise(),
          this.optionService.lireOption(affectation.id_option_etude).toPromise()
        ]);
        
        const dateLimite = new Date(affectation.date_limite_soumission_prof);
        const isOverdue = dateLimite < now && !affectation.id_epreuve;
        
        if (isOverdue) this.overdueExamsCount++;
        
        examsToSubmitTemp.push({
          id: affectation.id_affectation_epreuve,
          title: matiere?.message.nom_matiere || 'Matière inconnue',
          session: session?.message.nom_session || 'Session inconnue',
          option: (typeof option?.message === 'object' && 'nom_option' in option.message)
  ? (option.message as any).nom_option
  : 'Option inconnue',

          dueDate: dateLimite,
          isOverdue
        });
      }
      
      // Trier et limiter à 3 éléments
      this.examsToSubmit = examsToSubmitTemp
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 3);
      
      // Récupération des examens créés (limité à 3)
      const examsResponse = await this.epreuveService.lireEpreuvesParProfesseur(this.user.id).toPromise();
      this.createdExamsCount = examsResponse?.message?.length || 0;
      this.recentExams = (examsResponse?.message || [])
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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

  viewCreatedExams(): void {
    this.router.navigate(['/view-created-exams']);
  }

  viewExamDetails(examId: number): void {
    this.router.navigate(['/exam-details', examId]);
  }

  goToCreateEpreuve(affectationId: number): void {
    this.router.navigate(['professeur/creer_epreuve', affectationId]);
  }
}