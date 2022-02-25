import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttachmentListingPageRoutingModule } from './attachment-listing-routing.module';

import { AttachmentListingPage } from './attachment-listing.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttachmentListingPageRoutingModule
  ],
  declarations: [AttachmentListingPage]
})
export class AttachmentListingPageModule {}
