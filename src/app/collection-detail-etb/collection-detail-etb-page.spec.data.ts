import {Content, Rollup, TelemetryObject} from 'sunbird-sdk';
import {Navigation} from '@angular/router';

export const mockcollectionData: Partial<Navigation> = {
    id: 7,
    initialUrl: '',
    trigger: 'imperative',
    previousNavigation: null,
    extras: {
        state: {
            content: {
                ownershipType: [
                    'createdBy'
                ],
                copyright: 'R2.1.0',
                subject: 'Biology',
                channel: '0127870805901967364',
                isAvailableLocally: false,
                downloadUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_212911645382959104165/license-check-course_1576128983035_do_212911645382959104165_2.0_spine.ecar',
                organisation: [
                    'R2.1.0'
                ],
                language: [
                    'English'
                ],
                mimeType: 'application/vnd.ekstep.content-collection',
                variants: {
                    online: {
                        ecarUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_212911645382959104165/license-check-course_1576128983287_do_212911645382959104165_2.0_online.ecar',
                        size: 6861
                    },
                    spine: {
                        ecarUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_212911645382959104165/license-check-course_1576128983035_do_212911645382959104165_2.0_spine.ecar',
                        size: 94964
                    }
                },
                leafNodes: [
                    'do_212911623572824064157',
                    'do_212911626086563840154',
                    'do_212911626512154624155',
                    'do_212911625643237376158',
                    'do_212911626908123136157'
                ],
                objectType: 'Content',
                gradeLevel: [
                    'Class 3'
                ],
                appIcon: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_212911645382959104165/artifact/assessment_1569305945119.thumb.png',
                children: [
                    'do_212911623572824064157',
                    'do_212911626908123136157',
                    'do_212911626512154624155',
                    'do_212911626086563840154',
                    'do_212911625643237376158'
                ],
                appId: 'staging.diksha.portal',
                contentEncoding: 'gzip',
                lockKey: 'a8d2c96f-5921-4f88-861e-561046854667',
                mimeTypesCount: '{\'application/vnd.ekstep.content-collection\:1,\'application/vnd.ekstep.ecml-archive\:5}',
                totalCompressedSize: 72698,
                contentType: 'Course',
                identifier: 'do_212911645382959104165',
                audience: [
                    'Learner'
                ],
                visibility: 'Default',
                toc_url: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_212911645382959104165/artifact/do_212911645382959104165_toc.json',
                contentTypesCount: '{\'CourseUnit\:1,\'Resource\:5}',
                consumerId: 'a9cb3a83-a164-4bf0-aa49-b834cebf1c07',
                childNodes: [
                    'do_212911623572824064157',
                    'do_212911626086563840154',
                    'do_212911626512154624155',
                    'do_2129116460130713601733',
                    'do_212911625643237376158',
                    'do_212911626908123136157'
                ],
                batchId: 'SAMPLE_BATCH'
            }
        }
    }
};

export const contentDetailsMcokResponse1: Content = {
    identifier: 'do_21281258639073280011490',
    contentData: {
        ownershipType: [
            'createdBy'
        ],
        copyright: 'Odisha',
        me_totalDownloads: '1234.1234',
        keywords: [
            'test'
        ],
        subject: 'Physics',
        downloadUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21281258639073280011490/sb-13081-2_1564037681733_do_21281258639073280011490_2.0_spine.ecar',
        channel: '01269936129926758441',
        organisation: [
            'Odisha'
        ],
        language: [
            'English',
            'Kannada'
        ],
        variants: {
            online: {
                ecarUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21281258639073280011490/sb-13081-2_1564037681998_do_21281258639073280011490_2.0_online.ecar',
                size: 14437
            },
            spine: {
                ecarUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21281258639073280011490/sb-13081-2_1564037681733_do_21281258639073280011490_2.0_spine.ecar',
                size: 136688
            }
        },
        mimeType: 'application/vnd.ekstep.content-collection',
        leafNodes: [
            'do_212686708394631168156',
            'do_212686715674877952160',
            'do_212608790640934912148',
            'do_21266836993792409612969',
            'do_212686673493696512119',
            'do_2127319848127283201364',
            'do_21265698034243174413049'
        ],
        appIcon: ' ',
        gradeLevel: [
            'Class 2', 'Class 3'
        ],
        attributions: ['gd_1', 'gd_2'],
        me_totalRatings: 'diksha.org.app',
        contentFeedback: [{rating: 'SAMPLE_RATING'}],
        appId: 'staging.diksha.app',
        contentEncoding: 'gzip',
        c_Diksha_Stage_open_batch_count: 1,
        lockKey: '2e55369b-53e3-4e96-8ef1-25bd6da0642a',
        mimeTypesCount: '{\'application/vnd.ekstep.h5p-archive\:1,\'application/vnd.ekstep.html-archive\:1,\'video/webm\:1,\'application/pdf\:1,\'application/epub\:1,\'application/vnd.ekstep.content-collection\:7,\'video/x-youtube\:1,\'video/mp4\:1}',
        totalCompressedSize: 9617867,
        contentCredits: [
            {
                id: '0125683555607347207',
                name: 'Sachin 2808',
                type: 'user'
            }
        ],
        contentType: 'Course',
        lastUpdatedBy: 'ab467e6e-1f32-453c-b1d8-c6b5fa6c7b9e',
        identifier: 'do_21281258639073280011490',
        audience: [
            'Learner'
        ],
        visibility: 'Default',
        toc_url: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21281258639073280011490/artifact/do_21281258639073280011490_toc.json',
        contentTypesCount: '{\'CourseUnit\:7,\'Resource\:7}',
        childNodes: [
            'do_21281258639128166411497',
            'do_212686715674877952160',
            'do_212608790640934912148',
            'do_21281258639126528011492',
            'do_21281258639126528011493',
            'do_21266836993792409612969',
            'do_21281258639127347211494',
            'do_21281258639127347211495',
            'do_21281258639127347211496',
            'do_21265698034243174413049',
            'do_21281258639125708811491',
            'do_212686708394631168156',
            'do_212686673493696512119',
            'do_2127319848127283201364'
        ],
        consumerId: 'a9cb3a83-a164-4bf0-aa49-b834cebf1c07',
        mediaType: 'content',
        osId: 'org.ekstep.quiz.app',
        ageGroup: [
            '5-6'
        ],
        languageCode: [
            'en',
            'ka'
        ],
        lastPublishedBy: 'dca7518d-5886-4251-94aa-360c762b1182',
        version: 2,
        c_diksha_stage_open_batch_count: 1,
        tags: [
            'test'
        ],
        prevState: 'Review',
        license: 'Creative Commons Attribution (CC BY)',
        lastPublishedOn: '2019-07-25T06:54:41.549+0000',
        size: '136688',
        domain: [
            'Artificial_Intelligence'
        ],
        name: 'SB-13081-2',
        topic: [
            'Teaching and Classroom Management'
        ],
        status: '',
        code: 'org.sunbird.64hCxM.copy',
        purpose: 'Teaching Techniques',
        origin: 'do_21281254676783104011480',
        description: 'Enter description for Course',
        medium: 'English',
        idealScreenSize: 'normal',
        posterImage: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_2127857103817932801565/artifact/1500_1560755661944.jpg',
        createdOn: '2019-07 - 25T06: 33: 44.651+0000',
        c_Diksha_Stage_private_batch_count: 0,
        contentDisposition: 'inline',
        lastUpdatedOn: '2019-07 - 25T06: 54: 40.288+0000',
        originData: {
            license: 'Creative Commons Attribution(CC BY)',
            name: 'SB- 13081',

        },
        SYS_INTERNAL_LAST_UPDATED_ON: '2019 - 08 - 09T18: 33: 01.908 + 0000',
        dialcodeRequired: 'No',
        creator: 'Qualitrix Content Creator Cr',
        createdFor: [
            '0124784842112040965'
        ],
        lastStatusChangedOn: '2019 - 07 - 25T06: 54: 40.275 + 0000',
        os: [
            'All'
        ],
        pkgVersion: '2',
        versionKey: '1564037680856',
        idealScreenDensity: 'hdpi',
        s3Key: 'ecar_files / do_21281258639073280011490 / sb - 13081 -2_1564037681733_do_21281258639073280011490_2.0_spine.ecar',
        depth: 0,
        dialcodes: [
            'H7L1Q1'
        ],
        framework: 'TPD',
        lastSubmittedOn: '2019 - 07 - 25T06: 53: 44.465 + 0000',
        createdBy: 'ab467e6e - 1f32 - 453c - b1d8 - c6b5fa6c7b9e',
        leafNodesCount: 7,
        compatibilityLevel: 4,
        resourceType: 'Course',
        licenseDetails: {description: '', name: '', url: ''},
        // isAvailableLocally: false
    },
    contentFeedback: [{
        contentId: 'd0_123456',
        rating: 1,
        comments: 'string',
        createdAt: 1,
        stageId: 'string',
        contentVersion: 'string',
    }],
    isUpdateAvailable: true,
    mimeType: 'application / vnd.ekstep.content - collection',
    basePath: '../android/path/',
    contentType: 'course',
    isAvailableLocally: true,
    referenceCount: 0,
    sizeOnDevice: 0,
    lastUsedTime: 0,
    lastUpdatedTime: 0,
    contentAccess: [],
};

export const contentDetailsMcokResponse2: Content = {
    identifier: 'do_21281258639073280011490',
    contentData: {
        ownershipType: [
            'createdBy'
        ],
        copyright: 'Odisha',
        me_totalDownloads: '1234.1234',
        keywords: [
            'test'
        ],
        subject: 'Physics',
        downloadUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21281258639073280011490/sb-13081-2_1564037681733_do_21281258639073280011490_2.0_spine.ecar',
        channel: '01269936129926758441',
        organisation: [
            'Odisha'
        ],
        language: [
            'English',
            'Kannada'
        ],
        variants: {
            online: {
                ecarUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21281258639073280011490/sb-13081-2_1564037681998_do_21281258639073280011490_2.0_online.ecar',
                size: 14437
            },
            spine: {
                ecarUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21281258639073280011490/sb-13081-2_1564037681733_do_21281258639073280011490_2.0_spine.ecar',
                size: 136688
            }
        },
        mimeType: 'application/vnd.ekstep.content-collection',
        leafNodes: [
            'do_212686708394631168156',
            'do_212686715674877952160',
            'do_212608790640934912148',
            'do_21266836993792409612969',
            'do_212686673493696512119',
            'do_2127319848127283201364',
            'do_21265698034243174413049'
        ],
        appIcon: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21281254676783104011480/artifact/1500_1560755661944.thumb.jpg',
        gradeLevel: [
            'Class 2', 'Class 3'
        ],
        attributions: ['gd_1', 'gd_2'],
        me_totalRatings: 'diksha.org.app',
        contentFeedback: [{rating: 'SAMPLE_RATING'}],
        appId: 'staging.diksha.app',
        contentEncoding: 'gzip',
        c_Diksha_Stage_open_batch_count: 1,
        lockKey: '2e55369b-53e3-4e96-8ef1-25bd6da0642a',
        mimeTypesCount: '{\'application/vnd.ekstep.h5p-archive\:1,\'application/vnd.ekstep.html-archive\:1,\'video/webm\:1,\'application/pdf\:1,\'application/epub\:1,\'application/vnd.ekstep.content-collection\:7,\'video/x-youtube\:1,\'video/mp4\:1}',
        totalCompressedSize: 9617867,
        contentCredits: [
            {
                id: '0125683555607347207',
                name: 'Sachin 2808',
                type: 'user'
            }
        ],
        contentType: 'Course',
        lastUpdatedBy: 'ab467e6e-1f32-453c-b1d8-c6b5fa6c7b9e',
        identifier: 'do_21281258639073280011490',
        audience: [
            'Learner'
        ],
        visibility: 'Default',
        toc_url: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21281258639073280011490/artifact/do_21281258639073280011490_toc.json',
        contentTypesCount: '{\'CourseUnit\:7,\'Resource\:7}',
        childNodes: [
            'do_21281258639128166411497',
            'do_212686715674877952160',
            'do_212608790640934912148',
            'do_21281258639126528011492',
            'do_21281258639126528011493',
            'do_21266836993792409612969',
            'do_21281258639127347211494',
            'do_21281258639127347211495',
            'do_21281258639127347211496',
            'do_21265698034243174413049',
            'do_21281258639125708811491',
            'do_212686708394631168156',
            'do_212686673493696512119',
            'do_2127319848127283201364'
        ],
        consumerId: 'a9cb3a83-a164-4bf0-aa49-b834cebf1c07',
        mediaType: 'content',
        osId: 'org.ekstep.quiz.app',
        ageGroup: [
            '5-6'
        ],
        languageCode: [
            'en',
            'ka'
        ],
        lastPublishedBy: 'dca7518d-5886-4251-94aa-360c762b1182',
        version: 2,
        c_diksha_stage_open_batch_count: 1,
        tags: [
            'test'
        ],
        prevState: 'Review',
        license: 'Creative Commons Attribution (CC BY)',
        lastPublishedOn: '2019-07-25T06:54:41.549+0000',
        size: '136688',
        domain: [
            'Artificial_Intelligence'
        ],
        name: 'SB-13081-2',
        topic: [
            'Teaching and Classroom Management'
        ],
        status: '',
        code: 'org.sunbird.64hCxM.copy',
        purpose: 'Teaching Techniques',
        origin: 'do_21281254676783104011480',
        description: 'Enter description for Course',
        medium: 'English',
        idealScreenSize: 'normal',
        posterImage: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_2127857103817932801565/artifact/1500_1560755661944.jpg',
        createdOn: '2019-07 - 25T06: 33: 44.651+0000',
        c_Diksha_Stage_private_batch_count: 0,
        contentDisposition: 'inline',
        lastUpdatedOn: '2019-07 - 25T06: 54: 40.288+0000',
        originData: {
            license: 'Creative Commons Attribution(CC BY)',
            name: 'SB- 13081',

        },
        SYS_INTERNAL_LAST_UPDATED_ON: '2019 - 08 - 09T18: 33: 01.908 + 0000',
        dialcodeRequired: 'No',
        creator: 'Qualitrix Content Creator Cr',
        createdFor: [
            '0124784842112040965'
        ],
        lastStatusChangedOn: '2019 - 07 - 25T06: 54: 40.275 + 0000',
        os: [
            'All'
        ],
        pkgVersion: '2',
        versionKey: '1564037680856',
        idealScreenDensity: 'hdpi',
        s3Key: 'ecar_files / do_21281258639073280011490 / sb - 13081 -2_1564037681733_do_21281258639073280011490_2.0_spine.ecar',
        depth: 0,
        dialcodes: [
            'H7L1Q1'
        ],
        framework: 'TPD',
        lastSubmittedOn: '2019 - 07 - 25T06: 53: 44.465 + 0000',
        createdBy: 'ab467e6e - 1f32 - 453c - b1d8 - c6b5fa6c7b9e',
        leafNodesCount: 7,
        compatibilityLevel: 4,
        resourceType: 'Course',
        licenseDetails: {description: '', name: '', url: ''},
        // isAvailableLocally: false
    },
    contentFeedback: [{
        contentId: 'd0_123456',
        rating: 1,
        comments: 'string',
        createdAt: 1,
        stageId: 'string',
        contentVersion: 'string',
    }],
    isUpdateAvailable: false,
    mimeType: 'application / vnd.ekstep.content - collection',
    basePath: '../android/path/',
    contentType: 'course',
    isAvailableLocally: true,
    referenceCount: 0,
    sizeOnDevice: 0,
    lastUsedTime: 0,
    lastUpdatedTime: 0,
    contentAccess: [],

};

export const contentDetailsMcokResponse3: Content = {
    identifier: 'do_21281258639073280011490',
    contentData: {
        ownershipType: [
            'createdBy'
        ],
        copyright: 'Odisha',
        me_totalDownloads: '1234.1234',
        keywords: [
            'test'
        ],
        subject: 'Physics',
        downloadUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21281258639073280011490/sb-13081-2_1564037681733_do_21281258639073280011490_2.0_spine.ecar',
        channel: '01269936129926758441',
        organisation: [
            'Odisha'
        ],
        language: [
            'English',
            'Kannada'
        ],
        variants: {
            online: {
                ecarUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21281258639073280011490/sb-13081-2_1564037681998_do_21281258639073280011490_2.0_online.ecar',
                size: 14437
            },
            spine: {
                ecarUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21281258639073280011490/sb-13081-2_1564037681733_do_21281258639073280011490_2.0_spine.ecar',
                size: 136688
            }
        },
        mimeType: 'application/vnd.ekstep.content-collection',
        leafNodes: [
            'do_212686708394631168156',
            'do_212686715674877952160',
            'do_212608790640934912148',
            'do_21266836993792409612969',
            'do_212686673493696512119',
            'do_2127319848127283201364',
            'do_21265698034243174413049'
        ],
        appIcon: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21281254676783104011480/artifact/1500_1560755661944.thumb.jpg',
        gradeLevel: [
            'Class 2', 'Class 3'
        ],
        attributions: ['gd_1', 'gd_2'],
        me_totalRatings: 'diksha.org.app',
        contentFeedback: [{rating: 'SAMPLE_RATING'}],
        appId: 'staging.diksha.app',
        contentEncoding: 'gzip',
        c_Diksha_Stage_open_batch_count: 1,
        lockKey: '2e55369b-53e3-4e96-8ef1-25bd6da0642a',
        mimeTypesCount: '{\'application/vnd.ekstep.h5p-archive\:1,\'application/vnd.ekstep.html-archive\:1,\'video/webm\:1,\'application/pdf\:1,\'application/epub\:1,\'application/vnd.ekstep.content-collection\:7,\'video/x-youtube\:1,\'video/mp4\:1}',
        totalCompressedSize: 9617867,
        contentCredits: [
            {
                id: '0125683555607347207',
                name: 'Sachin 2808',
                type: 'user'
            }
        ],
        contentType: 'Course',
        lastUpdatedBy: 'ab467e6e-1f32-453c-b1d8-c6b5fa6c7b9e',
        identifier: 'do_21281258639073280011490',
        audience: [
            'Learner'
        ],
        visibility: 'Default',
        toc_url: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21281258639073280011490/artifact/do_21281258639073280011490_toc.json',
        contentTypesCount: '{\'CourseUnit\:7,\'Resource\:7}',
        childNodes: [
            'do_21281258639128166411497',
            'do_212686715674877952160',
            'do_212608790640934912148',
            'do_21281258639126528011492',
            'do_21281258639126528011493',
            'do_21266836993792409612969',
            'do_21281258639127347211494',
            'do_21281258639127347211495',
            'do_21281258639127347211496',
            'do_21265698034243174413049',
            'do_21281258639125708811491',
            'do_212686708394631168156',
            'do_212686673493696512119',
            'do_2127319848127283201364'
        ],
        consumerId: 'a9cb3a83-a164-4bf0-aa49-b834cebf1c07',
        mediaType: 'content',
        osId: 'org.ekstep.quiz.app',
        ageGroup: [
            '5-6'
        ],
        languageCode: [
            'en',
            'ka'
        ],
        lastPublishedBy: 'dca7518d-5886-4251-94aa-360c762b1182',
        version: 2,
        c_diksha_stage_open_batch_count: 1,
        tags: [
            'test'
        ],
        prevState: 'Review',
        license: 'Creative Commons Attribution (CC BY)',
        lastPublishedOn: '2019-07-25T06:54:41.549+0000',
        size: '136688',
        domain: [
            'Artificial_Intelligence'
        ],
        name: 'SB-13081-2',
        topic: [
            'Teaching and Classroom Management'
        ],
        status: '',
        code: 'org.sunbird.64hCxM.copy',
        purpose: 'Teaching Techniques',
        origin: 'do_21281254676783104011480',
        description: 'Enter description for Course',
        medium: 'English',
        idealScreenSize: 'normal',
        posterImage: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_2127857103817932801565/artifact/1500_1560755661944.jpg',
        createdOn: '2019-07 - 25T06: 33: 44.651+0000',
        c_Diksha_Stage_private_batch_count: 0,
        contentDisposition: 'inline',
        lastUpdatedOn: '2019-07 - 25T06: 54: 40.288+0000',
        originData: {
            license: 'Creative Commons Attribution(CC BY)',
            name: 'SB- 13081',

        },
        SYS_INTERNAL_LAST_UPDATED_ON: '2019 - 08 - 09T18: 33: 01.908 + 0000',
        dialcodeRequired: 'No',
        creator: 'Qualitrix Content Creator Cr',
        createdFor: [
            '0124784842112040965'
        ],
        lastStatusChangedOn: '2019 - 07 - 25T06: 54: 40.275 + 0000',
        os: [
            'All'
        ],
        pkgVersion: '2',
        versionKey: '1564037680856',
        idealScreenDensity: 'hdpi',
        s3Key: 'ecar_files / do_21281258639073280011490 / sb - 13081 -2_1564037681733_do_21281258639073280011490_2.0_spine.ecar',
        depth: 0,
        dialcodes: [
            'H7L1Q1'
        ],
        framework: 'TPD',
        lastSubmittedOn: '2019 - 07 - 25T06: 53: 44.465 + 0000',
        createdBy: 'ab467e6e - 1f32 - 453c - b1d8 - c6b5fa6c7b9e',
        leafNodesCount: 7,
        compatibilityLevel: 4,
        resourceType: 'Course',
        licenseDetails: {description: '', name: '', url: ''},
    },
    contentFeedback: [{
        contentId: 'd0_123456',
        rating: 1,
        comments: 'string',
        createdAt: 1,
        stageId: 'string',
        contentVersion: 'string',
    }],
    isUpdateAvailable: true,
    mimeType: 'application / vnd.ekstep.content - collection',
    basePath: '../android/path/',
    contentType: 'course',
    isAvailableLocally: false,
    referenceCount: 0,
    sizeOnDevice: 0,
    lastUsedTime: 0,
    lastUpdatedTime: 0,
    contentAccess: [],

};

export const mockContentData = {
    content: {
        identifier: 'do_21280756435836108811838',
        contentData: {
            ownershipType: [
                'createdBy'
            ],
            copyright: 'Odisha',
            previewUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/ecml/do_21280756435836108811838-latest',
            subject: [
                'Civics'
            ],
            channel: '0124784842112040965',
            downloadUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21280756435836108811838/18-july-2019_1563444045023_do_21280756435836108811838_8.0.ecar',
            questions: [
                {
                    identifier: 'do_21280770356321484812116',
                    name: 'MCQ- Image,Text,Audio\n',
                    description: null,
                    objectType: 'AssessmentItem',
                    relation: 'associatedTo',
                    status: 'Live'
                }
            ],
            organisation: [
                'Odisha'
            ],
            language: [
                'English'
            ],
            mimeType: 'application/vnd.ekstep.ecml-archive',
            variants: {
                spine: {
                    ecarUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging' +
                        '/ecar_files/do_21280756435836108811838/18-july-2019_1563444045699_do_21280756435836108811838_8.0_spine.ecar',
                    size: 8280
                }
            },
            editorState: '{"plugin":{"noOfExtPlugins":14,"extPlugins":' +
                '[{"plugin":"org.ekstep.contenteditorfunctions","version":"1.2"},{"plugin":"org.ekstep.keyboardshortcuts",' +
                '"version":"1.0"},{"plugin":"org.ekstep.richtext","version":"1.0"},{"plugin":"org.ekstep.iterator",' +
                '"version":"1.0"},{"plugin":"org.ekstep.navigation","version":"1.0"},{"plugin":"org.ekstep.reviewercomments",' +
                '"version":"1.0"},{"plugin":"org.ekstep.mathtext","version":"1.0"},{"plugin":"org.ekstep.libs.ckeditor",' +
                '"version":"1.1"},{"plugin":"org.ekstep.questionunit","version":"1.1"},{"plugin":"org.ekstep.questionunit.mtf","version":"1.2"},' +
                '{"plugin":"org.ekstep.questionunit.mcq","version":"1.2"},{"plugin":"org.ekstep.keyboard","version":"1.1"},' +
                '{"plugin":"org.ekstep.questionunit.reorder","version":"1.1"},' +
                '{"plugin":"org.ekstep.questionunit.sequence","version":"1.1"}]},' +
                '"stage":{"noOfStages":1,"currentStage":"1b201eab-5709-4765-a945-6753e3e4cc94",' +
                '"selectedPluginObject":"45432c4a-6115-4289-8d69-c0d1b5372198"},"sidebar":{"selectedMenu":"settings"}}',
            objectType: 'Content',
            gradeLevel: [
                'Class 1',
                'Class 2'
            ],
            appIcon: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21280756435836108811838/artifact/1300_1560755642839.thumb.jpg',
            collections: [
                {
                    identifier: 'do_21280774144907673612185',
                    name: 'Course_Batch_Check',
                    description: 'Enter description for Course',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_21280770501337907212120',
                    name: 'book with max count',
                    description: 'Testing',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_21281201129349120011354',
                    name: 'Book Name',
                    description: 'Enter description for TextBook',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_212832384395264000156',
                    name: 'explore 1umesh',
                    description: 'Enter description for TextBook',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_2128084233342238721390',
                    name: 'R 2.2.0 Draft book',
                    description: 'Enter description for TextBook',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_21281199177786982411021',
                    name: '1200',
                    description: 'Enter description for TextBook',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Retired'
                },
                {
                    identifier: 'do_21271215675870412813168',
                    name: 'Untitled Course',
                    description: 'Enter description for Course',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_21280759918483046411875',
                    name: 'SB-9759_ETB',
                    description: 'Enter description for TextBook',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_212808294478184448161',
                    name: 'Publish check',
                    description: 'Test',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_21281199177786982411021',
                    name: '1200',
                    description: 'Enter description for TextBook',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Retired'
                },
                {
                    identifier: 'do_2128084096298352641378',
                    name: 'R 2.2.0 Published lesson plan 2',
                    description: 'Enter description for Lessonplan',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_21285729783753932811482',
                    name: 'Book Update',
                    description: 'Enter description for TextBook',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_2128083230251253761149',
                    name: '19 july book 1',
                    description: 'Testing',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_2128084002645606401334',
                    name: '2.2.0 Draft lesson plan',
                    description: 'Enter description for Lessonplan',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                },
                {
                    identifier: 'do_21280772977047961612180',
                    name: 'C_55',
                    description: 'vnrionrervinrie',
                    objectType: 'Content',
                    relation: 'hasSequenceMember',
                    status: 'Live'
                }
            ],
            appId: 'staging.diksha.app',
            contentEncoding: 'gzip',
            artifactUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21280756435836108811838/artifact/1563444044487_do_21280756435836108811838.zip',
            lockKey: '53ef7e47-9374-45c3-ad26-af42e979ff54',
            sYS_INTERNAL_LAST_UPDATED_ON: '2019-07-25T00:35:35.201+0000',
            contentType: 'Resource',
            identifier: 'do_21280756435836108811838',
            lastUpdatedBy: 'ab467e6e-1f32-453c-b1d8-c6b5fa6c7b9e',
            audience: [
                'Learner'
            ],
            visibility: 'Default',
            consumerId: 'a9cb3a83-a164-4bf0-aa49-b834cebf1c07',
            mediaType: 'content',
            osId: 'org.ekstep.quiz.app',
            languageCode: [
                'en'
            ],
            lastPublishedBy: 'dca7518d-5886-4251-94aa-360c762b1182',
            version: 2,
            rejectReasons: [
                'Has Hate speech, Abuse, Violence, Profanity',
                'Has Sexual content, Nudity or Vulgarity',
                'Has Discriminatory or Defamatory content',
                'Is not suitable for children',
                'Inappropriate Title or Description',
                'Incorrect Board, Grade, Subject or Medium',
                'Inappropriate tags such as Resource Type or Concepts',
                'Irrelevant Keywords',
                'Content is NOT playing correctly',
                'CANNOT see the content clearly on Desktop and App',
                'Audio is NOT clear or NOT easy to understand',
                'Spelling mistakes found in text used',
                'Language is NOT simple to understand',
                'Others'
            ],
            license: 'CC BY-NC-SA 4.0',
            prevState: 'Review',
            size: 6194293,
            lastPublishedOn: '2019-07-18T10:00:45.020+0000',
            name: '18 july 2019',
            rejectComment: 'I have used that',
            topic: [
                'Addition -subtraction Of Fraction'
            ],
            status: 'Live',
            totalQuestions: 1,
            code: 'org.sunbird.Qdh1qn',
            description: 'Enter description for Resource',
            streamingUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/ecml/do_21280756435836108811838-latest',
            medium: [
                'Hindi'
            ],
            posterImage: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_2127857102249164801564/artifact/1300_1560755642839.jpg',
            idealScreenSize: 'normal',
            createdOn: '2019-07-18T04:16:23.588+0000',
            copyrightYear: 2019,
            contentDisposition: 'inline',
            lastUpdatedOn: '2019-07-18T10:00:42.536+0000',
            dialcodeRequired: 'No',
            lastStatusChangedOn: '2019-07-18T10:00:42.521+0000',
            createdFor: [
                '0124784842112040965'
            ],
            creator: 'Qualitrix Content Creator Cr',
            os: [
                'All'
            ],
            totalScore: 1,
            pkgVersion: 8,
            versionKey: '1563444043023',
            idealScreenDensity: 'hdpi',
            framework: 'up_k-12_3',
            s3Key: 'ecar_files/do_21280756435836108811838/18-july-2019_1563444045023_do_21280756435836108811838_8.0.ecar',
            me_averageRating: 4,
            lastSubmittedOn: '2019-07-18T09:59:59.807+0000',
            createdBy: 'ab467e6e-1f32-453c-b1d8-c6b5fa6c7b9e',
            compatibilityLevel: 2,
            board: 'State (Uttar Pradesh)',
            resourceType: 'Teach',
            licenseDetails: {
                name: 'CC BY-NC-SA 4.0',
                url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode',
                description: 'For details see below:'
            }
        },
        isUpdateAvailable: false,
        mimeType: 'application/vnd.ekstep.ecml-archive',
        basePath: '/storage/emulated/0/Android/data/org.sunbird.app.staging/files/content/do_21280756435836108811838/',
        contentType: 'resource',
        isAvailableLocally: false,
        referenceCount: 1,
        sizeOnDevice: 9910,
        lastUsedTime: 0,
        lastUpdatedTime: 1580366707000,
        hierarchyInfo: [
            {
                identifier: 'do_212810592322265088178',
                contentType: 'textbook'
            },
            {
                identifier: 'do_212810592541261824179',
                contentType: 'textbookunit'
            },
            {
                identifier: 'do_2128084096298352641378',
                contentType: 'lessonplan'
            },
            {
                identifier: 'do_2128084109778042881381',
                contentType: 'lessonplanunit'
            }
        ]
    }
};

export const mockContentInfo = {
    telemetryObject: {
        id: 'do_21280756435836108811838',
        type: 'Resource',
        version: 8
    },
    rollUp: {
        l1: 'do_212810592322265088178',
        l2: 'do_212810592541261824179',
        l3: 'do_2128084096298352641378',
        l4: 'do_2128084109778042881381'
    },
    hierachyInfo: [
        {
            identifier: 'do_212810592322265088178',
            contentType: 'textbook'
        },
        {
            identifier: 'do_212810592541261824179',
            contentType: 'textbookunit'
        },
        {
            identifier: 'do_2128084096298352641378',
            contentType: 'lessonplan'
        },
        {
            identifier: 'do_2128084109778042881381',
            contentType: 'lessonplanunit'
        }
    ]
};

