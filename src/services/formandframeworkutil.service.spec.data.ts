export const mockWebviewFormResponse = {
  form: {
    type: 'config',
    subtype: 'webview_version',
    action: 'get',
    data: {
      action: 'get',
      fields: [
        {
          version: '54'
        }
      ]
    }
  }
} as any;

export const mockExternalIdVerificationResponse = {
  form: {
    type: 'user',
    subtype: 'externalIdVerification',
    action: 'onboarding',
    data: {
      action: 'onboarding',
      fields: [
        {
          popupHeaderLabel: 'User Verification',
          headerLabel: 'Are you a government school teacher ?',
          fieldLabel: 'Enter your teacher ID for verification',
        }
      ]
    }
  }
} as any;

export const mockFAQSystemSettingsResponse = {
  id: 'faqURL',
  field: 'faqURL',
  value: 'sample_url'
};

export const mockComingSoonMessageSystemSettingsResponse = {
  id: 'contentComingSoonMsg',
  field: 'contentComingSoonMsg',
  value: '[{\"rootOrgId\":\"rootOrgId\",\"value\":\"Org specific coming soon message\",\"translations\":\"{\\\"en\\\":\\\"Coming soon message\\\"}\"}]'
};

export const mockCustodianOrIdResponse = {
  id: 'custodianOrgId',
  field: 'custodianOrgId',
  value: 'sample_custodianOrgId'
};

export const mockTPDFrameworkIdResponse = {
  id: 'courseFrameworkId',
  field: 'courseFrameworkId',
  value: 'sample_courseFrameworkId'
};

export const mockWebsessionConfigResponse = {
  type: 'config',
  subType: 'login',
  action: 'get',
  form: {
    data: {
      templateName: 'login',
      action: 'get',
      fields: [
        {
          context: 'login',
          target: {
            host: 'sample_base_url',
            path: 'base_path',
            params: [
              {
                key: 'redirect_uri',
                value: 'sample_redirect_uri'
              },
              {
                key: 'response_type',
                value: 'code'
              },
              {
                key: 'scope',
                value: 'offline_access'
              },
              {
                key: 'client_id',
                value: 'android'
              },
              {
                key: 'version',
                value: 4
              }
            ]
          },
          return: [
            {
              type: 'state-error',
              when: {
                host: 'sample_host',
                path: 'sample_path',
                params: [
                  {
                    key: 'error_message',
                    resolveTo: 'error_message'
                  }
                ]
              }
            },
            {
              type: 'password-reset-success',
              when: {
                host: 'sample_host',
                path: 'sample_path',
                params: [
                  {
                    key: 'client_id',
                    resolveTo: 'client_id'
                  }
                ]
              }
            },
            {
              type: 'password',
              when: {
                host: 'sample_host',
                path: 'sample_path',
                params: [
                  {
                    key: 'code',
                    resolveTo: 'code'
                  }
                ]
              }
            }
          ]
        },
        {
          context: 'migrate',
          target: {
            host: 'sample_host',
            path: 'sample_path',
            params: [
              {
                key: 'redirect_uri',
                value: 'sample_callback'
              },
              {
                key: 'response_type',
                value: 'code'
              }
            ]
          },
          return: [
            {
              type: 'password',
              when: {
                host: 'sample_host',
                path: 'sample_callback',
                params: [
                  {
                    key: 'code',
                    resolveTo: 'code'
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  }
} as any;

export const mockLibraryFilterConfigResponse = {
  form: {
    type: 'pageassemble',
    subtype: 'library',
    action: 'filter',
    data: {
      action: 'filter',
      fields: [
        {
          code: 'board',
          values: [],
          name: 'Board/Syllabus',
          index: 1
        },
        {
          code: 'gradeLevel',
          values: [],
          name: 'Class',
          index: 2
        },
        {
          code: 'subject',
          values: [],
          name: 'Subject',
          index: 3
        },
        {
          code: 'medium',
          values: [],
          name: 'Medium',
          index: 4
        },
        {
          code: 'contentType',
          values: [
            {
              code: 'Story',
              name: 'Story'
            }
          ],
          name: 'Resource Type',
          index: 5
        }
      ]
    }
  }
} as any;

export const mockCourseFilterConfigResponse =
  {
    form: {
      type: 'pageassemble',
      subtype: 'course',
      action: 'filter',
      data: {
        action: 'filter',
        fields: [
          {
            code: 'board',
            values: [],
            name: 'Board/Syllabus',
            index: 1
          },
          {
            code: 'contentType',
            values: [
              {
                code: 'Story',
                name: 'Story'
              }
            ],
            name: 'Resource Type',
            index: 5
          }
        ]
      }
    }
  } as any;

export const mockDialCodeConfigResponse =
{
  form : {
    type :  'config' ,
    subtype :  'dialcode' ,
    action :  'get' ,
    data : {
      action :  'get' ,
      fields : [
       {
          name :  'Dialcode parser' ,
          code :  'dialcode' ,
          values :  'sample_regex'
       }
     ]
   }
 }
} as any;

export const mockLocationConfigResponse =
{
  form : {
    type :  'config' ,
    subtype :  'dialcode' ,
    action :  'get' ,
    data : {
      action :  'get' ,
      fields : [
        {
          name: 'Skip Location',
          code: 'skip',
          values: []
      }
     ]
   }
 }
} as any;

export const mockContentConfigResponse =
{
  form : {
    type :  'config' ,
    subtype :  'content_v2' ,
    action :  'filter' ,
    data : {
      action :  'filter' ,
      fields : [
       {
          name :  'library' ,
          code :  'primaryCategory' ,
          values : [
            'Course',
            'Learning Resource',
            'Explanation Content',
            'Teacher Resource',
            'Content Playlist',
            'Digital Textbook',
            'Practice Question Set',
            'eTextbook',
            'Course Assessment'
          ]
       },
       {
          name :  'course' ,
          code :  'primaryCategory' ,
          values : [
            'Course',
            'Learning Resource',
            'Explanation Content',
            'Teacher Resource',
            'Content Playlist',
            'Digital Textbook',
            'Practice Question Set',
            'eTextbook',
            'Course Assessment'
          ]
       },
       {
          name :  'downloads' ,
          code :  'primaryCategory' ,
          values : [
            'Course',
            'Learning Resource',
            'Explanation Content',
            'Teacher Resource',
            'Content Playlist',
            'Digital Textbook',
            'Practice Question Set',
            'eTextbook',
            'Course Assessment'
          ]
       },
       {
          name :  'dialcode' ,
          code :  'primaryCategory' ,
          values : [
            'Course',
            'Digital Textbook',
            'Textbook Unit'
          ]
       }
     ]
   }
 }
} as any;

export const mockforceUpgradeFormAPIResponse =
{
  form : {
    type :  'app' ,
    subtype :  'install' ,
    action :  'upgrade' ,
    data : {
      action :  'upgrade' ,
      fields : [
       {
          code :  'upgrade' ,
          name :  'Upgrade of app' ,
          language :  'en' ,
          range : [
           {
              minVersionCode : 13,
              maxVersionCode : 52,
              versionName :  '2.4.158' ,
              type :  'forced'
           }
         ],
          upgradeTypes : [
           {
              type :  'forced' ,
              title :  'Sample_title' ,
              desc :  '' ,
              actionButtons : [
               {
                  action :  'yes' ,
                  label :  'Update Now' ,
                  link :  'https://play.google.com/store/apps/details?id=org.sunbird.app&hl=en'
               }
             ]
           }
         ]
       }
     ]
   }
 }
} as any;

export const mockCategoryTermsResponse =
[
  {
    associations : [
     {
        identifier :  'ts_k-12_2_subject_english' ,
        code :  'english' ,
        translations : null,
        name :  'English' ,
        description :  'English' ,
        category :  'subject' ,
        status :  'Live'
     }
   ],
    identifier :  'ts_k-12_2_gradelevel_class1' ,
    code :  'class1' ,
    translations : null,
    name : 'Class 1' ,
    description : ' Class 1' ,
    index : 1,
    category :  'gradeLevel' ,
    status :  'Live'
 },
 {
     associations : [
      {
         identifier :  'ts_k-12_2_subject_english' ,
         code :  'english' ,
         translations : null,
         name :  'English' ,
         description :  'English' ,
         category :  'subject' ,
         status :  'Live'
      }
    ],
    identifier :  'ts_k-12_2_subject_telugu' ,
    code :  'telugu' ,
    translations : null,
    name :  'Telugu' ,
    description :  'Telugu' ,
    category :  'subject' ,
    status :  'Live'
  },
  {
     associations : [
      {
         identifier :  'ts_k-12_2_subject_mathematics' ,
         code :  'mathematics' ,
         translations : null,
         name :  'Mathematics' ,
         description :  'Mathematics' ,
         category :  'subject' ,
         status :  'Live'
      },
      {
         identifier :  'ts_k-12_2_subject_english' ,
         code :  'english' ,
         translations : null,
         name :  'English' ,
         description :  'English' ,
         category :  'subject' ,
         status :  'Live'
      },
      {
         identifier :  'ts_k-12_2_subject_evs' ,
         code :  'evs' ,
         translations : null,
         name :  'EVS' ,
         description :  'EVS' ,
         category :  'subject' ,
         status :  'Live'
      },
      {
         identifier :  'ts_k-12_2_subject_telugu' ,
         code :  'telugu' ,
         translations : 'null',
         name :  'Telugu' ,
         description :  'Telugu' ,
         category :  'subject' ,
         status :  'Live'
      }
    ],
     identifier :  'ts_k-12_2_gradelevel_class2' ,
     code :  'class2' ,
     translations : null,
     name :  'Class 2' ,
     description :  'Class 2' ,
     index : 2,
     category :  'gradeLevel' ,
     status :  'Live'
  }
] as any;

