export class ContentType {
    public static readonly STORY = 'Story';
    public static readonly WORKSHEET = 'Worksheet';
    public static readonly GAME = 'Game';
    public static readonly RESOURCE = 'Resource';
    public static readonly COLLECTION = 'Collection';
    public static readonly TEXTBOOK = 'TextBook';
    public static readonly LESSON_PLAN = 'LessonPlan';
    public static readonly COURSE = 'Course';
    public static readonly TEXTBOOK_UNIT = 'TextBookUnit';
    public static readonly LESSON_PLAN_UNIT = 'LessonPlanUnit';
    public static readonly COURSE_UNIT = 'CourseUnit';
    public static readonly FOCUS_SPOT = 'FocusSpot';
    public static readonly LEARNING_OUTCOME_DEFINITION = 'LearningOutcomeDefinition';
    public static readonly PRACTICE_QUESTION_SET = 'PracticeQuestionSet';
    public static readonly CURIOSITY_QUESTIONS = 'CuriosityQuestions';
    public static readonly MARKING_SCHEME_RUBRIC = 'MarkingSchemeRubric';
    public static readonly EXPLANATION_RESOURCE = 'ExplanationResource';
    public static readonly EXPERIENTIAL_RESOURCE = 'ExperientialResource';

    public static readonly FOR_COURSE_TAB = [
        ContentType.COURSE
    ];
    public static readonly FOR_LIBRARY_TAB = [
        ContentType.STORY,
        ContentType.WORKSHEET,
        ContentType.GAME,
        ContentType.RESOURCE,
        ContentType.COLLECTION,
        ContentType.TEXTBOOK,
        ContentType.LESSON_PLAN
    ];
    // TODO: not need to pass content types, by default all the content types should display
    public static readonly FOR_DOWNLOADED_TAB = [
        ContentType.STORY,
        ContentType.WORKSHEET,
        ContentType.GAME,
        ContentType.RESOURCE,
        ContentType.COLLECTION,
        ContentType.TEXTBOOK,
        ContentType.LESSON_PLAN,
        ContentType.COURSE,
        ContentType.FOCUS_SPOT,
        ContentType.LEARNING_OUTCOME_DEFINITION,
        ContentType.PRACTICE_QUESTION_SET,
        ContentType.CURIOSITY_QUESTIONS,
        ContentType.MARKING_SCHEME_RUBRIC,
        ContentType.EXPLANATION_RESOURCE,
        ContentType.EXPERIENTIAL_RESOURCE
    ];
    public static readonly FOR_DIAL_CODE_SEARCH = [
        ContentType.TEXTBOOK,
        ContentType.TEXTBOOK_UNIT,
        ContentType.COURSE
    ];
}

export class MimeType {
    public static readonly COLLECTION = 'application/vnd.ekstep.content-collection';
    public static readonly VIDEO = ['video/avi', 'video/mpeg', 'video/quicktime', 'video/3gpp', 'video/mpeg', 'video/mp4',
        'video/ogg', 'video/webm'];
    public static readonly AUDIO = ['audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/x-wav', 'audio/wav'];
    public static readonly INTERACTION = ['application/vnd.ekstep.ecml-archive', 'application/vnd.ekstep.html-archive',
        'application/vnd.android.package-archive', 'application/vnd.ekstep.content-archive',
        'application/vnd.ekstep.plugin-archive', 'application/vnd.ekstep.h5p-archive'];
    public static readonly ALL = ['video/mp4', 'video/x-youtube', 'video/webm', 'application/pdf', 'application/epub',
        'application/pdf', 'application/epub', 'application/vnd.ekstep.ecml-archive', 'application/vnd.ekstep.h5p-archive',
        'application/vnd.ekstep.html-archive'
    ];
}

export class Search {
    public static readonly FACETS_ETB = [
        'subject'
    ];

    public static readonly FACETS = [
        'board',
        'gradeLevel',
        'subject',
        'medium',
        'resourceType'
    ];

    public static readonly FACETS_COURSE = [
        'topic',
        'purpose',
        'gradeLevel',
        'subject',
        'medium',
        'contentType',
        'channel'
    ];
}

export class BatchConstants {
    public static readonly REQUIRED_FIELDS = [
        'endDate',
        'description',
        'name',
        'enrollmentType',
        'hashTagId',
        'startDate',
        'courseId',
        'status',
        'createdBy',
        'creatorFirstName',
        'creatorLastName',
        'identifier',
        'id',
        'enrollmentEndDate'
    ];
    // createdFor ,courseAdditionalInfo, participant, updatedDate, createdDate, courseCreator, mentors
}

export class ProfileConstants {
    public static readonly USER_TOKEN = 'userToken';
    public static readonly REQUIRED_FIELDS = [
        'completeness',
        'missingFields',
        'lastLoginTime',
        'topics',
        'organisations',
        'roles',
        'locations'
    ];

    public static readonly CONTACT_TYPE_PHONE = 'phone';
    public static readonly CONTACT_TYPE_EMAIL = 'email';
}

export class AudienceFilter {
    public static readonly GUEST_TEACHER = ['instructor', 'learner'];
    public static readonly GUEST_STUDENT = ['learner'];

    public static readonly LOGGED_IN_USER = ['instructor', 'learner'];
}

export class EventTopics {
    public static readonly ENROL_COURSE_SUCCESS = 'ENROL_COURSE_SUCCESS';
    public static readonly UNENROL_COURSE_SUCCESS = 'UNENROL_COURSE_SUCCESS';
    public static readonly COURSE_STATUS_UPDATED_SUCCESSFULLY = 'COURSE_STATUS_UPDATED_SUCCESSFULLY';
    public static readonly REFRESH_ENROLL_COURSE_LIST = 'REFRESH_ENROLL_COURSE_LIST';
    public static readonly PLAYER_CLOSED = 'PLAYER_CLOSED';
}

export class ShareUrl {
    public static readonly CONTENT = '/play/content/';
    public static readonly COLLECTION = '/play/collection/';
}

export class MenuOverflow {
    public static readonly MENU_GUEST = ['USERS_AND_GROUPS', 'REPORTS', 'SETTINGS'];
    public static readonly MENU_LOGIN = ['USERS_AND_GROUPS', 'REPORTS', 'SETTINGS', 'LOGOUT'];
    public static readonly DOWNLOAD_FILTERS = ['CONTENT_SIZE', 'LAST_VIEWED'];
}

export class SideMenu {
    public static readonly MENU_GUEST = ['USERS_AND_GROUPS', 'REPORTS', 'LANGUAGE', 'SETTINGS'];
    public static readonly MENU_LOGIN = ['USERS_AND_GROUPS', 'REPORTS', 'LANGUAGE', 'SETTINGS', 'LOGOUT'];
}

export class FormConstant {
    public static readonly DEFAULT_PAGE_COURSE_FILTER_PATH = 'data/form/pageassemble_course_filter.json';
    public static readonly DEFAULT_PAGE_LIBRARY_FILTER_PATH = 'data/form/pageassemble_library_filter.json';
}

export class PreferenceKey {
    public static readonly SELECTED_LANGUAGE_CODE = 'sunbirdselected_language_code';
    public static readonly SELECTED_LANGUAGE = 'sunbirdselected_language';
    public static readonly SELECTED_USER_TYPE = 'sunbirdselected_user_type';
    public static readonly COURSE_IDENTIFIER = 'sunbirdcourse_identifier';
    public static readonly IS_ONBOARDING_COMPLETED = 'sunbirdis_onboarding_settings_completed';
    public static readonly IS_BOOKMARK_VIEWED = 'sunbirdis_bookmark_viewed';
    public static readonly CONTENT_CONTEXT = 'sunbirdcontent_context';
    public static readonly GUEST_USER_ID_BEFORE_LOGIN = 'sunbirdGUEST_USER_ID_BEFORE_LOGIN';
    public static readonly KEY_SUNBIRD_SUPPORT_FILE_PATH = 'sunbirdsunbird_support_file_path';
    public static readonly KEY_DATA_SYNC_TYPE = 'sunbirdsync_config';
    public static readonly KEY_DATA_SYNC_TIME = 'sunbirddata_sync_time';
    public static readonly APP_LOGO = 'app_logo';
    public static readonly APP_NAME = 'app_name';
    public static readonly APP_RATING_DATE = 'app_rating_date';
    public static readonly APP_RATE_LATER_CLICKED = 'app_rate_later_clicked';
    public static readonly APP_RATING_POPUP_APPEARED = 'app_rating_popup_appeared';
    public static readonly APP_PERMISSION_ASKED = 'app_permission_asked';
    public static readonly DEPLOYMENT_KEY = 'deployment_key';
}

export class GenericAppConfig {
    public static readonly DISPLAY_ONBOARDING_CARDS = 'DISPLAY_ONBOARDING_CARDS';
    public static readonly DISPLAY_FRAMEWORK_CATEGORIES_IN_PROFILE = 'DISPLAY_FRAMEWORK_CATEGORIES_IN_PROFILE';
    public static readonly DISPLAY_ONBOARDING_PAGE = 'DISPLAY_ONBOARDING_PAGE';
    public static readonly DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER = 'DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER';
    public static readonly DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER = 'DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER';
    public static readonly DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER = 'DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER';
    public static readonly DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_STUDENT = 'DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_STUDENT';
    public static readonly DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT = 'DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT';
    public static readonly DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT = 'DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT';
    public static readonly TRACK_USER_TELEMETRY = 'TRACK_USER_TELEMETRY';
    public static readonly CONTENT_STREAMING_ENABLED = 'CONTENT_STREAMING_ENABLED';
    public static readonly DISPLAY_ONBOARDING_SCAN_PAGE = 'DISPLAY_ONBOARDING_SCAN_PAGE';
    public static readonly DISPLAY_ONBOARDING_CATEGORY_PAGE = 'DISPLAY_ONBOARDING_CATEGORY_PAGE';
    public static readonly OPEN_RAPDISCOVERY_ENABLED = 'OPEN_RAPDISCOVERY_ENABLED';
    public static readonly SUPPORT_EMAIL = 'SUPPORT_EMAIL';
    public static readonly VERSION_NAME = 'VERSION_NAME';
    public static readonly VERSION_CODE = 'VERSION_CODE';
}

export const appLanguages = [
    {
        label: 'हिंदी',
        code: 'hi',
        isApplied: false,
        name: 'Hindi'
    },
    {
        label: 'English',
        code: 'en',
        isApplied: false,
        name: 'English'
    },
    {
        label: 'मराठी',
        code: 'mr',
        isApplied: false,
        name: 'Marathi'
    },
    {
        label: 'తెలుగు',
        code: 'te',
        isApplied: false,
        name: 'Telugu'
    },
    {
        label: 'தமிழ்',
        code: 'ta',
        isApplied: false,
        name: 'Tamil'
    },
    {
        label: 'ಕನ್ನಡ',
        code: 'kn',
        isApplied: false,
        name: 'Kannada'
    },
    {
        label: 'اردو',
        code: 'ur',
        isApplied: false,
        name: 'Urdu'
    }
];

export class PageName {
    public static readonly RESOURCE = 'Resource';
    public static readonly COURSE = 'Course';
    public static readonly DIAL_CODE = 'DIAL Code Consumption';
}

export class XwalkConstants {
    public static readonly APP_ID = 'org.xwalk.core';
}

export class ContentCard {
    public static readonly LAYOUT_INPROGRESS = 'InProgress';
    public static readonly LAYOUT_POPULAR = 'Popular';
    public static readonly LAYOUT_SAVED_CONTENT = 'SavedContent';
}

export class CardSectionName {
    public static readonly SECTION_SAVED_RESOURCES = 'Saved Resources';
    public static readonly SECTION_RECENT_RESOURCES = 'Recently Viewed';
}

export class ViewMore {
    public static readonly PAGE_COURSE_ENROLLED = 'course.EnrolledCourses';
    public static readonly PAGE_COURSE_POPULAR = 'course.PopularContent';
    public static readonly PAGE_RESOURCE_SAVED = 'resource.SavedResources';
    public static readonly PAGE_RESOURCE_RECENTLY_VIEWED = 'resource.RecentlyViewed';
}

export class Location {
    public static readonly TYPE_STATE = 'state';
    public static readonly TYPE_DISTRICT = 'district';
}

export class FrameworkCategory {
    public static readonly BOARD = 'board';
    public static readonly MEDIUM = 'medium';
    public static readonly GRADE_LEVEL = 'gradeLevel';
    public static readonly SUBJECT = 'subject';
    public static readonly TOPIC = 'topic';
    public static readonly PURPOSE = 'purpose';

    public static readonly DEFAULT_FRAMEWORK_CATEGORIES = [
        FrameworkCategory.BOARD,
        FrameworkCategory.MEDIUM,
        FrameworkCategory.GRADE_LEVEL,
        FrameworkCategory.SUBJECT
    ];

    public static readonly COURSE_FRAMEWORK_CATEGORIES = [
        FrameworkCategory.TOPIC,
        FrameworkCategory.PURPOSE,
        FrameworkCategory.MEDIUM,
        FrameworkCategory.GRADE_LEVEL,
        FrameworkCategory.SUBJECT
    ];
}

export class SystemSettingsIds {
    public static readonly CUSTODIAN_ORG_ID = 'custodianOrgId';
    public static readonly COURSE_FRAMEWORK_ID = 'courseFrameworkId';
    public static readonly CONTENT_COMING_SOON_MSG = 'contentComingSoonMsg';
    public static readonly CONSUMPTION_FAQS = 'consumptionFaqs';
}

export class StoreRating {
    public static readonly DATE_DIFF = 2;
    public static readonly APP_MIN_RATE = 4;
    public static readonly FOLDER_NAME = 'sunbird-app-rating';
    public static readonly FILE_NAME = 'app-rating.doc';
    public static readonly FILE_TEXT = 'APP-Rating';
    public static readonly RETURN_CLOSE = 'close';
    public static readonly RETURN_HELP = 'help';
    public static readonly DEVICE_FOLDER_PATH = cordova.file.dataDirectory;
}
export class ContentConstants {
    public static readonly DEFAULT_LICENSE = 'CC BY 4.0';
    public static readonly COMING_SOON_MSG = 'comingSoonMsg';
}

export class ContentFilterConfig {
    public static readonly NAME_LIBRARY = 'library';
    public static readonly NAME_COURSE = 'course';
    public static readonly NAME_DOWNLOADS = 'downloads';
    public static readonly NAME_DIALCODE = 'dialcode';
    public static readonly CODE_CONTENT_TYPE = 'contentType';
}

export class ActionType {
    public static readonly CODE_PUSH = 'codePush';
    public static readonly COURSE_UPDATE = 'courseUpdate';
    public static readonly CONTENT_UPDATE = 'contentUpdate';
    public static readonly BOOK_UPDATE = 'bookUpdate';
    public static readonly UPDATE_APP = 'updateApp';
}

export class RouterLinks {
    public static readonly TABS = 'tabs';

    // Onboarding Routs

    // Users and Groups Routs
    public static readonly USER_AND_GROUPS = 'user-and-groups';
    public static readonly ADD_OR_REMOVE_GROUP_USER = 'add-or-remove-group-user';
    public static readonly GROUP_DETAILS = 'group-details';
    public static readonly CREATE_GROUP = 'create-group';
    public static readonly GROUP_MEMBERS = 'group-members';
    public static readonly SHARE_USER_AND_GROUPS = 'share-user-and-groups';

    // Profile Routs
    public static readonly PROFILE = 'profile';
    public static readonly GUEST_EDIT = 'guest-edit';
    public static readonly GUEST_PROFILE = 'guest-profile';
    public static readonly PERSONAL_DETAILS_EDIT = 'personal-details-edit';
    public static readonly CATEGORIES_EDIT = 'categories-edit';

    // Courses Routs
    public static readonly COURSES = 'courses';
    public static readonly ENROLLED_COURSE_DETAILS = 'enrolled-course-details';
    public static readonly COLLECTION_DETAILS = 'collection-details';

    // Course Batch
    public static readonly COURSE_BATCHES = 'course-batches';

    // Resources Routs
    public static readonly RESOURCES = 'resources';
    public static readonly COLLECTION_DETAIL_ETB = 'collection-detail-etb';
    public static readonly CONTENT_DETAILS = 'content-details';
    public static readonly ENROLLMENT_DETAILS = 'enrollment-details';
    public static readonly TEXTBOOK_TOC = 'textbook-toc';

    // DownloadManger Routs
    public static readonly ACTIVE_DOWNLOADS = 'active-downloads';

    // Reports Routs
    public static readonly REPORTS_LIST = 'reports-list';
    public static readonly REPORTS = 'reports';
    public static readonly GROUP_REPORT = 'group-report';
    public static readonly USER_REPORT = 'user-report';

    // Player Routs
    public static readonly PLAYER = 'player';

    // Notification Routes
    public static readonly NOTIFICATION = 'notification';

    // Settings Routes
    public static readonly SETTINGS = 'settings';
    public static readonly DATA_SYNC = 'data-sync';
    public static readonly LANGUAGE_SETTING = 'language-setting';
    public static readonly PERMISSION = 'permission';
    public static readonly ABOUT_US = 'about-us';
    public static readonly ABOUT_APP = 'about-app';
    public static readonly PRIVACY_POLICY = 'privacy-policy';
    public static readonly TERMS_OF_SERVICE = 'terms-of-service';

    // Profile settings Routes
    public static readonly PROFILE_SETTINGS = 'profile-settings';

    // User Type Selection Routes
    public static readonly USER_TYPE_SELECTION = 'user-type-selection';

    // View more activity Routes
    public static readonly VIEW_MORE_ACTIVITY = 'view-more-activity';

    // Download manager Routes
    public static readonly DOWNLOAD_MANAGER = 'download-manager';
    public static readonly NO_DOWNLOADS = 'no-downloads';
    public static readonly DOWNLOADS_TAB = 'downloads-tab';
    public static readonly DOWNLOADS_HEADER = 'downloads-header';

    // Storage Settings Routes
    public static readonly STORAGE_SETTINGS = 'storage-settings';

    // Search Routes
    public static readonly SEARCH = 'search';

    // QR Scanner Routes
    public static readonly QRSCANNER_ALERT = 'qrscanner-alert';
    public static readonly QRCODERESULT = 'qrcoderesult';

    // Page Filter Routes
    public static readonly PAGE_FILTER = 'page-filter';
    public static readonly PAGE_FILTER_OPTIONS = 'page-filter-options';

    // Help Routes
    public static readonly FAQ_HELP = 'faq-help';

    // Terms and conditions Routes
    public static readonly TERMS_AND_CONDITIONS = 'terms-and-conditions';

    public static readonly ONBOARDING = 'onboarding';

    public static readonly LIBRARY_TAB = `/${RouterLinks.TABS}/${RouterLinks.RESOURCES}`;
    public static readonly COURSE_TAB = `/${RouterLinks.TABS}/${RouterLinks.COURSES}`;
    public static readonly PROFILE_TAB = `/${RouterLinks.TABS}/${RouterLinks.PROFILE}`;
    public static readonly GUEST_PROFILE_TAB = `/${RouterLinks.TABS}/${RouterLinks.GUEST_PROFILE}`;
    public static readonly DOWNLOAD_TAB = `/${RouterLinks.TABS}/${RouterLinks.DOWNLOAD_MANAGER}`;


    // TEXTBOOK view more page Routes
    public static readonly TEXTBOOK_VIEW_MORE = 'textbook-view-more';

}
