import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarProfComponent } from './sidebar-prof.component';

describe('SidebarProfComponent', () => {
  let component: SidebarProfComponent;
  let fixture: ComponentFixture<SidebarProfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarProfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarProfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
