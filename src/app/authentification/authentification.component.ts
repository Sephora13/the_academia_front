import { Component } from '@angular/core';
import {Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authentification',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './authentification.component.html',
  styleUrl: './authentification.component.css'
})
export class AuthentificationComponent {
  selectedRole: any;
  constructor(
    private router : Router
  ){}
  ngOnInit(): void {
    this.selectedRole = null; // ou une valeur par défaut appropriée
  }

  signIn(){
    this.router.navigate(['/signIn'])
  }
  register_admin(){
    this.router.navigate(['/register'])
  }
  signProf(){
    this.router.navigate(['/signProf'])
  }
  
}
