import { TestBed } from '@angular/core/testing';

import { AffectationEpreuveService } from './affectation-epreuve.service';

describe('AffectationEpreuveService', () => {
  let service: AffectationEpreuveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AffectationEpreuveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
