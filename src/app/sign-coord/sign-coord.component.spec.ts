import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignCoordComponent } from './sign-coord.component';

describe('SignCoordComponent', () => {
  let component: SignCoordComponent;
  let fixture: ComponentFixture<SignCoordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignCoordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignCoordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
