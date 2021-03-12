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
        action: 'filter',
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

    public static  BATCH_END_TIMER: FormRequest = {
        type: 'config',
        subType: '',
        action: 'get',
        component: 'app'
    };

}
