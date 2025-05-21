import { Component } from '@angular/core';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-sign-them',
  imports: [SidebarAdminComponent, FormsModule, CommonModule],
  templateUrl: './sign-them.component.html',
  styleUrl: './sign-them.component.css'
})
export class SignThemComponent {
  login: string = '';
  password: string = '';
  errorMessage: string = '';
  message:string='';
  isLoading: boolean = false;

  constructor(
      private router : Router,
      private auth : AuthentificationService
    ){}

    async onSubmit() {
      console.log('accès fonction')
      if (!this.login || !this.password) {
        this.message = 'Veuillez remplir tous les champs.';
        return;
      }
      this.isLoading= true;
      try{
        const response = await this.auth.createExamService(this.login, this.password).pipe(first()).toPromise();
        if(response.status){
          console.log ('inscription reussi')
          alert('service d\'examen inscrit')
          this.isLoading=true
        } else{
          alert(response.message)
        }
      } catch(error){
        console.error('Erreur lors de l’inscription :', error);
        alert("Erreur lors de l’inscription.");
        this.isLoading=true;
      }
    }

}
