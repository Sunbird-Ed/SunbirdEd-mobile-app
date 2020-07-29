import { SunbirdQRScanner } from './sunbirdqrscanner.service';
import { TranslateService } from '@ngx-translate/core';
import { Platform, PopoverController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { CommonUtilService } from './common-util.service';
import { AndroidPermissionsService } from './android-permissions/android-permissions.service';
import { ContainerService } from './container.services';
import { AppGlobalService } from './app-global-service.service';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { QRScannerResultHandler } from './qrscanresulthandler.service';
import { of } from 'rxjs';
import { InteractType, InteractSubtype, PageId, Environment } from './telemetry-constants';

describe('SunbirdQRScanner', () => {
  let sunbirdQRScanner: SunbirdQRScanner;

  const mockTranslateService: Partial<TranslateService> = {
    get: jest.fn(() => of('sample_translation')),
    instant: jest.fn(() => 'sample_translation'),
  };
  mockTranslateService.onLangChange = {
    subscribe: jest.fn((fn) => {
      return fn({});
    })
  } as any;
  const mockPlatform: Partial<Platform> = {};
  const mockQRScannerResultHandler: Partial<QRScannerResultHandler> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockAppGlobalService: Partial<AppGlobalService> = {};
  const mockContainerService: Partial<ContainerService> = {};
  const mockAndroidPermissionsService: Partial<AndroidPermissionsService> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockAppVersion: Partial<AppVersion> = {
    getAppName: jest.fn(() => Promise.resolve('sunbird'))
  };
  const mockToastController: Partial<ToastController> = {};
  const mockPopoverController: Partial<PopoverController> = {};
  const mockRouter: Partial<Router> = {};

  beforeAll(() => {
    sunbirdQRScanner = new SunbirdQRScanner(
      mockTranslateService as TranslateService,
      mockPlatform as Platform,
      mockQRScannerResultHandler as QRScannerResultHandler,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockAppGlobalService as AppGlobalService,
      mockContainerService as ContainerService,
      mockAndroidPermissionsService as AndroidPermissionsService,
      mockCommonUtilService as CommonUtilService,
      mockAppVersion as AppVersion,
      mockToastController as ToastController,
      mockPopoverController as PopoverController,
      mockRouter as Router,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create an instance of SunbirdQRScanner', () => {
    expect(sunbirdQRScanner).toBeTruthy();
  });

  describe('showInvalidCodeAlert', () => {
    it('should show Invalid Code Alert', () => {
      // arrange
      const scannData = 'sample-scan-data';
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      sunbirdQRScanner.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
      mockCommonUtilService.afterOnBoardQRErrorAlert = jest.fn(() => Promise.resolve());
      // act
      sunbirdQRScanner.showInvalidCodeAlert(scannData);
      // assert
      setTimeout(() => {
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
          InteractType.OTHER,
          InteractSubtype.QR_CODE_INVALID,
          Environment.ONBOARDING,
          undefined
        );
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
          InteractSubtype.QR_CODE_INVALID, '',
          sunbirdQRScanner.source,
          Environment.HOME,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        );
      }, 0);
    });
  });

});
