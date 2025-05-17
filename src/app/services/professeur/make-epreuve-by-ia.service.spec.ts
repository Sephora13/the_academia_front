import { TestBed } from '@angular/core/testing';

import { MakeEpreuveByIaService } from './make-epreuve-by-ia.service';

describe('MakeEpreuveByIaService', () => {
  let service: MakeEpreuveByIaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MakeEpreuveByIaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
