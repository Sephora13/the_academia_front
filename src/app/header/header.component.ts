import { AfterViewInit, Component, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements AfterViewInit {
  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const toggleBtn = document.getElementById('header-toggle');
    const sidebar   = document.getElementById('sidebar');
    const headerEl  = document.getElementById('header');
    const mainEl    = document.getElementById('main');

    if (toggleBtn && sidebar && headerEl && mainEl) {
      this.renderer.listen(toggleBtn, 'click', () => {
        this.toggleClass(sidebar,  'show-sidebar');
        this.toggleClass(headerEl, 'left-pd');
        this.toggleClass(mainEl,   'left-pd');
      });
    }
  }

  private toggleClass(el: HTMLElement, className: string): void {
    if (el.classList.contains(className)) {
      this.renderer.removeClass(el, className);
    } else {
      this.renderer.addClass(el, className);
    }
  }
}
