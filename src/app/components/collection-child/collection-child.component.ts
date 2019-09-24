import { Location } from '@angular/common';
import { Component, Input, NgZone, OnInit, Output, EventEmitter } from '@angular/core';
import { ContentType, MimeType, RouterLinks } from '@app/app/app.constant';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { ComingSoonMessageService } from '@app/services/coming-soon-message.service';
import { PopoverController, Events } from '@ionic/angular';
import { SbGenericPopoverComponent } from '@app/app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { Content } from 'sunbird-sdk';
import { Router, NavigationExtras } from '@angular/router';
import { TextbookTocService } from '@app/app/collection-detail-etb/textbook-toc-service';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';
import { ContentUtil } from '@app/util/content-util';

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
  collectionChildIcon: any;

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
  ) { }

  ngOnInit(): void {
    this.collectionChildIcon = ContentUtil.getAppIcon(this.childData.contentData.appIcon, this.childData.basePath,
        this.commonUtilService.networkInfo.isNetworkAvailable);
}

  setContentId(id: string) {
    console.log('extractedUrl', this.router);

    if (this.router.url.indexOf(RouterLinks.TEXTBOOK_TOC) !== -1) {
      const values = new Map();
      values['unitClicked'] = id;
      // values['parentId'] = this.parentId;
      this.telemetryService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.SUBUNIT_CLICKED,
        Environment.HOME,
        PageId.TEXTBOOK_TOC,
        undefined,
        values
      );
      this.textbookTocService.setTextbookIds({ rootUnitId: this.rootUnitId, contentId: id });
      this.location.back();
    }
  }
  navigateToDetailsPage(content: Content, depth) {
    if (this.router.url.indexOf(RouterLinks.TEXTBOOK_TOC) !== -1) {
      const values = new Map();
      values['contentClicked'] = content.identifier;
      // values['parentId'] = this.parentId;
      this.telemetryService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.CONTENT_CLICKED,
        Environment.HOME,
        PageId.TEXTBOOK_TOC, undefined,
        values
      );
      this.textbookTocService.setTextbookIds({ rootUnitId: this.rootUnitId, contentId: content.identifier });
      this.location.back();
    } else if (!this.isEnrolled && this.router.url.indexOf(RouterLinks.ENROLLED_COURSE_DETAILS) !== -1) {
      this.events.publish('courseToc:content-clicked');
    } else {
      //   migration-TODO : remove unnecessary
      //   const stateData = this.navParams.get('contentState');
      const values = new Map();
      values['contentClicked'] = content.identifier;
      // values['parentId'] = this.bookID;
      this.zone.run(() => {
        if (content.contentType === ContentType.COURSE) {
          //   migration-TODO : remove unnecessary
          // this.navCtrl.push(EnrolledCourseDetailsPage, {
          //   content: content,
          //   depth: depth,
          //   contentState: stateData,
          //   corRelation: this.corRelationList,
          //   breadCrumb: this.breadCrumb
          // });
        } else if (content.mimeType === MimeType.COLLECTION) {
          this.isDepthChild = true;
          const collectionDetailsParams: NavigationExtras = {
            state: {
              content,
              depth,
              // migration-TODO : remove unnece
              // contentState: stateData,
              corRelation: this.corRelationList,
              breadCrumb: this.breadCrumb
            }
          };
          this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], collectionDetailsParams);
        } else {
          console.log('go to content details');
          this.textbookTocService.setTextbookIds({ rootUnitId: this.rootUnitId, contentId: content.identifier });

          this.telemetryService.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.CONTENT_CLICKED,
            Environment.HOME,
            PageId.COLLECTION_DETAIL, undefined,
            values
          );
          const contentDetailsParams: NavigationExtras = {
            state: {
              isChildContent: true,
              content,
              depth,
              // migration-TODO : remove unnece
              // contentState: stateData,
              corRelation: this.corRelationList,
              breadCrumb: this.breadCrumb
            }
          };
          this.router.navigate([RouterLinks.CONTENT_DETAILS], contentDetailsParams);
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
            this.commonUtilService.translateMessage('CONTENT_IS_BEEING_ADDED') + childData.contentData.name,
          actionsButtons: [
            {
              btntext: this.commonUtilService.translateMessage('OKAY'),
              btnClass: 'popover-color'
            }
          ],
        },
        cssClass: 'sb-popover warning',
      });
      popover.present();
    }
  }

  hasMimeType(activeMimeType: string[], mimeType: string, content): boolean {
    if (!activeMimeType) {
      return true;
    } else {
      if (activeMimeType.indexOf('all') > -1) {
        // if (content.contentData.mimeType === MimeType.COLLECTION && !content.children) {
        //     return false;
        // }
        return true;
      }
      return !!activeMimeType.find(m => m === mimeType);
    }
  }
  // course-toc: for showing respective contenttype icons
  getContentTypeIcon(content: Content) {
    const contentType = content.mimeType;
    if (contentType) {
      if (MimeType.DOCS.indexOf(contentType) !== -1) {
        return './assets/imgs/doc.svg';
      } else if (MimeType.VIDEO.indexOf(contentType) !== -1) {
        return './assets/imgs/play.svg';
      } else {
        return './assets/imgs/touch.svg';
      }
    } else {
      return './assets/imgs/touch.svg';
    }
  }
}
