import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StreamService } from '../services/stream.service';

@Component({
  selector: 'app-new-womposition',
  template: `
    <video #video autoplay muted playsinline style="display: none;"></video>
    <canvas #canvas style="width: 100%; height: auto;"></canvas>
  `
})
export class NewCompositionComponent implements OnInit {
    ngOnInit(): void {
        
    }
}
