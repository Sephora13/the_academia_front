import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultatsCompoToProfComponent } from './resultats-compo-to-prof.component';

describe('ResultatsCompoToProfComponent', () => {
  let component: ResultatsCompoToProfComponent;
  let fixture: ComponentFixture<ResultatsCompoToProfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultatsCompoToProfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultatsCompoToProfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
