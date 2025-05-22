import { Component, OnInit } from '@angular/core';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GetPasswordService } from '../services/get-password.service';

@Component({
  selector: 'app-professor',
  imports: [SidebarAdminComponent,FormsModule, CommonModule],
  templateUrl: './professor.component.html',
  styleUrl: './professor.component.css'
})
export class ProfessorComponent implements OnInit {
  constructor(private router: Router, private recup:GetPasswordService){}
  professors: any[] = [];
  loading: boolean = true;

  currentSection = 'professors';
  ngOnInit(): void {
    this.loadProfessors();
  }

  loadProfessors(): void {
    this.loading = true;
    this.recup.recuProf().subscribe(
      (data) => {
        this.professors = data;
        this.loading = false;
        console.log(this.professors);
      },
      (error) => {
        console.error('Erreur lors de la récupération des professeurs', error);
        this.loading = false;
      }
    );
  }

  onCreate(){
    this.router.navigate(['/create-prof'])
  }

}
