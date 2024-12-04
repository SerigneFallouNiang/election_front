import { TestBed } from '@angular/core/testing';

import { YoungService } from './young.service';

describe('YoungService', () => {
  let service: YoungService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YoungService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
