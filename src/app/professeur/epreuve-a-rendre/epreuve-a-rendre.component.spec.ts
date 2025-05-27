import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpreuveARendreComponent } from './epreuve-a-rendre.component';

describe('EpreuveARendreComponent', () => {
  let component: EpreuveARendreComponent;
  let fixture: ComponentFixture<EpreuveARendreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpreuveARendreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpreuveARendreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
