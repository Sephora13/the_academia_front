import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompositionAdminComponent } from './composition-admin.component';

describe('CompositionAdminComponent', () => {
  let component: CompositionAdminComponent;
  let fixture: ComponentFixture<CompositionAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompositionAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompositionAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
