import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowExamServiceComponent } from './show-exam-service.component';

describe('ShowExamServiceComponent', () => {
  let component: ShowExamServiceComponent;
  let fixture: ComponentFixture<ShowExamServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowExamServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowExamServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
