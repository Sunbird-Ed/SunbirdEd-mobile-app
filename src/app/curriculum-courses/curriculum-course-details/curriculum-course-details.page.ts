import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import {
  AppHeaderService, CommonUtilService, TelemetryGeneratorService,
  InteractSubtype, PageId, Environment, InteractType, ErrorType, LoginHandlerService, AppGlobalService
} from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationExtras } from '@angular/router';
import { ContentUtil } from '@app/util/content-util';
import { MimeType, RouterLinks, ShareItemType } from '@app/app/app.constant';
import {
  ContentDetailRequest, ContentService, Content, ContentImportRequest,
  ContentImport, ContentImportResponse, CorrelationData, ContentImportStatus,
  TelemetryErrorCode, StorageService, Rollup, DownloadTracking, DownloadService,
  TelemetryObject, EventsBusService, EventsBusEvent, DownloadEventType, DownloadProgress,
  ContentEventType, ContentImportCompleted
} from '@project-sunbird/sunbird-sdk';
import { Events, Platform, PopoverController } from '@ionic/angular';
import { ConfirmAlertComponent } from '@app/app/components';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { SbSharePopupComponent } from '@app/app/components/popups/sb-share-popup/sb-share-popup.component';
import { Observable, Subscription } from 'rxjs';
import { share } from 'rxjs/operators';
import { ContentDeleteHandler } from '@app/services/content/content-delete-handler';
import { ContentInfo } from '@app/services/content/content-info';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';

@Component({
  selector: 'app-curriculum-course-details',
  templateUrl: './curriculum-course-details.page.html',
  styleUrls: ['./curriculum-course-details.page.scss'],
})
export class CurriculumCourseDetailsPage implements OnInit {

  private eventSubscription: Subscription;
  public objRollup: Rollup;
  public telemetryObject: TelemetryObject;
  public corRelationList: Array<CorrelationData>;
  headerObservable: any;
  showSheenAnimation = true;
  isChild = false;
  courseData: any;
  course: any;
  courseHeirarchy: any;
  downloadSize = 0;
  localResourseCount: number;
  downloadIdentifiers: Set<string> = new Set();
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
  };
  showDownloadBtn = false;
  showDownload: boolean;
  showCollapsedPopup = true;
  public rollUpMap: { [key: string]: Rollup } = {};
  isUpdateAvailable = false;
  isDownloadStarted = false;
  isDownloadCompleted = false;
  queuedIdentifiers: Array<any> = [];
  faultyIdentifiers: Array<any> = [];
  downloadProgress: any;
  currentCount = 0;
  trackDownloads$: Observable<DownloadTracking>;
  contentDeleteObservable: any;
  private extrasData: any;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    @Inject('DOWNLOAD_SERVICE') private downloadService: DownloadService,
    @Inject('EVENTS_BUS_SERVICE') private eventBusService: EventsBusService,
    private contentDeleteHandler: ContentDeleteHandler,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appHeaderService: AppHeaderService,
    private zone: NgZone,
    private events: Events,
    private commonUtilService: CommonUtilService,
    private fileSizePipe: FileSizePipe,
    private popoverCtrl: PopoverController,
    private location: Location,
    private router: Router,
    private loginHandlerService: LoginHandlerService,
    private appGlobalService: AppGlobalService
  ) {
    if ((!this.router.getCurrentNavigation() || !this.router.getCurrentNavigation().extras) && this.appGlobalService.preSignInData) {
      this.extrasData = this.appGlobalService.preSignInData;
    } else {
      this.extrasData = this.router.getCurrentNavigation().extras.state;
    }
    this.appGlobalService.preSignInData = null;
    this.course = this.extrasData.curriculumCourse;
    this.initCourseData(this.course);
  }

  ngOnInit() {
    this.objRollup = new Rollup();
    this.telemetryObject = ContentUtil.getTelemetryObject(this.course);

    this.trackDownloads$ = this.downloadService.trackDownloads({
      groupBy: {
        fieldPath: 'rollUp.l1',
        value: this.course.identifier
      }
    }).pipe(share());
  }

  ionViewWillEnter() {
    this.zone.run(() => {
      this.headerObservable = this.appHeaderService.headerEventEmitted$.subscribe(eventName => {
        this.handleHeaderEvents(eventName);
      });
      this.refreshHeader(false);
      this.getContentDetails(this.course.identifier, true);
      this.subscribeSdkEvent();
    });
  }

  ionViewWillLeave() {
    this.downloadProgress = 0;
    this.headerObservable.unsubscribe();
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  private handleHeaderEvents($event) {
    switch ($event.name) {
      case 'download':
        this.redirectToActivedownloads();
        break;
    }
  }

  private redirectToActivedownloads() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.HOME,
      PageId.CURRICULUM_COURSE_DETAIL,
      this.telemetryObject,
      undefined, this.objRollup,
      this.corRelationList);
    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  private subscribeSdkEvent() {
    this.eventSubscription = this.eventBusService.events().subscribe((event: EventsBusEvent) => {
      this.zone.run(() => {
        if (event.type === DownloadEventType.PROGRESS) {
          const downloadEvent = event as DownloadProgress;

          if (downloadEvent.payload.identifier === this.course.identifier) {
            this.downloadProgress = downloadEvent.payload.progress === -1 ? 0 : downloadEvent.payload.progress;
            if (this.downloadProgress === 100) {
              this.refreshHeader(true);
              this.course.isAvailableLocally = true;
            }
          }
        }

        // Get child content
        if (event.type === ContentEventType.CONTENT_EXTRACT_COMPLETED) {
          const contentImportedEvent = event as ContentImportCompleted;

          if (this.queuedIdentifiers.length && this.isDownloadStarted) {
            if (this.queuedIdentifiers.includes(contentImportedEvent.payload.contentId)) {
              this.currentCount++;
            }
            if (this.queuedIdentifiers.length === this.currentCount) {
              this.refreshHeader(true);
              this.isDownloadStarted = false;
              this.showDownloadBtn = false;
              this.isDownloadCompleted = true;
              this.showDownload = false;
              this.course.isAvailableLocally = true;
              this.updateSavedResources();
            }
          } else {
            if (this.isUpdateAvailable && contentImportedEvent.payload.contentId === this.course.identifier) {
              // this.showLoading = false;
              this.refreshHeader(true);
              this.getContentDetails(this.course.identifier, false);
            } else {
              if (contentImportedEvent.payload.contentId === this.course.identifier) {
                this.refreshHeader(true);
                this.updateSavedResources();
                this.getChildContents(this.course.identifier);
                this.course.isAvailableLocally = true;
              }
            }
          }
        }
      });
    }) as any;
  }

  private updateSavedResources() {
    this.events.publish('savedResources:update', {
      update: true
    });
  }

  onTocCardClick(event) {
    if (event.item.mimeType === MimeType.COLLECTION) {
      const chapterParams: NavigationExtras = {
        state: {
          courseName: this.course.name,
          chapterData: event.item,
        }
      };

      this.router.navigate([`/${RouterLinks.CURRICULUM_COURSES}/${RouterLinks.CHAPTER_DETAILS}`],
        chapterParams);
    } else {
      this.router.navigate([RouterLinks.CONTENT_DETAILS], {
        state: {
          content: event.item,
          corRelation: this.corRelationList
        }
      });
    }
  }

  private getContentDetails(identifier, refreshContentDetails: boolean) {
    const contentDetailRequest: ContentDetailRequest = {
      contentId: identifier,
      attachFeedback: true,
      attachContentAccess: true,
      emitUpdateIfAny: refreshContentDetails
    };
    this.contentService.getContentDetails(contentDetailRequest).toPromise()
      .then((contentDetail: Content) => {
        if (contentDetail) {
          if (!contentDetail.isAvailableLocally) {
            this.course = contentDetail;
            this.initCourseData(this.course);
            this.contentService.getContentHeirarchy(contentDetailRequest).toPromise()
              .then((content: Content) => {
                this.courseHeirarchy = content;
                this.showSheenAnimation = false;
              }).catch(() => {
                this.showSheenAnimation = false;
              });
            this.importContent([identifier], false);
          } else {
            this.showSheenAnimation = false;
            this.extractApiResponse(contentDetail);
          }
        }
      }).catch((error) => {
        console.log('error while loading content details', error);
        this.showSheenAnimation = false;
        this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
        this.location.back();
      });
  }

  private importContent(identifiers: Array<string>, isChild: boolean, isDownloadAllClicked?) {
    const contentImportRequest: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: ['Live'],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel'],
    };
    //  Call content service
    this.contentService.importContent(contentImportRequest).toPromise()
      .then((contentImportResponse: ContentImportResponse[]) => {
        this.zone.run(() => {
          if (contentImportResponse && contentImportResponse.length && this.isDownloadStarted) {
            contentImportResponse.forEach((value) => {
              if (value.status === ContentImportStatus.ENQUEUED_FOR_DOWNLOAD) {
                this.queuedIdentifiers.push(value.identifier);
              } else if (value.status === ContentImportStatus.NOT_FOUND) {
                this.faultyIdentifiers.push(value.identifier);
              }
            });

            if (isDownloadAllClicked) {
              this.telemetryGeneratorService.generateDownloadAllClickTelemetry(
                PageId.CURRICULUM_COURSE_DETAIL,
                this.course,
                this.queuedIdentifiers,
                identifiers.length
              );
            }

            if (this.queuedIdentifiers.length === 0 && this.isDownloadStarted) {
              this.showDownloadBtn = true;
              this.isDownloadStarted = false;
              this.refreshHeader(true);
            }

            if (this.faultyIdentifiers.length > 0) {
              const stackTrace: any = {};
              stackTrace.parentIdentifier = this.course.identifier;
              stackTrace.faultyIdentifiers = this.faultyIdentifiers;
              this.telemetryGeneratorService.generateErrorTelemetry(Environment.HOME,
                TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
                ErrorType.SYSTEM,
                PageId.CURRICULUM_COURSE_DETAIL,
                JSON.stringify(stackTrace),
              );
              this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
            }
          } else if (contentImportResponse && contentImportResponse[0].status === ContentImportStatus.NOT_FOUND) {
            this.refreshHeader(true);
          }
        });
      })
      .catch((error: any) => {
        this.zone.run(() => {
          this.showDownloadBtn = true;
          this.isDownloadStarted = false;
          this.refreshHeader(true);
          if (Boolean(this.isUpdateAvailable)) {
            this.getChildContents(this.courseHeirarchy.identifier);
          } else {
            if (error && (error.error === 'NETWORK_ERROR' || error.error === 'CONNECTION_ERROR')) {
              this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
            } else {
              this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
            }
            this.location.back();
          }
        });
      });
  }

  private getImportContentRequestBody(identifiers: Array<string>, isChild: boolean): Array<ContentImport> {
    const requestParams: ContentImport[] = [];
    identifiers.forEach((value) => {
      requestParams.push({
        isChildContent: isChild,
        destinationFolder: this.storageService.getStorageDestinationDirectoryPath(),
        contentId: value,
        correlationData: this.corRelationList ? this.corRelationList : [],
        rollUp: this.rollUpMap[value]
      });
    });

    return requestParams;
  }

  private extractApiResponse(content: Content) {
    this.course = content;
    this.refreshHeader(true);
    if (content.isUpdateAvailable && !this.isUpdateAvailable) {
      this.isUpdateAvailable = true;
      this.telemetryGeneratorService.generateSpineLoadingTelemetry(content, false);
      this.importContent([content.identifier], false);
    } else {
      this.isUpdateAvailable = false;
      this.getChildContents(content.identifier);
    }
  }

  private getChildContents(identifier: string) {
    const hierarchyInfo = this.course.hierarchyInfo ? this.course.hierarchyInfo : null;
    const childContentRequest = { contentId: identifier, hierarchyInfo }; // TODO: remove level
    this.contentService.getChildContents(childContentRequest).toPromise()
      .then((content: Content) => {
        this.zone.run(() => {
          this.courseHeirarchy = content;
          this.downloadSize = 0;
          this.localResourseCount = 0;
          this.getContentsSize(content.children || []);
        });
      })
      .catch(() => {
      });
  }

  private getContentsSize(data) {
    data.forEach((content) => {
      if (content.contentData.size) {
        this.downloadSize += Number(content.contentData.size);
      }
      if (!content.children) {
        if (content.isAvailableLocally) {
          this.localResourseCount++;
        }
      }

      if (content.children) {
        this.getContentsSize(content.children);
      }
      if (content.isAvailableLocally === false) {
        this.downloadIdentifiers.add(content.contentData.identifier);
        this.rollUpMap[content.contentData.identifier] = ContentUtil.generateRollUp(content.hierarchyInfo, undefined);
      }

    });
    if (this.downloadIdentifiers.size && !this.isDownloadCompleted) {
      this.showDownloadBtn = true;
    }
  }

  private refreshHeader(publishEvent: boolean) {
    this.headerConfig = this.appHeaderService.getDefaultPageConfig();
    this.headerConfig.actionButtons = ['download'];
    this.headerConfig.showBurgerMenu = false;
    this.appHeaderService.updatePageConfig(this.headerConfig);
    if (publishEvent) {
      this.events.publish('header:setzIndexToNormal');
    }
  }

  private initCourseData(content) {
    let appIcon;
    let basePath = '';
    if (content.contentData) {
      this.courseData = content.contentData;
      appIcon = content.contentData.appIcon;
    } else {
      this.courseData = content;
      appIcon = content.appIcon;
      basePath = content.basePath;
    }

    appIcon = ContentUtil.getAppIcon(appIcon, basePath, this.commonUtilService.networkInfo.isNetworkAvailable);
    this.courseData.appIcon = this.commonUtilService.convertFileSrc(appIcon);
  }

  async showDownloadConfirmationAlert() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      const contentTypeCount = this.downloadIdentifiers.size ? this.downloadIdentifiers.size : '';
      const popover = await this.popoverCtrl.create({
        component: ConfirmAlertComponent,
        componentProps: {
          sbPopoverHeading: this.commonUtilService.translateMessage('DOWNLOAD'),
          sbPopoverMainTitle: this.course.contentData.name,
          actionsButtons: [
            {
              btntext: this.commonUtilService.translateMessage('DOWNLOAD'),
              btnClass: 'popover-color'
            },
          ],
          icon: null,
          metaInfo: this.commonUtilService.translateMessage('ITEMS', contentTypeCount)
            + ' (' + this.fileSizePipe.transform(this.downloadSize, 2) + ')',
        },
        cssClass: 'sb-popover info',
      });
      await popover.present();

      const response = await popover.onDidDismiss();
      if (response && response.data) {
        this.downloadAllContent();
        this.events.publish('header:decreasezIndex');
      }
    } else {
      this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
  }

  private downloadAllContent(): void {
    this.isDownloadStarted = true;
    this.showDownload = true;
    this.showCollapsedPopup = false;
    this.importContent(Array.from(this.downloadIdentifiers), true, true);
  }

  async showDeletePopOver() {
    this.contentDeleteObservable = this.contentDeleteHandler.contentDeleteCompleted$.subscribe(() => {
      this.location.back();
    });

    const contentInfo: ContentInfo = {
      telemetryObject: this.telemetryObject,
      rollUp: this.objRollup,
      correlationList: this.corRelationList,
      hierachyInfo: undefined,
    };
    this.contentDeleteHandler.showContentDeletePopup(this.course, this.isChild, contentInfo, PageId.COLLECTION_DETAIL);
  }

  async share() {
    const popover = await this.popoverCtrl.create({
      component: SbSharePopupComponent,
      componentProps: {
        content: this.course,
        corRelationList: this.corRelationList,
        objRollup: this.objRollup,
        pageId: PageId.CURRICULUM_COURSE_DETAIL,
        shareItemType: ShareItemType.ROOT_COLECTION
      },
      cssClass: 'sb-popover',
    });
    await popover.present();
  }

  navigateToCourseDetails() {
    const isUserLoggedIn = this.appGlobalService.isUserLoggedIn();
    if (!isUserLoggedIn) {
      this.showLoginPopup();
      return;
    }
  }

  async showLoginPopup() {
    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverMainTitle: this.commonUtilService.translateMessage('YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL'),
        metaInfo: this.commonUtilService.translateMessage('TRAININGS_ONLY_REGISTERED_USERS'),
        sbPopoverHeading: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
        isNotShowCloseIcon: true,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
            btnClass: 'popover-color'
          },
        ]
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
    const { data } = await confirm.onDidDismiss();
    if (data && data.canDelete) {
      this.loginHandlerService.signIn({ skipRootNavigation: true, componentData: this.extrasData });
    }
  }

}
