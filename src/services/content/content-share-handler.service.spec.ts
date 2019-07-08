import { TestBed } from '@angular/core/testing';

import { ContentShareHandlerService } from './content-share-handler.service';

describe('ContentShareHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContentShareHandlerService = TestBed.get(ContentShareHandlerService);
    expect(service).toBeTruthy();
  });
});
