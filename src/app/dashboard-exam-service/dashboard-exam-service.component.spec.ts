import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardExamServiceComponent } from './dashboard-exam-service.component';

describe('DashboardExamServiceComponent', () => {
  let component: DashboardExamServiceComponent;
  let fixture: ComponentFixture<DashboardExamServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardExamServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardExamServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
