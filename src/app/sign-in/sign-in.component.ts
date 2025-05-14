import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule,
    CommonModule
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  email: string = '';
  password: string = '';
  role: string = 'etudiant'; // Par défaut, "etudiant"
  showPassword: boolean = false;

  constructor(
    private router : Router,
    private auth : AuthentificationService
  ){}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async signIn() {
    if (!this.email || !this.password) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    await this.auth.signIn(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
  
        const userRole = this.auth.getUserRole(); 
        console.log('Rôle utilisateur:', userRole);
  
        // Rediriger l'utilisateur en fonction de son rôle
        if (userRole === 'etudiant') {
          this.router.navigate(['/student-dashboard']);
        } else if(userRole === 'professeur'){
          this.router.navigate(['/professeur']);
        }else {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.auth.logout(); // Efface les informations en cas d'erreur
        alert("Email ou mot de passe incorrect");
      }
    });
  }

  sidebar(){
    this.router.navigate(['/professeur'])
  }
  signUp(){
    this.router.navigate(['/signUp'])
  }
}
