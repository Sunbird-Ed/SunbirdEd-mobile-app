import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AttachmentListingPageRoutingModule } from './attachment-listing-routing.module';
import { AttachmentListingPage } from './attachment-listing.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttachmentListingPageRoutingModule,
    TranslateModule.forChild(),
    SharedModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  declarations: [AttachmentListingPage]
})
export class AttachmentListingPageModule {}
