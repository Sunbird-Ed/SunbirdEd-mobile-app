import { QRScannerResultHandler } from './qrscanresulthandler.service';
import { TelemetryService, Mode, ContentService,
   FrameworkService, PageAssembleService, SharedPreferences, CertificateService } from '@project-sunbird/sunbird-sdk';
import {
  Environment, ImpressionSubtype, ImpressionType, InteractSubtype, InteractType, ObjectType, PageId,
  CorReleationDataType, CorrelationData
} from '../services/telemetry-constants';
import { of, throwError } from 'rxjs';
import { CommonUtilService } from './common-util.service';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Router } from '@angular/router';
import { NavController, PopoverController } from '@ionic/angular';
import { Events } from '../util/events';
import { AppGlobalService } from './app-global-service.service';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { NavigationService } from '../services/navigation-handler.service';
import { PreferenceKey } from '../app/app.constant';

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
  const mockPreferences: Partial<SharedPreferences> = {
    getString: jest.fn(() => { })
  };
  const mockCertificateService: Partial<CertificateService> = {}
  const mockPopoverController: Partial<PopoverController> = {};
  window.console.error = jest.fn()

  beforeAll(() => {
    qRScannerResultHandler = new QRScannerResultHandler(
      mockContentService as ContentService,
      mockTelemetryService as TelemetryService,
      mockPageAssembleService as PageAssembleService,
      mockFrameworkService as FrameworkService,
      mockPreferences as SharedPreferences,
      mockCertificateService as CertificateService,
      mockCommonUtilService as CommonUtilService,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockRouter as Router,
      mockNavController as NavController,
      mockEvents as Events,
      mockAppglobalService as AppGlobalService,
      mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
      mockNavigationService as NavigationService,
      mockPopoverController as PopoverController,

    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of QRScannerResultHandler', () => {
    expect(qRScannerResultHandler).toBeTruthy();
  });


  describe('parseDialCode()', () => {
    it('should return parsed data from the link else without channel', (done) => {
      // arrange
      const url = 'https://www.sunbirded.org/get/dial/ABCDEF/?channel=';
      mockFormAndFrameworkUtilService.getDialcodeRegexFormApi = jest.fn(() =>
        Promise.resolve('(\\/dial\\/(?<sunbird>[a-zA-Z0-9]+)|(\\/QR\\/\\?id=(?<epathshala>[a-zA-Z0-9]+)))'));
      // act
      qRScannerResultHandler.parseDialCode(url);
        // assert
      setTimeout(() => {
        done();
      }, 600);
    });

    it('should return parsed data from the link else without channel on error', (done) => {
      // arrange
      const url = 'https://www.sunbirded.org/get/dial/ABCDEF/?channel=""';
      mockFormAndFrameworkUtilService.getDialcodeRegexFormApi = jest.fn(() =>
        Promise.resolve('(\\/dial\\/(?<sunbird>[a-zA-Z0-9]+)|(\\/QR\\/\\?id=(?<epathshala>[a-zA-Z0-9]+)))'));
      // act
      qRScannerResultHandler.parseDialCode(url);
        // assert
      setTimeout(() => {
        done();
      }, 600);
    });

    it('should return parsed data from the link', (done) => {
      // arrange
      const url = 'https://www.sunbirded.org/get/dial/ABCDEF/?channel=ChannelId%20';
      mockFormAndFrameworkUtilService.getDialcodeRegexFormApi = jest.fn(() =>
        Promise.resolve('(\\/dial\\/(?<sunbird>[a-zA-Z0-9]+)|(\\/QR\\/\\?id=(?<epathshala>[a-zA-Z0-9]+)))'));
      mockFrameworkService.searchOrganization = jest.fn(() => of({
        content: [{contentId: 'do_123', id: 'do-123'}]
      }));
      mockPageAssembleService.setPageAssembleChannel = jest.fn();
      mockEvents.publish = jest.fn(() => []);
      // act
      qRScannerResultHandler.parseDialCode(url);
        // assert
      setTimeout(() => {
        expect(mockFrameworkService.searchOrganization).toHaveBeenCalled();
        expect(mockPageAssembleService.setPageAssembleChannel).toHaveBeenCalled();
        expect(mockEvents.publish).toHaveBeenCalled();
        done();
      }, 600);
    });

    it('should not return parsed data if content is empty', (done) => {
      // arrange
      const url = 'https://www.sunbirded.org/get/dial/ABCDEF/?channel=ChannelId%20';
      mockFormAndFrameworkUtilService.getDialcodeRegexFormApi = jest.fn(() =>
        Promise.resolve('(\\/dial\\/(?<sunbird>[a-zA-Z0-9]+)|(\\/QR\\/\\?id=(?<epathshala>[a-zA-Z0-9]+)))'));
      mockFrameworkService.searchOrganization = jest.fn(() => of({
        content: []
      }));
      // act
      qRScannerResultHandler.parseDialCode(url);
        // assert
      setTimeout(() => {
        expect(mockFrameworkService.searchOrganization).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not return parsed data if scannData does not match to regex', (done) => {
      // arrange
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
      qRScannerResultHandler.parseDialCode('https://www.sunbirded.org/get/dial/ABCDEF').then((response) => {
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

  describe('generateQRScanSuccessInteractEvent', () => {
    it('should return interact telemetry event', () => {
      // arrange
      mockCommonUtilService.networkInfo = {
        isNetworkAvailable: true
      };
      qRScannerResultHandler.scannedUrlMap = {
        sunbird: 'app'
      };
      const scannedData = 'sample/dial/ABCD';
      const action = {type: 'te'};
      const dialCode = 'ABCD';
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      // act
      qRScannerResultHandler.generateQRScanSuccessInteractEvent(scannedData, action, dialCode,
        {certificateId: 'cr-id', scannedFrom: 'genericApp'});
      // assert
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
        InteractType.OTHER,
        InteractSubtype.QRCodeScanSuccess,
        Environment.HOME,
        PageId.QRCodeScanner,
        {
          id: 'cr-id',
          type: 'certificate',
          version: undefined,
        }, new Map(),
        undefined,
        [{id: 'sample//ABCD', type: 'Source'}]
      );
    });

    it('should return interact telemetry event, if network not available', () => {
      // arrange
      mockCommonUtilService.networkInfo = {
        isNetworkAvailable: false
      };
      qRScannerResultHandler.scannedUrlMap = {
        sunbird1: 'app'
      };
      const scannedData = 'sample/dial/ABCD';
      const action = {type: 'te'};
      const dialCode = 'ABCD';
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      // act
      qRScannerResultHandler.generateQRScanSuccessInteractEvent(scannedData, action, dialCode,
        {certificateId: 'cr-id', scannedFrom: 'genericApp'});
      // assert
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
        InteractType.OTHER,
        InteractSubtype.QRCodeScanSuccess,
        Environment.HOME,
        PageId.QRCodeScanner,
        {
          id: 'cr-id',
          type: 'certificate',
          version: undefined,
        }, new Map(),
        undefined,
        [{id: 'sample//ABCD', type: 'Source'}]
      );
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

    it('should navigate to Search page if the scanned data is a dialocde link for else case', () => {
      // arrange
      const scannData =  'https://sunbirded.org/get/dial/ABCDEF';
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
      qRScannerResultHandler.handleDialCode('', scannData, 'ABCDEF');
      // assert
      setTimeout(() => {
        
        expect(mockTelemetryService.updateCampaignParameters).toHaveBeenCalled();
        const values = new Map();
        values['networkAvailable'] = 'N';
        values['scannedData'] = 'https://sunbirded.org/get/dial/ABCDEF';
        values['action'] = 'SearchResult';
        
        expect(mockTelemetryGeneratorService.generateUtmInfoTelemetry).toHaveBeenCalledWith(
          params,
          PageId.QRCodeScanner, { id: 'do_12345', type: 'Learning Resource', version: '' },
          corRelationData);
        }, 0);
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
          PageId.QRCodeScanner, { id: 'do_12345', type: 'Learning Resource', version: '' },
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
          PageId.QRCodeScanner, { id: 'do_12345', type: 'Learning Resource', version: '' },
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
      mockPreferences as SharedPreferences,
      mockCertificateService as CertificateService,
      mockCommonUtilService as CommonUtilService,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockRouter as Router,
      mockNavController as NavController,
      mockEvents as Events,
      mockAppglobalService as AppGlobalService,
      mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
      mockNavigationService as NavigationService,
      mockPopoverController as PopoverController,
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

  describe('handleRcCertsQR', () => {
    it('should return certificate verification popup', (done) => {
      // arrange
      const request = 'data=sample-data?channel/certs/cid?source=sample-source';
      jest.spyOn(qRScannerResultHandler, 'generateQRScanSuccessInteractEvent').mockImplementation(() => {
        return;
      });
      mockCertificateService.getEncodedData = jest.fn(() => Promise.resolve({ id: 'do-123' }));
      mockCertificateService.verifyCertificate = jest.fn(() => of({
        verified: true,
        certificateData: { id: 'sample-id' }
      }));
      mockPopoverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({}))
      } as any)));
      // act
      qRScannerResultHandler.handleRcCertsQR(request);
      // assert
      setTimeout(() => {
        expect(mockCertificateService.getEncodedData).toHaveBeenCalled();
        expect(mockCertificateService.verifyCertificate).toHaveBeenCalled();
        expect(mockPopoverController.create).toBeTruthy();
        done();
      }, 0);
    });

    it('should not return certificate verification popup for invalid QRCode', (done) => {
      // arrange
      const request = 'data=sample-data?channel/certs/cid?source=sample-source';
      jest.spyOn(qRScannerResultHandler, 'generateQRScanSuccessInteractEvent').mockImplementation(() => {
        return;
      });
      mockCertificateService.getEncodedData = jest.fn(() => Promise.reject({ id: 'do-123' }));
      mockCertificateService.verifyCertificate = jest.fn(() => of({
        verified: false,
        certificateData: { id: 'sample-id' }
      }));
      mockCommonUtilService.afterOnBoardQRErrorAlert = jest.fn(() => Promise.resolve());
      // act
      qRScannerResultHandler.handleRcCertsQR(request);
      // assert
      setTimeout(() => {
        expect(mockCertificateService.getEncodedData).toHaveBeenCalled();
        expect(mockCertificateService.verifyCertificate).toHaveBeenCalled();
        expect(mockCommonUtilService.afterOnBoardQRErrorAlert).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not return error for catch part', (done) => {
      // arrange
      const request = 'sample-data?channel/certs/cid?source=sample-source';
      jest.spyOn(qRScannerResultHandler, 'generateQRScanSuccessInteractEvent').mockImplementation(() => {
        return;
      });
      mockCertificateService.verifyCertificate = jest.fn(() => throwError({
        verified: false,
        certificateData: { id: 'sample-id' }
      }));
      // act
      qRScannerResultHandler.handleRcCertsQR(request);
      // assert
      setTimeout(() => {
        expect(mockCertificateService.verifyCertificate).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('navigateHandler', () => {
    it('should match all criteria', (done) => {
      const request = 'The quick brown fox jumps over the lazy dog';
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
        pattern: '(?<quizId>fox)',
        code: 'profile'
      }]));
      mockAppglobalService.isUserLoggedIn = jest.fn(() => false);
      mockNavController.navigateForward = jest.fn(() => Promise.resolve(true));
      // act
      qRScannerResultHandler.navigateHandler(request);
      // assert
      setTimeout(() => {
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
        expect(mockAppglobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockNavController.navigateForward).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should match all criteria for else case', (done) => {
      const request = 'The quick brown fox jumps over the lazy dog';
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
        pattern: '(?<quizId>fox)',
        code: 'guest'
      }]));
      mockNavController.navigateForward = jest.fn(() => Promise.resolve(true));
      // act
      qRScannerResultHandler.navigateHandler(request);
      // assert
      setTimeout(() => {
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
        expect(mockNavController.navigateForward).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not match all criteria for else part and deeplink config match', (done) => {
      const request = 'course';
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
        pattern: '(?<content_id>fox)',
        code: 'profile'
      }]));
      mockAppglobalService.isUserLoggedIn = jest.fn(() => false);
      mockNavController.navigateForward = jest.fn(() => Promise.resolve(true));
      // act
      qRScannerResultHandler.navigateHandler(request);
      // assert
      setTimeout(() => {
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not match all criteria for else part and content_id pattern', (done) => {
      const request = 'The quick brown fox jumps over the lazy dog';
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
        pattern: '(?<content_id>fox)',
        code: 'profile'
      }]));
      mockAppglobalService.isUserLoggedIn = jest.fn(() => false);
      mockNavController.navigateForward = jest.fn(() => Promise.resolve(true));
      // act
      qRScannerResultHandler.navigateHandler(request);
      // assert
      setTimeout(() => {
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not match all criteria for else part for course id pattern', (done) => {
      const request = 'The quick brown fox jumps over the lazy dog';
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
        pattern: '(?<course_id>fox)',
        code: 'guest'
      }]));
      mockAppglobalService.isUserLoggedIn = jest.fn(() => true);
      mockNavController.navigateForward = jest.fn(() => Promise.resolve(true));
      // act
      qRScannerResultHandler.navigateHandler(request);
      // assert
      setTimeout(() => {
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not match all criteria for else part for course id pattern for undefined url match groups', (done) => {
      const request = 'The quick brown fox jumps over the lazy dog';
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
      }]));
      mockAppglobalService.isUserLoggedIn = jest.fn(() => true);
      mockNavController.navigateForward = jest.fn(() => Promise.resolve(true));
      // act
      qRScannerResultHandler.navigateHandler(request);
      // assert
      setTimeout(() => {
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('manageLearScan', () => {
    it('should invoked navigateHandler for create-project', (done) => {
      // arrange
      const rqs = 'sample/create-project/';
      mockPreferences.getString = jest.fn(() => of('teacher'));
      jest.spyOn(qRScannerResultHandler, 'navigateHandler').mockImplementation(() => {
        return Promise.resolve();
      });
      // act
      qRScannerResultHandler.manageLearScan(rqs);
      // assert
      setTimeout(() => {
        expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
        done();
      }, 0);
    });

    it('should return login msg for guest user', (done) => {
      // arrange
      const rqs = 'sample/project/';
      mockPreferences.getString = jest.fn(() => of('teacher'));
      mockAppglobalService.isUserLoggedIn = jest.fn(() => false);
      mockCommonUtilService.showToast = jest.fn();
      // act
      qRScannerResultHandler.manageLearScan(rqs);
      // assert
      setTimeout(() => {
        expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
        expect(mockAppglobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('FRMELEMNTS_MSG_PLEASE_LOGIN_HT_OTHER');
        done();
      }, 0);
    });

    it('should invoked navigateHandler for create-observation', (done) => {
      // arrange
      const rqs = 'sample/create-observation/';
      mockPreferences.getString = jest.fn(() => of('teacher'));
      mockAppglobalService.isUserLoggedIn = jest.fn(() => true);
      jest.spyOn(qRScannerResultHandler, 'navigateHandler').mockImplementation(() => {
        return Promise.resolve();
      });
      // act
      qRScannerResultHandler.manageLearScan(rqs);
      // assert
      setTimeout(() => {
        expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
        expect(mockAppglobalService.isUserLoggedIn).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should return content unavailable message', (done) => {
      // arrange
      const rqs = 'sample/create/';
      mockPreferences.getString = jest.fn(() => of('teacher'));
      mockAppglobalService.isUserLoggedIn = jest.fn(() => true);
      mockCommonUtilService.showToast = jest.fn();
      // act
      qRScannerResultHandler.manageLearScan(rqs);
      // assert
      setTimeout(() => {
        expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
        expect(mockAppglobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('FRMELEMNTS_MSG_CONTENT_NOT_AVAILABLE_FOR_ROLE');
        done();
      }, 0);
    });
  });
});
