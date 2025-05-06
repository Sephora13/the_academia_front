import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeEpreuveByIaComponent } from './make-epreuve-by-ia.component';

describe('MakeEpreuveByIaComponent', () => {
  let component: MakeEpreuveByIaComponent;
  let fixture: ComponentFixture<MakeEpreuveByIaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakeEpreuveByIaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakeEpreuveByIaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
