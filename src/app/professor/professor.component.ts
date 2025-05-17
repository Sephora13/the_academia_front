import { Component } from '@angular/core';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-professor',
  imports: [SidebarAdminComponent,FormsModule, CommonModule],
  templateUrl: './professor.component.html',
  styleUrl: './professor.component.css'
})
export class ProfessorComponent {
  currentSection = 'professors';

  professors = [
    { name: 'John Doe', subject: 'Mathématiques', class: 'Terminale S' },
    { name: 'Jane Smith', subject: 'Physique', class: 'Première D' }
  ];



}
