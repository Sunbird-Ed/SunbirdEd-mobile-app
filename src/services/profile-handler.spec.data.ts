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
