import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coordinateurs',
  imports: [FormsModule, CommonModule, SidebarAdminComponent],
  templateUrl: './coordinateurs.component.html',
  styleUrl: './coordinateurs.component.css'
})
export class CoordinateursComponent  implements OnInit{
  currentSection = 'coordinators';
  loading: boolean = true;

  
  coordinators = [
    { name: 'Emma ',prenom:'white', center: 'Gbegamey' },
    { name: 'Liam ', prenom:'Green', center: 'Porto Novo' }
  ];

  constructor(
    private router:Router
  ){}

  onEdit(coordinator: any) {
    // Logique pour modifier, ou ouvrir un formulaire pré-rempli
    console.log('Modifier', coordinator);
  }
  
  onDelete(coordinator: any) {
    // Logique pour supprimer, peut-être avec confirmation
    console.log('Supprimer', coordinator);
  }
  

  ngOnInit(): void {
    this.loading=false;
  }

  onCreate(){
    this.router.navigate(['/sign_coord'])
  }
}
