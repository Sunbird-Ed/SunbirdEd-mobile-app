import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import {
    Events, Platform, PopoverController
} from '@ionic/angular';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { urlConstants } from '../../core/constants/urlConstants';
import { UtilsService } from '../../core';

@Component({
    selector: 'app-program-listing',
    templateUrl: './program-listing.component.html',
    styleUrls: ['./program-listing.component.scss'],
})
export class ProgramListingComponent implements OnInit {
    private backButtonFunc: Subscription;
    headerConfig = {
        showHeader: true,
        showBurgerMenu: false,
        actionButtons: []
    };
    programs;
    result = [
        {
            "_id": "5fc5202fbba21c7039176ad1",
            "name": "Test program",
            "externalId": "Test program-1606754351579",
            "description": "Test program",
            "solutions": [
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc65d3b4599086818390ce0",
                    "name": "Apple Assessment Framework 2018-001-1606835514888",
                    "externalId": "Apple-Assessment-Framework-2018-001-TEMPLATE-1606835515050",
                    "description": "Apple Assessment Framework 2018-001-1606835514888",
                    "type": "assessment",
                    "subType": "institutional",
                    "allowMultipleAssessemts": false,
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "submissionNumber": 1,
                                    "title": "Assessment 1",
                                    "_id": "5fc65ea84599086818390ce2",
                                    "status": "completed",
                                    "createdAt": "2020-12-01T15:18:00.830Z",
                                    "updatedAt": "2020-12-01T15:18:25.351Z",
                                    "submissionDate": "2020-12-01T15:18:25.355Z"
                                }
                            ]
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc6303aaab52e5a09d89b2a",
                    "name": "Apple Assessment Framework 2018-001-1606823994354",
                    "externalId": "Apple-Assessment-Framework-2018-001-TEMPLATE-1606823994401",
                    "description": "Apple Assessment Framework 2018-001-1606823994354",
                    "type": "assessment",
                    "subType": "institutional",
                    "allowMultipleAssessemts": false,
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc62ecaaab52e5a09d89b21",
                    "name": "Classroom Observations Form-1606823626628",
                    "description": "Classroom Observations Form-1606823626628",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606823626846",
                    "solutionId": "5fc62ecaaab52e5a09d89b20",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "_id": "5fc62eddaab52e5a09d89b22",
                                    "status": "completed",
                                    "submissionNumber": 1,
                                    "entityId": "5beaa888af0065f0e0a10515",
                                    "createdAt": "2020-12-01T11:54:05.929Z",
                                    "updatedAt": "2020-12-01T11:55:12.039Z",
                                    "observationName": "Classroom Observations Form-1606823626628",
                                    "observationId": "5fc62ecaaab52e5a09d89b21",
                                    "title": "Observation 1",
                                    "submissionDate": "2020-12-01T11:55:12.039Z",
                                    "ratingCompletedAt": ""
                                }
                            ]
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc62a37aab52e5a09d89aff",
                    "name": "Classroom Observations Form-1606822455013",
                    "description": "Classroom Observations Form-1606822455013",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606822455323",
                    "solutionId": "5fc62a37aab52e5a09d89afe",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "_id": "5fc62a4caab52e5a09d89b00",
                                    "status": "completed",
                                    "submissionNumber": 1,
                                    "entityId": "5beaa888af0065f0e0a10515",
                                    "createdAt": "2020-12-01T11:34:36.755Z",
                                    "updatedAt": "2020-12-01T11:35:44.883Z",
                                    "observationName": "Classroom Observations Form-1606822455013",
                                    "observationId": "5fc62a37aab52e5a09d89aff",
                                    "title": "Observation 1",
                                    "submissionDate": "2020-12-01T11:35:44.883Z",
                                    "ratingCompletedAt": ""
                                }
                            ]
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc6171d4dca1a562bbf7eaa",
                    "name": "Apple Assessment Framework 2018-001-1606817565241",
                    "externalId": "Apple-Assessment-Framework-2018-001-TEMPLATE-1606817565357",
                    "description": "Apple Assessment Framework 2018-001-1606817565241",
                    "type": "assessment",
                    "subType": "institutional",
                    "allowMultipleAssessemts": false,
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc6151640cba155984c5f66",
                    "name": "Apple Assessment Framework 2018-001-1606817046193",
                    "externalId": "Apple-Assessment-Framework-2018-001-TEMPLATE-1606817046308",
                    "description": "Apple Assessment Framework 2018-001-1606817046193",
                    "type": "assessment",
                    "subType": "institutional",
                    "allowMultipleAssessemts": false,
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc6125a9f84e950f8068879",
                    "name": "Apple Assessment Framework 2018-001-1606816346509",
                    "externalId": "Apple-Assessment-Framework-2018-001-TEMPLATE-1606816346560",
                    "description": "Apple Assessment Framework 2018-001-1606816346509",
                    "type": "assessment",
                    "subType": "institutional",
                    "allowMultipleAssessemts": false,
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc60dc39f84e950f806886e",
                    "name": "DCPCR Assessment Framework 2018-1606815170084",
                    "externalId": "EF-DCPCR-2018-001-TEMPLATE-1606815171670",
                    "description": "DCPCR Assessment Framework 2018-1606815170084",
                    "type": "assessment",
                    "subType": "institutional",
                    "allowMultipleAssessemts": false,
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "submissionNumber": 1,
                                    "title": "Assessment 1",
                                    "_id": "5fc60dde9f84e950f8068870",
                                    "status": "inprogress",
                                    "createdAt": "2020-12-01T09:33:18.495Z",
                                    "updatedAt": "2020-12-01T09:49:02.881Z",
                                    "submissionDate": ""
                                }
                            ]
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5b98fa069f664f7e1ae7498c",
                    "name": "DCPCR Assessment Framework 2018",
                    "externalId": "EF-DCPCR-2018-001",
                    "description": "DCPCR Assessment Framework 2018",
                    "type": "assessment",
                    "subType": "institutional",
                    "allowMultipleAssessemts": false,
                    "showInHomeScreen": true,
                    "isAPrivateProgram": false,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc60b029f84e950f80686c5",
                    "name": "Classroom Observations Form-1606814466593",
                    "description": "Classroom Observations Form-1606814466593",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606814466816",
                    "solutionId": "5fc60b029f84e950f80686c4",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc5da5e9e940522458340aa",
                    "name": "DCPCR Assessment Framework 2018-1606802013296",
                    "externalId": "EF-DCPCR-2018-001-TEMPLATE-1606802014919",
                    "description": "DCPCR Assessment Framework 2018-1606802013296",
                    "type": "assessment",
                    "subType": "institutional",
                    "allowMultipleAssessemts": false,
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc54c029e94052245833f02",
                    "name": "Classroom Observations Form-1606765570512",
                    "description": "Classroom Observations Form-1606765570512",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606765570828",
                    "solutionId": "5fc54c029e94052245833f01",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "_id": "5fc54cb19e94052245833f03",
                                    "status": "completed",
                                    "submissionNumber": 1,
                                    "entityId": "5beaa888af0065f0e0a10515",
                                    "createdAt": "2020-11-30T19:49:05.921Z",
                                    "updatedAt": "2020-11-30T19:51:01.589Z",
                                    "observationName": "Classroom Observations Form-1606765570512",
                                    "observationId": "5fc54c029e94052245833f02",
                                    "title": "Observation 1",
                                    "submissionDate": "2020-11-30T19:51:01.589Z",
                                    "ratingCompletedAt": ""
                                }
                            ]
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc54742d540581f818911df",
                    "name": "Classroom Observations Form-1606764354107",
                    "description": "Classroom Observations Form-1606764354107",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606764354447",
                    "solutionId": "5fc54742d540581f818911de",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "_id": "5fc54761d540581f818911e0",
                                    "status": "completed",
                                    "submissionNumber": 1,
                                    "entityId": "5beaa888af0065f0e0a10515",
                                    "createdAt": "2020-11-30T19:26:25.950Z",
                                    "updatedAt": "2020-11-30T19:27:57.520Z",
                                    "observationName": "Classroom Observations Form-1606764354107",
                                    "observationId": "5fc54742d540581f818911df",
                                    "title": "Observation 1",
                                    "submissionDate": "2020-11-30T19:27:57.520Z",
                                    "ratingCompletedAt": ""
                                }
                            ]
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc53cbd1665670f28ee9227",
                    "name": "Classroom Observations Form-1606761661450",
                    "description": "Classroom Observations Form-1606761661450",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606761661749",
                    "solutionId": "5fc53cbd1665670f28ee9226",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc532e8953f8a0d60d63401",
                    "name": "Classroom Observations Form-1606759144575",
                    "description": "Classroom Observations Form-1606759144575",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606759144825",
                    "solutionId": "5fc532e8953f8a0d60d63400",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "_id": "5fc532f9953f8a0d60d63402",
                                    "status": "completed",
                                    "submissionNumber": 1,
                                    "entityId": "5beaa888af0065f0e0a10515",
                                    "createdAt": "2020-11-30T17:59:21.336Z",
                                    "updatedAt": "2020-11-30T18:00:27.932Z",
                                    "observationName": "Classroom Observations Form-1606759144575",
                                    "observationId": "5fc532e8953f8a0d60d63401",
                                    "title": "Observation 1",
                                    "submissionDate": "2020-11-30T18:00:27.932Z",
                                    "ratingCompletedAt": ""
                                }
                            ]
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc5316e47f98c0626526141",
                    "name": "Classroom Observations Form-1606758765958",
                    "description": "Classroom Observations Form-1606758765958",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606758766163",
                    "solutionId": "5fc5316e47f98c0626526140",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "_id": "5fc5317e47f98c0626526142",
                                    "status": "completed",
                                    "submissionNumber": 1,
                                    "entityId": "5beaa888af0065f0e0a10515",
                                    "createdAt": "2020-11-30T17:53:02.962Z",
                                    "updatedAt": "2020-11-30T17:54:17.376Z",
                                    "observationName": "Classroom Observations Form-1606758765958",
                                    "observationId": "5fc5316e47f98c0626526141",
                                    "title": "Observation 1",
                                    "submissionDate": "2020-11-30T17:54:17.376Z",
                                    "ratingCompletedAt": ""
                                }
                            ]
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc52c6d47f98c062652611f",
                    "name": "Classroom Observations Form-1606757485366",
                    "description": "Classroom Observations Form-1606757485366",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606757485556",
                    "solutionId": "5fc52c6d47f98c062652611e",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "_id": "5fc52c8047f98c0626526120",
                                    "status": "completed",
                                    "submissionNumber": 1,
                                    "entityId": "5beaa888af0065f0e0a10515",
                                    "createdAt": "2020-11-30T17:31:44.195Z",
                                    "updatedAt": "2020-11-30T17:32:54.473Z",
                                    "observationName": "Classroom Observations Form-1606757485366",
                                    "observationId": "5fc52c6d47f98c062652611f",
                                    "title": "Observation 1",
                                    "submissionDate": "2020-11-30T17:32:54.473Z",
                                    "ratingCompletedAt": ""
                                }
                            ]
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc522b047f98c06265260fd",
                    "name": "Classroom Observations Form-1606754991783",
                    "description": "Classroom Observations Form-1606754991783",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606754991993",
                    "solutionId": "5fc522af47f98c06265260fc",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "_id": "5fc522c047f98c06265260fe",
                                    "status": "completed",
                                    "submissionNumber": 1,
                                    "entityId": "5beaa888af0065f0e0a10515",
                                    "createdAt": "2020-11-30T16:50:08.413Z",
                                    "updatedAt": "2020-11-30T16:51:46.367Z",
                                    "observationName": "Classroom Observations Form-1606754991783",
                                    "observationId": "5fc522b047f98c06265260fd",
                                    "title": "Observation 1",
                                    "submissionDate": "2020-11-30T16:51:46.367Z",
                                    "ratingCompletedAt": ""
                                }
                            ]
                        }
                    ]
                },
                {
                    "programName": "Test program",
                    "programId": "5fc5202fbba21c7039176ad1",
                    "_id": "5fc520c847f98c06265260db",
                    "name": "DCPCR Assessment Framework 2018-1606754503105",
                    "externalId": "EF-DCPCR-2018-001-TEMPLATE-1606754504969",
                    "description": "DCPCR Assessment Framework 2018-1606754503105",
                    "type": "assessment",
                    "subType": "institutional",
                    "allowMultipleAssessemts": false,
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                }
            ]
        },
        {
            "_id": "5f1c5be0499e7a357a6c2748",
            "name": "STEP-Mantra",
            "externalId": "STEP-Mantra",
            "description": "STEP-Mantra",
            "solutions": [
                {
                    "programName": "STEP-Mantra",
                    "programId": "5f1c5be0499e7a357a6c2748",
                    "_id": "5fc637aaaab52e5a09d89b71",
                    "name": "Classroom Observations Form",
                    "description": "Classroom Observations Form",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-TEMPLATE",
                    "solutionId": "5d282bbcc1e91c71b6c025e6",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": false,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5bfe53ea1d0c350d61b78d0b",
                            "name": "SMS Public School, A/61 Kh. 13/1, 13/2 near Peeli Kothi Nathupura Delhi",
                            "externalId": "1207235",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                },
                {
                    "programName": "STEP-Mantra",
                    "programId": "5f1c5be0499e7a357a6c2748",
                    "_id": "5fc627964dca1a562bbf7ead",
                    "name": "Classroom Observations Form",
                    "description": "Classroom Observations Form",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-TEMPLATE",
                    "solutionId": "5d282bbcc1e91c71b6c025e6",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": false,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                },
                {
                    "programName": "STEP-Mantra",
                    "programId": "5f1c5be0499e7a357a6c2748",
                    "_id": "5fc611e29f84e950f8068871",
                    "name": "Classroom Observations Form",
                    "description": "Classroom Observations Form",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-TEMPLATE",
                    "solutionId": "5d282bbcc1e91c71b6c025e6",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": false,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                },
                {
                    "programName": "STEP-Mantra",
                    "programId": "5f1c5be0499e7a357a6c2748",
                    "_id": "5fc6068c9f84e950f80686a4",
                    "name": "Classroom Observations Form",
                    "description": "Classroom Observations Form",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-TEMPLATE",
                    "solutionId": "5d282bbcc1e91c71b6c025e6",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": false,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                }
            ]
        },
        {
            "_id": "5fc4d22cbba21c7039176ab9",
            "name": "fresh project",
            "externalId": "fresh project-1606734380229",
            "description": "fresh project",
            "solutions": [
                {
                    "programName": "fresh project",
                    "programId": "5fc4d22cbba21c7039176ab9",
                    "_id": "5fc635bdaab52e5a09d89b6f",
                    "name": "Classroom Observations Form-1606825405050",
                    "description": "Classroom Observations Form-1606825405050",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606825405223",
                    "solutionId": "5fc635bdaab52e5a09d89b6e",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5bfe53ea1d0c350d61b78d0b",
                            "name": "SMS Public School, A/61 Kh. 13/1, 13/2 near Peeli Kothi Nathupura Delhi",
                            "externalId": "1207235",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "_id": "5fc635ddaab52e5a09d89b70",
                                    "status": "completed",
                                    "submissionNumber": 1,
                                    "entityId": "5bfe53ea1d0c350d61b78d0b",
                                    "createdAt": "2020-12-01T12:23:57.989Z",
                                    "updatedAt": "2020-12-01T12:25:02.448Z",
                                    "observationName": "Classroom Observations Form-1606825405050",
                                    "observationId": "5fc635bdaab52e5a09d89b6f",
                                    "title": "Observation 1",
                                    "submissionDate": "2020-12-01T12:25:02.448Z",
                                    "ratingCompletedAt": ""
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "_id": "5fc4ad7a4f96e8623deacda9",
            "name": "Project -30-nov",
            "externalId": "Project -30-nov-1606724986452",
            "description": "Project -30-nov",
            "solutions": [
                {
                    "programName": "Project -30-nov",
                    "programId": "5fc4ad7a4f96e8623deacda9",
                    "_id": "5b98fa069f664f7e1ae7498c",
                    "name": "DCPCR Assessment Framework 2018",
                    "externalId": "EF-DCPCR-2018-001",
                    "description": "DCPCR Assessment Framework 2018",
                    "type": "assessment",
                    "subType": "institutional",
                    "allowMultipleAssessemts": false,
                    "showInHomeScreen": true,
                    "isAPrivateProgram": false,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5beaa888af0065f0e0a10515",
                            "name": "Apple School",
                            "externalId": "9999999999",
                            "entityType": "school",
                            "totalSubmissionCount": 0,
                            "submissions": []
                        }
                    ]
                }
            ]
        },
        {
            "_id": "5fc4d528bba21c7039176abc",
            "name": "Kiran 4pm program",
            "externalId": "Kiran 4pm program-1606735144488",
            "description": "Kiran 4pm program",
            "solutions": [
                {
                    "programName": "Kiran 4pm program",
                    "programId": "5fc4d528bba21c7039176abc",
                    "_id": "5fc6343caab52e5a09d89b4c",
                    "name": "Classroom Observations Form-1606825020033",
                    "description": "Classroom Observations Form-1606825020033",
                    "type": "observation",
                    "subType": "school",
                    "solutionExternalId": "CRO-2019-1606825020249",
                    "solutionId": "5fc6343caab52e5a09d89b4b",
                    "showInHomeScreen": true,
                    "isAPrivateProgram": true,
                    "entityType": "school",
                    "entityTypeId": "5d28233dd772d270e55b4072",
                    "entities": [
                        {
                            "_id": "5bfe53ea1d0c350d61b78d0a",
                            "name": "Sachdeva Convent School, Street No.-5 Sangam Vihar (Wazirabad - Jagatpur Road), Delhi",
                            "externalId": "1207229",
                            "entityType": "school",
                            "totalSubmissionCount": 1,
                            "submissions": [
                                {
                                    "_id": "5fc63454aab52e5a09d89b4d",
                                    "status": "completed",
                                    "submissionNumber": 1,
                                    "entityId": "5bfe53ea1d0c350d61b78d0a",
                                    "createdAt": "2020-12-01T12:17:24.106Z",
                                    "updatedAt": "2020-12-01T12:18:29.591Z",
                                    "observationName": "Classroom Observations Form-1606825020033",
                                    "observationId": "5fc6343caab52e5a09d89b4c",
                                    "title": "Observation 1",
                                    "submissionDate": "2020-12-01T12:18:29.591Z",
                                    "ratingCompletedAt": ""
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]

    constructor(private router: Router, private location: Location, 
        private headerService: AppHeaderService, private platform: Platform,private utils: UtilsService, private kendraService: KendraApiService) { }

    ngOnInit() {
        this.getPrograms();
    }

    async getPrograms() {
        let payload = await this.utils.getProfileInfo();
        const config = {
            url: urlConstants.API_URLS.PROGRAM_LISTING + `page=1&limit=10&search=`,
            payload: payload
        }
        this.kendraService.post(config).subscribe(success => {
            if(success.result.data){
                this.programs = success.result;
            }
        }, error => {

        })
    }

    ionViewWillEnter() {
        this.headerConfig = this.headerService.getDefaultPageConfig();
        this.headerConfig.actionButtons = [];
        this.headerConfig.showHeader = true;
        this.headerConfig.showBurgerMenu = false;
        this.headerService.updatePageConfig(this.headerConfig);
        this.handleBackButton();
    }

    ionViewWillLeave() {
        if (this.backButtonFunc) {
            this.backButtonFunc.unsubscribe();
        }
    }

    private handleBackButton() {
        this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
            this.location.back();
            this.backButtonFunc.unsubscribe();
        });
    }

    selectedProgram(id) {
        this.router.navigate([`/${RouterLinks.PROGRAM}/${RouterLinks.SOLUTIONS}`, id]);
    }

    handleNavBackButton() {
        this.location.back();
    }

    loadMore() {

    }

}
