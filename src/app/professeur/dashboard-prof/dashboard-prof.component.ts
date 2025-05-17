import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-professeur-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe
  ],
  templateUrl: './dashboard-prof.component.html',
  styleUrl: './dashboard-prof.component.css'
})
export class ProfesseurDashboardComponent implements OnInit {
  user: { id: number, nom: string, prenom: string } | null = null;

  isSidebarOpen = true;

  professorName = 'Dr. Koffi ATA';
  profilePhoto = 'assets/img/professeur_default.png';
  professorSubject = 'Intelligence Artificielle';
  createdExamsCount = 5;
  nbrcopie = 172;
  notifNonLues = 2;

  notifications = [
    { message: 'Nouvelle épreuve "Introduction à Python" créée.', date: new Date() },
    { message: 'L\'IA a terminé la correction de "Algorithmique Avancée".', date: new Date(Date.now() - 3600000) },
    { message: 'Les statistiques sont disponibles".', date: new Date(Date.now() - 7200000) }
  ];

  upcomingExams = [
    { name: 'Session 3', date: '15 Mai 2025' },
    { name: 'Session 4', date: '22 Mai 2025' }
  ];

  constructor(private router: Router, private auth : AuthentificationService) { }

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('header');
    const main = document.getElementById('main');

    if (sidebar && header && main) {
      sidebar.classList.toggle('show-sidebar');
      header.classList.toggle('left-pd');
      main.classList.toggle('left-pd');
    }
  }

  creerNouvelleEpreuve(): void {
    this.router.navigate(['/create-exam']);
  }

  consulterEpreuvesCrees(): void {
    this.router.navigate(['/view-created-exams']);
  }

  verifierCorrections(): void {
    this.router.navigate(['/review-corrections']);
  }

  gererReclamations(): void {
    this.router.navigate(['/handle-complaints']);
  }

  
}