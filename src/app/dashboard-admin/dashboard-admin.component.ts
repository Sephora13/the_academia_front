import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { ChartOptions, ChartType } from 'chart.js';
import { SidebarAdminComponent } from "../sidebar-admin/sidebar-admin.component";
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';



interface User {
  name: string;
  role: string;
  addedAt: Date;
}


@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarAdminComponent
],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent implements AfterViewInit, OnInit {
  // Statistiques globales
  totalStudents: number;
  totalProfessors: number;
  totalCoordinators: number;
  totalExamService: number;

  // Liste des derniers utilisateurs
  recentUsers: User[] = [];
  constructor(
    private router: Router
  ){
    // Initialisation des données (exemples fictifs)
    this.totalStudents = 520;
    this.totalProfessors = 45;
    this.totalCoordinators = 8;
    this.totalExamService = 3;

    // Exemple de récents utilisateurs
    this.recentUsers = [
      { name: 'Alice Dupont', role: 'Étudiant', addedAt: new Date('2025-05-10') },
      { name: 'Jean Martin', role: 'Professeur', addedAt: new Date('2025-05-09') },
      { name: 'Sophie Durand', role: 'Coordinateur', addedAt: new Date('2025-05-08') },
      { name: 'Marc Leroy', role: 'Service d’examens', addedAt: new Date('2025-05-07') },
      { name: 'Laura Bernard', role: 'Étudiant', addedAt: new Date('2025-05-06') }
    ];
  }

  ngOnInit(): void {
    // Si tu veux charger depuis une API, tu pourrais le faire ici
  }
  isSidebarOpen = true; // Détection si sidebar ouverte
  compositionName: string = '';
  compositions: string[] = [];
  results: any[] = [];
  
  
  createComposition() {
    if (this.compositionName) {
      this.compositions.push(this.compositionName);
      this.compositionName = '';
    }
  }

  publishResults(result: string) {
    if (result) {
      this.results.push(result);
    }
  }

  receiveResults(): any[] {
    return this.results;
  }

  professeurs: any;

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

    const ctx = document.getElementById('compositionsChart') as HTMLCanvasElement;
    // Dark/Light Theme handling déjà présent
  }
  
}

