import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouterLinks } from './app.constant';
import { HasNotBeenOnboardedGuard } from '@app/guards/has-not-been-onboarded.guard';
import { HasNotSelectedFrameworkGuard } from '@app/guards/has-not-selected-framework.guard';
import { HasNotSelectedLanguageGuard } from '@app/guards/has-not-selected-language.guard';
import { HasNotSelectedUserTypeGuard } from '@app/guards/has-not-selected-user-type.guard';
import { IsGuestUserGuard } from '@app/guards/is-guest-user.guard';
import { MlGuard } from './manage-learn/core/guards/ml.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: `${RouterLinks.LANGUAGE_SETTING}`,
    pathMatch: 'full'
  },
  {
    path: `${RouterLinks.LANGUAGE_SETTING}/:isFromSettings`,
    loadChildren: () => import('./language-settings/language-settings.module').then(m => m.LanguageSettingsModule)
  },
  {
    path: `${RouterLinks.LANGUAGE_SETTING}`,
    loadChildren: () => import('./language-settings/language-settings.module').then(m => m.LanguageSettingsModule),
    canLoad: [HasNotBeenOnboardedGuard],
    resolve: { message: HasNotSelectedLanguageGuard }
  },
  {
    path: `${RouterLinks.USER_TYPE_SELECTION}`,
    loadChildren: () => import('./user-type-selection/user-type-selection.module').then(m => m.UserTypeSelectionPageModule),
    canLoad: [HasNotBeenOnboardedGuard],
    resolve: { message: HasNotSelectedUserTypeGuard }
  },
  {
    path: `${RouterLinks.USER_TYPE_SELECTION_LOGGEDIN}`,
    loadChildren: () => import('./user-type-selection/user-type-selection.module').then(m => m.UserTypeSelectionPageModule)
  },
  {
    path: RouterLinks.PROFILE_SETTINGS,
    loadChildren: () => import('./profile-settings/profile-settings.module').then(m => m.ProfileSettingsPageModule),
    canLoad: [HasNotBeenOnboardedGuard],
    resolve: { message: HasNotSelectedFrameworkGuard }
  },
  {
    path: RouterLinks.TABS,
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: RouterLinks.RESOURCES,
    loadChildren: () => import('./resources/resources.module').then(m => m.ResourcesModule),
  },
  {
    path: RouterLinks.HOME,
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  { path: RouterLinks.VIEW_MORE_ACTIVITY, loadChildren: () => import('./view-more-activity/view-more-activity.module').then(m => m.ViewMoreActivityModule) },
  { path: RouterLinks.SETTINGS, loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule) },
  { path: RouterLinks.DOWNLOAD_MANAGER, loadChildren: () => import('./download-manager/download-manager.module').then(m => m.DownloadManagerPageModule) },
  { path: RouterLinks.STORAGE_SETTINGS, loadChildren: () => import('./storage-settings/storage-settings.module').then(m => m.StorageSettingsPageModule) },
  { path: RouterLinks.COURSES, loadChildren: () => import('./courses/courses.module').then(m => m.CoursesPageModule) },
  { path: RouterLinks.SEARCH, loadChildren: () => import('./search/search.module').then(m => m.SearchPageModule) },
  { path: RouterLinks.PROFILE, loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule) },
  { path: RouterLinks.ACTIVE_DOWNLOADS, loadChildren: () => import('./active-downloads/active-downloads.module').then(m => m.ActiveDownloadsPageModule) },
  { path: RouterLinks.COURSE_BATCHES, loadChildren: () => import('./course-batches/course-batches.module').then(m => m.CourseBatchesPageModule) },
  {
    path: RouterLinks.ENROLLED_COURSE_DETAILS,
    loadChildren: () => import('./enrolled-course-details-page/enrolled-course-details-page.module').then(m => m.EnrolledCourseDetailsPagePageModule)
  },
  { path: RouterLinks.QRSCANNER_ALERT, loadChildren: () => import('./qrscanner-alert/qrscanner-alert.module').then(m => m.QrscannerAlertPageModule) },
  {
    path: RouterLinks.COLLECTION_DETAIL_ETB,
    loadChildren: () => import('./collection-detail-etb/collection-detail-etb.module').then(m => m.CollectionDetailEtbPageModule)
  },
  { path: `${RouterLinks.CONTENT_DETAILS}/:id`, loadChildren: () => import('./content-details/content-details.module').then(m => m.ContentDetailsPageModule) },
  { path: RouterLinks.CONTENT_DETAILS, loadChildren: () => import('./content-details/content-details.module').then(m => m.ContentDetailsPageModule) },
  { path: RouterLinks.PLAYER, loadChildren: () => import('./player/player.module').then(m => m.PlayerPageModule) },
  { path: RouterLinks.PAGE_FILTER, loadChildren: () => import('./page-filter/page-filter.module').then(m => m.PageFilterPageModule) },
  {
    path: RouterLinks.PAGE_FILTER_OPTIONS,
    loadChildren: () => import('./page-filter/page-filter-options/page-filter-options.module').then(m => m.PageFilterOptionsPageModule)
  },
  { path: RouterLinks.QRCODERESULT, loadChildren: () => import('./qrcoderesult/qrcoderesult.module').then(m => m.QrcoderesultPageModule) },
  { path: RouterLinks.NOTIFICATION, loadChildren: () => import('./notification/notification.module').then(m => m.NotificationPageModule) },
  { path: RouterLinks.FAQ_HELP, loadChildren: () => import('./faq-help/faq-help.module').then(m => m.FaqHelpPageModule) },
  {
    path: RouterLinks.TERMS_AND_CONDITIONS,
    loadChildren: () => import('./terms-and-conditions/terms-and-conditions.module').then(m => m.TermsAndConditionsPageModule)
  },
  { path: 'filters', loadChildren: () => import('./search/filters/filters.module').then(m => m.FiltersPageModule) },
  { path: RouterLinks.TEXTBOOK_VIEW_MORE, loadChildren: () => import('./textbook-view-more/textbook-view-more.module').then(m => m.TextbookViewMorePageModule) },
  { path: RouterLinks.GUEST_EDIT, loadChildren: () => import('./profile/guest-edit/guest-edit.module').then(m => m.GuestEditPageModule) },
  { path: RouterLinks.EXPLORE_BOOK, loadChildren: () => import('./resources/explore-books/explore-books.module').then(m => m.ExploreBooksPageModule) },
  { path: RouterLinks.FAQ_REPORT_ISSUE, loadChildren: () => import('./faq-report-issue/faq-report-issue.module').then(m => m.FaqReportIssuePageModule) },
  {
    path: RouterLinks.DISTRICT_MAPPING,
    loadChildren: () => import('./district-mapping/district-mapping.module').then(m => m.DistrictMappingPageModule)
  },
  { path: RouterLinks.MY_GROUPS, loadChildren: () => import('./my-groups/my-groups.module').then(m => m.MyGroupsPageModule) },
  { path: RouterLinks.CURRICULUM_COURSES, loadChildren: () => import('./curriculum-courses/curriculum-courses.module').then(m => m.CurriculumCoursesPageModule) },
  { path: RouterLinks.PROGRAM, loadChildren: () => import('./manage-learn/programs/programs.module').then(m => m.ProgramsModule), canActivate:[MlGuard] },
  { path: RouterLinks.SURVEY, loadChildren: () => import('./manage-learn/survey/survey.module').then(m => m.SurveyModule), canActivate:[MlGuard] },
  { path: RouterLinks.PROJECT, loadChildren: () => import('./manage-learn/project/project.module').then(m => m.ProjectModule)},
  { path: RouterLinks.REPORTS, loadChildren: () => import('./manage-learn/reports/reports.module').then(m => m.ReportsModule),canActivate:[MlGuard] },
  {
    path: RouterLinks.QUESTIONNAIRE,
    loadChildren: () => import('./manage-learn/questionnaire/questionnaire.module').then(m => m.QuestionnairePageModule)
  },

  { path: RouterLinks.OBSERVATION, loadChildren: () => import('./manage-learn/observation/observation.module').then(m => m.ObservationModule) , canActivate:[MlGuard]},
  { path: RouterLinks.CATEGORY_LIST, loadChildren: () => import('./category-list/category-list-page.module').then(m => m.CategoryListPageModule) },
  { path: RouterLinks.GUEST_PROFILE, loadChildren: () => import('./profile/guest-profile/guest-profile.module').then(m => m.GuestProfilePageModule) },
  { path: RouterLinks.ECM_LISTING, loadChildren: () => import('./manage-learn/ecm-listing/ecm-listing.module').then(m => m.EcmListingPageModule) },
  { path: RouterLinks.SECTION_LISTING, loadChildren: () => import('./manage-learn/section-listing/section-listing.module').then(m => m.SectionListingPageModule) },
  { path: RouterLinks.SUBMISSION_PREVIEW, loadChildren: () => import('./manage-learn/submission-preview/submission-preview.module').then(m => m.SubmissionPreviewModule) },
  { path: RouterLinks.IMAGE_LISTING, loadChildren: () => import('./manage-learn/image-listing/image-listing.module').then(m => m.ImageListingModule) },
  { path: RouterLinks.ALL_EVIDENCE, loadChildren: () => import('./manage-learn/all-evidence-list/all-evidence-list.module').then(m => m.AllEvidenceListModule) },
  { path: RouterLinks.PROJECT_REPORT, loadChildren: () => import('./manage-learn/project-report/project-report.module').then(m => m.ProjectReportModule) },
  { path: RouterLinks.PROJECT_FULL_REPORT, loadChildren: () => import('./manage-learn/project-full-report/project-full-report.module').then(m => m.ProjectFullReportModule) },
  { path: `${RouterLinks.DEEPLINK_REDIRECT}/:extra`, loadChildren: () => import('./manage-learn/deeplink-redirect/deeplink-redirect.module').then(m => m.DeeplinkRedirectModule), canActivate:[MlGuard] },
  { path: RouterLinks.CATEGORY_LIST, loadChildren: () => import('./category-list/category-list-page.module').then(m => m.CategoryListPageModule)},
  { path: RouterLinks.GUEST_PROFILE, loadChildren: () => import('./profile/guest-profile/guest-profile.module').then(m => m.GuestProfilePageModule) },
  { path: RouterLinks.DISCUSSION, loadChildren: () => import('./discussion-forum/discussion-forum.module').then(m => m.DiscussionForumModule) },
  { path: RouterLinks.SEARCH_FILTER, loadChildren: () => import('./search-filter/search-filter.module').then(m => m.SearchFilterPageModule) },
  { path: RouterLinks.GENERIC_REPORT, loadChildren: () => import('./manage-learn/generic-reports/generic-reports.module').then(m => m.GenericReportsModule) , canActivate:[MlGuard]},
  { path: RouterLinks.DOMAIN_ECM_LISTING, loadChildren: () => import('./manage-learn/domain-ecm-listing/domain-ecm-listing.module').then(m => m.DomainEcmListingModule) },
  {
    path: RouterLinks.IMP_SUGGESTIONS,
    loadChildren:  () => import('./manage-learn/imp-suggestions/imp-suggestions.module').then(m => m.ImpSuggestionsPageModule)
  },
  { path: RouterLinks.SIGN_IN, loadChildren: () => import('./sign-in/sign-in.module').then(m => m.SignInPageModule)},

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
