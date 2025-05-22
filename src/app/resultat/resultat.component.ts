import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DashboardExamServiceComponent } from "../dashboard-exam-service/dashboard-exam-service.component";


@Component({
  selector: 'app-resultat',
  imports: [
    FormsModule,
    CommonModule,
    DashboardExamServiceComponent
],
  templateUrl: './resultat.component.html',
  styleUrl: './resultat.component.css'
})
export class ResultatComponent {
  programmedCompositions = [
    { id: 1, titre: 'Algorithmique - sil2', date: '2025-05-10' },
    { id: 2, titre: 'Algèbre - sil2 ', date: '2025-05-15' },
    { id: 1, titre: 'Algorithmique - sil2', date: '2025-05-10' },
    { id: 2, titre: 'Algèbre - sil2 ', date: '2025-05-15' },
    { id: 1, titre: 'Algorithmique - sil2', date: '2025-05-10' },
    { id: 2, titre: 'Algèbre - sil2 ', date: '2025-05-15' }
  ];

  completedCompositions = [
    { id: 4, titre: 'Mathematique financièrer - sil2', dateFin: '2025-04-20' }
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
