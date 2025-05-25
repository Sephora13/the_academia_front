import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanifierSessionComponent } from './planifier-session.component';

describe('PlanifierSessionComponent', () => {
  let component: PlanifierSessionComponent;
  let fixture: ComponentFixture<PlanifierSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanifierSessionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanifierSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
