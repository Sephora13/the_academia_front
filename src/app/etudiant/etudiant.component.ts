import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';

interface Department {
  name: string;
  icon: string;
  subDepartments: string[];
}

interface Student {
  name: string;
  class: string;
}

@Component({
  selector: 'app-etudiant',
  imports: [FormsModule, CommonModule, SidebarAdminComponent],
  templateUrl: './etudiant.component.html',
  styleUrl: './etudiant.component.css'
})
export class EtudiantComponent {
  // Liste des départements avec icônes et sous-départements
  departements: Department[] = [
    {
      name: 'Département Informatique',
      icon: 'M4 4h16v12H4zM2 20h20M8 16v4M16 16v4',
      subDepartments: ['Système Informatique', 'Système Informatique et Logiciel', 'Réseaux et Télécommunications']
    },
    {
      name: 'Département Science de Gestion',
      icon: 'M3 3h18v18H3zM7 7h10v10H7z',
      subDepartments: ['Management', 'Comptabilité', 'Marketing']
    },
    {
      name: 'Département Science Agronomique',
      icon: 'M12 2a10 10 0 0 1 0 20M12 2a10 10 0 0 0 0 20M2 12h20',
      subDepartments: ['Biotechniques', 'Production Agricole', 'Agroalimentaire']
    }
  ];

  // Propriétés supplémentaires
  departmentOptions: string[] = ['Département Informatique', 'Département Science de Gestion', 'Département Science Agronomique'];
  selectedOption: string | null = null;

  // Sélection de l'option
  selectOption(option: string) {
    this.selectedOption = option;
  }
  // Département et sous-département actifs
  activeDept: Department | null = null;
  activeSubDept: string | null = null;
  activeClass: string | null = null;

  // Initialisation de studentsBySubDept par sous-département
  studentsBySubDept: { [subDept: string]: Student[] } = {
    'Système Informatique': [
      { name: 'Alice Doe', class: '1ère année' },
      { name: 'Bob Smith', class: '2ème année' }
    ],
    'Système Informatique et Logiciel': [
      { name: 'Charlie Brown', class: '1ère année' },
      { name: 'David Johnson', class: '2ème année' }
    ],
    'Réseaux et Télécommunications': [
      { name: 'Eve Williams', class: '3ème année' },
      { name: 'Frank Thomas', class: '3ème année' }
    ],
    'Management': [
      { name: 'George Anderson', class: '1ère année' },
      { name: 'Helen White', class: '2ème année' }
    ],
    'Comptabilité': [
      { name: 'Isabelle Green', class: '3ème année' },
      { name: 'Jack Black', class: '2ème année' }
    ],
    'Marketing': [
      { name: 'Karen Grey', class: '1ère année' },
      { name: 'Liam Young', class: '3ème année' }
    ],
    'Biotechniques': [
      { name: 'Maria Gomez', class: '1ère année' },
      { name: 'Nina Torres', class: '2ème année' }
    ],
    'Production Agricole': [
      { name: 'Oscar Ford', class: '3ème année' },
      { name: 'Paul Allen', class: '2ème année' }
    ],
    'Agroalimentaire': [
      { name: 'Quinn Lee', class: '1ère année' },
      { name: 'Rose Adams', class: '3ème année' }
    ]
  };

  
  // Basculer l'affichage des sous-départements
  toggleSubCards(deptName: string): void {
    if (this.activeDept && this.activeDept.name === deptName) {
      this.activeDept = null;
      this.activeSubDept = null;
    } else {
      this.activeDept = this.departements.find(d => d.name === deptName) || null;
      this.activeSubDept = null;
    }
  }


  // Afficher la liste des étudiants par sous-département
  showStudents(subDept: string): void {
    this.activeSubDept = subDept;
  }

  // Effacer la sélection
  clearSelection() {
    this.selectedOption = null;
    this.activeDept = null;
    this.activeSubDept = null;
    this.activeClass = null;
  }
}
