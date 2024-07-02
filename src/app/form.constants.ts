import { CachedItemRequestSourceFrom, FormRequest } from '@project-sunbird/sunbird-sdk';

export class FormConstants {
    public static  SELF_DECLARATION: FormRequest = {
        from: CachedItemRequestSourceFrom.SERVER,
        type: 'user',
        subType: 'selfDeclaration_v3',
        action: 'submit',
        component: 'app'
    };

    public static  TENANT_PERSONAINFO: FormRequest = {
        type: 'user',
        subType: 'tenantPersonaInfo_v2',
        action: 'get',
        component: 'app'
    };

    public static  SUPPORTED_USER_TYPES: FormRequest = {
        type: 'config',
        subType: 'userType_v2',
        action: 'get',
        component: 'app'
    };

    public static  SEARCH_FILTER: FormRequest = {
        type: 'config',
        subType: 'search',
        action: 'filter_v3',
        component: 'app'
    };

    public static  LOCATION_DETAILS: FormRequest = {
        type: 'config',
        subType: 'locationDetails',
        action: 'get'
    };

    public static LOCATION_MAPPING: FormRequest = {
        type: 'profileConfig_v2',
        subType: 'default',
        action: 'get'
    };

    public static  DEEPLINK_CONFIG: FormRequest = {
        type: 'config',
        subType: 'deeplink',
        action: 'get'
    };

    public static  UTILITY_CONFIG: FormRequest = {
        type: 'config',
        subType: 'utility',
        action: 'get',
        component: 'app'
    };

    public static  VENDOR_APPS_CONFIG: FormRequest = {
        type: 'config',
        subType: 'vendorapps',
        action: 'get',
        component: 'app',
    };

    public static  PROJECT_CREATE_META: FormRequest = {
        type: 'user',
        subType: 'project',
        action: 'create'
    };

    public static  TASK_CREATE_META: FormRequest = {
        type: 'user',
        subType: 'project',
        action: 'createTask'
    };
    public static ML_HOME_CATEGORIES: FormRequest = {
        type: 'category',
        subType: 'targetedCategory',
        action: 'homeListing_v2'
    };
    public static SEGMENTATION: FormRequest = {
        type: 'config',
        subType: 'segmentation_v2',
        action: 'get',
        component: 'app'
    };

    public static FACET_FILTERS: FormRequest = {
        type: 'filterConfig',
        subType: 'default',
        action: 'get',
        component: 'app'
    };

    public static CONTENT_FEEDBACK: FormRequest = {
        type: 'contentfeedback',
        subType: 'en',
        action: 'get'
    };

    public static MANAGED_USER: FormRequest = {
        type: 'user',
        subType: 'manageduser',
        action: 'create',
        component: 'app'
    };

    public static LOGIN_CONFIG: FormRequest = {
        from: CachedItemRequestSourceFrom.SERVER,
        type: 'config',
        subType: 'login_v2',
        action: 'get'
    };

    public static UPGRADE_INFO: FormRequest = {
        type: 'app',
        subType: 'install',
        action: 'upgrade'
    };

    public static PAGEASSEMBLE_FILTER_COURSE: FormRequest = {
        type: 'pageassemble',
        subType: 'course',
        action: 'filter_v2',
    };

    public static PAGEASSEMBLE_FILTER_LIBRARY: FormRequest = {
        type: 'pageassemble',
        subType: 'library',
        action: 'filter_v2',
    };

    public static SUPPORTED_URL_REGEX: FormRequest = {
        type: 'config',
        subType: 'supportedUrlRegex',
        action: 'get'
    };

    public static LOCATION_CONFIG: FormRequest = {
        type: 'config',
        subType: 'location',
        action: 'get',
    };

    public static PDF_PLAYER_CONFIG: FormRequest = {
        type: 'config',
        subType: 'pdfPlayer_v2',
        action: 'get',
    };

    public static CONTENT_CONFIG: FormRequest = {
        type: 'config',
        subType: 'content_v2',
        action: 'filter',
    };

    public static EXTERNAL_ID_VERIFICATION: FormRequest = {
        type: 'user',
        subType: 'externalIdVerification',
        action: 'onboarding',
        from: CachedItemRequestSourceFrom.SERVER,
    };

    public static WEBVIEW_VERSION: FormRequest = {
        type: 'config',
        subType: 'webview_version',
        action: 'get',
    };

    public static DYNAMIC_FORM_CONFIG: FormRequest = {
        type: 'dynamicform',
        subType: 'support_v2',
        action: 'get',
        component: 'app'
    };

    public static CONTACT_INFO: FormRequest = {
        type: 'form',
        subType: 'boardContactInfo',
        action: 'get',
        component: 'app'
    };

    public static DYNAMIC_CONTENT_REQUEST: FormRequest = {
        type: 'dynamicForm',
        subType: 'contentRequest',
        action: 'submit',
        component: 'app'
    };

    public static CONSENT_DECLARATION: FormRequest = {
        type: 'dynamicForm',
        subType: 'consentDeclaration_v3',
        action: 'submit',
        component: 'app'
    };

    public static NOTIFICATION: FormRequest = {
        type: 'config',
        subType: 'notification',
        action: 'get',
        component: 'app'
    };

    public static BOARD_ALIAS: FormRequest = {
        type: 'config',
        subType: 'boardAlias',
        action: 'get',
        component: 'app'
    };

    public static SEARCH_FILTER_CONFIG: FormRequest = {
        type: 'config',
        subType: 'search',
        action: 'facet_filter',
        component: 'app'
    };

    public static CONTENT_AGGREGATOR: FormRequest = {
        type: 'config',
        subType: 'default',
        action: 'get',
        component: 'app',
    };

    public static FRAMEWORK_CONFIG: FormRequest = {
        type: 'config',
        subType: 'frameworkCategory',
        action: 'get',
        component: 'app',
    };
}
