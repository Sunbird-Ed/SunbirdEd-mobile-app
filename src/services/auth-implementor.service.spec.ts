import { TestBed } from '@angular/core/testing';

import { AuthImplementorService } from './auth-implementor.service';

describe('AuthImplementorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthImplementorService = TestBed.get(AuthImplementorService);
    expect(service).toBeTruthy();
  });
});
