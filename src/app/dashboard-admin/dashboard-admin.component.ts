import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { ChartOptions, ChartType } from 'chart.js';
import { SidebarAdminComponent } from "../sidebar-admin/sidebar-admin.component";
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GetPasswordService } from '../services/get_info/get-password.service';



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
  totalUsers : number=0
  // Statistiques globales
  totalStudents: number =0;
  totalProfessors: number =0;
  totalExamService: number = 0;
  loading: boolean = true;

  // Liste des derniers utilisateurs
  recentUsers: User[] = [];
  constructor(
    private router: Router,
    private recup :GetPasswordService
  ){
    
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
    this.loadUserCount();
    this.loadProfCount();
  }

  // ✅ Charger le nombre d'utilisateurs
  loadUserCount(): void {
    this.recup.countUser().subscribe(
      (data) => {
        this.totalUsers = data.totalUsers;
        this.loading = false;
        console.log('Total d\'utilisateurs:', this.totalUsers);
      },
      (error) => {
        console.error('Erreur lors de la récupération du nombre d\'utilisateurs', error);
        this.loading = false;
      }
    );
  }

  //charger le nombre de prof
  loadProfCount():void{
    this.recup.countProf().subscribe(
      (data) => {
        this.totalProfessors = data.totalProfessors;
        this.loading = false;
        console.log('Total professeurs:', this.totalProfessors);
      },
      (error) => {
        console.error('Erreur lors de la récupération du nombre d\'utilisateurs', error);
        this.loading = false;

      }
    )
  }

  /*
  //charge service des examens
  loadExam_service():void{
    this.recup.countExam_service().subscribe(
      (data) => {
        this.totalExamService = data.totalExamService;
        console.log('Total examinateurs:', this.totalExamService);
      },
      (error) => {
        console.error('Erreur lors de la récupération du nombre d\'utilisateurs', error);

      }
    )
  }
    */

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

