import { TestBed } from '@angular/core/testing';

import { SessionExamensService } from './session-examens.service';

describe('SessionExamensService', () => {
  let service: SessionExamensService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionExamensService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
