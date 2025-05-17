import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignThemComponent } from './sign-them.component';

describe('SignThemComponent', () => {
  let component: SignThemComponent;
  let fixture: ComponentFixture<SignThemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignThemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignThemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
