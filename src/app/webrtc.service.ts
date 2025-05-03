import { Injectable, signal } from '@angular/core';
import io from 'socket.io-client';

type SocketType = ReturnType<typeof io>;

@Injectable({ providedIn: 'root' })
export class WebRTCService {
  private socket!: SocketType;
  private pc: RTCPeerConnection | null = null;
  private remoteStream = signal<MediaStream | null>(null);

  private config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // TURN si nécessaire
    ]
  };

  /** Initialise et rejoint un room */
  public connect(roomId: string) {
    this.socket = io('http://localhost:3000');
    this.socket.emit('join-room', roomId);

    this.socket.on('signal', async (data: any) => {
      if (data.type === 'offer') {
        await this.handleOffer(data);
      } else if (data.type === 'answer') {
        await this.handleAnswer(data);
      } else if (data.candidate) {
        await this.pc?.addIceCandidate(data.candidate);
      }
    });
  }

  /** Pour l’émetteur : démarrer la caméra et créer l’offre */
  public async startPublishing(roomId: string): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });  
    this.initPeerConnection(roomId);
    stream.getTracks().forEach(t => this.pc!.addTrack(t, stream));
    await this.createOffer(roomId);
    return stream;
  }

  /** Pour le récepteur : ne pas appeler getUserMedia */
  public async startViewing(roomId: string) {
    this.initPeerConnection(roomId);
  }

  private initPeerConnection(roomId: string) {
    if (this.pc) return;
    this.pc = new RTCPeerConnection(this.config);
    this.pc.onicecandidate = e => {
      if (e.candidate) {
        this.socket.emit('signal', { roomId, data: { candidate: e.candidate } });
      }
    };
    this.pc.ontrack = e => {
      this.remoteStream.set(e.streams[0]);
    };
    this.connect(roomId);
  }

  private async createOffer(roomId: string) {
    const offer = await this.pc!.createOffer();
    await this.pc!.setLocalDescription(offer);
    this.socket.emit('signal', { roomId, data: offer });
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    await this.pc!.setRemoteDescription(offer);
    const answer = await this.pc!.createAnswer();
    await this.pc!.setLocalDescription(answer);
    this.socket.emit('signal', { roomId: offer.sdp!, data: answer });
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    await this.pc!.setRemoteDescription(answer);
  }

  public getRemoteStream() {
    return this.remoteStream();
  }
}
