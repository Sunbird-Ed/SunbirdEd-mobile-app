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
        type: 'profileConfig',
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

    public static SEGMENTATION: FormRequest = {
        type: 'config',
        subType: 'segmentation_v2',
        action: 'get',
        component: 'app'
    }

}
