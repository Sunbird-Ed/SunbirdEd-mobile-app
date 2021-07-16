import {  Component, Inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService, CommonUtilService, Environment, InteractSubtype, PageId, TelemetryGeneratorService } from '@app/services';
import { DiscussionTelemetryService } from '@app/services/discussion/discussion-telemetry.service';
import { NavigationService } from '@app/services/navigation-handler.service';
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

  constructor(
    @Inject('DISCUSSION_SERVICE') private discussionService: DiscussionService,
    private router: Router,
    private commonUtilService: CommonUtilService,
    private discussionTelemetryService: DiscussionTelemetryService,
    private headerService: AppHeaderService,
    private navigationService: NavigationService,
    private telemetryGeneratorService: TelemetryGeneratorService
) {}

  ngOnInit() {
      this.fetchForumIds();
  }
  fetchForumIds() {
    this.forumDetails = '';
    this.discussionService.getForumIds(this.fetchForumIdReq).toPromise().then(forumDetails => {
        if (forumDetails.result.length) {
            this.forumDetails = forumDetails.result[0];
            this.forumData.emit(this.forumDetails);
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
      PageId.GROUP_DETAIL,
      undefined
    );
    this.headerService.hideHeader();
    this.discussionTelemetryService.contextCdata = [
      {
        id: this.fetchForumIdReq.identifier[0],
        type: this.fetchForumIdReq.type
      }
    ];
    this.navigationService.setNavigationUrl(this.router.url);
    this.discussionService.createUser(this.createUserReq).subscribe((response) => {
      const userName = response.result.userName
      const result = [this.forumDetails.cid];
        this.router.navigate([`/${RouterLinks.DISCUSSION}`], {
        queryParams: {
          categories: JSON.stringify({ result }),
          userName: userName
        }
      });
    }, error => {
      console.log('err in discussionService.createUser', error)
      this.commonUtilService.showToast('SOMETHING_WENT_WRONG')
    });
  }
}