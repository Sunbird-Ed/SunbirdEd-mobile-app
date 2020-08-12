import { FieldConfigInputType, FieldConfig, FieldConfigValidationType, FieldConfigOption } from "./json_interface";
import { board, medium, grade, subject, contentname, details, notifyCheckbox } from './BMCSCD';

export const fields = [
  {
    "code": "category",
    "type": FieldConfigInputType.NESTED_SELECT as FieldConfigInputType,
    "templateOptions": {
      "placeHolder": "Select Category",
      "multiple": false,
      "hidden": false, // new property, if category been preset
      "options": [
        {
          value: 'content',
          label: 'Content'
        },
        {
          value: 'loginRegistration',
          label: 'Login/Registration'
        },
        {
          value: 'teacherTraining',
          label: 'Teacher Training'
        },
        {
          value: 'otherissues',
          label: 'Other Issues',
          dataSrc: {
            "action": "initiateEmail"
          }
        }
      ]
    },
    "validations": [
      {
        "type": FieldConfigValidationType.REQUIRED
      }
    ],
    "children": {
      "otherissues": [
        details
      ]
    }
  },
  {
    "code": "subcategory",
    "context": 'category',
    "type": FieldConfigInputType.NESTED_SELECT, // new type
    "children": { // new property
      "contentquality": [
        board,
        medium,
        grade,
        subject,
        contentname,
        details
      ],
      "contentnotplaying": [
        board,
        medium,
        grade,
        subject,
        contentname,
        details
      ],
      "contentavailability": [
        board,
        medium,
        grade,
        subject,
        details,
        notifyCheckbox
      ],
      "contentotherissues": [
        board,
        medium,
        grade,
        subject,
        contentname,
        details
      ],
      "otpissue": [
        details
      ],
      "profilevalidation": [
        details
      ],
      "profiledetails": [
        details
      ],
      "certificate": [
        details
      ],
      "teacherid": [
        details
      ],
      "profileotherissues": [
        details
      ],
      "teacherotherissues": [
        details
      ]
    },
    "templateOptions": {
      "placeHolder": "Select Subcategory",
      "multiple": false,
      "hidden": false, // new property, if category been preset
      "options": {
        "loginRegistration": [
          {
            "value": 'otpissue',
            "label": 'OTP Issue',
            "dataSrc": {
              "action": "initiateEmail"
            }
          }, {
            "value": 'profilevalidation',
            "label": 'Profile validation/No green tick on my profile',
            "dataSrc": {
              "action": "contactBoard"
            }
          }, {
            "value": 'profiledetails',
            "label": 'Profile details incorrect',
            "dataSrc": {
              "action": "contactBoard"
            }
          }, {
            "value": 'certificate',
            "label": 'Certificate related',
            "dataSrc": {
              "action": "contactBoard"
            }
          }, {
            "value": 'teacherid',
            "label": 'Teacher id',
            "dataSrc": {
              "action": "contactBoard"
            }
          }, {
            "value": 'profileotherissues',
            "label": 'Other issues',
            "dataSrc": {
              "action": "contactBoard"
            }
          }
        ],
        "content": [
          {
            "value": 'contentquality',
            "label": 'Content Quality'
          }, {
            "value": 'contentnotplaying',
            "label": 'Content not playing/downloading',
            "dataSrc": {
              "action": "initiateEmail"
            }
          }, {
            "value": 'contentavailability',
            "label": 'Content availability',
          }, {
            "value": 'contentotherissues',
            "label": 'Other Issues',
            "dataSrc": {
              "action": "initiateEmail"
            }
          }],
        "teacherTraining": [
          {
            "value": 'profilevalidation',
            "label": 'Profile validation/No green tick on my profile',
            "dataSrc": {
              "action": "contactBoard"
            }
          }, {
            "value": 'profiledetails',
            "label": 'Profile details incorrect',
            "dataSrc": {
              "action": "contactBoard"
            }
          }, {
            "value": 'certificate',
            "label": 'Certificate related',
            "dataSrc": {
              "action": "contactBoard"
            }
          }, {
            "value": 'teacherotherissues',
            "label": 'Other issues',
            "dataSrc": {
              "action": "contactBoard"
            }
          }
        ]
      }
    }
  }
];

export const fornConfig = [
  {
    "code": "category",
    "type": "nested_select",
    "templateOptions": {
      "placeHolder": "Select Category",
      "multiple": false,
      "hidden": false,
      "options": [
        {
          "value": "content",
          "label": "Content"
        },
        {
          "value": "loginRegistration",
          "label": "Login/Registration"
        },
        {
          "value": "teacherTraining",
          "label": "Teacher Training"
        },
        {
          "value": "otherissues",
          "label": "Other Issues",
          "dataSrc": {
            "action": "initiateEmail"
          }
        }
      ]
    },
    "validations": [
      {
        "type": "required"
      }
    ],
    "children": {
      "otherissues": [
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        }
      ]
    }
  },
  {
    "code": "subcategory",
    "context": "category",
    "type": "nested_select",
    "children": {
      "contentquality": [
        {
          "code": "board",
          "type": "select",
          "templateOptions": {
            "placeHolder": "Select Board",
            "multiple": false,
            "dataSrc": {
              "marker": "ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES"
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "medium",
          "type": "nested_select",
          "context": "board",
          "default": null,
          "templateOptions": {
            "placeHolder": "Select Medium",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "medium"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "grade",
          "type": "nested_select",
          "context": "medium",
          "templateOptions": {
            "placeHolder": "Select Grade",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "grade"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "subject",
          "type": "nested_select",
          "context": "grade",
          "templateOptions": {
            "placeHolder": "Select Subject",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "subject"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "contentname",
          "type": "input",
          "context": null,
          "templateOptions": {
            "placeHolder": "Enter Content Name"
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        }
      ],
      "contentnotplaying": [
        {
          "code": "board",
          "type": "select",
          "templateOptions": {
            "placeHolder": "Select Board",
            "multiple": false,
            "dataSrc": {
              "marker": "ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES"
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "medium",
          "type": "nested_select",
          "context": "board",
          "default": null,
          "templateOptions": {
            "placeHolder": "Select Medium",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "medium"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "grade",
          "type": "nested_select",
          "context": "medium",
          "templateOptions": {
            "placeHolder": "Select Grade",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "grade"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "subject",
          "type": "nested_select",
          "context": "grade",
          "templateOptions": {
            "placeHolder": "Select Subject",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "subject"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "contentname",
          "type": "input",
          "context": null,
          "templateOptions": {
            "placeHolder": "Enter Content Name"
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        }
      ],
      "contentavailability": [
        {
          "code": "board",
          "type": "select",
          "templateOptions": {
            "placeHolder": "Select Board",
            "multiple": false,
            "dataSrc": {
              "marker": "ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES",
              "params": {
                "relevantTerms": [
                  "CBSE"
                ]
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "medium",
          "type": "nested_select",
          "context": "board",
          "default": null,
          "templateOptions": {
            "placeHolder": "Select Medium",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "medium"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "grade",
          "type": "nested_select",
          "context": "medium",
          "templateOptions": {
            "placeHolder": "Select Grade",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "grade"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "subject",
          "type": "nested_select",
          "context": "grade",
          "templateOptions": {
            "placeHolder": "Select Subject",
            "multiple": true,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "subject"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "contenttype",
          "type": "select",
          "templateOptions": {
            "placeHolder": "Select Content Type",
            "multiple": false,
            "options": [
              {
                "value": "all",
                "label": "All"
              },{
                "value": "video",
                "label": "Video"
              },{
                "value": "doc",
                "label": "Text Document"
              },{
                "value": "questions",
                "label": "Practice Questions"
              }
            ]
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        },
        {
          "code": "notify",
          "type": "checkbox",
          "templateOptions": {
            "label": "Notify me on availability"
          }
        }
      ],
      "contentotherissues": [
        {
          "code": "board",
          "type": "select",
          "templateOptions": {
            "placeHolder": "Select Board",
            "multiple": false,
            "dataSrc": {
              "marker": "ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES"
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "medium",
          "type": "nested_select",
          "context": "board",
          "default": null,
          "templateOptions": {
            "placeHolder": "Select Medium",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "medium"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "grade",
          "type": "nested_select",
          "context": "medium",
          "templateOptions": {
            "placeHolder": "Select Grade",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "grade"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "subject",
          "type": "nested_select",
          "context": "grade",
          "templateOptions": {
            "placeHolder": "Select Subject",
            "multiple": true,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "subject"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "contentname",
          "type": "input",
          "context": null,
          "templateOptions": {
            "placeHolder": "Enter Content Name"
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        }
      ],
      "otpissue": [
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        }
      ],
      "profilevalidation": [
        {
          "code": "board",
          "type": "select",
          "templateOptions": {
            "placeHolder": "Select Board",
            "multiple": false,
            "dataSrc": {
              "marker": "ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES"
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "medium",
          "type": "nested_select",
          "context": "board",
          "default": null,
          "templateOptions": {
            "placeHolder": "Select Medium",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "medium"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "grade",
          "type": "nested_select",
          "context": "medium",
          "templateOptions": {
            "placeHolder": "Select Grade",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "grade"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        }
      ],
      "profiledetails": [
        {
          "code": "board",
          "type": "select",
          "templateOptions": {
            "placeHolder": "Select Board",
            "multiple": false,
            "dataSrc": {
              "marker": "ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES"
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "medium",
          "type": "nested_select",
          "context": "board",
          "default": null,
          "templateOptions": {
            "placeHolder": "Select Medium",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "medium"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "grade",
          "type": "nested_select",
          "context": "medium",
          "templateOptions": {
            "placeHolder": "Select Grade",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "grade"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        }
      ],
      "certificate": [
        {
          "code": "board",
          "type": "select",
          "templateOptions": {
            "placeHolder": "Select Board",
            "multiple": false,
            "dataSrc": {
              "marker": "ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES"
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "medium",
          "type": "nested_select",
          "context": "board",
          "default": null,
          "templateOptions": {
            "placeHolder": "Select Medium",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "medium"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "grade",
          "type": "nested_select",
          "context": "medium",
          "templateOptions": {
            "placeHolder": "Select Grade",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "grade"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        }
      ],
      "teacherid": [
        {
          "code": "board",
          "type": "select",
          "templateOptions": {
            "placeHolder": "Select Board",
            "multiple": false,
            "dataSrc": {
              "marker": "ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES"
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "medium",
          "type": "nested_select",
          "context": "board",
          "default": null,
          "templateOptions": {
            "placeHolder": "Select Medium",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "medium"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "grade",
          "type": "nested_select",
          "context": "medium",
          "templateOptions": {
            "placeHolder": "Select Grade",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "grade"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        }
      ],
      "profileotherissues": [
        {
          "code": "board",
          "type": "select",
          "templateOptions": {
            "placeHolder": "Select Board",
            "multiple": false,
            "dataSrc": {
              "marker": "ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES"
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "medium",
          "type": "nested_select",
          "context": "board",
          "default": null,
          "templateOptions": {
            "placeHolder": "Select Medium",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "medium"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "grade",
          "type": "nested_select",
          "context": "medium",
          "templateOptions": {
            "placeHolder": "Select Grade",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "grade"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        }
      ],
      "teacherotherissues": [
        {
          "code": "board",
          "type": "select",
          "templateOptions": {
            "placeHolder": "Select Board",
            "multiple": false,
            "dataSrc": {
              "marker": "ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES"
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "medium",
          "type": "nested_select",
          "context": "board",
          "default": null,
          "templateOptions": {
            "placeHolder": "Select Medium",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "medium"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "grade",
          "type": "nested_select",
          "context": "medium",
          "templateOptions": {
            "placeHolder": "Select Grade",
            "multiple": false,
            "dataSrc": {
              "marker": "FRAMEWORK_CATEGORY_TERMS",
              "params": {
                "categoryCode": "grade"
              }
            }
          },
          "validations": [
            {
              "type": "required"
            }
          ]
        },
        {
          "code": "details",
          "type": "textarea",
          "context": null,
          "templateOptions": {
            "label": "Tell us more",
            "placeHolder": "Enter Details"
          },
          "validations": [
            {
              "type": "maxLength",
              "value": 1000
            }
          ]
        }
      ]
    },
    "templateOptions": {
      "placeHolder": "Select Subcategory",
      "multiple": false,
      "hidden": false,
      "options": {
        "loginRegistration": [
          {
            "value": "otpissue",
            "label": "OTP Issue",
            "dataSrc": {
              "action": "initiateEmail"
            }
          },
          {
            "value": "profilevalidation",
            "label": "Profile validation/No green tick on my profile",
            "dataSrc": {
              "action": "contactBoard"
            }
          },
          {
            "value": "profiledetails",
            "label": "Profile details incorrect",
            "dataSrc": {
              "action": "contactBoard"
            }
          },
          {
            "value": "certificate",
            "label": "Certificate related",
            "dataSrc": {
              "action": "contactBoard"
            }
          },
          {
            "value": "teacherid",
            "label": "Teacher id",
            "dataSrc": {
              "action": "contactBoard"
            }
          },
          {
            "value": "profileotherissues",
            "label": "Other issues",
            "dataSrc": {
              "action": "contactBoard"
            }
          }
        ],
        "content": [
          {
            "value": "contentquality",
            "label": "Content Quality",
            "dataSrc": {
              "action": "initiateEmail"
            }
          },
          {
            "value": "contentnotplaying",
            "label": "Content not playing/downloading",
            "dataSrc": {
              "action": "initiateEmail"
            }
          },
          {
            "value": "contentavailability",
            "label": "Content availability",
            "dataSrc": {
              "action": "initiateEmail"
            }
          },
          {
            "value": "contentotherissues",
            "label": "Other Issues",
            "dataSrc": {
              "action": "initiateEmail"
            }
          }
        ],
        "teacherTraining": [
          {
            "value": "profilevalidation",
            "label": "Profile validation/No green tick on my profile",
            "dataSrc": {
              "action": "contactBoard"
            }
          },
          {
            "value": "profiledetails",
            "label": "Profile details incorrect",
            "dataSrc": {
              "action": "contactBoard"
            }
          },
          {
            "value": "certificate",
            "label": "Certificate related",
            "dataSrc": {
              "action": "contactBoard"
            }
          },
          {
            "value": "teacherotherissues",
            "label": "Other issues",
            "dataSrc": {
              "action": "contactBoard"
            }
          }
        ]
      }
    }
  }
];

export const extractionConfig = {
  mbgs: [
    {
      code: 'board',
      path: ['children', 'subcategory']
    },
    {
      code: 'medium',
      path: ['children', 'subcategory']
    },
    {
      code: 'grade',
      path: ['children', 'subcategory']
    },
    {
      code: 'subject',
      path: ['children', 'subcategory']
    }
  ],
  catsubcat: [
    {
      code: 'category'
    },
    {
      code: 'subcategory'
    }
  ]
};

export const stateContactList = [
  {
      "id": "up_k-12",
      "code": "board",
      "name": "Uttar Pradesh",
      "message": "(between 9 AM to 6 PM from Monday to Friday)",
      "contactinfo": {
          "number": "18001800666",
          "email": null
      }
  },
  {
      "id": "mp_k-12",
      "code": "board",
      "name": "Madhya Pradesh",
      "message": "(between 11 AM to 5 PM from Monday to Friday)",
      "contactinfo": {
          "number": "18005728585",
          "email": null
      }
  },
  {
      "id": "igot_health",
      "code": "board",
      "name": "IGOT-Health",
      "contactinfo": {
          "number": undefined,
          "email": "support@i-got.freshdesk.com"
      }
  }
];
