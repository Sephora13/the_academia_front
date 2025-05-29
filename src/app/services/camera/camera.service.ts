import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private streamSubject = new BehaviorSubject<MediaStream | null>(null);
  public stream$ = this.streamSubject.asObservable();

  async initCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia non supporté');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.streamSubject.next(stream);
    } catch (error) {
      console.error('Erreur d’accès à la caméra', error);
      throw error;
    }
  }

  getCurrentStream(): MediaStream | null {
    return this.streamSubject.value;
  }
}
