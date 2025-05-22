import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register-admin.component.html',
  styleUrl: './register-admin.component.css'
})
export class RegisterAdminComponent {
  login: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
      private router : Router,
      private auth : AuthentificationService
    ){}

    onSubmit() {
      if (!this.login || !this.password) {
        alert("Veuillez remplir tous les champs.");
        return;
      }
      this.isLoading=true;
      this.auth.signInAdmin(this.login, this.password).subscribe({
        next: (response) => {
          console.log('Connexion réussie:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = 'Login ou mot de passe incorrect';
          console.error('Erreur de connexion:', err);
          this.isLoading=true;
        }
      });
    }

    sidebar(){
      this.router.navigate(['/dashboard'])
    }
}
