import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-new-composition',
  standalone: true,
  imports: [FormsModule, RouterModule, MonacoEditorModule],
  template: `
    <ngx-monaco-editor [options]="editorOptions" [(ngModel)]="code"></ngx-monaco-editor>
  `,
  styleUrls: ['./new-composition.component.css']
})
export class NewCompositionComponent {
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code: string = `function hello() {\n  console.log('Hello world!');\n}`;

  tabLeaveCount = 0;

  constructor(private router: Router) {}

  @HostListener('document:visibilitychange', ['$event'])
  handleVisibilityChange(event: Event) {
    console.log('visibilitychange event detected! hidden =', document.hidden);

    if (document.hidden) {
      this.tabLeaveCount++;
      if (this.tabLeaveCount === 1) {
        alert('Attention : 1er avertissement, ne quittez plus la page.');
      } else if (this.tabLeaveCount === 2) {
        alert('Vous avez été déconnecté pour avoir quitté la page.');
        this.router.navigate(['/signIn']);
      }
    }
  }
}
