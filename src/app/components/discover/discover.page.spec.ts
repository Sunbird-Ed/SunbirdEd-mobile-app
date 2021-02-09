import { DiscoverPage } from './discover.page';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Events, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderService } from '../../../services/app-header.service';
import { ContentAggregatorHandler } from '../../../services/content/content-aggregator-handler.service';
import { CommonUtilService, FormAndFrameworkUtilService } from '../../../services';
import { NavigationService } from '../../../services/navigation-handler.service';

describe('DiscoverPage', () => {
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
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockNavService: Partial<NavigationService> = {
    navigateToTrackableCollection: jest.fn(),
    navigateToCollection: jest.fn(),
    navigateToContent: jest.fn()
  };
  const mockPopoverController: Partial<PopoverController> = {};

  beforeAll(() => {
    discoverPage = new DiscoverPage(
      mockAppVersion as AppVersion, 
      mockHeaderService as AppHeaderService,
      mockRouter as Router,
      mockEvents as Events,
      mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
      mockContentAggregatorHandler as ContentAggregatorHandler,
      mockNavService as NavigationService,
      mockCommonUtilService as CommonUtilService,
      mockPopoverController as PopoverController
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be create an instance of DiscoverPage', () => {
    expect(discoverPage).toBeTruthy();
  });
});
