import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthentificationService } from '../services/authentification/authentification.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CopieNumeriqueService } from '../services/copie/copie-numerique.service';
import { EpreuveService } from '../services/epreuve/epreuve.service';
import { SessionExamensService } from '../services/session/session-examens.service';
import { MatiereService } from '../services/matiere/matiere.service';
import { AffectationEpreuveService } from '../services/affectation/affectation-epreuve.service';

@Component({
  selector: 'app-dashboard-etudiant',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard-etudiant.component.html',
  styleUrls: ['./dashboard-etudiant.component.css']
})
export class DashboardEtudiantComponents implements OnInit {
  user: any = null;
  isSidebarOpen = true;
  
  // Statistiques
  averageGrade = 0;
  yearProgress = 0;
  examsTaken = 0;
  resitExams = 0;
  
  // Données
  upcomingExams: any[] = [];
  examResults: any[] = [];
  isLoading = true;

  constructor(
    private auth: AuthentificationService,
    public router: Router,
    private copieService: CopieNumeriqueService,
    private epreuveService: EpreuveService,
    private sessionService: SessionExamensService,
    private matiereService: MatiereService,
    private affectationService: AffectationEpreuveService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo2();
    if (this.user?.id) {
      this.loadStudentData();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadStudentData() {
    forkJoin({
      copies: this.copieService.lireToutesLesCopies(),
      epreuves: this.epreuveService.lireEpreuves(),
      sessions: this.sessionService.listerSessions(),
      matieres: this.matiereService.lireMatieres(),
      affectations: this.affectationService.listerAffectations()
    }).subscribe({
      next: (results) => {
        // Traitement des copies
        const allCopies = results.copies.message.flat();
        const userCopies = allCopies.filter((c: any) => 
          Number(c.id_etudiant) === this.user.id
        );
        
        this.examsTaken = userCopies.length;
        
        // Calcul de la moyenne
        const gradedCopies = userCopies.filter((c: any) => c.note_finale !== null);
        if (gradedCopies.length > 0) {
          const total = gradedCopies.reduce((sum: number, c: any) => sum + Number(c.note_finale), 0);
          this.averageGrade = parseFloat((total / gradedCopies.length).toFixed(2));
        }
        
        // Examens à rattraper
        this.resitExams = gradedCopies.filter((c: any) => Number(c.note_finale) < 10).length;
        
        // Résultats récents (limité à 3)
        // Résultats récents (limité à 3)
this.examResults = gradedCopies
.sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
.slice(0, 3)
.map(copie => {
    const epreuve = results.epreuves.message.find((e: any) => 
        e.id_epreuve === copie.id_epreuve
    );
    const affectation = results.affectations.message.find((a: any) => 
        a.id_epreuve === copie.id_epreuve
    );
    const session = results.sessions.message.find((s: any) => 
        s.id_session_examen === affectation?.id_session_examen
    );
    const matiere = results.matieres.message.find((m: any) => 
        m.id_matiere === affectation?.id_matiere
    );
    
    // CORRECTION : Utilisation directe de copie.note_finale
    return {
        id: copie.id_copie_numerique,
        nom_matiere: matiere?.nom_matiere || 'Inconnu',
        note: copie.note_finale, // Accès direct à la propriété
        date_composition: new Date(copie.created_at),
        session: session?.nom_session || 'Inconnu'
    };
});
        
        // Chargement des examens à venir
        this.loadUpcomingExams(
          results.epreuves.message,
          results.affectations.message,
          results.sessions.message,
          results.matieres.message
        );
        
        // Calcul de la progression de l'année
        this.calculateYearProgress();
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement des données:', err);
        this.isLoading = false;
      }
    });
  }

  loadUpcomingExams(epreuves: any[], affectations: any[], sessions: any[], matieres: any[]) {
    const now = new Date();
    
    this.upcomingExams = epreuves
      .filter((epreuve: any) => 
        epreuve.niveau && this.user?.classe &&
        epreuve.niveau.toLowerCase() === this.user.classe.toLowerCase()
      )
      .map((epreuve: any) => {
        const affectation = affectations.find((a: any) => a.id_epreuve === epreuve.id_epreuve);
        if (!affectation) return null;

        const [year, month, day] = affectation.date_examen_etudiant.split('-').map(Number);
        const [hours, minutes] = affectation.heure_debut_examen.split(':').map(Number);
        const examDate = new Date(year, month - 1, day, hours, minutes);

        const session = sessions.find((s: any) => 
          s.id_session_examen === affectation.id_session_examen
        );
        
        const matiere = matieres.find((m: any) => 
          m.id_matiere === affectation.id_matiere
        );

        return {
          id: epreuve.id_epreuve,
          name: matiere?.nom_matiere || 'Inconnu',
          date: examDate,
          session: session?.nom_session || 'Inconnu'
        };
      })
      .filter((exam: any) => exam !== null && exam.date > now)
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);
  }

  calculateYearProgress(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 8, 1); // 1er septembre
    const end = new Date(now.getFullYear() + 1, 5, 30); // 30 juin
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const current = now.getTime() - start.getTime();
    return Math.round((current / total) * 100);
  }

  viewExamDetails(examId: number) {
    this.router.navigate(['/exam-details', examId]);
  }

  viewResults() {
    this.router.navigate(['resultat_etudiant']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}