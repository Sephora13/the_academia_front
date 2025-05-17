import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthentificationService, private router: Router) {}

  canActivate(route: any): boolean {
    if (this.authService.isAuthenticated()) {
      const role = this.authService.getUserRole();
      const targetPath = route.routeConfig?.path;
  
      // Redirection en fonction des rôles
      if (role === 'etudiant' && targetPath === 'student_side') {
        return true;
      }
      if (role === 'Professeur' && targetPath === 'professeur') {
        return true;
      }
      if (role === 'admin' && targetPath === 'dashboard') {
        return true;
      }
      // Si le rôle ne correspond pas à la page
      this.router.navigate(['/not-authorized']);
      return false;
    }
  
    // Si non authentifié, redirection vers la page de connexion
    this.router.navigate(['/signIn']);
    return false;
  }
  
}
