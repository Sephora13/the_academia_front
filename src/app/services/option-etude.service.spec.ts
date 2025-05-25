import { TestBed } from '@angular/core/testing';

import { OptionEtudeService } from './option-etude.service';

describe('OptionEtudeService', () => {
  let service: OptionEtudeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OptionEtudeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
