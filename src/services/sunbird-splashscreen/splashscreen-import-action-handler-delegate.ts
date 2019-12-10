import { SplashscreenActionHandlerDelegate } from './splashscreen-action-handler-delegate';
import { Observable } from 'rxjs/Observable';
import {
  ContentEventType,
  ContentImportProgress,
  ContentService,
  EventNamespace,
  EventsBusService,
  ProfileService,
  TelemetryService,
  ContentImportResponse,
  ContentImportStatus,
  TelemetryErrorRequest,
  SunbirdSdk
} from 'sunbird-sdk';
import { Inject, Injectable } from '@angular/core';
import { CommonUtilService } from 'services/common-util.service';
import { Events } from '@ionic/angular';

@Injectable()
export class SplashscreenImportActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    private events: Events,
    private commonUtilService: CommonUtilService) {
  }

  onAction(type: string, payload: { filePath: string }): Observable<undefined> {
    const filePath = 'file://' + payload.filePath;
    const fileExtenstion = filePath.split('.').pop();

    switch (fileExtenstion) {
      case 'ecar': {
        splashscreen.show();

        return this.eventsBusService.events(EventNamespace.CONTENT)
          .filter(e => e.type === ContentEventType.IMPORT_PROGRESS)
          .takeUntil(this.contentService.importEcar({
            isChildContent: false,
            destinationFolder: cordova.file.externalDataDirectory,
            sourceFilePath: filePath,
            correlationData: []
          }).map((response: ContentImportResponse[]) => {
            if (!response.length) {
              this.commonUtilService.showToast('CONTENT_IMPORTED');
              return;
            }

            response.forEach((contentImportResponse: ContentImportResponse) => {
              switch (contentImportResponse.status) {
                case ContentImportStatus.ALREADY_EXIST:
                  this.commonUtilService.showToast('CONTENT_ALREADY_EXIST');
                  throw ContentImportStatus.ALREADY_EXIST;
                case ContentImportStatus.IMPORT_FAILED:
                  this.commonUtilService.showToast('CONTENT_IMPORTED_FAILED');
                  throw ContentImportStatus.IMPORT_FAILED;
                case ContentImportStatus.NOT_FOUND:
                  this.commonUtilService.showToast('CONTENT_IMPORTED_FAILED');
                  throw ContentImportStatus.NOT_FOUND;
              }
            });
          })
          )
          .do((event: ContentImportProgress) => {
            splashscreen.setImportProgress(event.payload.currentCount, event.payload.totalCount);
          })
          .catch((error) => {
            this.generateImportErrorTelemetry('invalid-ecar');
            return Observable.of(undefined);
          })
          .mapTo(undefined) as any;
      }
      case 'epar': {
        return this.profileService.importProfile({
          sourceFilePath: filePath
        }).do(({ imported, failed }) => {
          this.commonUtilService.showToast('CONTENT_IMPORTED');
        }).mapTo(undefined) as any;
      }
      case 'gsa': {
        return this.telemetryService.importTelemetry({
          sourceFilePath: filePath
        }).do((imported) => {
          if (!imported) {
            this.commonUtilService.showToast('CONTENT_IMPORTED_FAILED');
          } else {
            this.commonUtilService.showToast('CONTENT_IMPORTED');
          }
        }).do((imported) => {
          if (imported) {
            this.events.publish('savedResources:update', {
              update: true
            });
          }
        }).mapTo(undefined) as any;
      }
      default:
        return Observable.of(undefined);
    }
  }

  generateImportErrorTelemetry(error) {
    const telemetryErrorRequest: TelemetryErrorRequest = {
      errorCode: error,
      errorType: 'mobile-app',
      stacktrace: error,
      pageId: 'home'
    };
    if (SunbirdSdk.instance && SunbirdSdk.instance.isInitialised && telemetryErrorRequest.stacktrace) {
      SunbirdSdk.instance.telemetryService.error(telemetryErrorRequest).toPromise();
    }
  }
}
