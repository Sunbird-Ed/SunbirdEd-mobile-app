import { DiscoverPage } from './discover.page';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Events } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderService } from '../../services/app-header.service';
import { ContentAggregatorHandler } from '../../services/content/content-aggregator-handler.service';
import { FormAndFrameworkUtilService } from '../../services';

describe('CoursesPage', () => {
  let discoverPage: DiscoverPage;
  const mockAppVersion: Partial<AppVersion> = {
    getAppName: jest.fn(() => Promise.resolve('sunbird'))
  };
  const mockEvents: Partial<Events> = {
    subscribe: jest.fn()
  };
  const mockHeaderService: Partial<AppHeaderService> = {};
  const mockRouter: Partial<Router> = {};
  const mockContentAggregatorHandler: Partial<ContentAggregatorHandler> = {};
  const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
    init: jest.fn(),
    checkNewAppVersion: jest.fn(() => Promise.resolve({}))
  };

  beforeAll(() => {
    discoverPage = new DiscoverPage(
      mockAppVersion as AppVersion, 
      mockHeaderService as AppHeaderService,
      mockRouter as Router,
      mockEvents as Events,
      mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
      mockContentAggregatorHandler as ContentAggregatorHandler
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be create an instance of DiscoverPage', () => {
    expect(discoverPage).toBeTruthy();
  });
});
