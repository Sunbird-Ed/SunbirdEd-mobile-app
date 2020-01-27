import { TelemetryGeneratorService } from './telemetry-generator.service';
import { TelemetryService, TelemetryObject, TelemetryErrorCode } from 'sunbird-sdk';
import {
  Environment, ErrorType, ImpressionType, InteractSubtype, InteractType, Mode, PageId,
  LogLevel
} from '@app/services/telemetry-constants';
import { of } from 'rxjs';

describe('FormAndFrameworkUtilService', () => {
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

  const telemetryObject = new TelemetryObject('do_12345', 'Resource', '1');
  const rollUp = { l1: 'do_1', l2: 'do_12', l3: 'do_123', l4: 'do_1234' };
  const corRelationList = [{ id: 'SearchResult', type: 'Section' }];
  const values = new Map();
  values['isCollapsed'] = true;

  beforeAll(() => {
    telemetryGeneratorService = new TelemetryGeneratorService(
      mockTelemetryService as TelemetryService
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
      JSON.stringify({error: 'error'}));
    // assert
    const mockError = jest.spyOn(mockTelemetryService, 'error');
    expect(mockError.mock.calls[0][0]['errorCode']).toEqual( TelemetryErrorCode.ERR_DOWNLOAD_FAILED);
    expect(mockError.mock.calls[0][0]['errorType']).toEqual(ErrorType.SYSTEM);
    expect(mockError.mock.calls[0][0]['stacktrace']).toEqual('{\"error\":\"error\"}');
    expect(mockError.mock.calls[0][0]['pageId']).toEqual(PageId.COLLECTION_DETAIL);
  });


});
