import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { EpreuveService } from '../services/epreuve.service';
import { AffectationEpreuveService } from '../services/affectation-epreuve.service';
import { AuthentificationService } from '../services/authentification.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-composition',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './composition.component.html',
  styleUrls: ['./composition.component.css']
})
export class CompositionComponent implements OnInit, OnDestroy {
  user: { id: number, nom: string, prenom: string, classe?: string } | null = null;
  compositions: any[] = [];
  currentTime: Date = new Date();
  timer: any;

  loading = true;
  enableComposition = true;  // contrôle normal d'activation du bouton
  forceEnable = true;       // FORCER tous les boutons à être actifs, même avant l'heure

  constructor(
    private router: Router,
    private epreuveService: EpreuveService,
    private affectationService: AffectationEpreuveService,
    private auth: AuthentificationService,
  ) {}

  ngOnInit() {
    this.user = this.auth.getUserInfo2();
    
    if (this.user?.id) {
      this.loadCompositions();
    }

    // Mise à jour de l'heure toutes les minutes
    this.timer = setInterval(() => {
      this.currentTime = new Date();
      this.updateCompositionStatus();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  loadCompositions() {
    if (!this.user?.classe) return;
    this.loading = true;
    forkJoin({
      epreuves: this.epreuveService.lireEpreuves(),
      affectations: this.affectationService.listerAffectations()
    }).subscribe({
      next: (results: any) => {
        if (results.epreuves.success && results.affectations.success) {
          const epreuves = results.epreuves.message;
          const affectations = results.affectations.message;

          this.compositions = epreuves
            .filter((epreuve: any) => 
              epreuve.niveau && this.user?.classe &&
              epreuve.niveau.toLowerCase() === this.user.classe.toLowerCase()
            )
            .map((epreuve: any) => {
              const affectation = affectations.find((a: any) => a.id_epreuve === epreuve.id_epreuve);
              if (!affectation) return null;

              const [year, month, day] = affectation.date_examen_etudiant.split('-').map(Number);
              const [hours, minutes] = affectation.heure_debut_examen.split(':').map(Number);
              const compositionDate = new Date(year, month - 1, day, hours, minutes);

              const durationParts = epreuve.duree.match(/(\d+)h(\d+)?min/);
              let durationMinutes = 0;
              if (durationParts) {
                durationMinutes = parseInt(durationParts[1]) * 60 + (parseInt(durationParts[2]) || 0);
              }

              const endTime = new Date(compositionDate);
              endTime.setMinutes(endTime.getMinutes() + durationMinutes);
              const endTimeWithMargin = new Date(endTime);
              endTimeWithMargin.setMinutes(endTimeWithMargin.getMinutes() + 30);

              let status = 'future';
              if (this.currentTime > endTimeWithMargin) {
                status = 'past';
              } else if (this.currentTime >= compositionDate) {
                status = 'active';
              }

              return {
                id: epreuve.id_epreuve,
                titre: epreuve.titre,
                date: compositionDate,
                status: status,
                // Ici on active le bouton si status actif et enableComposition
                // OU si forceEnable est activé (boutons forcés actifs)
                canStart: (status === 'active' && this.enableComposition) || this.forceEnable
              };
            })
            .filter((comp: any) => comp !== null && comp.status !== 'past');
            this.loading = false;
        }
      },
      error: (err) => {
        console.error('Erreur chargement données', err);
        this.loading = false;
      }
    });
  }

  updateCompositionStatus() {
    this.compositions.forEach(comp => {
      if (comp.status === 'future' && this.currentTime >= comp.date) {
        comp.status = 'active';
      }
      // Met à jour canStart en tenant compte de forceEnable
      comp.canStart = (comp.status === 'active' && this.enableComposition) || this.forceEnable;
    });
  }

  lancerComposition(id_epreuve: number) {
    if (this.enableComposition || this.forceEnable) {
      this.router.navigate(['/new_composition', id_epreuve]);
    }
  }

  // Bouton pour basculer le mode forceEnable
  toggleForceEnable() {
    this.forceEnable = !this.forceEnable;
    // Met à jour les boutons en conséquence
    this.updateCompositionStatus();
  }
}
