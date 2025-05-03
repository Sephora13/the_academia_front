import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

export interface Detection {
  image: string;       // DataURL JPEG du frame annoté
  boxes: Array<{      // tableaux de bounding boxes
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class AlertSocketService {
  constructor(private socket: Socket | undefined) {}

  /**
   * S’abonne au flux de détections.
   */
  onDetection(): Observable<Detection> {
    return this.socket.fromEvent<Detection>('detection');
  }
}
