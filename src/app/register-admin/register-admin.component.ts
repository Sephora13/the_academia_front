import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [],
  templateUrl: './register-admin.component.html',
  styleUrl: './register-admin.component.css'
})
export class RegisterAdminComponent {
  constructor(
      private router : Router
    ){}

    sidebar(){
      this.router.navigate(['/dashboard'])
    }
}
