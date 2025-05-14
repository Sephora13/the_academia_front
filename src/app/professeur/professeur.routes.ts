import { Routes } from '@angular/router';
import { LayoutProfesseurComponent } from './layout-professeur/layout-professeur.component';
import { ProfesseurDashboardComponent } from './dashboard-prof/dashboard-prof.component';
import { MakeEpreuveByIaComponent } from './make-epreuve-by-ia/make-epreuve-by-ia.component';
import {MakeEpreuveManuallyComponent} from './make-epreuve-manually/make-epreuve-manually.component'
import {ShowEpreuveComponent} from './show-epreuve/show-epreuve.component'

export const PROFESSEUR_ROUTES: Routes = [
  {
    path: '',
    component: LayoutProfesseurComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ProfesseurDashboardComponent },
      { path: 'make_epreuve_by_ia', component: MakeEpreuveByIaComponent },
      { path: 'make_epreuve_manually', component: MakeEpreuveManuallyComponent },
      { path: 'show_epreuve', component: ShowEpreuveComponent}
    ]
  }
];
 