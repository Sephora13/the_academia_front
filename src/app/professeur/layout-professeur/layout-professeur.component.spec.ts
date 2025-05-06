import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutProfesseurComponent } from './layout-professeur.component';

describe('LayoutProfesseurComponent', () => {
  let component: LayoutProfesseurComponent;
  let fixture: ComponentFixture<LayoutProfesseurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutProfesseurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutProfesseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
