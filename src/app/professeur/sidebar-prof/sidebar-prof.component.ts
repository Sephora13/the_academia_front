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
  isEpreuveSubmenuOpen: boolean = false; // Initialisation de la propriété

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Dark/Light theme toggle
      const themeButton = document.getElementById('theme-button');
      const darkThemeClass = 'dark-theme';
      const lightThemeClass = 'light-theme';
      const iconThemeDark = 'ri-moon-clear-fill';
      const iconThemeLight = 'ri-sun-fill';

      const selectedTheme = localStorage.getItem('selected-theme');
      const selectedIcon = localStorage.getItem('selected-icon');

      const getCurrentTheme = () =>
        document.body.classList.contains(darkThemeClass) ? 'dark' : 'light';
      const getCurrentIcon = () =>
        themeButton?.querySelector('i')?.classList.contains(iconThemeLight)
          ? iconThemeDark
          : iconThemeLight;

      if (selectedTheme && themeButton) {
        document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkThemeClass);
        document.body.classList[selectedTheme === 'dark' ? 'remove' : 'add'](lightThemeClass);
        const icon = themeButton.querySelector('i');
        if (icon && selectedIcon) { // Vérifiez que selectedIcon n'est pas null
          icon.className = selectedIcon;
        }
      } else if (themeButton) {
        document.body.classList.add(darkThemeClass);
        localStorage.setItem('selected-theme', 'dark');
        localStorage.setItem('selected-icon', iconThemeDark);
        const icon = themeButton.querySelector('i');
        if (icon) {
          icon.className = iconThemeDark;
        }
      }

      themeButton?.addEventListener('click', () => {
        document.body.classList.toggle(darkThemeClass);
        document.body.classList.toggle(lightThemeClass);
        localStorage.setItem('selected-theme', getCurrentTheme());
        localStorage.setItem('selected-icon', getCurrentIcon());
        this.updateThemeButtonIcon();
      });
      this.updateThemeButtonIcon();
    }
  }

  updateThemeButtonIcon() {
    const themeButton = document.getElementById('theme-button');
    if (themeButton) {
      const icon = themeButton.querySelector('i');
      const spanText = themeButton.querySelector('span');
      if (localStorage.getItem('selected-theme') === 'dark') {
        if (icon) icon.className = 'ri-moon-clear-fill sidebar__link sidebar__theme';
        if (spanText) spanText.textContent = 'Thème Sombre';
      } else {
        if (icon) icon.className = 'ri-sun-fill sidebar__link sidebar__theme';
        if (spanText) spanText.textContent = 'Thème Clair';
      }
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