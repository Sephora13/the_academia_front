import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { SignalingService } from '../services/signaling.service';
import { isPlatformBrowser } from '@angular/common';
import { CoordinateurSideComponent } from '../coordinateur-side/coordinateur-side.component';

@Component({
  selector: 'app-tracking',
  imports: [CoordinateurSideComponent],
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.css'
})
export class TrackingComponent implements OnInit {
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  private peerConnection!: RTCPeerConnection;

  constructor(private signaling: SignalingService, @Inject(PLATFORM_ID) private platformId: Object) {}

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.signaling.setRole('coordinateur');

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.peerConnection.ontrack = (event) => {
      console.log('[Coordinateur] Track received:', event.streams);
      this.remoteVideo.nativeElement.srcObject = event.streams[0];
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[Coordinateur] Sending ICE candidate:', event.candidate);
        this.signaling.sendCandidate(event.candidate);
      }
    };

    this.signaling.offer$.subscribe(async offer => {
      console.log('[Coordinateur] Offer received');
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.signaling.sendAnswer(answer);
    });

    this.signaling.candidate$.subscribe(candidate => {
      console.log('[Coordinateur] ICE candidate received:', candidate);
      this.peerConnection.addIceCandidate(candidate);
    });
  }

}
