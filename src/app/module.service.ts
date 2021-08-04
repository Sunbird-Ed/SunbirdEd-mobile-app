import { ContainerService } from 'services';
import { TabOptions } from '../services/container.services';

const LIBRARY_TAB = {
    root: 'resources',
    icon: 'resources',
    label: 'LIBRARY_BNAV',
    index: 1,
    isSelected: true
};

const HOME_TAB = {
    root: 'home',
    icon: 'home',
    label: 'FRMELEMNTS_LBL_TAB_HOME',
    index: 1,
    isSelected: true
};

const COURSE_TAB = {
    root: 'courses',
    icon: 'courses',
    label: 'COURSES_BNAV',
    index: 2
};

const COURSE_TAB_DISABLED = {
    root: '',
    icon: 'courses',
    label: 'COURSES_BNAV',
    index: 2,
    disabled: true
};

const SEARCH_TAB = {
    root: 'search',
    icon: 'discover',
    label: 'DISCOVER_BNAV',
    index: 2
};

const SCANNER_TAB = {
    root: '',
    icon: 'qrscanner',
    label: '',
    index: 3
};

const DOWNLOADS_TAB = {
    root: 'download-manager',
    icon: 'downloads',
    label: 'DOWNLOAD_BNAV',
    index: 4
};

const GUEST_PROFILE_TAB = {
    root: 'guest-profile',
    icon: 'profile',
    label: 'PROFILE_BNAV',
    index: 5
};

const GUEST_PROFILE_SWITCH_TAB = {
    root: 'guest-profile',
    icon: 'profile',
    label: 'PROFILE_BNAV',
    index: 5,
    isSelected: true
};

const PROFILE_TAB = {
    root: 'profile',
    icon: 'profile',
    label: 'PROFILE_BNAV',
    index: 5
};

export const GUEST_TEACHER_TABS = [
    LIBRARY_TAB,
    COURSE_TAB,
    SCANNER_TAB,
    DOWNLOADS_TAB,
    GUEST_PROFILE_TAB
];

export const LOGIN_TEACHER_TABS = [
    LIBRARY_TAB,
    COURSE_TAB,
    SCANNER_TAB,
    DOWNLOADS_TAB,
    PROFILE_TAB
];

export const GUEST_STUDENT_TABS = [
    LIBRARY_TAB,
    COURSE_TAB,
    SCANNER_TAB,
    DOWNLOADS_TAB,
    GUEST_PROFILE_TAB
];

export const GUEST_HOME_SEARCH_TABS = [
    HOME_TAB,
    SEARCH_TAB,
    SCANNER_TAB,
    DOWNLOADS_TAB,
    GUEST_PROFILE_TAB
];

export const LOGGEDIN_HOME_SEARCH_TABS = [
    HOME_TAB,
    SEARCH_TAB,
    SCANNER_TAB,
    DOWNLOADS_TAB,
    PROFILE_TAB
];

export const LOGIN_ADMIN_TABS = [
    HOME_TAB,
    COURSE_TAB,
    SCANNER_TAB,
    DOWNLOADS_TAB,
    PROFILE_TAB
];


export const initTabs = (container: ContainerService, tabs: Array<TabOptions>) => {
    container.removeAllTabs();

    if (tabs && tabs.length > 0) {
        tabs.forEach(tabOptions => {
            container.addTab(tabOptions);
        });
    }
};
