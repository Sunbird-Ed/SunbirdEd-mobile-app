export const mockFilterCriteria = {
    query: 'hindi',
    limit: 100,
    offset: 0,
    facets: [
      'gradeLevel',
      'subject',
      'medium'
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
      }
    ],
  };
  