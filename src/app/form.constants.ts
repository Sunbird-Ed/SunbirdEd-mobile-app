import { CachedItemRequestSourceFrom, FormRequest } from '@project-sunbird/sunbird-sdk';

export class FormConstants {
    public static  SELF_DECLARATION: FormRequest = {
        from: CachedItemRequestSourceFrom.SERVER,
        type: 'user',
        subType: 'selfDeclaration_v2',
        action: 'submit',
        component: 'app'
    };

    public static  TENANT_PERSONAINFO: FormRequest = {
        type: 'user',
        subType: 'tenantPersonaInfo',
        action: 'get',
        component: 'app'
    };

    public static  SUPPORTED_USER_TYPES: FormRequest = {
        type: 'config',
        subType: 'userType',
        action: 'get',
        component: 'app'
    };
}
