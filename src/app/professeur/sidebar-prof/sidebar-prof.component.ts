import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-professeur-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar-prof.component.html',
  styleUrl: './sidebar-prof.component.css'
})
export class ProfesseurSidebarComponent implements AfterViewInit {
  isEpreuveSubmenuOpen: boolean = false; // Initialisation de la propriété

  constructor(
    private router: Router,
    private auth : AuthentificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    // Sidebar toggle (si jamais tu veux ajouter un bouton toggle plus tard)
    const toggle = document.getElementById('header-toggle');
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('header');
    const main = document.getElementById('main');

    if (toggle && sidebar && header && main) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        header.classList.toggle('left-pd');
        main.classList.toggle('left-pd');
      });
    }

    // Active link
    const links = document.querySelectorAll<HTMLAnchorElement>('.sidebar a');
    links.forEach(link => {
      link.addEventListener('click', function () {
        links.forEach(l => l.classList.remove('text-purple-400'));
        this.classList.add('text-purple-400');
      });
    });

    // Dark/Light theme toggle
    const themeButton = document.getElementById('theme-button');
    const darkTheme = 'dark-theme';
    const iconTheme = 'ri-sun-fill';

    const selectedTheme = localStorage.getItem('selected-theme');
    const selectedIcon = localStorage.getItem('selected-icon');

    const getCurrentTheme = () =>
      document.body.classList.contains(darkTheme) ? 'dark' : 'light';
    const getCurrentIcon = () =>
      themeButton?.classList.contains(iconTheme) ? 'ri-moon-clear-fill' : 'ri-sun-fill';

    if (selectedTheme && themeButton) {
      document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
      themeButton.classList[selectedIcon === 'ri-moon-clear-fill' ? 'add' : 'remove'](iconTheme);
    }

    themeButton?.addEventListener('click', () => {
      document.body.classList.toggle(darkTheme);
      themeButton.classList.toggle(iconTheme);
      localStorage.setItem('selected-theme', getCurrentTheme());
      localStorage.setItem('selected-icon', getCurrentIcon());
    });
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

  logout() {
    this.auth.logout();
    this.router.navigate(['/signIn']);
  }
}