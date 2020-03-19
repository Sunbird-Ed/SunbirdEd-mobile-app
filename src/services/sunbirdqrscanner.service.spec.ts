import { SunbirdQRScanner } from './sunbirdqrscanner.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
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
import { EventEmitter } from 'events';

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
  });

  it('should create an instance of SunbirdQRScanner', () => {
    expect(sunbirdQRScanner).toBeTruthy();
  });

  // describe('checkQuizContent()', () => {
  //   it('should navigate to contentdetails page if its a Quiztype content', (done) => {
  //     // arrange
  //     // act
  //     // assert
  //   });
  // });

});
