import { SplashscreenActionHandlerDelegate } from './splashscreen-action-handler-delegate';
import { Observable, of } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { TelemetryService, InteractType, CorrelationData } from '@project-sunbird/sunbird-sdk';
import { Environment, ImpressionType, PageId, CorReleationDataType } from '../../services/telemetry-constants';
import { mapTo } from 'rxjs/operators';

interface TelemetryActionPayload {
  eid: 'IMPRESSION' | 'INTERACT';
  extraInfo?: {
    isFirstTime?: boolean
  };
}

@Injectable()
export class SplashcreenTelemetryActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
  constructor(@Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService) {
  }

  onAction(payload: TelemetryActionPayload): Observable<undefined> {
    switch (payload.eid) {
      case 'IMPRESSION': {
        /* New Telemetry */
        const correlationList: Array<CorrelationData> = [];
        
        correlationList.push({id:  payload.extraInfo && payload.extraInfo.isFirstTime ? 'true' : 'false', type: CorReleationDataType.FIRST_TIME_USER});

        this.telemetryService.impression({
          env: Environment.ONBOARDING,
          type: ImpressionType.PAGE_LOADED,
          pageId: PageId.SPLASH,
          correlationData: correlationList
        }).toPromise().then().catch((e) => console.error(e));
        return this.telemetryService.impression({
          env: Environment.HOME,
          type: ImpressionType.VIEW,
          pageId: PageId.SPLASH
        }).pipe(
          mapTo(undefined) as any
        );
      }
      case 'INTERACT': {
        return this.telemetryService.interact({
          env: Environment.HOME,
          type: InteractType.OTHER,
          pageId: PageId.SPLASH,
          id: PageId.SPLASH,
          subType: PageId.SPLASH,
          valueMap: {
            ...payload.extraInfo
          }
        }).pipe(
          mapTo(undefined) as any
        );
      }
      default: {
        return of(undefined);
      }
    }
  }
}
