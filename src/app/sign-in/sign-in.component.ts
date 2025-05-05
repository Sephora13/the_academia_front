import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  constructor(
    private router : Router
  ){}

  sidebar(){
    this.router.navigate(['/student_side'])
  }
  signUp(){
    this.router.navigate(['/signUp'])
  }
}
