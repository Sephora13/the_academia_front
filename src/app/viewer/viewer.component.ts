import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AlertSocketService, Detection } from '../services/alert-socket.service';

@Component({
  selector: 'app-coordinator-view',
  template: `
    <canvas #canvas style="width: 100%; height: auto; border: 1px solid #ccc;"></canvas>
  `
})
export class ViewerComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(private alertSocket: AlertSocketService) {}

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    this.alertSocket.onDetection().subscribe((det: Detection) => {
      const img = new Image();
      img.onload = () => {
        // Ajuste la taille du canvas
        canvas.width = img.width;
        canvas.height = img.height;
        // Dessine l’image annotée (YOLO a pu déjà tracer les boxes)
        ctx.drawImage(img, 0, 0);
        // Optionnel : redessiner les boxes côté client
        det.boxes.forEach(box => {
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
          ctx.font = '16px sans-serif';
          ctx.fillStyle = '#ff0000';
          ctx.fillText(
            `${box.label} (${(box.confidence * 100).toFixed(1)}%)`,
            box.x,
            box.y - 5
          );
        });
      };
      img.src = det.image;
    });
  }
}
