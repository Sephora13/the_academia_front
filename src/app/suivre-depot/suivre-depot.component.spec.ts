import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuivreDepotComponent } from './suivre-depot.component';

describe('SuivreDepotComponent', () => {
  let component: SuivreDepotComponent;
  let fixture: ComponentFixture<SuivreDepotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuivreDepotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuivreDepotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
