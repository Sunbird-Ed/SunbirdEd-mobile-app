import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouterLinks } from './app.constant';
import { HasNotBeenOnboardedGuard } from '@app/guards/has-not-been-onboarded.guard';
import { HasNotSelectedFrameworkGuard } from '@app/guards/has-not-selected-framework.guard';
import { HasNotSelectedLanguageGuard } from '@app/guards/has-not-selected-language.guard';
import { HasNotSelectedUserTypeGuard } from '@app/guards/has-not-selected-user-type.guard';
import { IsGuestUserGuard } from '@app/guards/is-guest-user.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: `${RouterLinks.LANGUAGE_SETTING}`,
    pathMatch: 'full'
  },
  {
    path: `${RouterLinks.LANGUAGE_SETTING}/:isFromSettings`,
    loadChildren: './language-settings/language-settings.module#LanguageSettingsModule'
  },
  {
    path: `${RouterLinks.LANGUAGE_SETTING}`,
    loadChildren: './language-settings/language-settings.module#LanguageSettingsModule',
    canLoad: [HasNotBeenOnboardedGuard],
    resolve: { message: HasNotSelectedLanguageGuard }
  },
  {
    path: `${RouterLinks.USER_TYPE_SELECTION}`,
    loadChildren: './user-type-selection/user-type-selection.module#UserTypeSelectionPageModule',
    canLoad: [HasNotBeenOnboardedGuard],
    resolve: { message: HasNotSelectedUserTypeGuard }
  },
  {
    path: `${RouterLinks.USER_TYPE_SELECTION_LOGGEDIN}`,
    loadChildren: './user-type-selection/user-type-selection.module#UserTypeSelectionPageModule'
  },
  {
    path: RouterLinks.PROFILE_SETTINGS,
    loadChildren: './profile-settings/profile-settings.module#ProfileSettingsPageModule',
    canLoad: [HasNotBeenOnboardedGuard],
    resolve: { message: HasNotSelectedFrameworkGuard }
  },
  {
    path: RouterLinks.TABS,
    loadChildren: './tabs/tabs.module#TabsPageModule'
  },
  {
    path: RouterLinks.RESOURCES,
    loadChildren: './resources/resources.module#ResourcesModule',
  },
  {
    path: RouterLinks.HOME,
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: RouterLinks.DISCOVER,
    loadChildren: './discover/discover.module#DiscoverPageModule'
  },
  {
    path: RouterLinks.ADMIN_HOME,
    loadChildren: './admin-home/admin-home.module#AdminHomePageModule',
  },
  { path: RouterLinks.VIEW_MORE_ACTIVITY, loadChildren: './view-more-activity/view-more-activity.module#ViewMoreActivityModule' },
  { path: RouterLinks.SETTINGS, loadChildren: './settings/settings.module#SettingsPageModule' },
  { path: RouterLinks.DOWNLOAD_MANAGER, loadChildren: './download-manager/download-manager.module#DownloadManagerPageModule' },
  { path: RouterLinks.STORAGE_SETTINGS, loadChildren: './storage-settings/storage-settings.module#StorageSettingsPageModule' },
  { path: RouterLinks.COURSES, loadChildren: './courses/courses.module#CoursesPageModule' },
  { path: RouterLinks.SEARCH, loadChildren: './search/search.module#SearchPageModule' },
  { path: RouterLinks.PROFILE, loadChildren: './profile/profile.module#ProfilePageModule' },
  { path: RouterLinks.ACTIVE_DOWNLOADS, loadChildren: './active-downloads/active-downloads.module#ActiveDownloadsPageModule' },
  { path: RouterLinks.COURSE_BATCHES, loadChildren: './course-batches/course-batches.module#CourseBatchesPageModule' },
  {
    path: RouterLinks.ENROLLED_COURSE_DETAILS,
    loadChildren: './enrolled-course-details-page/enrolled-course-details-page.module#EnrolledCourseDetailsPagePageModule'
  },
  { path: RouterLinks.QRSCANNER_ALERT, loadChildren: './qrscanner-alert/qrscanner-alert.module#QrscannerAlertPageModule' },
  {
    path: RouterLinks.COLLECTION_DETAIL_ETB,
    loadChildren: './collection-detail-etb/collection-detail-etb.module#CollectionDetailEtbPageModule'
  },
  { path: `${RouterLinks.CONTENT_DETAILS}/:id`, loadChildren: './content-details/content-details.module#ContentDetailsPageModule' },
  { path: RouterLinks.CONTENT_DETAILS, loadChildren: './content-details/content-details.module#ContentDetailsPageModule' },
  { path: RouterLinks.PLAYER, loadChildren: './player/player.module#PlayerPageModule' },
  { path: RouterLinks.PAGE_FILTER, loadChildren: './page-filter/page-filter.module#PageFilterPageModule' },
  {
    path: RouterLinks.PAGE_FILTER_OPTIONS,
    loadChildren: './page-filter/page-filter-options/page-filter-options.module#PageFilterOptionsPageModule'
  },
  { path: RouterLinks.QRCODERESULT, loadChildren: './qrcoderesult/qrcoderesult.module#QrcoderesultPageModule' },
  { path: RouterLinks.NOTIFICATION, loadChildren: './notification/notification.module#NotificationPageModule' },
  { path: RouterLinks.FAQ_HELP, loadChildren: './faq-help/faq-help.module#FaqHelpPageModule' },
  {
    path: RouterLinks.TERMS_AND_CONDITIONS,
    loadChildren: './terms-and-conditions/terms-and-conditions.module#TermsAndConditionsPageModule'
  },
  { path: 'filters', loadChildren: './search/filters/filters.module#FiltersPageModule' },
  { path: RouterLinks.TEXTBOOK_VIEW_MORE, loadChildren: './textbook-view-more/textbook-view-more.module#TextbookViewMorePageModule' },
  { path: RouterLinks.GUEST_EDIT, loadChildren: './profile/guest-edit/guest-edit.module#GuestEditPageModule' },
  { path: RouterLinks.EXPLORE_BOOK, loadChildren: './resources/explore-books/explore-books.module#ExploreBooksPageModule' },
  { path: RouterLinks.FAQ_REPORT_ISSUE, loadChildren: './faq-report-issue/faq-report-issue.module#FaqReportIssuePageModule' },
  {
    path: RouterLinks.DISTRICT_MAPPING,
    loadChildren: './district-mapping/district-mapping.module#DistrictMappingPageModule'
  },
  { path: RouterLinks.MY_GROUPS, loadChildren: './my-groups/my-groups.module#MyGroupsPageModule' },
  { path: RouterLinks.CURRICULUM_COURSES, loadChildren: './curriculum-courses/curriculum-courses.module#CurriculumCoursesPageModule' },
  { path: RouterLinks.PROGRAM, loadChildren: './manage-learn/programs/programs.module#ProgramsModule' },
  { path: RouterLinks.SURVEY, loadChildren: './manage-learn/survey/survey.module#SurveyModule' },
  { path: RouterLinks.PROJECT, loadChildren: './manage-learn/project/project.module#ProjectModule' },
  {
    path: RouterLinks.QUESTIONNAIRE,
    loadChildren: './manage-learn/questionnaire/questionnaire.module#QuestionnairePageModule'
  },

   { path: RouterLinks.OBSERVATION, loadChildren: './manage-learn/observation/observation.module#ObservationModule' },
  { path: RouterLinks.CATEGORY_LIST, loadChildren: './category-list/category-list-page.module#CategoryListPageModule' },
  { path: RouterLinks.GUEST_PROFILE, loadChildren: './profile/guest-profile/guest-profile.module#GuestProfilePageModule' },
  { path: RouterLinks.ECM_LISTING, loadChildren: './manage-learn/ecm-listing/ecm-listing.module#EcmListingPageModule' },
  { path: RouterLinks.SECTION_LISTING, loadChildren: './manage-learn/section-listing/section-listing.module#SectionListingPageModule' },
  { path: RouterLinks.SUBMISSION_PREVIEW, loadChildren: './manage-learn/submission-preview/submission-preview.module#SubmissionPreviewModule' },
  { path: RouterLinks.IMAGE_LISTING, loadChildren: './manage-learn/image-listing/image-listing.module#ImageListingModule' },
  { path: RouterLinks.ALL_EVIDENCE, loadChildren: './manage-learn/all-evidence-list/all-evidence-list.module#AllEvidenceListModule' },
    { path: RouterLinks.OBSERVATION_REPORTS, loadChildren: './manage-learn/observation-report/observation-report.module#ObservationReportModule' },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: [
    HasNotBeenOnboardedGuard,
    HasNotSelectedLanguageGuard,
    HasNotSelectedUserTypeGuard,
    HasNotSelectedFrameworkGuard,
    IsGuestUserGuard],
})
export class AppRoutingModule { }
