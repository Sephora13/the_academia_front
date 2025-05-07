import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-make-epreuve-by-ia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './make-epreuve-by-ia.component.html',
  styleUrl: './make-epreuve-by-ia.component.css'
})
export class MakeEpreuveByIaComponent {
  isLoading = false;
  showResult = false;
  matiere = '';
  niveau = '';
  duree = '';
  nombreExercices = 0;
  objectifs: string[] = [];
  prompt = '';
  fichier: File | null = null;
  nouvelleSuggestion = '';

  epreuveGeneree = '';
  grilleCorrection = '';

  constructor(private router: Router) {}

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.fichier = file;
  }

  genererEpreuve() {
    this.isLoading = true;
    this.showResult = false;

    // Simule l'appel IA (remplace par ton appel API plus tard)
    setTimeout(() => {
      this.isLoading = false;
      this.showResult = true;

      this.epreuveGeneree = 'Voici l’épreuve générée par IA : ...';
      this.grilleCorrection = 'Grille de correction correspondante : ...';
    }, 3000); // à remplacer par l’appel réel à ton backend
  }

  enregistrerEpreuve() {
    // Logique à remplacer par ton API de sauvegarde
    alert("Épreuve et grille enregistrées !");
  }

  modifierEpreuve() {
    this.prompt = this.nouvelleSuggestion;
    this.genererEpreuve();
    this.nouvelleSuggestion = '';
  }
}
