import {SplashscreenActionHandlerDelegate} from './splashscreen-action-handler-delegate';
import {defer, Observable, of} from 'rxjs';
import {
  ContentEvent,
  ContentEventType,
  ContentImportResponse,
  ContentImportStatus,
  ContentService,
  EventNamespace,
  EventsBusService,
  ProfileService,
  SunbirdSdk,
  TelemetryErrorRequest,
  TelemetryService,
  ArchiveService,
  ArchiveObjectType
} from 'sunbird-sdk';
import {Inject, Injectable} from '@angular/core';
import {CommonUtilService} from 'services/common-util.service';
import {Events, PopoverController} from '@ionic/angular';
import {from} from 'rxjs';
import {catchError, concatMap, filter, map, mapTo, mergeMap, reduce, takeUntil, tap} from 'rxjs/operators';
import {SplaschreenDeeplinkActionHandlerDelegate} from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import {ImportPopoverComponent} from '@app/app/components/popups/import-popover/import-popover.component';
import {UtilityService} from '@app/services';

@Injectable()
export class SplashscreenImportActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
    constructor(
        @Inject('CONTENT_SERVICE') private contentService: ContentService,
        @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
        @Inject('ARCHIVE_SERVICE') private archiveService: ArchiveService,
        private splashscreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
        private events: Events,
        private commonUtilService: CommonUtilService,
        private popoverCtrl: PopoverController,
        private utilityService: UtilityService) {
    }

  onAction(payload: { filePath: string }): Observable<undefined> {
    const filePath = 'file://' + payload.filePath;
    const fileExtenstion = filePath.split('.').pop();

    switch (fileExtenstion) {
      case 'ecar': {
          defer(async () => {
              return new Promise<HTMLIonPopoverElement>(async (resolve, reject) => {
                  const fileSize = await this.utilityService.getMetaData(payload.filePath);
                  const fileName: string = filePath.substring(filePath.lastIndexOf('/') + 1);
                  const importPopover = await this.popoverCtrl.create({
                      component: ImportPopoverComponent,
                      componentProps: {
                          filename: fileName,
                          size: fileSize,
                          onLoadClicked: () => {
                              resolve(importPopover);
                          }
                      },
                      cssClass: 'sb-popover',
                      backdropDismiss: false,
                      showBackdrop: true
                  });
                  await importPopover.present();
              });
          }).pipe(
              concatMap((importPopover) => {
                  return this.eventsBusService.events(EventNamespace.CONTENT).pipe(
                      filter(e => e.type === ContentEventType.IMPORT_PROGRESS || e.type === ContentEventType.IMPORT_COMPLETED),
                      takeUntil(
                          this.contentService.importEcar({
                              isChildContent: false,
                              destinationFolder: cordova.file.externalDataDirectory,
                              sourceFilePath: filePath,
                              correlationData: []
                          }).pipe(
                              map((response: ContentImportResponse[]) => {
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
                      ),
                      catchError(() => {
                          return of(undefined);
                      }),
                      reduce((acc, event) => event, undefined),
                      tap((event: ContentEvent) => {
                          if (event.type === ContentEventType.IMPORT_COMPLETED) {
                              importPopover.onDidDismiss().then(({data}) => {
                                  if (data.isDeleteChecked) {
                                      this.utilityService.removeFile(filePath);
                                  } else {
                                      console.log('deleteNotChecked');
                                  }
                                  this.splashscreenDeeplinkActionHandlerDelegate.navigateContent(event.payload.contentId);
                              });
                          }
                      }),
                      mapTo(undefined)
                  );
              })
          ).toPromise();

          return of(undefined);
      }
      case 'epar': {
        return this.profileService.importProfile({
          sourceFilePath: filePath
        }).pipe(
          tap(({ imported, failed }) => {
            this.commonUtilService.showToast('CONTENT_IMPORTED');
          }),
          mapTo(undefined) as any
        );
      }
      case 'gsa': {
        return this.telemetryService.importTelemetry({
          sourceFilePath: filePath
        }).pipe(
          tap((imported) => {
            if (!imported) {
              this.commonUtilService.showToast('CONTENT_IMPORTED_FAILED');
            } else {
              this.commonUtilService.showToast('CONTENT_IMPORTED');
            }
          }),
          tap((imported) => {
            if (imported) {
              this.events.publish('savedResources:update', {
                update: true
              });
            }
          }),
          mapTo(undefined) as any
        );
      }
      case 'zip': {
        return from(this.archiveService.import({
          objects: [ { type: ArchiveObjectType.TELEMETRY } ],
          filePath
        }).toPromise().then(() => {
          this.commonUtilService.showToast('CONTENT_IMPORTED');
          this.events.publish('savedResources:update', {
            update: true
          });
        }).catch(() => {
          this.commonUtilService.showToast('CONTENT_IMPORTED_FAILED');
        })).pipe(
          mapTo(undefined)
        );
      }
      default:
        this.commonUtilService.showToast('INVALID_FORMAT');
        return of(undefined);
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

  private async openPopover(filePath: string) {
      const fileSize = await this.utilityService.getMetaData(filePath);
      const fileName: string = filePath.substr(20);
      const importPopover = await this.popoverCtrl.create({
          component: ImportPopoverComponent,
          componentProps: {
              filename: fileName,
              size: fileSize
          },
          cssClass: 'sb-popover',
          backdropDismiss: false,
          showBackdrop: true
      });
      await importPopover.present();
      const {data} = await importPopover.onDidDismiss();
      if (data.isDeleteChecked) {
          await this.utilityService.removeFile(filePath);
      } else {
          console.log('deleteNotChecked');
      }
  }
}
