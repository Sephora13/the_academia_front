import { Routes } from '@angular/router';
import { LayoutProfesseurComponent } from './layout-professeur/layout-professeur.component';
import { ProfesseurDashboardComponent } from './dashboard-prof/dashboard-prof.component';
import { MakeEpreuveByIaComponent } from './make-epreuve-by-ia/make-epreuve-by-ia.component';
import {MakeEpreuveManuallyComponent} from './make-epreuve-manually/make-epreuve-manually.component'
import {ShowEpreuveComponent} from './show-epreuve/show-epreuve.component'
import { EpreuveARendreComponent } from './epreuve-a-rendre/epreuve-a-rendre.component';
import { CreerEpreuveComponent } from './creer-epreuve/creer-epreuve.component';
import { ResultatsCompoToProfComponent } from './resultats-compo-to-prof/resultats-compo-to-prof.component';

export const PROFESSEUR_ROUTES: Routes = [
  {
    path: '',
    component: LayoutProfesseurComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ProfesseurDashboardComponent },
      { path: 'make_epreuve_by_ia/:idAffectation', component: MakeEpreuveByIaComponent },
      { path: 'make_epreuve_manually/:idAffectation', component: MakeEpreuveManuallyComponent },
      { path: 'show_epreuve', component: ShowEpreuveComponent},
      { path: 'epreuve_a_rendre', component: EpreuveARendreComponent},
      { path: 'creer_epreuve/:idAffectation', component: CreerEpreuveComponent},
      { path: 'resultats-compo-prof/:id_epreuve', component: ResultatsCompoToProfComponent},
    ]
  }
];
 