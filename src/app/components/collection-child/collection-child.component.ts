import { Component, Input, NgZone, AfterViewInit, OnInit } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
// migration-TODO
// import { EnrolledCourseDetailsPage } from '@app/pages/enrolled-course-details';
import { ContentType, MimeType } from '@app/app/app.constant';

import { CollectionDetailEtbPage } from '../../collection-detail-etb/collection-detail-etb.page';
// migration-TODO
// import { ContentDetailsPage } from '@app/pages/content-details/content-details';

import { CommonUtilService, ComingSoonMessageService } from '../../../services';
import { PopoverController } from '@ionic/angular';
import { SbGenericPopoverComponent } from '../popups/sb-generic-popover/sb-generic-popover.component';
import { Content } from 'sunbird-sdk';

@Component({
  selector: 'app-collection-child',
  templateUrl: './collection-child.component.html',
  styleUrls: ['./collection-child.component.scss'],
})
export class CollectionChildComponent implements OnInit {

  cardData: any;
  @Input() childData: Content;
  @Input() index: any;
  @Input() depth: any;
  @Input() corRelationList: any;
  @Input() isDepthChild: any;
  @Input() breadCrumb: any;

  constructor(
      private navCtrl: NavController,
      private zone: NgZone,
      private navParams: NavParams,
      private commonUtilService: CommonUtilService,
      private popoverCtrl: PopoverController,
      private comingSoonMessageService: ComingSoonMessageService
  ) { this.cardData = this.navParams.get('content'); }

  ngOnInit(): void {
  }

  navigateToDetailsPage(content: Content, depth) {
      const stateData = this.navParams.get('contentState');

      this.zone.run(() => {
          if (content.contentType === ContentType.COURSE) {
              // migration-TODO
              // this.navCtrl.push(EnrolledCourseDetailsPage, {
              //     content: content,
              //     depth: depth,
              //     contentState: stateData,
              //     corRelation: this.corRelationList,
              //     breadCrumb: this.breadCrumb
              // });
          } else if (content.mimeType === MimeType.COLLECTION) {
              this.isDepthChild = true;
              // migration-TODO
              // this.navCtrl.push(CollectionDetailsEtbPage, {
              //     content: content,
              //     depth: depth,
              //     contentState: stateData,
              //     corRelation: this.corRelationList,
              //     breadCrumb: this.breadCrumb
              // });
          } else {
            // migration-TODO
              // this.navCtrl.push(ContentDetailsPage, {
              //     isChildContent: true,
              //     content: content,
              //     depth: depth,
              //     contentState: stateData,
              //     corRelation: this.corRelationList,
              //     breadCrumb: this.breadCrumb
              // });
          }
      });
  }


  async showComingSoonPopup(childData: any) {
      const message = await this.comingSoonMessageService.getComingSoonMessage(childData);
      if (childData.contentData.mimeType === MimeType.COLLECTION && !childData.children) {
          const popover = await  this.popoverCtrl.create({
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
}
