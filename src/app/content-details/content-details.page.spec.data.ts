import {Navigation} from '@angular/router';
import { PageId } from '../../services/telemetry-constants';

export const mockContentData: Partial<Navigation> = {
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
                appId: 'staging.sunbird.portal',
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
                contentTypesCount: '{\"CourseUnit\":1,\"Resource\":5}',
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
            },
            corRelation: [{id: 'do-123', type: 'Content'}],
            resumedCourseCardData: {
                contentId: 'do-123'
            },
            autoPlayQuizContent: true,
            source: PageId.GROUP_DETAIL,
            groupId: 'g1',
            activityList: []
        }
    }
};
