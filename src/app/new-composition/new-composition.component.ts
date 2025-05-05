import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as ace from "ace-builds";

@Component({
  selector: 'app-new-womposition',
  templateUrl: './new-composition.component.html',
  styleUrl: './new-composition.component.css'
})
export class NewCompositionComponent implements AfterViewInit {

  @ViewChild("editor") private editor !: ElementRef<HTMLElement>;
    
  ngAfterViewInit(): void {
    const aceEditor = ace.edit(this.editor.nativeElement);
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
    aceEditor.setOptions({
      fontSize: "14px"
    });
  
    aceEditor.session.setValue("<h1>Ace Editor works great in Angular!</h1>");
    aceEditor.setTheme('ace/theme/twilight');
    aceEditor.session.setMode('ace/mode/html');
    
    aceEditor.on("change", () => {
      console.log(aceEditor.getValue());
    });
  }
  
}
