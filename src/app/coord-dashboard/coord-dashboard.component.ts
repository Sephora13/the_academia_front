import { Component, OnInit, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import * as echarts from 'echarts';
import { CoordinateurSideComponent } from '../coordinateur-side/coordinateur-side.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-coord-dashboard',
  imports: [CoordinateurSideComponent, FormsModule, CommonModule],
  templateUrl: './coord-dashboard.component.html',
  styleUrl: './coord-dashboard.component.css'
})
export class CoordDashboardComponent implements OnDestroy, OnInit, AfterViewInit {
   hours = 0;
  minutes = 5;
  seconds = 0;
  running = false;
  private intervalId: any = null;
  
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initProgressChart();
    this.initAlertsChart();
    this.initTableInteractions();
  }

  initProgressChart(): void {
    const chartDom = document.getElementById('progressChart')!;
    const myChart = echarts.init(chartDom);
    const option = {
      animation: false,
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        textStyle: { color: "#1f2937" },
      },
      grid: { top: 10, right: 10, bottom: 30, left: 50 },
      xAxis: {
        type: "category",
        data: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
        axisLine: { lineStyle: { color: "#e5e7eb" } },
        axisLabel: { color: "#1f2937" },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisLabel: { color: "#1f2937" },
        splitLine: { lineStyle: { color: "#e5e7eb" } },
      },
      series: [
        {
          name: "En composition",
          type: "line",
          smooth: true,
          symbol: "none",
          data: [5, 15, 28, 32, 32, 30],
          lineStyle: { width: 3, color: "rgba(87, 181, 231, 1)" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(87, 181, 231, 0.3)" },
              { offset: 1, color: "rgba(87, 181, 231, 0.1)" },
            ]),
          },
        },
        {
          name: "Terminé",
          type: "line",
          smooth: true,
          symbol: "none",
          data: [0, 0, 2, 3, 5, 7],
          lineStyle: { width: 3, color: "rgba(141, 211, 199, 1)" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(141, 211, 199, 0.3)" },
              { offset: 1, color: "rgba(141, 211, 199, 0.1)" },
            ]),
          },
        },
      ],
    };
    myChart.setOption(option);
  }

  initAlertsChart(): void {
    const chartDom = document.getElementById('alertsChart')!;
    const myChart = echarts.init(chartDom);
    const option = {
      animation: false,
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        textStyle: { color: "#1f2937" },
      },
      legend: {
        bottom: "0%",
        left: "center",
        textStyle: { color: "#1f2937" },
      },
      series: [{
        name: "Types d'alertes",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: "12", fontWeight: "bold" },
        },
        labelLine: { show: false },
        data: [
          { value: 12, name: "Changement d'onglet", itemStyle: { color: "rgba(252, 141, 98, 1)" } },
          { value: 8, name: "Copier-coller", itemStyle: { color: "rgba(251, 191, 114, 1)" } },
          { value: 5, name: "Inactivité", itemStyle: { color: "rgba(141, 211, 199, 1)" } },
          { value: 3, name: "Déconnexion", itemStyle: { color: "rgba(87, 181, 231, 1)" } },
        ],
      }],
    };
    myChart.setOption(option);
  }

  initTableInteractions(): void {
    const tableRows = document.querySelectorAll("tbody tr");
    tableRows.forEach((row) => {
      row.addEventListener("mouseenter", () => {
        if (!row.classList.contains("bg-red-50")) {
          row.classList.add("bg-gray-50");
        }
      });
      row.addEventListener("mouseleave", () => {
        if (!row.classList.contains("bg-red-50")) {
          row.classList.remove("bg-gray-50");
        }
      });
    });
  }
  

  @HostListener('window:resize')
  onResize(): void {
    echarts.getInstanceByDom(document.getElementById('progressChart')!)?.resize();
    echarts.getInstanceByDom(document.getElementById('alertsChart')!)?.resize();
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
