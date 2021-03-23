import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscussionEventsService, DiscussionUiModule } from '@project-sunbird/discussions-ui-v8'
import { DiscussionTelemetryService } from '@app/services/discussion/discussion-telemetry.service';
import { NavigationService } from '@app/services/navigation-handler.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DiscussionUiModule,
  ],
  exports: [
    DiscussionUiModule
  ],
})
export class DiscussionForumModule { 
  constructor(
    private discussionEvents: DiscussionEventsService,
    private discussionTelemetryService: DiscussionTelemetryService,
    private navigationService: NavigationService
  ) {
    this.discussionEvents.telemetryEvent.subscribe(event => {
      this.discussionTelemetryService.logTelemetryEvent(event);
      if(event.action && event.action === 'DF_CLOSE'){
        this.navigationService.navigateToLastUrl();
      }
    });
  }
}
