import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-exam-service',
  imports: [SidebarAdminComponent, FormsModule, CommonModule],
  templateUrl: './show-exam-service.component.html',
  styleUrl: './show-exam-service.component.css'
})
export class ShowExamServiceComponent implements OnInit{
  constructor(private router : Router, private auth:AuthentificationService){}
  examinateurs:any[]=[];
  loading:boolean=true

  ngOnInit(): void {
    
  }

  onCreate(){
    this.router.navigate(['/sign_them'])
  }
}
