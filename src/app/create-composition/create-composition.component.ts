import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component';

@Component({
  selector: 'app-create-composition',
  standalone: true,
  imports: [
    DashboardExamServiceComponent
  ],
  templateUrl: './create-composition.component.html',
  styleUrl: './create-composition.component.css'
})
export class CreateCompositionComponent {
  constructor(private router: Router){}

}
//voir le problème au niveau du changement de couleurs des pages générés avec tailwind CSS
