import { CsPrimaryCategory } from '@project-sunbird/client-services/services/content';
export class PrimaryCategory {

    public static readonly FOR_COURSE_TAB = [
        CsPrimaryCategory.COURSE,
        CsPrimaryCategory.TEACHER_RESOURCE,
        CsPrimaryCategory.LEARNING_RESOURCE,
        CsPrimaryCategory.EXPLANATION_CONTENT,
        CsPrimaryCategory.CONTENT_PLAYLIST,
        CsPrimaryCategory.DIGITAL_TEXTBOOK,
        CsPrimaryCategory.PRACTICE_QUESTION_SET,
        CsPrimaryCategory.E_TEXTBOOK,
        CsPrimaryCategory.COURSE_ASSESSMENT
    ];
    public static readonly FOR_LIBRARY_TAB = [
        CsPrimaryCategory.COURSE,
        CsPrimaryCategory.TEACHER_RESOURCE,
        CsPrimaryCategory.LEARNING_RESOURCE,
        CsPrimaryCategory.EXPLANATION_CONTENT,
        CsPrimaryCategory.CONTENT_PLAYLIST,
        CsPrimaryCategory.DIGITAL_TEXTBOOK,
        CsPrimaryCategory.PRACTICE_QUESTION_SET,
        CsPrimaryCategory.E_TEXTBOOK,
        CsPrimaryCategory.COURSE_ASSESSMENT
    ];
    public static readonly FOR_DOWNLOADED_TAB = PrimaryCategory.FOR_LIBRARY_TAB;

    public static readonly FOR_DIAL_CODE_SEARCH = [
        CsPrimaryCategory.DIGITAL_TEXTBOOK,
        CsPrimaryCategory.TEXTBOOK_UNIT,
        CsPrimaryCategory.COURSE
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
    public static readonly DOCS = ['application/pdf', 'application/epub', 'application/msword'];
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
        'se_boards',
        'se_gradeLevels',
        'subject',
        'se_mediums',
        'primaryCategory',
        'publisher',
        'mimeType',
        'audience',
        'additionalCategories'
    ];

    public static readonly FACETS_COURSE = [
        'topic',
        'purpose',
        'gradeLevel',
        'subject',
        'medium',
        'contentType',
        'primaryCategory',
        'channel'
    ];
}

export class BatchConstants {
    public static readonly REQUIRED_FIELDS = [
        'identifier',
        'id',
        'name',
        'enrollmentType',
        'description',
        'hashTagId',
        'courseId',
        'status',
        'createdBy',
        'startDate',
        'endDate',
        'enrollmentEndDate',
        'cert_templates'
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
        'locations',
        'declarations',
        'externalIds'
    ];

    public static readonly CONTACT_TYPE_PHONE = 'phone';
    public static readonly CONTACT_TYPE_EMAIL = 'email';
}

export class ExploreConstants {
    public static readonly REQUIRED_FIELDS = [
        'identifier',
        'pkgVersion',
        'name',
        'appIcon',
        'subject',
        'medium',
        'board',
        'framework',
        'gradeLevel',
        'channel',
        'contentType',
        'mimeType',
        'resourceType',
        'status',
        'downloadUrl',
        'variants',
        'createdBy',
        'originData',
        'origin',
        'streamingUrl',
        'dialecodes',
        'size',
        'batches',
        'organisation',
        'trackable',
        'primaryCategory'
    ];
}

export class AudienceFilter {
    public static readonly GUEST_TEACHER = ['instructor', 'learner'];
    public static readonly GUEST_STUDENT = ['learner'];

    public static readonly LOGGED_IN_USER = ['instructor', 'learner'];
}

export class EventTopics {
    public static readonly COURSE_PAGE_ASSEMBLE_CHANNEL_CHANGE = 'COURSE_PAGE_ASSEMBLE_CHANNEL_CHANGE';
    public static readonly ENROL_COURSE_SUCCESS = 'ENROL_COURSE_SUCCESS';
    public static readonly UNENROL_COURSE_SUCCESS = 'UNENROL_COURSE_SUCCESS';
    public static readonly COURSE_STATUS_UPDATED_SUCCESSFULLY = 'COURSE_STATUS_UPDATED_SUCCESSFULLY';
    public static readonly REFRESH_ENROLL_COURSE_LIST = 'REFRESH_ENROLL_COURSE_LIST';
    public static readonly PLAYER_CLOSED = 'PLAYER_CLOSED';
    public static readonly SIGN_IN_RELOAD = 'SIGN_IN_RELOAD';
    public static readonly TOC_COLLECTION_CHILD_ID = 'TOC_COLLECTION_CHILD_ID';
    public static readonly HAMBURGER_MENU_CLICKED = 'HAMBURGER_MENU_CLICKED';
    public static readonly NEXT_CONTENT = 'event:NextContent';
    public static readonly DEEPLINK_CONTENT_PAGE_OPEN = 'DEEPLINK_CONTENT_PAGE_OPEN';
    public static readonly DEEPLINK_COLLECTION_PAGE_OPEN = 'DEEPLINK_COLLECTION_PAGE_OPEN';
    public static readonly DEEPLINK_COURSE_PAGE_OPEN = 'DEEPLINK_COURSE_PAGE_OPEN';
    public static readonly CONTENT_TO_PLAY = 'event:ContentToPlay';
    public static readonly COACH_MARK_SEEN = 'coach_mark_seen';
    public static readonly TAB_CHANGE = 'tab.change';
    public static readonly BANNER = 'banner';
    public static readonly NOTIFICATION_REFRESH = 'notification:refresh';
    public static readonly ORIENTATION = 'orientation';
    public static readonly LAST_ACCESS_ON = 'last_access_on';
}

export class ShareUrl {
    public static readonly CONTENT = '/play/content/';
    public static readonly COLLECTION = '/play/collection/';
    public static readonly COURSE = '/explore-course/course/';
}

export class MenuOverflow {
    public static readonly DOWNLOAD_FILTERS = ['CONTENT_SIZE', 'LAST_VIEWED'];
    public static readonly MENU_GROUP_CREATOR = ['MENU_EDIT_GROUP_DETAILS', 'FRMELEMENTS_LBL_DEACTIVATEGRP', 'ENABLE_DISCUSSION_FORUM', 'MENU_DELETE_GROUP'];
    public static readonly MENU_GROUP_ADMIN = ['MENU_EDIT_GROUP_DETAILS', 'FRMELEMENTS_LBL_DEACTIVATEGRP', 'ENABLE_DISCUSSION_FORUM', 'MENU_LEAVE_GROUP'];
    public static readonly MENU_GROUP_CREATOR_DISABLE_DF = ['MENU_EDIT_GROUP_DETAILS', 'FRMELEMENTS_LBL_DEACTIVATEGRP', 'DISABLE_DISCUSSION_FORUM', 'MENU_DELETE_GROUP'];
    public static readonly MENU_GROUP_ADMIN_DISABLE_DF = ['MENU_EDIT_GROUP_DETAILS', 'FRMELEMENTS_LBL_DEACTIVATEGRP', 'DISABLE_DISCUSSION_FORUM', 'MENU_LEAVE_GROUP'];
    public static readonly MENU_GROUP_CREATOR_SUSPENDED = ['FRMELEMENTS_LBL_ACTIVATEGRP', 'MENU_DELETE_GROUP'];
    public static readonly MENU_GROUP_ADMIN__SUSPENDED = ['FRMELEMENTS_LBL_ACTIVATEGRP', 'MENU_LEAVE_GROUP'];
    public static readonly MENU_GROUP_NON_ADMIN = ['MENU_LEAVE_GROUP'];
    public static readonly MENU_GROUP_MEMBER_NON_ADMIN = ['MENU_MAKE_GROUP_ADMIN', 'MENU_REMOVE_FROM_GROUP'];
    public static readonly MENU_GROUP_MEMBER_ADMIN = ['DISMISS_AS_GROUP_ADMIN', 'MENU_REMOVE_FROM_GROUP'];
    public static readonly MENU_GROUP_ACTIVITY_ADMIN = ['MENU_REMOVE_ACTIVITY'];
}

export class FormConstant {
    public static readonly DEFAULT_PAGE_COURSE_FILTER_PATH = 'data/form/pageassemble_course_filter.json';
    public static readonly DEFAULT_PAGE_LIBRARY_FILTER_PATH = 'data/form/pageassemble_library_filter.json';
}

export class PreferenceKey {
    public static readonly SELECTED_LANGUAGE_CODE = 'sunbirdselected_language_code';
    public static readonly DEVICE_LOCATION = 'device_location_new';
    public static readonly IP_LOCATION = 'ip_location_new';
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
    public static readonly COURSE_DATA_KEY = 'course_data';
    public static readonly BATCH_DETAIL_KEY = 'batch_detail';
    public static readonly CDATA_KEY = 'correlation';
    public static readonly IS_LOCATION_MANDATORY = 'is_location_mandatory';
    public static readonly SUBSCRIBE_TOPICS = 'subscribe_topics';
    public static readonly SHOW_EXTERNAL_VERIFICATION = 'show_external_verification';
    public static readonly CURRENT_USER_PROFILE = 'current_user_profile';
    public static readonly FCM_TOKEN = 'fcm_token';
    public static readonly SYNC_CONFIG = 'sync_config';
    public static readonly COACH_MARK_SEEN = 'coach_mark_seen';
    public static readonly PAGE_ASSEMBLE_ORGANISATION_ID = 'page_assemble_organisation_id';
    public static readonly CAMPAIGN_PARAMETERS = 'campaign_parameters';
    public static readonly CREATE_GROUP_INFO_POPUP = 'create_group_info_popup';
    public static readonly ADD_MEMBER_TO_GROUP_INFO_POPUP = 'add_member_to_group_info_popup';
    public static readonly NOTIFICAITON_RECEIVED_AT = 'notification_received_at';
    public static readonly CURRENT_SELECTED_THEME = 'current_selected_theme';
    public static readonly DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP = 'do_not_show_pnc_popup';
    public static readonly IS_JOYFUL_THEME_POPUP_DISPLAYED = 'is_joyful_theme_popup_displayed';
    public static readonly SELECTED_SWITCHABLE_TABS_CONFIG = 'selected_switchable_tabs_config';
    public static readonly IS_NEW_USER = 'is_new_user';
    public static readonly NAVIGATION_SOURCE = 'navigation_source';
    public static readonly IS_GOOGLE_LOGIN = 'is_google_login';
    public static readonly IS_APPLE_LOGIN = 'is_apple_login';
    public static readonly ORIENTATION = 'orientation';
    public static readonly GUEST_USER_LOCATION = 'guest-user-location';
}

export enum SwitchableTabsConfig {
    RESOURCE_COURSE_TABS_CONFIG = 'RESOURCE_COURSE_TABS_CONFIG',
    HOME_DISCOVER_TABS_CONFIG = 'HOME_DISCOVER_TABS_CONFIG'
}

export class GenericAppConfig {
    public static readonly SUPPORT_EMAIL = 'SUPPORT_EMAIL';
    public static readonly VERSION_NAME = 'REAL_VERSION_NAME';
    public static readonly VERSION_CODE = 'VERSION_CODE';
    public static readonly MAX_COMPATIBILITY_LEVEL = 'MAX_COMPATIBILITY_LEVEL';
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
        label: 'অসমীয়া',
        code: 'as',
        isApplied: false,
        name: 'Assamese'
    },
    {
        label: 'বাংলা',
        code: 'bn',
        isApplied: false,
        name: 'Bengali'
    },
    {
        label: 'ગુજરાતી',
        code: 'gu',
        isApplied: false,
        name: 'Gujarati'
    },
    {
        label: 'ಕನ್ನಡ',
        code: 'kn',
        isApplied: false,
        name: 'Kannada'
    },
    {
        label: 'मराठी',
        code: 'mr',
        isApplied: false,
        name: 'Marathi'
    },
    {
        label: 'ଓଡ଼ିଆ',
        code: 'or',
        isApplied: false,
        name: 'Oriya'
    },
    {
        label: 'ਪੰਜਾਬੀ',
        code: 'pa',
        isApplied: false,
        name: 'Punjabi'
    },
    {
        label: 'தமிழ்',
        code: 'ta',
        isApplied: false,
        name: 'Tamil'
    },
    {
        label: 'తెలుగు',
        code: 'te',
        isApplied: false,
        name: 'Telugu'
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

export class ViewMore {
    public static readonly PAGE_COURSE_ENROLLED = 'course.EnrolledCourses';
    public static readonly PAGE_COURSE_POPULAR = 'course.PopularContent';
    public static readonly PAGE_TV_PROGRAMS = 'library.TvPrograms';
}

export class Location {
    public static readonly TYPE_STATE = 'state';
    public static readonly TYPE_DISTRICT = 'district';
    public static readonly TYPE_BLOCK = 'block';
    public static readonly TYPE_CLUSTER = 'cluster';
    public static readonly TYPE_SCHOOL = 'school';
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
    public static readonly HOT_CODE_PUSH_KEY = 'hotCodePush';
    public static readonly GROUPS_TNC = 'groupsTnc';
    public static readonly GOOGLE_CLIENT_ID = 'googleClientId';
}

export class StoreRating {
    public static readonly DATE_DIFF = 2;
    public static readonly APP_MIN_RATE = 4;
    public static readonly FOLDER_NAME = 'sunbird-app-rating';
    public static readonly FILE_NAME = 'app-rating.doc';
    public static readonly FILE_TEXT = 'APP-Rating';
    public static readonly RETURN_CLOSE = 'close';
    public static readonly RETURN_HELP = 'help';
    // public static readonly DEVICE_FOLDER_PATH = cordova.file.dataDirectory;
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
    public static readonly CODE_PRIMARY_CATEGORY = 'primaryCategory';
    public static readonly CONTENT_STATUS_UNLISTED = 'Unlisted';
}

export class LocationConfig {
    public static readonly CODE_SKIP = 'skip';
    public static readonly SKIP_DEVICE = 'device';
    public static readonly SKIP_USER = 'user';
}

export class ActionType {
    public static readonly CODE_PUSH = 'codePush';
    public static readonly COURSE_UPDATE = 'courseUpdate';
    public static readonly CONTENT_UPDATE = 'contentUpdate';
    public static readonly BOOK_UPDATE = 'bookUpdate';
    public static readonly UPDATE_APP = 'updateApp';
    public static readonly EXT_URL = 'extURL';
    public static readonly CONTENT_URL = 'contentURL';
    public static readonly CERTIFICATE = 'certificateUpdate';
    public static readonly SEARCH = 'search';
}

export class RouterLinks {
    public static readonly TABS = 'tabs';
    public static readonly TABS_COURSE = 'tabs/courses';

    // Profile Routs
    public static readonly PROFILE = 'profile';
    public static readonly GUEST_EDIT = 'guest-edit';
    public static readonly GUEST_PROFILE = 'guest-profile';
    public static readonly PERSONAL_DETAILS_EDIT = 'personal-details-edit';
    public static readonly CATEGORIES_EDIT = 'categories-edit';
    public static readonly SUB_PROFILE_EDIT = 'sub-profile-edit';
    public static readonly MANAGE_USER_PROFILES = 'manage-user-profiles';
    public static readonly SELF_DECLARED_TEACHER_EDIT = 'self-declared-teacher-edit';
    public static readonly FRAMEWORK_SELECTION = 'framework-selection';
    public static readonly CERTIFICATE_VIEW = 'certificate-view';

    // Courses Routs
    public static readonly COURSES = 'courses';
    public static readonly ENROLLED_COURSE_DETAILS = 'enrolled-course-details';
    public static readonly COLLECTION_DETAILS = 'collection-details';

    // Course Batch
    public static readonly COURSE_BATCHES = 'course-batches';
    // ADMIN HOME Routes
    public static readonly ADMIN_HOME = 'admin-home';

    // Resources Routs
    public static readonly RESOURCES = 'resources';
    public static readonly COLLECTION_DETAIL_ETB = 'collection-detail-etb';
    public static readonly CONTENT_DETAILS = 'content-details';
    public static readonly ENROLLMENT_DETAILS = 'enrollment-details';
    public static readonly TEXTBOOK_TOC = 'textbook-toc';
    public static readonly EXPLORE_BOOK = 'explore-book';
    public static readonly RELEVANT_CONTENTS = 'relevant-contents';

    // HOME Routes
    public static readonly HOME = 'home';

    // DownloadManger Routs
    public static readonly ACTIVE_DOWNLOADS = 'active-downloads';

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
    public static readonly DISTRICT_MAPPING = 'district-mapping';

    // Profile settings Routes
    public static readonly PROFILE_SETTINGS = 'profile-settings';

    // User Type Selection Routes
    public static readonly USER_TYPE_SELECTION = 'user-type-selection';
    public static readonly USER_TYPE_SELECTION_LOGGEDIN = 'user-type-selection-loggedin';

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

    public static readonly LIBRARY_TAB = `/${RouterLinks.TABS}/${RouterLinks.RESOURCES}`;
    public static readonly COURSE_TAB = `/${RouterLinks.TABS}/${RouterLinks.COURSES}`;
    public static readonly HOME_TAB = `/${RouterLinks.TABS}/${RouterLinks.HOME}`;
    public static readonly SEARCH_TAB = `/${RouterLinks.TABS}/${RouterLinks.SEARCH}`;
    public static readonly PROFILE_TAB = `/${RouterLinks.TABS}/${RouterLinks.PROFILE}`;
    public static readonly GUEST_PROFILE_TAB = `/${RouterLinks.TABS}/${RouterLinks.GUEST_PROFILE}`;
    public static readonly DOWNLOAD_TAB = `/${RouterLinks.TABS}/${RouterLinks.DOWNLOAD_MANAGER}`;
    public static readonly ONBOARDING_DISTRICT_MAPPING = `/${RouterLinks.DISTRICT_MAPPING}`;

    // TEXTBOOK view more page Routes
    public static readonly TEXTBOOK_VIEW_MORE = 'textbook-view-more';

    // faq Report Issue Pag
    public static readonly FAQ_REPORT_ISSUE = 'faq-report-issue';

    // routing to Term of use Web Page
    public static readonly TERM_OF_USE = '/privacy-policy/terms-of-use.html';

    // My Groups
    public static readonly MY_GROUPS = 'my-groups';
    public static readonly CREATE_EDIT_GROUP = 'create-edit-group';
    public static readonly MY_GROUP_DETAILS = 'group-details';
    public static readonly ADD_MEMBER_TO_GROUP = 'add-member-to-group';
    public static readonly ACTIVITY_DETAILS = 'activity-details';
    public static readonly ACTIVITY_TOC = 'activity-toc';
    public static readonly ADD_ACTIVITY_TO_GROUP = 'add-activity-to-group';
    public static readonly ACTIVITY_VIEW_MORE = 'activity-view-more';
    public static readonly ACTIVITY_DASHBOARD = 'activity-dashboard';

    // Curriculum courses
    public static readonly CURRICULUM_COURSES = 'curriculum-courses';
    public static readonly CHAPTER_DETAILS = 'chapter-details';

    //Manage learn router
    public static readonly PROGRAM = 'program';
    public static readonly SURVEY = 'survey';
    public static readonly PROJECT = 'project';
    public static readonly TEMPLATE = 'template';
    public static readonly PROJECT_TEMPLATE = 'project-templateview';
    public static readonly REPORTS = "reports";
    public static readonly OBSERVATION_SOLUTION_LISTING = `observation-solution-listing`;
    public static readonly OBSERVATION_SOLUTION_ENTITY_LISTING = `observation-solution-entity-listing`
    public static readonly PROJECT_REPORT = "project-report";
    public static readonly DEEPLINK_REDIRECT = "deeplink-redirect";
    public static readonly DETAILS = 'details';
    public static readonly TASK_VIEW = 'task-view';
    public static readonly LEARNING_RESOURCES = 'learning-resources';
    public static readonly SYNC = 'sync';
    public static readonly ATTACHMENTS = 'attachments';
    public static readonly PROJECT_EDIT = 'project-edit';
    public static readonly PROJECT_OPERATION = `project-operation`;
    public static readonly CREATE_PROJECT = `create-project`;
    public static readonly PROJECT_OPERATION_PAGE = `/${RouterLinks.PROJECT}/${RouterLinks.PROJECT_OPERATION}`;
    public static readonly CREATE_PROJECT_PAGE = `/${RouterLinks.PROJECT}/${RouterLinks.CREATE_PROJECT}`;
    public static readonly ATTACHMENTS_LIST = `/${RouterLinks.PROJECT}/${RouterLinks.ATTACHMENTS}`;
    public static readonly ADD_FILE='add-file';
    public static readonly ATTACHMENTS_LISTING = 'attachment-listing';


    public static readonly SOLUTIONS = 'solutions';
    public static readonly QUESTIONNAIRE = 'questionnaire';
    public static readonly OBSERVATION = 'observation';
    public static readonly SECTION_LISTING = 'section-listing';
    public static readonly ECM_LISTING = 'ecm-listing';
    public static readonly SUBMISSION_PREVIEW = 'submission_preview';
    public static readonly IMAGE_LISTING = 'image-listing';
    public static readonly ALL_EVIDENCE = 'all-evidence';
    public static readonly DOMAIN_ECM_LISTING = 'domain-ecm-listing';
    public static readonly IMP_SUGGESTIONS = 'imp-suggestions';

    // Observation routes
    public static readonly OBSERVATION_DETAILS = 'observation-details';
    public static readonly OBSERVATION_SUBMISSION = 'observation-submission';
    public static readonly OBSERVATION_REPORTS = 'observation-reports';
    public static readonly REPORT_WITH_SCORE = 'reports-with-score';
    public static readonly SURVEY_REPORTS = 'survey-reports';
    // category-list page
    public static readonly CATEGORY_LIST = 'category-list';
    public static readonly DISCUSSION = 'discussion-forum';

    public static readonly HOME_USER = 'user';
    public static readonly HOME_ADMIN = 'admin';
    // filter page
    public static readonly SEARCH_FILTER = 'search-filter';
    //assessment
    public static readonly GENERIC_REPORT = 'generic-report';
    // sign-in page
    public static readonly SIGN_IN = 'sign-in';
    // my-playlist page
    public static readonly MY_PLAYLIST = 'my-playlist';
    // Registration Pages
    public static readonly SIGNUP_BASIC = 'signup-basic-info';
    public static readonly SIGNUP_EMAIL = 'signup-email';
    public static readonly OTP = 'otp';
}

export class ShareItemType {
    public static readonly ROOT_CONTENT = 'root-content';
    public static readonly ROOT_COLECTION = 'root-collection';
    public static readonly LEAF_CONTENT = 'leaf-content';
    public static readonly APP = 'app';
}

export class ShareMode {
    public static readonly SHARE = 'share';
    public static readonly SEND = 'send';
    public static readonly SAVE = 'save';
}

export class LaunchType {
    public static readonly DEEPLINK = 'deeplink';
    public static readonly SIDELOAD = 'sideload';
}

export class ProgressPopupContext {
    public static readonly DEEPLINK = 'deeplink';
}

export class RegexPatterns {
    public static readonly SPECIALCHARECTERSANDEMOJIS =
        /([-!$%^&*()_+÷|~=`{}[:;<>?,.×/£¥"'@#\]]|[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
}

export class IgnoreTelemetryPatters {
    public static readonly IGNORE_DEEPLINK_PAGE_ID_EVENTS = /{"pageId":"resources"}|{"pageId":"library"}/;
    public static readonly IGNORE_DIAL_CODE_PAGE_ID_EVENTS = /{"pageId":"resources"}|{"pageId":"library"}|{"pageId":"home"}|{"pageId":"search"}/;
    public static readonly IGNORE_CHANNEL_IMPRESSION_EVENTS = /{"pageId":"resources"}|{"pageId":"library"}|{"pageId":"home"}|{"pageId":"onboarding-language-setting"}|{"pageId":"user-type-selection"}|{"pageId":profile-settings"}/;
    public static readonly IGNORE_SIGN_IN_PAGE_ID_EVENTS = /{"pageId":"resources"}|{"pageId":"library"}|{"pageId":"home"}|{"pageId":"profile"}|{"pageId":"courses"}/;
}

export class FormConfigCategories {
    public static readonly CONTENT = 'content';
}
export class FormConfigSubcategories {
    public static readonly CONTENT_QUALITY = 'contentquality';
    public static readonly CONTENT_AVAILABILITY = 'contentavailability';
}

export class GroupErrorCodes {
    public static readonly EXCEEDED_GROUP_MAX_LIMIT = 'EXCEEDED_GROUP_MAX_LIMIT';
    public static readonly EXCEEDED_MEMBER_MAX_LIMIT = 'EXCEEDED_MEMBER_MAX_LIMIT';
    public static readonly EXCEEDED_ACTIVITY_MAX_LIMIT = 'EXCEEDED_ACTIVITY_MAX_LIMIT';
}

export class AppThemes {
    public static readonly DEFAULT = 'DEFAULT';
    public static readonly JOYFUL = 'JOYFUL';
}
export class AppMode {
    public static readonly DEFAULT = 'DEFAULT';
    public static readonly DARKMODE = 'DARKMODE';
}

export class StatusBarTheme {
    public static readonly SET_DEFAULT = '#BB000000';
}

export class AssessmentConstant {
    public static readonly MAX_ATTEMPTS = 25;
}

export const ColorMapping = [
    {
        primary: 'rgba(255,139,46,1)',
        secondary: 'rgba(255,139,46,0.3)'
    },
    {
        primary: 'rgba(163,99,255,1)',
        secondary: 'rgba(163,99,255,0.3)'
    },
    {
        primary: 'rgba(34,139,255,1)',
        secondary: 'rgba(34,139,255,0.3)'
    },
    {
        primary: 'rgba(95,192,32,1)',
        secondary: 'rgba(95,192,32,0.3)'
    },
    {
        primary: 'rgba(255,128,47,1)',
        secondary: 'rgba(255,128,47,0.3)'
    },
    {
        primary: 'rgba(251,70,70,1)',
        secondary: 'rgba(251,70,70,0.3)'
    },
    {
        primary: 'rgba(83,109,252,1)',
        secondary: 'rgba(83,109,252,0.3)'
    },
    {
        primary: 'rgba(15,186,208,1)',
        secondary: 'rgba(15,186,208,0.3)'
    }
]

export const SubjectMapping = {
    english: {
        icon: 'assets/imgs/book_english.svg',
        theme: {
            iconBgColor: ColorMapping[0].primary,
            pillBgColor: ColorMapping[0].secondary
        }
    },
    mathematics: {
        icon: 'assets/imgs/calculator.svg',
        theme: {
            iconBgColor: ColorMapping[1].primary,
            pillBgColor: ColorMapping[1].secondary
        }
    },
    science: {
        icon: 'assets/imgs/globe.svg',
        theme: {
            iconBgColor: ColorMapping[2].primary,
            pillBgColor: ColorMapping[2].secondary
        }
    },
    default: {
        icon: 'assets/imgs/book_default.svg',
        theme: null
    }
}

export const PrimaryCaregoryMapping = {
    "digital textbooks": {
        icon: 'assets/imgs/textbook.svg'
    },
    "courses": {
        icon: 'assets/imgs/course.svg'
    },
    "tv programs": {
        icon: 'assets/imgs/tv.svg'
    },
    "documents": {
        icon: 'assets/imgs/documents.svg'
    },
    "videos": {
        icon: 'assets/imgs/videos.svg'
    },
    "default": {
        icon: 'assets/imgs/all_content.svg'
    }
}

export interface MaxAttempt {
    isLastAttempt: boolean;
    limitExceeded: boolean;
    isCloseButtonClicked: boolean;
}

export class OTPTemplates {
    public static readonly EDIT_CONTACT_OTP_TEMPLATE = 'otpContactUpdateTemplate';
}

export enum AppOrientation {
    LANDSCAPE = 'Landscape',
    PORTRAIT = 'Portrait'
}

export class OnboardingScreenType {
    public static readonly LANGUAGE_SETTINGS = 'language-setting';
    public static readonly USER_TYPE_SELECTION = 'user-type-selection';
    public static readonly PROFILE_SETTINGS = 'profile-settings';
    public static readonly DISTRICT_MAPPING = 'district-mapping';
}
