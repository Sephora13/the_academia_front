import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-show-sign-coordinator',
  imports: [SidebarAdminComponent, CommonModule, FormsModule],
  templateUrl: './show-sign-coordinator.component.html',
  styleUrl: './show-sign-coordinator.component.css'
})
export class ShowSignCoordinatorComponent {
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
    if (!this.login || !this.password) {
      this.message = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    try{
            const response = await this.auth.createCoordinateur(this.login, this.password).pipe(first()).toPromise();
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
  navigation(){
    this.router.navigate(['/sign_coord'])
  }
}
