import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationEtudiantComponent } from './notification-etudiant.component';

describe('NotificationEtudiantComponent', () => {
  let component: NotificationEtudiantComponent;
  let fixture: ComponentFixture<NotificationEtudiantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationEtudiantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
