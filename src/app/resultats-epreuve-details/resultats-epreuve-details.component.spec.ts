import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultatsEpreuveDetailsComponent } from './resultats-epreuve-details.component';

describe('ResultatsEpreuveDetailsComponent', () => {
  let component: ResultatsEpreuveDetailsComponent;
  let fixture: ComponentFixture<ResultatsEpreuveDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultatsEpreuveDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultatsEpreuveDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
