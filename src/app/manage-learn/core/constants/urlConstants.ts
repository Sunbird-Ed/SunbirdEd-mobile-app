export const urlConstants = {
  SERVICES: {
    UNNATI: '/improvement-project/api/',
    KENDRA: '/kendra/api/',
    SAMIKSHA: '/assessment/api/',
    DHITI: '/dhiti/api/',
    SUNBIRD: '/sunbird/api/',
  },
  API_URLS: {
    // PROGRAM_LISTING: 'v1/users/programs?',
    PROGRAM_LISTING: '/api/users/mlcore/v1/programs?',

    // GET_TARGETED_SOLUTIONS: 'v1/solutions/targetedSolutions',
    GET_TARGETED_SOLUTIONS: '/api/solutions/mlcore/v1/targetedSolutions',

    // SOLUTIONS_LISTING: 'v1/users/solutions/',
    SOLUTIONS_LISTING: '/api/users/mlcore/v1/solutions/',

    // GET_PROJECT: 'v2/userProjects/details',
    GET_PROJECT: '/api/userProjects/mlprojects/v1/details',

    // PRIVATE_PROGRAMS: 'v1/users/privatePrograms',
    PRIVATE_PROGRAMS: 'v1/users/privatePrograms', //TODO:it should be merged,decision pending

    // GET_SUB_ENITIES_FOR_ROLES: 'v1/entities/subEntityListBasedOnRoleAndLocation/',
    GET_SUB_ENITIES_FOR_ROLES: '/api/entities/mlcore/v1/subEntityListBasedOnRoleAndLocation/',

    // GET_ENTITY_LIST: 'v1/entities/subEntityList/',
    GET_ENTITY_LIST: '/api/entities/mlcore/v1/subEntityList/',

    // GET_REPORT: 'v1/reports/entity/',
    GET_REPORT: '/api/reports/mlprojects/v1/entity/',

    // GET_FULL_REPORT: 'v2/reports/detailView/',
    GET_FULL_REPORT: '/api/reports/mlprojects/v1/detailView/',

    // GET_PROGRAM_BY_ENTITY: 'v1/reports/getProgramsByEntity',
    GET_PROGRAM_BY_ENTITY: '/api/reports/mlprojects/v1/getProgramsByEntity',

    // SYNC_PROJECT: 'v1/userProjects/sync/',
    SYNC_PROJECT: '/api/userProjects/mlprojects/v1/sync/',

    // CREATE_PROJECT: 'v1/userProjects/add',
    CREATE_PROJECT: '/api/userProjects/mlprojects/v1/add',

    // START_ASSESSMENT: 'v1/userProjects/solutionDetails/',
    START_ASSESSMENT: '/api/userProjects/mlprojects/v1/solutionDetails/',

    // PROJCET_TASK_STATUS: 'v1/userProjects/tasksStatus/',
    PROJCET_TASK_STATUS: '/api/userProjects/mlprojects/v1/tasksStatus/',

    // GET_SHARABLE_PDF: 'v1/userProjects/share/',
    GET_SHARABLE_PDF: '/api/userProjects/mlprojects/v1/share/',

    // GET_OBSERVATION_ENTITIES: 'v1/observations/entities',
    GET_OBSERVATION_ENTITIES: '/api/observations/mlsurvey/v1/entities',

    // GET_OBSERVATION_SUBMISSIONS: 'v1/observationSubmissions/list/',
    GET_OBSERVATION_SUBMISSIONS: '/api/observationSubmissions/mlsurvey/v1/list/',

    // GET_OBSERVATION_DETAILS: 'v2/observations/assessment/',
    GET_OBSERVATION_DETAILS: '/api/observations/mlsurvey/v1/assessment/',

    // MANDATORY_ENTITY_TYPES_FOR_ROLES: 'v1/users/entityTypesByLocationAndRole/',
    MANDATORY_ENTITY_TYPES_FOR_ROLES: '/api/entities/mlcore/v1/subEntityListBasedOnRoleAndLocation/',

    // GET_OBSERVATION_SUBMISSION_COUNT: 'v1/observations/submissionsCount',
    GET_OBSERVATION_SUBMISSION_COUNT: '/api/observations/mlreports/v1/submissionsCount',

    // OBSERVATION_SUBMISSION_UPDATE: 'v1/observationSubmissions/update/',
    OBSERVATION_SUBMISSION_UPDATE: '/api/observationSubmissions/mlsurvey/v1/update/',

    // OBSERVATION_SUBMISSION_CREATE: 'v1/observationSubmissions/create/',
    OBSERVATION_SUBMISSION_CREATE: '/api/observationSubmissions/mlsurvey/v1/create/',

    // SEARCH_ENTITY: 'v2/observations/searchEntities',
    SEARCH_ENTITY: '/api/observations/mlsurvey/v1/searchEntities',

    //OBSERVATION_UPDATE_ENTITES: 'v1/observations/updateEntities/',
    OBSERVATION_UPDATE_ENTITES: '/api/observations/mlsurvey/v1/updateEntities/',

    // IS_SURVEY_SUBMISSION_ALLOWED: 'v1/surveySubmissions/isAllowed/',
    IS_SURVEY_SUBMISSION_ALLOWED: 'v1/surveySubmissions/isAllowed/', //TODO:remove this api code

    IS_OBSERVATION_SUBMISSION_ALLOWED: 'v1/observationSubmissions/isAllowed/', //TODO: remove this api code

    CHECK_IF_SUBMITTED: 'v1/submissions/isAllowed/', //TODO: remove this api code

    // SURVEY_FEEDBACK_MAKE_SUBMISSION: 'v1/surveySubmissions/make/',
    SURVEY_FEEDBACK_MAKE_SUBMISSION: 'v1/surveySubmissions/make/', //TODO: not found in sheet

    SUBMISSION: 'v1/submissions/make/', //TODO its assessment submissionAPI

    // TARGETTED_ENTITY_TYPES: 'v1/users/targetedEntity/',
    TARGETTED_ENTITY_TYPES: '/api/users/mlcore/v1/targetedEntity/',

    // OBSERVATION_REPORT_SOLUTION_LIST: 'v1/observationSubmissions/solutionList?',
    OBSERVATION_REPORT_SOLUTION_LIST: '/api/observationSubmissions/mlsurvey/v1/solutionList?',

    // GENERIC_REPORTS: 'v1/reports/fetch',
    GENERIC_REPORTS: '/api/reports/mlreports/v1/fetch',

    // PROJECT_TEMPLATE_DETAILS: 'v1/project/templates/details/',
    PROJECT_TEMPLATE_DETAILS: '/api/project/mlprojects/v1/templates/details/',

    // ALL_EVIDENCE: 'v1/observations/listAllEvidences',
    ALL_EVIDENCE: '/api/observations/mlsurvey/v1/listAllEvidences',

    SURVEY_FEEDBACK: {
      GET_DETAILS_BY_LINK: 'v1/surveys/getDetailsByLink/' /* + link */, //TODO api needs to merge , decision pending

      // GET_DETAILS_BY_ID: 'v3/surveys/details' /* + surveyId?solutionId=5f5b38ec45365677f64b2843*/,
      GET_DETAILS_BY_ID: '/api/surveys/mlsurvey/v1/details',

      MAKE_SUBMISSION: 'v1/surveySubmissions/make/', //TODO: Not found in sheet

      // LIST_ALL_EVIDENCES: 'v1/surveys/listAllEvidences',
      LIST_ALL_EVIDENCES: '/api/surveys/mlreports/v1/listAllEvidences',

      // GET_ALL_ANSWERS: 'v1/surveys/getAllResponsesOfQuestion/',
      GET_ALL_ANSWERS: '/api/surveys/mlreports/v1/getAllResponsesOfQuestion/',
    },
    DEEPLINK: {
      // VERIFY_OBSERVATION_LINK: 'v1/solutions/verifyLink/' /* + link */,
      VERIFY_OBSERVATION_LINK: '/api/solutions/mlsurvey/v1/verifyLink/',
    },
    // PRESIGNED_URLS: 'v1/cloud-services/files/preSignedUrls',
    PRESIGNED_URLS: '/api/cloud-services/mlcore/v1/files/preSignedUrls',
  },
};

// TODO:
1
// isAllowed api all 3
2
// {{url}}/kendra/api/v1/users/programs
//             +
// {{url}}/kendra/api/v1/users/privatePrograms
//               =
// {{url}}/kendra/api/v1/users/programs?isAPrivateProgram=true
// Api for merging
3
// Survey Details - {{url}}/assessment/api/v2/surveys/details
//                    +
// Survye DetailsLink - {{url}}/assessment/api/v1/surveys/getDetailsByLink/:link
//                  =
// Survey v3 details - {{url}}/assessment/api/v3/surveys/details/:surveyId/link

4
// SURVEY_FEEDBACK_MAKE_SUBMISSION: 'v1/surveySubmissions/make/',
// SURVEY_FEEDBACK_MAKE_SUBMISSION: 'v1/surveySubmissions/update/',



    // PRIVATE_PROGRAMS: 'v1/users/privatePrograms',
    // SURVEY_FEEDBACK_MAKE_SUBMISSION: 'v1/surveySubmissions/make/',
    // GET_DETAILS_BY_LINK: 'v1/surveys/getDetailsByLink/'
    // MAKE_SUBMISSION: 'v1/surveySubmissions/make/'
