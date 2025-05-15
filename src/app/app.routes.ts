import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CompositionComponent } from './composition/composition.component'
import { Routes } from '@angular/router';
import { CreateCompositionComponent } from './create-composition/create-composition.component';
import { HomeComponent } from './home/home.component';
import { AuthentificationComponent } from './authentification/authentification.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { SidebarAdminComponent } from './sidebar-admin/sidebar-admin.component';
import { CompositionAdminComponent } from './composition-admin/composition-admin.component';
import { RegisterAdminComponent } from './register-admin/register-admin.component';
import { DashboardEtudiantComponents } from './dashboard-etudiant/dashboard-etudiant.component';
import { NewCompositionComponent } from './new-composition/new-composition.component';
import { UnauthorizedPageComponent } from './unauthorized-page/unauthorized-page.component'
import { AuthGuard } from './guards/auth.guard';
import { DecouvrirComponent } from './decouvrir/decouvrir.component';
import { ResultatComponent } from './resultat/resultat.component';
import { NotificationEtudiantComponent } from './notification-etudiant/notification-etudiant.component';
import { ExamServiceComponent } from './exam-service/exam-service.component';
import { ActiveAccountComponent } from './active-account/active-account.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'auth', component: AuthentificationComponent },
  { path: 'dashboard', component: DashboardAdminComponent },
  { path: 'student_side', component: DashboardEtudiantComponents, canActivate: [AuthGuard] },
  { path: 'admin_side', component: SidebarAdminComponent },
  { path: 'signIn', component: SignInComponent },
  { path: 'register', component: RegisterAdminComponent },
  { path: 'signUp', component: SignUpComponent },
  { path: 'header', component: HeaderComponent },
  { path: 'sidebar', component: SidebarComponent },
  { path: 'composition', component: CompositionComponent,canActivate: [AuthGuard] },
  { path: 'new_composition', component: NewCompositionComponent, canActivate: [AuthGuard] },
  { path: 'composition_admin', component: CompositionAdminComponent },
  { path: 'create_composition', component: CreateCompositionComponent },
  {path: 'not-authorized', component: UnauthorizedPageComponent},
  {path: 'resultats', component: ResultatComponent,canActivate: [AuthGuard]},
  {path : 'decouvrir', component: DecouvrirComponent},
  {path: 'notification_etudiant', component: NotificationEtudiantComponent},
  {path: 'exam_service', component:ExamServiceComponent},
  //{ path: '**', redirectTo: 'signIn', pathMatch: 'full' },
  {
    path: 'professeur',
    loadChildren: () =>
      import('./professeur/professeur.routes').then(m => m.PROFESSEUR_ROUTES)
  }  
  
];

