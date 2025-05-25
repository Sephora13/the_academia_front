import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultatsEpreuveComponent } from './resultats-epreuve.component';

describe('ResultatsEpreuveComponent', () => {
  let component: ResultatsEpreuveComponent;
  let fixture: ComponentFixture<ResultatsEpreuveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultatsEpreuveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultatsEpreuveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
