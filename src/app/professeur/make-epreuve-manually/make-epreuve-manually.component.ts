import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-make-epreuve-manually',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './make-epreuve-manually.component.html',
  styleUrl: './make-epreuve-manually.component.css'
})
export class MakeEpreuveManuallyComponent {
  epreuveFile: File | null = null;
  loading = false;
  message: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  handleFileInput(event: any): void {
    this.epreuveFile = event.target.files[0];
  }

  async uploadEpreuve(): Promise<void> {
    if (!this.epreuveFile) {
      this.message = "Veuillez sélectionner un fichier.";
      return;
    }

    this.loading = true;
    this.message = 'Téléchargement en cours...';

    const formData = new FormData();
    formData.append('epreuveFile', this.epreuveFile);

    try {
      // Remplacez 'YOUR_UPLOAD_API_ENDPOINT' par l'URL de votre API
      const response = await this.http.post<{ success: boolean, message: string }>('YOUR_UPLOAD_API_ENDPOINT', formData).toPromise();

      this.message = response?.message || 'Téléchargement réussi !'; // Affiche le message de l'API ou un message par défaut

      if (response && response.success) {
        // Rediriger vers une autre page après le succès (par exemple, la page de visualisation des épreuves)
        this.router.navigate(['/view-created-exams']);
      }
    } catch (error: any) {
      this.message = error.message || 'Une erreur s\'est produite lors du téléchargement.';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}