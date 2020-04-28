import { TestBed } from '@angular/core/testing';

import { SbProgressLoader } from './sb-progress-loader.service';

describe('SplashscreenProgressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SbProgressLoader = TestBed.get(SbProgressLoader);
    expect(service).toBeTruthy();
  });
});
