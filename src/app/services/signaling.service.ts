import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class SignalingService {
  socket: Socket;
  offer$ = new Subject<RTCSessionDescriptionInit>();
  answer$ = new Subject<RTCSessionDescriptionInit>();
  candidate$ = new Subject<RTCIceCandidate>();

  constructor() {
    this.socket = io('https://the-academia-nestapi.onrender.com');

    this.socket.on('offer', (data) => this.offer$.next(data));
    this.socket.on('answer', (data) => this.answer$.next(data));
    this.socket.on('candidate', (data) => this.candidate$.next(new RTCIceCandidate(data)));
  }

  sendOffer(offer: RTCSessionDescriptionInit) {
    this.socket.emit('offer', offer);
  }

  sendAnswer(answer: RTCSessionDescriptionInit) {
    this.socket.emit('answer', answer);
  }

  sendCandidate(candidate: RTCIceCandidate) {
    this.socket.emit('candidate', candidate);
  }

  setRole(role: string) {
    this.socket.emit('role', role);
  }
}
