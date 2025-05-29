import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification/authentification.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-examservice',
  imports: [FormsModule, CommonModule],
  templateUrl: './sign-examservice.component.html',
  styleUrl: './sign-examservice.component.css'
})
export class SignExamserviceComponent {
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
      this.auth.sign_examService(this.login, this.password).subscribe({
        next: (response) => {
          console.log('Connexion réussie:', response);
          this.router.navigate(['/exam_service']);
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
