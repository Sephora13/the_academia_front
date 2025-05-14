import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  matricule = '';
  email = '';
  nom = '';
  prenom = '';
  filiere = '';
  classe = '';
  password = '';
  confirmPassword = '';

  constructor(
    private auth : AuthentificationService,
    private router: Router
  ){}

  async onRegister() {
    if (!this.matricule || !this.email || !this.nom || !this.prenom || !this.filiere || !this.classe || !this.password || !this.confirmPassword) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    this.auth.signUp(
      this.matricule,
      this.email,
      this.nom,
      this.prenom,
      this.filiere,
      this.classe,
      this.password,
      this.confirmPassword
    ).subscribe({
      next: (response) => {
        if (response.status) {
          alert(response.message);
          this.router.navigate(['/login']); // Rediriger après l'enregistrement
        } else {
          alert(response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors de l’inscription :', error);
        alert("Erreur lors de l’inscription.");
      }
    });
  }

  signIn(){
    this.router.navigate(['/signIn'])
  }
}
