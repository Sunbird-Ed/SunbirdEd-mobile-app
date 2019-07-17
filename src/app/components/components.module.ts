import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ApplicationHeaderComponent } from './application-header/application-header.component';
import { SignInCardComponent } from './sign-in-card/sign-in-card.component';
import { TextBookCardComponent } from './text-book-card/text-book-card.component';
import { NewCourseCardComponent } from './new-course-card/new-course-card.component';
import { PipesModule } from '../../pipes/pipes.module';
import { ViewAllCardComponent } from './view-all-card/view-all-card.component';
import { ViewMoreCardComponent } from './view-more-card/view-more-card.component';
import { PbHorizontalComponent } from './pb-horizontal/pb-horizontal.component';
import { CourseCardComponent } from './cards/coursecard/coursecard.component';
import { SbGenericPopoverComponent } from './popups/sb-generic-popover/sb-generic-popover.component';
import { SbNoNetworkPopupComponent } from './popups/sb-no-network-popup/sb-no-network-popup.component';
import { SbPopoverComponent } from './popups/sb-popover/sb-popover.component';
import { CollectionChildComponent } from './collection-child/collection-child.component';
import { ContentActionsComponent } from './content-actions/content-actions.component';
import { ContentRatingAlertComponent } from './content-rating-alert/content-rating-alert.component';
import { IonicRatingModule, RatingComponent } from 'ionic4-rating';
import { DetailCardComponent } from './detail-card/detail-card.component';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { DialogPopupComponent } from './dialog-popup/dialog-popup.component';
import { SbDownloadPopupComponent } from './popups/sb-download-popup/sb-download-popup.component';
import { UpgradePopoverComponent } from './popups/upgrade-popover/upgrade-popover.component';
import { EditContactDetailsPopupComponent } from './popups/edit-contact-details-popup/edit-contact-details-popup.component';
import { EditContactVerifyPopupComponent } from './popups/edit-contact-verify-popup/edit-contact-verify-popup.component';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ConfirmAlertComponent } from './confirm-alert/confirm-alert.component';
import { RatingAlertComponent } from './rating-alert/rating-alert.component';
import { OverflowMenuComponent } from '../profile/overflow-menu/overflow-menu.component';
import { ReportAlertComponent } from '../reports/report-alert/report-alert.component';
import { ProfileAvatarComponent } from './profile-avatar/profile-avatar.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';


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
    DetailCardComponent,
    BookmarkComponent,
    DialogPopupComponent,
    SbDownloadPopupComponent,
    UpgradePopoverComponent,
    EditContactDetailsPopupComponent,
    EditContactVerifyPopupComponent,
    ConfirmAlertComponent,
    EditContactDetailsPopupComponent,
    EditContactVerifyPopupComponent,
    RatingAlertComponent,
    OverflowMenuComponent,
    ReportAlertComponent,
    ProfileAvatarComponent,
    NotificationItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ReactiveFormsModule,
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
    ContentRatingAlertComponent,
    DialogPopupComponent,
    UpgradePopoverComponent,
    EditContactDetailsPopupComponent,
    EditContactVerifyPopupComponent
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
    DetailCardComponent,
    BookmarkComponent,
    DialogPopupComponent,
    SbDownloadPopupComponent,
    UpgradePopoverComponent,
    EditContactDetailsPopupComponent,
    EditContactDetailsPopupComponent,
    ConfirmAlertComponent,
    EditContactDetailsPopupComponent,
    EditContactVerifyPopupComponent,
    RatingAlertComponent,
    ProfileAvatarComponent,
    NotificationItemComponent,
    TranslateModule
  ],
  providers: [FileSizePipe, Keyboard]
})
export class ComponentsModule { }
