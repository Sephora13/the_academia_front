import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StreamService } from '../services/stream.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-camera',
  template: `
    <video #video autoplay muted playsinline style="display: none;"></video>
    <canvas #canvas style="width: 100%; height: auto;"></canvas>
  `
})
export class PublisherComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private streamSub!: Subscription;

  constructor(private streamService: StreamService) {}

  ngOnInit() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.videoRef.nativeElement.srcObject = stream;
        this.videoRef.nativeElement.play();

        // Démarrer l’envoi à 1 FPS ; augmentez fps si besoin
        this.streamSub = this.streamService.startStreaming(
          () => this.captureFrame(),
          1
        );
      })
      .catch(err => console.error('Accès webcam refusé', err));
  }

  ngOnDestroy() {
    this.streamSub?.unsubscribe();
    const tracks = (this.videoRef.nativeElement.srcObject as MediaStream)?.getTracks() || [];
    tracks.forEach(t => t.stop());
  }

  /**
   * Récupère la frame courante sous forme de DataURL JPEG.
   */
  private captureFrame(): string {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }
}
