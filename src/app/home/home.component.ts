import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(
      private router : Router
    ){}

  signIn(){
    this.router.navigate(['/signIn'])
  }
  authentificate(){
    this.router.navigate(['/auth'])
  }
}
