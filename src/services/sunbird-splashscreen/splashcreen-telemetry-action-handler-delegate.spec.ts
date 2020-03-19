import { SplashcreenTelemetryActionHandlerDelegate } from './splashcreen-telemetry-action-handler-delegate';
import { TelemetryService } from 'sunbird-sdk';
import { of } from 'rxjs';

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
        eid: 'IMPRESSION'
      };
      mockTelemetryService.impression = jest.fn(() => {
        return of(undefined);
      });
      // act
      splashcreenTelemetryActionHandlerDelegate.onAction(payload);
      // assert
    });

    it('should generate an interact event', () => {
      // arrange
      const payload: TelemetryActionPayload = {
        eid: 'INTERACT'
      };
      mockTelemetryService.impression = jest.fn(() => {
        return of(undefined);
      });
      // act
      splashcreenTelemetryActionHandlerDelegate.onAction(payload);
      // assert
    });

    it('should not generate any event', () => {
      // arrange
      const payload: any = {
        eid: 'ANY'
      };
      mockTelemetryService.impression = jest.fn(() => {
        return of(undefined);
      });
      // act
      splashcreenTelemetryActionHandlerDelegate.onAction(payload);
      // assert
    });
  });
});
