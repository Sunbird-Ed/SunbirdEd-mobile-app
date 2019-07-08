import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ApplicationHeaderComponent } from './application-header/application-header.component';
import { SignInCardComponent} from './sign-in-card/sign-in-card.component';
import {TextBookCardComponent} from './text-book-card/text-book-card.component';
import {NewCourseCardComponent} from './new-course-card/new-course-card.component';
import { PipesModule } from '../../pipes/pipes.module';
import {ViewAllCardComponent} from './view-all-card/view-all-card.component';
import {ViewMoreCardComponent} from './view-more-card/view-more-card.component';
import {PbHorizontalComponent} from './pb-horizontal/pb-horizontal.component';
import { CourseCardComponent } from './cards/coursecard/coursecard.component';
import { SbGenericPopoverComponent } from './popups/sb-generic-popover/sb-generic-popover.component';
import { SbNoNetworkPopupComponent } from './popups/sb-no-network-popup/sb-no-network-popup.component';
import { SbPopoverComponent } from './popups/sb-popover/sb-popover.component';
import { CollectionChildComponent} from './collection-child/collection-child.component';
import {ContentActionsComponent} from './content-actions/content-actions.component';
import {ContentRatingAlertComponent} from './content-rating-alert/content-rating-alert.component';
import { IonicRatingModule, RatingComponent } from 'ionic4-rating';
import {DetailCardComponent} from './detail-card/detail-card.component';
import { FileSizePipe } from '@app/pipes/file-size/file-size';


@NgModule({
  declarations: [ApplicationHeaderComponent,
    SignInCardComponent,
    TextBookCardComponent,
    NewCourseCardComponent,
    ViewAllCardComponent,
    ViewMoreCardComponent,
    PbHorizontalComponent,
    CourseCardComponent,
    SbGenericPopoverComponent,
    SbPopoverComponent,
    SbNoNetworkPopupComponent,
    CollectionChildComponent,
    ContentActionsComponent,
    ContentRatingAlertComponent,
    DetailCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule.forChild(),
    IonicRatingModule,
  ],
  entryComponents: [
    ApplicationHeaderComponent,
    SignInCardComponent,
    SbGenericPopoverComponent,
    SbPopoverComponent,
    SbNoNetworkPopupComponent,
    ContentRatingAlertComponent
  ],
  exports: [
    ApplicationHeaderComponent,
    SignInCardComponent,
    TextBookCardComponent,
    NewCourseCardComponent,
    ViewAllCardComponent,
    ViewMoreCardComponent,
    PbHorizontalComponent,
    CourseCardComponent,
    SbGenericPopoverComponent,
    SbPopoverComponent,
    SbNoNetworkPopupComponent,
    CollectionChildComponent,
    ContentActionsComponent,
    ContentRatingAlertComponent,
    DetailCardComponent
  ],
  providers: [FileSizePipe]
})
export class ComponentsModule { }
