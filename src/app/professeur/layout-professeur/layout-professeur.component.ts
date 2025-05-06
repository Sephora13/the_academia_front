import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfesseurSidebarComponent } from '../sidebar-prof/sidebar-prof.component';
import { HeaderComponent } from '../../header/header.component';

@Component({
  standalone: true,
  selector: 'app-layout-professeur',
  templateUrl: './layout-professeur.component.html',
  styleUrls: ['./layout-professeur.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    ProfesseurSidebarComponent,
    HeaderComponent
  ]
})
export class LayoutProfesseurComponent {}
