import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WebRTCService } from '../webrtc.service';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [],
  templateUrl: './video.component.html',
  styleUrl: './video.component.css'
})
export class VideoComponent implements OnInit{
  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;

  constructor(private webrtc: WebRTCService) {}

  async ngOnInit() {
    const stream = await this.webrtc.startLocalStream();
    this.localVideo.nativeElement.srcObject = stream;

    // en cas de réponse, faire :
    // this.remoteVideo.nativeElement.srcObject = this.webrtc.getRemoteStream();
  }

  async startCall() {
    const offer = await this.webrtc.createOffer();
    // 👉 envoyer l’offre via WebSocket ou HTTP
    console.log('Offer à envoyer :', offer);
  }

  // Reçois les offres/réponses de ton signaling ici et passe-les au service
}
