import { SplaschreenDeeplinkActionHandlerDelegate } from './splaschreen-deeplink-action-handler-delegate';
import { PreferenceKey } from '../../app/app.constant';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { of } from 'rxjs';
import {
  PageAssembleService,
  FrameworkService,
  ContentService,
  SharedPreferences,
  AuthService,
  ProfileService,
  FrameworkUtilService,
  TelemetryService,
  StorageService,
  CourseService
} from 'sunbird-sdk';
import { AppGlobalService } from '../app-global-service.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { CommonUtilService } from '../../services/common-util.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { UtilityService } from '../utility-service';
import { LoginHandlerService } from '../login-handler.service';
import { TranslateService } from '@ngx-translate/core';
import { QRScannerResultHandler } from '../qrscanresulthandler.service';
import { SbProgressLoader } from '../sb-progress-loader.service';
import { Location } from '@angular/common';
import { NavigationService } from '../navigation-handler.service';
import { ContentPlayerHandler } from '../content/player/content-player-handler';
import { PageId } from '../telemetry-constants';



describe('SplaschreenDeeplinkActionHandlerDelegate', () => {
  let splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate;

  const mockContentService: Partial<ContentService> = {};
  const mockSharedPreferences: Partial<SharedPreferences> = {};
  const mockAuthService: Partial<AuthService> = {};
  const mockProfileService: Partial<ProfileService> = {};
  const mockPageAssembleService: Partial<PageAssembleService> = {};
  const mockFrameworkService: Partial<FrameworkService> = {};
  const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
  const mockTelemetryService: Partial<TelemetryService> = {};
  const mockStorageService: Partial<StorageService> = {};
  const mockCourseService: Partial<CourseService> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockAppGlobalService: Partial<AppGlobalService> = {};
  const mockEvents: Partial<Events> = {
    publish: jest.fn(),
    subscribe: jest.fn()
  };
  const mockRouter: Partial<Router> = {};
  const mockAppVersion: Partial<AppVersion> = {};
  const mockUtilityService: Partial<UtilityService> = {};
  const mockLoginHandlerService: Partial<LoginHandlerService> = {};
  const mockTranslateService: Partial<TranslateService> = {};
  const mockQRScannerResultHandler: Partial<QRScannerResultHandler> = {};
  const mockSbProgressLoader: Partial<SbProgressLoader> = {};
  const mockLocation: Partial<Location> = {};
  const mockNavigationService: Partial<NavigationService> = {};
  const mockContentPlayerHandler: Partial<ContentPlayerHandler> = {};


  beforeAll(() => {
    splaschreenDeeplinkActionHandlerDelegate = new SplaschreenDeeplinkActionHandlerDelegate(
      mockContentService as ContentService,
      mockSharedPreferences as SharedPreferences,
      mockAuthService as AuthService,
      mockProfileService as ProfileService,
      mockPageAssembleService as PageAssembleService,
      mockFrameworkService as FrameworkService,
      mockFrameworkUtilService as FrameworkUtilService,
      mockTelemetryService as TelemetryService,
      mockStorageService as StorageService,
      mockCourseService as CourseService,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockCommonUtilService as CommonUtilService,
      mockAppGlobalService as AppGlobalService,
      mockEvents as Events,
      mockRouter as Router,
      mockAppVersion as AppVersion,
      mockUtilityService as UtilityService,
      mockLoginHandlerService as LoginHandlerService,
      mockTranslateService as TranslateService,
      mockQRScannerResultHandler as QRScannerResultHandler,
      mockSbProgressLoader as SbProgressLoader,
      mockLocation as Location,
      mockNavigationService as NavigationService,
      mockContentPlayerHandler as ContentPlayerHandler,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create an instance of SplaschreenDeeplinkActionHandlerDelegate', () => {
    expect(splaschreenDeeplinkActionHandlerDelegate).toBeTruthy();
  });

  describe('onAction()', () => {
    it('should navigate to the Profile page if user is logged in', (done) => {
      // arrange
      const payload = {
        url: 'https://staging.sunbirded.org/profile'
      }
      mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve(undefined));
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
      mockSbProgressLoader.show = jest.fn();
      mockSbProgressLoader.hide = jest.fn();
      mockSharedPreferences.getString = jest.fn(() => of('true'));
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      // act
      splaschreenDeeplinkActionHandlerDelegate.onAction(payload);
      //assert
      setTimeout(() => {
        expect(mockQRScannerResultHandler.parseDialCode).toHaveBeenCalledWith(payload.url);
        done();
      }, 0);
    });

    it('should navigate to the Guest-Profile page if user is not logged in', (done) => {
      // arrange
      const payload = {
        url: 'https://staging.sunbirded.org/profile'
      }
      mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve(undefined));
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
      mockSbProgressLoader.show = jest.fn();
      mockSbProgressLoader.hide = jest.fn();
      mockSharedPreferences.getString = jest.fn(() => of('true'));
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      // act
      splaschreenDeeplinkActionHandlerDelegate.onAction(payload);
      //assert
      setTimeout(() => {
        expect(mockQRScannerResultHandler.parseDialCode).toHaveBeenCalledWith(payload.url);
        done();
      }, 0);
    });

    it('should navigate to the library page if content ID is changed', (done) => {
      // arrange
      const payload = {
        url: 'https://staging.sunbirded.org/learn/course/do_21312548637480550413399?contentId=asdsd'
      }
      mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve(undefined));
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
      mockSbProgressLoader.show = jest.fn();
      mockSbProgressLoader.hide = jest.fn();
      mockSharedPreferences.getString = jest.fn(() => of('true'));
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockTelemetryService.updateCampaignParameters = jest.fn();
      mockTelemetryGeneratorService.generateUtmInfoTelemetry = jest.fn();
      const content = {
        identifier: 'do_212911645382959104165',
        primaryCategory: 'Digital Textbook',
        contentData: { primaryCategory: 'Digital Textbook', licenseDetails: undefined, attributions: ['sample-3', 'sample-1'] },
        isAvailableLocally: false,
        children: { identifier: 'do_212911645382959104166' }
      };
      mockContentService.getContentDetails = jest.fn(() => of(content));
      // act
      splaschreenDeeplinkActionHandlerDelegate.onAction(payload);
      //assert
      setTimeout(() => {
        expect(mockQRScannerResultHandler.parseDialCode).toHaveBeenCalledWith(payload.url);
        expect(mockTelemetryService.updateCampaignParameters).toHaveBeenCalledWith([{ id: 'asdsd', type: 'ContentId' }]);
        expect(mockTelemetryGeneratorService.generateUtmInfoTelemetry).toHaveBeenCalledWith(
          { contentId: 'asdsd' },
          PageId.HOME,
          { id: 'do_21312548637480550413399', type: 'Content', version: undefined },
          [{ id: 'Deeplink', type: 'AccessType' }]);
        expect(mockContentService.getContentDetails).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should navigate to the search page if selectedTab is available in the deeplink', (done) => {
      // arrange
      const payload = {
        url: 'https://staging.sunbirded.org/explore?medium=Hindi&medium=English&gradeLevel=Class%201&gradeLevel=Class%2010&&&publisher=NCERT&channel=01283607456185548825093&board=CBSE&selectedTab=textbook'
      }
      mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve(undefined));
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
      mockSbProgressLoader.show = jest.fn();
      mockSbProgressLoader.hide = jest.fn();
      mockSharedPreferences.getString = jest.fn(() => of('true'));
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      // act
      splaschreenDeeplinkActionHandlerDelegate.onAction(payload);
      //assert
      setTimeout(() => {
        expect(mockQRScannerResultHandler.parseDialCode).toHaveBeenCalledWith(payload.url);
        done();
      }, 0);
    });
  });

});
