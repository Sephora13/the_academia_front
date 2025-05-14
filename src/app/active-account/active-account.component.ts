import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthentificationService } from '../services/authentification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-active-account',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './active-account.component.html',
  styleUrl: './active-account.component.css'
})
export class ActiveAccountComponent {
  activationCode = '';
  email = '';
  isLoading = false;

  constructor(private auth: AuthentificationService, private router: Router) {}

  onActivate() {
    if (!this.activationCode || !this.email) {
      alert('Veuillez entrer votre email et votre code d\'activation.');
      return;
    }

    this.isLoading = true;
    this.auth.verifyActivationCode(this.email, this.activationCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status) {
          alert('Compte activé avec succès.');
          this.router.navigate(['/login']);
        } else {
          alert(response.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        alert('Erreur lors de l\'activation.');
      }
    });
  }
}
