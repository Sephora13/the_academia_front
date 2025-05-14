import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecouvrirComponent } from './decouvrir.component';

describe('DecouvrirComponent', () => {
  let component: DecouvrirComponent;
  let fixture: ComponentFixture<DecouvrirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecouvrirComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecouvrirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
