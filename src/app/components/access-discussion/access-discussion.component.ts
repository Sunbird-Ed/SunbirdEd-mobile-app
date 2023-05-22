import {  Component, Inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '../../../app/app.constant';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { Environment, InteractSubtype, PageId } from '../../../services/telemetry-constants';
import { CommonUtilService } from '../../../services/common-util.service';
import { AppHeaderService } from '../../../services/app-header.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { DiscussionTelemetryService } from '../../../services/discussion/discussion-telemetry.service';
import { DiscussionService, InteractType } from '@project-sunbird/sunbird-sdk';

@Component({
    selector: "accessDiscussion",
    templateUrl: './access-discussion.component.html',
    styleUrls: ['./access-discussion.component.scss'],
})
export class AccessDiscussionComponent implements OnInit {
  @Input() fetchForumIdReq: any;
  @Input() createUserReq: any;
  @Output() forumData = new EventEmitter();
  forumDetails;
  isForumEnabled = false;

  constructor(
    @Inject('DISCUSSION_SERVICE') private discussionService: DiscussionService,
    private router: Router,
    private commonUtilService: CommonUtilService,
    private discussionTelemetryService: DiscussionTelemetryService,
    private headerService: AppHeaderService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService
) {}

  ngOnInit() {
    if(this.appGlobalService.isForumEnabled) {
      this.isForumEnabled = true;
    }
    this.fetchForumIds();
  }
  
  fetchForumIds() {
    this.forumDetails = '';
    this.discussionService.getForumIds(this.fetchForumIdReq).toPromise().then(forumDetails => {
        if (forumDetails.result.length) {
            this.forumDetails = forumDetails.result[0];
            this.forumData.emit(this.forumDetails);
            this.isForumEnabled = true;
            this.appGlobalService.isForumEnabled = true;
        } else {
          this.isForumEnabled = false;
          this.appGlobalService.isForumEnabled = false;
        }
    }).catch(error => {
        console.log('error fetchForumIds', error);
    });
  }

  async openDiscussionForum() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH, 
      InteractSubtype.FORUM_ICON_CLICKED,
      Environment.DISCUSSION,
      PageId.GROUP_DETAIL
    );
    await this.headerService.hideHeader();
    this.discussionTelemetryService.contextCdata = [
      {
        id: this.fetchForumIdReq.identifier[0],
        type: this.fetchForumIdReq.type
      }
    ];
    this.discussionService.createUser(this.createUserReq).subscribe(async (response) => {
      const userId = response.result.userId.uid
      const result = [this.forumDetails.cid];
        await this.router.navigate([`/${RouterLinks.DISCUSSION}`], {
        queryParams: {
          categories: JSON.stringify({ result }),
          userId: userId
        }
      });
    }, error => {
      console.log('err in discussionService.createUser', error)
      this.commonUtilService.showToast('SOMETHING_WENT_WRONG')
    });
  }
}