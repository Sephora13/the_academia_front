import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultatsEtudiantComponent } from './resultats-etudiant.component';

describe('ResultatsEtudiantComponent', () => {
  let component: ResultatsEtudiantComponent;
  let fixture: ComponentFixture<ResultatsEtudiantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultatsEtudiantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultatsEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
