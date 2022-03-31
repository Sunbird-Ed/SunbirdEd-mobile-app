import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';

import { AttachmentListingPage } from './attachment-listing.page';

const routes: Routes = [
  {
    path: '',
    component: AttachmentListingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule,CoreModule,SharedModule],
})
export class AttachmentListingPageRoutingModule {}