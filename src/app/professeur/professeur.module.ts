import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfesseurRoutingModule } from './professeur-routing.module';
import { ProfesseurDashboardComponent } from './dashboard-prof/dashboard-prof.component';
import { MakeEpreuveByIaComponent } from './make-epreuve-by-ia/make-epreuve-by-ia.component';
import { ProfesseurSidebarComponent } from './sidebar-prof/sidebar-prof.component';
import { HeaderComponent } from '../header/header.component';

@NgModule({
  imports: [
    CommonModule,
    ProfesseurRoutingModule,
    ProfesseurDashboardComponent,
    MakeEpreuveByIaComponent,
    ProfesseurSidebarComponent,
    HeaderComponent
  ]
})
export class ProfesseurModule {}
