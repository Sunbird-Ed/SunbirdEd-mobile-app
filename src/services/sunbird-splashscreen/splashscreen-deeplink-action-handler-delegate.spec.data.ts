export const mockDeeplinkConfig = [
   {
     name: 'Dialcode parser',
     code: 'dialcode',
     pattern: '(\\/dial\\/(?<sunbird>[a-zA-Z0-9]+)|(\\/QR\\/\\?id=(?<epathshala>[a-zA-Z0-9]+)))',
     route: 'search'
   },
   {
     name: 'content deatil',
     code: 'contentDetail',
     pattern: '(?:\\/(?:resources\\/play\\/content|play\\/content|play\\/quiz)\\/(?<quizId>\\w+))',
     route: 'content-details'
   },
   {
     name: 'Textbook detail',
     code: 'textbookDetail',
     pattern: '(?:\\/play\\/(?:collection)\\/(?<content_id>\\w+))',
     route: 'collection-detail-etb',
     priority: 2
   },
   {
     name: 'Textbook content detail',
     code: 'textbookContentDetail',
     pattern: '(?:\\/play\\/(?:collection)\\/(?<content_id>\\w+)\\?(?=.*\\bcontentId\\b=(?<contentId>([^&]*)).*))',
     route: 'collection-detail-etb',
     priority: 1
   },
   {
     name: 'Course Detail',
     code: 'courseDetail',
     pattern: '(?:\\/(?:explore-course|learn)\\/course\\/(?<course_id>\\w+))',
     route: 'enrolled-course-details',
     priority: 3
   },
   {
     name: 'Module Detail',
     code: 'moduleDetail',
     pattern: '(?:\\/(?:explore-course|learn)\\/course\\/(?<course_id>\\w+)\\?(?=.*\\bmoduleId\\b=(?<moduleId>([^&]*)).*))',
     route: 'module-details',
     priority: 1
   },
   {
     name: 'Course Content Detail',
     code: 'courseContentDetail',
     pattern: '(?:\\/(?:explore-course|learn)\\/course\\/(?<course_id>\\w+)\\?(?=.*\\bcontentId\\b=(?<contentId>([^&]*)).*))',
     route: 'course-content-details',
     priority: 2
   },
   {
     name: 'Library',
     code: 'library',
     pattern: '\\/(resources|explore)$',
     route: 'tabs/resources'
   },
   {
     name: 'TakeSurvey',
     code: 'takeSurvey',
     pattern: '\\/manage-learn\\/take-survey\\/(?<survey_id>\\w+)',
     route: 'survey'
   },
   {
     name: 'Create Observation',
     code: 'createObservation',
     pattern: '\\/manage-learn\\/create-observation\\/(?<create_observation_id>\\w+)',
     route: 'deeplink-redirect/observationLink'
   },
   {
     name: 'Observation',
     code: 'observation',
     pattern: '\\/manage-learn\\/observation\\/(?<observation_id>\\w+)',
     route: 'content-details',
     priority: 6
   },
   {
     name: 'Reports',
     code: 'report',
     pattern: '\\/manage-learn\\/observation\\/reports\\/(?<report_id>\\w+)',
     route: 'content-details',
     priority: 5
   },
   {
     name: 'Profile',
     code: 'profile',
     pattern: '\\/(profile)$',
     route: 'tabs/profile'
   },
   {
     name: 'FAQ',
     code: 'faq',
     pattern: '\\/(faq)$',
     route: 'faq-help'
   },
   {
     name: 'Content attributes',
     code: 'attributes',
     pattern: '',
     route: '',
     params: {
       attributes: [
         {
           code: 'attributions',
           type: 'Array'
         },
         {
           code: 'author',
           type: 'String'
         },
         {
           code: 'compatibilityLevel',
           type: 'String'
         },
         {
           code: 'contentDisposition',
           type: 'String'
         },
         {
           code: 'contentEncoding',
           type: 'String'
         },
         {
           code: 'createdBy',
           type: 'String'
         },
         {
           code: 'createdFor',
           type: 'Array'
         },
         {
           code: 'dialcodes',
           type: 'String'
         },
         {
           code: 'language',
           type: 'Array'
         },
         {
           code: 'organisation',
           type: 'Array'
         },
         {
           code: 'organization',
           type: 'Array'
         },
         {
           code: 'rating',
           type: 'String'
         },
         {
           code: 'resourceType',
           type: 'Array'
         },
         {
           code: 'targetFWIds',
           type: 'Array'
         },
         {
           code: 'targetBoardIds',
           type: 'Array'
         },
         {
           code: 'targetGradeLevelIds',
           type: 'Array'
         },
         {
           code: 'targetMediumIds',
           type: 'Array'
         },
         {
           code: 'targetSubjectIds',
           type: 'Array'
         },
         {
           code: 'targetTopicIds',
           type: 'Array'
         },
         {
           code: 'userConsent',
           type: 'String'
         },
         {
           code: 'visibility',
           type: 'Array'
         },
         {
           code: 'medium',
           type: 'Array'
         },
         {
           code: 'gradeLevel',
           type: 'Array'
         },
         {
           code: 'board',
           type: 'Array'
         },
         {
           code: 'subject',
           type: 'Array'
         },
         {
           code: 'primaryCategory',
           type: 'Array'
         },
         {
           code: 'audience',
           type: 'Array'
         },
         {
           code: 'channel',
           type: 'Array'
         },
         {
           code: 'mimeType',
           type: 'Array',
           proxyCode: 'mediaType',
           filter: 'custom'
         }
       ]
     }
   },
   {
     name: 'Search Course',
     code: 'searchCourse',
     pattern: '\\/(explore-course|learn)(\\?.*|$)',
     route: 'tabs/search',
     priority: 4,
     params: {
       key: 'key',
       data: [
         {
           code: 'primaryCategory',
           values: [
             'Course',
             'Course Assessment'
           ],
           type: 'default'
         }
       ]
     }
   },
   {
     name: 'Search Textbook',
     code: 'searchTextbook',
     pattern: '\\/(resources|explore)(\\?.*selectedTab=textbook|$)',
     route: 'search',
     priority: 2,
     params: {
       key: 'key',
       data: [
         {
           code: 'primaryCategory',
           values: [
             'Digital Textbook',
             'eTextbook'
           ],
           type: 'default'
         }
       ]
     }
   },
   {
     name: 'Search TV Program',
     code: 'searchTvProgram',
     pattern: '\\/(resources|explore)\\?.*selectedTab=tvProgram',
     route: 'search',
     priority: 2,
     params: {
       key: 'key',
       data: [
         {
           code: 'primaryCategory',
           values: [
             'TVLesson'
           ],
           type: 'default'
         }
       ]
     }
   },
   {
     name: 'Search',
     code: 'searchAll',
     pattern: '\\/(search\\/Library|explore)\\/1(\\?.*|$)',
     route: 'search',
     priority: 1,
     params: {
       key: 'key',
       data: [
         {
           code: 'primaryCategory',
           values: [
             'Collection',
             'Resource',
             'Content Playlist',
             'Course',
             'Course Assessment',
             'Digital Textbook',
             'eTextbook',
             'Explanation Content',
             'Learning Resource',
             'Practice Question Set',
             'Teacher Resource',
             'LessonPlan',
             'FocusSpot',
             'Learning Outcome Definition',
             'Curiosity Questions',
             'MarkingSchemeRubric',
             'ExplanationResource',
             'ExperientialResource',
             'Practice Resource',
             'TVLesson'
           ],
           type: 'default'
         },
         {
           code: 'mimeType',
           values: [
             {
               name: 'all',
               options: [
                 'application/vnd.ekstep.ecml-archive',
                 'application/vnd.ekstep.html-archive',
                 'application/vnd.android.package-archive',
                 'application/vnd.ekstep.content-archive',
                 'application/vnd.ekstep.content-collection',
                 'application/vnd.ekstep.plugin-archive',
                 'application/vnd.ekstep.h5p-archive',
                 'application/epub',
                 'text/x-url',
                 'video/x-youtube',
                 'application/octet-stream',
                 'application/msword',
                 'application/pdf',
                 'image/jpeg',
                 'image/jpg',
                 'image/png',
                 'image/tiff',
                 'image/bmp',
                 'image/gif',
                 'image/svg+xml',
                 'video/avi',
                 'video/mpeg',
                 'video/quicktime',
                 'video/3gpp',
                 'video/mpeg',
                 'video/mp4',
                 'video/ogg',
                 'video/webm',
                 'audio/mp3',
                 'audio/mp4',
                 'audio/mpeg',
                 'audio/ogg',
                 'audio/webm',
                 'audio/x-wav',
                 'audio/wav'
               ]
             },
             {
               name: 'video',
               options: [
                 'video/avi',
                 'video/mpeg',
                 'video/quicktime',
                 'video/3gpp',
                 'video/mpeg',
                 'video/mp4',
                 'video/ogg',
                 'video/webm'
               ]
             },
             {
               name: 'documents',
               options: [
                 'application/pdf',
                 'application/epub',
                 'application/msword'
               ]
             },
             {
               name: 'interactive',
               options: [
                 'application/vnd.ekstep.ecml-archive',
                 'application/vnd.ekstep.h5p-archive',
                 'application/vnd.ekstep.html-archive'
               ]
             },
             {
               name: 'audio',
               options: [
                 'audio/mp3',
                 'audio/mp4',
                 'audio/mpeg',
                 'audio/ogg',
                 'audio/webm',
                 'audio/x-wav',
                 'audio/wav'
               ]
             }
           ],
           type: 'custom'
         }
       ]
     }
   }
 ]
