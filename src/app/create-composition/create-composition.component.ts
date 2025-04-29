import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { RouterLink, RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-create-composition',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './create-composition.component.html',
  styleUrl: './create-composition.component.css'
})
export class CreateCompositionComponent {
  constructor(private router: Router){}

}
//voir le problème au niveau du changement de couleurs des pages générés avec tailwind CSS
