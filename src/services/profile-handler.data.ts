export const mockSupportedUserTypeConfig = [
   {
       code: 'student',
       name: 'Student',
       searchFilter: [
           'Student',
           'Learner'
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
       attributes: {
           mandatory: [
               'board'
           ],
           optional: []
       }
   }
];
