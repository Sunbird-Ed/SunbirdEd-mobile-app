export const urlConstants = {
  SERVICES: {
    UNNATI: '/improvement-project/api/',
    KENDRA: '/kendra/api/',
    SAMIKSHA: '/assessment/api/',
    DHITI: '/dhiti/api/',
    SUNBIRD: '/sunbird/api/',
  },
  API_URLS: {
    PROGRAM_LISTING: '/api/users/mlcore/v1/programs?',
    GET_TARGETED_SOLUTIONS: '/api/solutions/mlcore/v1/targetedSolutions',
    SOLUTIONS_LISTING: '/api/users/mlcore/v1/solutions/',
    GET_PROJECT: '/api/userProjects/mlprojects/v1/details',
    PRIVATE_PROGRAMS: '/v1/users/privatePrograms',
    GET_SUB_ENITIES_FOR_ROLES: '/api/entities/mlcore/v1/subEntityListBasedOnRoleAndLocation/',
    GET_ENTITY_LIST: '/api/entities/mlcore/v1/subEntityList/',
    GET_REPORT: '/api/reports/mlprojects/v1/entity/',
    GET_FULL_REPORT: '/api/reports/mlprojects/v1/detailView/',
    GET_PROGRAM_BY_ENTITY: '/api/reports/mlprojects/v1/getProgramsByEntity',
    SYNC_PROJECT: '/api/userProjects/mlprojects/v1/sync/',
    CREATE_PROJECT: '/api/userProjects/mlprojects/v1/add',
    START_ASSESSMENT: '/api/userProjects/mlprojects/v1/solutionDetails/',
    PROJCET_TASK_STATUS: '/api/userProjects/mlprojects/v1/tasksStatus/',
    GET_SHARABLE_PDF: '/api/userProjects/mlprojects/v1/share/',
    GET_OBSERVATION_ENTITIES: '/api/observations/mlsurvey/v1/entities',
    GET_OBSERVATION_SUBMISSIONS: '/api/observationSubmissions/mlsurvey/v1/list/',
    GET_OBSERVATION_DETAILS: '/api/observations/mlsurvey/v1/assessment/',
    MANDATORY_ENTITY_TYPES_FOR_ROLES: '/api/entities/mlcore/v1/entityTypesByLocationAndRole/',
    GET_OBSERVATION_SUBMISSION_COUNT: '/api/observations/mlreports/v1/submissionsCount',
    OBSERVATION_SUBMISSION_UPDATE: '/api/observationSubmissions/mlsurvey/v1/update/',
    OBSERVATION_SUBMISSION_CREATE: '/api/observationSubmissions/mlsurvey/v1/create/',
    SEARCH_ENTITY: '/api/observations/mlsurvey/v1/searchEntities',
    OBSERVATION_UPDATE_ENTITES: '/api/observations/mlsurvey/v1/updateEntities/',
    SUBMISSION: 'v1/submissions/make/', //TODO its assessment submissionAPI
    TARGETTED_ENTITY_TYPES: '/api/users/mlcore/v1/targetedEntity/',
    OBSERVATION_REPORT_SOLUTION_LIST: '/api/observationSubmissions/mlsurvey/v1/solutionList?',
    GENERIC_REPORTS: '/api/reports/mlreports/v1/fetch',
    PROJECT_TEMPLATE_DETAILS: '/api/project/mlprojects/v1/templates/details/',
    ALL_EVIDENCE: '/api/observations/mlsurvey/v1/listAllEvidences',
    TEMPLATE_DETAILS:'/api/solutions/mlcore/v1/details/',//+SOL ID
    SURVEY_FEEDBACK: {
      GET_DETAILS_BY_ID: '/api/surveys/mlsurvey/v1/details',
      MAKE_SUBMISSION: '/api/surveySubmissions/mlsurvey/v1/update/',
      LIST_ALL_EVIDENCES: '/api/surveys/mlreports/v1/listAllEvidences',
      GET_ALL_ANSWERS: '/api/surveys/mlreports/v1/getAllResponsesOfQuestion/',
    },
    DEEPLINK: {
      // VERIFY_OBSERVATION_LINK: '/api/solutions/mlsurvey/v1/verifyLink/',
      VERIFY_LINK: '/api/solutions/mlcore/v1/verifyLink/', //LINK
    },
    PRESIGNED_URLS: '/api/cloud-services/mlcore/v1/files/preSignedUrls',
    IMPORT_LIBRARY_PROJECT:'/api/userProjects/mlprojects/v1/importFromLibrary/' //tempID?isATargetedSolution=false

  },
};