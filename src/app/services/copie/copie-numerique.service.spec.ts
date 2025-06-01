import { TestBed } from '@angular/core/testing';

import { CopieNumeriqueService } from '../copie-numerique.service';

describe('CopieNumeriqueService', () => {
  let service: CopieNumeriqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CopieNumeriqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
