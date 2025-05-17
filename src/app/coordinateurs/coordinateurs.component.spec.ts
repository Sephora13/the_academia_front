import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinateursComponent } from './coordinateurs.component';

describe('CoordinateursComponent', () => {
  let component: CoordinateursComponent;
  let fixture: ComponentFixture<CoordinateursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordinateursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoordinateursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
