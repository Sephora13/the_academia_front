import { Component, OnInit } from '@angular/core';
import { AuthentificationService } from '../services/authentification/authentification.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-prof',
  imports: [SidebarAdminComponent, FormsModule, CommonModule],
  templateUrl: './create-prof.component.html',
  styleUrl: './create-prof.component.css'
})
export class CreateProfComponent implements OnInit {
  name = '';
  prenom = '';
  email = '';
  filiere = '';
  password = '';
  matiere = '';

  constructor(private router: Router,
    private auth: AuthentificationService
  ){}
  ngOnInit(): void {
    
  }
  async onRegister() {
     if (!this.email || !this.name || !this.prenom || !this.filiere || !this.matiere || !this.password) 
      {
        alert("Veuillez remplir tous les champs.");
        return;
      }
    
      try {
        const response = await this.auth.createProf(
          this.name,
          this.prenom,
          this.email,
          this.password,
          this.filiere,
          this.matiere,
        ).pipe(first()).toPromise();
    
        if (response.status) {
          console.log ('inscription reussi')
          alert('nouveau professeur inscrit')
        } else {
          alert(response.message);
        }
      } catch (error) {
        console.error('Erreur lors de l’inscription :', error);
        alert("Erreur lors de l’inscription.");
      }
    }
}
