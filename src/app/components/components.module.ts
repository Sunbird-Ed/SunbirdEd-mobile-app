import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ApplicationHeaderComponent } from './application-header/application-header.component';
import { SignInCardComponent } from './sign-in-card/sign-in-card.component';
import { TextBookCardComponent } from './text-book-card/text-book-card.component';
import { PipesModule } from '../../pipes/pipes.module';
import { ViewAllCardComponent } from './view-all-card/view-all-card.component';
import { PbHorizontalComponent } from './pb-horizontal/pb-horizontal.component';
import { SbGenericPopoverComponent } from './popups/sb-generic-popover/sb-generic-popover.component';
import { SbNoNetworkPopupComponent } from './popups/sb-no-network-popup/sb-no-network-popup.component';
import { SbPopoverComponent } from './popups/sb-popover/sb-popover.component';
import { CollectionChildComponent } from './collection-child/collection-child.component';
import { ContentActionsComponent } from './content-actions/content-actions.component';
import { IonicRatingModule, RatingComponent } from 'ionic4-rating';
import { ContentRatingAlertComponent } from './content-rating-alert/content-rating-alert.component';
import { DetailCardComponent } from './detail-card/detail-card.component';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { DialogPopupComponent } from './popups/dialog-popup/dialog-popup.component';
import { SbDownloadPopupComponent } from './popups/sb-download-popup/sb-download-popup.component';
import { UpgradePopoverComponent } from './popups/upgrade-popover/upgrade-popover.component';
import { EditContactDetailsPopupComponent } from './popups/edit-contact-details-popup/edit-contact-details-popup.component';
import { EditContactVerifyPopupComponent } from './popups/edit-contact-verify-popup/edit-contact-verify-popup.component';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ConfirmAlertComponent } from './confirm-alert/confirm-alert.component';
import { AppRatingAlertComponent } from './rating-alert/rating-alert.component';
import { OverflowMenuComponent } from '../profile/overflow-menu/overflow-menu.component';
import { ReportAlertComponent } from '../reports/report-alert/report-alert.component';
import { ProfileAvatarComponent } from './profile-avatar/profile-avatar.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { AssessmentDetailsComponent } from './assessment-details/assessment-details.component';
import { ViewCreditsComponent } from './popups/view-credits/view-credits.component';
import { SkeletonItemComponent } from './skeleton-item/skeleton-item.component';
import { FilteroptionComponent } from './filteroption/filteroption.component';
import { SbInsufficientStoragePopupComponent } from './popups/sb-insufficient-storage-popup/sb-insufficient-storage-popup';
import { AccountRecoveryInfoComponent } from './popups/account-recovery-id/account-recovery-id-popup.component';
import { EnrollmentDetailsComponent } from './enrollment-details/enrollment-details.component';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';
import { TeacherIdVerificationComponent } from './popups/teacher-id-verification-popup/teacher-id-verification-popup.component';
import { SbSharePopupComponent } from './popups/sb-share-popup/sb-share-popup.component';
import { SbAppSharePopupComponent } from './popups/sb-app-share-popup/sb-app-share-popup.component';
import {ImportPopoverComponent} from './popups/import-popover/import-popover.component';
import {SbProgressLoaderPage} from '@app/app/components/popups/sb-progress-loader/sb-progress-loader.page';
import { CollectionActionsComponent } from './collection-acions/collection-acions.component';
import { MyGroupsPopoverComponent } from './popups/sb-my-groups-popover/sb-my-groups-popover.component';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { ToastNavigationComponent } from './popups/toast-navigation/toast-navigation.component';
import { CommonFormsComponent } from './common-forms/common-forms.component';
import {SbTutorialPopupComponent} from './popups/sb-tutorial-popup/sb-tutorial-popup.component';
import { SbGenericFormPopoverComponent } from './popups/sb-generic-form-popover/sb-generic-form-popover.component';

@NgModule({
  declarations: [
    ApplicationHeaderComponent,
    SignInCardComponent,
    TextBookCardComponent,
    ViewAllCardComponent,
    PbHorizontalComponent,
    SbGenericPopoverComponent,
    SbPopoverComponent,
    SbNoNetworkPopupComponent,
    CollectionChildComponent,
    ContentActionsComponent,
    ContentRatingAlertComponent,
    DetailCardComponent,
    DialogPopupComponent,
    SbDownloadPopupComponent,
    UpgradePopoverComponent,
    EditContactDetailsPopupComponent,
    EditContactVerifyPopupComponent,
    ConfirmAlertComponent,
    AppRatingAlertComponent,
    OverflowMenuComponent,
    ReportAlertComponent,
    ProfileAvatarComponent,
    NotificationItemComponent,
    AssessmentDetailsComponent,
    ViewCreditsComponent,
    SkeletonItemComponent,
    FilteroptionComponent,
    SbInsufficientStoragePopupComponent,
    AccountRecoveryInfoComponent,
    EnrollmentDetailsComponent,
    TeacherIdVerificationComponent,
    SbSharePopupComponent,
    SbAppSharePopupComponent,
    ImportPopoverComponent,
    SbProgressLoaderPage,
    CollectionActionsComponent,
    MyGroupsPopoverComponent,
    ToastNavigationComponent,
    CommonFormsComponent,
    SbTutorialPopupComponent,
    SbGenericFormPopoverComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ReactiveFormsModule,
    PipesModule,
    CommonConsumptionModule,
    IonicRatingModule,
    TranslateModule.forChild(),
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
    EditContactVerifyPopupComponent,
    ConfirmAlertComponent,
    AppRatingAlertComponent,
    ViewCreditsComponent,
    FilteroptionComponent,
    ContentActionsComponent,
    ReportAlertComponent,
    SbInsufficientStoragePopupComponent,
    AccountRecoveryInfoComponent,
    EnrollmentDetailsComponent,
    TeacherIdVerificationComponent,
    SbSharePopupComponent,
    SbAppSharePopupComponent,
    ImportPopoverComponent,
    SbProgressLoaderPage,
    CollectionActionsComponent,
    MyGroupsPopoverComponent,
    ToastNavigationComponent,
    CommonFormsComponent,
    SbTutorialPopupComponent,
    SbGenericFormPopoverComponent
  ],
  exports: [
    ApplicationHeaderComponent,
    SignInCardComponent,
    TextBookCardComponent,
    ViewAllCardComponent,
    PbHorizontalComponent,
    SbGenericPopoverComponent,
    SbPopoverComponent,
    SbNoNetworkPopupComponent,
    CollectionChildComponent,
    ContentActionsComponent,
    ContentRatingAlertComponent,
    DetailCardComponent,
    DialogPopupComponent,
    SbDownloadPopupComponent,
    UpgradePopoverComponent,
    EditContactDetailsPopupComponent,
    ConfirmAlertComponent,
    EditContactVerifyPopupComponent,
    AppRatingAlertComponent,
    ProfileAvatarComponent,
    NotificationItemComponent,
    AssessmentDetailsComponent,
    ViewCreditsComponent,
    SkeletonItemComponent,
    FilteroptionComponent,
    ReportAlertComponent,
    SbInsufficientStoragePopupComponent,
    AccountRecoveryInfoComponent,
    EnrollmentDetailsComponent,
    TeacherIdVerificationComponent,
    SbSharePopupComponent,
    SbAppSharePopupComponent,
    ImportPopoverComponent,
    SbProgressLoaderPage,
    CollectionActionsComponent,
    MyGroupsPopoverComponent,
    ToastNavigationComponent,
    CommonFormsComponent,
    SbTutorialPopupComponent,
    SbGenericFormPopoverComponent
  ],
  providers: [FileSizePipe, FilterPipe,  Keyboard]
})
export class ComponentsModule { }
