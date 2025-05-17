import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coordinateurs',
  imports: [FormsModule, CommonModule, SidebarAdminComponent],
  templateUrl: './coordinateurs.component.html',
  styleUrl: './coordinateurs.component.css'
})
export class CoordinateursComponent {
  currentSection = 'coordinators';
  coordinators = [
    { name: 'Emma White', center: 'Gbegamey' },
    { name: 'Liam Green', center: 'Porto Novo' }
  ];
}
