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
        },
        code: 'popular_categories'
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
    },
    {
        data: [
            {
                facet: 'primaryCategory',
                icon: 'https://'
            }
        ],
        dataSrc: {
            type: 'SEARCH_CONTENTS_BY_POULAR_CATEGORY'
        }
    }
];

export const mockOnboardingConfigData = {
    overriddenDefaultChannelId : "SAMPLE_CHANNEL_ID",
    theme: {
        name: "aqua"
    },
    "onboarding": [
        {
          "name": "language-setting",
          "skip": false,
          "default": {
            "code": "en",
            "label": "English"
          },
          "data": [
            {
              "label": "हिंदी",
              "code": "hi",
              "isApplied": false,
              "name": "Hindi"
            },
            {
              "label": "English",
              "code": "en",
              "isApplied": false,
              "name": "English"
            }
          ]
        }
    ]
};