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
import { SignThemComponent } from './sign-them/sign-them.component';
import { ProfessorComponent } from './professor/professor.component';
import { EtudiantComponent } from './etudiant/etudiant.component';
import { CoordinateursComponent } from './coordinateurs/coordinateurs.component';
import { SignProfComponent } from './sign-prof/sign-prof.component';
import { CreateProfComponent } from './create-prof/create-prof.component';
import { CoordinateurSideComponent } from './coordinateur-side/coordinateur-side.component';
import { CoordDashboardComponent } from './coord-dashboard/coord-dashboard.component';
import { ShowExamServiceComponent } from './show-exam-service/show-exam-service.component';
import { ShowSignCoordinatorComponent } from './show-sign-coordinator/show-sign-coordinator.component';
import { SignCoordComponent } from './sign-coord/sign-coord.component';
import { SignExamserviceComponent } from './sign-examservice/sign-examservice.component';
import { ResultatsEtudiantComponent } from './resultats-etudiant/resultats-etudiant.component';
import { FiliereComponent } from './filiere/filiere.component'

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'auth', component: AuthentificationComponent },
  { path: 'dashboard', component: DashboardAdminComponent, canActivate:[AuthGuard], data: { roles: ['admin'] }},
  { path: 'student_side', component: DashboardEtudiantComponents, canActivate: [AuthGuard], data: { roles: ['etudiant']} },
  { path: 'admin_side', component: SidebarAdminComponent },
  { path: 'signIn', component: SignInComponent },
  { path: 'register', component: RegisterAdminComponent },
  { path: 'signUp', component: SignUpComponent },
  { path: 'header', component: HeaderComponent },
  { path: 'sidebar', component: SidebarComponent },
  { path: 'composition', component: CompositionComponent },
  { path: 'new_composition/:id', component: NewCompositionComponent },
  { path: 'composition_admin', component: CompositionAdminComponent },
  { path: 'create_composition', component: CreateCompositionComponent },
  {path: 'not-authorized', component: UnauthorizedPageComponent},
  {path: 'resultats', component: ResultatComponent},
  {path : 'decouvrir', component: DecouvrirComponent},
  {path: 'notification_etudiant', component: NotificationEtudiantComponent},
  {path: 'exam_service', component:ExamServiceComponent,canActivate: [AuthGuard], data: { roles: ['exam_service']}},
  {path:'activate_account',component:ActiveAccountComponent},
  {path:'sign_them', component:SignThemComponent},
  {path:'professor', component:ProfessorComponent},
  {path:'students', component:EtudiantComponent},
  {path: 'signProf', component: SignProfComponent},
  {path:'coordinator', component:CoordinateursComponent},
  {path:'coordinator_side', component:CoordDashboardComponent, canActivate: [AuthGuard], data: { roles: ['coordinateur']}},
  {path:'create-prof', component:CreateProfComponent},
  {path:'show_examService', component:ShowExamServiceComponent},
  {path:'sign_coord', component:ShowSignCoordinatorComponent},
  {path:'register_coord', component:SignCoordComponent},
  {path:'register_examinator', component:SignExamserviceComponent},
  {path:'resultat_etudiant',component:ResultatsEtudiantComponent},
  {path: 'filieres', component:FiliereComponent},
  //{ path: '**', redirectTo: 'signIn', pathMatch: 'full' },
  {
    path: 'professeur',
    canActivate: [AuthGuard],
    data: { roles: ['Professeur']},
    loadChildren: () =>
      import('./professeur/professeur.routes').then(m => m.PROFESSEUR_ROUTES)
  }  
  
];

