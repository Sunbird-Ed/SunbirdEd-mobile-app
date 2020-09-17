export const mockNavigationResp = {
    extras: {
        state: {
            data: {},
            showHeader: true,
            formCnotext: {}
        }
    }
};

export const mockFormConfig = [
    {
      code: 'category',
      type: 'nested_select',
      templateOptions: {
        placeHolder: 'Select Category',
        multiple: false,
        hidden: false,
        options: [
          {
            value: 'content',
            label: 'Content'
          },
          {
            'value': 'loginRegistration',
            'label': 'Login/Registration'
          },
          {
            'value': 'teacherTraining',
            'label': 'Teacher Training'
          },
          {
            'value': 'otherissues',
            'label': 'Other Issues',
            'dataSrc': {
              'action': 'initiateEmail'
            }
          }
        ]
      },
      'validations': [
        {
          'type': 'required'
        }
      ],
      'children': {
        'otherissues': [
          {
            'code': 'board',
            'type': 'select',
            'templateOptions': {
              'placeHolder': 'Select Board',
              'multiple': false,
              'dataSrc': {
                'marker': 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES'
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'medium',
            'type': 'nested_select',
            'context': 'board',
            'default': null,
            'templateOptions': {
              'placeHolder': 'Select Medium',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'medium'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'grade',
            'type': 'nested_select',
            'context': 'medium',
            'templateOptions': {
              'placeHolder': 'Select Grade',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'grade'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'subject',
            'type': 'nested_select',
            'context': 'grade',
            'templateOptions': {
              'placeHolder': 'Select Subject',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'subject'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          }
        ]
      }
    },
    {
      'code': 'subcategory',
      'context': 'category',
      'type': 'nested_select',
      'children': {
        'contentquality': [
          {
            'code': 'board',
            'type': 'select',
            'templateOptions': {
              'placeHolder': 'Select Board',
              'multiple': false,
              'dataSrc': {
                'marker': 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES'
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'medium',
            'type': 'nested_select',
            'context': 'board',
            'default': null,
            'templateOptions': {
              'placeHolder': 'Select Medium',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'medium'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'grade',
            'type': 'nested_select',
            'context': 'medium',
            'templateOptions': {
              'placeHolder': 'Select Grade',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'grade'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'subject',
            'type': 'nested_select',
            'context': 'grade',
            'templateOptions': {
              'placeHolder': 'Select Subject',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'subject'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'contentname',
            'type': 'input',
            'context': null,
            'templateOptions': {
              'placeHolder': 'Enter Content Name'
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          }
        ],
        'contentnotplaying': [
          {
            'code': 'board',
            'type': 'select',
            'templateOptions': {
              'placeHolder': 'Select Board',
              'multiple': false,
              'dataSrc': {
                'marker': 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES'
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'medium',
            'type': 'nested_select',
            'context': 'board',
            'default': null,
            'templateOptions': {
              'placeHolder': 'Select Medium',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'medium'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'grade',
            'type': 'nested_select',
            'context': 'medium',
            'templateOptions': {
              'placeHolder': 'Select Grade',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'grade'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'subject',
            'type': 'nested_select',
            'context': 'grade',
            'templateOptions': {
              'placeHolder': 'Select Subject',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'subject'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'contentname',
            'type': 'input',
            'context': null,
            'templateOptions': {
              'placeHolder': 'Enter Content Name'
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          }
        ],
        'contentavailability': [
          {
            'code': 'board',
            'type': 'select',
            'templateOptions': {
              'placeHolder': 'Select Board',
              'multiple': false,
              'dataSrc': {
                'marker': 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES'
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'medium',
            'type': 'nested_select',
            'context': 'board',
            'default': null,
            'templateOptions': {
              'placeHolder': 'Select Medium',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'medium'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'grade',
            'type': 'nested_select',
            'context': 'medium',
            'templateOptions': {
              'placeHolder': 'Select Grade',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'grade'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'subject',
            'type': 'nested_select',
            'context': 'grade',
            'templateOptions': {
              'placeHolder': 'Select Subject',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'subject'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          },
          {
            'code': 'notify',
            'type': 'checkbox',
            'templateOptions': {
              'label': 'Notify me on availability'
            }
          }
        ],
        'contentotherissues': [
          {
            'code': 'board',
            'type': 'select',
            'templateOptions': {
              'placeHolder': 'Select Board',
              'multiple': false,
              'dataSrc': {
                'marker': 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES'
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'medium',
            'type': 'nested_select',
            'context': 'board',
            'default': null,
            'templateOptions': {
              'placeHolder': 'Select Medium',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'medium'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'grade',
            'type': 'nested_select',
            'context': 'medium',
            'templateOptions': {
              'placeHolder': 'Select Grade',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'grade'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'subject',
            'type': 'nested_select',
            'context': 'grade',
            'templateOptions': {
              'placeHolder': 'Select Subject',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'subject'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'contentname',
            'type': 'input',
            'context': null,
            'templateOptions': {
              'placeHolder': 'Enter Content Name'
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          }
        ],
        'otpissue': [
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          }
        ],
        'profilevalidation': [
          {
            'code': 'board',
            'type': 'select',
            'templateOptions': {
              'placeHolder': 'Select Board',
              'multiple': false,
              'dataSrc': {
                'marker': 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES'
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'medium',
            'type': 'nested_select',
            'context': 'board',
            'default': null,
            'templateOptions': {
              'placeHolder': 'Select Medium',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'medium'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'grade',
            'type': 'nested_select',
            'context': 'medium',
            'templateOptions': {
              'placeHolder': 'Select Grade',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'grade'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          }
        ],
        'profiledetails': [
          {
            'code': 'board',
            'type': 'select',
            'templateOptions': {
              'placeHolder': 'Select Board',
              'multiple': false,
              'dataSrc': {
                'marker': 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES'
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'medium',
            'type': 'nested_select',
            'context': 'board',
            'default': null,
            'templateOptions': {
              'placeHolder': 'Select Medium',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'medium'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'grade',
            'type': 'nested_select',
            'context': 'medium',
            'templateOptions': {
              'placeHolder': 'Select Grade',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'grade'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          }
        ],
        'certificate': [
          {
            'code': 'board',
            'type': 'select',
            'templateOptions': {
              'placeHolder': 'Select Board',
              'multiple': false,
              'dataSrc': {
                'marker': 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES'
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'medium',
            'type': 'nested_select',
            'context': 'board',
            'default': null,
            'templateOptions': {
              'placeHolder': 'Select Medium',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'medium'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'grade',
            'type': 'nested_select',
            'context': 'medium',
            'templateOptions': {
              'placeHolder': 'Select Grade',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'grade'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          }
        ],
        'teacherid': [
          {
            'code': 'board',
            'type': 'select',
            'templateOptions': {
              'placeHolder': 'Select Board',
              'multiple': false,
              'dataSrc': {
                'marker': 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES'
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'medium',
            'type': 'nested_select',
            'context': 'board',
            'default': null,
            'templateOptions': {
              'placeHolder': 'Select Medium',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'medium'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'grade',
            'type': 'nested_select',
            'context': 'medium',
            'templateOptions': {
              'placeHolder': 'Select Grade',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'grade'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          }
        ],
        'profileotherissues': [
          {
            'code': 'board',
            'type': 'select',
            'templateOptions': {
              'placeHolder': 'Select Board',
              'multiple': false,
              'dataSrc': {
                'marker': 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES'
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'medium',
            'type': 'nested_select',
            'context': 'board',
            'default': null,
            'templateOptions': {
              'placeHolder': 'Select Medium',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'medium'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'grade',
            'type': 'nested_select',
            'context': 'medium',
            'templateOptions': {
              'placeHolder': 'Select Grade',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'grade'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          }
        ],
        'teacherotherissues': [
          {
            'code': 'board',
            'type': 'select',
            'templateOptions': {
              'placeHolder': 'Select Board',
              'multiple': false,
              'dataSrc': {
                'marker': 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES'
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'medium',
            'type': 'nested_select',
            'context': 'board',
            'default': null,
            'templateOptions': {
              'placeHolder': 'Select Medium',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'medium'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'grade',
            'type': 'nested_select',
            'context': 'medium',
            'templateOptions': {
              'placeHolder': 'Select Grade',
              'multiple': false,
              'dataSrc': {
                'marker': 'FRAMEWORK_CATEGORY_TERMS',
                'params': {
                  'categoryCode': 'grade'
                }
              }
            },
            'validations': [
              {
                'type': 'required'
              }
            ]
          },
          {
            'code': 'details',
            'type': 'textarea',
            'context': null,
            'templateOptions': {
              'label': 'Tell us more about the problem you faced',
              'placeHolder': 'Enter Details'
            },
            'validations': [
              {
                'type': 'maxLength',
                'value': 1000
              }
            ]
          }
        ]
      },
      'templateOptions': {
        'placeHolder': 'Select Subcategory',
        'multiple': false,
        'hidden': false,
        'options': {
          'loginRegistration': [
            {
              'value': 'otpissue',
              'label': 'OTP Issue',
              'dataSrc': {
                'action': 'initiateEmail'
              }
            },
            {
              'value': 'profilevalidation',
              'label': 'Profile validation/No green tick on my profile',
              'dataSrc': {
                'action': 'contactBoard'
              }
            },
            {
              'value': 'profiledetails',
              'label': 'Profile details incorrect',
              'dataSrc': {
                'action': 'contactBoard'
              }
            },
            {
              'value': 'certificate',
              'label': 'Certificate related',
              'dataSrc': {
                'action': 'contactBoard'
              }
            },
            {
              'value': 'teacherid',
              'label': 'Teacher id',
              'dataSrc': {
                'action': 'contactBoard'
              }
            },
            {
              'value': 'profileotherissues',
              'label': 'Other issues',
              'dataSrc': {
                'action': 'contactBoard'
              }
            }
          ],
          'content': [
            {
              'value': 'contentquality',
              'label': 'Content Quality'
            },
            {
              'value': 'contentnotplaying',
              'label': 'Content not playing/downloading',
              'dataSrc': {
                'action': 'initiateEmail'
              }
            },
            {
              'value': 'contentavailability',
              'label': 'Content availability'
            },
            {
              'value': 'contentotherissues',
              'label': 'Other Issues',
              'dataSrc': {
                'action': 'initiateEmail'
              }
            }
          ],
          'teacherTraining': [
            {
              'value': 'profilevalidation',
              'label': 'Profile validation/No green tick on my profile',
              'dataSrc': {
                'action': 'contactBoard'
              }
            },
            {
              'value': 'profiledetails',
              'label': 'Profile details incorrect',
              'dataSrc': {
                'action': 'contactBoard'
              }
            },
            {
              'value': 'certificate',
              'label': 'Certificate related',
              'dataSrc': {
                'action': 'contactBoard'
              }
            },
            {
              'value': 'teacherotherissues',
              'label': 'Other issues',
              'dataSrc': {
                'action': 'contactBoard'
              }
            }
          ]
        }
      }
    }
];

export const mockProfile = {
  
};

export const mockHeaderEvent = {
  name: 'back',
  identifier: '89712312'
}

export const mockUserProfile = {
  board: ['statekarnataka'],
  createdAt: 1594741466334,
  grade: ['class10'],
  gradeValue: '',
  handle: 'Guest1',
  medium: ['english'],
  profileType: 'teacher',
  source: 'local',
  subject: [],
  syllabus: ['ka_k-12_1'],
  uid: 'ca20b97e-9c88-456c-ad1e-4418c65f6dee'
}

export const mockFormValue = {
  'category': 'content',
  'subcategory': 'contentnotplaying',
  'children': {
    'subcategory': {
      'board': {
        'name': 'State(Karnataka)',
        'code': 'ka_k-12_1'
      },
      'medium': {
        'name': 'English',
        'code': 'english',
        'frameworkCode': 'ka_k-12_1'
      },
      'grade': {
        'name': 'Class10',
        'code': 'class10',
        'frameworkCode': 'ka_k-12_1'
      },
      'subject': {
        'name': 'Science',
        'code': 'science',
        'frameworkCode': 'ka_k-12_1'
      },
      'contentname': 'Content',
      'details': ''
    }
  }
};

export const mockStateList = [
  {
    'id': 'ka_k-12_1',
    'code': 'board',
    'name': 'State(Karnataka)',
    'message': '(between 9 AM to 6 PM from Monday to Friday)',
    'contactinfo': {
      'number': '18001800666',
      'email': null
    }
  },
  {
    'id': 'ts_k-12_2',
    'code': 'board',
    'name': 'State(AndhraPradesh)',
    'message': '(between 11 AM to 5 PM from Monday to Friday)',
    'contactinfo': {
      'number': '18005728585',
      'email': null
    }
  }
];

export const mockFrameworkList = [
  {
    name: 'State (Karnataka)',
    identifier: 'k_2-11-2'
  },
  {
    name: 'State (Andhra Pradesh)',
    identifier: 'k_2-11-4'
  },
  {
    name: 'State (Chhattisgarh)',
    identifier: 'k_2-11-5'
  },
  {
    name: 'State (Assam)',
    identifier: 'k_2-11-6'
  },
  {
    name: 'State (Madhya Pradesh)',
    identifier: 'k_2-11-8'
  }
];