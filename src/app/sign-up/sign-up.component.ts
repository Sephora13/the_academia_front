import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification/authentification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';

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
  
    try {
      const response = await this.auth.signUp(
        this.matricule,
        this.email,
        this.nom,
        this.prenom,
        this.filiere,
        this.classe,
        this.password,
        this.confirmPassword
      ).pipe(first()).toPromise();
  
      if (response.status) {
        console.log ('inscription reussi')
        alert('Inscription réussie. Un code d\'activation a été envoyé par email.');
        this.router.navigate(['/activate_account'], { queryParams: { email: this.email } });
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error('Erreur lors de l’inscription :', error);
      alert("Erreur lors de l’inscription.");
    }
  }
  
  signIn(){
    this.router.navigate(['/signIn'])
  }
}
