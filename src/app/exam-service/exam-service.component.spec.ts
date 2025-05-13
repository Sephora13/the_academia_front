import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamServiceComponent } from './exam-service.component';

describe('ExamServiceComponent', () => {
  let component: ExamServiceComponent;
  let fixture: ComponentFixture<ExamServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
