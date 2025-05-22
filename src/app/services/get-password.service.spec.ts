import { TestBed } from '@angular/core/testing';

import { GetPasswordService } from './get-password.service';

describe('GetPasswordService', () => {
  let service: GetPasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetPasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
