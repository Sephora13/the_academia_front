import { CanActivateFn } from '@angular/router';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthentificationService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      const role = this.authService.getUserRole();
      if (role === 'etudiant') {
        return true;
      } else {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }
  
    // Si non authentifié, redirection vers la page de connexion
    this.router.navigate(['/sign-in']);
    return false;
  }
  
}