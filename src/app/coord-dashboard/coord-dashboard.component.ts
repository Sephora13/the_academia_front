import { Component, OnDestroy } from '@angular/core';
import { CoordinateurSideComponent } from '../coordinateur-side/coordinateur-side.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coord-dashboard',
  imports: [CoordinateurSideComponent, FormsModule, CommonModule],
  templateUrl: './coord-dashboard.component.html',
  styleUrl: './coord-dashboard.component.css'
})
export class CoordDashboardComponent implements OnDestroy {
   hours = 0;
  minutes = 5;
  seconds = 0;
  running = false;
  private intervalId: any = null;

  startTimer() {
    if (this.running) return;

    this.running = true;
    this.intervalId = setInterval(() => {
      if (this.seconds === 0) {
        if (this.minutes === 0) {
          if (this.hours === 0) {
            this.stopTimer();
            alert('Time is up!');
            return;
          } else {
            this.hours--;
            this.minutes = 59;
            this.seconds = 59;
          }
        } else {
          this.minutes--;
          this.seconds = 59;
        }
      } else {
        this.seconds--;
      }
    }, 1000);
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
  }

  resetTimer() {
    this.stopTimer();
    this.hours = 0;
    this.minutes = 5;
    this.seconds = 0;
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
}
