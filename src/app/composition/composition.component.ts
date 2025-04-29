import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-composition',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    SidebarComponent,
    CommonModule
  ],
  templateUrl: './composition.component.html',
  styleUrl: './composition.component.css'
})
export class CompositionComponent {

  constructor(private router: Router) {} // ✅ Injection du Router

  compositions = [
    { id: 1, titre: 'Composition de Mathématiques', date: '2025-04-25' },
    { id: 2, titre: 'Composition de Physique', date: '2025-04-26' },
    { id: 3, titre: 'Composition d\'Anglais', date: '2025-04-27' }
  ];

  demarrerComposition(id: number) {
    this.router.navigate(['/new_composition', id]); // ✅ Navigation
  }


}
