import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreerEpreuveComponent } from './creer-epreuve.component';

describe('CreerEpreuveComponent', () => {
  let component: CreerEpreuveComponent;
  let fixture: ComponentFixture<CreerEpreuveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreerEpreuveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreerEpreuveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
