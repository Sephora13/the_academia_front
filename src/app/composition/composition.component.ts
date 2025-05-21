import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CompositionService } from '../services/composition.service';
import { AuthentificationService } from '../services/authentification.service';

@Component({
  selector: 'app-composition',
  standalone: true,
  imports: [
    SidebarComponent,
    CommonModule
  ],
  templateUrl: './composition.component.html',
  styleUrl: './composition.component.css'
})
export class CompositionComponent {

  constructor(private router: Router,
    private service : CompositionService,
    private auth: AuthentificationService,
  ) {} 

  user: { id: number, nom: string, prenom: string } | null = null;
  compositions = [
    { id: 33, titre: 'Composition de Mathématiques', date: '2025-04-25' },
    { id: 33, titre: 'Composition de Physique', date: '2025-04-26' },
    { id: 33, titre: 'Composition d\'Anglais', date: '2025-04-27' }
  ];

  lancerComposition(id_epreuve: number) {
    //this.service.isAble().subscribe(pass => {
    //  const validate = pass.status
    //  if (validate) {
    //    this.router.navigate(['/new_composition', id_epreuve]);
    //  } else {
    //    alert("Vous ne pouvez pas encore démarrer cette composition.");
    //  }
    //  console.log ('validate')
    //});
    this.router.navigate(['/new_composition', id_epreuve]);
  }
  
}
