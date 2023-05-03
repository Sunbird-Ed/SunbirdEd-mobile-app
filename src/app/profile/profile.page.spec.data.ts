import {ProfileSource, ProfileType} from '@project-sunbird/sunbird-sdk';

export const mockProfileData = {
    uid: '123',
    userId: 'sample_user_id',
    handle: 'sample_name',
    medium: ['English', 'Bengali'],
    board: ['CBSE'],
    profileType: ProfileType.TEACHER,
    source: ProfileSource.SERVER,
    rootOrgId: 'sample_1',
    rootOrg: {
        rootOrgId: 'sample_org_id',
        hashTagId: 'sample_hashTagId'
    },
    roleList: [{id: 'teacher', name: 'private'}, {id: 'state_teacher', name: 'public'}],
    organisations: [{
        organisationId: 'xyz',
        roles: ['teacher', 'state_teacher'],
        locations: {
            state: 'tripura',
            district: 'west_tripura',
            block: 'dhaleshwar'
        }
    },
        {
            organisationId: 'abc',
            roles: ['teacher', 'state_teacher'],
            locations: {
                state: 'west-bengal',
                district: 'kolkata',
                block: 'howrah'
            }
        }],
    badgeAssertions: [
        'sample_badge1', 'sampleBadge 2'
    ],
    mappedTrainingCertificates: [1, 2, 3],
    phone: '99999999',
    email: 'xyz@gmail.com',
    recoveryEmail: 'abc@gmail.com',
    recoveryPhone: '987654',
    profileUserType: {
        type: 'teacher'
    },
    profileUserTypes: [{type: 'teacher'}, {type: 'student'}],
    declarations: [{
        orgId: 'sample_org_id',
        persona: 'sample_persona',
        status: 'sample_status',
        info: [{
            data: 'sample_data'
        }],
        errorType: 'sample_,error_type',
    }, {
        orgId: 'sample_org_id2'
    }],
    userLocations: [ 'State', 'District', 'Block', 'Cluster' ],
    framework: {
        medium: ['English', 'Bengali'],
        board: ['CBSE'],
    },
    serverProfile: {
        roles: [
            'teacher',
        'headmaster'
        ]
    }
};

export const paylod ={
    code:'name',
    children:[]
}
export const mockFormData =  [
                {
                    code: 'tenant',
                    templateOptions: {
                        options: [{
                            value: 'sample_org_id',
                            label: 'sample_label'
                        }
                        ],
                    },
                },
                {
                    code: 'externalIds',
                    children: [{
                        code: 0,
                        fieldName: 'sample_field_name'
                    }],
                    templateOptions: {
                        options: [{
                            value: 'sample_org_id',
                            label: 'sample_label'
                        }
                        ],
                    },
                }
            ];
