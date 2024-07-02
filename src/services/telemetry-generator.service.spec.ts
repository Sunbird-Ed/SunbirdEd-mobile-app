import { TelemetryGeneratorService } from './telemetry-generator.service';
import { TelemetryService, TelemetryObject, TelemetryErrorCode, ProfileType } from '@project-sunbird/sunbird-sdk';
import {
  Environment, ErrorType, ImpressionType, InteractSubtype, InteractType, Mode, PageId,
  LogLevel
} from '../services/telemetry-constants';
import { of } from 'rxjs';
import {Context, SbProgressLoader} from '../services/sb-progress-loader.service';

describe('TelemetryGeneratorService', () => {
  let telemetryGeneratorService: TelemetryGeneratorService;
  const mockTelemetryService: Partial<TelemetryService> = {
    interact: jest.fn(() => of({} as any)),
    impression: jest.fn(() => of({} as any)),
    interrupt: jest.fn(() => of({} as any)),
    log: jest.fn(() => of({} as any)),
    start: jest.fn(() => of({} as any)),
    end: jest.fn(() => of({} as any)),
    error: jest.fn(() => of({} as any)),
  };

  const telemetryObject = new TelemetryObject('do_12345', 'Learning Resource', '1');
  const rollUp = { l1: 'do_1', l2: 'do_12', l3: 'do_123', l4: 'do_1234' };
  const corRelationList = [{ id: 'SearchResult', type: 'Section' }];
  const values = new Map();
  values['isCollapsed'] = true;
  const content = {
    size: '1000',
    identifier: 'do_12345',
    contentType: 'Resource',
    pkgVersion: '1',
    contentData: {
      contentType: 'Resource',
      pkgVersion: '1',
      primaryCategory: 'Learning Resource'
    }
  } as any;
  const mockSbProgressLoader: Partial<SbProgressLoader> = {};

  beforeAll(() => {
    telemetryGeneratorService = new TelemetryGeneratorService(
      mockTelemetryService as TelemetryService,
      mockSbProgressLoader as SbProgressLoader
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of TelemetryGeneratorService', () => {
    expect(telemetryGeneratorService).toBeTruthy();
  });

  it('should invoke interact() with proper arguments', () => {
    // arrange
    mockSbProgressLoader.contexts = new Map<string, Context>();
    mockSbProgressLoader.contexts.set('SAMPLE_ID', {
      id: 'SAMPLE_ID',
      ignoreTelemetry: {
        when: {
          interact: /{“pageid”:“collection-detail”}/
        }
      }
    });
    // act
    telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.UNIT_CLICKED,
      Environment.HOME,
      PageId.COLLECTION_DETAIL,
      telemetryObject,
      values,
      rollUp,
      corRelationList);
    // assert
    const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
    expect(mockInteract.mock.calls[0][0]['type']).toEqual(InteractType.TOUCH);
    expect(mockInteract.mock.calls[0][0]['subType']).toEqual(InteractSubtype.UNIT_CLICKED);
    expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
    expect(mockInteract.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
    expect(mockInteract.mock.calls[0][0]['objId']).toEqual(telemetryObject.id);
    expect(mockInteract.mock.calls[0][0]['objType']).toEqual(telemetryObject.type);
    expect(mockInteract.mock.calls[0][0]['objVer']).toEqual(telemetryObject.version);
    expect(mockInteract.mock.calls[0][0]['rollup']).toEqual(rollUp);
    expect(mockInteract.mock.calls[0][0]['correlationData']).toEqual(corRelationList);
  });

  it('should invoke impression() with proper arguments', () => {
    // arrange
    mockSbProgressLoader.contexts = new Map<string, Context>();
    mockSbProgressLoader.contexts.set('SAMPLE_ID', {
      id: 'SAMPLE_ID',
      ignoreTelemetry: {
        when: {
          impression: /{“pageid”:“collection-detail”}/
        }
      }
    });
    // act
    telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.DETAIL, '',
      PageId.COLLECTION_DETAIL,
      Environment.HOME,
      telemetryObject.id,
      telemetryObject.type,
      telemetryObject.version,
      rollUp,
      corRelationList);
    // assert
    const mockImpression = jest.spyOn(mockTelemetryService, 'impression');
    expect(mockImpression.mock.calls[0][0]['type']).toEqual(ImpressionType.DETAIL);
    expect(mockImpression.mock.calls[0][0]['subType']).toEqual('');
    expect(mockImpression.mock.calls[0][0]['env']).toEqual(Environment.HOME);
    expect(mockImpression.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
    expect(mockImpression.mock.calls[0][0]['objId']).toEqual(telemetryObject.id);
    expect(mockImpression.mock.calls[0][0]['objType']).toEqual(telemetryObject.type);
    expect(mockImpression.mock.calls[0][0]['objVer']).toEqual(telemetryObject.version);
    expect(mockImpression.mock.calls[0][0]['rollup']).toEqual(rollUp);
    expect(mockImpression.mock.calls[0][0]['correlationData']).toEqual(corRelationList);
  });

  it('should invoke start() with proper arguments', () => {
    // arrange
    // act
    telemetryGeneratorService.generateStartTelemetry(PageId.COLLECTION_DETAIL,
      telemetryObject,
      rollUp,
      corRelationList);
    // assert
    const mockImpression = jest.spyOn(mockTelemetryService, 'start');
    expect(mockImpression.mock.calls[0][0]['type']).toEqual(telemetryObject.type);
    expect(mockImpression.mock.calls[0][0]['mode']).toEqual(Mode.PLAY);
    expect(mockImpression.mock.calls[0][0]['env']).toBeUndefined();
    expect(mockImpression.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
    expect(mockImpression.mock.calls[0][0]['objId']).toEqual(telemetryObject.id);
    expect(mockImpression.mock.calls[0][0]['objType']).toEqual(telemetryObject.type);
    expect(mockImpression.mock.calls[0][0]['objVer']).toEqual(telemetryObject.version);
    expect(mockImpression.mock.calls[0][0]['rollup']).toEqual(rollUp);
    expect(mockImpression.mock.calls[0][0]['correlationData']).toEqual(corRelationList);
  });

  it('should invoke end() with proper arguments', () => {
    // arrange
    // act
    telemetryGeneratorService.generateEndTelemetry(telemetryObject.type,
      Mode.PLAY,
      PageId.COLLECTION_DETAIL,
      Environment.HOME,
      telemetryObject,
      rollUp,
      corRelationList);
    // assert
    const mockEnd = jest.spyOn(mockTelemetryService, 'end');
    expect(mockEnd.mock.calls[0][0]['type']).toEqual(telemetryObject.type);
    expect(mockEnd.mock.calls[0][0]['mode']).toEqual(Mode.PLAY);
    expect(mockEnd.mock.calls[0][0]['env']).toEqual(Environment.HOME);
    expect(mockEnd.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
    expect(mockEnd.mock.calls[0][0]['objId']).toEqual(telemetryObject.id);
    expect(mockEnd.mock.calls[0][0]['objType']).toEqual(telemetryObject.type);
    expect(mockEnd.mock.calls[0][0]['objVer']).toEqual(telemetryObject.version);
    expect(mockEnd.mock.calls[0][0]['rollup']).toEqual(rollUp);
    expect(mockEnd.mock.calls[0][0]['correlationData']).toEqual(corRelationList);
  });

  it('should invoke interrupt() with proper arguments', () => {
    // arrange
    // act
    telemetryGeneratorService.generateInterruptTelemetry('background', '');
    // assert
    const mockInterrupt = jest.spyOn(mockTelemetryService, 'interrupt');
    expect(mockInterrupt.mock.calls[0][0]['pageId']).toEqual('');
    expect(mockInterrupt.mock.calls[0][0]['type']).toEqual('background');
  });

  it('should invoke log() with proper arguments', () => {
    // arrange
    const params = new Array<any>();
    const paramsMap = new Map();
    paramsMap['SearchResults'] = {};
    paramsMap['SearchCriteria'] = {};
    // act
    telemetryGeneratorService.generateLogEvent(LogLevel.INFO,
      PageId.COLLECTION_DETAIL,
      Environment.HOME,
      ImpressionType.SEARCH, params);
    // assert
    const mockLog = jest.spyOn(mockTelemetryService, 'log');
    expect(mockLog.mock.calls[0][0]['env']).toEqual(Environment.HOME);
    expect(mockLog.mock.calls[0][0]['level']).toEqual(LogLevel.INFO);
    expect(mockLog.mock.calls[0][0]['message']).toEqual(PageId.COLLECTION_DETAIL);
    expect(mockLog.mock.calls[0][0]['type']).toEqual(ImpressionType.SEARCH);
    expect(mockLog.mock.calls[0][0]['params']).toEqual(params);
  });

  it('should invoke error() with proper arguments', () => {
    // arrange
    // act
    telemetryGeneratorService.generateErrorTelemetry(Environment.HOME,
      TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
      ErrorType.SYSTEM,
      PageId.COLLECTION_DETAIL,
      JSON.stringify({ error: 'error' }));
    // assert
    const mockError = jest.spyOn(mockTelemetryService, 'error');
    expect(mockError.mock.calls[0][0]['errorCode']).toEqual(TelemetryErrorCode.ERR_DOWNLOAD_FAILED);
    expect(mockError.mock.calls[0][0]['errorType']).toEqual(ErrorType.SYSTEM);
    expect(mockError.mock.calls[0][0]['stacktrace']).toEqual('{\"error\":\"error\"}');
    expect(mockError.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
  });

  it('should invoke start() with proper arguments', () => {
    // arrange
    // act
    telemetryGeneratorService.genererateAppStartTelemetry({ os: 'android' } as any);
    // assert
    const mockImpression = jest.spyOn(mockTelemetryService, 'start');
    expect(mockImpression.mock.calls[0][0]['type']).toEqual('app');
    expect(mockImpression.mock.calls[0][0]['deviceSpecification']).toEqual({ os: 'android' });
    expect(mockImpression.mock.calls[0][0]['env']).toEqual(Environment.HOME);
  });

  describe('generateBackClickedTelemetry', () => {
    it('should invoke interact() with proper arguments', () => {
      // arrange
      // act
      telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.COLLECTION_DETAIL,
        Environment.HOME,
        true,
        'do_123',
        corRelationList,
        rollUp,
        telemetryObject
      );
      // assert
      const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
      expect(mockInteract.mock.calls[0][0]['type']).toEqual(InteractType.TOUCH);
      expect(mockInteract.mock.calls[0][0]['subType']).toEqual(InteractSubtype.NAV_BACK_CLICKED);
      expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockInteract.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
      expect(mockInteract.mock.calls[0][0]['objId']).toEqual(telemetryObject.id);
      expect(mockInteract.mock.calls[0][0]['objType']).toEqual(telemetryObject.type);
      expect(mockInteract.mock.calls[0][0]['objVer']).toEqual(telemetryObject.version);
      expect(mockInteract.mock.calls[0][0]['rollup']).toEqual(rollUp);
      expect(mockInteract.mock.calls[0][0]['correlationData']).toEqual(corRelationList);
      expect(mockInteract.mock.calls[0][0]['valueMap']).toEqual({ identifier: 'do_123' });
    });
  });

  describe('generatePageViewTelemetry', () => {
    it('should invoke impression() with proper arguments', () => {
      // arrange
      // act
      telemetryGeneratorService.generatePageViewTelemetry(
        PageId.COLLECTION_DETAIL,
        Environment.HOME, ''
      );
      // assert
      const mockImpression = jest.spyOn(mockTelemetryService, 'impression');
      expect(mockImpression.mock.calls[0][0]['type']).toEqual(ImpressionType.VIEW);
      expect(mockImpression.mock.calls[0][0]['subType']).toEqual('');
      expect(mockImpression.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockImpression.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
    });
  });

  describe('generateSpineLoadingTelemetry', () => {
    it('should invoke interact() with proper arguments', () => {
      // arrange
      // act
      telemetryGeneratorService.generateSpineLoadingTelemetry(
        content, true
      );
      // assert
      const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
      expect(mockInteract.mock.calls[0][0]['type']).toEqual(InteractType.OTHER);
      expect(mockInteract.mock.calls[0][0]['subType']).toEqual(InteractSubtype.LOADING_SPINE);
      expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockInteract.mock.calls[0][0]['pageId']).toEqual(PageId.DOWNLOAD_SPINE);
      expect(mockInteract.mock.calls[0][0]['objId']).toEqual(telemetryObject.id);
      expect(mockInteract.mock.calls[0][0]['objType']).toEqual(telemetryObject.type);
      expect(mockInteract.mock.calls[0][0]['objVer']).toEqual(telemetryObject.version);
      expect(mockInteract.mock.calls[0][0]['rollup']).toEqual({ l1: 'do_12345' });
      expect(mockInteract.mock.calls[0][0]['valueMap']).toEqual({ isFirstTime: true, size: '1000' });
    });
  });

  describe('generateCancelDownloadTelemetry', () => {
    it('should invoke interact() with proper arguments', () => {
      // arrange
      // act
      telemetryGeneratorService.generateCancelDownloadTelemetry(
        content
      );
      // assert
      const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
      expect(mockInteract.mock.calls[0][0]['type']).toEqual(InteractType.TOUCH);
      expect(mockInteract.mock.calls[0][0]['subType']).toEqual(InteractSubtype.CANCEL_CLICKED);
      expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockInteract.mock.calls[0][0]['pageId']).toEqual(PageId.DOWNLOAD_SPINE);
      expect(mockInteract.mock.calls[0][0]['objId']).toEqual(telemetryObject.id);
      expect(mockInteract.mock.calls[0][0]['objType']).toEqual(telemetryObject.type);
      expect(mockInteract.mock.calls[0][0]['objVer']).toEqual(telemetryObject.version);
      expect(mockInteract.mock.calls[0][0]['valueMap']).toEqual({});
    });
  });

  describe('generateDownloadAllClickTelemetry', () => {
    it('should invoke interact() with proper arguments', () => {
      // arrange
      // act
      telemetryGeneratorService.generateDownloadAllClickTelemetry(PageId.COLLECTION_DETAIL, content,
        ['do_12345'], 4, rollUp, corRelationList);
      // assert
      const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
      expect(mockInteract.mock.calls[0][0]['type']).toEqual(InteractType.TOUCH);
      expect(mockInteract.mock.calls[0][0]['subType']).toEqual(InteractSubtype.DOWNLOAD_ALL_CLICKED);
      expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockInteract.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
      expect(mockInteract.mock.calls[0][0]['objId']).toEqual(telemetryObject.id);
      expect(mockInteract.mock.calls[0][0]['objType']).toEqual(telemetryObject.type);
      expect(mockInteract.mock.calls[0][0]['objVer']).toEqual(telemetryObject.version);
      expect(mockInteract.mock.calls[0][0]['valueMap']).toEqual({ downloadingIdentifers: ['do_12345'], childrenCount: 4 });
    });
  });

  describe('generatePullToRefreshTelemetry', () => {
    it('should invoke interact() with proper arguments', () => {
      // arrange
      // act
      telemetryGeneratorService.generatePullToRefreshTelemetry(PageId.COLLECTION_DETAIL, Environment.HOME);
      // assert
      const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
      expect(mockInteract.mock.calls[0][0]['type']).toEqual(InteractType.TOUCH);
      expect(mockInteract.mock.calls[0][0]['subType']).toEqual(InteractSubtype.PULL_TO_REFRESH);
      expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockInteract.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
    });
  });

  describe('readLessOrReadMore', () => {
    it('should invoke interact() with proper arguments', () => {
      // arrange
      // act
      telemetryGeneratorService.readLessOrReadMore('READ_MORE', rollUp, corRelationList, telemetryObject);
      // assert
      const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
      expect(mockInteract.mock.calls[0][0]['type']).toEqual(InteractType.TOUCH);
      expect(mockInteract.mock.calls[0][0]['subType']).toEqual(InteractSubtype.READ_MORE_CLICKED);
      expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockInteract.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
      expect(mockInteract.mock.calls[0][0]['rollup']).toEqual(rollUp);
      expect(mockInteract.mock.calls[0][0]['correlationData']).toEqual(corRelationList);
    });
  });

  describe('generateProfilePopulatedTelemetry', () => {
    it('should invoke interact() with proper arguments', () => {
      // arrange
      const profile = {
        board: ['AP'],
        profileType: ProfileType.TEACHER
      };
      // act
      telemetryGeneratorService.generateProfilePopulatedTelemetry(PageId.COLLECTION_DETAIL, profile, 'mode', Environment.HOME);
      // assert
      const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
      expect(mockInteract.mock.calls[0][0]['type']).toEqual(InteractType.OTHER);
      expect(mockInteract.mock.calls[0][0]['subType']).toEqual(InteractSubtype.PROFILE_ATTRIBUTE_POPULATION);
      expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockInteract.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
      expect(mockInteract.mock.calls[0][0]['correlationData']).toEqual([{ type: 'Board', id: 'AP' },
      { type: 'Medium', id: '' }, { type: 'Class', id: '' },
      { type: 'UserType', id: 'teacher' }]);
    });
  });

  describe('generateAppLaunchTelemetry', () => {
    it('should invoke interact() with proper arguments', () => {
      // arrange
      // act
      telemetryGeneratorService.generateAppLaunchTelemetry('app');
      // assert
      const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
      expect(mockInteract.mock.calls[0][0]['type']).toEqual('app');
      expect(mockInteract.mock.calls[0][0]['subType']).toEqual('');
      expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockInteract.mock.calls[0][0]['pageId']).toEqual(Environment.HOME);
    });
  });

  describe('generateExtraInfoTelemetry', () => {
    it('should invoke interact() with proper arguments', () => {
      // arrange
      // act
      telemetryGeneratorService.generateExtraInfoTelemetry({ id: 'do_123'}, PageId.COLLECTION_DETAIL);
      // assert
      const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
      expect(mockInteract.mock.calls[0][0]['type']).toEqual(InteractType.OTHER);
      expect(mockInteract.mock.calls[0][0]['subType']).toEqual(InteractSubtype.EXTRA_INFO);
      expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockInteract.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
      expect(mockInteract.mock.calls[0][0]['valueMap']).toEqual({ id: 'do_123'});
    });

  });

  describe('generateContentCancelClickedTelemetry', () => {
    it('should invoke interact() with proper arguments', () => {
      // arrange
      // act
      telemetryGeneratorService.generateContentCancelClickedTelemetry(content, 10);
      // assert
      const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
      expect(mockInteract.mock.calls[0][0]['type']).toEqual(InteractType.TOUCH);
      expect(mockInteract.mock.calls[0][0]['subType']).toEqual(InteractSubtype.CANCEL_CLICKED);
      expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockInteract.mock.calls[0][0]['pageId']).toEqual(PageId.CONTENT_DETAIL);
      expect(mockInteract.mock.calls[0][0]['valueMap']).toEqual({ downloadedSoFar: '0.10 KB', size: '0.98 KB'});
    });

  });

  describe('transform', () => {
    it('should return expected values', () => {
      // arrange
      // act
      // assert
      expect(telemetryGeneratorService.transform('wqwqw')).toEqual('0.00 KB');
      expect(telemetryGeneratorService.transform(0)).toEqual('0.00 KB');
      expect(telemetryGeneratorService.transform(10024)).toEqual('9.79 KB');
      expect(telemetryGeneratorService.transform(10024000)).toEqual('9.56 MB');
      expect(telemetryGeneratorService.transform(100240000000)).toEqual('93.36 GB');
      expect(telemetryGeneratorService.transform(100240000000000)).toEqual('91.17 TB');
    });

  });

  describe('isCollection', () => {
    it('should return expected values', () => {
      // arrange
      // act
      // assert
      expect(telemetryGeneratorService.isCollection('application/vnd.ekstep.content-collection')).toBeTruthy();
    });

  });

  describe('generateUtmInfoTelemetry', () => {
    it('should invoke interact() for generate UtmInfo telemetry', () => {
      // arrange
      const value = [
        {
          utm_source: 'sunbird',
          utm_medium: 'search',
          utm_campaign: 'dial',
          utm_term: 'ABCDEF'
        }
      ];
      const object = {
        id: 'sample-id',
        type: 'sample-type',
        version: 'sample-version'
      };
      // act
      telemetryGeneratorService.generateUtmInfoTelemetry(value, 'sample-pageId', object);
      // assert
      const mockInteract = jest.spyOn(mockTelemetryService, 'interact');
      expect(mockInteract.mock.calls[0][0]['type']).toEqual('OTHER');
      expect(mockInteract.mock.calls[0][0]['subType']).toEqual('utm-info');
      expect(mockInteract.mock.calls[0][0]['env']).toEqual(Environment.HOME);
      expect(mockInteract.mock.calls[0][0]['pageId']).toEqual('sample-pageId');
    });
  });

  describe('generatefastLoadingTelemetry()', () => {
    it('should invoke interact() for generate fastloading telemetry', () => {
      // arrange
      jest.spyOn(telemetryGeneratorService, 'generateInteractTelemetry');
      // act
      telemetryGeneratorService.generatefastLoadingTelemetry('INITIATED', 'pageID');
      // assert
      expect(telemetryGeneratorService.generateInteractTelemetry).toBeCalled();
    });
  });

});
