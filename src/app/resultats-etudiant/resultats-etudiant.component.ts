import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resultats-etudiant',
  imports: [SidebarComponent, FormsModule, CommonModule],
  templateUrl: './resultats-etudiant.component.html',
  styleUrl: './resultats-etudiant.component.css'
})
export class ResultatsEtudiantComponent {
  results = [
    {  subject: 'Tableur2', date: new Date(2024, 0, 15), score: 16, passed: true },
    { subject: 'JAVA', date: new Date(2024, 0, 15), score: 12, passed: true },
    {  subject: 'Anglais', date: new Date(2024, 0, 16), score: 9, passed: false },
    { subject: 'ATO', date: new Date(2024, 0, 16), score: 14, passed: true },
    { subject: 'Algorithmique', date: new Date(2024, 0, 17), score: 7, passed: false }
  ];
}
