import { AfterViewInit, Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";


@Component({
  selector: 'app-dashboard-etudiant',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent
],
  templateUrl: './dashboard-etudiant.component.html',
  styleUrl: './dashboard-etudiant.component.css'
})
export class DashboardEtudiantComponents implements AfterViewInit {
  isSidebarOpen = true; // Détection si sidebar ouverte

  studentName = 'Sephora DIDAVI';
  profilePhoto = 'assets/img/sephora.JPG';
  studentClass = 'Licence 3 - Informatique';
  averageGrade = 15.2;
  yearProgress = 65;
  examsTaken = 12;

  recentActivities = [
    'Composition en Mathématiques terminée',
    'Résultats de Français publiés',
    'Inscription au module IA validée'
  ];

  upcomingExams = [
    { name: 'Projet Final d\'Informatique', date: '15 Mai 2025' },
    { name: 'Examen d\'Anglais', date: '22 Mai 2025' }
  ];

  ngAfterViewInit(): void {
    const toggle = document.getElementById('header-toggle');
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('header');
    const main   = document.getElementById('main');

    if (toggle && sidebar && header && main) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('show-sidebar');
        header.classList.toggle('left-pd');
        main.classList.toggle('left-pd');
      });
    }

    // Dark/Light Theme handling déjà présent
  }
}
