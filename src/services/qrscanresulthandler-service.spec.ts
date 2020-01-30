import { QRScannerResultHandler } from './qrscanresulthandler.service';
import { TelemetryService, TelemetryObject, Mode, ContentService } from 'sunbird-sdk';
import {
  Environment, ImpressionSubtype, ImpressionType, InteractSubtype, InteractType, ObjectType, PageId,
  LogLevel
} from '@app/services/telemetry-constants';
import { of, throwError } from 'rxjs';
import { CommonUtilService } from './common-util.service';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Router } from '@angular/router';
import { NavController, Events } from '@ionic/angular';
import { AppGlobalService } from './app-global-service.service';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';

declare const cordova;

describe('QRScannerResultHandler', () => {
  let qRScannerResultHandler: QRScannerResultHandler;
  const mockContentService: Partial<ContentService> = {
    getContentDetails: jest.fn()
  };
  const mockTelemetryService: Partial<TelemetryService> = {
    buildContext: jest.fn()
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
    showToast: jest.fn()
  };
  mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateInteractTelemetry: jest.fn(),
    generateImpressionTelemetry: jest.fn(),
    generateEndTelemetry: jest.fn(),
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
    getDailCodeConfig: jest.fn(() => Promise.resolve())
  };


  beforeAll(() => {
    qRScannerResultHandler = new QRScannerResultHandler(
      mockContentService as ContentService,
      mockTelemetryService as TelemetryService,
      mockCommonUtilService as CommonUtilService,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockRouter as Router,
      mockNavController as NavController,
      mockEvents as Events,
      mockAppglobalService as AppGlobalService,
      mockFormAndFrameworkUtilService as FormAndFrameworkUtilService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of QRScannerResultHandler', () => {
    expect(qRScannerResultHandler).toBeTruthy();
  });

  describe('getDailCodeRegularExpression()', () => {
    it('should return cached dialcode config if cache is available', async () => {
      // arrange
      const regEx: RegExp = new RegExp('sample_regex');
      mockAppglobalService.getCachedDialCodeConfig = jest.fn(() => new RegExp('sample_regex'));
      // act
      const response = await qRScannerResultHandler['getDailCodeRegularExpression']();
      // assert
      expect(response).toEqual(regEx);
    });

    it('should return cached dialcode config if cache is not available', async () => {
      // arrange
      const regEx: RegExp = new RegExp('sample_regex');
      mockAppglobalService.getCachedDialCodeConfig = jest.fn(() => undefined);
      // act
      const response = await qRScannerResultHandler['getDailCodeRegularExpression']();
      // assert
      expect(response).toEqual(undefined);
    });
  });

  // describe('parseDialCode()', () => {
  //   it('should return parsed data from the link', (done) => {
  //     // arrange
  //     const formValResponse =  {values: '(\\/dial\\/(?<sunbird>[a-zA-Z0-9]+)|(\\/QR\\/\\?id=(?<epathshala>[a-zA-Z0-9]+)))'};
  //     const regexExp: RegExp = formValResponse.values;
  //     qRScannerResultHandler['getDailCodeRegularExpression'] = jest.fn(() => Promise.resolve(regexExp));
  //     // act
  //     // assert
  //     qRScannerResultHandler.parseDialCode('https//www.sunbirded.org/get/dial/ABCDEF').then((response) => {
  //       expect(response).toEqual({});
  //       done();
  //     });
  //   });
  // });

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
      expect(qRScannerResultHandler.isContentId('https://sunbirded.org/learn/course/do_212718772878598144126')).toBeTruthy();
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
      // act
      qRScannerResultHandler.handleDialCode('profile-settings',
        'https://sunbirded.org/get/dial/ABCDEF', 'ABCDEF');
      // assert
      expect(mockNavController.navigateForward).toHaveBeenCalledWith(['/search'], {
        state: {
          dialCode: 'ABCDEF',
          corRelation: [{ id: 'ABCDEF', type: 'qr' }],
          source: 'profile-settings',
          shouldGenerateEndTelemetry: true
        }
      });
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'https://sunbirded.org/get/dial/ABCDEF';
      values['action'] = 'SearchResult';

      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
        InteractSubtype.QRCodeScanSuccess,
        Environment.HOME,
        PageId.QRCodeScanner, { id: 'ABCDEF', type: 'qr', version: undefined },
        values);
    });
  });

  describe('handleContentId()', () => {
    it('should navigate to ContentDetails page if the scanned data is a content deeplink', (done) => {
      // arrange
      const content = { identifier: 'do_12345', contentData: { contentType: 'Resource' } } as any;
      mockContentService.getContentDetails = jest.fn(() => of(content));
      // act
      qRScannerResultHandler.handleContentId('profile-settings',
        'https://sunbirded.org/resources/play/content/do_12345');
      // assert
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'https://sunbirded.org/resources/play/content/do_12345';
      values['action'] = 'ContentDetail';
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/content-details'], {
          state: {
            content,
            corRelation: [{ id: 'do_12345', type: 'qr' }],
            source: 'profile-settings',
            shouldGenerateEndTelemetry: true
          }
        });

        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
          InteractSubtype.QRCodeScanSuccess,
          Environment.HOME,
          PageId.QRCodeScanner, { id: 'do_12345', type: 'qr', version: undefined },
          values);
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
          ImpressionType.VIEW, ImpressionSubtype.QR_CODE_VALID,
          PageId.QRCodeScanner,
          Environment.HOME,
          'do_12345', ObjectType.QR, '');
        done();
      });
    });

    it('should navigate to CollectionDetails page if the scanned data is a Collection deeplink', (done) => {
      // arrange
      const content = {
        identifier: 'do_12345', mimeType: 'application/vnd.ekstep.content-collection',
        contentData: { contentType: 'Resource' }
      } as any;
      mockContentService.getContentDetails = jest.fn(() => of(content));
      // act
      qRScannerResultHandler.handleContentId('profile-settings',
        'https://sunbirded.org/resources/play/collection/do_12345');
      // assert
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'https://sunbirded.org/resources/play/collection/do_12345';
      values['action'] = 'ContentDetail';
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/collection-detail-etb'], {
          state: {
            content,
            corRelation: [{ id: 'do_12345', type: 'qr' }],
            source: 'profile-settings',
            shouldGenerateEndTelemetry: true
          }
        });

        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
          InteractSubtype.QRCodeScanSuccess,
          Environment.HOME,
          PageId.QRCodeScanner, { id: 'do_12345', type: 'qr', version: undefined },
          values);
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
          ImpressionType.VIEW, ImpressionSubtype.QR_CODE_VALID,
          PageId.QRCodeScanner,
          Environment.HOME,
          'do_12345', ObjectType.QR, '');
        done();
      });
    });

    it('should navigate to EnrolledCourseDetails page if the scanned data is a Course deeplink', (done) => {
      // arrange
      const content = {
        identifier: 'do_12345',
        contentData: { contentType: 'Course' }
      } as any;
      mockContentService.getContentDetails = jest.fn(() => of(content));
      // act
      qRScannerResultHandler.handleContentId('profile-settings',
        'https://sunbirded.org/learn/course/do_12345');
      // assert
      const values = new Map();
      values['networkAvailable'] = 'Y';
      values['scannedData'] = 'https://sunbirded.org/learn/course/do_12345';
      values['action'] = 'ContentDetail';
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/enrolled-course-details'], {
          state: {
            content,
            corRelation: [{ id: 'do_12345', type: 'qr' }],
            source: 'profile-settings',
            shouldGenerateEndTelemetry: true
          }
        });

        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
          InteractSubtype.QRCodeScanSuccess,
          Environment.HOME,
          PageId.QRCodeScanner, { id: 'do_12345', type: 'qr', version: undefined },
          values);
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
        values);

      expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(
        'qr',
        Mode.PLAY,
        'profile-settings',
        Environment.HOME,
        { id: 'ABCDEF', type: 'qr', version: undefined });
    });
  });

  describe('handleCertsQR()', () => {
    it('should open inappbrowser in context info', (done) => {
      // arrange
      const context = { pdata: { id: 'org.sunbird', ver: '1.0' } };
      mockTelemetryService.buildContext = jest.fn(() => of(context));
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
          values);
        done();
      });

    });
  });

});
