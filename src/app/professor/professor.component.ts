import { Component } from '@angular/core';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-professor',
  imports: [SidebarAdminComponent,FormsModule, CommonModule],
  templateUrl: './professor.component.html',
  styleUrl: './professor.component.css'
})
export class ProfessorComponent {
  constructor(private router: Router){}
  currentSection = 'professors';

  professors = [
    { name: 'Yomi Denzel', subject: 'Marketing digital', class: 'SG2', email:'yomidenzel2@gmail.com' },
    { name: 'Jane Smith', subject: 'Tableur', class: 'SIL2', email: 'janesmith@gmail.com' }
  ];

  onCreate(){
    this.router.navigate(['/create-prof'])
  }

}
