import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

// Services
import { CopieNumeriqueService } from '../../services/copie/copie-numerique.service';
import { EpreuveService } from '../../services/epreuve/epreuve.service';
import { SessionExamensService } from '../../services/session/session-examens.service';
import { MatiereService } from '../../services/matiere/matiere.service';
import { GetPasswordService } from '../../services/get_info/get-password.service';
import { AffectationEpreuveService } from '../../services/affectation/affectation-epreuve.service';
import { AuthentificationService } from '../../services/authentification/authentification.service';

// Interfaces
interface SessionExamen {
  id_session_examen: number;
  nom_session: string;
}

interface Etudiant {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
}

interface ResultatEtudiantCompo {
  id_copie_numerique: number;
  id_etudiant: number;
  note_finale: number;
  created_at: string;
}

interface EpreuveCompoResultat {
  id_epreuve: number;
  titre_epreuve: string;
  nom_matiere: string;
  id_session: number;
  nom_session: string;
  date_epreuve: string;
  resultats_etudiants: ResultatEtudiantCompo[];
}

@Component({
  selector: 'app-resultats-compo-to-prof',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './resultats-compo-to-prof.component.html',
  styleUrls: ['./resultats-compo-to-prof.component.css']
})
export class ResultatsCompoToProfComponent implements OnInit {
  epreuvesCompoResultats: EpreuveCompoResultat[] = [];
  filteredEpreuvesCompoResultats: EpreuveCompoResultat[] = [];
  epreuveId: number | null = null;
  
  sessions: SessionExamen[] = [];
  etudiants: Etudiant[] = [];
  professeurId: number | null = null;

  private toastTimeout: any;
  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private copieService: CopieNumeriqueService,
    private epreuveService: EpreuveService,
    private sessionService: SessionExamensService,
    private matiereService: MatiereService,
    private etudiantService: GetPasswordService,
    private affectationService: AffectationEpreuveService,
    private authService: AuthentificationService
  ) { }

  ngOnInit(): void {
    // Récupérer l'ID de l'épreuve depuis l'URL
    this.epreuveId = +this.route.snapshot.paramMap.get('id_epreuve')!;
    console.log('voici ID epreuve', this.epreuveId);
    const user = this.authService.getUserInfo2();
    this.professeurId = user?.id || null;

    if (this.professeurId) {
      this.loadEpreuveCompoResultats();
    } else {
      this.showToast('Erreur', 'Vous devez être connecté', 'danger');
      this.isLoading = false;
    }
  }

  loadEpreuveCompoResultats(): void {
    forkJoin({
      sessions: this.sessionService.listerSessions(),
      etudiants: this.etudiantService.recuStudent(),
      affectations: this.affectationService.listerAffectations(),
      matieres: this.matiereService.lireMatieres(),
      epreuve: this.epreuveService.lireEpreuve(this.epreuveId!),
      copies: this.copieService.lireToutesLesCopies()
    }).subscribe({
      next: (results) => {
        const sessions = results.sessions.message || [];
        const etudiants = results.etudiants || [];
        const affectations = results.affectations.message || [];
        const matieres = results.matieres.message || [];
        const epreuve = results.epreuve.message;
        let copies = results.copies.message;
        
        // Aplatir les copies si nécessaire
        if (Array.isArray(copies) && copies.length > 0 && Array.isArray(copies[0])) {
          copies = copies.flat();
        }

        // Trouver l'affectation pour cette épreuve
        const affectation = affectations.find(
          (a: any) => a.id_epreuve === this.epreuveId
        );

        // Trouver la session
        const session = sessions.find(
          (s: any) => s.id_session_examen === affectation?.id_session_examen
        );

        // Trouver la matière
        const matiere = matieres.find(
          (m: any) => m.id_matiere === affectation?.id_matiere
        );

        // Filtrer les copies pour cette épreuve avec note finale
        const copiesEpreuve = copies.filter(
          (c: any) => 
            c.id_epreuve === this.epreuveId && 
            c.note_finale !== null &&
            c.note_finale !== undefined
        );

        // Créer la structure de données
        this.epreuvesCompoResultats = [{
          id_epreuve: epreuve.id,
          titre_epreuve: epreuve.titre,
          nom_matiere: matiere?.nom_matiere || 'Inconnue',
          id_session: session?.id_session_examen || 0,
          nom_session: session?.nom_session || 'Inconnue',
          date_epreuve: affectation?.date_examen_etudiant || epreuve.created_at,
          resultats_etudiants: copiesEpreuve.map((copie: any) => ({
            id_copie_numerique: copie.id_copie_numerique,
            id_etudiant: copie.id_etudiant,
            note_finale: copie.note_finale,
            created_at: copie.created_at
          }))
        }];

        this.etudiants = etudiants.map((etudiant: any) => ({
          id: etudiant.id,
          nom: etudiant.nom,
          prenom: etudiant.prenom,
          matricule: etudiant.matricule
        }));

        this.filteredEpreuvesCompoResultats = [...this.epreuvesCompoResultats];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des résultats:', err);
        this.showToast('Erreur', 'Impossible de charger les résultats', 'danger');
        this.isLoading = false;
      }
    });
  }

  /**
   * Récupère le nom complet d'un étudiant par son ID.
   * @param idEtudiant L'ID de l'étudiant.
   * @returns Le nom complet de l'étudiant ou 'Inconnu'.
   */
  getEtudiantNomComplet(idEtudiant: number): string {
    const etudiant = this.etudiants.find(e => e.id === idEtudiant);
    
    if (!etudiant) {
      console.warn("Étudiant non trouvé pour ID:", idEtudiant);
      return 'Inconnu';
    }
    
    return `${etudiant.nom} ${etudiant.prenom}`;
  }

  /**
   * Récupère le matricule d'un étudiant par son ID.
   * @param idEtudiant L'ID de l'étudiant.
   * @returns Le matricule de l'étudiant ou 'N/A'.
   */
  getEtudiantMatricule(idEtudiant: number): string {
    const etudiant = this.etudiants.find(e => e.id === idEtudiant);
    return etudiant ? etudiant.matricule : 'N/A';
  }

  /**
   * Détermine la couleur de la note en fonction de sa valeur.
   * @param note La note à évaluer.
   * @returns Classe CSS Tailwind pour la couleur.
   */
  getNoteColorClass(note: number): string {
    if (note >= 15) {
      return 'text-green-400';
    } else if (note >= 10) {
      return 'text-yellow-400';
    } else {
      return 'text-red-400';
    }
  }

  /**
   * Navigue vers la page de correction d'une copie spécifique.
   * @param idEpreuve L'ID de l'épreuve.
   * @param idCopie L'ID de la copie numérique.
   */
  viewCorrection(idEpreuve: number, idCopie: number): void {
    this.router.navigate(['/correction-copie', idEpreuve, idCopie]);
  }

  /**
   * Affiche un message Toast.
   * @param title Titre du Toast.
   * @param message Contenu du message.
   * @param type Type de message pour le style (success, danger, info).
   */
  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('resultatsCompoProfToast');
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
    const toastElement = document.getElementById('resultatsCompoProfToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}