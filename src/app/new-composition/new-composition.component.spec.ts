import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCompositionComponent } from './new-composition.component';

describe('NewCompositionComponent', () => {
  let component: NewCompositionComponent;
  let fixture: ComponentFixture<NewCompositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCompositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
