import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CompositionService } from '../services/composition.service';

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
    private service : CompositionService
  ) {} 

  compositions = [
    { id: 1, titre: 'Composition de Mathématiques', date: '2025-04-25' },
    { id: 2, titre: 'Composition de Physique', date: '2025-04-26' },
    { id: 3, titre: 'Composition d\'Anglais', date: '2025-04-27' }
  ];

  isAble(){
    this.service.isAble().subscribe(pass=>{
      const validate = pass.status
      if(validate){
        this.demarrerComposition()
      }
    })
    console.log ('validate')
  }
  demarrerComposition() {
    this.router.navigate(['/new_composition']); // ✅ Navigation
  }


}
