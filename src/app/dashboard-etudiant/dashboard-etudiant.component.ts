import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { AuthentificationService } from '../services/authentification.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard-etudiant',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent
],
  templateUrl: './dashboard-etudiant.component.html',
  styleUrl: './dashboard-etudiant.component.css'
})
export class DashboardEtudiantComponents implements AfterViewInit, OnInit {
  user: { id: number, nom: string, prenom: string } | null = null;
  isSidebarOpen = true; // Détection si sidebar ouverte

  studentName = 'Stormi Jackson';
  profilePhoto = 'assets/img/avatar.avif';
  studentClass = 'Licence 3 - Informatique';
  averageGrade = 15.2;
  yearProgress = 65;
  examsTaken = 12;

  recentActivities = [
    'Composition en intelligence artificielle terminée',
    'Résultats de php publiés'
  ];

  upcomingExams = [
    { name: 'Examen de programmation Android', date: '15 Mai 2025' },
    { name: 'Examen d\'Anglais', date: '22 Mai 2025' }
  ];

  constructor( @Inject(Router)
    private auth : AuthentificationService,
    private router : Router
  ){}

  ngOnInit(): void{
    this.user = this.auth.getUserInfo2();
    console.log(this.user)
  }

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

    
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
