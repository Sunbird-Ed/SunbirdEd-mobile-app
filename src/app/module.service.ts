

// const HOME_TAB = { root: HomePage, icon: "home", label: "HOME_BNAV", index: 0, tabsHideOnSubPages: true };
const COURSE_TAB = {
    //root: CoursesPage,
    icon: 'courses',
    label: 'COURSES_BNAV',
    index: 2,
    tabsHideOnSubPages: true
};

const COURSE_TAB_DISABLED = {
    root: '',
    icon: 'courses',
    label: 'COURSES_BNAV',
    index: 2,
    tabsHideOnSubPages: true,
    disabled: true
};

const SCANNER_TAB = {
    root: '',
    icon: 'qrscanner',
    // label: 'LIBRARY_BNAV',
    index: 3,
    tabsHideOnSubPages: true
};
const LIBRARY_TAB = {
    //root: ResourcesPage,
    icon: 'resources',
    label: 'LIBRARY_BNAV',
    index: 1,
    tabsHideOnSubPages: true,
    isSelected: true
};
const GUEST_PROFILE_TAB = {
    // root: GuestProfilePage,
    icon: 'profile',
    label: 'PROFILE_BNAV',
    index: 5,
    tabsHideOnSubPages: true
};
const GUEST_PROFILE_SWITCH_TAB = {
    // root: GuestProfilePage,
    icon: 'profile',
    label: 'PROFILE_BNAV',
    index: 5,
    tabsHideOnSubPages: true,
    isSelected: true
};
const PROFILE_TAB = {
    // root: ProfilePage,
    icon: 'profile',
    label: 'PROFILE_BNAV',
    index: 5,
    tabsHideOnSubPages: true
};

const DOWNLOADS_TAB = {
    root: '',
    icon: 'downloads',
    label: 'DOWNLOAD_BNAV',
    index: 4,
    tabsHideOnSubPages: true
};

const DOWNLOADS_TAB_DISABLED = {
    // root: DownloadManagerPage,
    icon: 'downloads',
    label: 'DOWNLOAD_BNAV',
    index: 4,
    tabsHideOnSubPages: true,
    // disabled: true,
    // availableLater: true    // This flag holds value for indicating that this tab will be available in the later releasesPageModule } from '../pages/storage-settings/storage-settings.module';
};

export const GUEST_TEACHER_TABS = [
    // HOME_TAB,
    LIBRARY_TAB,
    COURSE_TAB,
    SCANNER_TAB,
    DOWNLOADS_TAB_DISABLED,
    GUEST_PROFILE_TAB
];

export const LOGIN_TEACHER_TABS = [
    // HOME_TAB,
    LIBRARY_TAB,
    COURSE_TAB,
    SCANNER_TAB,
    DOWNLOADS_TAB_DISABLED,
    PROFILE_TAB
];

export const GUEST_STUDENT_TABS = [
    LIBRARY_TAB,
    COURSE_TAB_DISABLED,
    SCANNER_TAB,
    DOWNLOADS_TAB_DISABLED,
    GUEST_PROFILE_TAB
];

export const GUEST_TEACHER_SWITCH_TABS = [
    // HOME_TAB,
    LIBRARY_TAB,
    COURSE_TAB,
    SCANNER_TAB,
    DOWNLOADS_TAB_DISABLED,
    GUEST_PROFILE_SWITCH_TAB
];

export const GUEST_STUDENT_SWITCH_TABS = [
    LIBRARY_TAB,
    COURSE_TAB_DISABLED,
    SCANNER_TAB,
    DOWNLOADS_TAB_DISABLED,
    GUEST_PROFILE_SWITCH_TAB
];

/* export const initTabs = (container: ContainerService, tabs: Array<TabOptions>) => {
    container.removeAllTabs();

    if (tabs && tabs.length > 0) {
        tabs.forEach(tabOptions => {
            container.addTab(tabOptions);
        });
    }
}; */

/* export const PluginModules = [
    CoursesPageModule,
    ProfilePageModule,
    ResourcesPageModule,
    OnboardingPageModule,
    LanguageSettingsPageModule,
    UserTypeSelectionPageModule,
    CourseBatchesPageModule,
    EnrolledCourseDetailsPageModule,
    QRScannerModule,
    SearchModule,
    CollectionDetailsPageModule,
    CollectionDetailsEtbPageModule,
    ContentDetailsPageModule,
    ViewMoreActivityPageModule,
    PageFilterMoudule,
    UserAndGroupsPageModule,
    ReportsPageModule,
    UserReportModule,
    ProfileSettingsPageModule,
    QrCodeResultPageModule,
    TermsAndConditionsPageModule,
    DownloadManagerPageModule,
    ActiveDownloadsPageModule,
    StorageSettingsPageModule
];
 */