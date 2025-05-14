import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeEpreuveManuallyComponent } from './make-epreuve-manually.component';

describe('MakeEpreuveManuallyComponent', () => {
  let component: MakeEpreuveManuallyComponent;
  let fixture: ComponentFixture<MakeEpreuveManuallyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakeEpreuveManuallyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakeEpreuveManuallyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
