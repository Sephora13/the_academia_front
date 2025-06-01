import { Component, OnDestroy } from '@angular/core';
import { CoordinateurSideComponent } from '../coordinateur-side/coordinateur-side.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Student {
  nom: string;
  matricule: string;
  epreuve: string;
  status: 'en composition' | 'terminé';
}

export interface Alert {
  studentNom: string;
  message: string;
  timestamp: Date;
  level: 'faible' | 'moyen' | 'élevé';
}

export interface VideoRecord {
  studentNom: string;
  timestamp: Date;
}

export interface Message {
  text: string;
  timestamp: Date;
  fromAdmin: boolean;
}


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
  

  students: Student[] = [
    { nom: 'Alice Dupont', matricule: 'A123', epreuve: 'Mathématiques', status: 'en composition' },
    { nom: 'Bob Martin', matricule: 'B456', epreuve: 'Physique', status: 'terminé' },
    { nom: 'Claire Lefevre', matricule: 'C789', epreuve: 'Informatique', status: 'en composition' },
    { nom: 'David Bernard', matricule: 'D012', epreuve: 'Chimie', status: 'en composition' },
  ];

  alerts: Alert[] = [
    { studentNom: 'Alice Dupont', message: 'Changement d\'onglet détecté', timestamp: new Date(Date.now() - 600000), level: 'moyen' },
    { studentNom: 'Claire Lefevre', message: 'Inactivité prolongée', timestamp: new Date(Date.now() - 1200000), level: 'élevé' },
    { studentNom: 'David Bernard', message: 'Tentative de copier-coller', timestamp: new Date(Date.now() - 300000), level: 'faible' }
  ];

  videoRecords: VideoRecord[] = [
    { studentNom: 'Alice Dupont', timestamp: new Date(Date.now() - 86400000) },
    { studentNom: 'Claire Lefevre', timestamp: new Date(Date.now() - 172800000) },
  ];

  messages: Message[] = [];

  getStats() {
    return {
      connectedStudents: this.students.length,
      activeAlerts: this.alerts.length,
      avgSessionDuration: 45,
      incidentFreePercent: 75
    };
  }

  sendMessage(text: string): void {
    this.messages.push({ text, timestamp: new Date(), fromAdmin: true });
  }

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
