import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthentificationService } from '../services/authentification.service';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(private auth: AuthentificationService, private router: Router, private route: ActivatedRoute) {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
  }
    
  onActivate() {
    console.log(this.email)
    if (!this.activationCode || !this.email) {
      alert('Veuillez entrer votre email et votre code d\'activation.');
      return;
    }

    this.isLoading = true;
    this.auth.verifyActivationCode(this.email, this.activationCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status) {
          console.log(this.email)
          alert('Compte activé avec succès.');
          this.router.navigate(['/student_side']);
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
