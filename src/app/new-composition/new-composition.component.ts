import { Component, ElementRef, HostListener, inject,OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { WebRTCService } from '../webrtc.service';

@Component({
  selector: 'app-new-composition',
  standalone: true,
  imports: [FormsModule, RouterModule, MonacoEditorModule],
  templateUrl: './new-composition.component.html',
  styleUrl: './new-composition.component.css'
})
export class NewCompositionComponent implements OnInit {
  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;

  constructor(private webrtc: WebRTCService, private router: Router) {}

  async ngOnInit() {
    try {
      const stream = await this.webrtc.startLocalStream();
      this.localVideo.nativeElement.srcObject = stream;

      // Connexion WebSocket
      this.webrtc.connectToSignalingServer();

      // 👉 Lancer l’appel automatiquement (ou en attente d’un bouton)
      this.startCall();

    } catch (error) {
      alert('Accès à la caméra/micro refusé. L’application ne peut pas continuer.');
      // Optionnel : rediriger ou bloquer
      // window.location.href = '/erreur-camera';
    }
  }


  async startCall() {
    const offer = await this.webrtc.createOffer();
    // 👉 envoyer l’offre via WebSocket ou HTTP
    console.log('Offer à envoyer :', offer);
  }

  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code: string = `function hello() {\n  console.log('Hello world!');\n}`;

  tabLeaveCount = 0;


  @HostListener('document:visibilitychange', ['$event'])
  handleVisibilityChange(event: Event) {
    console.log('visibilitychange event detected! hidden =', document.hidden);

    if (document.hidden) {
      this.tabLeaveCount++;
      if (this.tabLeaveCount === 1) {
        alert('Attention : 1er avertissement, ne quittez plus la page.');
      } else if (this.tabLeaveCount === 2) {
        alert('Vous avez été déconnecté pour avoir quitté la page.');
        this.router.navigate(['/signIn']);
      }
    }
  }
}
