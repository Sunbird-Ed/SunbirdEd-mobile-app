import { Navigation } from '@angular/router';
import { Content, ContentData } from '@project-sunbird/sunbird-sdk';
import { PageId } from '../../services/telemetry-constants';

export const mockEnrolledData: Partial<Navigation> = {
  id: 7,
  initialUrl: '',
  trigger: 'imperative',
  previousNavigation: null,
  extras: {
    state: {
      source: PageId.GROUP_DETAIL,
      content: {
        ownershipType: [
          'createdBy'
        ],
        copyright: 'R2.1.0',
        subject: 'Biology',
        channel: '0127870805901967364',
        isAvailableLocally: false,
        downloadUrl: 'https:license-check-course_1576128983035_do_212911645382959104165_2.0_spine.ecar',
        organisation: [
          'R2.1.0'
        ],
        language: [
          'English'
        ],
        mimeType: 'application/vnd.ekstep.content-collection',
        variants: {
          online: {
            size: 6861
          },
          spine: {
            ecarUrl: 'https://11645382959104165/license-check-course_1576128983035_do_212911645382959104165_2.0_spine.ecar',
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
        appIcon: 'https://artifact/assessment_1569305945119.thumb.png',
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
        toc_url: 'https://artifact/do_212911645382959104165_toc.json',
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
      }
    }
  }
};

const data: Partial<ContentData> = {
  copyright: 'Odisha',
  subject: 'Physics',
  downloadUrl: 'https://ntpstagingall.blob.core.windows.net/sb-13081-2_1564037681733_do_21281258639073280011490_2.0_spine.ecar',
  channel: '01269936129926758441',
  organisation: 'Odisha',
  language: [
    'English',
    'Kannada'
  ],
  variants: {
    online: {
      ecarUrl: 'https://ntpstagingall.blob.core.windows.net_1564037681998_do_21281258639073280011490_2.0_online.ecar',
      size: 14437
    },
    spine: {
      ecarUrl: 'https://sb-13081-2_1564037681733_do_21281258639073280011490_2.0_spine.ecar',
      size: 136688
    }
  },
  mimeType: 'application/vnd.ekstep.content-collection',
  appIcon: 'https://ntpstagingall.thumb.jpg',
  gradeLevel: [
    'Class 2', 'Class 3'
  ],
  attributions: ['gd_1', 'gd_2'],
  me_averageRating: 4,
  contentEncoding: 'gzip',
  contentType: 'Course',
  primaryCategory: 'Course',
  identifier: 'do_21281258639073280011490',
  audience: [
    'Learner'
  ],
  contentTypesCount: '{\"CourseUnit\":7,\"Resource\":7}',
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
  osId: 'org.ekstep.quiz.app',
  license: 'Creative Commons Attribution (CC BY)',
  lastPublishedOn: '2019-07-25T06:54:41.549+0000',
  size: '136688',
  name: 'SB-13081-2',
  status: '',
  origin: 'do_21281254676783104011480',
  description: 'Enter description for Course',
  medium: 'English',
  createdOn: '2019-07 - 25T06: 33: 44.651+0000',
  contentDisposition: 'inline',
  originData: {
    license: 'Creative Commons Attribution(CC BY)',
    name: 'SB- 13081',
  },
  creator: 'Qualitrix Content Creator Cr',
  pkgVersion: '2',
  versionKey: '1564037680856',
  dialcodes: [
    'H7L1Q1'
  ],
  framework: 'TPD',
  createdBy: 'ab467e6e - 1f32 - 453c - b1d8 - c6b5fa6c7b9e',
  resourceType: 'Course',
  licenseDetails: { description: '', name: '', url: '' },
};

export const contentDetailsResponse: Content = {
  identifier: 'do_21281258639073280011490',
  contentData: data,
  isUpdateAvailable: false,
  mimeType: 'application / vnd.ekstep.content - collection',
  basePath: '',
  contentType: 'course',
  isAvailableLocally: true,
  referenceCount: 0,
  sizeOnDevice: 0,
  lastUsedTime: 0,
  lastUpdatedTime: 0,
  contentAccess: [],
  contentFeedback: [
    {
      contentId: 'SAMPLE_ID',
      rating: 4,
      comments: 'SAMPLE_COMMANTS',
      contentVersion: 'SAMPLE_VERSION_6'
    }, {
      contentId: 'SAMPLE_ID_1',
      rating: 4,
      comments: 'SAMPLE_COMMANTS',
      contentVersion: 'SAMPLE_VERSION_6'
    }
  ],
};

export const mockCourseCardData = {
  mimeTypesCount: '{\'video/webm\':1,\'application/vnd.ekstep.content-collection\':2,\'video/mp4\':1}',
  identifier: 'do_2127509908237926401406',
  size: 73058,
  name: 'Today today 29',
  status: 'Live',
  pkgVersion: 1,
  compatibilityLevel: 4,
  ownedBy: '0124784842112040965',
  resourceType: 'Course',
  node_id: 526456,
  batch: {
    identifier: '0127580528849387521',
    endDate: null,
    createdBy: 'ab467e6e-1f32-453c-b1d8-c6b5fa6c7b9e',
    name: '9may open batch',
    enrollmentType: 'open',
    startDate: '2019-05-09',
    status: 1
  }
};

export const mockCourseCardData_2 = {
  mimeTypesCount: '{\'video/webm\':1,\'application/vnd.ekstep.content-collection\':2,\'video/mp4\':1}',
  identifier: 'do_2127509908237926401406',
  size: 73058,
  name: 'Today today 29',
  status: 'Live',
  contentId: 'do_091231312312',
  pkgVersion: 1,
  compatibilityLevel: 4,
  ownedBy: '0124784842112040965',
  resourceType: 'Course',
  node_id: 526456,
  batchId: '0127580528849387521'
};

export const mockEnrolledCourses = [
  {
    dateTime: '2019-05-17 05:29:01.305Z',
    lastReadContentStatus: 2,
    contentId: 'do_2127509908237926401406',
    courseId: 'do_091231312312',
    progress: 50,
    batch: {
      identifier: '0127580528849387521',
      endDate: null,
      createdBy: 'ab467e6e-1f32-453c-b1d8-c6b5fa6c7b9e',
      name: '9may open batch',
      enrollmentType: 'open',
      startDate: '2019-05-09',
      status: 1
    },
    description: 'Enter description for Course',
    courseLogoUrl: 'https://ntpstagingall.blob.core.windows.net' +
      '/ntp-content-staging/content/do_2127509908237926401406/artifact/4c1dbdc7d062dd11cd5b8bf5bbd25d61_1551854311088.thumb.jpg',
    batchId: '0127580528849387521',
    userId: '993230e2-d9f5-44fe-8b9c-fbfe5a1a3204'
  }
];

export const mockExpiredBatchEnrolledCourses = [
  {
    dateTime: '2019-05-17 05:29:01.305Z',
    lastReadContentStatus: 2,
    contentId: 'do_2127509908237926401406',
    courseId: 'do_091231312312',
    progress: 50,
    batch: {
      identifier: '0127580528849387521',
      endDate: null,
      createdBy: 'ab467e6e-1f32-453c-b1d8-c6b5fa6c7b9e',
      name: '9may open batch',
      enrollmentType: 'open',
      startDate: '2019-05-09',
      status: 2
    },
    description: 'Enter description for Course',
    courseLogoUrl: 'https://ntpstagingall.blob.core.windows.net' +
      '/ntp-content-staging/content/do_2127509908237926401406/artifact/4c1dbdc7d062dd11cd5b8bf5bbd25d61_1551854311088.thumb.jpg',
    batchId: '0127580528849387521',
    userId: '993230e2-d9f5-44fe-8b9c-fbfe5a1a3204'
  }
];

export const mockGetChildDataResponse = [
  {
    identifier: 'do_2127509912525127681407',
    contentData: {
      identifier: 'do_2127509912525127681407',
      pkgVersion: 1,
      name: 'Unit 1',
      lastUpdatedOn: '2019-04-29T05:59:21.903+0000',
      contentType: 'CourseUnit',
      status: 'Live',
      downloadUrl: 'sample-download-url'
    },
    isUpdateAvailable: false,
    mimeType: 'application/vnd.ekstep.content-collection',
    contentType: 'courseunit',
    isAvailableLocally: false,
    referenceCount: 1,
    sizeOnDevice: 0,
    hierarchyInfo: [
      {
        identifier: 'do_2127509908237926401406',
        contentType: 'course'
      },
      {
        identifier: 'do_2127509912525127681407',
        contentType: 'courseunit'
      }
    ],
    children: [
      {
        identifier: 'do_21274246255366963214046',
        contentData: {
          size: 2466640,
          name: 'Sachin Mp4_1101',
          downloadUrl: 'sample-download-url'
        },
        isUpdateAvailable: false,
        mimeType: 'video/mp4',
        basePath: '/storage/emulated/0/Android/data/org.sunbird.app.staging/files/content/do_21274246255366963214046/',
        contentType: 'resource',
        isAvailableLocally: false,
        referenceCount: 1,
        sizeOnDevice: 2737,
        hierarchyInfo: [
          {
            identifier: 'do_2127509908237926401406',
            contentType: 'course'
          },
          {
            identifier: 'do_2127509912525127681407',
            contentType: 'courseunit'
          }
        ]
      }
    ]
  },
  {
    identifier: 'do_2127509912525127681408',
    contentData: {
      identifier: 'do_2127509912525127681408',
      name: 'Unit 2',
      contentType: 'CourseUnit',
      status: 'Live',
      size: 27717357,
      downloadUrl: 'sample-download-url'
    },
    isUpdateAvailable: false,
    mimeType: 'application/vnd.ekstep.content-collection',
    basePath: '',
    contentType: 'courseunit',
    isAvailableLocally: false,
    referenceCount: 1,
    sizeOnDevice: 0,
    hierarchyInfo: [
      {
        identifier: 'do_2127509908237926401406',
        contentType: 'course'
      },
      {
        identifier: 'do_2127509912525127681408',
        contentType: 'courseunit'
      }
    ],
    children: [
      {
        identifier: 'do_21274246302428364814048',
        contentData: {
          size: 27717357,
          name: 'sachin webm_1011',
          status: 'Live',
          downloadUrl: 'sample-download-url'
        },
        isUpdateAvailable: false,
        mimeType: 'video/webm',
        basePath: '/storage/emulated/0/Android/data/org.sunbird.app.staging/files/content/do_21274246302428364814048/',
        contentType: 'resource',
        isAvailableLocally: false,
        referenceCount: 1,
        sizeOnDevice: 2801,
        hierarchyInfo: [
          {
            identifier: 'do_2127509908237926401406',
            contentType: 'course'
          },
          {
            identifier: 'do_2127509912525127681408',
            contentType: 'courseunit'
          }
        ]
      }
    ]
  }
];

export const mockImportContentResponse = [
  {
    identifier: 'do_21274246255366963214046',
    status: 0
  },
  {
    identifier: 'do_21274246302428364814048',
    status: 0
  }
];

export const mockChildrenData = [
  {
    children: [
      {
        identifier: 'do_135241341148'
      },
      {
        identifier: 'do_135241345727'
      }
    ]
  },
  {
    children: [
      {
        identifier: 'do_135241341784'
      },
      {
        identifier: 'do_135521312312'
      }
    ]
  }
];

export const mockContentStatusData = {
  contentList: [
    {
      contentId: 'do_135241341148'
    },
    {
      contentId: 'do_135241345727'
    }
  ]
};

export const mockcontentHirerachyResponse = {
  children: mockChildrenData
};