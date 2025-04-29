import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCompositionComponent } from './create-composition.component';

describe('CreateCompositionComponent', () => {
  let component: CreateCompositionComponent;
  let fixture: ComponentFixture<CreateCompositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCompositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
