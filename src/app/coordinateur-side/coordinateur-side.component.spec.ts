import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinateurSideComponent } from './coordinateur-side.component';

describe('CoordinateurSideComponent', () => {
  let component: CoordinateurSideComponent;
  let fixture: ComponentFixture<CoordinateurSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordinateurSideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoordinateurSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
