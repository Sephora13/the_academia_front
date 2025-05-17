import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-decouvrir',
  imports: [FormsModule, CommonModule],
  templateUrl: './decouvrir.component.html',
  styleUrl: './decouvrir.component.css'
})
export class DecouvrirComponent {
  searchQuery: string = '';
  constructor(private router : Router){}

  openChatSupport() {
    alert('Le support en direct sera bientôt disponible.');
  }
  
  authentificate(){
    this.router.navigate(['/auth'])
  }

}
