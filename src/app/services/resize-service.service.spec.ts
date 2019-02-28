import { TestBed } from '@angular/core/testing';

import { ResizeServiceService } from './resize-service.service';

describe('ResizeServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResizeServiceService = TestBed.get(ResizeServiceService);
    expect(service).toBeTruthy();
  });
});
