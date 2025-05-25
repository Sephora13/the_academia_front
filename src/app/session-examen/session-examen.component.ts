import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router'; // Import Router for navigation

// Declarations for parent components
import { HeaderComponent } from '../header/header.component'; // Adjust path
import { DashboardExamServiceComponent } from '../dashboard-exam-service/dashboard-exam-service.component'; // Adjust path

// --- Interface definitions for (simulated) data ---
interface SessionExamenRead {
  id_session: number;
  nom: string;
  date_debut: Date;
  date_fin: Date;
  statut: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
  created_at: Date;
  updated_at: Date;
}

interface SessionExamenCreate {
  nom: string;
  date_debut: Date;
  date_fin: Date;
  statut: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
}

interface SessionExamenUpdate {
  nom?: string;
  date_debut?: Date;
  date_fin?: Date;
  statut?: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
}
// --- End of interface definitions ---


@Component({
  selector: 'app-session-examen',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    DashboardExamServiceComponent
  ],
  templateUrl: './session-examen.component.html',
  styleUrls: ['./session-examen.component.css']
})
export class SessionExamenComponent implements OnInit {
  sessions: SessionExamenRead[] = [];
  filteredSessions: SessionExamenRead[] = [];
  sessionForm: FormGroup;
  isEditMode: boolean = false;
  currentSessionId: number | null = null;
  searchTerm: string = '';
  selectedStatus: string | null = null;
  availableStatuses: string[] = ['Planifiée', 'En cours', 'Terminée', 'Annulée'];
  selectedCreationYear: number | null = null; // New property for year filter
  availableCreationYears: number[] = []; // Available years for the filter
  showSessionModal: boolean = false;
  private toastTimeout: any;

  // Simulated data
  private mockSessions: SessionExamenRead[] = [
    {
      id_session: 1,
      nom: 'Session Hiver 2024',
      date_debut: new Date('2024-01-15T09:00:00Z'),
      date_fin: new Date('2024-01-25T17:00:00Z'),
      statut: 'Terminée',
      created_at: new Date('2023-10-01T10:00:00Z'),
      updated_at: new Date('2024-01-25T18:00:00Z')
    },
    {
      id_session: 2,
      nom: 'Session Printemps 2025',
      date_debut: new Date('2025-03-01T09:00:00Z'),
      date_fin: new Date('2025-03-15T17:00:00Z'),
      statut: 'Planifiée',
      created_at: new Date('2024-11-01T10:00:00Z'),
      updated_at: new Date('2024-11-01T10:00:00Z')
    },
    {
      id_session: 3,
      nom: 'Session Été 2024',
      date_debut: new Date('2024-07-01T09:00:00Z'),
      date_fin: new Date('2024-07-10T17:00:00Z'),
      statut: 'En cours',
      created_at: new Date('2024-04-15T10:00:00Z'),
      updated_at: new Date('2024-07-05T11:30:00Z')
    },
    {
      id_session: 4,
      nom: 'Session Rattrapage Automne 2024',
      date_debut: new Date('2024-09-01T09:00:00Z'),
      date_fin: new Date('2024-09-05T17:00:00Z'),
      statut: 'Annulée',
      created_at: new Date('2024-06-20T10:00:00Z'),
      updated_at: new Date('2024-08-10T14:00:00Z')
    },
    {
      id_session: 5,
      nom: 'Session Spéciale 2023',
      date_debut: new Date('2023-12-01T09:00:00Z'),
      date_fin: new Date('2023-12-05T17:00:00Z'),
      statut: 'Terminée',
      created_at: new Date('2023-09-01T10:00:00Z'),
      updated_at: new Date('2023-12-06T18:00:00Z')
    }
  ];
  private nextSessionId = 6;

  constructor(
    private fb: FormBuilder,
    private router: Router // Inject Router service
  ) {
    this.sessionForm = this.fb.group({
      nom: ['', Validators.required],
      date_debut: ['', Validators.required],
      date_fin: ['', Validators.required],
      statut: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  /**
   * Loads all exam sessions from a simulated service.
   * Also initializes available creation years for the filter.
   */
  loadSessions(): void {
    this._get_all_sessions_examen().subscribe({
      next: (data: SessionExamenRead[]) => {
        this.sessions = data;
        // Extract unique creation years and sort them in descending order
        this.availableCreationYears = [...new Set(this.sessions.map(s => s.created_at.getFullYear()))].sort((a, b) => b - a);
        this.filterSessions(); // Apply initial filter on load
        this.showToast('Info', 'Sessions loaded (simulated).', 'info');
      },
      error: (err) => {
        console.error('Error loading sessions (simulated) :', err);
        this.showToast('Error', 'Unable to load sessions (simulated).', 'danger');
      }
    });
  }

  /**
   * Filters and sorts the displayed sessions based on search term, selected status,
   * and selected creation year.
   */
  filterSessions(): void {
    let tempSessions = [...this.sessions];

    // Filter by selected status
    if (this.selectedStatus !== null) {
      tempSessions = tempSessions.filter(session => session.statut === this.selectedStatus);
    }

    // Filter by selected creation year
    if (this.selectedCreationYear !== null) {
      tempSessions = tempSessions.filter(session => session.created_at.getFullYear() === this.selectedCreationYear);
    }

    // Filter by search term
    if (this.searchTerm) {
      tempSessions = tempSessions.filter(session =>
        session.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        session.statut.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Sort by creation date (most recent to oldest)
    this.filteredSessions = tempSessions.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  /**
   * Opens the modal for adding a new session.
   */
  openAddSessionModal(): void {
    this.isEditMode = false;
    this.currentSessionId = null;
    this.sessionForm.reset(); // Reset the form
    this.sessionForm.get('statut')?.setValue(null); // Ensure status is reset
    this.showSessionModal = true; // Show the modal
  }

  /**
   * Opens the modal for editing an existing session.
   * @param session The session to edit.
   */
  openEditSessionModal(session: SessionExamenRead): void {
    this.isEditMode = true;
    this.currentSessionId = session.id_session;
    // Format dates for input type="date" fields
    const formattedDateDebut = session.date_debut.toISOString().substring(0, 10);
    const formattedDateFin = session.date_fin.toISOString().substring(0, 10);

    this.sessionForm.patchValue({
      nom: session.nom,
      date_debut: formattedDateDebut,
      date_fin: formattedDateFin,
      statut: session.statut
    });
    this.showSessionModal = true; // Show the modal
  }

  /**
   * Saves a session (creation or modification) via the simulated service.
   */
  saveSession(): void {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched(); // Show validation errors
      this.showToast('Error', 'Please fill in all required fields.', 'danger');
      return;
    }

    // Convert date strings to Date objects
    const sessionData: SessionExamenCreate | SessionExamenUpdate = {
      ...this.sessionForm.value,
      date_debut: new Date(this.sessionForm.value.date_debut),
      date_fin: new Date(this.sessionForm.value.date_fin)
    };

    if (this.isEditMode && this.currentSessionId !== null) {
      this._update_session_examen(this.currentSessionId, sessionData as SessionExamenUpdate).subscribe({
        next: (updatedSession) => {
          if (updatedSession) {
            this.showToast('Success', 'Session modified successfully!', 'success');
            this.loadSessions(); // Reload the list
            this.showSessionModal = false; // Hide the modal
          } else {
            this.showToast('Error', 'Session not found for modification.', 'danger');
          }
        },
        error: (err) => {
          console.error('Error modifying session (simulated) :', err);
          this.showToast('Error', 'An error occurred during modification (simulated).', 'danger');
        }
      });
    } else {
      this._create_session_examen(sessionData as SessionExamenCreate).subscribe({
        next: (newSession) => {
          this.showToast('Success', 'Session added successfully!', 'success');
          this.loadSessions(); // Reload the list
          this.showSessionModal = false; // Hide the modal
        },
        error: (err) => {
          console.error('Error adding session (simulated) :', err);
          this.showToast('Error', 'Unable to add session (simulated).', 'danger');
        }
      });
    }
  }

  /**
   * Asks for confirmation and deletes a session via the simulated service.
   * @param id The ID of the session to delete.
   */
  confirmDeleteSession(id: number): void {
    if (confirm('Are you sure you want to delete this session? This action is irreversible.')) {
      this._delete_session_examen(id).subscribe({
        next: (success) => {
          if (success) {
            this.showToast('Success', 'Session deleted successfully!', 'success');
            this.loadSessions(); // Reload the list
          } else {
            this.showToast('Error', 'Unable to delete session (not found).', 'danger');
          }
        },
        error: (err) => {
          console.error('Error deleting session (simulated) :', err);
          this.showToast('Error', 'An error occurred during deletion (simulated).', 'danger');
        }
      });
    }
  }

  /**
   * Redirects to the session details page (to be implemented later).
   * @param id The ID of the session.
   */
  viewSessionDetails(id: number): void {
    // Navigate to the planifier-session page with the session ID
    this.router.navigate(['/planifier_session', id]);
  }

  /**
   * Displays a Toast message.
   * @param title Toast title.
   * @param message Message content.
   * @param type Message type for styling (success, danger, info).
   */
  showToast(title: string, message: string, type: 'success' | 'danger' | 'info'): void {
    const toastElement = document.getElementById('sessionExamenToast'); // Use specific ID
    if (toastElement) {
      const toastTitleElement = toastElement.querySelector('.toast-title');
      const toastMessageElement = toastElement.querySelector('.toast-message');

      if (toastTitleElement && toastMessageElement) {
        toastTitleElement.textContent = title;
        toastMessageElement.textContent = message;

        const header = toastElement.querySelector('.toast-header-bg') as HTMLElement;
        const body = toastElement.querySelector('.toast-body-bg') as HTMLElement;

        header.classList.remove('bg-green-700', 'bg-red-700', 'bg-blue-700');
        body.classList.remove('bg-green-800', 'bg-red-800', 'bg-blue-800');

        if (type === 'success') {
          header.classList.add('bg-green-700');
          body.classList.add('bg-green-800');
        } else if (type === 'danger') {
          header.classList.add('bg-red-700');
          body.classList.add('bg-red-800');
        } else if (type === 'info') {
          header.classList.add('bg-blue-700');
          body.classList.add('bg-blue-800');
        }

        toastElement.classList.remove('opacity-0', 'pointer-events-none');
        toastElement.classList.add('opacity-100');

        if (this.toastTimeout) {
          clearTimeout(this.toastTimeout);
        }
        this.toastTimeout = setTimeout(() => {
          this.hideToast();
        }, 3000);
      }
    }
  }

  /**
   * Hides the Toast message.
   */
  hideToast(): void {
    const toastElement = document.getElementById('sessionExamenToast');
    if (toastElement) {
      toastElement.classList.remove('opacity-100');
      toastElement.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  // --- Simulated service methods ---

  private _get_all_sessions_examen(): Observable<SessionExamenRead[]> {
    return of([...this.mockSessions]).pipe(delay(500));
  }

  private _create_session_examen(session: SessionExamenCreate): Observable<SessionExamenRead> {
    const newSession: SessionExamenRead = {
      id_session: this.nextSessionId++,
      nom: session.nom,
      date_debut: session.date_debut,
      date_fin: session.date_fin,
      statut: session.statut,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.mockSessions.push(newSession);
    return of(newSession).pipe(delay(500));
  }

  private _update_session_examen(id: number, session: SessionExamenUpdate): Observable<SessionExamenRead | null> {
    const index = this.mockSessions.findIndex(s => s.id_session === id);
    if (index > -1) {
      const updatedSession = { ...this.mockSessions[index], ...session, updated_at: new Date() };
      this.mockSessions[index] = updatedSession;
      return of(updatedSession).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  private _delete_session_examen(id: number): Observable<boolean> {
    const initialLength = this.mockSessions.length;
    this.mockSessions = this.mockSessions.filter(session => session.id_session !== id);
    return of(this.mockSessions.length < initialLength).pipe(delay(500));
  }
}
