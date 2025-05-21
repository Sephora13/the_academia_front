import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowSignCoordinatorComponent } from './show-sign-coordinator.component';

describe('ShowSignCoordinatorComponent', () => {
  let component: ShowSignCoordinatorComponent;
  let fixture: ComponentFixture<ShowSignCoordinatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowSignCoordinatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowSignCoordinatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
