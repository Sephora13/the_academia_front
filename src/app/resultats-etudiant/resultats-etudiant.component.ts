import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

// Components
import { SidebarComponent } from '../sidebar/sidebar.component';

// Services
import { CopieNumeriqueService } from '../services/copie/copie-numerique.service';
import { EpreuveService } from '../services/epreuve/epreuve.service';
import { SessionExamensService } from '../services/session/session-examens.service';
import { MatiereService } from '../services/matiere/matiere.service';
import { AuthentificationService } from '../services/authentification/authentification.service';
import { AffectationEpreuveService } from '../services/affectation/affectation-epreuve.service';

// Interfaces
interface ResultatEtudiant {
  id_copie: number;
  id_epreuve: number;
  nom_matiere: string;
  id_session: number;
  nom_session: string;
  note: number;
  date_composition: Date;
}

interface SessionExamen {
  id_session: number;
  nom: string;
}

@Component({
  selector: 'app-resultats-etudiant',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './resultats-etudiant.component.html',
  styleUrls: ['./resultats-etudiant.component.css']
})
export class ResultatsEtudiantComponent implements OnInit {
  resultats: any[] = [];
  filteredResultats: any[] = [];
  sessions: any[] = [];
  selectedSessionId: number | null = null;
  searchTerm: string = '';
  toastTimeout: any;
  isLoading = true;
  user: any = null;
  copies: any[] = [];


  constructor(
    private router: Router,
    private copieService: CopieNumeriqueService,
    private epreuveService: EpreuveService,
    private sessionService: SessionExamensService,
    private matiereService: MatiereService,
    private auth: AuthentificationService,
    private affectationEpreuveService: AffectationEpreuveService,
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo2();
    console.log('Utilisateur connecté:', this.user);
    
    if (this.user?.id) {
      this.loadCopies();
    } else {
      this.showToast('Erreur', 'Vous devez être connecté', 'danger');
      this.isLoading = false;
    }
  }

  loadCopies(): void {
    this.copieService.lireToutesLesCopies().subscribe({
      next: (response: any) => { // Ajoutez le type 'any' pour la réponse
        console.log('Réponse complète des copies:', response);
        
        if (response.success) {
          // Correction 1: Utilisez flat() pour aplatir le tableau
          const allCopies = response.message.flat(); 
          
          const userId = Number(this.user.id);
          this.copies = allCopies.filter((copie: any) => 
            Number(copie.id_etudiant) === userId
          );
          
          console.log('Copies filtrées pour l\'étudiant', userId, ':', this.copies);
          
          if (this.copies.length > 0) {
            this.loadResultats();
          } else {
            this.isLoading = false;
            this.showToast('Info', 'Aucune copie disponible pour cet étudiant', 'info');
          }
        } else {
          this.isLoading = false;
          this.showToast('Erreur', 'Impossible de charger les copies', 'danger');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur de chargement des copies:', error);
        this.showToast('Erreur', 'Erreur de connexion au serveur', 'danger');
      }
    });
  }

  loadResultats(): void {
    forkJoin({
      epreuves: this.epreuveService.lireEpreuves(),
      sessions: this.sessionService.listerSessions(),
      matieres: this.matiereService.lireMatieres(),
      affectations: this.affectationEpreuveService.listerAffectations()
    }).subscribe({
      next: ({ epreuves, sessions, matieres, affectations }) => {
        this.isLoading = false;
        
        if (epreuves.success && sessions.success && matieres.success && affectations.success) {
          this.resultats = this.copies
          .filter((copie: any) => copie.statut === true)
          .map((copie: any) => {
            const epreuve = epreuves.message.find((e: any) => 
              e.id_epreuve === copie.id_epreuve
            );
            
            const affectation = affectations.message.find((a: any) => 
              a.id_epreuve === copie.id_epreuve
            );
            
            const session = sessions.message.find((s: any) => 
              affectation && s.id_session_examen === affectation.id_session_examen
            );
            
            const matiere = matieres.message.find((m: any) => 
              affectation && m.id_matiere === affectation.id_matiere
            );

            return {
              id_copie: copie.id_copie_numerique,
              id_epreuve: copie.id_epreuve,
              nom_matiere: matiere?.nom_matiere || 'Inconnue',
              id_session: session?.id_session_examen || 0,
              nom_session: session?.nom_session || 'Inconnue',
              note: copie.note_finale || 0,
              date_composition: new Date(copie.created_at)
            };
          });

          this.sessions = sessions.message.map((s: any) => ({
            id_session: s.id_session_examen,
            nom: s.nom_session
          }));

          this.filterResultats();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur dans forkJoin:', error);
        this.showToast('Erreur', 'Impossible de charger les résultats', 'danger');
      }
    });
  }

  filterResultats(): void {
    let temp = [...this.resultats];

    if (this.selectedSessionId !== null) {
      temp = temp.filter(r => r.id_session === this.selectedSessionId);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(r => 
        (r.nom_matiere?.toLowerCase().includes(term)) ||
        (r.nom_session?.toLowerCase().includes(term)) ||
        (r.note?.toString().includes(term))
      );
    }

    temp.sort((a, b) => b.date_composition.getTime() - a.date_composition.getTime());
    this.filteredResultats = temp;
  }

  getNoteColorClass(note: number): string {
    if (note >= 15) return 'text-green-400';
    if (note >= 10) return 'text-yellow-400';
    return 'text-red-400';
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toast = document.getElementById('resultatsEtudiantToast');
    if (!toast) return;

    toast.querySelector('.toast-title')!.textContent = title;
    toast.querySelector('.toast-message')!.textContent = message;

    const header = toast.querySelector('.toast-header-bg') as HTMLElement;
    const body = toast.querySelector('.toast-body-bg') as HTMLElement;

    header.className = 'toast-header-bg';
    body.className = 'toast-body-bg';

    if (type === 'success') {
      header.classList.add('bg-green-700');
      body.classList.add('bg-green-800');
    } else if (type === 'danger') {
      header.classList.add('bg-red-700');
      body.classList.add('bg-red-800');
    } else {
      header.classList.add('bg-blue-700');
      body.classList.add('bg-blue-800');
    }

    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.hideToast(), 3000);
  }

  hideToast(): void {
    const toast = document.getElementById('resultatsEtudiantToast');
    if (toast) {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}
