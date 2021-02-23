export const mockDiscoverPageData = [
    {
        index: 0,
        title: '{"en":"Popular categories"}',
        data: [
            {
                facet: 'Digital Textbook',
                searchCriteria: {
                    facets: [],
                    primaryCategories: [
                        'Digital Textbook'
                    ],
                    mode: 'soft',
                    searchType: 'search'
                },
                primaryFacetFilters: [
                    {
                        code: 'board',
                        translations: '{"en":"Board/Syllabus","hi":"बोर्ड","te":"బోర్డు","ta":"வாரியம்","mr":"बोर्ड"}',
                        values: [],
                        name: 'Board/Syllabus',
                        index: 1
                    },
                    {
                        code: 'gradeLevel',
                        translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                        values: [],
                        name: 'Class',
                        index: 2
                    }
                ],
                aggregate: {
                    groupBy: 'subject'
                }
            },
            {
                facet: 'Courses',
                searchCriteria: {
                    facets: [],
                    primaryCategories: [
                        'Course'
                    ],
                    mode: 'soft',
                    searchType: 'search'
                },
                primaryFacetFilters: [
                    {
                        code: 'board',
                        translations: '{"en":"Board/Syllabus","hi":"बोर्ड","te":"బోర్డు","ta":"வாரியம்","mr":"बोर्ड"}',
                        values: [],
                        name: 'Board/Syllabus',
                        index: 1
                    },
                    {
                        code: 'gradeLevel',
                        translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                        values: [],
                        name: 'Class',
                        index: 2
                    }
                ],
                aggregate: {
                    groupBy: 'subject'
                }
            },
            {
                facet: 'Tv Classes',
                searchCriteria: {
                    facets: [],
                    primaryCategories: [
                        'Explanation Content'
                    ],
                    mode: 'soft',
                    searchType: 'search'
                },
                primaryFacetFilters: [
                    {
                        code: 'board',
                        translations: '{"en":"Board/Syllabus","hi":"बोर्ड","te":"బోర్డు","ta":"வாரியம்","mr":"बोर्ड"}',
                        values: [],
                        name: 'Board/Syllabus',
                        index: 1
                    },
                    {
                        code: 'gradeLevel',
                        translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                        values: [],
                        name: 'Class',
                        index: 2
                    }
                ],
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
                        limit: 0,
                        offset: 0,
                        mode: 'hard',
                        facets: [],
                        filters: {}
                    }
                }
            },
            values: [
                {
                    facet: 'Digital Textbook',
                    searchCriteria: {
                        facets: [],
                        primaryCategories: [
                            'Digital Textbook'
                        ],
                        mode: 'soft',
                        searchType: 'search'
                    },
                    primaryFacetFilters: [
                        {
                            code: 'board',
                            translations: '{"en":"Board/Syllabus","hi":"बोर्ड","te":"బోర్డు","ta":"வாரியம்","mr":"बोर्ड"}',
                            values: [],
                            name: 'Board/Syllabus',
                            index: 1
                        },
                        {
                            code: 'gradeLevel',
                            translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                            values: [],
                            name: 'Class',
                            index: 2
                        }
                    ],
                    aggregate: {
                        groupBy: 'subject'
                    }
                },
                {
                    facet: 'Courses',
                    searchCriteria: {
                        facets: [],
                        primaryCategories: [
                            'Course'
                        ],
                        mode: 'soft',
                        searchType: 'search'
                    },
                    primaryFacetFilters: [
                        {
                            code: 'board',
                            translations: '{"en":"Board/Syllabus","hi":"बोर्ड","te":"బోర్డు","ta":"வாரியம்","mr":"बोर्ड"}',
                            values: [],
                            name: 'Board/Syllabus',
                            index: 1
                        },
                        {
                            code: 'gradeLevel',
                            translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                            values: [],
                            name: 'Class',
                            index: 2
                        }
                    ],
                    aggregate: {
                        groupBy: 'subject'
                    }
                },
                {
                    facet: 'Tv Classes',
                    searchCriteria: {
                        facets: [],
                        primaryCategories: [
                            'Explanation Content'
                        ],
                        mode: 'soft',
                        searchType: 'search'
                    },
                    primaryFacetFilters: [
                        {
                            code: 'board',
                            translations: '{"en":"Board/Syllabus","hi":"बोर्ड","te":"బోర్డు","ta":"வாரியம்","mr":"बोर्ड"}',
                            values: [],
                            name: 'Board/Syllabus',
                            index: 1
                        },
                        {
                            code: 'gradeLevel',
                            translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                            values: [],
                            name: 'Class',
                            index: 2
                        }
                    ],
                    aggregate: {
                        groupBy: 'subject'
                    }
                }
            ],
            mapping: []
        },
        theme: {
            component: 'sb-pills-grid',
            inputs: {
                pillShape: 'default'
            }
        }
    },
    {
        index: 1,
        title: '{"en":"Search from other boards"}',
        data: [
            {
                facet: '{"en":"AP"}',
                searchCriteria: {
                    facets: [
                        'board'
                    ],
                    filters: {
                        board: [
                            'ts_k-12_2'
                        ]
                    }
                },
                primaryFacetFilters: [
                    {
                        code: 'gradeLevel',
                        translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                        values: [],
                        name: 'Class',
                        index: 2
                    },
                    {
                        code: 'medium',
                        translations: '{"en":"Medium","hi":"माध्यम","te":"మాధ్యమం","ta":"மொழி","mr":"माध्यम"}',
                        values: [],
                        name: 'Medium',
                        index: 4
                    }
                ],
                aggregate: {
                    groupBy: 'subject'
                }
            },
            {
                facet: '{"en":"AS"}',
                searchCriteria: {
                    facets: [
                        'board'
                    ],
                    filters: {
                        board: [
                            'as_k-12_5'
                        ]
                    }
                },
                primaryFacetFilters: [
                    {
                        code: 'gradeLevel',
                        translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                        values: [],
                        name: 'Class',
                        index: 2
                    },
                    {
                        code: 'medium',
                        translations: '{"en":"Medium","hi":"माध्यम","te":"మాధ్యమం","ta":"மொழி","mr":"माध्यम"}',
                        values: [],
                        name: 'Medium',
                        index: 4
                    }
                ],
                aggregate: {
                    groupBy: 'subject'
                }
            },
            {
                facet: '{"en":"KA"}',
                searchCriteria: {
                    facets: [
                        'board'
                    ],
                    filters: {
                        board: [
                            'ka_k-12_1'
                        ]
                    }
                },
                primaryFacetFilters: [
                    {
                        code: 'gradeLevel',
                        translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                        values: [],
                        name: 'Class',
                        index: 2
                    },
                    {
                        code: 'medium',
                        translations: '{"en":"Medium","hi":"माध्यम","te":"మాధ్యమం","ta":"மொழி","mr":"माध्यम"}',
                        values: [],
                        name: 'Medium',
                        index: 4
                    }
                ],
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
                        limit: 0,
                        offset: 0,
                        mode: 'hard',
                        facets: [],
                        filters: {}
                    }
                }
            },
            values: [
                {
                    facet: '{"en":"AP"}',
                    searchCriteria: {
                        facets: [
                            'board'
                        ],
                        filters: {
                            board: [
                                'ts_k-12_2'
                            ]
                        }
                    },
                    primaryFacetFilters: [
                        {
                            code: 'gradeLevel',
                            translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                            values: [],
                            name: 'Class',
                            index: 2
                        },
                        {
                            code: 'medium',
                            translations: '{"en":"Medium","hi":"माध्यम","te":"మాధ్యమం","ta":"மொழி","mr":"माध्यम"}',
                            values: [],
                            name: 'Medium',
                            index: 4
                        }
                    ],
                    aggregate: {
                        groupBy: 'subject'
                    }
                },
                {
                    facet: '{"en":"AS"}',
                    searchCriteria: {
                        facets: [
                            'board'
                        ],
                        filters: {
                            board: [
                                'as_k-12_5'
                            ]
                        }
                    },
                    primaryFacetFilters: [
                        {
                            code: 'gradeLevel',
                            translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                            values: [],
                            name: 'Class',
                            index: 2
                        },
                        {
                            code: 'medium',
                            translations: '{"en":"Medium","hi":"माध्यम","te":"మాధ్యమం","ta":"மொழி","mr":"माध्यम"}',
                            values: [],
                            name: 'Medium',
                            index: 4
                        }
                    ],
                    aggregate: {
                        groupBy: 'subject'
                    }
                },
                {
                    facet: '{"en":"KA"}',
                    searchCriteria: {
                        facets: [
                            'board'
                        ],
                        filters: {
                            board: [
                                'ka_k-12_1'
                            ]
                        }
                    },
                    primaryFacetFilters: [
                        {
                            code: 'gradeLevel',
                            translations: '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                            values: [],
                            name: 'Class',
                            index: 2
                        },
                        {
                            code: 'medium',
                            translations: '{"en":"Medium","hi":"माध्यम","te":"మాధ్యమం","ta":"மொழி","mr":"माध्यम"}',
                            values: [],
                            name: 'Medium',
                            index: 4
                        }
                    ],
                    aggregate: {
                        groupBy: 'subject'
                    }
                }
            ],
            mapping: []
        },
        theme: {
            component: 'sb-pills-grid',
            inputs: {
                pillShape: 'circle',
                pillsViewType: 'scroll'
            }
        }
    },
    {
        index: 2,
        title: '{"en":"Trending courses from your state"}',
        meta: {
            searchCriteria: {
                sortCriteria: [],
                searchType: 'search',
                offset: 0,
                limit: 100,
                impliedFiltersMap: [],
                impliedFilters: [
                    {
                        name: 'primaryCategories',
                        values: [
                            {
                                name: 'Course',
                                apply: true
                            }
                        ]
                    }
                ],
                facets: [
                    'primaryCategory'
                ]
            },
            filterCriteria: {
                limit: 100,
                offset: 0,
                facets: [
                    'primaryCategory'
                ],
                sortCriteria: [],
                mode: 'hard',
                facetFilters: [
                    {
                        name: 'primaryCategory',
                        values: []
                    }
                ],
                impliedFiltersMap: [
                    {
                        audience: []
                    },
                    {
                        contentType: []
                    },
                    {
                        medium: []
                    },
                    {
                        board: []
                    },
                    {
                        language: []
                    },
                    {
                        topic: []
                    },
                    {
                        purpose: []
                    },
                    {
                        channel: []
                    },
                    {
                        mimeType: []
                    },
                    {
                        subject: []
                    }
                ],
                impliedFilters: [
                    {
                        name: 'objectType',
                        values: [
                            {
                                name: 'Content',
                                apply: true
                            }
                        ]
                    },
                    {
                        name: 'primaryCategories',
                        values: [
                            {
                                name: 'Course',
                                apply: true
                            }
                        ]
                    }
                ]
            },
            searchRequest: {
                offset: 0,
                limit: 100,
                exists: [],
                facets: [
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
                    medium: [],
                    board: [],
                    language: [],
                    topic: [],
                    purpose: [],
                    channel: [],
                    mimeType: [],
                    subject: [],
                    primaryCategories: [
                        'Course'
                    ]
                }
            }
        },
        data: {
            name: '2',
            sections: [
                {
                    count: 1,
                    contents: [
                        {
                            ownershipType: [
                                'createdBy'
                            ],
                            publish_type: null,
                            copyright: 'Tamil Nadu',
                            se_gradeLevelIds: null,
                            subject: [
                                'Science'
                            ],
                            channel: '01269878797503692810',
                            downloadUrl: null,
                            organisation: [
                                'Tamil Nadu'
                            ],
                            language: [
                                'English'
                            ],
                            mimeType: 'application/vnd.ekstep.content-collection',
                            variants: null,
                            leafNodes: [
                                'do_2132133346701148161290',
                                'do_2132133319201095681289',
                                'do_2132131323716648961286',
                                'do_3127411996709928961378',
                                'do_2132124092950446081234',
                                'do_3127411758403092481719'
                            ],
                            objectType: 'Collection',
                            se_mediums: [
                                'English'
                            ],
                            appIcon: 'https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_2132133391859138561291/artifact/indian-gate-in-new-delhi.thumb.jpg',
                            gradeLevel: [
                                'Class 5'
                            ],
                            primaryCategory: 'Course',
                            children: [
                                {
                                    identifier: 'do_2132133402347438081294',
                                    name: 'Unit 1',
                                    description: null,
                                    index: 1,
                                    objectType: 'Collection'
                                },
                                {
                                    identifier: 'do_2132133402347356161292',
                                    name: 'Unit 2',
                                    description: null,
                                    index: 2,
                                    objectType: 'Collection'
                                }
                            ],
                            appId: 'staging.sunbird.portal',
                            contentEncoding: 'gzip',
                            lockKey: '98d8afb3-d71d-4d5b-854d-1cd8c9e4daaa',
                            totalCompressedSize: 47331448,
                            mimeTypesCount: '{"application/epub":1,"application/vnd.ekstep.content-collection":2,"application/vnd.ekstep.ecml-archive":2,"video/x-youtube":2,"video/mp4":1}',
                            contentCredits: '[{"id":"0126640793823641603","name":"Telangana State","type":"user"}]',
                            contentType: 'Course',
                            se_gradeLevels: [
                                'Class 5'
                            ],
                            trackable: {
                                enabled: 'Yes',
                                autoBatch: 'Yes'
                            },
                            lastUpdatedBy: 'fca2925f-1eee-4654-9177-fece3fd6afc9',
                            identifier: 'do_2132133391859138561291',
                            audience: [
                                'Student'
                            ],
                            se_boardIds: null,
                            visibility: 'Default',
                            toc_url: 'https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_2132133391859138561291/artifact/do_2132133391859138561291_toc.json',
                            contentTypesCount: '{"CourseUnit":2,"Resource":4,"SelfAssess":2}',
                            childNodes: [
                                'do_2132133346701148161290',
                                'do_2132133319201095681289',
                                'do_2132133402347356161292',
                                'do_2132131323716648961286',
                                'do_2132133402347438081294',
                                'do_3127411996709928961378',
                                'do_2132124092950446081234',
                                'do_3127411758403092481719'
                            ],
                            consumerId: 'b350f619-5eb4-45d5-87ce-fb143ae9f684',
                            mediaType: 'content',
                            osId: 'org.ekstep.quiz.app',
                            lastPublishedBy: '08631a74-4b94-4cf7-a818-831135248a4a',
                            version: 2,
                            se_subjects: [
                                'Science'
                            ],
                            prevState: 'Review',
                            license: 'CC BY 4.0',
                            lastPublishedOn: '2021-02-10T11:39:26.622+0000',
                            name: '22621 Course with assess and max attempt',
                            topic: [
                                'Matter And Materials'
                            ],
                            status: 'Live',
                            code: 'org.sunbird.eyeDVy',
                            credentials: '{"enabled":"Yes"}',
                            publishError: null,
                            prevStatus: 'Review',
                            description: 'Enter description for Course',
                            medium: [
                                'English'
                            ],
                            idealScreenSize: 'normal',
                            createdOn: '2021-02-10T11:27:23.593+0000',
                            se_boards: [
                                'State (Tamil Nadu)'
                            ],
                            se_mediumIds: null,
                            copyrightYear: 2020,
                            contentDisposition: 'inline',
                            licenseterms: 'I agree that by submitting / publishing this Content, I confirm that this Content complies with the Terms of Use and Content Policy and that I consent to publish it under the Creative Commons Framework. I have made sure that I do not violate copyright or privacy rights of others',
                            lastUpdatedOn: '2021-02-10T11:39:26.187+0000',
                            dialcodeRequired: 'No',
                            se_topicIds: null,
                            createdFor: [
                                '01269878797503692810'
                            ],
                            lastStatusChangedOn: '2021-02-10T11:39:26.144+0000',
                            creator: 'cc tn',
                            os: [
                                'All'
                            ],
                            flagReasons: null,
                            se_FWIds: [
                                'tn_k-12_5'
                            ],
                            se_subjectIds: null,
                            pkgVersion: 1,
                            versionKey: '1612957166187',
                            idealScreenDensity: 'hdpi',
                            depth: 0,
                            framework: 'tn_k-12_5',
                            lastSubmittedOn: '2021-02-10T11:37:27.841+0000',
                            createdBy: 'fca2925f-1eee-4654-9177-fece3fd6afc9',
                            compatibilityLevel: 4,
                            se_topics: [
                                'Matter And Materials'
                            ],
                            leafNodesCount: 6,
                            userConsent: 'Yes',
                            board: 'State (Tamil Nadu)',
                            resourceType: 'Course',
                            contentMetadata: {
                                virality: {
                                    origin: '772123c6b9e7cfe9a09ce97e2ff326ba2ef36e2c',
                                    transferCount: 0
                                }
                            },
                            size: 168399,
                            licenseDetails: {
                                name: 'CC BY 4.0',
                                url: 'https://creativecommons.org/licenses/by/4.0/legalcode',
                                description: 'For details see below:'
                            },
                            cardImg: 'https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_2132133391859138561291/artifact/indian-gate-in-new-delhi.thumb.jpg'
                        }
                    ]
                }
            ]
        },
        dataSrc: {
            type: 'CONTENTS',
            request: {
                type: 'POST',
                path: '/api/content/v1/search',
                withBearerToken: true,
                body: {
                    request: {
                        offset: 0,
                        limit: 100,
                        exists: [],
                        facets: [
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
                            medium: [],
                            board: [],
                            language: [],
                            topic: [],
                            purpose: [],
                            channel: [],
                            mimeType: [],
                            subject: [],
                            primaryCategories: [
                                'Course'
                            ]
                        }
                    }
                }
            },
            mapping: []
        },
        theme: {
            component: 'sb-course-cards-hlist',
            inputs: {
                type: 'course_card_grid',
                hideProgress: true,
                viewMoreButtonText: '{"en":"View all"}'
            }
        }
    }
];
