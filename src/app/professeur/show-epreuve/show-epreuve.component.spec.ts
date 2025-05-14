import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowEpreuveComponent } from './show-epreuve.component';

describe('ShowEpreuveComponent', () => {
  let component: ShowEpreuveComponent;
  let fixture: ComponentFixture<ShowEpreuveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowEpreuveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowEpreuveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
