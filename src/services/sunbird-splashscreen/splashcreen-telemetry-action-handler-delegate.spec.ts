import { SplashcreenTelemetryActionHandlerDelegate } from './splashcreen-telemetry-action-handler-delegate';
import { TelemetryService } from '@project-sunbird/sunbird-sdk';
import { of } from 'rxjs';
import { PageId, ImpressionType, Environment, InteractType } from '../telemetry-constants';

interface TelemetryActionPayload {
  eid: 'IMPRESSION' | 'INTERACT';
  extraInfo?: {
    isFirstTime?: boolean
  };
}

describe('SplaschreenDeeplinkActionHandlerDelegate', () => {
  let splashcreenTelemetryActionHandlerDelegate: SplashcreenTelemetryActionHandlerDelegate;

  const mockTelemetryService: Partial<TelemetryService> = {};

  beforeAll(() => {
    splashcreenTelemetryActionHandlerDelegate = new SplashcreenTelemetryActionHandlerDelegate(
      mockTelemetryService as TelemetryService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of SplashcreenTelemetryActionHandlerDelegate', () => {
    expect(splashcreenTelemetryActionHandlerDelegate).toBeTruthy();
  });

  describe('onAction - generate a telemetry events for splashscreen activities', () => {

    it('should generate an impression event', () => {
      // arrange
      const payload: TelemetryActionPayload = {
        eid: 'IMPRESSION',
        extraInfo: {
          isFirstTime: true
        }
      };
      const telemetryData = {
        env: Environment.HOME,
        type: ImpressionType.VIEW,
        pageId: PageId.SPLASH
      };
      mockTelemetryService.impression = jest.fn(() => {
        return of(undefined);
      });
      // act
      splashcreenTelemetryActionHandlerDelegate.onAction(payload);
      // assert
      expect(mockTelemetryService.impression).toHaveBeenCalledWith(telemetryData);
    });

    it('should generate an impression event if is firstTime is false', () => {
      // arrange
      const payload: TelemetryActionPayload = {
        eid: 'IMPRESSION',
        extraInfo: {
        }
      };
      const telemetryData = {
        env: Environment.HOME,
        type: ImpressionType.VIEW,
        pageId: PageId.SPLASH
      };
      mockTelemetryService.impression = jest.fn(() => {
        return of(undefined);
      });
      // act
      splashcreenTelemetryActionHandlerDelegate.onAction(payload);
      // assert
      expect(mockTelemetryService.impression).toHaveBeenCalledWith(telemetryData);
    });

    it('should generate an interact event', () => {
      // arrange
      const payload: TelemetryActionPayload = {
        eid: 'INTERACT',
        extraInfo: { isFirstTime: true }
      };
      const telemetryData = {
        env: Environment.HOME,
        type: InteractType.OTHER,
        pageId: PageId.SPLASH,
        id: PageId.SPLASH,
        subType: PageId.SPLASH,
        valueMap: {
          ...payload.extraInfo
        }
      };
      mockTelemetryService.interact = jest.fn(() => {
        return of(undefined);
      });
      // act
      splashcreenTelemetryActionHandlerDelegate.onAction(payload);
      // assert
      expect(mockTelemetryService.interact).toHaveBeenCalledWith(telemetryData);
    });


    it('should not generate any event', (done) => {
      // arrange
      const payload: any = {
        eid: 'ANY'
      };
      // act
      splashcreenTelemetryActionHandlerDelegate.onAction(payload).toPromise().then(res => {
        // assert
        expect(res).toEqual(undefined);
        done();
      });
    });
  });

});
