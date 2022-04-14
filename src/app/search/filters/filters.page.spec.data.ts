export const mockFilterCriteria = {
  query: 'hindi',
  limit: 100,
  offset: 0,
  facets: [
    'board',
    'gradeLevel',
    'subject',
    'medium',
    'primaryCategory',
    'publisher',
    'mimeType',
    'audience'
  ],
  primaryCategorie: [
    'Course',
    'Learning Resource',
    'Explanation Content',
    'Teacher Resource',
    'Content Playlist',
    'Digital Textbook',
    'Practice Question Set',
    'eTextBook',
    'Course Assessment'
  ],
  sortCriteria: [],
  mode: 'hard',
  facetFilters: [
    {
      name: 'gradeLevel',
      values: [
        {
          name: 'other',
          count: 147,
          apply: false,
          index: 0
        },
        {
          name: 'class 10',
          count: 2860,
          apply: false,
          index: 2
        }
      ],
      translatedName: 'Class'
    },
    {
      name: 'audience',
      values: [
        {
          name: 'instructor',
          count: 40,
          apply: false
        },
        {
          name: 'student',
          count: 13457,
          apply: true
        },
        {
          name: 'learner',
          count: 1833,
          apply: true
        }
      ]
    },
    {
      name: 'primaryCategory',
      values: [
        {
          name: 'template',
          count: 3,
          apply: false
        },
        {
          name: 'course assessment',
          count: 1,
          apply: false
        }
      ]
    },
    {
      name: 'subject',
      values: [
        {
          name: 'physical education',
          count: 1,
          apply: false
        }
      ]
    },
    {
      name: 'se_mediums',
      values: [
        {
          name: 'gujarati',
          count: 12,
          apply: false
        }
      ],
      translatedName: 'Medium'
    },
    {
      name: 'mimeType',
      values: [
        {
          name: 'INTERACTION',
          count: 3567,
          values: [
            {
              name: 'application/vnd.ekstep.h5p-archive',
              count: 85,
              apply: false
            },
            {
              name: 'application/vnd.ekstep.html-archive',
              count: 54,
              apply: false
            },
            {
              name: 'application/vnd.ekstep.ecml-archive',
              count: 3428,
              apply: false
            }
          ],
          apply: false
        },
        {
          name: 'VIDEO',
          count: 3815,
          values: [
            {
              name: 'video/webm',
              count: 94,
              apply: false
            },
            {
              name: 'video/x-youtube',
              count: 803,
              apply: false
            },
            {
              name: 'video/mp4',
              count: 2918,
              apply: false
            }
          ],
          apply: false
        },
        {
          name: 'DOC',
          count: 1690,
          values: [
            {
              name: 'application/pdf',
              count: 1610,
              apply: false
            },
            {
              name: 'application/epub',
              count: 80,
              apply: false
            }
          ],
          apply: false
        },
        {
          name: 'AUDIO',
          count: 4221,
          values: [
            {
              name: 'audio/ogg',
              count: 4,
              apply: false
            },
            {
              name: 'audio/mp3',
              count: 3236,
              apply: false
            },
            {
              name: 'audio/wav',
              count: 981,
              apply: false
            }
          ],
          apply: false
        }
      ]
    },
    {
      name: 'board',
      values: [
        {
          name: 'other',
          count: 38,
          apply: false
        },
        {
          name: 'state (kerala)',
          count: 37,
          apply: false
        }
      ],
      translatedName: 'Board/Syllabus'
    }
  ],
  impliedFiltersMap: [
    {
      compatibilityLevel: {
        min: 1,
        max: 4
      }
    },
    {
      contentType: []
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
    }
  ]
};
