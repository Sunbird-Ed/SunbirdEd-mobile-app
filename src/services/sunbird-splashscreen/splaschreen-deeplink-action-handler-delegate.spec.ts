import { SplaschreenDeeplinkActionHandlerDelegate } from './splaschreen-deeplink-action-handler-delegate';
import {
    ContentService, SharedPreferences, AuthService, ProfileService, PageAssembleService,
    FrameworkService, FrameworkUtilService
} from 'sunbird-sdk';
import {
    FormAndFrameworkUtilService, AppGlobalService,
    CommonUtilService, TelemetryGeneratorService, UtilityService,
    LoginHandlerService, QRScannerResultHandler, ContainerService
} from '../../services';
import { Events, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { EventTopics, PreferenceKey } from '../../app/app.constant';
import { of } from 'rxjs';
describe('SplaschreenDeeplinkActionHandlerDelegate', () => {
    let splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate;
    const mockContentService: Partial<ContentService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('')),
        putString: jest.fn(() => of(''))
    };
    const mockAuthService: Partial<AuthService> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockPageAssembleService: Partial<PageAssembleService> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockEvents: Partial<Events> = {
          subscribe: jest.fn((arg, fn) => {
            return fn('');
        })
    };
    const mockRouter: Partial<Router> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockPopoverController: Partial<PopoverController> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    const mockTranslateService: Partial<TranslateService> = {
        use: jest.fn(() => of({}))
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockQRScannerResultHandler: Partial<QRScannerResultHandler> = {};
    const mockContainerService: Partial<ContainerService> = {};
    beforeAll(() => {
        splaschreenDeeplinkActionHandlerDelegate = new SplaschreenDeeplinkActionHandlerDelegate(
            mockContentService as ContentService,
            mockSharedPreferences as SharedPreferences,
            mockAuthService as AuthService,
            mockProfileService as ProfileService,
            mockPageAssembleService as PageAssembleService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockRouter as Router,
            mockAppVersion as AppVersion,
            mockUtilityService as UtilityService,
            mockPopoverController as PopoverController,
            mockLoginHandlerService as LoginHandlerService,
            mockTranslateService as TranslateService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockQRScannerResultHandler as QRScannerResultHandler,
            mockContainerService as ContainerService,
        );
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should create an instance of SplaschreenDeeplinkActionHandlerDelegate', () => {
        expect(splaschreenDeeplinkActionHandlerDelegate).toBeTruthy();
    });
    // describe('onAction', () => {
    //   it('should terminate if the payload url is emplty', (done) => {
    //     // arrange
    //     const payload = null;
    //     // act
    //     splaschreenDeeplinkActionHandlerDelegate.onAction(payload);
    //     // assert
    //     setTimeout(() => {
    //         done();
    //     }, 0);
    //   });

    //   it('should terminate if the payload url is emplty', (done) => {
    //     // arrange
    //     const payload = { url: 'SAMPLE_URL' };
    //     mockFormAndFrameworkUtilService.getDeeplinkRegexFormApi = jest.fn(() => Promise.resolve('sample_regex'));
    //     // act
    //     splaschreenDeeplinkActionHandlerDelegate.onAction(payload);
    //     // assert
    //     setTimeout(() => {
    //         done();
    //     }, 0);
    //   });
    // });
});