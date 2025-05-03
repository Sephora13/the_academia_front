import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StreamService {
  private readonly apiUrl = 'https://votre-backend/api/stream-frame';

  constructor(private http: HttpClient) {}

  /**
   * Envoie un DataURL (JPEG) au backend.
   */
  sendFrame(dataUrl: string) {
    return this.http.post<{ status: string }>(this.apiUrl, { image: dataUrl });
  }

  /**
   * Démarre l’envoi périodique des frames capturées.
   * @param captureFn une fonction qui retourne le DataURL capturé
   * @param fps images par seconde
   */
  startStreaming(captureFn: () => string, fps: number = 1) {
    const period = 1000 / fps;
    return interval(period).subscribe(() => {
      const frame = captureFn();
      this.sendFrame(frame).subscribe({
        next: () => console.log('Frame envoyée'),
        error: err => console.error('Erreur envoi frame', err)
      });
    });
  }
}
