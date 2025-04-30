import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream = signal<MediaStream | null>(null);
  private remoteStream = signal<MediaStream | null>(null);
  private connectionState = signal<'disconnected' | 'connecting' | 'connected'>('disconnected');
  private socket: WebSocket | null = null;

  private config: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  constructor() {}

  /**
   * Démarre le flux local et initialise WebRTC si autorisé
   */
  async startLocalStream(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localStream.set(stream);

      this.initializePeerConnection(); // ✅ Initialise après autorisation
      stream.getTracks().forEach(track => this.peerConnection?.addTrack(track, stream));

      this.connectToSignalingServer(); // ✅ Connecte au serveur WebSocket

      return stream;
    } catch (err) {
      console.error('Accès à la caméra refusé ou erreur :', err);
      throw new Error('Camera access is required.');
    }
  }

  /**
   * Initialise la connexion WebRTC
   */
  private initializePeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.config);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 ICE Candidate:', event.candidate);
        this.sendMessage({ type: 'candidate', candidate: event.candidate });
      }
    };

    this.peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.remoteStream.set(remoteStream);
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.connectionState.set(this.peerConnection!.connectionState as any);
    };
  }

  /**
   * Connexion WebSocket au serveur de signalisation
   */
  connectToSignalingServer() {
    this.socket = new WebSocket('ws://localhost:3000');

    this.socket.onopen = () => {
      console.log('✅ WebSocket connecté');
    };

    this.socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'offer':
          await this.handleOffer(data);
          break;
        case 'answer':
          await this.handleAnswer(data);
          break;
        case 'candidate':
          await this.addIceCandidate(data.candidate);
          break;
      }
    };

    this.socket.onerror = (err) => {
      console.error(' WebSocket error:', err);
    };
  }

  /**
   * Envoie un message JSON via WebSocket
   */
  sendMessage(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  async createOffer() {
    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    this.sendMessage(offer);
    return offer;
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    await this.peerConnection!.setRemoteDescription(offer);
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    this.sendMessage(answer);
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    await this.peerConnection!.setRemoteDescription(answer);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    await this.peerConnection!.addIceCandidate(candidate);
  }

  getLocalStream() {
    return this.localStream();
  }

  getRemoteStream() {
    return this.remoteStream();
  }

  getConnectionState() {
    return this.connectionState();
  }

  
}
