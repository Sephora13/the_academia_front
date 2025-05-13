import { Component } from '@angular/core';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { Router } from '@angular/router';
import { CoordinateurSideComponent } from '../coordinateur-side/coordinateur-side.component';

@Component({
  selector: 'app-exam-service',
  imports: [CoordinateurSideComponent],
  templateUrl: './exam-service.component.html',
  styleUrl: './exam-service.component.css'
})
export class ExamServiceComponent {
  constructor (private router : Router){}

  
}
