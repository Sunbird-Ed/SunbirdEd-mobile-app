import {ProfileSource, ProfileType} from 'sunbird-sdk';

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
        rootOrgId: 'sample_org_id'
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
    recoveryPhone: '987654'
};
