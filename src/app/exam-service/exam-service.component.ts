import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component';
import { SessionExamensService } from '../services/session/session-examens.service';
import { AffectationEpreuveService } from '../services/affectation/affectation-epreuve.service';
import { GetPasswordService } from '../services/get_info/get-password.service';
import { forkJoin } from 'rxjs';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-exam-service',
  standalone: true,
  imports: [DashboardExamServiceComponent, CommonModule, HeaderComponent],
  templateUrl: './exam-service.component.html',
  styleUrls: ['./exam-service.component.css']
})
export class ExamServiceComponent implements OnInit {
  // Statistiques
  activeSessionsCount: number = 0;
  plannedSessionsCount: number = 0;
  totalAssignments: number = 0;
  totalProfessors: number = 0;
  lateAssignmentsCount: number = 0;
  pendingAssignmentsCount: number = 0;
  totalCopie: number = 0;

  // Données
  upcomingSessions: any[] = [];
  lateAssignments: any[] = [];
  recentResults: any[] = [];
  isDataLoaded = false;

  constructor(
    private router: Router,
    private sessionService: SessionExamensService,
    private affectationService: AffectationEpreuveService,
    private professorService: GetPasswordService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    forkJoin({
      sessions: this.sessionService.listerSessions(),
      affectations: this.affectationService.listerAffectations(),
      professors: this.professorService.recuProf()
    }).subscribe({
      next: (results) => {
        // Traitement des sessions
        const sessions = results.sessions?.message || [];
        this.activeSessionsCount = sessions.filter(s => s.statut_session === 'En cours').length;
        this.plannedSessionsCount = sessions.filter(s => s.statut_session === 'Planifiée').length;
        
        // Sessions à venir (limité à 3)
        this.upcomingSessions = sessions
          .filter(s => s.statut_session === 'Planifiée' || s.statut_session === 'En cours')
          .slice(0, 3)
          .map(session => ({
            ...session,
            date_debut: new Date(session.date_debut_session).toLocaleDateString(),
            date_fin: new Date(session.date_fin_session).toLocaleDateString()
          }));

        // Traitement des affectations
        const affectations = results.affectations?.message || [];
        this.totalAssignments = affectations.length;
        
        // Affectations en retard ou à venir
        const now = new Date();
        this.lateAssignments = affectations.filter(a => {
          const dueDate = new Date(a.date_limite_soumission_prof);
          return dueDate < now && a.statut_affectation !== 'terminee';
        });
        
        this.lateAssignmentsCount = this.lateAssignments.length;
        this.pendingAssignmentsCount = affectations.filter(a => {
          const dueDate = new Date(a.date_limite_soumission_prof);
          return dueDate > now && a.statut_affectation !== 'terminee';
        }).length;

        // Traitement des professeurs
        this.totalProfessors = results.professors?.length || 0;
        
        this.isDataLoaded = true;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
      }
    });
  }

  goToSession(sessionId: number) {
    this.router.navigate(['planifier_session', sessionId]);
  }

  goToTracking() {
    this.router.navigate(['gerer_sessions']);
  }

  createSession() {
    this.router.navigate(['gerer_sessions']);
  }

  suivreDepot() {
    this.router.navigate(['suivi_depots']);
  }

  assignExam() {
    this.router.navigate(['/sessions']);
  }
}