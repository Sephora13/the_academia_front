import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignExamserviceComponent } from './sign-examservice.component';

describe('SignExamserviceComponent', () => {
  let component: SignExamserviceComponent;
  let fixture: ComponentFixture<SignExamserviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignExamserviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignExamserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
