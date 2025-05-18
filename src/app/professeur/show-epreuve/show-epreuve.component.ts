import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthentificationService } from '../../services/authentification.service';

// Importez le service qui contient la méthode d'appel API
import { MakeEpreuveByIaService } from '../../services/professeur/make-epreuve-by-ia.service'; // Ajustez le chemin si nécessaire

// Interface pour structurer les données d'un \u00E9l\u00E9ment d'\u00E9preuve dans la liste,
// bas\u00E9e sur la structure de votre exemple de r\u00E9ponse unique.
interface Epreuve {
  id_epreuve: number; // Utilise id_epreuve pour correspondre \u00E0 la cl\u00E9 de l'API
  titre: string;
  duree: string;
  niveau: string;
  date: Date;
  id_professeur: number; // Ajout\u00E9 car pr\u00E9sent dans votre exemple
  icon?: string; // Garde l'ic\u00F4ne statique ajout\u00E9e c\u00F4t\u00E9 client
  
}


@Component({
  selector: 'app-show-epreuve',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
    // HttpClientModule n'est pas n\u00E9cessaire ici car il est utilis\u00E9 dans le service
  ],
  templateUrl: './show-epreuve.component.html',
  styleUrls: ['./show-epreuve.component.css'] // Utilisez styleUrls (au pluriel)
})
export class ShowEpreuveComponent implements OnInit {

  // Propri\u00E9t\u00E9 pour stocker les informations de l'utilisateur connect\u00E9
  user: { id: number, nom: string, prenom: string } | null = null;

  // Tableau pour stocker les \u00E9preuves r\u00E9cup\u00E9r\u00E9es de l'API
  epreuves: Epreuve[] = []; // Initialis\u00E9 comme un tableau vide d'objets Epreuve

  // Indicateurs de chargement et d'erreur pour l'appel API
  loading = true; // Commence \u00E0 true pour afficher le loader au d\u00E9but
  error: string | null = null;

  // Injectez le service d'authentification et le service d'appel API
  constructor(
    private router: Router,
    private auth: AuthentificationService,
    private makeEpreuveByIaService: MakeEpreuveByIaService // Injection du service API
  ) {}

  ngOnInit(): void {
    // R\u00E9cup\u00E9rez les informations de l'utilisateur connect\u00E9
    this.user = this.auth.getUserInfo();

    // V\u00E9rifiez si l'utilisateur est connect\u00E9 et si son ID est disponible
    if (this.user && this.user.id) {
      // Si l'ID du professeur est disponible, appelez la m\u00E9thode pour charger les \u00E9preuves
      this.loadEpreuves(this.user.id);
    } else {
      // Si l'utilisateur n'est pas connect\u00E9 ou l'ID est manquant
      console.error("ID professeur manquant. Impossible de charger les \u00E9preuves.");
      this.error = "Impossible de charger les \u00E9preuves : informations utilisateur manquantes.";
      this.loading = false; // Arr\u00EAtez l'indicateur de chargement
      // Optionnel : rediriger l'utilisateur vers la page de connexion
      // this.router.navigate(['/login']);
    }
  }

  /**
   * Charge les \u00E9preuves pour un professeur donn\u00E9 en appelant l'API.
   * @param idProfesseur L'ID du professeur dont on veut charger les \u00E9preuves.
   */
  loadEpreuves(idProfesseur: number): void {
    this.loading = true; // Active l'indicateur de chargement
    this.error = null; // R\u00E9initialise l'erreur

    // Appelle la m\u00E9thode du service pour r\u00E9cup\u00E9rer les \u00E9preuves
    // Assurez-vous que getEpreuvesByProfesseurId renvoie un Observable<any>
    this.makeEpreuveByIaService.getEpreuvesByProfesseurId(idProfesseur).subscribe({
      next: (response) => {
        console.log('R\u00E9ponse API chargement \u00E9preuves :', response);
        // V\u00E9rifiez la structure de la r\u00E9ponse de votre API pour la LISTE d'\u00E9preuves
        // On s'attend \u00E0 un objet avec { success: boolean, message: Epreuve[] }
        if (response.success && Array.isArray(response.message)) {
          // Mappez les donn\u00E9es re\u00E7ues pour ajouter l'ic\u00F4ne statique
          this.epreuves = response.message.map((epreuveItem: any) => ({ // Utilise 'any' ici pour la flexibilit\u00E9 avant le mapping
            id_epreuve: epreuveItem.id_epreuve,
            titre: epreuveItem.titre,
            duree: epreuveItem.duree,
            niveau: epreuveItem.niveau,
            date: new Date(epreuveItem.created_at).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
          }),
            id_professeur: epreuveItem.id_professeur,
            icon: 'https://cdn-icons-png.flaticon.com/128/1945/1945985.png' // Ajoutez l'URL statique de l'ic\u00F4ne ici
          }));
          console.log('\u00C9preuves charg\u00E9es avec succ\u00E8s (avec ic\u00F4ne statique) :', this.epreuves);
        } else {
          // Si la r\u00E9ponse indique un \u00E9chec logique ou la structure est inattendue
          console.error('Erreur logique API chargement \u00E9preuves ou structure de r\u00E9ponse inattendue :', response);
          // Affiche le message d'erreur de l'API si disponible, sinon un message g\u00E9n\u00E9rique
          this.error = response.message?.message || response.message || 'Une erreur est survenue lors du chargement des \u00E9preuves.';
          this.epreuves = []; // Assurez-vous que le tableau est vide en cas d'erreur
        }
        // Le loader est d\u00E9sactiv\u00E9 dans le bloc 'complete'
      },
      error: (err) => {
        // G\u00E8re les erreurs HTTP (r\u00E9seau, serveur 4xx/5xx)
        console.error('Erreur HTTP lors du chargement des \u00E9preuves :', err);
        let errorMessage = 'D\u00E9sol\u00E9, une erreur technique est survenue lors du chargement des \u00E9preuves.';
         if (err.status === 0) {
             errorMessage = 'Impossible de se connecter au serveur API. V\u00E9rifiez l\'URL ou l\'\u00E9tat du service.';
         } else if (err.status >= 400 && err.status < 500) {
              // Tente d'obtenir un message d'erreur plus sp\u00E9cifique du backend
              errorMessage = `Erreur client (${err.status}): ${err.error?.message || err.error?.detail || err.statusText}`;
         } else if (err.status >= 500) {
               // Tente d'obtenir un message d'erreur plus sp\u00E9cifique du backend
              errorMessage = `Erreur serveur (${err.status}): ${err.error?.message || err.error?.detail || err.statusText}`;
         }
        this.error = errorMessage;
        this.epreuves = []; // Assurez-vous que le tableau est vide en cas d'erreur
        // Le loader est d\u00E9sactiv\u00E9 dans le bloc 'complete'
      },
      complete: () => {
        // S'ex\u00E9cute \u00E0 la fin de la requ\u00EAte, qu'elle r\u00E9ussisse ou \u00E9choue
        this.loading = false; // D\u00E9sactive l'indicateur de chargement
      }
    });
  }


  // M\u00E9thode pour obtenir le statut de composition (conserv\u00E9e mais peut \u00EAtre retir\u00E9e si non utilis\u00E9e)
  // getStatutComposition(estComposee: boolean): string {
  //   return estComposee ? 'D\u00E9j\u00E0 compos\u00E9e' : 'Non compos\u00E9e';
  // }

}
