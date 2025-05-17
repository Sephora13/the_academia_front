import { Component, OnInit } from '@angular/core';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { Router } from '@angular/router';
import { CoordinateurSideComponent } from '../coordinateur-side/coordinateur-side.component';
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chart} from 'chart.js';



@Component({
  selector: 'app-exam-service',
  imports: [DashboardExamServiceComponent, FormsModule,CommonModule],
  templateUrl: './exam-service.component.html',
  styleUrl: './exam-service.component.css'
})
export class ExamServiceComponent implements OnInit {
  successRate = 78;
  averageScore = 14.5;
  studentsPassed = 420;

  examSessions = [
    { session: 'Janvier 2024', average: 13.8, passRate: 75 },
    { session: 'Mai 2024', average: 15.2, passRate: 82 },
    { session: 'Septembre 2024', average: 14.7, passRate: 78 }
  ];

  ngOnInit() {
    this.initChart();
  }

  initChart() {
    const ctx = document.getElementById('examSessionsChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.examSessions.map(s => s.session),
        datasets: [
          {
            label: 'Moyenne',
            data: this.examSessions.map(s => s.average),
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
          },
          {
            label: 'Taux de réussite (%)',
            data: this.examSessions.map(s => s.passRate),
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          
      }
    }
    });
  }

 
}
