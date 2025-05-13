import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import * as ace from "ace-builds";
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-new-composition',
  imports: [CommonModule],
  templateUrl: './new-composition.component.html',
  styleUrls: ['./new-composition.component.css']
})
export class NewCompositionComponent implements AfterViewInit {
  countdown = '2:00:00';

  // Questions de chaque partie
  partie1 = [
    { question: 'A) Le père fondateur du langage Javascript est :', type: 'qcm', options: ['Brendan Eich', 'Dennis Ritchie', 'James Gosling'] },
  //  { question: 'B) Lequel des composants suivants, est utilisé pour compiler, déboguer et exécuter les programmes Java :', type: 'qcm', options: ['Jre', 'Jdk', 'Jvm', 'Jide'] },
  //  { question: 'C) HTML signifie :', type: 'qcm', options: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'] }
  ];

  partie2 = [
    { question: 'Écrivez un script JavaScript qui affiche "Hello World!"', type: 'code' },
   // { question: 'Écrivez une fonction JavaScript qui additionne deux nombres.', type: 'code' }
  ];

  partie3 = [
    { question: 'Décrivez brièvement ce qu’est une variable en JavaScript.', type: 'short-answer' },
    //{ question: 'Quelle est la différence entre "==" et "===" en JavaScript ?', type: 'short-answer' }
  ];

  // Pour stocker les réponses
  codeAnswers: string[] = [];
  shortAnswers: string[] = [];
  selectedOptions: { [key: string]: string } = {};

  // Gérer plusieurs éditeurs ACE
  @ViewChildren("editor") codeEditors!: QueryList<ElementRef>;
  @ViewChildren('examContent') examContent!: ElementRef;

  ngAfterViewInit(): void {
    this.codeEditors.forEach((editor, index) => {
      const aceEditor = ace.edit(editor.nativeElement);
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
  }

  // Enregistrement des réponses aux QCM
  selectOption(question: string, option: string) {
    this.selectedOptions[question] = option;
  }

  // Enregistrement des réponses courtes
  saveShortAnswer(index: number, event: Event) {
    const target = event.target as HTMLTextAreaElement | null;
    if (target) {
      this.shortAnswers[index] = target.value;
    }
  }
  
  // Méthode pour soumettre l'épreuve
  submitExam() {
    console.log("Réponses QCM:", this.selectedOptions);
    console.log("Réponses Code:", this.codeAnswers);
    console.log("Réponses Courtes:", this.shortAnswers);
    alert("Épreuve soumise. Consultez la console pour voir vos réponses.");
  }
}
