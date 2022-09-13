export const mockSupportedUserTypeConfig = [
   {
       code: 'student',
       name: 'Student',
       searchFilter: [
           'Student',
           'Learner'
       ],
       ambiguousFilters: [
        'learner',
        'student'
      ],
       attributes: {
           mandatory: [
               'board',
               'medium',
               'gradeLevel'
           ],
           optional: [
               'subject'
           ]
       }
   },
   {
       code: 'teacher',
       name: 'Teacher',
       searchFilter: [
           'Teacher',
           'Instructor'
       ],
       ambiguousFilters: [
        'teacher',
        'instructor'
      ],
       attributes: {
           mandatory: [
               'board',
               'medium',
               'gradeLevel'
           ],
           optional: [
               'subject'
           ]
       }
   },
   {
       code: 'administrator',
       name: 'Admin',
       searchFilter: [
           'Administrator'
       ],
       ambiguousFilters: [],
       attributes: {
           mandatory: [
               'board'
           ],
           optional: []
       }
   }
];

export const mockFormFielddata = [
    {
        "code": "name",
        "type": "input",
        "templateOptions": {
            "labelHtml": {
                "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                "values": {
                    "$0": "Name"
                }
            },
            "hidden": true,
            "placeHolder": "Enter Name",
            "multiple": false
        },
        "validations": [
            {
                "type": "required"
            }
        ]
    },
    {
        "code": "persona",
        "type": "nested_select",
        "templateOptions": {
            "hidden": true,
            "labelHtml": {
                "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                "values": {
                    "$0": "Role"
                }
            },
            "placeHolder": "Select Role",
            "multiple": false,
            "dataSrc": {
                "marker": "SUPPORTED_PERSONA_LIST"
            }
        },
        "validations": [
            {
                "type": "required"
            }
        ],
        "children": {
            "administrator": [
                {
                    "code": "state",
                    "type": "select",
                    "templateOptions": {
                        "labelHtml": {
                            "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                            "values": {
                                "$0": "State"
                            }
                        },
                        "placeHolder": "Select State",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "STATE_LOCATION_LIST",
                            "params": {
                                "useCase": "SIGNEDIN_GUEST"
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
                    "code": "district",
                    "type": "select",
                    "context": "state",
                    "default": null,
                    "templateOptions": {
                        "labelHtml": {
                            "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                            "values": {
                                "$0": "District"
                            }
                        },
                        "placeHolder": "Select District",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "district",
                                "useCase": "SIGNEDIN_GUEST"
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
                    "code": "block",
                    "type": "select",
                    "context": "district",
                    "default": null,
                    "templateOptions": {
                        "label": "Block",
                        "placeHolder": "Select Block",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "block",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "cluster",
                    "type": "select",
                    "context": "block",
                    "default": null,
                    "templateOptions": {
                        "label": "Cluster",
                        "placeHolder": "Select Cluster",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "cluster",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    }
                },
                {
                    "code": "school",
                    "type": "select",
                    "context": "cluster",
                    "default": null,
                    "templateOptions": {
                        "label": "School",
                        "placeHolder": "Select School",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "school",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    }
                }
            ],
            "teacher": [
                {
                    "code": "state",
                    "type": "select",
                    "templateOptions": {
                        "labelHtml": {
                            "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                            "values": {
                                "$0": "State"
                            }
                        },
                        "placeHolder": "Select State",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "STATE_LOCATION_LIST",
                            "params": {
                                "useCase": "SIGNEDIN_GUEST"
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
                    "code": "district",
                    "type": "select",
                    "context": "state",
                    "default": null,
                    "templateOptions": {
                        "labelHtml": {
                            "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                            "values": {
                                "$0": "District"
                            }
                        },
                        "placeHolder": "Select District",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "district",
                                "useCase": "SIGNEDIN_GUEST"
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
                    "code": "block",
                    "type": "select",
                    "context": "district",
                    "default": null,
                    "templateOptions": {
                        "label": "Block",
                        "placeHolder": "Select Block",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "block",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "cluster",
                    "type": "select",
                    "context": "block",
                    "default": null,
                    "templateOptions": {
                        "label": "Cluster",
                        "placeHolder": "Select Cluster",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "cluster",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    }
                },
                {
                    "code": "school",
                    "type": "select",
                    "context": "cluster",
                    "default": null,
                    "templateOptions": {
                        "label": "School",
                        "placeHolder": "Select School",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "school",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    }
                }
            ],
            "student": [
                {
                    "code": "state",
                    "type": "select",
                    "templateOptions": {
                        "labelHtml": {
                            "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                            "values": {
                                "$0": "State"
                            }
                        },
                        "placeHolder": "Select State",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "STATE_LOCATION_LIST",
                            "params": {
                                "useCase": "SIGNEDIN_GUEST"
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
                    "code": "district",
                    "type": "select",
                    "context": "state",
                    "default": null,
                    "templateOptions": {
                        "labelHtml": {
                            "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                            "values": {
                                "$0": "District"
                            }
                        },
                        "placeHolder": "Select District",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "district",
                                "useCase": "SIGNEDIN_GUEST"
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
                    "code": "block",
                    "type": "select",
                    "context": "district",
                    "default": null,
                    "templateOptions": {
                        "label": "Block",
                        "placeHolder": "Select Block",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "block",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "cluster",
                    "type": "select",
                    "context": "block",
                    "default": null,
                    "templateOptions": {
                        "label": "Cluster",
                        "placeHolder": "Select Cluster",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "cluster",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    }
                },
                {
                    "code": "school",
                    "type": "select",
                    "context": "cluster",
                    "default": null,
                    "templateOptions": {
                        "label": "School",
                        "placeHolder": "Select School",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "school",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    }
                }
            ],
            "other": [
                {
                    "code": "state",
                    "type": "select",
                    "templateOptions": {
                        "placeHolder": "Select State",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "STATE_LOCATION_LIST",
                            "params": {
                                "useCase": "SIGNEDIN_GUEST"
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
                    "code": "district",
                    "type": "select",
                    "context": "state",
                    "default": null,
                    "templateOptions": {
                        "labelHtml": {
                            "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                            "values": {
                                "$0": "District"
                            }
                        },
                        "placeHolder": "Select District",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "district",
                                "useCase": "SIGNEDIN_GUEST"
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
                    "code": "block",
                    "type": "select",
                    "context": "district",
                    "default": null,
                    "templateOptions": {
                        "label": "Block",
                        "placeHolder": "Select Block",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "block",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "cluster",
                    "type": "select",
                    "context": "block",
                    "default": null,
                    "templateOptions": {
                        "label": "Cluster",
                        "placeHolder": "Select Cluster",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "cluster",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    }
                },
                {
                    "code": "school",
                    "type": "select",
                    "context": "cluster",
                    "default": null,
                    "templateOptions": {
                        "label": "School",
                        "placeHolder": "Select School",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "school",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    }
                },
                {
                    "code": "subPersona",
                    "type": "select",
                    "context": "cluster",
                    "default": null,
                    "templateOptions": {
                        "label": "School",
                        "placeHolder": "Select School",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "subPersona",
                                "useCase": "SIGNEDIN"
                            }
                        },
                        "options": [
                            {
                                "value": "subType",
                                "label": "HM"
                            },
                            {
                                "value": "subType",
                                "label": "CRP"
                            },
                            {
                                "value": "chm",
                                "label": "Complex HM"
                            },
                            {
                                "value": "meo",
                                "label": "MEO"
                            },
                            {
                                "value": "dyeo",
                                "label": "DyEO"
                            },
                            {
                                "value": "atwo",
                                "label": "ATWO"
                            }
                        ]
                    }
                }
            ],
            "parent": [
                {
                    "code": "state",
                    "type": "select",
                    "templateOptions": {
                        "labelHtml": {
                            "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                            "values": {
                                "$0": "State"
                            }
                        },
                        "placeHolder": "Select State",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "STATE_LOCATION_LIST",
                            "params": {
                                "useCase": "SIGNEDIN_GUEST"
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
                    "code": "district",
                    "type": "select",
                    "context": "state",
                    "default": null,
                    "templateOptions": {
                        "labelHtml": {
                            "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                            "values": {
                                "$0": "District"
                            }
                        },
                        "placeHolder": "Select District",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "district",
                                "useCase": "SIGNEDIN_GUEST"
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
                    "code": "block",
                    "type": "select",
                    "context": "district",
                    "default": null,
                    "templateOptions": {
                        "label": "Block",
                        "placeHolder": "Select Block",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "block",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    },
                    "validations": []
                },
                {
                    "code": "cluster",
                    "type": "select",
                    "context": "block",
                    "default": null,
                    "templateOptions": {
                        "label": "Cluster",
                        "placeHolder": "Select Cluster",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "cluster",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    }
                },
                {
                    "code": "school",
                    "type": "select",
                    "context": "cluster",
                    "default": null,
                    "templateOptions": {
                        "label": "School",
                        "placeHolder": "Select School",
                        "multiple": false,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "school",
                                "useCase": "SIGNEDIN"
                            }
                        }
                    }
                },
                {
                    "code": "subPersona",
                    "type": "select",
                    "context": "cluster",
                    "default": null,
                    "templateOptions": {
                        "label": "School",
                        "placeHolder": "Select School",
                        "multiple": true,
                        "dataSrc": {
                            "marker": "LOCATION_LIST",
                            "params": {
                                "id": "subPersona",
                                "useCase": "SIGNEDIN"
                            }
                        },
                        "options": [
                            {
                                "value": "subType",
                                "label": "HM"
                            },
                            {
                                "value": "subType",
                                "label": "CRP"
                            },
                            {
                                "value": "chm",
                                "label": "Complex HM"
                            },
                            {
                                "value": "meo",
                                "label": "MEO"
                            },
                            {
                                "value": "dyeo",
                                "label": "DyEO"
                            },
                            {
                                "value": "atwo",
                                "label": "ATWO"
                            }
                        ]
                    }
                }
            ]
        }
    }
]

export const profile = {
    "maskedPhone": null,
    "tcStatus": null,
    "channel": "sunbirdpreprodcustodian",
    "profileUserTypes": [
        {
            "type": "parent"
        }
    ],
    "updatedDate": "2022-04-14 06:21:59:749+0000",
    "managedBy": null,
    "flagsValue": 0,
    "id": "9d17a8b4-925b-41ac-a9f6-2d536ebeb34c",
    "recoveryEmail": "",
    "identifier": "9d17a8b4-925b-41ac-a9f6-2d536ebeb34c",
    "updatedBy": "9d17a8b4-925b-41ac-a9f6-2d536ebeb34c",
    "externalIds": [],
    "roleList": [
        {
            "name": "Book Creator",
            "id": "BOOK_CREATOR"
        },
        {
            "name": "Membership Management",
            "id": "MEMBERSHIP_MANAGEMENT"
        },
        {
            "name": "Flag Reviewer",
            "id": "FLAG_REVIEWER"
        },
        {
            "name": "Report Viewer",
            "id": "REPORT_VIEWER"
        },
        {
            "name": "Program Manager",
            "id": "PROGRAM_MANAGER"
        },
        {
            "name": "Program Designer",
            "id": "PROGRAM_DESIGNER"
        },
        {
            "name": "System Administration",
            "id": "SYSTEM_ADMINISTRATION"
        },
        {
            "name": "Content Curation",
            "id": "CONTENT_CURATION"
        },
        {
            "name": "Book Reviewer",
            "id": "BOOK_REVIEWER"
        },
        {
            "name": "Content Creator",
            "id": "CONTENT_CREATOR"
        },
        {
            "name": "Org Management",
            "id": "ORG_MANAGEMENT"
        },
        {
            "name": "Course Admin",
            "id": "COURSE_ADMIN"
        },
        {
            "name": "Org Moderator",
            "id": "ORG_MODERATOR"
        },
        {
            "name": "Public",
            "id": "PUBLIC"
        },
        {
            "name": "Admin",
            "id": "ADMIN"
        },
        {
            "name": "Course Mentor",
            "id": "COURSE_MENTOR"
        },
        {
            "name": "Content Reviewer",
            "id": "CONTENT_REVIEWER"
        },
        {
            "name": "Report Admin",
            "id": "REPORT_ADMIN"
        },
        {
            "name": "Org Admin",
            "id": "ORG_ADMIN"
        }
    ],
    "rootOrgId": "0126796199493140480",
    "prevUsedEmail": "",
    "firstName": "Ssunbird",
    "isMinor": false,
    "tncAcceptedOn": 1644811598091,
    "allTncAccepted": {
        "groupsTnc": {
            "tncAcceptedOn": "2022-03-16 07:13:46:695+0000",
            "version": "3.5.0"
        }
    },
    "phone": "",
    "dob": "1981-12-31",
    "status": 1,
    "lastName": "",
    "tncLatestVersion": "v12",
    "roles": [],
    "prevUsedPhone": "",
    "stateValidated": false,
    "isDeleted": false,
    "organisations": [
        {
            "organisationId": "0126796199493140480",
            "approvedBy": null,
            "channel": "sunbirdpreprodcustodian",
            "updatedDate": null,
            "approvaldate": null,
            "isSystemUpload": false,
            "isDeleted": false,
            "id": "01347430331917926412",
            "isApproved": null,
            "orgjoindate": "2022-02-14 04:06:34:382+0000",
            "isSelfDeclaration": true,
            "updatedBy": null,
            "orgName": "Staging Custodian Organization",
            "addedByName": null,
            "addedBy": null,
            "associationType": 2,
            "locationIds": [
                "027f81d8-0a2c-4fc6-96ac-59fe4cea3abf",
                "8250d58d-f1a2-4397-bfd3-b2e688ba7141"
            ],
            "orgLocation": [
                {
                    "type": "state",
                    "id": "027f81d8-0a2c-4fc6-96ac-59fe4cea3abf"
                },
                {
                    "type": "district",
                    "id": "8250d58d-f1a2-4397-bfd3-b2e688ba7141"
                }
            ],
            "externalId": "101010",
            "userId": "9d17a8b4-925b-41ac-a9f6-2d536ebeb34c",
            "isSchool": false,
            "hashTagId": "0126796199493140480",
            "isSSO": false,
            "isRejected": null,
            "locations": [
                {
                    "code": "29",
                    "name": "Karnataka",
                    "id": "027f81d8-0a2c-4fc6-96ac-59fe4cea3abf",
                    "type": "state",
                    "parentId": null
                },
                {
                    "code": "2901",
                    "name": "BELAGAVI",
                    "id": "8250d58d-f1a2-4397-bfd3-b2e688ba7141",
                    "type": "district",
                    "parentId": "027f81d8-0a2c-4fc6-96ac-59fe4cea3abf"
                }
            ],
            "position": null,
            "orgLeftDate": null
        }
    ],
    "provider": null,
    "countryCode": null,
    "tncLatestVersionUrl": "https://sunbirdstagingpublic.blob.core.windows.net/termsandcondtions/terms-and-conditions-v12.html",
    "maskedEmail": "sd*****@yopmail.com",
    "email": "sd*****@yopmail.com",
    "rootOrg": {
        "keys": {},
        "channel": "sunbirdpreprodcustodian",
        "description": "Pre-prod Custodian Organization",
        "updatedDate": "2022-02-18 09:50:42:752+0000",
        "organisationType": 5,
        "isTenant": true,
        "provider": null,
        "id": "0126796199493140480",
        "email": null,
        "slug": "sunbirdpreprodcustodian",
        "isSSOEnabled": null,
        "orgName": "Staging Custodian Organization",
        "updatedBy": null,
        "locationIds": [
            "027f81d8-0a2c-4fc6-96ac-59fe4cea3abf",
            "8250d58d-f1a2-4397-bfd3-b2e688ba7141"
        ],
        "externalId": "101010",
        "orgLocation": [
            {
                "type": "state",
                "id": "027f81d8-0a2c-4fc6-96ac-59fe4cea3abf"
            },
            {
                "type": "district",
                "id": "8250d58d-f1a2-4397-bfd3-b2e688ba7141"
            }
        ],
        "isRootOrg": true,
        "rootOrgId": "0126796199493140480",
        "createdDate": "2019-01-18 09:48:13:428+0000",
        "createdBy": "system",
        "hashTagId": "0126796199493140480",
        "status": 1
    },
    "topics": [],
    "tcUpdatedDate": null,
    "userLocations": [
        {
            "code": "3207",
            "name": "THRISSUR",
            "id": "2bb88fec-873e-45a2-ba6e-facb63bbbf65",
            "type": "district",
            "parentId": "e73e5a54-3e8b-43a8-81a4-878f59130d1e"
        },
        {
            "code": "32",
            "name": "Kerala",
            "id": "e73e5a54-3e8b-43a8-81a4-878f59130d1e",
            "type": "state",
            "parentId": null
        }
    ],
    "recoveryPhone": "",
    "userName": "ssunbird_meeg",
    "userId": "9d17a8b4-925b-41ac-a9f6-2d536ebeb34c",
    "declarations": [
        {
            "persona": "default",
            "errorType": null,
            "orgId": "0127236218321879040",
            "status": "SUBMITTED",
            "info": {
                "declared-email": "ssunbird@yopmail.com"
            }
        }
    ],
    "promptTnC": false,
    "lastLoginTime": 0,
    "createdDate": "2022-02-14 04:06:34:342+0000",
    "framework": {
        "board": [
            "State (Assam)"
        ],
        "gradeLevel": [
            "Class 7",
            "Class 8"
        ],
        "id": [
            "as_k-12"
        ],
        "medium": [
            "English"
        ],
        "subject": [
            "English",
            "Mathemaics"
        ]
    },
    "createdBy": null,
    "profileUserType": {
        "subType": 'subType',
        "type": "parent"
    },
    "tncAcceptedVersion": "v12",
    "persona": {
        "code": "parent",
        "name": "Parent",
        "formConfig": {
            "request": {
                "type": "profileConfig",
                "subType": "default",
                "action": "get"
            },
            "url": "/api/data/v1/form"
        },
        "translations": "{\"en\":\"Parent\"}",
        "image": "ic_parent.svg",
        "ambiguousFilters": [],
        "searchFilter": [],
        "attributes": {
            "mandatory": [
                "board",
                "medium",
                "gradeLevel"
            ],
            "optional": [
                "subject"
            ]
        }
    }
}

export const userLocation = {
    "district": {
        "code": "3207",
        "name": "THRISSUR",
        "id": "2bb88fec-873e-45a2-ba6e-facb63bbbf65",
        "type": "district",
        "parentId": "e73e5a54-3e8b-43a8-81a4-878f59130d1e"
    },
    "state": {
        "code": "32",
        "name": "Kerala",
        "id": "e73e5a54-3e8b-43a8-81a4-878f59130d1e",
        "type": "state",
        "parentId": null
    }
}

export const subPersonaConfig = {
    "code": "subPersona",
    "type": "select",
    "default": null,
    "templateOptions": {
        "labelHtml": {
            "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
            "values": {
                "$0": "Subrole"
            }
        },
        "placeHolder": "Select Subrole",
        "multiple": true,
        "dataSrc": {
            "marker": "SUBPERSONA_LIST",
            "params": {
                "useCase": "SIGNEDIN"
            }
        },
        "options": [
            {
                "value": "hm",
                "label": "HM"
            },
            {
                "value": "crp",
                "label": "CRP"
            },
            {
                "value": "chm",
                "label": "Complex HM"
            },
            {
                "value": "meo",
                "label": "MEO"
            },
            {
                "value": "dyeo",
                "label": "DyEO"
            },
            {
                "value": "atwo",
                "label": "ATWO"
            },
            {
                "value": "dtwo",
                "label": "DTWO"
            },
            {
                "value": "gcdo_pmrc",
                "label": "GCDO PMRC"
            },
            {
                "value": "cmo_pmrc",
                "label": "CMO PMRC"
            },
            {
                "value": "amo_pmrc",
                "label": "AMO PMRC"
            },
            {
                "value": "ddtw",
                "label": "DDTW"
            },
            {
                "value": "aso_dpo",
                "label": "ASO DPO"
            },
            {
                "value": "asst_als_coordinator",
                "label": "Asst ALS Coordinator"
            },
            {
                "value": "asst_ie_coordinator",
                "label": "Asst IE Coordinator"
            },
            {
                "value": "als_coordinator",
                "label": "ALS Coordinator"
            },
            {
                "value": "ie_coordinator",
                "label": "IE Coordinator"
            },
            {
                "value": "cmo",
                "label": "CMO"
            },
            {
                "value": "aamo",
                "label": "AAMO"
            },
            {
                "value": "amo",
                "label": "AMO"
            },
            {
                "value": "apc",
                "label": "APC"
            },
            {
                "value": "diet_lecturer",
                "label": "DIET Lecturer"
            },
            {
                "value": "diet_pricipal",
                "label": "DIET Principal"
            },
            {
                "value": "deo",
                "label": "DEO"
            },
            {
                "value": "rjd",
                "label": "RJD"
            },
            {
                "value": "slcc",
                "label": "SLCC"
            },
            {
                "value": "slmo",
                "label": "SLMO"
            },
            {
                "value": "spd",
                "label": "SPD"
            },
            {
                "value": "dir_ad_ed",
                "label": "Director Adult Education"
            },
            {
                "value": "dir_pub_lib",
                "label": "Director Public Libraries"
            },
            {
                "value": "dir_scert",
                "label": "Director SCERT"
            },
            {
                "value": "sec_kgbv",
                "label": "Secretary KGBV"
            },
            {
                "value": "sec_pub_lib",
                "label": "Secretary Public Libraries"
            },
            {
                "value": "dep_dir_ad_ed",
                "label": "Deputy director Adult Education"
            },
            {
                "value": "lib_pub_lib",
                "label": "Librarian Public Libraries"
            },
            {
                "value": "sup_ad_ed",
                "label": "Supervisor Adult Education"
            },
            {
                "value": "lib_bdc",
                "label": "Librarian Public Libraries/ Book deposit center"
            },
            {
                "value": "ins_ad_ed",
                "label": "Instructor/ Volunteer Adult Education"
            },
            {
                "value": "bdc_inch",
                "label": "BDC Incharge"
            }
        ]
    },
    "validations": [
        {
            "type": "required"
        }
    ]
}
