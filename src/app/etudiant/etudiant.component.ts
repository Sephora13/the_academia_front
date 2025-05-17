import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';

@Component({
  selector: 'app-etudiant',
  imports: [FormsModule, CommonModule, SidebarAdminComponent],
  templateUrl: './etudiant.component.html',
  styleUrl: './etudiant.component.css'
})
export class EtudiantComponent {
  currentSection = 'students';
  students = [
    { name: 'Alice Johnson', major: 'Informatique' },
    { name: 'Bob Brown', major: 'Génie Civil' }
  ]
}
