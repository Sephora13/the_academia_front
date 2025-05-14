import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-notification-etudiant',
  imports: [
    FormsModule,
    CommonModule,
    SidebarComponent
  ],
  templateUrl: './notification-etudiant.component.html',
  styleUrl: './notification-etudiant.component.css'
})
export class NotificationEtudiantComponent {
  notifications = [
    { id: 1, title: 'Nouvelle Composition', message: 'Une nouvelle composition a été ajoutée. Veuillez la consulter.', read: false },
    { id: 2, title: 'Examen Prochain', message: 'L\'examen de Mathématiques aura lieu le 20 juin.', read: true },
    { id: 3, title: 'Résultats Disponibles', message: 'Les résultats de votre dernier examen sont désormais disponibles.', read: false }
  ];

  markAsRead(notification: any) {
    notification.read = true;
  }
}
