import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';


@Component({
  selector: 'app-resultat',
  imports: [
    FormsModule,
    CommonModule,
    SidebarComponent
  ],
  templateUrl: './resultat.component.html',
  styleUrl: './resultat.component.css'
})
export class ResultatComponent {
  results = [
    { id: 1, name: 'John Doe', subject: 'Mathématiques', grade: 75 },
    { id: 2, name: 'Jane Doe', subject: 'Physique', grade: 48 },
    { id: 3, name: 'Alice Smith', subject: 'Chimie', grade: 89 }
  ];

}
