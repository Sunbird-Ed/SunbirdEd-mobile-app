import { ContainerService } from 'services';
import { TabOptions } from '../services/container.services';


// const HOME_TAB = { root: HomePage, icon: "home", label: "HOME_BNAV", index: 0, tabsHideOnSubPages: true };
const COURSE_TAB = {
    root: 'courses',
    icon: 'courses',
    // icon: './assets/imgs/Course_enable@1.5x.svg',
    label: 'COURSES_BNAV',
    index: 2,
    tabsHideOnSubPages: true
};

const COURSE_TAB_DISABLED = {
    root: '',
    icon: 'courses',
    // icon: './assets/imgs/Course_enable@1.5x.svg',
    label: 'COURSES_BNAV',
    index: 2,
    tabsHideOnSubPages: true,
    disabled: true
};

const SCANNER_TAB = {
    root: '',
    icon: 'qrscanner',
    // icon: './assets/imgs/ic_qr_scanner.png',
    label: '',
    index: 3,
    tabsHideOnSubPages: true
};
const LIBRARY_TAB = {
    root: 'resources',
    icon: 'resources',
    // icon: './assets/imgs/Library@1.5x.svg',
    label: 'LIBRARY_BNAV',
    index: 1,
    tabsHideOnSubPages: true,
    isSelected: true
};
const GUEST_PROFILE_TAB = {
    root: 'guest-profile',
    icon: 'profile',
    // icon: './assets/imgs/Profile@1.5x.svg',
    label: 'PROFILE_BNAV',
    index: 5,
    tabsHideOnSubPages: true
};
const GUEST_PROFILE_SWITCH_TAB = {
    root: 'guest-profile',
    icon: 'profile',
    // icon: './assets/imgs/Profile@1.5x.svg',
    label: 'PROFILE_BNAV',
    index: 5,
    tabsHideOnSubPages: true,
    isSelected: true
};
const PROFILE_TAB = {
    root: 'profile',
    icon: 'profile',
    // icon: './assets/imgs/Profile@1.5x.svg',
    label: 'PROFILE_BNAV',
    index: 5,
    tabsHideOnSubPages: true
};

const DOWNLOADS_TAB = {
    root: 'download-manager',
    icon: 'downloads',
    // icon: './assets/imgs/Downloads@1.5x.svg',
    label: 'DOWNLOAD_BNAV',
    index: 4,
    tabsHideOnSubPages: true
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
    COURSE_TAB_DISABLED,
    SCANNER_TAB,
    DOWNLOADS_TAB,
    GUEST_PROFILE_TAB
];

export const GUEST_TEACHER_SWITCH_TABS = [
    LIBRARY_TAB,
    COURSE_TAB,
    SCANNER_TAB,
    DOWNLOADS_TAB,
    GUEST_PROFILE_SWITCH_TAB
];

export const GUEST_STUDENT_SWITCH_TABS = [
    LIBRARY_TAB,
    COURSE_TAB_DISABLED,
    SCANNER_TAB,
    DOWNLOADS_TAB,
    GUEST_PROFILE_SWITCH_TAB
];

export const initTabs = (container: ContainerService, tabs: Array<TabOptions>) => {
    console.log("Inside initTabs", tabs);

    container.removeAllTabs();

    if (tabs && tabs.length > 0) {
        tabs.forEach(tabOptions => {
            container.addTab(tabOptions);
        });
    }
};
