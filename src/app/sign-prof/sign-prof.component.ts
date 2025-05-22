import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthentificationService } from '../services/authentification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-prof',
  imports: [FormsModule, CommonModule],
  templateUrl: './sign-prof.component.html',
  styleUrl: './sign-prof.component.css'
})
export class SignProfComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router,
    private auth: AuthentificationService
  ){}

  signIn() {
    if (!this.email || !this.password) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    this.isLoading=true;

     this.auth.signInProf(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
  
        const userRole = this.auth.getUserRole(); 
        console.log('Rôle utilisateur:', userRole);
        
        this.isLoading=true;
        // Rediriger l'utilisateur en fonction de son rôle
        if (userRole === 'Professeur') {
          this.router.navigate(['/professeur']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.auth.logout(); // Efface les informations en cas d'erreur
        this.isLoading=true;
        alert("Email ou mot de passe incorrect");
      }
    });
  }
onLogin() {
  this.auth.signInProf(this.email, this.password).subscribe({
    next: (response) => {
      const role = this.auth.getUserRole();
      if (role === 'professeur') {
        this.router.navigate(['/prof-dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    },
    error: (err) => {
      alert('Email ou mot de passe incorrect');
    }
  }); 
}

togglePassword() {
  this.showPassword = !this.showPassword;
}

}
