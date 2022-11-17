export const mockUserHomeData = [
    {
        index: 1,
        title: '{"en":"Browse by subject"}',
        data: [
            {
                facet: 'advance tamil',
                searchCriteria: {
                    sortCriteria: [],
                    searchType: 'search',
                    offset: 0,
                    limit: 100,
                    impliedFiltersMap: [],
                    impliedFilters: [],
                    facets: [
                        'subject',
                        'primaryCategory'
                    ],
                    board: [
                        'State (Assam)'
                    ],
                    medium: [
                        'Assamese',
                        'Bengali',
                        'English',
                        'Hindi'
                    ],
                    grade: [
                        'Class 5',
                        'Class 6',
                        'Class 7',
                        'Class 8',
                        'Class 9',
                        'Class 10'
                    ],
                    subject: [
                        'advance tamil'
                    ]
                },
                aggregate: {
                    groupBy: 'primaryCategory'
                }
            },
            {
                facet: 'mathematics',
                searchCriteria: {
                    sortCriteria: [],
                    searchType: 'search',
                    offset: 0,
                    limit: 100,
                    impliedFiltersMap: [],
                    impliedFilters: [],
                    facets: [
                        'subject',
                        'primaryCategory'
                    ],
                    board: [
                        'State (Assam)'
                    ],
                    medium: [
                        'Assamese',
                        'Bengali',
                        'English',
                        'Hindi'
                    ],
                    grade: [
                        'Class 5',
                        'Class 6',
                        'Class 7',
                        'Class 8',
                        'Class 9',
                        'Class 10'
                    ],
                    subject: [
                        'mathematics'
                    ]
                },
                aggregate: {
                    groupBy: 'primaryCategory'
                }
            },
            {
                facet: 'science',
                searchCriteria: {
                    sortCriteria: [],
                    searchType: 'search',
                    offset: 0,
                    limit: 100,
                    impliedFiltersMap: [],
                    impliedFilters: [],
                    facets: [
                        'subject',
                        'primaryCategory'
                    ],
                    board: [
                        'State (Assam)'
                    ],
                    medium: [
                        'Assamese',
                        'Bengali',
                        'English',
                        'Hindi'
                    ],
                    grade: [
                        'Class 5',
                        'Class 6',
                        'Class 7',
                        'Class 8',
                        'Class 9',
                        'Class 10'
                    ],
                    subject: [
                        'science'
                    ]
                },
                aggregate: {
                    groupBy: 'primaryCategory'
                }
            },
        ],
        dataSrc: {
            type: 'CONTENT_FACETS',
            request: {
                type: 'POST',
                path: '/api/content/v1/search',
                withBearerToken: true,
                body: {
                    request: {
                        offset: 0,
                        limit: 0,
                        exists: [],
                        facets: [
                            'subject',
                            'primaryCategory'
                        ],
                        sort_by: {},
                        filters: {
                            audience: [],
                            objectType: [
                                'Content'
                            ],
                            contentType: [],
                            primaryCategory: [],
                            gradeLevel: [
                                'Class 5',
                                'Class 6',
                                'Class 7',
                                'Class 8',
                                'Class 9',
                                'Class 10'
                            ],
                            medium: [
                                'Assamese',
                                'Bengali',
                                'English',
                                'Hindi'
                            ],
                            board: [
                                'State (Assam)'
                            ],
                            language: [],
                            topic: [],
                            purpose: [],
                            channel: [],
                            mimeType: [],
                            subject: []
                        }
                    }
                }
            },
            mapping: [
                {
                    facet: 'subject',
                    aggregate: {
                        groupBy: 'primaryCategory'
                    }
                },
                {
                    facet: 'primaryCategory',
                    aggregate: {
                        groupBy: 'subject'
                    }
                }
            ],
            facet: 'subject'
        },
        theme: {
            component: 'sb-pills-grid',
            inputs: {
                pillShape: 'default',
                pillsViewType: 'scroll',
                minDisplayCount: 10,
                showMoreViewType: 'new_screen',
                viewMoreText: '{"en":"View all subjects"}',
                viewLessText: '{"en":"View Less"}',
                pillsMultiRow: 'double_view_column'
            },
            children: {
                'sb-pill-item': {
                    inputs: {
                        icon: 'assets/imgs/book_default.svg'
                    },
                    inputsMap: {
                        icon: {
                            german: 'assets/imgs/book_english.svg',
                            mathematics: 'assets/imgs/calculator.svg',
                            science: 'assets/imgs/globe.svg'
                        },
                        theme: {
                            german: {
                                iconBgColor: 'rgba(255,139,46,1)',
                                pillBgColor: 'rgba(255,139,46,0.3)'
                            },
                            mathematics: {
                                iconBgColor: 'rgba(163,99,255,1)',
                                pillBgColor: 'rgba(163,99,255,0.3)'
                            },
                            science: {
                                iconBgColor: 'rgba(34,139,255,1)',
                                pillBgColor: 'rgba(34,139,255,0.3)'
                            }
                        }
                    }
                }
            }
        }
    },
    {
        index: 2,
        title: '{"en":"Browse by category"}',
        data: [
            {
                facet: 'digital textbook',
                searchCriteria: {
                    sortCriteria: [],
                    searchType: 'search',
                    offset: 0,
                    limit: 100,
                    impliedFiltersMap: [],
                    impliedFilters: [],
                    facets: [
                        'subject',
                        'primaryCategory'
                    ],
                    board: [
                        'State (Assam)'
                    ],
                    medium: [
                        'Assamese',
                        'Bengali',
                        'English',
                        'Hindi'
                    ],
                    grade: [
                        'Class 5',
                        'Class 6',
                        'Class 7',
                        'Class 8',
                        'Class 9',
                        'Class 10'
                    ],
                    primaryCategory: [
                        'digital textbook'
                    ]
                },
                aggregate: {
                    groupBy: 'subject'
                }
            },
            {
                facet: 'explanation content',
                searchCriteria: {
                    sortCriteria: [],
                    searchType: 'search',
                    offset: 0,
                    limit: 100,
                    impliedFiltersMap: [],
                    impliedFilters: [],
                    facets: [
                        'subject',
                        'primaryCategory'
                    ],
                    board: [
                        'State (Assam)'
                    ],
                    medium: [
                        'Assamese',
                        'Bengali',
                        'English',
                        'Hindi'
                    ],
                    grade: [
                        'Class 5',
                        'Class 6',
                        'Class 7',
                        'Class 8',
                        'Class 9',
                        'Class 10'
                    ],
                    primaryCategory: [
                        'explanation content'
                    ]
                },
                aggregate: {
                    groupBy: 'subject'
                }
            },
            {
                facet: 'learning resource',
                searchCriteria: {
                    sortCriteria: [],
                    searchType: 'search',
                    offset: 0,
                    limit: 100,
                    impliedFiltersMap: [],
                    impliedFilters: [],
                    facets: [
                        'subject',
                        'primaryCategory'
                    ],
                    board: [
                        'State (Assam)'
                    ],
                    medium: [
                        'Assamese',
                        'Bengali',
                        'English',
                        'Hindi'
                    ],
                    grade: [
                        'Class 5',
                        'Class 6',
                        'Class 7',
                        'Class 8',
                        'Class 9',
                        'Class 10'
                    ],
                    primaryCategory: [
                        'learning resource'
                    ]
                },
                aggregate: {
                    groupBy: 'subject'
                }
            }
        ],
        dataSrc: {
            type: 'CONTENT_FACETS',
            request: {
                type: 'POST',
                path: '/api/content/v1/search',
                withBearerToken: true,
                body: {
                    request: {
                        offset: 0,
                        limit: 0,
                        exists: [],
                        facets: [
                            'subject',
                            'primaryCategory'
                        ],
                        sort_by: {},
                        filters: {
                            audience: [],
                            objectType: [
                                'Content'
                            ],
                            contentType: [],
                            primaryCategory: [],
                            gradeLevel: [
                                'Class 5',
                                'Class 6',
                                'Class 7',
                                'Class 8',
                                'Class 9',
                                'Class 10'
                            ],
                            medium: [
                                'Assamese',
                                'Bengali',
                                'English',
                                'Hindi'
                            ],
                            board: [
                                'State (Assam)'
                            ],
                            language: [],
                            topic: [],
                            purpose: [],
                            channel: [],
                            mimeType: [],
                            subject: []
                        }
                    }
                }
            },
            mapping: [
                {
                    facet: 'subject',
                    aggregate: {
                        groupBy: 'primaryCategory'
                    }
                },
                {
                    facet: 'primaryCategory',
                    aggregate: {
                        groupBy: 'subject'
                    }
                }
            ],
            facet: 'primaryCategory'
        },
        theme: {
            component: 'sb-pills-grid',
            inputs: {
                pillShape: 'image_overlap',
                pillsViewType: 'scroll'
            },
            children: {
                'sb-pill-item': {
                    inputs: {
                        icon: 'assets/imgs/all_content.svg',
                        theme: {
                            iconBgColor: '#FFFFFF',
                            pillBgColor: '#FFFFFF'
                        }
                    },
                    inputsMap: {
                        icon: {
                            'digital textbooks': 'assets/imgs/textbook.svg',
                            courses: 'assets/imgs/course.svg',
                            'tv programs': 'assets/imgs/tv.svg',
                            documents: 'assets/imgs/documents.svg',
                            videos: 'assets/imgs/videos.svg'
                        }
                    }
                }
            }
        }
    },
    {
        index: 3,
        title: '{"en":"Recently viewed"}',
        data: {
            name: '3',
            sections: [
                {
                    name: '3',
                    count: 1,
                    contents: [
                        {
                            identifier: 'do_31263780400280371213182',
                            name: '  ঘৰ্ষণ  ',
                            contentData: {
                                ownershipType: [
                                    'createdBy'
                                ],
                                copyright: 'Assam',
                                previewUrl: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/ecml/do_31263780400280371213182-latest',
                                keywords: [
                                    'ঘৰ্ষণ',
                                    'friction'
                                ],
                                subject: [
                                    'Science'
                                ],
                                channel: '01254290140407398431',
                                downloadUrl: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/ecar_files/do_31263780400280371213182/ghrssnn_1545651414136_do_31263780400280371213182_1.0.ecar',
                                questions: [
                                    {
                                        identifier: 'do_31266189546487808011948',
                                        name: 'ঘুৰ্ণি  ঘৰ্ষণ, স্থিতি ঘৰ্ষণ আৰু পিছল ঘৰ্ষণৰ বল অধঃক্ৰমত সজালে শুদ্ধ ক্ৰমটো হব -\n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31266190753464320011998',
                                        name: 'এখন পুতলা গাড়ীমাৰ্বলৰ তিতা মাজিয়া, মাৰ্বলৰ শুকাণ মাজিয়া আৰু মাৰ্বলৰ মজিয়াৰ ওপৰত বাতৰি কাকত পাৰি চলোৱা হ\'ল ৷ পুতলা গাড়ীখনত ক্ৰিয়াকৰা ঘৰ্ষণবল উৰ্দ্ধক্ৰমত সজালে ক্ৰমটো হব-\n',
                                        description: 'MCQ',
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31263780961204633622999',
                                        name: 'এটা যন্ত্ৰৰ লৰচৰ কৰা অংশ সমুহৰ মাজত লুব্ৰিকেন্ট ব্য়ৱহাৰ কৰি ঘৰ্ষণ-\n\n \n\nসৃষ্টি কৰিব পাৰি\n\n \n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31263786605568000023033',
                                        name: 'জোতাৰ খাজ কটা তলি খন--------------- ব্য়ৱহৃত হয়\n\n\n \n\n \n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31263781552818585613190',
                                        name: '৩) ‘টনা বল\'  ক  সাধাৰণতে কোৱা হয়\n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31263781279417139213189',
                                        name: 'চকা সংযুক্ত বয় বস্তুৰ টোপোলা বা বেগ আদি টানি নিয়াটো সুবিধাজনক হয় কাৰণ -\n\n \n\n \n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31266186681373491211943',
                                        name: 'ঘৰ্ষণ বাঢ়ি যায়-\n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    }
                                ],
                                organisation: [
                                    'Assam'
                                ],
                                language: [
                                    'English'
                                ],
                                mimeType: 'application/vnd.ekstep.ecml-archive',
                                variants: {
                                    spine: {
                                        ecarUrl: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/ecar_files/do_31263780400280371213182/ghrssnn_1545651414234_do_31263780400280371213182_1.0_spine.ecar',
                                        size: 3874
                                    }
                                },
                                editorState: '{"plugin":{"noOfExtPlugins":13,"extPlugins":[{"plugin":"org.ekstep.contenteditorfunctions","version":"1.2"},{"plugin":"org.ekstep.keyboardshortcuts","version":"1.0"},{"plugin":"org.ekstep.richtext","version":"1.0"},{"plugin":"org.ekstep.iterator","version":"1.0"},{"plugin":"org.ekstep.navigation","version":"1.0"},{"plugin":"org.ekstep.mathtext","version":"1.0"},{"plugin":"org.ekstep.libs.ckeditor","version":"1.0"},{"plugin":"org.ekstep.questionunit","version":"1.0"},{"plugin":"org.ekstep.keyboard","version":"1.0"},{"plugin":"org.ekstep.questionunit.mcq","version":"1.1"},{"plugin":"org.ekstep.questionunit.mtf","version":"1.1"},{"plugin":"org.ekstep.questionunit.reorder","version":"1.0"},{"plugin":"org.ekstep.questionunit.sequence","version":"1.0"}]},"stage":{"noOfStages":2,"currentStage":"81481683-2c99-469a-a347-89b95cdb1b0e","selectedPluginObject":"cc584527-ec1a-47ba-97cb-e2d14c1003c8"},"sidebar":{"selectedMenu":"settings"}}',
                                objectType: 'Content',
                                gradeLevel: [
                                    'Class 8'
                                ],
                                appIcon: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31263780400280371213182/artifact/hhhh_1545643284557.thumb.jpg',
                                primaryCategory: 'Learning Resource',
                                collections: [
                                    {
                                        identifier: 'do_3126590295958650881129',
                                        name: 'বিজ্ঞান (অষ্টম শ্ৰেণীৰ পাঠ্য়পুথি)/ Science (Class-8)',
                                        description: 'Enter description for TextBook ',
                                        objectType: 'Collection',
                                        relation: 'hasSequenceMember',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31266212998540492812007',
                                        name: 'unit three',
                                        description: 'this is for testing',
                                        objectType: 'Content',
                                        relation: 'hasSequenceMember',
                                        status: 'Retired'
                                    }
                                ],
                                appId: 'prod.sunbird.portal',
                                contentEncoding: 'gzip',
                                artifactUrl: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31263780400280371213182/artifact/1545651413930_do_31263780400280371213182.zip',
                                sYS_INTERNAL_LAST_UPDATED_ON: '2019-11-08T01:31:01.556+0000',
                                contentType: 'Resource',
                                identifier: 'do_31263780400280371213182',
                                lastUpdatedBy: '59cb2df2-db4e-416c-a704-728656eebb3a',
                                audience: [
                                    'Student'
                                ],
                                visibility: 'Default',
                                author: 'Assam',
                                consumerId: 'e85bcfb5-a8c2-4e65-87a2-0ebb43b45f01',
                                mediaType: 'content',
                                osId: 'org.ekstep.quiz.app',
                                languageCode: [
                                    'en'
                                ],
                                lastPublishedBy: '6180f7a4-d3ee-4e90-a9f5-a70d55e6fcae',
                                version: 2,
                                rejectReasons: [
                                    'Others'
                                ],
                                license: 'CC BY 4.0',
                                prevState: 'Review',
                                size: 411887,
                                lastPublishedOn: '2018-12-24T11:36:54.135+0000',
                                name: '  ঘৰ্ষণ  ',
                                rejectComment: 'as instructed',
                                topic: [
                                    'Friction'
                                ],
                                status: 'Live',
                                totalQuestions: 7,
                                code: 'org.sunbird.KH7gCe',
                                description: 'Multiple Choice Question',
                                streamingUrl: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/ecml/do_31263780400280371213182-latest',
                                medium: [
                                    'Assamese'
                                ],
                                posterImage: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31266190978555904011954/artifact/hhhh_1545643284557.jpg',
                                idealScreenSize: 'normal',
                                createdOn: '2018-11-20T07:58:03.935+0000',
                                copyrightYear: 2019,
                                contentDisposition: 'inline',
                                lastUpdatedOn: '2018-12-24T11:36:41.281+0000',
                                dialcodeRequired: 'No',
                                owner: 'Lakshmi Kanta Das',
                                createdFor: [
                                    '01254290140407398431'
                                ],
                                creator: 'Lakshmi Kanta Das',
                                os: [
                                    'All'
                                ],
                                totalScore: 7,
                                pkgVersion: 1,
                                versionKey: '1545651401281',
                                idealScreenDensity: 'hdpi',
                                framework: 'as_k-12',
                                s3Key: 'ecar_files/do_31263780400280371213182/ghrssnn_1545651414136_do_31263780400280371213182_1.0.ecar',
                                me_averageRating: 4,
                                lastSubmittedOn: '2018-12-24T11:34:21.568+0000',
                                createdBy: '59cb2df2-db4e-416c-a704-728656eebb3a',
                                compatibilityLevel: 2,
                                ownedBy: '59cb2df2-db4e-416c-a704-728656eebb3a',
                                board: 'State (Assam)',
                                resourceType: 'Test',
                                licenseDetails: {
                                    name: 'CC BY 4.0',
                                    url: 'https://creativecommons.org/licenses/by/4.0/legalcode',
                                    description: 'For details see below:'
                                },
                                trackable: {
                                    enabled: 'No'
                                },
                                cardImg: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31263780400280371213182/artifact/hhhh_1545643284557.thumb.jpg'
                            },
                            isUpdateAvailable: false,
                            mimeType: 'application/vnd.ekstep.ecml-archive',
                            basePath: '',
                            primaryCategory: 'learning resource',
                            contentType: 'resource',
                            isAvailableLocally: false,
                            referenceCount: 0,
                            sizeOnDevice: 0,
                            lastUsedTime: 1613459367380,
                            lastUpdatedTime: 0
                        }
                    ]
                }
            ]
        },
        dataSrc: {
            type: 'RECENTLY_VIEWED_CONTENTS',
            mapping: []
        },
        theme: {
            component: 'sb-library-cards-hlist',
            inputs: {
                type: 'mobile_textbook',
                viewMoreButtonText: '{"en":"View all"}',
                maxCardCount: 10,
                viewMoreButtonPosition: 'right'
            }
        }
    },
    {
        index: 3,
        title: '{"en":"Continue"}',
        data: {
            name: '4',
            sections: [
                {
                    name: '4',
                    count: 1,
                    contents: [
                        {
                            identifier: 'do_31263780400280371213182',
                            name: '  ঘৰ্ষণ  ',
                            contentData: {
                                ownershipType: [
                                    'createdBy'
                                ],
                                copyright: 'Assam',
                                previewUrl: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/ecml/do_31263780400280371213182-latest',
                                keywords: [
                                    'ঘৰ্ষণ',
                                    'friction'
                                ],
                                subject: [
                                    'Science'
                                ],
                                channel: '01254290140407398431',
                                downloadUrl: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/ecar_files/do_31263780400280371213182/ghrssnn_1545651414136_do_31263780400280371213182_1.0.ecar',
                                questions: [
                                    {
                                        identifier: 'do_31266189546487808011948',
                                        name: 'ঘুৰ্ণি  ঘৰ্ষণ, স্থিতি ঘৰ্ষণ আৰু পিছল ঘৰ্ষণৰ বল অধঃক্ৰমত সজালে শুদ্ধ ক্ৰমটো হব -\n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31266190753464320011998',
                                        name: 'এখন পুতলা গাড়ীমাৰ্বলৰ তিতা মাজিয়া, মাৰ্বলৰ শুকাণ মাজিয়া আৰু মাৰ্বলৰ মজিয়াৰ ওপৰত বাতৰি কাকত পাৰি চলোৱা হ\'ল ৷ পুতলা গাড়ীখনত ক্ৰিয়াকৰা ঘৰ্ষণবল উৰ্দ্ধক্ৰমত সজালে ক্ৰমটো হব-\n',
                                        description: 'MCQ',
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31263780961204633622999',
                                        name: 'এটা যন্ত্ৰৰ লৰচৰ কৰা অংশ সমুহৰ মাজত লুব্ৰিকেন্ট ব্য়ৱহাৰ কৰি ঘৰ্ষণ-\n\n \n\nসৃষ্টি কৰিব পাৰি\n\n \n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31263786605568000023033',
                                        name: 'জোতাৰ খাজ কটা তলি খন--------------- ব্য়ৱহৃত হয়\n\n\n \n\n \n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31263781552818585613190',
                                        name: '৩) ‘টনা বল\'  ক  সাধাৰণতে কোৱা হয়\n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31263781279417139213189',
                                        name: 'চকা সংযুক্ত বয় বস্তুৰ টোপোলা বা বেগ আদি টানি নিয়াটো সুবিধাজনক হয় কাৰণ -\n\n \n\n \n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31266186681373491211943',
                                        name: 'ঘৰ্ষণ বাঢ়ি যায়-\n',
                                        description: null,
                                        objectType: 'AssessmentItem',
                                        relation: 'associatedTo',
                                        status: 'Live'
                                    }
                                ],
                                organisation: [
                                    'Assam'
                                ],
                                language: [
                                    'English'
                                ],
                                mimeType: 'application/vnd.ekstep.ecml-archive',
                                variants: {
                                    spine: {
                                        ecarUrl: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/ecar_files/do_31263780400280371213182/ghrssnn_1545651414234_do_31263780400280371213182_1.0_spine.ecar',
                                        size: 3874
                                    }
                                },
                                editorState: '{"plugin":{"noOfExtPlugins":13,"extPlugins":[{"plugin":"org.ekstep.contenteditorfunctions","version":"1.2"},{"plugin":"org.ekstep.keyboardshortcuts","version":"1.0"},{"plugin":"org.ekstep.richtext","version":"1.0"},{"plugin":"org.ekstep.iterator","version":"1.0"},{"plugin":"org.ekstep.navigation","version":"1.0"},{"plugin":"org.ekstep.mathtext","version":"1.0"},{"plugin":"org.ekstep.libs.ckeditor","version":"1.0"},{"plugin":"org.ekstep.questionunit","version":"1.0"},{"plugin":"org.ekstep.keyboard","version":"1.0"},{"plugin":"org.ekstep.questionunit.mcq","version":"1.1"},{"plugin":"org.ekstep.questionunit.mtf","version":"1.1"},{"plugin":"org.ekstep.questionunit.reorder","version":"1.0"},{"plugin":"org.ekstep.questionunit.sequence","version":"1.0"}]},"stage":{"noOfStages":2,"currentStage":"81481683-2c99-469a-a347-89b95cdb1b0e","selectedPluginObject":"cc584527-ec1a-47ba-97cb-e2d14c1003c8"},"sidebar":{"selectedMenu":"settings"}}',
                                objectType: 'Content',
                                gradeLevel: [
                                    'Class 8'
                                ],
                                appIcon: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31263780400280371213182/artifact/hhhh_1545643284557.thumb.jpg',
                                primaryCategory: 'Learning Resource',
                                collections: [
                                    {
                                        identifier: 'do_3126590295958650881129',
                                        name: 'বিজ্ঞান (অষ্টম শ্ৰেণীৰ পাঠ্য়পুথি)/ Science (Class-8)',
                                        description: 'Enter description for TextBook ',
                                        objectType: 'Collection',
                                        relation: 'hasSequenceMember',
                                        status: 'Live'
                                    },
                                    {
                                        identifier: 'do_31266212998540492812007',
                                        name: 'unit three',
                                        description: 'this is for testing',
                                        objectType: 'Content',
                                        relation: 'hasSequenceMember',
                                        status: 'Retired'
                                    }
                                ],
                                appId: 'prod.sunbird.portal',
                                contentEncoding: 'gzip',
                                artifactUrl: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31263780400280371213182/artifact/1545651413930_do_31263780400280371213182.zip',
                                sYS_INTERNAL_LAST_UPDATED_ON: '2019-11-08T01:31:01.556+0000',
                                contentType: 'Resource',
                                identifier: 'do_31263780400280371213182',
                                lastUpdatedBy: '59cb2df2-db4e-416c-a704-728656eebb3a',
                                audience: [
                                    'Student'
                                ],
                                visibility: 'Default',
                                author: 'Assam',
                                consumerId: 'e85bcfb5-a8c2-4e65-87a2-0ebb43b45f01',
                                mediaType: 'content',
                                osId: 'org.ekstep.quiz.app',
                                languageCode: [
                                    'en'
                                ],
                                lastPublishedBy: '6180f7a4-d3ee-4e90-a9f5-a70d55e6fcae',
                                version: 2,
                                rejectReasons: [
                                    'Others'
                                ],
                                license: 'CC BY 4.0',
                                prevState: 'Review',
                                size: 411887,
                                lastPublishedOn: '2018-12-24T11:36:54.135+0000',
                                name: '  ঘৰ্ষণ  ',
                                rejectComment: 'as instructed',
                                topic: [
                                    'Friction'
                                ],
                                status: 'Live',
                                totalQuestions: 7,
                                code: 'org.sunbird.KH7gCe',
                                description: 'Multiple Choice Question',
                                streamingUrl: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/ecml/do_31263780400280371213182-latest',
                                medium: [
                                    'Assamese'
                                ],
                                posterImage: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31266190978555904011954/artifact/hhhh_1545643284557.jpg',
                                idealScreenSize: 'normal',
                                createdOn: '2018-11-20T07:58:03.935+0000',
                                copyrightYear: 2019,
                                contentDisposition: 'inline',
                                lastUpdatedOn: '2018-12-24T11:36:41.281+0000',
                                dialcodeRequired: 'No',
                                owner: 'Lakshmi Kanta Das',
                                createdFor: [
                                    '01254290140407398431'
                                ],
                                creator: 'Lakshmi Kanta Das',
                                os: [
                                    'All'
                                ],
                                totalScore: 7,
                                pkgVersion: 1,
                                versionKey: '1545651401281',
                                idealScreenDensity: 'hdpi',
                                framework: 'as_k-12',
                                s3Key: 'ecar_files/do_31263780400280371213182/ghrssnn_1545651414136_do_31263780400280371213182_1.0.ecar',
                                me_averageRating: 4,
                                lastSubmittedOn: '2018-12-24T11:34:21.568+0000',
                                createdBy: '59cb2df2-db4e-416c-a704-728656eebb3a',
                                compatibilityLevel: 2,
                                ownedBy: '59cb2df2-db4e-416c-a704-728656eebb3a',
                                board: 'State (Assam)',
                                resourceType: 'Test',
                                licenseDetails: {
                                    name: 'CC BY 4.0',
                                    url: 'https://creativecommons.org/licenses/by/4.0/legalcode',
                                    description: 'For details see below:'
                                },
                                trackable: {
                                    enabled: 'No'
                                },
                                cardImg: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31263780400280371213182/artifact/hhhh_1545643284557.thumb.jpg'
                            },
                            isUpdateAvailable: false,
                            mimeType: 'application/vnd.ekstep.ecml-archive',
                            basePath: '',
                            primaryCategory: 'learning resource',
                            contentType: 'resource',
                            isAvailableLocally: false,
                            referenceCount: 0,
                            sizeOnDevice: 0,
                            lastUsedTime: 1613459367380,
                            lastUpdatedTime: 0
                        }
                    ]
                }
            ]
        },
        dataSrc: {
            type: 'TRACKABLE_COLLECTIONS',
            mapping: []
        },
        theme: {
            component: 'sb-library-cards-hlist',
            inputs: {
                type: 'mobile_textbook',
                viewMoreButtonText: '{"en":"View all"}',
                maxCardCount: 10,
                viewMoreButtonPosition: 'right'
            }
        }
    }

];
