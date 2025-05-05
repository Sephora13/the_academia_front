import { AfterViewInit, Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { ChartOptions, ChartType } from 'chart.js';
import { SidebarAdminComponent } from "../sidebar-admin/sidebar-admin.component";


@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    CommonModule,
    SidebarAdminComponent
],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent implements AfterViewInit {
  isSidebarOpen = true; // Détection si sidebar ouverte


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
