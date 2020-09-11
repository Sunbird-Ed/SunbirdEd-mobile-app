import { QRScannerResultHandler } from './qrscanresulthandler.service';
import { TelemetryService, TelemetryObject, Mode, ContentService,
   FrameworkService, PageAssembleService } from 'sunbird-sdk';
import {
  Environment, ImpressionSubtype, ImpressionType, InteractSubtype, InteractType, ObjectType, PageId,
  LogLevel, CorReleationDataType, CorrelationData
} from '@app/services/telemetry-constants';
import { of, throwError } from 'rxjs';
import { CommonUtilService } from './common-util.service';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Router } from '@angular/router';
import { NavController, Events } from '@ionic/angular';
import { AppGlobalService } from './app-global-service.service';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { NavigationService } from '../services/navigation-handler.service';

declare const cordova;

describe('QRScannerResultHandler', () => {
  let qRScannerResultHandler: QRScannerResultHandler;
  const mockContentService: Partial<ContentService> = {
    getContentDetails: jest.fn()
  };
  const mockTelemetryService: Partial<TelemetryService> = {
    buildContext: jest.fn(),
    updateUtmParameters: jest.fn()
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
    showToast: jest.fn()
  };
  mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateInteractTelemetry: jest.fn(),
    generateImpressionTelemetry: jest.fn(),
    generateEndTelemetry: jest.fn(),
    generateUtmInfoTelemetry: jest.fn()
  };

  const mockRouter: Partial<Router> = {
    navigate: jest.fn()
  };

  const mockNavController: Partial<NavController> = {
    navigateForward: jest.fn()
  };

  const mockEvents: Partial<Events> = {
  };
  const mockAppglobalService: Partial<AppGlobalService> = {
    getCachedDialCodeConfig: jest.fn()
  };

  const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
  };

  const mockPageAssembleService: Partial<PageAssembleService> = {};
  const mockFrameworkService: Partial<FrameworkService> = {};
  const mockNavigationService: Partial<NavigationService> = {
    navigateToDetailPage: jest.fn()
  };


  beforeAll(() => {
    qRScannerResultHandler = new QRScannerResultHandler(
      mockContentService as ContentService,
      mockTelemetryService as TelemetryService,
      mockPageAssembleService as PageAssembleService,
      mockFrameworkService as FrameworkService,
      mockCommonUtilService as CommonUtilService,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockRouter as Router,
      mockNavController as NavController,
      mockEvents as Events,
      mockAppglobalService as AppGlobalService,
      mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
      mockNavigationService as NavigationService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of QRScannerResultHandler', () => {
    expect(qRScannerResultHandler).toBeTruthy();
  });


  describe('parseDialCode()', () => {
    it('should return parsed data from the link', (done) => {
      // arrange
      mockFormAndFrameworkUtilService.getDialcodeRegexFormApi = jest.fn(() =>
        Promise.resolve('(\\/dial\\/(?<sunbird>[a-zA-Z0-9]+)|(\\/QR\\/\\?id=(?<epathshala>[a-zA-Z0-9]+)))'));
      // act
      // assert
      qRScannerResultHandler.parseDialCode('https//www.sunbirded.org/get/dial/ABCDEF').then((response) => {
        expect(response).toEqual('ABCDEF');
        done();
      });
    });

    it('should not return parsed data if scannData does not match to regex', (done) => {
      // arrange
      const formValResponse = { values: '(\\/dial\\/(?<sunbird>[a-zA-Z0-9]+)|(\\/QR\\/\\?id=(?<epathshala>[a-zA-Z0-9]+)))' };
      const regexExp = formValResponse.values;
      qRScannerResultHandler['getDailCodeRegularExpression'] = jest.fn(() => Promise.resolve(regexExp));
      mockFormAndFrameworkUtilService.getDialcodeRegexFormApi = jest.fn(() =>
        Promise.resolve('(\\/dial\\/([a-zA-Z0-9]+)|(\\/QR\\/\\?id=([a-zA-Z0-9]+)))'));
      // act
      // assert
      qRScannerResultHandler.parseDialCode('https//www.sunbirded.org/get/content/ABCDEF').then((response) => {
        expect(response).toBeUndefined();
        done();
      });

    });

    it('should return undefined if dailCode regex is undefined', (done) => {
      // arrange
      const formValResponse = { values: '(\\/dial\\/(?<sunbird>[a-zA-Z0-9]+)|(\\/QR\\/\\?id=(?<epathshala>[a-zA-Z0-9]+)))' };
      const regexExp = formValResponse.values;
      qRScannerResultHandler['getDailCodeRegularExpression'] = jest.fn(() => Promise.resolve(regexExp));
      mockFormAndFrameworkUtilService.getDialcodeRegexFormApi = jest.fn(() =>
        Promise.resolve(undefined));
      // act
      // assert
      qRScannerResultHandler.parseDialCode('https//www.sunbirded.org/get/dial/ABCDEF').then((response) => {
        expect(response).toBeUndefined();
        done();
      });
    });
  });

  describe('isContentId()', () => {
    it('should return true if its a valid content deeplink', () => {
      // arrange
      // act
      // assert
      expect(qRScannerResultHandler.isContentId('https://sunbirded.org/resources/play/content/do_21259106171407564812108')).toBeTruthy();
    });

    it('should return true if its a valid course deeplink', () => {
      // arrange
      // act
      // assert
      expect(qRScannerResultHandler.isContentId('https://sunbirded.org/explore-course/course/do_212718772878598144126')).toBeTruthy();
    });

    it('should return true if its a valid Textbook deeplink', () => {
      // arrange
      // act
      // assert
      expect(qRScannerResultHandler.isContentId('https://sunbirded.org/resources/play/collection/do_2124835969611448321701')).toBeTruthy();
    });
  });

  describe('handleDialCode()', () => {
    it('should navigate to Search page if the scanned data is a dialocde link', () => {
      // arrange
      const scannData =  'https://sunbirded.org/get/dial/ABCDEF?channel=igot&role=other';
      mockTelemetryGeneratorService.generateUtmInfoTelemetry = jest.fn();
      const params = {channel: 'igot', role: 'other'};
      mockTelemetryService.updateCampaignParameters = jest.fn();
      jest.spyOn(qRScannerResultHandler, 'generateQRScanSuccessInteractEvent').mockImplementation(() => {
        return;
      });
      const corRelationData: CorrelationData[] = [{
        id: CorReleationDataType.SCAN,
        type: CorReleationDataType.ACCESS_TYPE
      }];
      // act
      qRScannerResultHandler.handleDialCode('profile-settings', scannData, 'ABCDEF');
      // assert
      expect(mockTelemetryService.updateCampaignParameters).toHaveBeenCalled();
      expect(mockNavController.navigateForward).toHaveBeenCalledWith(['/search'], {
        state: {
          dialCode: 'ABCDEF',
          corRelation: [{ id: 'ABCDEF', type: 'qr' },
           {id: 'https://sunbirded.org', type: 'Source'}],
          source: 'profile-settings',
          shouldGenerateEndTelemetry: true
        }
      });
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'https://sunbirded.org/get/dial/ABCDEF';
      values['action'] = 'SearchResult';

      expect(mockTelemetryGeneratorService.generateUtmInfoTelemetry).toHaveBeenCalledWith(
        params,
        PageId.QRCodeScanner, { id: 'ABCDEF', type: 'qr', version: ' ' },
        corRelationData);
    });
  });

  describe('handleContentId()', () => {
    it('should navigate to ContentDetails page if the scanned data is a content deeplink', (done) => {
      // arrange
      const scannData =  'https://sunbirded.org/get/dial/ABCDEF?channel=igot&role=other';
      const content = { identifier: 'do_12345', contentData: { contentType: 'Resource', primaryCategory: 'Learning Resource' } } as any;
      mockContentService.getContentDetails = jest.fn(() => of(content));
      mockTelemetryService.updateCampaignParameters = jest.fn();
      jest.spyOn(qRScannerResultHandler, 'generateQRScanSuccessInteractEvent').mockImplementation(() => {
        return;
      });
      const params = {channel: 'igot', role: 'other'};
      mockTelemetryGeneratorService.generateUtmInfoTelemetry = jest.fn();
      // act
      qRScannerResultHandler.handleContentId('profile-settings', scannData);
      // assert
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'https://sunbirded.org/resources/play/content/do_12345';
      values['action'] = 'ContentDetail';
      const corRelationData: CorrelationData[] = [{
        id: CorReleationDataType.SCAN,
        type: CorReleationDataType.ACCESS_TYPE
      }];
      setTimeout(() => {
        expect(mockNavigationService.navigateToDetailPage).toHaveBeenCalledWith(
          content,
          {
            content,
            corRelation: [{ id: 'do_12345', type: 'qr' },
            {id: 'https://sunbirded.org', type: 'Source'}],
            source: 'profile-settings',
            shouldGenerateEndTelemetry: true
          }
        );
        expect(mockTelemetryService.updateCampaignParameters).toHaveBeenCalledWith([{
          id: 'igot', type: 'Source'
        }, {
          id: 'other', type: 'Role'
        }]);

        expect(mockTelemetryGeneratorService.generateUtmInfoTelemetry).toHaveBeenCalledWith(
          params,
          PageId.QRCodeScanner, { id: 'do_12345', type: 'Learning Resource', version: undefined },
          corRelationData);
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
          ImpressionType.VIEW, ImpressionSubtype.QR_CODE_VALID,
          PageId.QRCodeScanner,
          Environment.HOME,
          'ABCDEF?channel=igot&role=other', ObjectType.QR, '');
        done();
      });
    });

    it('should navigate to CollectionDetails page if the scanned data is a Collection deeplink', (done) => {
      // arrange
      const scannData =  'https://sunbirded.org/get/dial/ABCDEF?channel=igot&role=other';
      const content = {
        identifier: 'do_12345', mimeType: 'application/vnd.ekstep.content-collection',
        contentData: { contentType: 'Resource', primaryCategory: 'Learning Resource' }
      } as any;
      mockContentService.getContentDetails = jest.fn(() => of(content));
      mockTelemetryService.updateCampaignParameters = jest.fn();
      jest.spyOn(qRScannerResultHandler, 'generateQRScanSuccessInteractEvent').mockImplementation(() => {
        return;
      });
      mockTelemetryGeneratorService.generateUtmInfoTelemetry = jest.fn();
      const params = {channel: 'igot', role: 'other'};
      // act
      qRScannerResultHandler.handleContentId('profile-settings', scannData);
      // assert
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'https://sunbirded.org/resources/play/collection/do_12345';
      values['action'] = 'ContentDetail';
      const corRelationData: CorrelationData[] = [{
        id: CorReleationDataType.SCAN,
        type: CorReleationDataType.ACCESS_TYPE
      }];
      setTimeout(() => {
        expect(mockNavigationService.navigateToDetailPage).toHaveBeenCalledWith(
          content,
          {
            content,
            corRelation: [{ id: 'do_12345', type: 'qr' },
            {id: 'https://sunbirded.org', type: 'Source'}],
            source: 'profile-settings',
            shouldGenerateEndTelemetry: true
          }
        );
        expect(mockTelemetryService.updateCampaignParameters).toHaveBeenCalledWith([
          {id: 'igot', type: 'Source'},
          {id: 'other', type: 'Role'}
        ]);

        expect(mockTelemetryGeneratorService.generateUtmInfoTelemetry).toHaveBeenCalledWith(
          params,
          PageId.QRCodeScanner, { id: 'do_12345', type: 'Learning Resource', version: undefined },
          corRelationData);
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
          ImpressionType.VIEW, ImpressionSubtype.QR_CODE_VALID,
          PageId.QRCodeScanner,
          Environment.HOME,
          'ABCDEF?channel=igot&role=other', ObjectType.QR, '');
        done();
      });
    });

    it('should navigate to EnrolledCourseDetails page if the scanned data is a Course deeplink', (done) => {
      // arrange
      const content = {
        identifier: 'do_12345',
        contentData: { contentType: 'Course', primaryCategory: 'Course' }
      } as any;
      mockContentService.getContentDetails = jest.fn(() => of(content));
      mockTelemetryService.updateCampaignParameters = jest.fn();
      jest.spyOn(qRScannerResultHandler, 'generateQRScanSuccessInteractEvent').mockImplementation(() => {
        return;
      });
      // act
      qRScannerResultHandler.handleContentId('profile-settings',
        'https://sunbirded.org/learn/course/do_12345');
      // assert
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'https://sunbirded.org/learn/course/do_12345';
      values['action'] = 'ContentDetail';
      setTimeout(() => {
        expect(mockNavigationService.navigateToDetailPage).toHaveBeenCalledWith(
          content,
          {
            content,
            corRelation: [{ id: 'do_12345', type: 'qr' },
            {id: 'https://sunbirded.org', type: 'Source'}],
            source: 'profile-settings',
            shouldGenerateEndTelemetry: true
          }
        );
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
          ImpressionType.VIEW, ImpressionSubtype.QR_CODE_VALID,
          PageId.QRCodeScanner,
          Environment.HOME,
          'do_12345', ObjectType.QR, '');
        done();
      });
    });

    it('should show No Internet error if API fails due to no network', (done) => {
      // arrange
      mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
      mockContentService.getContentDetails = jest.fn(() => throwError({ errror: 'API_ERROR' }));
      jest.spyOn(qRScannerResultHandler, 'generateQRScanSuccessInteractEvent').mockImplementation(() => {
        return;
      });
      // act
      qRScannerResultHandler.handleContentId('profile-settings',
        'https://sunbirded.org/learn/course/do_12345');
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
        done();
      });
    });

    it('should show UNKNOWN_QR error in case of invalid dialcode', (done) => {
      // arrange
      mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
      mockContentService.getContentDetails = jest.fn(() => throwError({ errror: 'API_ERROR' }));
      mockTelemetryService.updateCampaignParameters = jest.fn();
      jest.spyOn(qRScannerResultHandler, 'generateQRScanSuccessInteractEvent').mockImplementation(() => {
        return;
      });
      // act
      qRScannerResultHandler.handleContentId('profile-settings',
        'https://sunbirded.org/learn/course/do_12345');
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('UNKNOWN_QR');
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
          ImpressionType.VIEW, ImpressionSubtype.INVALID_QR_CODE,
          PageId.QRCodeScanner,
          Environment.HOME,
          'do_12345', ObjectType.QR, '');
        done();
      });
    });

  });

  describe('handleInvalidQRCode()', () => {
    beforeAll(() => {
      qRScannerResultHandler = new QRScannerResultHandler(
        mockContentService as ContentService,
        mockTelemetryService as TelemetryService,
        mockPageAssembleService as PageAssembleService,
        mockFrameworkService as FrameworkService,
        mockCommonUtilService as CommonUtilService,
        mockTelemetryGeneratorService as TelemetryGeneratorService,
        mockRouter as Router,
        mockNavController as NavController,
        mockEvents as Events,
        mockAppglobalService as AppGlobalService,
        mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
        mockNavigationService as NavigationService
      );
    });
    it('should generate INTERACT and END event in case of invalid dialcode', () => {
      // arrange
      // act
      qRScannerResultHandler.handleInvalidQRCode(
        'profile-settings', 'ABCDEF');
      // assert
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'ABCDEF';
      values['action'] = 'UNKNOWN';

      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
        InteractSubtype.QRCodeScanSuccess,
        Environment.HOME,
        PageId.QRCodeScanner, undefined,
        values,
        undefined,
        [{id: '', type: 'Source'}]);

      expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(
        'qr',
        Mode.PLAY,
        'profile-settings',
        Environment.HOME,
        { id: 'ABCDEF', type: 'qr', version: undefined });
    });

    it('should generate INTERACT and END event in case of invalid dialcode for pageId unavailable', (done) => {
      // arrange
      qRScannerResultHandler.scannedUrlMap = undefined;
      // act
      qRScannerResultHandler.handleInvalidQRCode(
        undefined, 'ABCDEF');
      // assert
      const values = new Map();
      values['networkAvailable'] = 'Y';
      // values['scannedData'] = 'ABCDEF';
      values['action'] = 'UNKNOWN';
      setTimeout(() => {
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
          InteractSubtype.QRCodeScanSuccess,
          Environment.HOME,
          PageId.QRCodeScanner,
          undefined, values,
          undefined,
          [{id: '', type: 'Source'}]);
        done();
      }, 0);
    });
  });

  describe('handleCertsQR()', () => {
    it('should open inappbrowser in context info', (done) => {
      // arrange
      const context = { pdata: { id: 'org.sunbird', ver: '1.0' } };
      mockTelemetryService.buildContext = jest.fn(() => of(context));
      jest.spyOn(global['cordova']['InAppBrowser'], 'open').mockImplementation(() => {
        return {
          addEventListener: (_, cb) => {
            cb({ url: 'explore-course' });
          },
          close: () => { }
        };
      });
      mockEvents.publish = jest.fn(() => []);
      // act
      qRScannerResultHandler.handleCertsQR(
        'profile-settings', 'https://sunbirded.org/learn/certs/do_12345');
      // assert
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'https://sunbirded.org/learn/certs/do_12345';
      values['action'] = 'OpenBrowser';
      values['scannedFrom'] = 'mobileApp';

      setTimeout(() => {
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
          InteractSubtype.QRCodeScanSuccess,
          Environment.HOME,
          PageId.QRCodeScanner, { id: 'do_12345', type: 'certificate', version: undefined },
          values,
          undefined,
        [{id: 'https://sunbirded.org', type: 'Source'}]);
        done();
      });
    });

    it('should not open inappbrowser if link does not match', (done) => {
      // arrange
      const context = { pdata: { id: 'org.sunbird', ver: '1.0' } };
      mockTelemetryService.buildContext = jest.fn(() => of(context));
      jest.spyOn(global['cordova']['InAppBrowser'], 'open').mockImplementation(() => {
        return {
          addEventListener: (_, cb) => {
            cb({ url: 'course' });
          },
          close: () => { }
        };
      });
      mockEvents.publish = jest.fn(() => []);
      // act
      qRScannerResultHandler.handleCertsQR(
        'profile-settings', 'https://sunbirded.org/learn/certs/do_12345');
      // assert
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'https://sunbirded.org/learn/certs/do_12345';
      values['action'] = 'OpenBrowser';
      values['scannedFrom'] = 'mobileApp';

      setTimeout(() => {
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
          InteractSubtype.QRCodeScanSuccess,
          Environment.HOME,
          PageId.QRCodeScanner, { id: 'do_12345', type: 'certificate', version: undefined },
          values,
          undefined,
          [{id: 'https://sunbirded.org', type: 'Source'}]);
        done();
      });
    });

    it('should not open inappbrowser if url unavailable', (done) => {
      // arrange
      const context = { pdata: { id: 'org.sunbird', ver: '1.0' } };
      mockTelemetryService.buildContext = jest.fn(() => of(context));
      jest.spyOn(global['cordova']['InAppBrowser'], 'open').mockImplementation(() => {
        return {
          addEventListener: (_, cb) => {
            cb({ path: 'course' });
          },
          close: () => { }
        };
      });
      mockEvents.publish = jest.fn(() => []);
      // act
      qRScannerResultHandler.handleCertsQR(
        'profile-settings', 'https://sunbirded.org/learn/certs/do_12345');
      // assert
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'https://sunbirded.org/learn/certs/do_12345';
      values['action'] = 'OpenBrowser';
      values['scannedFrom'] = 'mobileApp';

      setTimeout(() => {
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
          InteractSubtype.QRCodeScanSuccess,
          Environment.HOME,
          PageId.QRCodeScanner, { id: 'do_12345', type: 'certificate', version: undefined },
          values, undefined,
          [{id: 'https://sunbirded.org', type: 'Source'}]);
        done();
      });
    });
  });
});
