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


export const mockPdfPlayerConfigurationResponse =
{
  form : {
    type :  'config' ,
    subtype :  'pdfPlayer' ,
    action :  'get' ,
    data : {
      action :  'get' ,
      fields : [
        {
          name: 'pdfPlayer',
          code: 'pdf',
          values: [
            {
              isEnabled: true
             }
          ]
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

export const mockTenantPersonaInfoForm = [
  {
    code: 'persona',
    type: 'select',
    templateOptions: {
      label: 'I am a',
      placeHolder: 'Select persona',
      options: [
        {
          value: 'teacher',
          label: 'Teacher'
        },
        {
          value: 'other',
          label: 'Other'
        }
      ]
    },
    validations: [
      {
        type: 'required',
        value: true,
        message: 'Persona is required'
      }
    ]
  },
  {
    code: 'tenant',
    type: 'select',
    templateOptions: {
      label: 'with',
      placeHolder: 'Select State/ Institution',
      options: [
        {
          label: 'Andhra Pradesh',
          value: '012320771042492416102'
        }
      ],
      validations: [
        {
          type: 'required',
          value: true,
          message: 'Persona is required'
        }
      ]
    }
  }
];

export const mockSelfDeclarationForm = [
  {
    code: 'name',
    type: 'label',
    templateOptions: {
      labelHtml: {
        contents: '<p>$0:&nbsp;$1</p>',
        values: {
          $0: 'NAME',
          $1: ''
        }
      }
    }
  },
  {
    code: 'state',
    type: 'label',
    templateOptions: {
      labelHtml: {
        contents: '<p>$0:&nbsp;$1</p>',
        values: {
          $0: 'STATE',
          $1: ''
        }
      }
    }
  },
  {
    code: 'district',
    type: 'label',
    templateOptions: {
      labelHtml: {
        contents: '<p>$0:&nbsp;$1</p>',
        values: {
          $0: 'DISTRICT',
          $1: ''
        }
      }
    }
  },
  {
    code: 'externalIds',
    type: 'nested_group',
    children: [
      {
        code: 'declared-phone',
        fieldName: 'Mobile Number',
        type: 'input',
        templateOptinputions: {
          labelHtml: {
            contents: '<span>$0&nbsp;<span class=\required-asterisk\>*</span></span>',
            values: {
              $0: 'PHONE_PLACEHOLDER'
            }
          },
          placeHolder: 'ENTER_PHONE_POPUP_TITLE',
          prefix: '+91 -'
        },
        validations: [
          {
            type: 'required',
            value: true,
            message: 'ERROR_PHONE_REQUIRED'
          },
          {
            type: 'pattern',
            value: '^[6-9*][0-9*]{9}$',
            message: 'ERROR_PHONE_INVALID'
          }
        ],
        asyncValidation: {
          marker: 'MOBILE_OTP_VALIDATION',
          message: 'PLEASE_VALIDATE_YOUR_MOBILE_NUMBER',
          trigger: 'validate'
        }
      },
      {
        code: 'declared-email',
        fieldName: 'Email Address',
        type: 'input',
        templateOptions: {
          placeHolder: 'EMAIL_PLACEHOLDER',
          label: 'EMAIL_ID_PLACEHOLDER'
        },
        validations: [
          {
            type: 'pattern',
            value: '^[A-Za-z0-9._*%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,}$',
            message: 'ERROR_EMAIL_INVALID'
          }
        ],
        asyncValidation: {
          marker: 'EMAIL_OTP_VALIDATION',
          message: 'PLEASE_VALIDATE_YOUR_EMAIL_ADDRESS',
          trigger: 'validate'
        }
      },
      {
        code: 'declared-school-name',
        fieldName: 'School/Organization name',
        type: 'input',
        templateOptions: {
          label: 'SCHOOL_OR_ORG_NAME',
          placeHolder: 'ENTER_SCHOOL_NAME'
        },
        validations: [
          {
            type: 'pattern',
            value: '^[^\',(\\r\\n|\\r|\\n)]*$',
            message: 'Special characters not allowed'
          }
        ]
      },
      {
        code: 'declared-school-udise-code',
        fieldName: 'School UDISE ID/Org ID',
        type: 'input',
        templateOptions: {
          label: 'SCHOOL_UDISE_ID_OR_ORG_ID',
          placeHolder: 'ENTER_UDISE_ID'
        },
        validations: [
          {
            type: 'pattern',
            value: '^[^\',(\\r\\n|\\r|\\n)]*$',
            message: 'Special characters not allowed'
          }
        ]
      },
      {
        code: 'declared-ext-id',
        fieldName: 'Your ID from State/Board/Org',
        type: 'input',
        templateOptions: {
          labelHtml: {
            contents: '<span>$0&nbsp;<span class=\required-asterisk\>*</span></span>',
            values: {
              $0: 'ENTER_ID_AS_REQUESTED_BY_STATE_BOARD_ORG'
            }
          },
          placeHolder: 'ENTER_ID'
        },
        validations: [
          {
            type: 'required',
            value: true,
            message: 'ID_IS_REQUIRED'
          },
          {
            type: 'pattern',
            value: '^[^\',(\\r\\n|\\r|\\n)]*$',
            message: 'Special characters not allowed'
          }
        ]
      }
    ],
    templateOptions: {}
  },
  {
    code: 'tnc',
    type: 'checkbox',
    templateOptions: {
      labelHtml: {
        contents: '<span>$tnc <u><a href=\$url\>$0</a></u></span>',
        values: {
          $tnc: 'SELF_DECLARE_TEACHER_TNC',
          $url: 'url',
          $0: 'PRIVACY_POLICY'
        }
      }
    },
    validations: [
      {
        type: 'required',
        value: true,
        message: ''
      }
    ]
  }
];

