import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { NavController} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';

@Component({
  selector: 'app-deeplink-redirect',
  templateUrl: './deeplink-redirect.component.html',
  styleUrls: ['./deeplink-redirect.component.scss'],
})
export class DeeplinkRedirectComponent implements OnInit {
  data: any;
  translateObject: any;
  link: any;
  extra: string;

  constructor(
    public navCtrl: NavController,
    // public navParams: NavParams,
    // public deeplinkProvider: DeeplinkProvider,
    // public programSrvc: ProgramServiceProvider,
    // public viewCtrl: ViewController,
    // public utils: UtilsProvider,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private assessmentService: AssessmentApiService,
    private utils: UtilsService
  ) {
    this.extra = this.route.snapshot.paramMap.get('extra');
    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.data = extrasState.data;
    }
  }

  ionViewDidLoad() {
  }
  ngOnInit() {
    this.translate.get(['message.canNotOpenLink']).subscribe((translations) => {
      this.translateObject = translations;
    });
    this.switch(this.extra);
  }

  switch(key) {
    switch (key) {
      case 'observationLink':
        this.redirectObservation(this.data.create_observation_id);
        break;
      case 'observationParams':
        this.redirectWithParams(this.data[key], 'observation');
        break;
      case 'assessmentParams':
        this.redirectWithParams(this.data[key], 'assessment');
        break;
      case 'observationReportParams':
        this.redirectReportWithParams(this.data[key], 'observation');
        break;
      case 'assessmentReportParams':
        this.redirectReportWithParams(this.data[key], 'assessment');
        break;

      default:
        break;
    }
  }

  redirectWithParams(params: string, type) {
    let paramsArr = params.split('-');
    console.log(paramsArr);
    let pId = paramsArr[0];
    let sId = paramsArr[1];
    let eId = paramsArr[2];
  }

  async redirectObservation(link) {
    let payload = await this.utils.getProfileInfo();

    let resp ={
      "assessment": {
        "description": "SQAA- for testing",
        "evidences": [
            {
                "canBeNotAllowed": true,
                "canBeNotApplicable": true,
                "code": "D7_1624956346543",
                "description": null,
                "endTime": "",
                "externalId": "D7_1624956346543",
                "isSubmitted": false,
                "modeOfCollection": "onfield",
                "name": "Leadership",
                "notApplicable": false,
                "remarks": null,
                "sections": [
                    {
                        "code": "D7",
                        "name": "Leadership",
                        "questions": [
                            {
                                "__v": "",
                                "_id": "",
                                "accessibility": "",
                                "allowAudioRecording": "",
                                "autoCapture": "",
                                "canBeNotApplicable": "",
                                "children": "",
                                "createdAt": "",
                                "createdFromQuestionId": "",
                                "deleted": "",
                                "endTime": "",
                                "entityFieldName": "",
                                "evidenceMethod": "",
                                "externalId": "",
                                "file": "",
                                "fileName": "",
                                "gpsLocation": "",
                                "hint": "",
                                "instanceQuestions": "",
                                "isAGeneralQuestion": "",
                                "isCompleted": "",
                                "isEditable": "",
                                "modeOfCollection": "",
                                "options": "",
                                "page": "2.0",
                                "pageQuestions": [
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd522",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.166Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a39",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C1Q1_1624956346543-1625203111590",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "The principal shares his/her decisions with the school staff.",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "School employees learn by doing, by trying strategies in their work",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "School head ensures the allocation of tasks to the staff members.",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Teachers are included in management of routine tasks.",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "The school's improvement plan, vision and mission are discussed during staff meetings",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "There is an improvement plan for the school with goals, timelines, and owners with regular reviews",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "School leaders have engaged in learning forums, research, or similar practices to keep in touch with latest practices in teaching and assessment",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "The vision and mission of the school is in compliance with national norms and NEP",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Each member of the staff shares a\nresponsibility in the improvement plan devised for each student",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "The school has a handbook of practices and processes to enhance student learning outcomes",
                                                "value": "R10"
                                            },
                                            {
                                                "label": "The Principal/Head of School mentors people to become pedagogical leaders in their own roles",
                                                "value": "R11"
                                            },
                                            {
                                                "label": "The School Policy document for Pedagogical Leadership is in place",
                                                "value": "R12"
                                            },
                                            {
                                                "label": "The vision and mission statements of the school are discussed during SMC meetings and parent orientations",
                                                "value": "R13"
                                            },
                                            {
                                                "label": "The school has HR Policies that include identification of professional development needs and regular capacity building workshops",
                                                "value": "R14"
                                            },
                                            {
                                                "label": "School staff meet at a frequent intervals to review and reflect on progress of students at all levels",
                                                "value": "R15"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R16"
                                            }
                                        ],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd546",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "The school leader has a clear vision and direction to take the school forward",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.1",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Clear vision and direction",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd523",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.172Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a3a",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C1Q2_1624956346543-1625203111590",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Vision and Mission statements",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Records of Sessions between the principal and the school employees",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Empowerment Policy",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "All Scholastic and co-scholastic records of students and staff",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Records of interactions with stakeholders",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Task allocations to each staff member",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Feedback Processes",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "School Improvement Plan",
                                                "score": 0,
                                                "value": "R8"
                                            }
                                        ],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd546",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.1a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd524",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.178Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a3b",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C1Q3_1624956346543-1625203111591",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd546",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.1b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd525",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.185Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a3c",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C1Q4_1624956346543-1625203111592",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd546",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.1c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd526",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.192Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a3d",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C2Q1_1624956346543-1625203111592",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "The principal ensures that there are interactions with school stakeholders.",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Important information is shared with parents and other stakeholders",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Communication with stakeholders take place as per need.",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Students are exposed to Empowerment\nprograms.",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "HR Policies have been created in consultation with staff",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "There is a policy on relationship management which ensures professionalism, positivity, trust-building etc.",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Leaders and teams at all levels (staff/ students/parents/community) are empowered to take on responsibilities.",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "The school leaders are also responsible for cultivating strong relationships using innovative strategies to build teams and to connect with the stakeholders.",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "The leaders reflect, review, respond and\nrate their school in order to build a school\nimprovement plan.",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "There is high retention in the school.",
                                                "value": "R10"
                                            },
                                            {
                                                "label": "Feedback and suggestions are received from diverse stakeholders",
                                                "value": "R11"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R12"
                                            }
                                        ],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd547",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "The school leaders demonstrate effective communication, cross-functional collaborations and build relationships",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.2",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Effective communication and cross-functional collaborations",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd527",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.198Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a3e",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C2Q2_1624956346543-1625203111593",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Policy on Relationship Management",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Process Owner List",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "HR Policies",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Communication Tree",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Feedback mechanisms",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Modes of connecting with students, staff, parents and community",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Visible outcomes of relationship management",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Circulars, SMS, Website, Apps, mails etc.",
                                                "score": 0,
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Formal and informal feedback from stakeholders",
                                                "score": 0,
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Participation of school in community events",
                                                "score": 0,
                                                "value": "R10"
                                            },
                                            {
                                                "label": "School’s participation in community outreach programmes and making a difference",
                                                "score": 0,
                                                "value": "R11"
                                            },
                                            {
                                                "label": "List of team leaders-staff/students/parents",
                                                "score": 0,
                                                "value": "R12"
                                            },
                                            {
                                                "label": "Empowerment Programme for stakeholders",
                                                "score": 0,
                                                "value": "R13"
                                            },
                                            {
                                                "label": "School Improvement Plan based on Reflect, Review, Respond and Rate",
                                                "score": 0,
                                                "value": "R14"
                                            }
                                        ],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd547",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.2a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd528",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.207Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a3f",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C2Q3_1624956346543-1625203111593",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd547",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.2b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd529",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.213Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a40",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C2Q4_1624956346543-1625203111594",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd547",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.2c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd52a",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.219Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a41",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C3Q1_1624956346543-1625203111595",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Capacity building of teachers is done as and when needed",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "The school leaders and teachers demonstrate comprehensive and thorough knowledge of the curriculum.",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "School leaders have engaged in learning forums, research, or similar practices to keep in touch with latest practices in teaching and assessment",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Textbooks and assessments are used to plan lessons",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Capacity building of teachers is continuous and consistent",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Teachers are assigned to subjects and grades according to their competencies",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Leaders analyse data on a continuous basis and plan for improvement",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Assessment cover a wide range of student development indicators",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Learning plans/lesson plans are created based on children's learning levels",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Learning plans/lesson plans are inclusive of different learning styles",
                                                "value": "R10"
                                            },
                                            {
                                                "label": "Teachers attend forums to understand latest research/practices in education",
                                                "value": "R11"
                                            },
                                            {
                                                "label": "Feedback is taken on a regular basis",
                                                "value": "R12"
                                            },
                                            {
                                                "label": "Teachers attend forums to understand latest research/practices in education",
                                                "value": "R13"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R14"
                                            }
                                        ],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd548",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "The school leaders strive for continual improvement in the achievement of learning outcomes of students.",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.3",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Culture of Innovation",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd52b",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.226Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a42",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C3Q2_1624956346543-1625203111596",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Availability of Curriculum of all classes",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "National Education Policy",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Learning Outcomes for all classes",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Policy on Pedagogical leadership",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Assessment Policy",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "CBPs on Latest pedagogical and assessment practices",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "ACP/Pedagogical Plan – scholastic and co-scholastic",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Time Table",
                                                "score": 0,
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Teacher Diary",
                                                "score": 0,
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Classroom Observation Records",
                                                "score": 0,
                                                "value": "R10"
                                            },
                                            {
                                                "label": "Performance Analysis of students’ performance and remedial plans",
                                                "score": 0,
                                                "value": "R11"
                                            },
                                            {
                                                "label": "IEP record\nClass wise tracker of co-scholastic activities",
                                                "score": 0,
                                                "value": "R12"
                                            },
                                            {
                                                "label": "Evidences of inclusivity – differentiated teaching, accommodation and modifications in lesson plan",
                                                "score": 0,
                                                "value": "R13"
                                            },
                                            {
                                                "label": "Feedback mechanisms",
                                                "score": 0,
                                                "value": "R14"
                                            },
                                            {
                                                "label": "Reflect, review, respond and rate data",
                                                "score": 0,
                                                "value": "R15"
                                            },
                                            {
                                                "label": "School improvement plan",
                                                "score": 0,
                                                "value": "R16"
                                            }
                                        ],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd548",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.3a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd52c",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.233Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a43",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C3Q3_1624956346543-1625203111597",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd548",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.3b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd52d",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.240Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a44",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C3Q4_1624956346543-1625203111597",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd548",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.3c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd52e",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.246Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a45",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C4Q1_1624956346543-1625203111598",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Leaders at all levels have analyzed and documented their strengths and areas of improvements",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Leaders at all levels assess the challenges to learning and growing.",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "The improvement plan and strategy is regularly revisited to check progress, challenges, and plan ahead",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Leaders at all levels  design action plan to improve, sustain and\ninnovate",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Leaders do regular checks of the schools practices to ensure conformity with regulatory and statutory compliances",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "The improvement plan outlines strategies for effective implementation in the school",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Feedback is collected from stakeholders on a regular basis",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "The school leaders have conducted data analysis as well as conversations with stakeholders to identify barriers",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "HR Policies for staff are staff friendly",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "There are examples of improvements made in the school",
                                                "value": "R10"
                                            },
                                            {
                                                "label": "School stakeholders have a day-to-day routine in the school",
                                                "value": "R11"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R12"
                                            }
                                        ],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd549",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "The school leaders demonstrate capacity to improve systems in the\nschool and ensure an ethos of responsibility and accountability.",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.4",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Continuous improvement in learning outcomes of students",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd52f",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.253Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a46",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C4Q2_1624956346543-1625203111598",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Improvement Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Records of School Improvement",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Process Owner List",
                                                "score": 0,
                                                "value": "R3"
                                            }
                                        ],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd549",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.4a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd530",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.258Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a47",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C4Q3_1624956346543-1625203111599",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd549",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.4b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd531",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.264Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a48",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C4Q4_1624956346543-1625203111600",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd549",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.4c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd532",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.272Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a49",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C5Q1_1624956346543-1625203111600",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "There is a documented school Policy for promoting Innovation in all the SQAAF domains",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "The Policy for Promoting Innovation in the school is discussed and acted upon during SMC meetings.",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "The school leader strives to bring creativity and innovation to the processes in the school, collaboratively, with all stakeholders.",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "School stakeholders take care of day-to-day roles and responsibilities for the smooth functioning of the school",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Feedback/suggestions are sought on school processes",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Different stakeholders have implemented innovative ideas in the school",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Learning technologies are available in the school",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Learning opportunities like exposure visits, capacity building sessions, etc are provided to stakeholders",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "School leaders share new ideas in meetings/discussions",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R10"
                                            }
                                        ],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd54a",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "The school leaders promote innovation by introducing creative methods and techniques st that equip students and the institution with 21 century skills.",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.5",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Improving systems",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd533",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.278Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a4a",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C5Q2_1624956346543-1625203111601",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy for Promoting Innovation in all the domains",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Creative, innovative and meaningful processes and their outcomes in all the eight domains (Eg. Innovations in Infrastructure, Scholastic and Co-scholastic domains)",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "School Improvement Plan",
                                                "score": 0,
                                                "value": "R3"
                                            }
                                        ],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd54a",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.5a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd534",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.284Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a4b",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C5Q3_1624956346543-1625203111602",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd54a",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.5b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd535",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.289Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a4c",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C5Q4_1624956346543-1625203111603",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd54a",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.5c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd536",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.296Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a4d",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C6Q1_1624956346543-1625203111604",
                                        "file": {
                                            "caption": "FALSE",
                                            "maxCount": 10,
                                            "minCount": 0,
                                            "required": true,
                                            "type": [
                                                "image/jpeg",
                                                "docx",
                                                "pdf",
                                                "ppt"
                                            ]
                                        },
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd54b",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please upload the evidences available for this domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.6",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "Leadership: Overall Reflections",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd537",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.302Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a4e",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C6Q2_1624956346543-1625203111607",
                                        "file": {
                                            "caption": "FALSE",
                                            "maxCount": 10,
                                            "minCount": 0,
                                            "required": true,
                                            "type": [
                                                "image/jpeg",
                                                "docx",
                                                "pdf",
                                                "ppt"
                                            ]
                                        },
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Yes",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Not yet",
                                                "score": 0,
                                                "value": "R2"
                                            }
                                        ],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd54b",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "The School has created improvement plans for the domain Scholastic Processes",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.7",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "Please upload improvement plan if present",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd538",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.307Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a4f",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D7_1624956346543",
                                        "externalId": "D7C6Q3_1624956346543-1625203111607",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "2.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd54b",
                                            "evidenceMethod": "D7_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mention what support from CBSE would help you achieve your plans",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "7.8",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    }
                                ],
                                "payload": "",
                                "prefillFromEntityProfile": "",
                                "question": "",
                                "questionGroup": "",
                                "questionNumber": "",
                                "questionType": "",
                                "remarks": "",
                                "responseType": "pageQuestions",
                                "rubricLevel": "",
                                "sectionHeader": "",
                                "showQuestionInPreview": "",
                                "showRemarks": "",
                                "sliderOptions": "",
                                "startTime": "",
                                "tip": "",
                                "updatedAt": "",
                                "usedForScoring": "",
                                "validation": "",
                                "value": "",
                                "visibleIf": ""
                            }
                        ]
                    }
                ],
                "startTime": "",
                "submissions": [],
                "tip": null
            },
            {
                "canBeNotAllowed": true,
                "canBeNotApplicable": true,
                "code": "D1_1624956346543",
                "description": null,
                "endTime": "",
                "externalId": "D1_1624956346543",
                "isSubmitted": false,
                "modeOfCollection": "onfield",
                "name": "Scholastic Processes",
                "notApplicable": false,
                "remarks": null,
                "sections": [
                    {
                        "code": "D1",
                        "name": "Scholastic Processes",
                        "questions": [
                            {
                                "__v": "",
                                "_id": "",
                                "accessibility": "",
                                "allowAudioRecording": "",
                                "autoCapture": "",
                                "canBeNotApplicable": "",
                                "children": "",
                                "createdAt": "",
                                "createdFromQuestionId": "",
                                "deleted": "",
                                "endTime": "",
                                "entityFieldName": "",
                                "evidenceMethod": "",
                                "externalId": "",
                                "file": "",
                                "fileName": "",
                                "gpsLocation": "",
                                "hint": "",
                                "instanceQuestions": "",
                                "isAGeneralQuestion": "",
                                "isCompleted": "",
                                "isEditable": "",
                                "modeOfCollection": "",
                                "options": "",
                                "page": "1.0",
                                "pageQuestions": [
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4ef",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.773Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a06",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C1Q1_1624956346543-1625203111542",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School leaders have read the NEP & NCF policy documents and engaged in discussions",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "School leaders have identified the key recommendations of NEP and NCF",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "The school organizes orientation programs and discussions for teachers on NEP and NCF",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Teachers integrate NEP & NCF recommendations in their lesson plans",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Lesson plans are reviewed regularly in relation to students’ achievements and aspirations.",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Classrooms are observed regularly in relation to students’ achievements and aspirations.",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "The school has created a cross-curricular policy for curriculum planning",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "The school has integrated NEP & NCF recommendations in the school curriculum",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "School leaders engage in regular data analysis related to teaching practices to see alignment with NEP & NCF and to see its effectiveness on student learning and development",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R10"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd539",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Principal and teachers are familiar with the spirit and content of NCF and recommendations of NEP",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.1",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Scholastic Processes",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.633Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4f0",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.785Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a07",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C1Q2_1624956346543-1625203111543",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Records of Orientation Programmes on NCF/NEP",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Minutes of departmental meetings reflecting the discussion on: NCF, Position Papers NCERT, NEP",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Policy on Equity and Inclusion",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Curriculum policy reflecting No Hard Separation of subjects",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "List of Text books and study material",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Annual Curriculum Plan including Annual Pedagogical Plan",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Annual Integrated Co-scholastic Plan",
                                                "score": 0,
                                                "value": "R8"
                                            },
                                            {
                                                "label": "School Calendar",
                                                "score": 0,
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Annual Assessment and Examination Calendar",
                                                "score": 0,
                                                "value": "R10"
                                            },
                                            {
                                                "label": "HR Policies",
                                                "score": 0,
                                                "value": "R11"
                                            },
                                            {
                                                "label": "Annual Professional Development Plan for teachers",
                                                "score": 0,
                                                "value": "R12"
                                            },
                                            {
                                                "label": "Health and Wellness Policy",
                                                "score": 0,
                                                "value": "R13"
                                            },
                                            {
                                                "label": "Health and Wellness Calendar",
                                                "score": 0,
                                                "value": "R14"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd539",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.1a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4f1",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.793Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a08",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C1Q3_1624956346543-1625203111544",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd539",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.1b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4f2",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.802Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a09",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C1Q4_1624956346543-1625203111545",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd539",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.1c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4f3",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.809Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a0a",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C2Q1_1624956346543-1625203111546",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "The school has integrated in its curriculum recommendations by the Board and National or State Educational Bodies (NCERT/SCERT)",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "The school leaders have oriented teachers on the content driven curriculum that meets the desired outcomes",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "The school has developed a curriculum implementation plan",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Guidelines have been created to develop students' skills and abilities which prepare students for lifelong learning, foster global citizenship and attainment of Sustainable Development Goals(SDGs)",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "The school provides opportunities and resources to students to develop and enhance their knowledge, skills and application of abilities in the domain of cognitive, affective and psychomotor needs",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "The school has created a curriculum policy to ensure that the curriculum enhances knowledge, skills and application of competencies which prepare students for lifelong learning and global citizenship",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Opportunities to develop students' skills and knowledge towards the attainment of SDGs are integrated in the curriculum",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "The school creates opportunities for staff and students to interact with other schools or educational institutions at Regional Level, National Level and International Level to incorporate best practices",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Student learning outcomes data is analysed regularly by teachers and school leaders",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R10"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53a",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Curriculum develops skills and abilities which prepares students for lifelong learning; fosters global citizenship and leads to attainment of Sustainable Development Goals(SDGs)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.2.",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Opportunities to develop students abilities towards lifelong learning, global citizenship and SDGs",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4f4",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.815Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a0b",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C2Q2_1624956346543-1625203111547",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Annual Curriculum and Pedagogical Plan",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Teacher’s Diary",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Teacher Time Table",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Consolidated Students' Time Table",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Strategies to strengthen Play way approach in Anganwadi and Primary classes",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Strategies to strengthen Foundational Literacy and Numeracy",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "List of themes/subjects offered at every level",
                                                "score": 0,
                                                "value": "R8"
                                            },
                                            {
                                                "label": "List of courses and Vocational Education and Internship for classes 6-8 and 9-12",
                                                "score": 0,
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Activities to strengthen Mathematical and Computational  Thinking at all levels of learning",
                                                "score": 0,
                                                "value": "R10"
                                            },
                                            {
                                                "label": "List of local artistes and craftsmen involved in the Internship program",
                                                "score": 0,
                                                "value": "R11"
                                            },
                                            {
                                                "label": "List of year long course on local crafts",
                                                "score": 0,
                                                "value": "R12"
                                            },
                                            {
                                                "label": "List of contemporary courses offered ( AI, Organic Living, Holistic Living, Data Science, Design Thinking, Machine Learning etc",
                                                "score": 0,
                                                "value": "R13"
                                            },
                                            {
                                                "label": "Performance Profiles of Students",
                                                "score": 0,
                                                "value": "R14"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53a",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.2a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4f5",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.823Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a0c",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C2Q3_1624956346543-1625203111548",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53a",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.2b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4f6",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.830Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a0d",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C2Q4_1624956346543-1625203111549",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53a",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.2c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4f7",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.837Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a0e",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C3Q1_1624956346543-1625203111550",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "CBSE Curriculum documents are available in the school library.",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "All teachers have copies of respective syllabus documents and Teachers’ Manuals",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "All teachers have identified key aspects of the CBSE curriculum",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "The school has referred to the CBSE curriculum documents to create the annual curriculum plan.",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "The school has integrated key aspects of CBSE curriculum in the school's annual curriculum plan both for scholastic and co-scholastic activities.",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Teachers and leaders have worked together and created an annual pedagogical plan",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "A policy has been created with practices to help teachers become aware of the key aspects of the curriculum",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "The school regularly organizes staff interactions and trainings to familiarize the staff on CBSE curriculum documents & support material.",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Teachers are engaged in mentoring discussions regularly",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Data related to integration of CBSE aspects in the schools' curriculum and teaching practice is collected and analysed regularly",
                                                "value": "R10"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R11"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53b",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "The Principal and teachers are familiar with the curriculum documents and support material brought out by CBSE",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.3",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Integration of CBSE curriculum",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4f8",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.844Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a0f",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C3Q2_1624956346543-1625203111551",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "List of CBPs for teachers",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "School Calendar",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Annual Curriculum and Pedagogical Plan",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Minutes of Departmental Meetings",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Teachers' Diary with Lesson Plans",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Consolidated Time Table",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "School Vision & Mission statements reflecting ethos of NCF/NEP",
                                                "score": 0,
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Mentoring and Monitoring and Reviewing Practices",
                                                "score": 0,
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Improvement Plans",
                                                "score": 0,
                                                "value": "R10"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53b",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.3a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4f9",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.850Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a10",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C3Q3_1624956346543-1625203111551",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53b",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.3b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4fa",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.857Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a11",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C3Q4_1624956346543-1625203111552",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53b",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.3c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4fb",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.864Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a12",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C4Q1_1624956346543-1625203111553",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Annual Curriculum and Pedagogical Plan is available with the Principal and in the Library.",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Discussions are conducted with teachers on the Annual Curriculum and Pedagogical Plan",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Meetings are conducted to share the annual curriculum and pedagogical plan with students and parents",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "The Annual Curriculum and Pedagogical Plan is designed along with teachers",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "The plan is designed based on previous learning experiences of students, with a focus on inter-disciplinary approach.",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Teachers and leaders take actions towards achieving the targets set for all students in the plan",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "There is a school policy to ensure the annual curriculum and pedagogical plan is developed with a focus on Foundational Literacy and Numeracy and interdisciplinary learning",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "The Curriculum plan draws connections among different subjects and disciplines in order to promote interdisciplinary learning",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "The approved Annual Curriculum and Pedagogical Plan is effectively implemented",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Improvement plans are designed keeping in mind all students to ensure everyone meets the desired learning outcomes.",
                                                "value": "R10"
                                            },
                                            {
                                                "label": "The school team meets at regular intervals to review progress on implementation of the Curriculum and Pedagogical Plan",
                                                "value": "R11"
                                            },
                                            {
                                                "label": "The Curriculum plan details strategies on promoting multilingualism",
                                                "value": "R12"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R13"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53c",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "There is an Annual Curriculum and Pedagogical Plan for the development of Scholastic Skills",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.4",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Annual Curriculum and Pedagogical plan",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4fc",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.870Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a13",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C4Q2_1624956346543-1625203111554",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Vision and Mission of School",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "List of CBPs for teachers",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Guidelines to prepare Annual Curriculum Plan and Annual Pedagogical Plan",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Annual Pedagogical Plan with integration of co-scholastics",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Annual Curriculum Plan/School Calendar based on \nNew pedagogical and curricular structure of school education (5+3+3+4)",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Consolidated Time Table",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Strategies to incorporate multi-lingualism",
                                                "score": 0,
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Minutes of Departmental Meetings and Staff Meetings",
                                                "score": 0,
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Teachers' Diary with Lesson Plans",
                                                "score": 0,
                                                "value": "R10"
                                            },
                                            {
                                                "label": "Monitoring and Reviewing Practices",
                                                "score": 0,
                                                "value": "R11"
                                            },
                                            {
                                                "label": "Improvement Plans",
                                                "score": 0,
                                                "value": "R12"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53c",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.4a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4fd",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.878Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a14",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C4Q3_1624956346543-1625203111556",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53c",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.4b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4fe",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.885Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a15",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C4Q4_1624956346543-1625203111556",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53c",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.4c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd4ff",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.894Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a16",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C5Q1_1624956346543-1625203111557",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "The school works for only 100 -150 days in a year.",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "The school works for 151-180 days in a year.",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "The school works for 181-200 days in a year to ensure optimum time for learning.",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "The school works for more than 200 days or more in a year as per RTE act.",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Processes are also in place to ensure students get the required amount of learning time.",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R6"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53d",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "School follows an optimum number of teaching days and teaching hours",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.5",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Teaching hours",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd500",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.902Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a17",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C5Q2_1624956346543-1625203111558",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Attendance Registers of Teachers, Students Other staff members",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Period Allocation Record",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Monitoring and Reviewing Practices",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Improvement Plans",
                                                "score": 0,
                                                "value": "R5"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53d",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.5a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd501",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.909Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a18",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C5Q3_1624956346543-1625203111559",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53d",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.5b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd502",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.916Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a19",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C5Q4_1624956346543-1625203111560",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53d",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.5c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd503",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.923Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a1a",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C6Q1_1624956346543-1625203111561",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "The school follows teacher – student ratio of 1 teacher for 40 students and above.",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "The school follows the teacher-student ratio of 1 teacher for 36-39 students.",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "The school follows the teacher-student ratio of 1 teacher for 31-35 students",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "The school follows the teacher-student ratio of 1 teacher for 25-30 students",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Teachers ensure that individual attention is given to every student",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "The school policy also covers teacher-student ratio",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R7"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53e",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Teacher – Student Ratio",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.6",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Teacher – Student Ratio",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd504",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.929Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a1b",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C6Q2_1624956346543-1625203111562",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Admission and Withdrawal Records/Register",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Attendance Register of each class",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Teachers on Roll",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Consolidated Time Table",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "List of teachers and number of sections in the school",
                                                "score": 0,
                                                "value": "R6"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53e",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.6a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd505",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.936Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a1c",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C6Q3_1624956346543-1625203111563",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53e",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.6b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd506",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.943Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a1d",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C6Q4_1624956346543-1625203111564",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53e",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.6c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd507",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.950Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a1e",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C7Q1_1624956346543-1625203111565",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Teachers make use of the textbooks in teaching",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Students follow instructions of teachers",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Lessons regularly draw connections among subjects",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Lessons are planned and implemented with clear learning objectives",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Teachers use teaching methods according to the nature of the subject matter",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Guidelines for preparing integrated lesson plans and varied teaching learning approaches and tools are available",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Informal assessments are integrated in the lesson plan",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Teachers frequently and regularly make use of activity-based learning in their classrooms",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Teachers frequently and regularly make use of experiential learning methods in their classrooms",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "There are regular classroom observations and reflections on teaching practices",
                                                "value": "R10"
                                            },
                                            {
                                                "label": "Each teacher receives mentorship on planning and implementing lessons",
                                                "value": "R11"
                                            },
                                            {
                                                "label": "Formative assessments are used towards remediation and understanding needs of students",
                                                "value": "R12"
                                            },
                                            {
                                                "label": "Lesson plans are created keeping in mind skills that students would need in the future",
                                                "value": "R13"
                                            },
                                            {
                                                "label": "Lessons include individual and co-operative opportunities to students to reflect upon their learning experiences",
                                                "value": "R14"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R15"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53f",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Teachers adopt varied teaching learning approaches reflecting their understanding of the needs of the student",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.7",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Teaching-learning approaches",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd508",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.957Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a1f",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C7Q2_1624956346543-1625203111566",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "List and Certificates of CBPs attended by teachers",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "In house training programmes",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "List of workshops conducted by teachers (In-house and external)",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Practices adopted by school to enable teachers to become Instructional Leaders",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "List of Reference Books used by teachers",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Evidences of planning for diverse learners visible in lesson plans",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Teacher’s Diary with Lesson Plans reflecting:\nObjectives                Learning Outcomes                Materials used                Methodology Assessments for/of/in/as Learning\nAccommodations\nMentoring, Monitoring and Reviewing Practices\nImprovement Plans",
                                                "score": 0,
                                                "value": "R8"
                                            },
                                            {
                                                "label": "New pedagogical and curricular structure of school education (5+3+3+4): 3 years in Anganwadi/pre-school and 12 years in school",
                                                "score": 0,
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Secondary Stage (4) Greater critical thinking, multidisciplinary study, flexibility and student choice of subjects",
                                                "score": 0,
                                                "value": "R10"
                                            },
                                            {
                                                "label": "Middle Stage (3) experiential learning in the sciences, mathematics, arts, social sciences, and humanities",
                                                "score": 0,
                                                "value": "R11"
                                            },
                                            {
                                                "label": "Preparatory Stage (3) play, discovery, and activity-based and interactive classroom learning",
                                                "score": 0,
                                                "value": "R12"
                                            },
                                            {
                                                "label": "Foundational stage (5) multilevel, play/activity-based learning",
                                                "score": 0,
                                                "value": "R13"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53f",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.7a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd509",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.964Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a20",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C7Q3_1624956346543-1625203111569",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53f",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.7b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd50a",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.972Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a21",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C7Q4_1624956346543-1625203111571",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd53f",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.7c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd50b",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.983Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a22",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C8Q1_1624956346543-1625203111572",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "The school has documents on learning outcomes for different classes as defined by NCERT",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Student assessments draw on questions covered in the textbook",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Teachers plan their lessons in accordance with the syllabus",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Teachers plan remediation according to data on student outcomes",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Teachers collect and implement feedback from students",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Teachers have mapped assessment tasks with the learning outcomes",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Teachers assess the students as per the outcomes defined for each chapter using their own assessment tasks",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Teachers, parents, and students have been oriented on learning outcomes",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Learning Outcomes are prepared in line with the Learning Outcomes laid down by NCERT or as defined in the curriculum document of CBSE",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "The policy is shared with the students and parents",
                                                "value": "R10"
                                            },
                                            {
                                                "label": "The student assessment and evaluation policy has been prepared in collaboration with the staff",
                                                "value": "R11"
                                            },
                                            {
                                                "label": "The school has a policy with regard to structure of student assessment and evaluation",
                                                "value": "R12"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R13"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd540",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Learning Outcomes are used as checkpoints to assess students’ learning at different points of time",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.8",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Learning Outcomes",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd50c",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.991Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a23",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C8Q2_1624956346543-1625203111573",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "List of CBPs",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Minutes of Staff Meetings and Departmental Meetings reflecting achievement of learning outcomes",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Assessment records of students",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Evaluation records at grades 3, 5, and 8 to assess learning outcomes",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Assessment worksheets prepared by teachers",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Teachers' Diaries with Lesson Plans",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Evidences of oral or written communication about the learning outcomes to the students and their parents",
                                                "score": 0,
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Evidences of customized assessments",
                                                "score": 0,
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Mentoring and Monitoring practices",
                                                "score": 0,
                                                "value": "R10"
                                            },
                                            {
                                                "label": "Improvement Plan",
                                                "score": 0,
                                                "value": "R11"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd540",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.8a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd50d",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:50.998Z",
                                        "createdFromQuestionId": "60daddbebae26f0b43e60a24",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C8Q3_1624956346543-1625203111574",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd540",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.8b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd50e",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.006Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a25",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C8Q4_1624956346543-1625203111575",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd540",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.8c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd50f",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.013Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a26",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C9Q1_1624956346543-1625203111577",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Assessments include pen paper tests to assess the performance of students",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Assignments, worksheets and projects are used to assess the performance of students",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Guidelines for assessments and evaluation are shared with staff",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Teachers use the data for purpose of remediation and performance enhancement",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Teachers conduct and employ different types of assessment tools",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Teachers assess students on the basis of pre-defined criteria",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Teachers consult students on defining assessment criteria",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Teachers hold discussions with parents to communicate assessment criteria",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Guidelines for assessment and evaluation are in place",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Teachers use assessment data to improve their own learning teaching practices",
                                                "value": "R10"
                                            },
                                            {
                                                "label": "There is a process for effective data collection and analysis of student data",
                                                "value": "R11"
                                            },
                                            {
                                                "label": "The school leader regularly reviews the data collection and analysis process",
                                                "value": "R12"
                                            },
                                            {
                                                "label": "Different assessment techniques are integrated with the classroom teaching",
                                                "value": "R13"
                                            },
                                            {
                                                "label": "There are evidences of how student performance has improved based on teachers' analysis of data and planning strategies according to the analysis",
                                                "value": "R14"
                                            },
                                            {
                                                "label": "The School Policy with regard to Assessment Practices and Evaluation is in place",
                                                "value": "R15"
                                            },
                                            {
                                                "label": "Teachers periodically design and use different formative assessment tools and techniques as per the needs of the students",
                                                "value": "R16"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R17"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd541",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "The school has defined procedures and criteria to regularly assess the students' performance; adopts varied assessment tools and techniques to assess the performance of the students – Assessment for Learning",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.9",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Assessment for Learning",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd510",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.021Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a27",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C9Q2_1624956346543-1625203111577",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "CBPs attended by Teachers",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Evidences of diagnostic and remedial measures used by teachers to enhance student performance",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Teachers' Diary with lesson plans",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Samples of Types of questions, Quiz questions, Project Work, Portfolios, Mind Maps, Games, Debate, Interview, Presentation, etc.",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Criteria and rubrics created by the teachers with the help of the students for different activities",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Records of remedial classes to reflect students’ performances",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Monitoring and Reviewing Practices",
                                                "score": 0,
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Improvement Plans",
                                                "score": 0,
                                                "value": "R9"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd541",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.9a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd511",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.029Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a28",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C9Q3_1624956346543-1625203111578",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd541",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.9b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd512",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.038Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a29",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C9Q4_1624956346543-1625203111579",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd541",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.9c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd513",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.046Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a2a",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C10Q1_1624956346543-1625203111580",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Teachers prepare question papers for students",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Teachers prepare the question papers and the marking scheme as per the blueprint",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Teachers prepare balanced question papers with clear instructions, appropriate difficulty level, clearly spelt out value points in marking scheme",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Teachers incorporate different types of questions as per the Blueprint",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "The School Policy with regard to Assessment Practices and Evaluation is in place",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "There is an Annual Calendar for conducting examinations",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "There is a well -defined Blueprint, Rubric for guiding paper setters for framing different kind of questions",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "School has defined criteria for mentoring of staff in designing questions and moderating question papers",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "School staff have been trained on designing question papers as well as related Standard Operating Procedures",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Standard Operating Procedures on key roles and responsibilities of examination cell in-charge, paper setter, moderator are in place",
                                                "value": "R10"
                                            },
                                            {
                                                "label": "Standard Operating Procedures ensure clarity in paper setting, submission, moderation, printing, circulation of papers, invigilation, collection and submission of answer sheets, evaluation etc",
                                                "value": "R11"
                                            },
                                            {
                                                "label": "ICT is integrated in examination process to make it more transparent and efficient",
                                                "value": "R12"
                                            },
                                            {
                                                "label": "Question Papers are cross checked for quality, reliability, authenticity and validity",
                                                "value": "R13"
                                            },
                                            {
                                                "label": "Grading and marking schemes and Holistic Report Cards are in alignment with NEP recommendations and CBSE bylaws",
                                                "value": "R14"
                                            },
                                            {
                                                "label": "Teachers hold spaces for self – reflection after assessment of learning and designing self -improvement plans",
                                                "value": "R15"
                                            },
                                            {
                                                "label": "Teachers involve students & parents in the preparation of question papers",
                                                "value": "R16"
                                            },
                                            {
                                                "label": "Teachers receive mentoring support in designing assessments",
                                                "value": "R17"
                                            },
                                            {
                                                "label": "The assessment process is regularly reviewed",
                                                "value": "R18"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R19"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd542",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Teachers prepare balanced question papers to assess the performance of students",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.10",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Assessment of Learning",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd514",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.052Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a2b",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C10Q2_1624956346543-1625203111581",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "CBPs attended by teachers",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Evidences of training of teachers in modern assessment practices and framing of balanced question papers",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Blue Print of Question Papers",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Sample of question papers prepared by teachers",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Questions prepared by students",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Reflection sheets",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Models answers",
                                                "score": 0,
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Use of digital tools",
                                                "score": 0,
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Monitoring and Reviewing Practices",
                                                "score": 0,
                                                "value": "R10"
                                            },
                                            {
                                                "label": "Improvement Plans",
                                                "score": 0,
                                                "value": "R11"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd542",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.10a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd515",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.061Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a2c",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C10Q3_1624956346543-1625203111582",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd542",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.10b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd516",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.076Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a2d",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C10Q4_1624956346543-1625203111583",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd542",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.10c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd517",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.085Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a2e",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C11Q1_1624956346543-1625203111583",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "The school maintains attendance records of the students",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "The Principal and teachers have identified students who are regularly absent",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "parents are informed about children who are regularly absent",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Regular communication, counseling and follow ups are done to encourage attendance and reduce drop outs",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "The Principal, teachers and other stakeholders create joint plans to improve student attendance",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "The School Policy for Student Attendance is in place",
                                                "value": "R6"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd543",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "The school ensures 75% attendance of its students",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.11",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Student Attendance",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd518",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.092Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a2f",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C11Q2_1624956346543-1625203111584",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Registration records",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Attendance records",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "CBPs attended by teachers",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Evidences of involvement of counselors / experts to ensure regular attendance",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Records of communication with parents",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Written records of action taken other than communication to parents by the teachers and principal",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Improvement Plans",
                                                "score": 0,
                                                "value": "R8"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd543",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.11a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd519",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.099Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a30",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C11Q3_1624956346543-1625203111584",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd543",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.11b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd51a",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.107Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a31",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C11Q4_1624956346543-1625203111585",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd543",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.11c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd51b",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.115Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a32",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C12Q1_1624956346543-1625203111585",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Assessments include pen paper tests to assess the performance of students",
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Teachers have conducted assessments to identify the learning levels of the students",
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Teachers make use of different methods of assessment to assess the learning outcomes of students",
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Teachers create lesson plans keeping in mind learning needs and outcomes of all students",
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Teachers tailor the teaching learning practices as per each student’s needs",
                                                "value": "R5"
                                            },
                                            {
                                                "label": "The average result of Class X/XII is 100% (with reference to Board average)",
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Teachers have been trained on understanding the process of growth and development of students in cognitive, affective and psychomotor domains",
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Teachers create lesson plans that encourage holistic development of the students",
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Teachers use self-assessment techniques by students to enable them to monitor their own growth and achievement",
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Teachers develop lesson plans based on students' achievement levels",
                                                "value": "R10"
                                            },
                                            {
                                                "label": "The School Policy on Students Achievement in different domains is in place",
                                                "value": "R11"
                                            },
                                            {
                                                "label": "NA",
                                                "score": 0,
                                                "value": "R12"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd544",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "The school ensures all students achieve and progress on their developmental continuum",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.12",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "Student Development",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd51c",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.120Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a33",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C12Q2_1624956346543-1625203111586",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "School Policy",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "CBPs attended by teachers",
                                                "score": 0,
                                                "value": "R2"
                                            },
                                            {
                                                "label": "Records of last 3 years of Grade X and XII results along with analysis showing percentage of students in different percentile ranges",
                                                "score": 0,
                                                "value": "R3"
                                            },
                                            {
                                                "label": "Assessment Records of all students for the last three years",
                                                "score": 0,
                                                "value": "R4"
                                            },
                                            {
                                                "label": "Analysis of student performance from class IX – XII",
                                                "score": 0,
                                                "value": "R5"
                                            },
                                            {
                                                "label": "Report Cards of Class X/XII Board Examination",
                                                "score": 0,
                                                "value": "R6"
                                            },
                                            {
                                                "label": "Students’ Profiles and IEP (Individual Education Plan) for each student of all classes",
                                                "score": 0,
                                                "value": "R7"
                                            },
                                            {
                                                "label": "Record of interactions with Counselors/experts/parents and subsequent action plan",
                                                "score": 0,
                                                "value": "R8"
                                            },
                                            {
                                                "label": "Diagnostic and Remedial Records",
                                                "score": 0,
                                                "value": "R9"
                                            },
                                            {
                                                "label": "Self-Assessment reports of students",
                                                "score": 0,
                                                "value": "R10"
                                            },
                                            {
                                                "label": "Monitoring and Reviewing Practices",
                                                "score": 0,
                                                "value": "R11"
                                            },
                                            {
                                                "label": "ECCE Outcomes",
                                                "score": 0,
                                                "value": "R12"
                                            },
                                            {
                                                "label": "Foundational Literacy and Numeracy outcomes",
                                                "score": 0,
                                                "value": "R13"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd544",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "multiselect",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mark all the evidences you have for this sub-sub-domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.12a",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "multiselect",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd51d",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.127Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a34",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C12Q3_1624956346543-1625203111586",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd544",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Comments and Reflection:",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.12b",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd51e",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.133Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a35",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C12Q4_1624956346543-1625203111587",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd544",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "slider",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Based on your answers, please mark a level that your school stands at. ( 4 being the highest)",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.12c",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "slider",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "max": "4",
                                            "min": "1",
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd51f",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.141Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a36",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C13Q1_1624956346543-1625203111587",
                                        "file": {
                                            "caption": "FALSE",
                                            "maxCount": 10,
                                            "minCount": 0,
                                            "required": true,
                                            "type": [
                                                "image/jpeg",
                                                "docx",
                                                "pdf",
                                                "ppt"
                                            ]
                                        },
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd545",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please upload all the evidences available for this domain",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.13",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "Scholastic Processes: Overall Reflections",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd520",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.148Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a37",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C13Q2_1624956346543-1625203111589",
                                        "file": {
                                            "caption": "FALSE",
                                            "maxCount": 10,
                                            "minCount": 0,
                                            "required": true,
                                            "type": [
                                                "image/jpeg",
                                                "docx",
                                                "pdf",
                                                "ppt"
                                            ]
                                        },
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [
                                            {
                                                "label": "Yes",
                                                "score": 0,
                                                "value": "R1"
                                            },
                                            {
                                                "label": "Not yet",
                                                "score": 0,
                                                "value": "R2"
                                            }
                                        ],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd545",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "radio",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "The School has created improvement plans for the domain Scholastic Processes",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.14",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "radio",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "Please upload improvement plan if present",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    },
                                    {
                                        "__v": 0,
                                        "_id": "60dea1a736e3e36d8a9bd521",
                                        "accessibility": "No",
                                        "allowAudioRecording": false,
                                        "autoCapture": false,
                                        "canBeNotApplicable": "false",
                                        "children": [],
                                        "createdAt": "2021-06-29T08:45:51.157Z",
                                        "createdFromQuestionId": "60daddbfbae26f0b43e60a38",
                                        "deleted": false,
                                        "endTime": "",
                                        "entityFieldName": "",
                                        "evidenceMethod": "D1_1624956346543",
                                        "externalId": "D1C13Q3_1624956346543-1625203111589",
                                        "file": "",
                                        "fileName": [],
                                        "gpsLocation": "",
                                        "hint": "",
                                        "instanceQuestions": [],
                                        "isAGeneralQuestion": false,
                                        "isCompleted": false,
                                        "isEditable": true,
                                        "modeOfCollection": "onfield",
                                        "options": [],
                                        "page": "1.0",
                                        "payload": {
                                            "criteriaId": "60dea1a736e3e36d8a9bd545",
                                            "evidenceMethod": "D1_1624956346543",
                                            "responseType": "text",
                                            "rubricLevel": ""
                                        },
                                        "prefillFromEntityProfile": false,
                                        "question": [
                                            "Please mention what support from CBSE would help you achieve your plans",
                                            ""
                                        ],
                                        "questionGroup": [
                                            "A1"
                                        ],
                                        "questionNumber": "1.15",
                                        "questionType": "auto",
                                        "remarks": "",
                                        "responseType": "text",
                                        "rubricLevel": "",
                                        "sectionHeader": "",
                                        "showQuestionInPreview": false,
                                        "showRemarks": false,
                                        "sliderOptions": [],
                                        "startTime": "",
                                        "tip": "",
                                        "updatedAt": "2021-07-02T05:18:31.634Z",
                                        "usedForScoring": "",
                                        "validation": {
                                            "required": true
                                        },
                                        "value": "",
                                        "visibleIf": ""
                                    }
                                ],
                                "payload": "",
                                "prefillFromEntityProfile": "",
                                "question": "",
                                "questionGroup": "",
                                "questionNumber": "",
                                "questionType": "",
                                "remarks": "",
                                "responseType": "pageQuestions",
                                "rubricLevel": "",
                                "sectionHeader": "",
                                "showQuestionInPreview": "",
                                "showRemarks": "",
                                "sliderOptions": "",
                                "startTime": "",
                                "tip": "",
                                "updatedAt": "",
                                "usedForScoring": "",
                                "validation": "",
                                "value": "",
                                "visibleIf": ""
                            }
                        ]
                    }
                ],
                "startTime": "",
                "submissions": [],
                "tip": null
            }
        ],
        "externalId": "66b7b24e-d8b6-11eb-bd1b-9d7bb3910eef-OBSERVATION-TEMPLATE_CHILD-V3",
        "name": "SQAA- for testing",
        "pageHeading": "Domains",
        "submissionId": "6156a84b521c1f0007874fd1",
        "submissions": {}
    },
    "entityProfile": {
        "_id": "5fd1f4a0e84a88170cfb09ed",
        "entityType": "school",
        "entityTypeId": "5f32d8228e0dc83124040567"
    },
    "program": {
        "_id": "60dacb6ff595770aafd6a8e6",
        "description": "CBSE SQAA",
        "externalId": "PGM-3624-CBSE-SQAA",
        "imageCompression": {
            "quality": 10
        },
        "isAPrivateProgram": false,
        "name": "CBSE SQAA"
    },
    "solution": {
        "_id": "60dea1a736e3e36d8a9bd54c",
        "captureGpsLocationAtQuestionLevel": false,
        "criteriaLevelReport": true,
        "description": "SQAA- for testing",
        "enableQuestionReadOut": false,
        "externalId": "66b7b24e-d8b6-11eb-bd1b-9d7bb3910eef-OBSERVATION-TEMPLATE_CHILD-V3",
        "isRubricDriven": true,
        "name": "SQAA- for testing",
        "pageHeading": "Domains",
        "registry": [],
        "scoringSystem": "pointsBasedScoring"
    }
    }
    // const config = {
    //   url: urlConstants.API_URLS.DEEPLINK.VERIFY_OBSERVATION_LINK + link,
    //   payload: payload,
    // };
    // this.assessmentService.post(config).subscribe(
    //   (success) => {
        // if (success.result) {
        //   console.log(success);
        //   let data = success.result;

        let data:any  = '';
        // {
        //   submissionId : '6156a84b521c1f0007874fd1',
        //   selectedEvidenceIndex :0,
        //   selectedSection:0,
        //   entityName:'Temp'
        // }
        console.log(resp.assessment.evidences[0].sections,"ffdd");  
        if (
          resp.assessment.evidences.length > 1 ||
          resp.assessment.evidences[0].sections.length > 1 ||
          (resp.solution.criteriaLevelReport && resp.solution.isRubricDriven)
        ) {
          this.router.navigate([RouterLinks.DOMAIN_ECM_LISTING], {
            queryParams: {
              // submisssionId: resp.assessment.submissionId,
              // schoolName: 'school',
              // allowMultipleAssessemts: true

            }, state :resp
          });
        } else {
          this.router.navigate([RouterLinks.QUESTIONNAIRE], {
            queryParams: {
              submisssionId: data.submissionId,
              evidenceIndex: data.selectedEvidenceIndex,
              sectionIndex: data.selectedSection,
              schoolName: data.entityName,
              isTargeted : false
            }, 
              state:resp
        });
          // this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_DETAILS}`], {
          //   queryParams: {
          //     // programId: data.programId,
          //     // solutionId: data.solutionId,
          //     // observationId: data._id,
          //     // solutionName: data.name,

          //     programId: 1,
          //     solutionId:2,
          //     observationId: 3,
          //     solutionName:4,
          //   },
          // });
        // }
    //   },
    //   (error) => {
    //     console.log(error);
    //   }
    // );

  }
}

  redirectReportWithParams(params: string, type) {
    let paramsArr = params.split('-');
    console.log(paramsArr);
    let pId = paramsArr[0];
    let sId = paramsArr[1];
    let eId = paramsArr[2];
    let etype = paramsArr[3];
    let oId = paramsArr[4];

    if (type == 'observation') {
      let payload = {
        entityId: eId,
        entityType: etype,
        observationId: oId,
      };
      setTimeout(() => {
        // will go call entity report
        this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
          replaceUrl: true,
          queryParams: {
            entityId: eId,
            entityType: etype,
            observationId: oId,
          },
        });
      }, 1000);
    }

    if (type == 'assessment') {
      let payload = {
        programId: pId,
        entity: {
          _id: eId,
          entityType: etype,
        },
        entityType: etype,
        solutionId: sId,
      };
    }
  }
}