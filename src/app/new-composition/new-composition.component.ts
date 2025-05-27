import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef,Inject, OnInit, PLATFORM_ID, QueryList, ViewChild, ViewChildren } from '@angular/core';
import * as ace from "ace-builds";
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';
import { CompositionService } from '../services/composition.service';
import { SignalingService } from '../services/signaling.service';


@Component({
  selector: 'app-new-composition',
  standalone: true,
  imports: [CommonModule],
  template: `<video #localVideo autoplay muted playsinline></video>`,
  templateUrl: './new-composition.component.html',
  styleUrls: ['./new-composition.component.css']
})
export class NewCompositionComponent implements AfterViewInit, OnInit {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  private localStream!: MediaStream;
  private peerConnection!: RTCPeerConnection;

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private auth: AuthentificationService,
    private compositionService: CompositionService,
    private router: Router,
    private signaling: SignalingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.id_epreuve = this.route.snapshot.params['id'];
  }
  
  user: { id: number, nom: string, prenom: string } | null = null;
  examInfo: any = {};
  id_epreuve: number = 0;

  partie1: any[] = []; // QCM
  partie2: any[] = []; // Questions de Code
  partie3: any[] = []; // Réponses Courtes

  selectedOptions: { [key: number]: string } = {};
  codeAnswers: string[] = [];
  shortAnswers: string[] = [];

  @ViewChildren("editor") codeEditors!: QueryList<ElementRef>;

  loading = true;
  error: string | null = null;

  remainingTime: string = '';
  private countdownTimer: any;
  

  async ngOnInit() {
    this.loadExamInfo();
    this.loadQuestions();

    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.signaling.setRole('meeting');

      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localVideo.nativeElement.srcObject = this.localStream;

      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[Meeting] Sending ICE candidate:', event.candidate);
          this.signaling.sendCandidate(event.candidate);
        }
      };

      this.signaling.answer$.subscribe(async answer => {
        console.log('[Meeting] Answer received');
        await this.peerConnection.setRemoteDescription(answer);
      });

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.signaling.sendOffer(offer);
    } catch (error) {
      console.error('[Meeting] Error:', error);
    }
  }
  

  startCountdown(duration: string) {
    const totalSeconds = this.parseDuration(duration);
    if (totalSeconds === 0) {
      this.remainingTime = '00:00:00';
      return;
    }
  
    this.updateRemainingTime(totalSeconds);
  
    this.countdownTimer = setInterval(() => {
      const newTime = this.parseTimeString(this.remainingTime) - 1;
  
      if (newTime <= 0) {
        clearInterval(this.countdownTimer);
        this.remainingTime = '00:00:00';
        this.submitExam();
      } else {
        this.updateRemainingTime(newTime);
      }
    }, 1000);
  }
  

  updateRemainingTime(totalSeconds: number) {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    this.remainingTime = `${h}:${m}:${s}`;
  }

  parseDuration(text: string): number {
    let hours = 0, minutes = 0;

    const hourMatch = text.match(/(\d+)\s*h/);
    const minuteMatch = text.match(/(\d+)\s*min/);

    if (hourMatch) hours = parseInt(hourMatch[1], 10);
    if (minuteMatch) minutes = parseInt(minuteMatch[1], 10);

    return hours * 3600 + minutes * 60;
  }

  parseTimeString(timeStr: string): number {
    const [h, m, s] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }



  loadExamInfo(): void {
    this.loading = true;
    this.error = null;
  
    this.compositionService.showInfoEp(this.id_epreuve).subscribe({
      next: (response) => {
        if (response.success) {
          this.examInfo = response.message;
  
          this.startCountdown(this.examInfo.duree)
        } else {
          this.error = "Impossible de récupérer les informations de l'épreuve.";
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement épreuve :', err);
        this.error = this.handleError(err);
        this.loading = false;
      }
    });
  }
  

  loadQuestions(): void {
    this.loading = true;
    this.compositionService.showQuesByEp(this.id_epreuve).subscribe({
      next: (response) => {
        if (response.success) {
          response.message.forEach((question: any) => {
            switch (question.type_question) {
              case "QCM":
                this.partie1.push(question);
                break;
              case "code":
                this.partie2.push(question);
                break;
              case "ouverte":
                this.partie3.push(question);
                break;
            }
          });
        } else {
          this.error = "Impossible de récupérer les questions.";
        }
        this.loading = false;
      },
      error: (err) => {
        console.error("Erreur chargement questions :", err);
        this.error = this.handleError(err);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.codeEditors.changes.subscribe(() => {
      this.codeEditors.forEach((editorRef, index) => {
        const aceEditor = ace.edit(editorRef.nativeElement);
  
        // ✅ Bloquer copier-coller dans l’éditeur
        const textInput: HTMLTextAreaElement = aceEditor.textInput.getElement();
  
        textInput.addEventListener('copy', (e: ClipboardEvent) => {
          e.preventDefault();
          alert('Copie désactivée');
        });
  
        textInput.addEventListener('paste', (e: ClipboardEvent) => {
          e.preventDefault();
          alert('Coller désactivé');
        });
  
        textInput.addEventListener('cut', (e: ClipboardEvent) => {
          e.preventDefault();
          alert('Couper désactivé');
        });
  
        // ✅ Configuration d'Ace
        ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
        aceEditor.setOptions({
          fontSize: "14px",
          theme: 'ace/theme/twilight',
          mode: 'ace/mode/javascript'
        });
  
        aceEditor.session.setValue("");
  
        aceEditor.on("change", () => {
          this.codeAnswers[index] = aceEditor.getValue();
        });
      });
    });
  }

  selectOption(questionId: number, option: string) {
    this.selectedOptions[questionId] = option;
  }

  saveShortAnswer(index: number, event: Event) {
    const target = event.target as HTMLTextAreaElement | null;
    if (target) {
      this.shortAnswers[index] = target.value;
    }
  }

  submitExam() {
    if (this.loading) return; // Empêche les clics multiples
  
    this.user = this.auth.getUserInfo2();
    if (!this.user) {
      console.log("Utilisateur non authentifié.");
      return;
    }
  
    this.loading = true;
  
    const payloadCopie = {
      id_etudiant: this.user.id,
      id_epreuve: this.id_epreuve,
      reponses_qcm: this.selectedOptions,
      reponses_code: this.codeAnswers,
      reponses_courtes: this.shortAnswers
    };
  
    console.log("Soumission de la copie numérique :", payloadCopie);
  
    this.compositionService.soumettreCopie(payloadCopie).subscribe({
      next: (res) => {
        console.log("✅ Copie soumise avec succès", res);
  
        const idCopie = res?.message?.id_copie_numerique;
        if (!idCopie) {
          console.error("❌ ID de la copie non reçu.");
          this.loading = false;
          return;
        }
  
        console.log("⏳ Correction en cours...");
        this.compositionService.corrigerCopie(idCopie).subscribe({
          next: (correctionRes) => {
            const note = correctionRes?.note || correctionRes?.message?.note_finale;
            console.log("✅ Note finale :", note);
            alert(`✅ Votre copie a été corrigée. Note : ${note}/20`);
            this.loading = false;
        
            // Redirection après 2 secondes vers le tableau de bord (à adapter)
            setTimeout(() => {
              this.router.navigate(['/composition']);
            }, 2000);
          },
          error: (err) => {
            console.error("❌ Erreur de correction :", err);
            alert("❌ Erreur lors de la correction.");
            this.loading = false;
          }
        });
        
      },
      error: (err) => {
        console.error("❌ Erreur soumission copie :", err);
        alert("❌ Échec de la soumission.");
        this.loading = false;
      }
    });
  }
  
  //empêcher le copier-coller dans le text-area
  onBlockAction(event: ClipboardEvent): void {
    event.preventDefault();
    alert('Copier-coller désactivé');
  }
  

  private handleError(err: any): string {
    if (err.status === 0) {
      return 'Connexion au serveur impossible.';
    } else if (err.status >= 400 && err.status < 500) {
      return `Erreur client (${err.status}): ${err.error?.message || err.error?.detail || err.statusText}`;
    } else if (err.status >= 500) {
      return `Erreur serveur (${err.status}): ${err.error?.message || err.error?.detail || err.statusText}`;
    }
    return 'Erreur inconnue.';
  }
}
