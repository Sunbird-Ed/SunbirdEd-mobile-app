import { TestBed } from '@angular/core/testing';

import { AppGlobalServiceService } from './app-global-service.service';

describe('AppGlobalServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppGlobalServiceService = TestBed.get(AppGlobalServiceService);
    expect(service).toBeTruthy();
  });
});
