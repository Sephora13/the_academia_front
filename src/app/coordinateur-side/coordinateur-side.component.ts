import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification/authentification.service';

@Component({
  selector: 'app-coordinateur-side',
  imports: [],
  templateUrl: './coordinateur-side.component.html',
  styleUrl: './coordinateur-side.component.css'
})
export class CoordinateurSideComponent {
  constructor(
    private router : Router,
    private auth: AuthentificationService
  ){}

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

  dashboard(){
    this.router.navigate(['/coordinator_side'])
  }
  tracking(){
    this.router.navigate(['/tracking'])
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/register_coord']);
  }
}
