import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef,Inject, OnInit, PLATFORM_ID, QueryList, ViewChild, ViewChildren } from '@angular/core';
import * as ace from "ace-builds";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification/authentification.service';
import { CompositionService } from '../services/composition/composition.service';
import { SignalingService } from '../services/signaling/signaling.service';


@Component({
  selector: 'app-new-composition',
  standalone: true,
  imports: [CommonModule],
  template: '<video #localVideo autoplay muted playsinline></video>',
  templateUrl: './new-composition.component.html',
  styleUrls: ['./new-composition.component.css']
})
export class NewCompositionComponent implements AfterViewInit, OnInit {
  webcamBlocked = false;
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  private localStream!: MediaStream;
  private peerConnection!: RTCPeerConnection;
  private tabSwitchCount = 0;
  showConfirmation = false;
  showDownloadModal = false;
  isGeneratingPdf = false;
  pdfUrl: string | null = null;

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private auth: AuthentificationService,
    private compositionService: CompositionService,
    public router: Router,
    private signaling: SignalingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.id_epreuve = Number(this.route.snapshot.params['id']);
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
     // Bloquer clic droit
     document.addEventListener('contextmenu', this.preventDefaultEvent);

     // Bloquer copier/coller
     document.addEventListener('copy', this.preventDefaultEvent);
     document.addEventListener('paste', this.preventDefaultEvent);
 
     // Détecter changement d'onglet
     document.addEventListener('visibilitychange', () => {
       if (document.visibilityState === 'hidden') {
         this.tabSwitchCount++;
         if (this.tabSwitchCount === 1) {
           alert('Veuillez rester sur cette page !');
         } else if (this.tabSwitchCount === 2) {
          alert('vous avez été éjecté de la composition')
           this.router.navigate(['/student_side']);
         }
       }
     });
     await this.loadExamInfo();
     await this.loadQuestions();
  }

  preventDefaultEvent(event: Event) {
    event.preventDefault();
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



  async loadExamInfo(): Promise<void>{
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
  

  async loadQuestions(): Promise<void> {
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

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

  try {
    this.signaling.setRole('meeting');

    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideo.nativeElement.srcObject = this.localStream;
    this.webcamBlocked = false; // L'accès est autorisé

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
    console.error('[Meeting] Webcam non accessible :', error);
    this.webcamBlocked = true; // Webcam bloquée
  }

  
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

  // Modifiez la méthode submitExam() pour générer le PDF avant d'afficher la modal
submitExam() {
  if (this.loading) return;
  this.showConfirmation = false;
  this.loading = true;

  this.user = this.auth.getUserInfo2();
  if (!this.user) {
    console.log("Utilisateur non authentifié.");
    return;
  }

  const payloadCopie = {
    id_etudiant: this.user.id,
    id_epreuve: this.id_epreuve,
    reponses_qcm: this.selectedOptions,
    reponses_code: this.codeAnswers,
    reponses_courtes: this.shortAnswers
  };

  this.compositionService.soumettreCopie(payloadCopie).subscribe({
    next: (res) => {
      const idCopie = res?.id_copie_numerique;
      if (!idCopie) {
        console.error("❌ ID de la copie non reçu.");
        this.loading = false;
        return;
      }

      this.compositionService.corrigerCopie(idCopie).subscribe({
        next: async (correctionRes) => {
          const note = correctionRes?.note || correctionRes?.message?.note_finale;
          console.log("✅ Note finale :", note);
          
          // Générer le PDF avant d'afficher la modal
          await this.generateExamPdf();
          
          this.loading = false;
          this.showDownloadModal = true; // Afficher la modal APRES génération PDF
        },
        error: (err) => {
          console.error("❌ Erreur de correction :", err);
          this.loading = false;
          // Afficher quand même la modal en cas d'erreur de correction
          this.downloadExamPdf().finally(() => {
            this.showDownloadModal = true;
          });
        }
      });
    },
    error: (err) => {
      console.error("❌ Erreur soumission copie :", err);
      this.loading = false;
    }
  });
}

  async downloadExamPdf() {
    this.isGeneratingPdf = true;
    
    try {
      const data = document.getElementById('main-content')!;
      const canvas = await html2canvas(data);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      this.pdfUrl = pdf.output('bloburl').toString();

      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      this.isGeneratingPdf = false;
    }
  }
  
  async generateExamPdf() {
    this.isGeneratingPdf = true;
    
    try {
      const doc = new jsPDF();
      
      // En-tête
      doc.setFontSize(20);
      doc.text(this.examInfo.titre, 105, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`${this.examInfo.niveau} - Durée: ${this.examInfo.duree}`, 105, 25, { align: 'center' });
      
      let yPosition = 40;
      
      // Partie 1 : QCM
      if (this.partie1.length > 0) {
        doc.setFontSize(16);
        doc.text("Questions à Choix Multiple (QCM)", 14, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        this.partie1.forEach((question, index) => {
          doc.text(`${index + 1}. ${question.contenu}`, 16, yPosition);
          yPosition += 8;
          
          question.option.forEach((option: string, optIndex: number) => {
            doc.text(`   ${String.fromCharCode(97 + optIndex)}) ${option}`, 20, yPosition);
            yPosition += 7;
          });
          
          yPosition += 5; // Espace entre les questions
        });
      }
      
      // Partie 2 : Code
      if (this.partie2.length > 0) {
        doc.setFontSize(16);
        doc.text("Écriture de Code", 14, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        this.partie2.forEach((question, index) => {
          doc.text(`${index + 1}. ${question.contenu}`, 16, yPosition);
          yPosition += 10;
        });
      }
      
      // Partie 3 : Réponses Courtes
      if (this.partie3.length > 0) {
        doc.setFontSize(16);
        doc.text("Questions à Réponse Courte", 14, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        this.partie3.forEach((question, index) => {
          doc.text(`${index + 1}. ${question.contenu}`, 16, yPosition);
          yPosition += 10;
        });
      }
      
      // Pied de page
      doc.setFontSize(10);
      doc.text("© Academia - Tous droits réservés", 105, 280, { align: 'center' });
      
      this.pdfUrl = doc.output('bloburl').toString();
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      const doc = new jsPDF();
      doc.text("Erreur de génération du sujet", 10, 10);
      this.pdfUrl = doc.output('bloburl').toString();
    } finally {
      this.isGeneratingPdf = false;
    }
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

  ngOnDestroy() {
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
    }
  }
}
