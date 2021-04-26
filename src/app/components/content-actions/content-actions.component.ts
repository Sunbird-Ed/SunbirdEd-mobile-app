import { Component, Inject } from '@angular/core';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { ContentUtil } from '@app/util/content-util';
import { NavParams, PopoverController, ToastController } from '@ionic/angular';
import { Events } from '@app/util/events';
import { TranslateService } from '@ngx-translate/core';
import {
  AuthService,
  ContentDeleteResponse,
  ContentDeleteStatus,
  ContentService,
  CorrelationData,
  OAuthSession,
  Rollup
} from 'sunbird-sdk';
import { CommonUtilService } from '../../../services/common-util.service';
import { Environment, InteractSubtype, InteractType } from '../../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { SbPopoverComponent } from '../popups/sb-popover/sb-popover.component';
import { PageId } from './../../../services/telemetry-constants';

@Component({
  selector: 'app-content-actions',
  templateUrl: './content-actions.component.html',
  styleUrls: ['./content-actions.component.scss']
})
export class ContentActionsComponent {

  content: any;
  chapter: any;
  downloadIdentifiers: any;
  data: any;
  isChild = false;
  contentId: string;
  batchDetails: any;
  backButtonFunc = undefined;
  userId = '';
  pageName = '';
  showFlagMenu = true;
  showChapterActions = false;
  public objRollup: Rollup;
  private corRelationList: Array<CorrelationData>;
  showUnenrolledButton = false;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private events: Events,
    private translate: TranslateService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private fileSizePipe: FileSizePipe,
    private popOverCtrl: PopoverController
  ) {
    this.content = this.navParams.get('content');
    this.data = this.navParams.get('data');
    this.batchDetails = this.navParams.get('batchDetails');
    this.pageName = this.navParams.get('pageName');
    this.objRollup = this.navParams.get('objRollup');
    this.corRelationList = this.navParams.get('corRelationList');
    this.chapter = this.navParams.get('chapter');
    this.downloadIdentifiers = this.navParams.get('downloadIdentifiers');

    if (this.navParams.get('isChild')) {
      this.isChild = true;
    }
    if (this.pageName === PageId.CHAPTER_DETAILS) {
      this.showChapterActions = true;
    }

    this.contentId = (this.content && this.content.identifier) ? this.content.identifier : '';
    this.getUserId();
    this.isCourseCompleted();
  }


  getUserId() {
    this.authService.getSession().subscribe((session: OAuthSession) => {
      if (!session) {
        this.userId = '';
      } else {
        this.userId = session.userToken ? session.userToken : '';
        // Needed: this get executed if user is on course details page.
        if (this.pageName === 'course' && this.userId) {
          // If course is not enrolled then hide flag/report issue menu.
          // If course has batchId then it means it is enrolled course
          this.showFlagMenu = !!this.content.batchId;
        }
      }
    });
  }

  /**
   * Construct content delete request body
   */
  getDeleteRequestBody() {
    return {
      contentDeleteList: [{
        contentId: this.contentId,
        isChildContent: this.isChild
      }]
    };
  }

  /**
   * Close popover
   */
  async close(i) {
    switch (i) {
      case 0: {
        const confirm = await this.popOverCtrl.create({
          component: SbPopoverComponent,
          componentProps: {
            content: this.content,
            objRollup: this.objRollup,
            corRelationList: this.corRelationList,
            sbPopoverHeading: this.commonUtilService.translateMessage('REMOVE_FROM_DEVICE'),
            sbPopoverMainTitle: this.content.name,
            actionsButtons: [
              {
                btntext: this.commonUtilService.translateMessage('REMOVE'),
                btnClass: 'popover-color'
              },
            ],
            icon: null,
            metaInfo: '(' + this.fileSizePipe.transform(this.content.size, 2) + ')',
            sbPopoverContent: 'Are you sure you want to delete ?'
          },
          cssClass: 'sb-popover danger',
        });
        await confirm.present();
        const { data } = await confirm.onDidDismiss();

        if (data && data.canDelete) {
          this.deleteContent();
        }
        break;
      }
      case 1: {
        this.popOverCtrl.dismiss();
        break;
      }
    }
  }

  /*
   * shows alert to confirm unenroll send back user selection */
  async unenroll() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.UNENROL_CLICKED,
      Environment.HOME,
      this.pageName,
      ContentUtil.getTelemetryObject(this.content),
      undefined,
      this.objRollup,
      this.corRelationList);
    this.popOverCtrl.dismiss({ unenroll: true });
  }

  async download() {
    this.popOverCtrl.dismiss({ download: true });
  }

  async share() {
    this.popOverCtrl.dismiss({ share: true });
  }

  async deleteContent() {

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DELETE_CLICKED,
      Environment.HOME,
      this.pageName,
      ContentUtil.getTelemetryObject(this.content),
      undefined,
      this.objRollup,
      this.corRelationList);

    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.contentService.deleteContent(this.getDeleteRequestBody()).toPromise()
      .then(async (data: ContentDeleteResponse[]) => {
        await loader.dismiss();
        if (data && data[0].status === ContentDeleteStatus.NOT_FOUND) {
          this.showToaster(this.getMessageByConstant('CONTENT_DELETE_FAILED'));
        } else {
          // Publish saved resources update event
          this.events.publish('savedResources:update', {
            update: true
          });
          console.log('delete response: ', data);
          this.showToaster(this.getMessageByConstant('MSG_RESOURCE_DELETED'));
          this.popOverCtrl.dismiss({ isDeleted: true });
        }
      }).catch(async (error: any) => {
        await loader.dismiss();
        console.log('delete response: ', error);
        this.showToaster(this.getMessageByConstant('CONTENT_DELETE_FAILED'));
        this.popOverCtrl.dismiss();
      });
  }

  async syncCourseProgress() {

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SYNC_PROGRESS_CLICKED,
      Environment.HOME,
      this.pageName,
      ContentUtil.getTelemetryObject(this.content),
      undefined,
      this.objRollup,
      this.corRelationList);
    this.popOverCtrl.dismiss({ syncProgress: true });
  }


  async showToaster(message) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  getMessageByConstant(constant: string) {
    let msg = '';
    this.translate.get(constant).subscribe(
      (value: any) => {
        msg = value;
      }
    );
    return msg;
  }

  private isCourseCompleted() {
    if (this.content && this.content.progress === 100) {
      if (this.batchDetails && ((this.batchDetails.endDate &&
        (new Date(this.batchDetails.endDate) >= new Date())) || !this.batchDetails.endDate)) {
          this.showUnenrolledButton = true;
      }
    }
  }
}
