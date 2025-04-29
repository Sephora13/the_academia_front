import { Component } from '@angular/core';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-composition-admin',
  standalone: true,
  imports: [
    CommonModule,
    SidebarAdminComponent
  ],
  templateUrl: './composition-admin.component.html',
  styleUrl: './composition-admin.component.css'
})
export class CompositionAdminComponent {
  programmedCompositions = [
    { id: 1, titre: 'Mathématiques - Session 1', date: '2025-05-10' },
    { id: 2, titre: 'Physique - Session 1', date: '2025-05-15' }
  ];

  ongoingCompositions = [
    { id: 3, titre: 'Histoire - Session 1', dateDebut: '2025-04-25' }
  ];

  completedCompositions = [
    { id: 4, titre: 'Biologie - Session 1', dateFin: '2025-04-20' }
  ];

  // Méthodes
  annulerComposition(id: number) {
    console.log('Annuler composition', id);
    // ➔ Code pour annuler
  }

  supprimerComposition(id: number) {
    console.log('Supprimer composition', id);
    // ➔ Code pour supprimer
  }

  ouvrirCreationComposition() {
    console.log('Créer nouvelle composition');
    // ➔ Code pour ouvrir une modale ou rediriger vers une page de création
  }

}
