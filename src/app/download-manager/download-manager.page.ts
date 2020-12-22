import { Component, OnInit, Inject, NgZone, ViewChild } from '@angular/core';
import { Events, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import {
  Content,
  ContentDeleteRequest,
  ContentDeleteResponse,
  ContentDeleteStatus,
  ContentRequest,
  ContentService,
  ContentSortCriteria,
  ContentSpaceUsageSummaryRequest,
  ContentSpaceUsageSummaryResponse,
  DeviceInfo,
  Profile,
  SortOrder,
  StorageService,
  StorageDestination
} from 'sunbird-sdk';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService, } from '@app/services/app-header.service';
import { CommonUtilService, } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { AppStorageInfo, DownloadManagerPageInterface, EmitedContents } from './download-manager.interface';
import { RouterLinks, ContentFilterConfig, EventTopics } from '@app/app/app.constant';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import { PageId, InteractType, Environment, InteractSubtype } from '@app/services/telemetry-constants';
import { FormAndFrameworkUtilService } from '@app/services';
import { featureIdMap } from '../feature-id-map';
import { BehaviorSubject } from 'rxjs';
import {
  SbInsufficientStoragePopupComponent
} from '@app/app/components/popups/sb-insufficient-storage-popup/sb-insufficient-storage-popup';
import { DownloadsTabComponent } from './downloads-tab/downloads-tab.component';
import { finalize, tap, skip, takeWhile } from 'rxjs/operators';
import { ContentUtil } from '@app/util/content-util';
import { LocalStorageService, UtilsService } from '../manage-learn/core';

@Component({
  selector: 'app-download-manager',
  templateUrl: './download-manager.page.html',
  styleUrls: ['./download-manager.page.scss'],
})
export class DownloadManagerPage implements DownloadManagerPageInterface, OnInit {
  headerObservable: any;
  _toast: any;
  storageInfo: AppStorageInfo;
  downloadedContents: Content[] = [];
  defaultImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_launcher.png');
  loader: any;
  deleteAllConfirm;
  appName: string;
  sortCriteria: ContentSortCriteria[];
  storageDestination: any;
  private deletedContentListTitle$?: BehaviorSubject<string>;
  @ViewChild('downloadsTab') downloadsTab: DownloadsTabComponent;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    private ngZone: NgZone,
    public commonUtilService: CommonUtilService,
    private headerService: AppHeaderService,
    private events: Events,
    private popoverCtrl: PopoverController,
    private appGlobalService: AppGlobalService,
    private router: Router,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private localStorage: LocalStorageService,
    private utils: UtilsService
  ) { }

  async ngOnInit() {
    this.subscribeContentUpdateEvents();
    return Promise.all(
      [this.getDownloadedContents(true),
      this.getAppName()]
    );
  }

  async ionViewWillEnter() {
    this.events.subscribe('update_header', () => {
      this.headerService.showHeaderWithHomeButton(['download', 'settings']);
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });

    this.headerService.showHeaderWithHomeButton(['download', 'settings']);
    await this.getAppStorageInfo();
    this.getDownloadedContents();
    this.checkAvailableSpace();
    this.fetchStorageDestination();
    this.events.subscribe(EventTopics.HAMBURGER_MENU_CLICKED, () => {
      this.closeSelectAllPopup();
    });
  }

  private async getAppName() {
    return this.commonUtilService.getAppName()
      .then((appName: any) => {
        this.appName = appName;
      });
  }

  private async getAppStorageInfo(): Promise<AppStorageInfo> {
    const req: ContentSpaceUsageSummaryRequest = { paths: [this.storageService.getStorageDestinationDirectoryPath()] };
    return this.contentService.getContentSpaceUsageSummary(req).toPromise()
      .then((res: ContentSpaceUsageSummaryResponse[]) => {
        return this.deviceInfo.getAvailableInternalMemorySize().toPromise()
          .then((size) => {
            this.storageInfo = {
              usedSpace: res[0].sizeOnDevice,
              availableSpace: parseInt(size, 10)
            };
            return this.storageInfo;
          });
      });

  }

  async getDownloadedContents(shouldGenerateTelemetry?, ignoreLoader?) {
    const profile: Profile = this.appGlobalService.getCurrentUser();

    const defaultSortCriteria: ContentSortCriteria[] = [{
      sortAttribute: 'sizeOnDevice',
      sortOrder: SortOrder.DESC
    }];
    const primaryCategories = await this.formAndFrameworkUtilService.getSupportedContentFilterConfig(
      ContentFilterConfig.NAME_DOWNLOADS);
    const requestParams: ContentRequest = {
      uid: profile.uid,
      primaryCategories,
      audience: [],
      sortCriteria: this.sortCriteria || defaultSortCriteria
    };
    if (shouldGenerateTelemetry) {
      await this.getAppStorageInfo();
    }
    await this.contentService.getContents(requestParams).toPromise()
      .then(async data => {
        if (shouldGenerateTelemetry) {
          this.generateInteractTelemetry(data.length, this.storageInfo.usedSpace, this.storageInfo.availableSpace);
        }
        data.forEach((value) => {
          value.contentData['lastUpdatedOn'] = value.lastUpdatedTime;
          value.contentData.appIcon = ContentUtil.getAppIcon(value.contentData.appIcon,
            value.basePath, this.commonUtilService.networkInfo.isNetworkAvailable);
        });
        this.ngZone.run(async () => {
          this.downloadedContents = data;
        });
      })
      .catch((e) => {
      });
  }

  private generateInteractTelemetry(contentCount: number, usedSpace: number, availableSpace: number) {
    const valuesMap = {};
    valuesMap['count'] = contentCount;
    valuesMap['spaceTakenByApp'] = this.commonUtilService.fileSizeInMB(usedSpace);
    valuesMap['freeSpace'] = this.commonUtilService.fileSizeInMB(availableSpace);
    this.telemetryGeneratorService.generateExtraInfoTelemetry(valuesMap, PageId.DOWNLOADS);
  }

  async deleteContents(emitedContents: EmitedContents) {
    const contentDeleteRequest: ContentDeleteRequest = {
      contentDeleteList: emitedContents.selectedContents
    };
    if (emitedContents.selectedContents.length > 1) {
      await this.deleteAllContents(emitedContents);
    } else {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();

      this.contentService.deleteContent(contentDeleteRequest).toPromise()
        .then(async (data: ContentDeleteResponse[]) => {
          await this.loader.dismiss();
          this.loader = undefined;
          // this.getDownloadedContents();
          if (data && data[0].status === ContentDeleteStatus.NOT_FOUND) {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('CONTENT_DELETE_FAILED'));
          } else {
            this.events.publish('savedResources:update', {
              update: true
            });
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('MSG_RESOURCE_DELETED'));
          }
        }).catch(async (error: any) => {
          await this.loader.dismiss();
          this.loader = undefined;
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('CONTENT_DELETE_FAILED'));
        });
    }
  }

  private async deleteAllContents(emitedContents) {
    const valuesMap = {};
    valuesMap['size'] = this.commonUtilService.fileSizeInMB(emitedContents.selectedContentsInfo.totalSize);
    valuesMap['count'] = emitedContents.selectedContentsInfo.count;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DELETE_CLICKED,
      Environment.DOWNLOADS,
      PageId.BULK_DELETE_CONFIRMATION_POPUP, undefined,
      valuesMap,
      undefined,
      featureIdMap.downloadManager.DOWNLOADS_DELETE);
    const contentDeleteRequest: ContentDeleteRequest = {
      contentDeleteList: emitedContents.selectedContents
    };
    this.deletedContentListTitle$ = new BehaviorSubject('0/' + contentDeleteRequest.contentDeleteList.length);
    this.deleteAllConfirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('DELETE_PROGRESS'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CANCEL'),
            btnClass: 'sb-btn sb-btn-sm sb-btn-outline-info cancel-delete'
          },
        ],
        icon: null,
        metaInfo: this.commonUtilService.translateMessage('FILES_DELETED'),
        sbPopoverDynamicMainTitle: this.deletedContentListTitle$
      },
      cssClass: 'sb-popover danger sb-popover-cancel-delete',
    });
    await this.deleteAllConfirm.present();

    this.deleteAllConfirm.onDidDismiss().then((response) => {
      if (response) {
        this.contentService.clearContentDeleteQueue().toPromise();
      }
    });
    this.contentService.enqueueContentDelete(contentDeleteRequest).toPromise();
    this.contentService.getContentDeleteQueue().pipe(
      skip(1),
      takeWhile((list) => !!list.length),
      finalize(async () => {
        this.deletedContentListTitle$
          .next(`${contentDeleteRequest.contentDeleteList.length}/${contentDeleteRequest.contentDeleteList.length}`);

        this.deleteAllConfirm.dismiss();
        this.events.publish('savedResources:update', {
          update: true
        });
      })
    )
      .subscribe((list) => {
        this.deletedContentListTitle$
          .next(`${contentDeleteRequest.contentDeleteList.length - list.length}/${contentDeleteRequest.contentDeleteList.length}`);
      });
  }

  onSortCriteriaChange(sortAttribute): void {
    let sortAttr: string;
    if (sortAttribute.selectedItem === 'CONTENT_SIZE') {
      sortAttr = 'sizeOnDevice';
    } else if (sortAttribute.selectedItem === 'LAST_VIEWED') {
      sortAttr = 'lastUsedOn';
    }
    const valuesMap = {};
    valuesMap['selectedOption'] = sortAttr;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SORT_OPTION_SELECTED,
      Environment.DOWNLOADS,
      PageId.DOWNLOADS,
      undefined,
      valuesMap,
      undefined,
      featureIdMap.downloadManager.DOWNLOADS_SORT
    );
    this.sortCriteria = [{
      sortOrder: SortOrder.DESC,
      sortAttribute: sortAttr
    }];
    this.getDownloadedContents();
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe('update_header');
    this.headerObservable.unsubscribe();
    this.events.unsubscribe(EventTopics.HAMBURGER_MENU_CLICKED);
  }

  private subscribeContentUpdateEvents() {
    this.events.subscribe('savedResources:update', async (res) => {
      if (res && res.update) {
        this.getDownloadedContents(false, true);
        await this.getAppStorageInfo();
      }
    });
  }

  private handleHeaderEvents($event) {
    switch ($event.name) {
      case 'download':
        this.redirectToActivedownloads();
        break;
      case 'settings':
        this.closeSelectAllPopup();
        this.redirectToSettings();
        break;
    }
  }

  private redirectToActivedownloads() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.DOWNLOADS,
      PageId.DOWNLOADS);
    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  private redirectToSettings() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SETTINGS_CLICKED,
      Environment.DOWNLOADS,
      PageId.DOWNLOADS);
    this.router.navigate([RouterLinks.STORAGE_SETTINGS]);
  }

  private async fetchStorageDestination() {
    this.storageDestination = await this.storageService.getStorageDestination().toPromise();
  }

  private async presentPopupForLessStorageSpace() {
    this._toast = await this.popoverCtrl.create({
      component: SbInsufficientStoragePopupComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('INSUFFICIENT_STORAGE'),
        sbPopoverMessage: this.storageDestination === StorageDestination.INTERNAL_STORAGE ?
          this.commonUtilService.translateMessage('MOVE_FILES_TO_OTHER_DESTINATION', this.commonUtilService.translateMessage('SD_CARD')) :
          this.commonUtilService.translateMessage('MOVE_FILES_TO_OTHER_DESTINATION', this.commonUtilService.translateMessage(
            'INTERNAL_MEMORY'
          )),
      },
      cssClass: 'sb-popover no-network',
    });
    await this._toast.present();
  }

  private checkAvailableSpace() {
    this.storageService.getStorageDestinationVolumeInfo().pipe(
      tap((volumeInfo) => {
        if (volumeInfo.info.availableSize < 209715200) {
          this.presentPopupForLessStorageSpace();
        }
      })
    )
      .subscribe();
  }

  async closeSelectAllPopup() {
    if (this.downloadsTab && this.downloadsTab.deleteAllConfirm) {
      await this.downloadsTab.deleteAllConfirm.dismiss();
      this.downloadsTab.unSelectAllContents();
    }
  }


  setQuestions() {
    debugger
    const key = this.utils.getAssessmentLocalStorageKey('5fd9f2d0c91909226f7ec649');
    const obj = {
      "entityProfile": { "_id": "5d7c8cbce3be8677c3fedff9", "entityTypeId": "5d28233dd772d270e55b4072", "entityType": "school", "form": [] }, "program": { "_id": "5d7dbf6b639f5817a1de9239", "externalId": "APDEMO-PGM-MANTRA-SHALASIDDHI-2019-001", "name": "MANTRA SHAHASIDDHI 2019 : All schools assessment program", "description": "APDEMO MANTRA SHAHASIDDHI 2019 : All schools assessment program", "imageCompression": { "quality": 10 }, "isAPrivateProgram": false }, "solution": { "_id": "5d7dbfb6e3be8677c3fee052", "externalId": "Mantra-SHALASIDDHI-2019-001", "name": "Mantra ShalaSiddhi School Assessment framework 2019", "description": "Mantra ShalaSiddhi School Assessment framework 2019", "registry": [], "captureGpsLocationAtQuestionLevel": false, "enableQuestionReadOut": false, "allowMultipleAssessemts": false, "scoringSystem": "percentage", "isRubricDriven": false }, "assessment": {
        "name": "Mantra ShalaSiddhi School Assessment framework 2019", "description": "Mantra ShalaSiddhi School Assessment framework 2019", "externalId": "Mantra-SHALASIDDHI-2019-001", "submissionId": "5fd9f2d0c91909226f7ec649", "evidences": [{
          "code": "LPAD", "sections": [{
            "code": "SQ", "questions": [{
              "_id": "",
              "question": "",
              "options": "",
              "children": "",
              "questionGroup": "",
              "fileName": "",
              "instanceQuestions": "",
              "deleted": "",
              "remarks": "",
              "value": "",
              "usedForScoring": "",
              "questionType": "",
              "canBeNotApplicable": "",
              "isCompleted": "",
              "visibleIf": "",
              "validation": "",
              "file": "",
              "externalId": "",
              "tip": "",
              "hint": "",
              "responseType": "pageQuestions",
              "allowAudioRecording": "",
              "modeOfCollection": "",
              "accessibility": "",
              "showRemarks": "",
              "rubricLevel": "",
              "sectionHeader": "",
              "page": "p1",
              "questionNumber": "",
              "updatedAt": "",
              "createdAt": "",
              "__v": "",
              "evidenceMethod": "",
              "payload": "",
              "startTime": "",
              "endTime": "",
              "gpsLocation": "",
              "pageQuestions": [
                {
                  "_id": "5db915bbf23c3718ec8a0e7e",
                  "question": [
                    "Are the school premises clean and well maintained?",
                    ""
                  ],
                  "options": [
                    {
                      "value": "R1",
                      "label": "Yes"
                    },
                    {
                      "value": "R2",
                      "label": "No"
                    }
                  ],
                  "children": [
                  ],
                  "questionGroup": [
                    "A1"
                  ],
                  "fileName": [
                  ],
                  "instanceQuestions": [
                  ],
                  "deleted": false,
                  "remarks": "",
                  "value": "",
                  "usedForScoring": "",
                  "questionType": "auto",
                  "canBeNotApplicable": "false",
                  "isCompleted": false,
                  "visibleIf": "",
                  "validation": {
                    "required": true
                  },
                  "file": {
                    "required": true,
                    "type": [
                      "image/jpeg",
                      "docx",
                      "pdf",
                      "ppt"
                    ],
                    "minCount": 0,
                    "maxCount": 10,
                    "caption": "FALSE"
                  },
                  "externalId": "CRPVFQ1_1572410738516",
                  "tip": "",
                  "hint": "",
                  "responseType": "radio",
                  "allowAudioRecording": false,
                  "modeOfCollection": "onfield",
                  "accessibility": "No",
                  "showRemarks": false,
                  "rubricLevel": "",
                  "sectionHeader": "",
                  "page": "p1",
                  "questionNumber": "1.0",
                  "updatedAt": "2019-10-30T04:46:51.620Z",
                  "createdAt": "2019-10-30T04:46:51.620Z",
                  "__v": 0,
                  "evidenceMethod": "OB",
                  "payload": {
                    "criteriaId": "5db915b7ef7a6518ddab970b",
                    "responseType": "radio",
                    "evidenceMethod": "OB",
                    "rubricLevel": ""
                  },
                  "startTime": "",
                  "endTime": "",
                  "gpsLocation": ""
                },
                {
                  "_id": "5db915bbf23c3718ec8a0e7f",
                  "question": [
                    "Is there dedicated space in the school where the\nposters and charts made by students are displayed?",
                    ""
                  ],
                  "options": [
                    {
                      "value": "R1",
                      "label": "Yes"
                    },
                    {
                      "value": "R2",
                      "label": "No"
                    }
                  ],
                  "children": [
                  ],
                  "questionGroup": [
                    "A1"
                  ],
                  "fileName": [
                  ],
                  "instanceQuestions": [
                  ],
                  "deleted": false,
                  "remarks": "",
                  "value": "",
                  "usedForScoring": "",
                  "questionType": "auto",
                  "canBeNotApplicable": "false",
                  "isCompleted": false,
                  "visibleIf": "",
                  "validation": {
                    "required": true
                  },
                  "file": {
                    "required": true,
                    "type": [
                      "image/jpeg",
                      "docx",
                      "pdf",
                      "ppt"
                    ],
                    "minCount": 0,
                    "maxCount": 10,
                    "caption": "FALSE"
                  },
                  "externalId": "CRPVFQ2_1572410738516",
                  "tip": "",
                  "hint": "",
                  "responseType": "radio",
                  "allowAudioRecording": false,
                  "modeOfCollection": "onfield",
                  "accessibility": "No",
                  "showRemarks": false,
                  "rubricLevel": "",
                  "sectionHeader": "",
                  "page": "p1",
                  "questionNumber": "2.0",
                  "updatedAt": "2019-10-30T04:46:51.632Z",
                  "createdAt": "2019-10-30T04:46:51.632Z",
                  "__v": 0,
                  "evidenceMethod": "OB",
                  "payload": {
                    "criteriaId": "5db915b7ef7a6518ddab970b",
                    "responseType": "radio",
                    "evidenceMethod": "OB",
                    "rubricLevel": ""
                  },
                  "startTime": "",
                  "endTime": "",
                  "gpsLocation": ""
                },
                {
                  "_id": "5db915bbf23c3718ec8a0e80",
                  "question": [
                    "Enter the number of SMC Meetings conducted this\nacademic year",
                    ""
                  ],
                  "options": [
                  ],
                  "children": [
                  ],
                  "questionGroup": [
                    "A1"
                  ],
                  "fileName": [
                  ],
                  "instanceQuestions": [
                  ],
                  "deleted": false,
                  "remarks": "",
                  "value": "",
                  "usedForScoring": "",
                  "questionType": "auto",
                  "canBeNotApplicable": "false",
                  "isCompleted": false,
                  "visibleIf": "",
                  "validation": {
                    "required": true,
                    "IsNumber": "true"
                  },
                  "externalId": "CRPVFQ3_1572410738516",
                  "tip": "",
                  "hint": "",
                  "responseType": "number",
                  "allowAudioRecording": false,
                  "modeOfCollection": "onfield",
                  "accessibility": "No",
                  "showRemarks": false,
                  "rubricLevel": "",
                  "sectionHeader": "",
                  "page": "p1",
                  "questionNumber": "3.0",
                  "updatedAt": "2019-10-30T04:46:51.643Z",
                  "createdAt": "2019-10-30T04:46:51.643Z",
                  "__v": 0,
                  "file": "",
                  "evidenceMethod": "OB",
                  "payload": {
                    "criteriaId": "5db915b7ef7a6518ddab970c",
                    "responseType": "number",
                    "evidenceMethod": "OB",
                    "rubricLevel": ""
                  },
                  "startTime": "",
                  "endTime": "",
                  "gpsLocation": ""
                },
                {
                  "_id": "5db915bbf23c3718ec8a0e81",
                  "question": [
                    "Did at-least 50% of the SMC Members attend the\nSMC Meeting according to SMC register?",
                    "The percentage of SMC members who attended the meeting could be mentioned in remarks"
                  ],
                  "options": [
                    {
                      "value": "R1",
                      "label": "Yes"
                    },
                    {
                      "value": "R2",
                      "label": "No"
                    }
                  ],
                  "children": [
                  ],
                  "questionGroup": [
                    "A1"
                  ],
                  "fileName": [
                  ],
                  "instanceQuestions": [
                  ],
                  "deleted": false,
                  "remarks": "",
                  "value": "",
                  "usedForScoring": "",
                  "questionType": "auto",
                  "canBeNotApplicable": "false",
                  "isCompleted": false,
                  "visibleIf": "",
                  "validation": {
                    "required": true
                  },
                  "externalId": "CRPVFQ4_1572410738516",
                  "tip": "",
                  "hint": "",
                  "responseType": "radio",
                  "allowAudioRecording": false,
                  "modeOfCollection": "onfield",
                  "accessibility": "No",
                  "showRemarks": true,
                  "rubricLevel": "",
                  "sectionHeader": "",
                  "page": "p1",
                  "questionNumber": "4.0",
                  "updatedAt": "2019-10-30T04:46:51.653Z",
                  "createdAt": "2019-10-30T04:46:51.653Z",
                  "__v": 0,
                  "file": "",
                  "evidenceMethod": "OB",
                  "payload": {
                    "criteriaId": "5db915b7ef7a6518ddab970c",
                    "responseType": "radio",
                    "evidenceMethod": "OB",
                    "rubricLevel": ""
                  },
                  "startTime": "",
                  "endTime": "",
                  "gpsLocation": ""
                },
                {
                  "_id": "5db915bbf23c3718ec8a0e82",
                  "question": [
                    "Ask any 5 students for their homework notebooks.\nHave the notebooks been corrected by the teacher?",
                    ""
                  ],
                  "options": [
                    {
                      "value": "R1",
                      "label": "Yes"
                    },
                    {
                      "value": "R2",
                      "label": "No"
                    }
                  ],
                  "children": [
                  ],
                  "questionGroup": [
                    "A1"
                  ],
                  "fileName": [
                  ],
                  "instanceQuestions": [
                  ],
                  "deleted": false,
                  "remarks": "",
                  "value": "",
                  "usedForScoring": "",
                  "questionType": "auto",
                  "canBeNotApplicable": "false",
                  "isCompleted": false,
                  "visibleIf": "",
                  "validation": {
                    "required": true
                  },
                  "file": {
                    "required": true,
                    "type": [
                      "image/jpeg",
                      "docx",
                      "pdf",
                      "ppt"
                    ],
                    "minCount": 0,
                    "maxCount": 10,
                    "caption": "FALSE"
                  },
                  "externalId": "CRPVFQ5_1572410738516",
                  "tip": "",
                  "hint": "",
                  "responseType": "radio",
                  "allowAudioRecording": false,
                  "modeOfCollection": "onfield",
                  "accessibility": "No",
                  "showRemarks": false,
                  "rubricLevel": "",
                  "sectionHeader": "",
                  "page": "p1",
                  "questionNumber": "5.0",
                  "updatedAt": "2019-10-30T04:46:51.665Z",
                  "createdAt": "2019-10-30T04:46:51.665Z",
                  "__v": 0,
                  "evidenceMethod": "OB",
                  "payload": {
                    "criteriaId": "5db915b7ef7a6518ddab970d",
                    "responseType": "radio",
                    "evidenceMethod": "OB",
                    "rubricLevel": ""
                  },
                  "startTime": "",
                  "endTime": "",
                  "gpsLocation": ""
                },
                {
                  "_id": "5db915bbf23c3718ec8a0e83",
                  "question": [
                    "On what topic was a model demonstration\nconducted?",
                    ""
                  ],
                  "options": [
                  ],
                  "children": [
                  ],
                  "questionGroup": [
                    "A1"
                  ],
                  "fileName": [
                  ],
                  "instanceQuestions": [
                  ],
                  "deleted": false,
                  "remarks": "",
                  "value": "",
                  "usedForScoring": "",
                  "questionType": "auto",
                  "canBeNotApplicable": "false",
                  "isCompleted": false,
                  "visibleIf": "",
                  "validation": {
                    "required": true
                  },
                  "file": {
                    "required": true,
                    "type": [
                      "image/jpeg",
                      "docx",
                      "pdf",
                      "ppt"
                    ],
                    "minCount": 0,
                    "maxCount": 10,
                    "caption": "FALSE"
                  },
                  "externalId": "CRPVFQ6_1572410738516",
                  "tip": "",
                  "hint": "",
                  "responseType": "text",
                  "allowAudioRecording": false,
                  "modeOfCollection": "onfield",
                  "accessibility": "No",
                  "showRemarks": false,
                  "rubricLevel": "",
                  "sectionHeader": "",
                  "page": "p1",
                  "questionNumber": "6.0",
                  "updatedAt": "2019-10-30T04:46:51.676Z",
                  "createdAt": "2019-10-30T04:46:51.676Z",
                  "__v": 0,
                  "evidenceMethod": "OB",
                  "payload": {
                    "criteriaId": "5db915b7ef7a6518ddab970e",
                    "responseType": "text",
                    "evidenceMethod": "OB",
                    "rubricLevel": ""
                  },
                  "startTime": "",
                  "endTime": "",
                  "gpsLocation": ""
                },
                {
                  "_id": "5db915bbf23c3718ec8a0e84",
                  "question": [
                    "How would you rate the level of teachers’\nengagement with the model demonstration?",
                    ""
                  ],
                  "options": [
                  ],
                  "children": [
                  ],
                  "questionGroup": [
                    "A1"
                  ],
                  "fileName": [
                  ],
                  "instanceQuestions": [
                  ],
                  "deleted": false,
                  "remarks": "",
                  "value": "",
                  "usedForScoring": "",
                  "questionType": "auto",
                  "canBeNotApplicable": "false",
                  "isCompleted": false,
                  "visibleIf": "",
                  "validation": {
                    "required": true,
                    "max": "5.0",
                    "min": "1.0"
                  },
                  "externalId": "CRPVFQ7_1572410738516",
                  "tip": "5 is the highest level of engagement",
                  "hint": "",
                  "responseType": "slider",
                  "allowAudioRecording": false,
                  "modeOfCollection": "onfield",
                  "accessibility": "No",
                  "showRemarks": false,
                  "rubricLevel": "",
                  "sectionHeader": "",
                  "page": "p1",
                  "questionNumber": "7.0",
                  "updatedAt": "2019-10-30T04:46:51.686Z",
                  "createdAt": "2019-10-30T04:46:51.686Z",
                  "__v": 0,
                  "file": "",
                  "evidenceMethod": "OB",
                  "payload": {
                    "criteriaId": "5db915b7ef7a6518ddab970e",
                    "responseType": "slider",
                    "evidenceMethod": "OB",
                    "rubricLevel": ""
                  },
                  "startTime": "",
                  "endTime": "",
                  "gpsLocation": ""
                },
                {
                  "_id": "5db915bbf23c3718ec8a0e85",
                  "question": [
                    "What are the best practices that you noticed being\npracticed in the school?",
                    ""
                  ],
                  "options": [
                    {
                      "value": "R1",
                      "label": "Usage of TLMs"
                    },
                    {
                      "value": "R2",
                      "label": "Students clubs"
                    },
                    {
                      "value": "R3",
                      "label": "Regular PTA meetings"
                    },
                    {
                      "value": "R4",
                      "label": "TPDs"
                    },
                    {
                      "value": "R5",
                      "label": "Regular complex meets"
                    },
                    {
                      "value": "R6",
                      "label": "Others"
                    }
                  ],
                  "children": [
                  ],
                  "questionGroup": [
                    "A1"
                  ],
                  "fileName": [
                  ],
                  "instanceQuestions": [
                  ],
                  "deleted": false,
                  "remarks": "",
                  "value": "",
                  "usedForScoring": "",
                  "questionType": "auto",
                  "canBeNotApplicable": "false",
                  "isCompleted": false,
                  "visibleIf": "",
                  "validation": {
                    "required": true
                  },
                  "externalId": "CRPVFQ8_1572410738516",
                  "tip": "If 'others', mention in remarks",
                  "hint": "",
                  "responseType": "multiselect",
                  "allowAudioRecording": false,
                  "modeOfCollection": "onfield",
                  "accessibility": "No",
                  "showRemarks": true,
                  "rubricLevel": "",
                  "sectionHeader": "",
                  "page": "p1",
                  "questionNumber": "8.0",
                  "updatedAt": "2019-10-30T04:46:51.695Z",
                  "createdAt": "2019-10-30T04:46:51.695Z",
                  "__v": 0,
                  "file": "",
                  "evidenceMethod": "OB",
                  "payload": {
                    "criteriaId": "5db915b7ef7a6518ddab970f",
                    "responseType": "multiselect",
                    "evidenceMethod": "OB",
                    "rubricLevel": ""
                  },
                  "startTime": "",
                  "endTime": "",
                  "gpsLocation": ""
                }
              ]
            }, { "_id": "5d70f9af7afa105d7d66d921", "question": ["Let's start capturing your observation notes", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [{ "_id": "5d70f9af7afa105d7d66d922", "question": ["Name", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A02", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "Profile", "updatedAt": "2019-09-05T12:03:59.482Z", "createdAt": "2019-09-05T12:03:59.482Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "text", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d923", "question": ["Designation", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A03", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.493Z", "createdAt": "2019-09-05T12:03:59.493Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "text", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d924", "question": ["Date of visit", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "", "min": "" }, "dateFormat": "DD-MM-YYYY", "autoCapture": false, "externalId": "462A04", "tip": "To be in DD/MM/YYYY format", "hint": "", "responseType": "date", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.524Z", "createdAt": "2019-09-05T12:03:59.524Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "date", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d925", "question": ["School ID", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "IsNumber": "true" }, "externalId": "462A05", "tip": "", "hint": "", "responseType": "number", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.534Z", "createdAt": "2019-09-05T12:03:59.534Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "number", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d926", "question": ["Zone", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A06", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.545Z", "createdAt": "2019-09-05T12:03:59.545Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "text", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d927", "question": ["HoS Name", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A07", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.554Z", "createdAt": "2019-09-05T12:03:59.554Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "text", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d928", "question": ["HoS contact number", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "IsNumber": "true" }, "externalId": "462A08", "tip": "", "hint": "", "responseType": "number", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.562Z", "createdAt": "2019-09-05T12:03:59.562Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "number", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d929", "question": ["Are there any open drains, potholes/ pits inside or outside the school?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A09", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "Outside Area", "updatedAt": "2019-09-05T12:03:59.584Z", "createdAt": "2019-09-05T12:03:59.584Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d92a", "question": ["Can the entrance to school be monitored from the principal’s office?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A10", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.594Z", "createdAt": "2019-09-05T12:03:59.594Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d92b", "question": ["Can visitors walk in directly into the school without supervision?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A11", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.624Z", "createdAt": "2019-09-05T12:03:59.624Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d92c", "question": ["Are important phone numbers displayed?", ""], "options": [{ "value": "R1", "label": "SMC members" }, { "value": "R2", "label": "Child Line" }, { "value": "R3", "label": "Ambulance" }, { "value": "R4", "label": "Police officer/Local Police Station" }, { "value": "R5", "label": "Doctor/Hospital" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "462A12", "tip": "Tick whichever is displayed.", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.637Z", "createdAt": "2019-09-05T12:03:59.637Z", "__v": 0, "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "multiselect", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d92d", "question": ["Are nursery classes (if applicable) situated on the ground floor?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A13", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.646Z", "createdAt": "2019-09-05T12:03:59.646Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d92e", "question": ["Is the drinking water area clean?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "462A14", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "Water and Cleanliness", "updatedAt": "2019-09-05T12:03:59.656Z", "createdAt": "2019-09-05T12:03:59.656Z", "__v": 0, "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d92f", "question": ["Does the school have filtered drinking water facility?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "462A15", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.664Z", "createdAt": "2019-09-05T12:03:59.664Z", "__v": 0, "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d930", "question": ["Is the water tank clean? Ensure it does not  have mud, algae , dead insects.", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "462A16", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.671Z", "createdAt": "2019-09-05T12:03:59.671Z", "__v": 0, "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d931", "question": ["Are the toilets clean overall?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A17", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "Toilets", "updatedAt": "2019-09-05T12:03:59.681Z", "createdAt": "2019-09-05T12:03:59.681Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d932", "question": ["Is there a soap/ hand-wash in the toilet?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A18", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.688Z", "createdAt": "2019-09-05T12:03:59.688Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d933", "question": ["Is there running water supply in the toilet?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A19", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.698Z", "createdAt": "2019-09-05T12:03:59.698Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d934", "question": ["Are the cisterns/flush functional?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "462A20", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.706Z", "createdAt": "2019-09-05T12:03:59.706Z", "__v": 0, "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d935", "question": ["Is the first-aid box fully equipped? (Check expiry date)", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "462A21", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "Medical Facility", "updatedAt": "2019-09-05T12:03:59.713Z", "createdAt": "2019-09-05T12:03:59.713Z", "__v": 0, "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d936", "question": ["Does the school have a designated vehicle for emergency situations?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A22", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.723Z", "createdAt": "2019-09-05T12:03:59.723Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d937", "question": ["Are the corners of corridors and walls clean?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "462A23", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "Overall cleanliness", "updatedAt": "2019-09-05T12:03:59.733Z", "createdAt": "2019-09-05T12:03:59.733Z", "__v": 0, "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d938", "question": ["Are there abandoned objects lying in any corner of the school?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "462A24", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.741Z", "createdAt": "2019-09-05T12:03:59.741Z", "__v": 0, "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d939", "question": ["Does the MCD pick up garbage from school everyday?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "462A25", "tip": "", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.751Z", "createdAt": "2019-09-05T12:03:59.751Z", "__v": 0, "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d93a", "question": ["Do you see students fighting or misbehaving during lunch break?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A26", "tip": "Speak to 1 group (3-6 students from class 3/4/5) of students by random selection and ask the questions given below:", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "Group Interview", "updatedAt": "2019-09-05T12:03:59.760Z", "createdAt": "2019-09-05T12:03:59.760Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d93b", "question": ["What do teachers do when such things happen?", ""], "options": [{ "value": "R1", "label": "Separate students fighting/misbehaving" }, { "value": "R2", "label": "Talk to students fighting" }, { "value": "R3", "label": "Punish both students" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A27", "tip": "Speak to 1 group (3-6 students from class 3/4/5) of students by random selection and ask the questions given below:", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.769Z", "createdAt": "2019-09-05T12:03:59.769Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "multiselect", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d93c", "question": ["Do some students bully others in school?", ""], "options": [{ "value": "R1", "label": "Yes" }, { "value": "R2", "label": "No" }, { "value": "R3", "label": "Partially" }, { "value": "R4", "label": "Not Applicable" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A28", "tip": "Speak to 1 group (3-6 students from class 3/4/5) of students by random selection and ask the questions given below:", "hint": "", "responseType": "radio", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.777Z", "createdAt": "2019-09-05T12:03:59.777Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "radio", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d93d", "question": ["What kinds of punishments are given to children who misbehave / don’t do homework etc?", ""], "options": [{ "value": "R1", "label": "Hitting with hand" }, { "value": "R2", "label": "Hitting with stick/scale" }, { "value": "R3", "label": "Standing inside/outside class" }, { "value": "R4", "label": "Students made to stand in different positions" }, { "value": "R5", "label": "Student(s) made to stand/run in the sun" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "462A29", "tip": "Speak to 1 group (3-6 students from class 3/4/5) of students by random selection and ask the questions given below:", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.784Z", "createdAt": "2019-09-05T12:03:59.784Z", "__v": 0, "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "multiselect", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d93e", "question": ["What happens when a child is hurt?", ""], "options": [{ "value": "R1", "label": "Taken to medical room" }, { "value": "R2", "label": "Sent home/parents called" }, { "value": "R3", "label": "Sent to hospital/dispensary" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "462A30", "tip": "Speak to 1 group (3-6 students from class 3/4/5) of students by random selection and ask the questions given below:", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.790Z", "createdAt": "2019-09-05T12:03:59.790Z", "__v": 0, "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "multiselect", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d93f", "question": ["Call 5 students of class 3/4/5 (randomly). Ask them to read a text from their Hindi books and record the count of students who could read it.", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "IsNumber": "true" }, "externalId": "462A31", "tip": "1 error is allowed; self-correction is allowed", "hint": "", "responseType": "number", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "Individual Interaction", "updatedAt": "2019-09-05T12:03:59.799Z", "createdAt": "2019-09-05T12:03:59.799Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "number", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d70f9af7afa105d7d66d940", "question": ["Please record your overall comments on the state of the following in the school: \n1. Corporal punishment \n2. Bullying \n3. Reading level in school", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "462A32", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": true, "rubricLevel": "", "sectionHeader": "Feedback", "updatedAt": "2019-09-05T12:03:59.806Z", "createdAt": "2019-09-05T12:03:59.806Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "text", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "instanceIdentifier": "Observation", "externalId": "462A01", "tip": "", "hint": "", "responseType": "matrix", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-05T12:03:59.807Z", "createdAt": "2019-09-05T12:03:59.473Z", "__v": 0, "file": "", "evidenceMethod": "OBSERVATION", "payload": { "criteriaId": "5d70f93a7afa105d7d66d91f", "responseType": "matrix", "evidenceMethod": "OBSERVATION", "rubricLevel": "" }, "startTime": 1608632601066, "endTime": "", "gpsLocation": "" }

              , { "_id": "5d7ddbc6e3be8677c3fee053", "question": ["How does the school monitor and ensure student attendance?", ""], "options": [{ "value": "R1", "label": "Teachers maintain a daily attendance register" }, { "value": "R2", "label": "Teachers identify students who are often absent" }, { "value": "R3", "label": "Teachers frequently update student attendance on school notice boards" }, { "value": "R4", "label": "HM/teachers inform parents about student attendance" }, { "value": "R5", "label": "Teachers find reasons for long and frequent absence and discuss with students and parents" }, { "value": "R6", "label": "Teachers talk to parents and students about effects of absenteeism on learning" }, { "value": "R7", "label": "HM & Teachers meet frequently to analyze specific reasons of high absence rates" }, { "value": "R8", "label": "SDMC and parents co-create ways to decrease high absence rates" }, { "value": "R9", "label": "School appreciates students with high attendances on a regular basis" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460-CSQ022", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:35:50.471Z", "createdAt": "2019-09-15T06:35:50.471Z", "__v": 0, "file": "", "evidenceMethod": "LPAD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee046", "responseType": "multiselect", "evidenceMethod": "LPAD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7ddbc6e3be8677c3fee054", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460-CSQ023", "tip": "Examples of evidences: Student attendance records; Images of notice boards; Minutes of meetings with parents; Attendance improvement plans; Record of reasons for absenteeism; Records of home visits made by teachers for long absentees", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:35:50.495Z", "createdAt": "2019-09-15T06:35:50.495Z", "__v": 0, "evidenceMethod": "LPAD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee046", "responseType": "slider", "evidenceMethod": "LPAD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7ddbc6e3be8677c3fee055", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460-CSQ024", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:35:50.531Z", "createdAt": "2019-09-15T06:35:50.531Z", "__v": 0, "file": "", "evidenceMethod": "LPAD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee046", "responseType": "text", "evidenceMethod": "LPAD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7ddbc6e3be8677c3fee056", "question": ["How well do students take part in classroom and school activities?", ""], "options": [{ "value": "R1", "label": "Students sit quietly and listen to the teacher during the classes" }, { "value": "R2", "label": "School organizes all Govt. mandated school functions and activities" }, { "value": "R3", "label": "School has a student team to participate in school functions and activities" }, { "value": "R4", "label": "Classrooms have a set of active students" }, { "value": "R5", "label": "School organizes cultural and academic activities of its own and encourages many students to participate" }, { "value": "R6", "label": "Students frequently have classroom discussions with teachers and peers" }, { "value": "R7", "label": "School helps students in identifying and developing their talents by organizing events" }, { "value": "R8", "label": "All students actively participate in all school functions and activities" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460-CSQ025", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:35:50.575Z", "createdAt": "2019-09-15T06:35:50.575Z", "__v": 0, "file": "", "evidenceMethod": "LPAD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee047", "responseType": "multiselect", "evidenceMethod": "LPAD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7ddbc6e3be8677c3fee057", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460-CSQ026", "tip": "Examples of evidences: List of functions, events and other activities organized in the school; records of student participation in co-curricular activities", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:35:50.584Z", "createdAt": "2019-09-15T06:35:50.584Z", "__v": 0, "evidenceMethod": "LPAD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee047", "responseType": "slider", "evidenceMethod": "LPAD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }], "name": "Survey Questions"
          }], "externalId": "LPAD", "tip": "Some tip at evidence level.", "name": "Learners' Progress, Attainment and Development", "description": "Some description about evidence", "modeOfCollection": "onfield", "canBeNotApplicable": false, "notApplicable": false, "canBeNotAllowed": true, "remarks": "", "isActive": true, "startTime": "", "endTime": "", "isSubmitted": false, "submissions": []
        }, { "code": "MTPD", "sections": [{ "code": "SQ", "questions": [{ "_id": "5d7de3e1e3be8677c3fee074", "question": ["How are new teachers inducted in schools?", ""], "options": [{ "value": "R1", "label": "New teachers understand the school facilities by observing ongoing practices" }, { "value": "R2", "label": "HM introduces the new teachers to their roles and responsibilities as well as different facilities available in the school" }, { "value": "R3", "label": "Teachers are involved in orienting new teachers" }, { "value": "R4", "label": "School regularly plans and conducts an introduction program for new teachers which includes learner profiles, curricular expectations, role of SDMC and other Govt. schemes and programmes" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460-MTD01", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.674Z", "createdAt": "2019-09-15T07:10:25.674Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04b", "responseType": "multiselect", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee075", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460-MTD02", "tip": "Examples of evidences: Mention of joining dates for new teachers in the teacher records; session plans for introduction programs", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.684Z", "createdAt": "2019-09-15T07:10:25.684Z", "__v": 0, "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04b", "responseType": "slider", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee076", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460-MTD03", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.693Z", "createdAt": "2019-09-15T07:10:25.693Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04b", "responseType": "text", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee077", "question": ["How does the school promote attendance and punctuality in the teachers?", ""], "options": [{ "value": "R1", "label": "School maintains record of teachers attendance along with the reasons for absence" }, { "value": "R2", "label": "School ensures substitution for classes if teachers are absent" }, { "value": "R3", "label": "HM regularly checks teacher attendance data and follows the Govt. norms for unreported absence" }, { "value": "R4", "label": "School regularly appreciate teachers who are punctual and regular to school" }, { "value": "R5", "label": "The school has processes to address short, long and unreported absences of teachers" }, { "value": "R6", "label": "School takes help from outside the school to substitute classes and supports them for the same" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460-MTD04", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.700Z", "createdAt": "2019-09-15T07:10:25.700Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04c", "responseType": "multiselect", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee078", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460-MTD05", "tip": "Examples of evidences: Teacher attendance register; record of leave applications submitted by teachers; record of notices, suspension letters or any other Govt. documents about teacher absence; record of temporary teachers in school; contact list of possible volunteers to substitute classes in school", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.712Z", "createdAt": "2019-09-15T07:10:25.712Z", "__v": 0, "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04c", "responseType": "slider", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee079", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460-MTD06", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.728Z", "createdAt": "2019-09-15T07:10:25.728Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04c", "responseType": "text", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee07a", "question": ["How are the responsibilities and goals decided for the teachers?", ""], "options": [{ "value": "R1", "label": "School has a time table" }, { "value": "R2", "label": "HM & teachers create an annual plan for syllabus completion and other duties" }, { "value": "R3", "label": "HM explains as well as assigns responsibilities to all teachers" }, { "value": "R4", "label": "HM regularly monitors progress of all the responsibilities of teachers" }, { "value": "R5", "label": "Responsibilities are assigned to teachers after seeking their inputs" }, { "value": "R6", "label": "Teachers set their own performance goals including new ideas" }, { "value": "R7", "label": "Teachers regularly reflect on their progress of their goals" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460-MTD07", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.737Z", "createdAt": "2019-09-15T07:10:25.737Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04d", "responseType": "multiselect", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee07b", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460-MTD08", "tip": "Examples of evidences: School time table; annual plans for teachers; document showing allocation of duties to teachers; school-wide chart/tracker to check teacher progress; document capturing performance goals for teachers; Teacher reflection notes", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.746Z", "createdAt": "2019-09-15T07:10:25.746Z", "__v": 0, "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04d", "responseType": "slider", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee07c", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460-MTD09", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.755Z", "createdAt": "2019-09-15T07:10:25.755Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04d", "responseType": "text", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee07d", "question": ["How do the teachers adapt themselves to curriculum and textbook changes?", ""], "options": [{ "value": "R1", "label": "Teachers read the Govt. documents about curriculum and textbook changes as & when they occur" }, { "value": "R2", "label": "Teachers revise their teaching practices in the event of a curriculum/textbook change" }, { "value": "R3", "label": "HM & teachers discuss about curriculum and textbook changes and alter their lesson plans as well as practices accordingly" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460-MTD10", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.764Z", "createdAt": "2019-09-15T07:10:25.764Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04e", "responseType": "multiselect", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee07e", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460-MTD11", "tip": "Examples of evidences: Record of all Govt. circulars about textbook and curriculum changes; mention for curriculum/textbook changes in teacher annual plans; record of teacher meetings to discuss textbook/curricular changes", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.771Z", "createdAt": "2019-09-15T07:10:25.771Z", "__v": 0, "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04e", "responseType": "slider", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee07f", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460-MTD12", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.780Z", "createdAt": "2019-09-15T07:10:25.780Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04e", "responseType": "text", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee080", "question": ["How do the teachers receive feedback on their teaching practices?", ""], "options": [{ "value": "R1", "label": "HM goes for school rounds to check teacher presence and practice" }, { "value": "R2", "label": "HM regularly maintains an inspection record for teacher performance" }, { "value": "R3", "label": "HM gives feedback to teachers based on classroom practices" }, { "value": "R4", "label": "HM discusses with each teacher about his/her performance based on student progress" }, { "value": "R5", "label": "School collects feedback on teacher performance from students, parents and SDMC members" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460-MTD13", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.787Z", "createdAt": "2019-09-15T07:10:25.787Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04f", "responseType": "multiselect", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee081", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460-MTD14", "tip": "Examples of evidences: Record of routine inspections done by HM or higher authorities in the school; record of feedback given by students, parents and SDMC members from Parents-teachers meetings, annual day, Samudaya Datta Shaale and other events", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.795Z", "createdAt": "2019-09-15T07:10:25.795Z", "__v": 0, "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04f", "responseType": "slider", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee082", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460-MTD15", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.803Z", "createdAt": "2019-09-15T07:10:25.803Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee04f", "responseType": "text", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee083", "question": ["What are the different ways in which teachers develop their knowledge and skills?", ""], "options": [{ "value": "R1", "label": "All teachers attend the mandated In-Service Training Programs" }, { "value": "R2", "label": "School arranges for sessions/trainings from different sources based on teacher needs and interests" }, { "value": "R3", "label": "School maintains record of trainings that teachers have attended" }, { "value": "R4", "label": "Teachers discuss collectively on inputs received during training and application of the same in their classes" }, { "value": "R5", "label": "Teachers receive continuous lesson planning and implementation support including trying innovative ideas" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460-MTD16", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.810Z", "createdAt": "2019-09-15T07:10:25.810Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee050", "responseType": "multiselect", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee084", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460-MTD17", "tip": "Examples of evidences: Record of trainings attended by teachers; record of qualifications/certificates that teachers have earned while in service; record of teacher development needs maintained; annual budget allocation for teacher training", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.819Z", "createdAt": "2019-09-15T07:10:25.819Z", "__v": 0, "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee050", "responseType": "slider", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7de3e1e3be8677c3fee085", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460-MTD18", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T07:10:25.826Z", "createdAt": "2019-09-15T07:10:25.826Z", "__v": 0, "file": "", "evidenceMethod": "MTPD", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee050", "responseType": "text", "evidenceMethod": "MTPD", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }], "name": "Survey Questions" }], "externalId": "MTPD", "tip": "Some tip at evidence level.", "name": "Managing Teacher Performance and Professional Development", "description": "Some description about evidence", "modeOfCollection": "onfield", "canBeNotApplicable": false, "notApplicable": false, "canBeNotAllowed": true, "remarks": "", "isActive": true, "startTime": "", "endTime": "", "isSubmitted": false, "submissions": [] }, { "code": "TLA", "sections": [{ "code": "SQ", "questions": [{ "_id": "5d7dd9ec4558e677d3c1cb3e", "question": ["How well do the teachers know their students?", ""], "options": [{ "value": "R1", "label": "Teachers collect information about student learning levels and their sociocultural and economic background" }, { "value": "R2", "label": "Teachers interact with other teachers to understand the students' level" }, { "value": "R3", "label": "Teachers discuss learning levels and needs of students with parents during parent-teacher meetings and/or home visits" }, { "value": "R4", "label": "Most teachers regularly discuss learning needs, learning style, strengths, etc with students" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460CS013", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.177Z", "createdAt": "2019-09-15T06:27:56.177Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee03d", "responseType": "multiselect", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb3f", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460CS014", "tip": "Examples of evidences: Learners assessment records; Student register/Learners profile; Parent-teacher meeting records; Records of visits of teachers to the homes of learners", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.197Z", "createdAt": "2019-09-15T06:27:56.197Z", "__v": 0, "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee03d", "responseType": "slider", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb40", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460CS015", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.204Z", "createdAt": "2019-09-15T06:27:56.204Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee03d", "responseType": "text", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb41", "question": ["How is subject and pedagogical knowledge of teachers?", ""], "options": [{ "value": "R1", "label": "Teachers go beyond mandatory trainings and make use of other available support and resources like subject forums or digital content to upgrade their subject and pedagogical knowledge" }, { "value": "R2", "label": "Teachers are able to break down and explain difficult topics while teaching students" }, { "value": "R3", "label": "Most teachers take time out on their own to improve on their subject knowledge and teaching style" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460CS016", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.235Z", "createdAt": "2019-09-15T06:27:56.235Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee03e", "responseType": "multiselect", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb42", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460CS017", "tip": "Examples of evidences: Record of Teachers’ participation in in-service trainings, seminars, workshops for TLM development; Classroom observation data; List of journal/ magazines subscribed by the school", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.245Z", "createdAt": "2019-09-15T06:27:56.245Z", "__v": 0, "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee03e", "responseType": "slider", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb43", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460CS018", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.254Z", "createdAt": "2019-09-15T06:27:56.254Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee03e", "responseType": "text", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb44", "question": ["How well do the teachers plan for their teaching?", ""], "options": [{ "value": "R1", "label": "Teachers mention topic or chapter's name at the beginning of the class" }, { "value": "R2", "label": "Teachers maintain a lesson planning diary" }, { "value": "R3", "label": "Lesson plans mention which TLM (Teaching-learning materials) or lab equipments to use" }, { "value": "R4", "label": "Lesson plans include different teaching strategies like exploration, analysis,\ncritical reflection, problem-solving, etc and address different learning needs and styles of students" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460CS019", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.296Z", "createdAt": "2019-09-15T06:27:56.296Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee03f", "responseType": "multiselect", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb45", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460CS020", "tip": "Examples of evidences: Lesson plans; classroom observation data", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.303Z", "createdAt": "2019-09-15T06:27:56.303Z", "__v": 0, "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee03f", "responseType": "slider", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb46", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460CS021", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.324Z", "createdAt": "2019-09-15T06:27:56.324Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee03f", "responseType": "text", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb47", "question": ["How do the teachers create an environment of learning for the students?", ""], "options": [{ "value": "R1", "label": "Teachers always address students by their name" }, { "value": "R2", "label": "Students' work (charts, artwork, projects) are displayed in the classroom" }, { "value": "R3", "label": "Teachers ensure that all learners are involved in the class" }, { "value": "R4", "label": "Teachers usually organise group activities in classrooms" }, { "value": "R5", "label": "Teachers encourage all students to share ideas, ask questions during the class" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460CS022", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.342Z", "createdAt": "2019-09-15T06:27:56.342Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee040", "responseType": "multiselect", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb48", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460CS023", "tip": "Examples of evidences: Classroom observation data; images of classrooms; lesson plans", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.349Z", "createdAt": "2019-09-15T06:27:56.349Z", "__v": 0, "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee040", "responseType": "slider", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb49", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460CS024", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.359Z", "createdAt": "2019-09-15T06:27:56.359Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee040", "responseType": "text", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb4a", "question": ["What does teaching-learning process looks like in the school?", ""], "options": [{ "value": "R1", "label": "Teachers give classwork and homework to students" }, { "value": "R2", "label": "Students' homework and classwork notebooks are corrected and carry teachers' feedback" }, { "value": "R3", "label": "Teachers provide extra learning support to students who need help" }, { "value": "R4", "label": "Students are often engaged in experiments, project work or discussions for self-learning" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460CS025", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.365Z", "createdAt": "2019-09-15T06:27:56.365Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee041", "responseType": "multiselect", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb4b", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460CS026", "tip": "Examples of evidences: Classwork and homework notebooks; lesson plans; remedial teaching plans; classroom observation data", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.373Z", "createdAt": "2019-09-15T06:27:56.373Z", "__v": 0, "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee041", "responseType": "slider", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb4c", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460CS027", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.383Z", "createdAt": "2019-09-15T06:27:56.383Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee041", "responseType": "text", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb4d", "question": ["How do the teachers manage their students?", ""], "options": [{ "value": "R1", "label": "Teachers ensure that students are sitting quietly" }, { "value": "R2", "label": "Students listen to the teacher and follow classroom rules" }, { "value": "R3", "label": "Teachers regularly check for student attendance and punctuality and appreciate students who are regular and punctual" }, { "value": "R4", "label": "Seating arrangements keep in mind students with special needs" }, { "value": "R5", "label": "Seating arrangements are changed according to the subject or activities" }, { "value": "R6", "label": "Teachers and students regularly set classroom rules" }, { "value": "R7", "label": "Students follow the rules by themselves and ensure rules are being followed" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460CS028", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.388Z", "createdAt": "2019-09-15T06:27:56.388Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee042", "responseType": "multiselect", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb4e", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460CS029", "tip": "Examples of evidences: Attendance Registers; classroom observation data; images of classroom", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.395Z", "createdAt": "2019-09-15T06:27:56.395Z", "__v": 0, "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee042", "responseType": "slider", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb4f", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460CS030", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.401Z", "createdAt": "2019-09-15T06:27:56.401Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee042", "responseType": "text", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb50", "question": ["How are student assessments conducted and used by teachers?", ""], "options": [{ "value": "R1", "label": "Teachers conduct assessments as per Govt. guidelines" }, { "value": "R2", "label": "Teachers conduct tests based on textbook content" }, { "value": "R3", "label": "Teachers share individual student report cards with parents" }, { "value": "R4", "label": "Teachers use different methods like projects, activities, etc. to assess curricular areas including arts, health, etc" }, { "value": "R5", "label": "Report cards include detailed feedback on areas of improvement" }, { "value": "R6", "label": "Teachers refer to and analyze past assessment data" }, { "value": "R7", "label": "Teachers frequently talk to students about their strengths and areas of development" }, { "value": "R8", "label": "Teachers use assessment data to change their teaching plans and activities" }, { "value": "R9", "label": "Teachers also assess students' personal and social development" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460CS031", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.408Z", "createdAt": "2019-09-15T06:27:56.408Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee043", "responseType": "multiselect", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb51", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460CS032", "tip": "Examples of evidences: Learners assessment records; Report cards; Assessment/Question papers; Sample reports of projects, experiments, assignments, field trips", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.414Z", "createdAt": "2019-09-15T06:27:56.414Z", "__v": 0, "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee043", "responseType": "slider", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb52", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460CS033", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.420Z", "createdAt": "2019-09-15T06:27:56.420Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee043", "responseType": "text", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb53", "question": ["What kind of teaching-learning materials do the teachers use for their lessons?", ""], "options": [{ "value": "R1", "label": "Teachers use the textbooks to teach" }, { "value": "R2", "label": "Teachers bring or prepare resources in addition to textbooks like models, labs, etc. as and when required" }, { "value": "R3", "label": "School regularly updates a list of TLMs that is shared with the teachers" }, { "value": "R4", "label": "Teachers regularly plan for and teach using TLMs from different sources like Computer lab, library, etc" }, { "value": "R5", "label": "School shares resources like TLM, teaching plans, etc. with other schools" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460CS034", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.425Z", "createdAt": "2019-09-15T06:27:56.425Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee044", "responseType": "multiselect", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb54", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460CS035", "tip": "Examples of evidences: Classroom observation data; images of sample teaching-learning materials; list of teaching-learning materials; lesson plans", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.447Z", "createdAt": "2019-09-15T06:27:56.447Z", "__v": 0, "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee044", "responseType": "slider", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb55", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460CS036", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.453Z", "createdAt": "2019-09-15T06:27:56.453Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee044", "responseType": "text", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb56", "question": ["How do the teachers look back or reflect on their teaching practices?", ""], "options": [{ "value": "R1", "label": "Teachers reflect on their practices" }, { "value": "R2", "label": "Teachers regularly maintain a record of their reflections on their practices" }, { "value": "R3", "label": "Teachers refer to their reflections while planning for lessons" }, { "value": "R4", "label": "Teachers frequently meet to share reflections about their lessons and students' responses" }, { "value": "R5", "label": "Teachers collectively plan for improvement in teaching based on their reflections and make alternate strategies" }], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true }, "externalId": "460CS037", "tip": "Select the practices which apply to your school", "hint": "", "responseType": "multiselect", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.458Z", "createdAt": "2019-09-15T06:27:56.458Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee045", "responseType": "multiselect", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb57", "question": ["Based on above practices, select a rating for the school in this core standard, and attach relevant evidences:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": true, "max": "3", "min": "0" }, "file": { "required": true, "type": ["image/jpeg"], "minCount": 0, "maxCount": 10 }, "externalId": "460CS038", "tip": "Examples of evidences: Minutes of staff meetings; Records of reflection notes of teachers", "hint": "", "responseType": "slider", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.463Z", "createdAt": "2019-09-15T06:27:56.463Z", "__v": 0, "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee045", "responseType": "slider", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }, { "_id": "5d7dd9ec4558e677d3c1cb58", "question": ["Comments and reflections:", ""], "options": [], "children": [], "questionGroup": ["A1"], "fileName": [], "instanceQuestions": [], "deleted": false, "remarks": "", "value": "", "usedForScoring": "", "questionType": "auto", "canBeNotApplicable": "false", "isCompleted": false, "visibleIf": "", "validation": { "required": false }, "externalId": "460CS039", "tip": "", "hint": "", "responseType": "text", "modeOfCollection": "onfield", "accessibility": "No", "showRemarks": false, "rubricLevel": "", "sectionHeader": "", "updatedAt": "2019-09-15T06:27:56.469Z", "createdAt": "2019-09-15T06:27:56.469Z", "__v": 0, "file": "", "evidenceMethod": "TLA", "payload": { "criteriaId": "5d7dbfb6e3be8677c3fee045", "responseType": "text", "evidenceMethod": "TLA", "rubricLevel": "" }, "startTime": "", "endTime": "", "gpsLocation": "" }], "name": "Survey Questions" }], "externalId": "TLA", "tip": "Some tip at evidence level.", "name": "Teaching, Learning and Assessment", "description": "Some description about evidence", "modeOfCollection": "onfield", "canBeNotApplicable": false, "notApplicable": false, "canBeNotAllowed": true, "remarks": "", "isActive": true, "startTime": "", "endTime": "", "isSubmitted": false, "submissions": [] }], "submissions": {}
      }
    }


    this.localStorage.setLocalStorage(key, obj).then(success => {
      this.router.navigateByUrl(`${RouterLinks.QUESTIONNAIRE}/5fd9f2d0c91909226f7ec649/0/0`)
    })
  }

}
