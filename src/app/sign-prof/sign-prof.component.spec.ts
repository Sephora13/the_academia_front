import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignProfComponent } from './sign-prof.component';

describe('SignProfComponent', () => {
  let component: SignProfComponent;
  let fixture: ComponentFixture<SignProfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignProfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignProfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
