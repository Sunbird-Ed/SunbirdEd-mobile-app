import { UserHomePage } from './user-home.page';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Events } from '@ionic/angular';
import { AppGlobalService } from '../../services/app-global-service.service';
import { CommonUtilService } from '../../services/common-util.service';
import { Router } from '@angular/router';
import { AppHeaderService } from '../../services/app-header.service';
import {
  FrameWorkService
} from 'sunbird-sdk';
import { of } from 'rxjs';
import { NavigationService } from '../../services/navigation-handler.service';
import { ContentAggregatorHandler } from '../../services/content/content-aggregator-handler.service';
import { ProfileService } from '@project-sunbird/sunbird-sdk';

describe('UserHomePage', () => {
  let homePage: UserHomePage;
  const mockAppGlobalService: Partial<AppGlobalService> = {
  };
  const mockAppVersion: Partial<AppVersion> = {
    getAppName: jest.fn(() => Promise.resolve('sunbird'))
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockProfileService: Partial<ProfileService> = {
    getActiveSessionProfile: jest.fn(() => of({ profileType: 'Student' } as any))
  };
  const mockFrameworkService: Partial<FrameWorkService> = {};
  const mockEvents: Partial<Events> = {
    subscribe: jest.fn()
  };
  const mockHeaderService: Partial<AppHeaderService> = {};
  const mockRouter: Partial<Router> = {};
  const mockNavService: Partial<NavigationService> = {
    navigateToTrackableCollection: jest.fn(),
    navigateToCollection: jest.fn(),
    navigateToContent: jest.fn()
  };
  const mockContentAggregatorHandler: Partial<ContentAggregatorHandler> = {};
 

  beforeAll(() => {
    homePage = new UserHomePage(
      mockFrameworkService as FrameWorkService,
      mockProfileService as ProfileService,
      mockCommonUtilService as CommonUtilService,
      mockRouter as Router,
      mockAppGlobalService as AppGlobalService,
      mockAppVersion as AppVersion,
      mockContentAggregatorHandler as ContentAggregatorHandler,
      mockNavService as NavigationService,
      mockHeaderService as AppHeaderService,
      mockEvents as Events
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be create an instance of HomePage', () => {
    expect(homePage).toBeTruthy();
  });
});
