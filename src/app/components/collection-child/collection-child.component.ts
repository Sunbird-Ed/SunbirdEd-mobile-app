import { Location } from '@angular/common';
import { Component, Input, NgZone, OnInit } from '@angular/core';
import { MimeType, RouterLinks, EventTopics } from '@app/app/app.constant';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { ComingSoonMessageService } from '@app/services/coming-soon-message.service';
import { PopoverController } from '@ionic/angular';
import { Events } from '@app/util/events';
import { SbGenericPopoverComponent } from '@app/app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { Content, TelemetryObject, Rollup, ContentStateResponse } from 'sunbird-sdk';
import { Router, NavigationExtras } from '@angular/router';
import { TextbookTocService } from '@app/app/collection-detail-etb/textbook-toc-service';
import {
  Environment,
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';
import { ContentUtil } from '@app/util/content-util';
import { AddActivityToGroup } from '../../my-groups/group.interface';
import { NavigationService } from '@app/services/navigation-handler.service';
import { CsPrimaryCategory } from '@project-sunbird/client-services/services/content';

@Component({
  selector: 'app-collection-child',
  templateUrl: './collection-child.component.html',
  styleUrls: ['./collection-child.component.scss'],
})
export class CollectionChildComponent implements OnInit {
  cardData: any;
  parentId: any;
  // isTextbookTocPage: Boolean = false;
  @Input() childData: Content;
  @Input() index: any;
  @Input() depth: any;
  @Input() corRelationList: any;
  @Input() isDepthChild: any;
  @Input() breadCrumb: any;
  @Input() defaultAppIcon: string;
  @Input() localImage: string;
  @Input() activeMimeTypeFilter: any;
  @Input() rootUnitId: any;
  @Input() isTextbookTocPage: boolean;
  @Input() bookID: string;
  @Input() isEnrolled: boolean;
  @Input() fromCourseToc: boolean;
  @Input() isBatchNotStarted: boolean;
  @Input() updatedCourseCardData: boolean;
  @Input() stckyUnitTitle: string;
  @Input() stckyindex: string;
  @Input() latestParentName: string;
  @Input() latestParentNodes: any;
  @Input() batch: any;
  @Input() renderLevel: number;
  @Input() contentStatusData: ContentStateResponse;
  @Input() addActivityToGroupData: AddActivityToGroup;

  public telemetryObject: TelemetryObject;
  public objRollup: Rollup;
  collectionChildIcon: any;
  sameHierarchy: boolean;
  assessemtnAlert: HTMLIonPopoverElement;

  get isContentCompleted(): boolean {
    if (this.contentStatusData && this.isEnrolled) {
      return !!this.contentStatusData.contentList.find(c => c.contentId === this.childData.identifier
        && c.status === 2);
    }

    return false;
  }

  constructor(
    private zone: NgZone,
    private commonUtilService: CommonUtilService,
    private popoverCtrl: PopoverController,
    private comingSoonMessageService: ComingSoonMessageService,
    private router: Router,
    private textbookTocService: TextbookTocService,
    private telemetryService: TelemetryGeneratorService,
    private location: Location,
    private events: Events,
    private navService: NavigationService
  ) { }

  ngOnInit(): void {
    this.collectionChildIcon = ContentUtil.getAppIcon(this.childData.contentData.appIcon, this.childData.basePath,
      this.commonUtilService.networkInfo.isNetworkAvailable);
    if (this.latestParentName) {
      this.checkHierarchy();
    }
    this.telemetryObject = ContentUtil.getTelemetryObject(this.childData);
  }

  private checkHierarchy() {
    if (this.childData.hierarchyInfo && this.latestParentNodes[this.stckyindex].hierarchyInfo &&
      this.childData.hierarchyInfo.length === this.latestParentNodes[this.stckyindex].hierarchyInfo.length) {
      for (let i = 0; i < this.childData.hierarchyInfo.length; i++) {
        if (this.childData.hierarchyInfo[i]['identifier'] === this.latestParentNodes[this.stckyindex].hierarchyInfo[i]['identifier']) {
          this.sameHierarchy = true;
          if (this.latestParentName === this.childData.contentData.name) {
            this.events.publish(EventTopics.TOC_COLLECTION_CHILD_ID, { id: this.childData.identifier });
          }
        } else {
          this.sameHierarchy = false;
          break;
        }
      }
    } else {
      this.sameHierarchy = false;
    }
  }

  setContentId(id: string, collection?) {
    if (this.router.url.indexOf(RouterLinks.TEXTBOOK_TOC) !== -1) {
      const values = {
        unitClicked: id
      };
      this.telemetryService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.SUBUNIT_CLICKED,
        Environment.HOME,
        PageId.TEXTBOOK_TOC,
        this.telemetryObject,
        values,
        this.objRollup,
        this.corRelationList
      );
      this.textbookTocService.setTextbookIds({ rootUnitId: this.rootUnitId, contentId: id, unit: collection, content: collection });
      this.location.back();
    }
  }

  navigateToDetailsPage(content: Content, depth) {
    if (this.router.url.indexOf(RouterLinks.TEXTBOOK_TOC) !== -1) {
      const values = {
        contentClicked: content.identifier
      };
      this.telemetryService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.CONTENT_CLICKED,
        Environment.HOME,
        PageId.TEXTBOOK_TOC, this.telemetryObject,
        values,
        this.objRollup, this.corRelationList
      );
      this.textbookTocService.setTextbookIds({ rootUnitId: this.rootUnitId, contentId: content.identifier });
      this.location.back();
    } else if (!this.isEnrolled && this.router.url.indexOf(RouterLinks.ENROLLED_COURSE_DETAILS) !== -1) {
      this.events.publish('courseToc:content-clicked', { isBatchNotStarted: this.isBatchNotStarted, isEnrolled: this.isEnrolled });
    } else if (this.isEnrolled && this.isBatchNotStarted && this.router.url.indexOf(RouterLinks.ENROLLED_COURSE_DETAILS) !== -1) {
      this.events.publish('courseToc:content-clicked', { isBatchNotStarted: this.isBatchNotStarted, isEnrolled: this.isEnrolled });
    } else {
      const values = {
        contentClicked: content.identifier
      };
      this.zone.run(async () => {
        switch (ContentUtil.isTrackable(content)) {
          case 0:
            this.isDepthChild = true;
            const collectionDetailsParams: NavigationExtras = {
              state: {
                content,
                depth,
                corRelation: this.corRelationList,
                breadCrumb: this.breadCrumb
              }
            };
            this.navService.navigateToCollection(collectionDetailsParams.state);
            break;
          default:
            const goToContentDetails = () => {
              this.textbookTocService.setTextbookIds({ rootUnitId: this.rootUnitId, contentId: content.identifier });

              this.telemetryService.generateInteractTelemetry(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                Environment.HOME,
                PageId.COLLECTION_DETAIL, this.telemetryObject,
                values, this.objRollup, this.corRelationList
              );
              const contentDetailsParams: NavigationExtras = {
                state: {
                  isChildContent: true,
                  content,
                  depth,
                  course: this.updatedCourseCardData || undefined,
                  corRelation: this.corRelationList,
                  breadCrumb: this.breadCrumb,
                  ...this.addActivityToGroupData
                }
              };
              this.navService.navigateToContent(contentDetailsParams.state);
            };

            if (content.primaryCategory === CsPrimaryCategory.COURSE_ASSESSMENT.toLowerCase()
              && this.batch && this.batch.status === 2) {
              this.assessemtnAlert = await this.popoverCtrl.create({
                component: SbGenericPopoverComponent,
                componentProps: {
                  sbPopoverHeading: this.commonUtilService.translateMessage(content['status'] ? 'REDO_ASSESSMENT' : 'START_ASSESSMENT'),
                  sbPopoverMainTitle: this.commonUtilService.translateMessage(content['status'] ?
                    'TRAINING_ENDED_REDO_ASSESSMENT' : 'TRAINING_ENDED_START_ASSESSMENT'),
                  actionsButtons: [
                    {
                      btntext: this.commonUtilService.translateMessage('SKIP'),
                      btnClass: 'sb-btn sb-btn-sm  sb-btn-outline-info'
                    }, {
                      btntext: this.commonUtilService.translateMessage(content['status'] ? 'REDO' : 'START'),
                      btnClass: 'popover-color'
                    }
                  ],
                  showHeader: true,
                  icon: null
                },
                cssClass: 'sb-popover sb-dw-delete-popover',
                showBackdrop: false,
                backdropDismiss: false,
                animated: true
              });
              await this.assessemtnAlert.present();
              const { data } = await this.assessemtnAlert.onDidDismiss();
              if (data && data.isLeftButtonClicked === false) {
                goToContentDetails();
              }
            } else {
              goToContentDetails();
            }
            break;
        }
      });
    }
  }

  async showComingSoonPopup(childData: any) {
    const message = await this.comingSoonMessageService.getComingSoonMessage(childData);
    if (childData.contentData.mimeType === MimeType.COLLECTION && !childData.children) {
      const popover = await this.popoverCtrl.create({
        component: SbGenericPopoverComponent,
        componentProps: {
          sbPopoverHeading: this.commonUtilService.translateMessage('CONTENT_COMMING_SOON'),
          sbPopoverMainTitle: message ? this.commonUtilService.translateMessage(message) :
            this.commonUtilService.translateMessage('CONTENT_IS_BEEING_ADDED', { content_name: childData.contentData.name }),
          actionsButtons: [
            {
              btntext: this.commonUtilService.translateMessage('OKAY'),
              btnClass: 'popover-color'
            }
          ],
        },
        cssClass: 'sb-popover warning',
      });
      await popover.present();
    }
  }

  hasMimeType(activeMimeType: string[], mimeType: string, content): boolean {
    if (!activeMimeType) {
      return true;
    } else {
      if (activeMimeType.indexOf('all') > -1) {
        return true;
      }
      return !!activeMimeType.find(m => m === mimeType);
    }
  }


  getMediaIcon(content: Content) {
    const mimeType = content.mimeType;
    if (content.contentData.primaryCategory === CsPrimaryCategory.COURSE_ASSESSMENT) {
      return './assets/imgs/selfassess.svg';
    } else if (mimeType) {
      if (MimeType.DOCS.indexOf(mimeType) !== -1) {
        return './assets/imgs/doc.svg';
      } else if (MimeType.VIDEO.indexOf(mimeType) !== -1) {
        return './assets/imgs/play.svg';
      } else {
        return './assets/imgs/touch.svg';
      }
    } else {
      return './assets/imgs/touch.svg';
    }
  }

  playContent(content: Content) {
    this.events.publish(EventTopics.CONTENT_TO_PLAY, { content });
  }
}
