import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscussionUiModule } from '@project-sunbird/discussions-ui-v8'

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
export class DiscussionForumModule { }
