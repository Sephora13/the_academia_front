import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-professeur-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar-prof.component.html',
  styleUrl: './sidebar-prof.component.css'
})
export class ProfesseurSidebarComponent implements AfterViewInit {
  isEpreuveSubmenuOpen = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // ... le reste de votre code ngAfterViewInit ...
    }
  }

  toggleEpreuveSubmenu() {
    this.isEpreuveSubmenuOpen = !this.isEpreuveSubmenuOpen;
  }

  dashboard() {
    this.router.navigate(['/professeur/dashboard']);
  }

  voirMesEpreuves() {
    this.router.navigate(['/view-created-exams']);
  }

  creerEpreuveAI() {
    this.router.navigate(['/create-exam-ai']);
  }

  enregistrerEpreuve() {
    this.router.navigate(['/save-exam']);
  }

  creerEpreuve() {
    this.router.navigate(['/create-exam']);
  }

  verifierCorrections() {
    this.router.navigate(['/review-corrections']);
  }

  gererReclamations() {
    this.router.navigate(['/handle-complaints']);
  }
}