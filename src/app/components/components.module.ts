import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationHeaderComponent } from './application-header/application-header.component';
import { ApplicationHeaderKebabMenuComponent } from './application-header/application-header-kebab-menu.component';
import { SignInCardComponent } from './sign-in-card/sign-in-card.component';
import { PipesModule } from '../../pipes/pipes.module';
import { PbHorizontalComponent } from './pb-horizontal/pb-horizontal.component';
import { SbGenericPopoverComponent } from './popups/sb-generic-popover/sb-generic-popover.component';
import { SbNoNetworkPopupComponent } from './popups/sb-no-network-popup/sb-no-network-popup.component';
import { SbPopoverComponent } from './popups/sb-popover/sb-popover.component';
import { CollectionChildComponent } from './collection-child/collection-child.component';
import { ContentActionsComponent } from './content-actions/content-actions.component';
import { IonicRatingModule } from 'ionic4-rating';
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
import { ProfileAvatarComponent } from './profile-avatar/profile-avatar.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';
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
import { ImportPopoverComponent } from './popups/import-popover/import-popover.component';
import { SbProgressLoaderPage } from '@app/app/components/popups/sb-progress-loader/sb-progress-loader.page';
import { CollectionActionsComponent } from './collection-acions/collection-acions.component';
import { MyGroupsPopoverComponent } from './popups/sb-my-groups-popover/sb-my-groups-popover.component';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { ToastNavigationComponent } from './popups/toast-navigation/toast-navigation.component';
import { CommonFormsComponent } from './common-forms/common-forms.component';
import { SbTutorialPopupComponent } from './popups/sb-tutorial-popup/sb-tutorial-popup.component';
import { SbGenericFormPopoverComponent } from './popups/sb-generic-form-popover/sb-generic-form-popover.component';
import { CourseCompletionPopoverComponent } from './popups/sb-course-completion-popup/sb-course-completion-popup.component';
import { SupportAcknowledgement } from './support-acknowledgement/support-acknowledgement.component';
import { AcknowledgeResponseComponent } from './acknowledge-response/acknowledge-response.component';
import { ExploreBooksSortComponent } from '../resources/explore-books-sort/explore-books-sort.component';
import { AddActivityToGroupComponent } from './add-activity-to-group/add-activity-to-group.component';
import { ConsentPiiPopupComponent } from './popups/consent-pii-popup/consent-pii-popup.component';
import { LicenseCardComponentComponent } from '@app/app/components/license-card-component/license-card-component.component';
import { GroupGuideLinesPopoverComponent } from './popups/group-guidelines-popup/group-guidelines-popup.component';
import {
  ProfileNameConfirmationPopoverComponent
} from './popups/sb-profile-name-confirmation-popup/sb-profile-name-confirmation-popup.component';
import { CopyTraceIdPopoverComponent } from './popups/copy-trace-id-popup.ts/copy-trace-id-popup.component';
import { SbSubjectListPopupComponent } from './popups/sb-subject-list-popup/sb-subject-list-popup.component';
import { DiscoverComponent } from './discover/discover.page';
import { AccessDiscussionComponent } from './access-discussion/access-discussion.component';
import {JoyfulThemePopupComponent} from './popups/joyful-theme-popup/joyful-theme-popup.component';
import { ShowVendorAppsComponent} from '@app/app/components/show-vendor-apps/show-vendor-apps.component';
import {NewExperiencePopupComponent} from './popups/new-experience-popup/new-experience-popup.component';
import {YearOfBirthPopupComponent} from './popups/year-of-birth-popup/year-of-birth-popup.component';
import { ContentViewerComponent } from './content-viewer/content-viewer.component';
import { SunbirdVideoPlayerModule } from '@project-sunbird/sunbird-video-player-v9';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { DashboardComponent } from './dashboard/dashboard.component';
import {DashletModule} from '@project-sunbird/sb-dashlet'
import { TocHeaderComponent } from './toc-header/toc-header.component';
import {RelevantContentCardComponent} from './relevant-content-card/relevant-content-card.component';
import { QrScannerIOSComponent } from './qr-scanner-ios/qr-scanner-ios.component';
import { ContentShareHandlerService } from '@app/services';
@NgModule({
  declarations: [
    ApplicationHeaderComponent,
    ApplicationHeaderKebabMenuComponent,
    SignInCardComponent,
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
    ProfileAvatarComponent,
    NotificationItemComponent,
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
    SbGenericFormPopoverComponent,
    CourseCompletionPopoverComponent,
    SupportAcknowledgement,
    AcknowledgeResponseComponent,
    ExploreBooksSortComponent,
    AddActivityToGroupComponent,
    ConsentPiiPopupComponent,
    LicenseCardComponentComponent,
    GroupGuideLinesPopoverComponent,
    ProfileNameConfirmationPopoverComponent,
    CopyTraceIdPopoverComponent,
    SbSubjectListPopupComponent,
    DiscoverComponent,
    AccessDiscussionComponent,
    JoyfulThemePopupComponent,
    ShowVendorAppsComponent,
    JoyfulThemePopupComponent,
    NewExperiencePopupComponent,
    YearOfBirthPopupComponent,
    ContentViewerComponent,
    DashboardComponent,
    TocHeaderComponent,
    RelevantContentCardComponent,
    QrScannerIOSComponent
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
    SunbirdVideoPlayerModule,
    DashletModule,
    TranslateModule.forChild(),
  ],
  entryComponents: [
    ApplicationHeaderComponent,
    ApplicationHeaderKebabMenuComponent,
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
    SbGenericFormPopoverComponent,
    CourseCompletionPopoverComponent,
    SupportAcknowledgement,
    AcknowledgeResponseComponent,
    ExploreBooksSortComponent,
    ConsentPiiPopupComponent,
    GroupGuideLinesPopoverComponent,
    ProfileNameConfirmationPopoverComponent,
    CopyTraceIdPopoverComponent,
    SbSubjectListPopupComponent,
    DiscoverComponent,
    JoyfulThemePopupComponent,
    ShowVendorAppsComponent,
    NewExperiencePopupComponent,
    YearOfBirthPopupComponent,
    ContentViewerComponent,
    QrScannerIOSComponent
  ],
  exports: [
    ApplicationHeaderComponent,
    ApplicationHeaderKebabMenuComponent,
    SignInCardComponent,
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
    SbGenericFormPopoverComponent,
    CourseCompletionPopoverComponent,
    SupportAcknowledgement,
    AcknowledgeResponseComponent,
    ExploreBooksSortComponent,
    AddActivityToGroupComponent,
    ConsentPiiPopupComponent,
    LicenseCardComponentComponent,
    GroupGuideLinesPopoverComponent,
    ProfileNameConfirmationPopoverComponent,
    CopyTraceIdPopoverComponent,
    SbSubjectListPopupComponent,
    DiscoverComponent,
    JoyfulThemePopupComponent,
    AccessDiscussionComponent,
    ShowVendorAppsComponent,
    NewExperiencePopupComponent,
    YearOfBirthPopupComponent,
    ContentViewerComponent,
    DashboardComponent,
    TocHeaderComponent,
    RelevantContentCardComponent,
    QrScannerIOSComponent
  ],
  providers: [FileSizePipe, FilterPipe, Keyboard, ScreenOrientation,ContentShareHandlerService]
})
export class ComponentsModule { }
