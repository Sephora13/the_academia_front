import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
interface Epreuve {
  id: number;
  matiere: string;
  niveau: string;
  dateCreation: string;
  estComposee: boolean;
  // Ajoutez d'autres propriétés si nécessaire
}

@Component({
  selector: 'app-show-epreuve',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './show-epreuve.component.html',
  styleUrl: './show-epreuve.component.css'
})
export class ShowEpreuveComponent implements OnInit {
  epreuves: Epreuve[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchEpreuves();
  }

  fetchEpreuves(): void {
    this.loading = true;
    this.error = null;
    // Remplacez 'YOUR_API_ENDPOINT/epreuves' par l'URL réelle de votre API
    this.http.get<Epreuve[]>('YOUR_API_ENDPOINT/epreuves')
      .subscribe({
        next: (data: Epreuve[]) => {
          this.epreuves = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Une erreur s\'est produite lors de la récupération des épreuves.';
          this.loading = false;
        }
      });
  }

  // Méthode pour obtenir le statut de composition
  getStatutComposition(estComposee: boolean): string {
    return estComposee ? 'Déjà composée' : 'Non composée';
  }
}