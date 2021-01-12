import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppGlobalService, AppHeaderService, CommonUtilService, ContentAggregatorHandler, SunbirdQRScanner } from '@app/services';
import { CourseCardGridTypes, LibraryCardTypes, PillShape, PillsViewType, SelectMode, ButtonPosition, ShowMoreViewType, PillsMultiRow } from '@project-sunbird/common-consumption';
import { NavigationExtras, Router } from '@angular/router';
import { FrameworkService, FrameworkDetailsRequest, FrameworkCategoryCodesGroup,
  Framework, Profile, ProfileService, ContentAggregatorRequest, ContentSearchCriteria,
  CachedItemRequestSourceFrom, SearchType } from '@project-sunbird/sunbird-sdk';
import { ColorMapping, EventTopics, PrimaryCaregoryMapping, ProfileConstants, RouterLinks, SubjectMapping } from '../../app.constant';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { AggregatorPageType } from '@app/services/content/content-aggregator-namespaces';
import { NavigationService } from '@app/services/navigation-handler.service';
import { Events, IonContent as ContentView, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SbSubjectListPopupComponent } from '@app/app/components/popups/sb-subject-list-popup/sb-subject-list-popup.component';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.page.html',
  styleUrls: ['./user-home.page.scss'],
})
export class UserHomePage implements OnInit, OnDestroy {

  aggregatorResponse = [];
  courseCardType = CourseCardGridTypes;
  selectedFilter: string;
  concatProfileFilter: Array<string> = [];
  categories: Array<any> = [];
  boards: string;
  medium: string;
  grade: string;
  profile: Profile;
  guestUser: boolean;
  appLabel: string;

  displaySections: any[] = [];
  headerObservable: Subscription;

  pillsViewType = PillsViewType;
  selectMode = SelectMode;
  pillShape = PillShape;
  @ViewChild('contentView') contentView: ContentView;
  showPreferenceInfo = false;

  LibraryCardTypes = LibraryCardTypes
  ButtonPosition = ButtonPosition
  ShowMoreViewType = ShowMoreViewType
  PillsMultiRow = PillsMultiRow

  constructor(
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private appGlobalService: AppGlobalService,
    private appVersion: AppVersion,
    private contentAggregatorHandler: ContentAggregatorHandler,
    private navService: NavigationService,
    private headerService: AppHeaderService,
    private events: Events,
    private qrScanner: SunbirdQRScanner,
    private popoverCtrl: PopoverController,
  ) {
  }

  ngOnInit() {
    this.getUserProfileDetails();
    this.events.subscribe(AppGlobalService.PROFILE_OBJ_CHANGED, () => {
      this.getUserProfileDetails();
    });

    this.events.subscribe(EventTopics.TAB_CHANGE, (data: string) => {
      if (data === '') {
        this.qrScanner.startScanner(this.appGlobalService.getPageIdForTelemetry());
      }
    });
  }

  async ionViewWillEnter() {
    this.events.subscribe('update_header', () => {
      this.headerService.showHeaderWithHomeButton(['download', 'notification']);
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.headerService.showHeaderWithHomeButton(['download', 'notification']);
  }

  async getUserProfileDetails() {
    await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      .subscribe((profile: Profile) => {
        this.profile = profile;
        this.getFrameworkDetails();
        this.fetchDisplayElements();
      });
    this.guestUser = !this.appGlobalService.isUserLoggedIn();
    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appLabel = appName;
      });
  }


  editProfileDetails() {
    if (!this.guestUser) {
      this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`]);
    } else {
      const navigationExtras: NavigationExtras = {
        state: {
          profile: this.profile,
          isCurrentUser: true
        }
      };
      this.router.navigate([RouterLinks.GUEST_EDIT], navigationExtras);
    }
  }

  getFrameworkDetails(frameworkId?: string): void {
    const frameworkDetailsRequest: FrameworkDetailsRequest = {
      frameworkId: (this.profile && this.profile.syllabus && this.profile.syllabus[0]) ? this.profile.syllabus[0] : '',
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };
    this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
      .then(async (framework: Framework) => {
        this.categories = framework.categories;

        if (this.profile.board && this.profile.board.length) {
          this.boards = this.getFieldDisplayValues(this.profile.board, 0);
        }
        if (this.profile.medium && this.profile.medium.length) {
          this.medium = this.getFieldDisplayValues(this.profile.medium, 1);
        }
        if (this.profile.grade && this.profile.grade.length) {
          this.grade = this.getFieldDisplayValues(this.profile.grade, 2);
        }
      });
  }

  getFieldDisplayValues(field: Array<any>, catIndex: number): string {
    const displayValues = [];
    this.categories[catIndex].terms.forEach(element => {
      if (field.includes(element.code)) {
        displayValues.push(element.name);
      }
    });
    return this.commonUtilService.arrayToString(displayValues);
  }

  async fetchDisplayElements() {
    const request: ContentAggregatorRequest = {
      interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => {
        contentSearchCriteria.board = this.profile.board;
        contentSearchCriteria.medium = this.profile.medium;
        contentSearchCriteria.grade = this.profile.grade;
        contentSearchCriteria.searchType = SearchType.SEARCH;
        contentSearchCriteria.mode = 'soft';
        return contentSearchCriteria;
      }, from: CachedItemRequestSourceFrom.SERVER
    };
    // let displayItems = await this.contentAggregatorHandler.newAggregate(request, AggregatorPageType.HOME);
    let displayItems = [
      {
        "title": "{\"en\":\"Continue\"}",
        "data": {
          "name": "0",
          "sections": [
            {
              "name": "0",
              "count": 6,
              "contents": [
                {
                  "dateTime": 1610076064048,
                  "lastReadContentStatus": 2,
                  "enrolledDate": "2021-01-07 09:04:56:356+0000",
                  "contentId": "do_2131630808105451521396",
                  "description": "Enter description for TextBook",
                  "courseLogoUrl": null,
                  "batchId": "01316359595492147272",
                  "content": {
                    "trackable": {
                      "enabled": "Yes",
                      "autoBatch": "Yes"
                    },
                    "identifier": "do_2131630808105451521396",
                    "orgDetails": {
                      "orgName": "Tamil Nadu",
                      "email": null
                    },
                    "primaryCategory": "Digital Textbook",
                    "leafNodesCount": 3,
                    "channel": "01269878797503692810",
                    "name": "Trackable book 1dec",
                    "description": "Enter description for TextBook",
                    "contentType": "Course",
                    "pkgVersion": 1,
                    "objectType": "Content"
                  },
                  "contentStatus": {
                    "do_31238576627803750422667": 2,
                    "do_31243477011023462414423": 2
                  },
                  "lastReadContentId": "do_31238576627803750422667",
                  "certstatus": null,
                  "courseId": "do_2131630808105451521396",
                  "collectionId": "do_2131630808105451521396",
                  "addedBy": "960833ef-8562-4e35-a1d6-b2b633dc5f1b",
                  "batch": {
                    "identifier": "01316359595492147272",
                    "endDate": null,
                    "createdBy": "fca2925f-1eee-4654-9177-fece3fd6afc9",
                    "name": "Trackable book 1dec",
                    "batchId": "01316359595492147272",
                    "enrollmentType": "open",
                    "startDate": "2020-12-02",
                    "status": 1
                  },
                  "active": true,
                  "userId": "fd68e72d-b6f7-4d69-b6b5-6009d77f3a95",
                  "issuedCertificates": [],
                  "completionPercentage": 66,
                  "courseName": "Trackable book 1dec",
                  "certificates": [],
                  "completedOn": null,
                  "leafNodesCount": 3,
                  "progress": 2,
                  "status": 1
                },
                {
                  "dateTime": 1610010715894,
                  "lastReadContentStatus": null,
                  "enrolledDate": "2021-01-07 09:11:55:894+0000",
                  "contentId": "do_21312822618048102415713",
                  "description": "Enter description for TextBook",
                  "courseLogoUrl": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/teacher_module_on_4.pptx_371_1473163689_1473163697831.jpg",
                  "batchId": "01316440476958720077",
                  "content": {
                    "trackable": {
                      "enabled": "Yes",
                      "autoBatch": "Yes"
                    },
                    "identifier": "do_21312822618048102415713",
                    "appIcon": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/teacher_module_on_4.pptx_371_1473163689_1473163697831.jpg",
                    "orgDetails": {
                      "orgName": "Tamil Nadu",
                      "email": null
                    },
                    "primaryCategory": "Digital Textbook",
                    "leafNodesCount": 5,
                    "channel": "01269878797503692810",
                    "name": "vk-3.3TrackableETB1",
                    "description": "Enter description for TextBook",
                    "contentType": "Course",
                    "pkgVersion": 6,
                    "objectType": "Content"
                  },
                  "contentStatus": {},
                  "lastReadContentId": null,
                  "certstatus": null,
                  "courseId": "do_21312822618048102415713",
                  "collectionId": "do_21312822618048102415713",
                  "addedBy": "7599bc1b-fbda-423f-9568-8183de548e06",
                  "batch": {
                    "identifier": "01316440476958720077",
                    "endDate": null,
                    "createdBy": "fca2925f-1eee-4654-9177-fece3fd6afc9",
                    "name": "Vk-3.5Batch",
                    "batchId": "01316440476958720077",
                    "enrollmentType": "open",
                    "startDate": "2020-12-03",
                    "status": 1
                  },
                  "active": true,
                  "userId": "fd68e72d-b6f7-4d69-b6b5-6009d77f3a95",
                  "issuedCertificates": [],
                  "completionPercentage": null,
                  "courseName": "vk-3.3TrackableETB1",
                  "certificates": [],
                  "completedOn": null,
                  "leafNodesCount": 5,
                  "progress": 0,
                  "status": 0
                },
                {
                  "dateTime": 1610010649284,
                  "lastReadContentStatus": 1,
                  "enrolledDate": "2021-01-07 09:10:49:284+0000",
                  "contentId": "do_213167944330665984186",
                  "description": "Enter description for TextBook",
                  "courseLogoUrl": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_213167944330665984186/artifact/india.thumb.jpg",
                  "batchId": "0131685567521587204",
                  "content": {
                    "trackable": {
                      "enabled": "Yes",
                      "autoBatch": "Yes"
                    },
                    "identifier": "do_213167944330665984186",
                    "orgDetails": {
                      "orgName": "Tamil Nadu",
                      "email": null
                    },
                    "channel": "01269878797503692810",
                    "description": "Enter description for TextBook",
                    "pkgVersion": 1,
                    "objectType": "Content",
                    "appIcon": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_213167944330665984186/artifact/india.thumb.jpg",
                    "primaryCategory": "Digital Textbook",
                    "leafNodesCount": 2,
                    "name": "3.5 AN Trackable Book- Dec",
                    "topic": [
                      "Forces And Motion"
                    ],
                    "contentType": "Course"
                  },
                  "contentStatus": {},
                  "lastReadContentId": "do_2130569893070848001181",
                  "certstatus": null,
                  "courseId": "do_213167944330665984186",
                  "collectionId": "do_213167944330665984186",
                  "addedBy": "3dba1c3b-55f3-42e7-be99-c15f07d0012a",
                  "batch": {
                    "identifier": "0131685567521587204",
                    "endDate": null,
                    "createdBy": "fca2925f-1eee-4654-9177-fece3fd6afc9",
                    "name": "3.5 AN Trackable Book- Dec",
                    "batchId": "0131685567521587204",
                    "enrollmentType": "open",
                    "startDate": "2020-12-09",
                    "status": 1
                  },
                  "active": true,
                  "userId": "fd68e72d-b6f7-4d69-b6b5-6009d77f3a95",
                  "issuedCertificates": [],
                  "completionPercentage": null,
                  "courseName": "3.5 AN Trackable Book- Dec",
                  "certificates": [],
                  "completedOn": null,
                  "leafNodesCount": 2,
                  "progress": 0,
                  "status": 0
                },
                {
                  "dateTime": 1610010628871,
                  "lastReadContentStatus": null,
                  "enrolledDate": "2021-01-07 09:10:28:871+0000",
                  "contentId": "do_2131586284437340161213",
                  "description": "Enter description for TextBook",
                  "courseLogoUrl": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_2131586284437340161213/artifact/india.thumb.jpg",
                  "batchId": "01315865444433920019",
                  "content": {
                    "trackable": {
                      "enabled": "Yes",
                      "autoBatch": "Yes"
                    },
                    "identifier": "do_2131586284437340161213",
                    "orgDetails": {
                      "orgName": "Tamil Nadu",
                      "email": null
                    },
                    "channel": "01269878797503692810",
                    "description": "Enter description for TextBook",
                    "pkgVersion": 1,
                    "objectType": "Content",
                    "appIcon": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_2131586284437340161213/artifact/india.thumb.jpg",
                    "primaryCategory": "Digital Textbook",
                    "leafNodesCount": 2,
                    "name": "3.5 Trackable Book without Certificate",
                    "topic": [
                      "Changes Around Us"
                    ],
                    "contentType": "Course"
                  },
                  "contentStatus": {},
                  "lastReadContentId": null,
                  "certstatus": null,
                  "courseId": "do_2131586284437340161213",
                  "collectionId": "do_2131586284437340161213",
                  "addedBy": "1067d6be-3194-47e0-85bd-5e3c04f81ded",
                  "batch": {
                    "identifier": "01315865444433920019",
                    "endDate": null,
                    "createdBy": "fca2925f-1eee-4654-9177-fece3fd6afc9",
                    "name": "3.5 Trackable Book without Certificate",
                    "batchId": "01315865444433920019",
                    "enrollmentType": "open",
                    "startDate": "2020-11-25",
                    "status": 1
                  },
                  "active": true,
                  "userId": "fd68e72d-b6f7-4d69-b6b5-6009d77f3a95",
                  "issuedCertificates": [],
                  "completionPercentage": null,
                  "courseName": "3.5 Trackable Book without Certificate",
                  "certificates": [],
                  "completedOn": null,
                  "leafNodesCount": 2,
                  "progress": 0,
                  "status": 0
                },
                {
                  "dateTime": 1610010327195,
                  "lastReadContentStatus": null,
                  "enrolledDate": "2021-01-07 09:05:27:195+0000",
                  "contentId": "do_2131586259123404801208",
                  "description": "Enter description for TextBook",
                  "courseLogoUrl": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_2131586259123404801208/artifact/london-bridge.thumb.jpg",
                  "batchId": "01315866091251302420",
                  "content": {
                    "trackable": {
                      "enabled": "Yes",
                      "autoBatch": "Yes"
                    },
                    "identifier": "do_2131586259123404801208",
                    "orgDetails": {
                      "orgName": "Tamil Nadu",
                      "email": null
                    },
                    "channel": "01269878797503692810",
                    "description": "Enter description for TextBook",
                    "pkgVersion": 1,
                    "objectType": "Content",
                    "appIcon": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_2131586259123404801208/artifact/london-bridge.thumb.jpg",
                    "primaryCategory": "Digital Textbook",
                    "leafNodesCount": 1,
                    "name": "3.5 Trackable Book",
                    "topic": [
                      "MY LITTLE PICTIONARY"
                    ],
                    "contentType": "Course"
                  },
                  "contentStatus": {},
                  "lastReadContentId": null,
                  "certstatus": null,
                  "courseId": "do_2131586259123404801208",
                  "collectionId": "do_2131586259123404801208",
                  "addedBy": "174830d2-f78a-4e3a-af20-da45e3e5f1cc",
                  "batch": {
                    "identifier": "01315866091251302420",
                    "endDate": null,
                    "createdBy": "fca2925f-1eee-4654-9177-fece3fd6afc9",
                    "name": "3.5 Trackable Book",
                    "batchId": "01315866091251302420",
                    "enrollmentType": "open",
                    "startDate": "2020-11-25",
                    "status": 1
                  },
                  "active": true,
                  "userId": "fd68e72d-b6f7-4d69-b6b5-6009d77f3a95",
                  "issuedCertificates": [],
                  "completionPercentage": null,
                  "courseName": "3.5 Trackable Book",
                  "certificates": [],
                  "completedOn": null,
                  "leafNodesCount": 1,
                  "progress": 0,
                  "status": 0
                },
                {
                  "dateTime": 1610010681870,
                  "lastReadContentStatus": null,
                  "enrolledDate": "2021-01-07 09:11:21:870+0000",
                  "contentId": "do_213128303767691264111",
                  "description": "Enter description for TextBook",
                  "courseLogoUrl": null,
                  "batchId": "01312830595645440052",
                  "content": {
                    "trackable": {
                      "enabled": "Yes",
                      "autoBatch": "Yes"
                    },
                    "identifier": "do_213128303767691264111",
                    "orgDetails": {
                      "orgName": "Tamil Nadu",
                      "email": null
                    },
                    "primaryCategory": "Digital Textbook",
                    "leafNodesCount": 2,
                    "channel": "01269878797503692810",
                    "name": "vk-3.3TrackableETB-SH-1319",
                    "description": "Enter description for TextBook",
                    "contentType": "TextBook",
                    "pkgVersion": 1,
                    "objectType": "Content"
                  },
                  "contentStatus": {},
                  "lastReadContentId": null,
                  "certstatus": null,
                  "courseId": "do_213128303767691264111",
                  "collectionId": "do_213128303767691264111",
                  "addedBy": "7267c6b2-3516-4d64-8b29-7353e5715b03",
                  "batch": {
                    "identifier": "01312830595645440052",
                    "endDate": null,
                    "createdBy": "fca2925f-1eee-4654-9177-fece3fd6afc9",
                    "name": "vk-3.3TrackableETB-SH-1319",
                    "batchId": "01312830595645440052",
                    "enrollmentType": "open",
                    "startDate": "2020-10-13",
                    "status": 1
                  },
                  "active": true,
                  "userId": "fd68e72d-b6f7-4d69-b6b5-6009d77f3a95",
                  "issuedCertificates": [],
                  "completionPercentage": null,
                  "courseName": "vk-3.3TrackableETB-SH-1319",
                  "certificates": [],
                  "completedOn": null,
                  "leafNodesCount": 2,
                  "progress": 0,
                  "status": 0
                }
              ]
            }
          ]
        },
        "dataSrc": {
          "name": "TRACKABLE_CONTENTS"
        },
        "theme": {
          "component": "sb-course-cards-hlist",
          "inputs": {
            "type": "my_course_recently_viewed_card_grid",
            "hideProgress": true,
            "viewMoreButtonText": "{\"en\":\"View all\"}",
            "maxCardCount": 10,
            "viewMoreButtonPosition": "right"
          }
        }
      },
      {
        "title": "{\"en\":\"Browse by subject\"}",
        "data": [
          {
            "facet": "physical education",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "physical education"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "german",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "german"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "fisheries and aquaculture",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "fisheries and aquaculture"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "information technology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "information technology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "iii language hindi",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "iii language hindi"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "english grammar",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "english grammar"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "skills",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "skills"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "physical health and education",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "physical health and education"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "hospital management",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "hospital management"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "meitei( manipuri )",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "meitei( manipuri )"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "geography",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "geography"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "english",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "english"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "moya",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "moya"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "kokborok",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "kokborok"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "book keeping",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "book keeping"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "nepali",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "nepali"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "health & beauty studies",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "health & beauty studies"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "enlish",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "enlish"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "business studies",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "business studies"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "home science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "home science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "pisa",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "pisa"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "bsg",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "bsg"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "life science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "life science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "art and architecture",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "art and architecture"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "nyks",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "nyks"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "english workbook",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "english workbook"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "business maths",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "business maths"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "social science i",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "social science i"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "maths",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "maths"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "maharashtri prakrut",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "maharashtri prakrut"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "gujarati",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "gujarati"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "algebra",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "algebra"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "accountancy volume 2",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "accountancy volume 2"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "accountancy volume 1",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "accountancy volume 1"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "sanskrit workbook",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "sanskrit workbook"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "accountancy and auditing",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "accountancy and auditing"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "mil",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "mil"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "tamil",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "tamil"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "computer science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "computer science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "assamese (angkuran)",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "assamese (angkuran)"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "bengali",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "bengali"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "education science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "education science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "food science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "food science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "odia language",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "odia language"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "home management",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "home management"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "chemistry",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "chemistry"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "advance tamil",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "advance tamil"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "district geography",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "district geography"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "mohfw",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "mohfw"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "aarogya-v-sharirik shikshan",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "aarogya-v-sharirik shikshan"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "social science ii",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "social science ii"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "computer technology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "computer technology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "textiles and dress designing",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "textiles and dress designing"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "machine learning",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "machine learning"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "sahakar",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "sahakar"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "assamese",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "assamese"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "agricultural science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "agricultural science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "ethics indian culture",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "ethics indian culture"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "sanskrit",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "sanskrit"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "geometry",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "geometry"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "urdu zuban",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "urdu zuban"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "cost accounting and taxation",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "cost accounting and taxation"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "language",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "language"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "hist & civics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "hist & civics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "ethics and indian culture",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "ethics and indian culture"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "horticulture",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "horticulture"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "information and communication technology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "information and communication technology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "political science/civics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "political science/civics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "political scince",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "political scince"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "secretarial practices",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "secretarial practices"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "1st language kannada",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "1st language kannada"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "ethics and indian culture volume ii",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "ethics and indian culture volume ii"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "programming",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "programming"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "others",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "others"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "environment and sustainable development",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "environment and sustainable development"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "accountancy auditing",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "accountancy auditing"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "hindi grammar",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "hindi grammar"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "nutrition dietetics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "nutrition dietetics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "social science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "social science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "bio chemistry",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "bio chemistry"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "yuvakbharati",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "yuvakbharati"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "graphics design",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "graphics design"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "sindhi",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "sindhi"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "nutrition dietics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "nutrition dietics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "accountancy",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "accountancy"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "animal science and technology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "animal science and technology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "agriculture sci. & tech.",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "agriculture sci. & tech."
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "animal science & technology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "animal science & technology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "auto mechanic",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "auto mechanic"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "fine arts",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "fine arts"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "training",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "training"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "commerce",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "commerce"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "self development",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "self development"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "agriculture",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "agriculture"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "marathi",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "marathi"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "psychology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "psychology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "basic electronics engineering",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "basic electronics engineering"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "spanish",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "spanish"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "punjabi",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "punjabi"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "microbiology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "microbiology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "maths part - 2 commerce",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "maths part - 2 commerce"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "odia grammer",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "odia grammer"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "biological science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "biological science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "supplementary reader- hindi",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "supplementary reader- hindi"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "chemical technology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "chemical technology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "chini",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "chini"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "advanced tamil",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "advanced tamil"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "general science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "general science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "maths part - 1 art & science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "maths part - 1 art & science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "physical science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "physical science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "physical and health education",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "physical and health education"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "defence studies",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "defence studies"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "alhad",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "alhad"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "khel aur swasthya",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "khel aur swasthya"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "textile technology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "textile technology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "urdu language",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "urdu language"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "basic mechanical engineering",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "basic mechanical engineering"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "i language kannada",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "i language kannada"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "maths part - 1 commerce",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "maths part - 1 commerce"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "french",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "french"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "biology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "biology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "civics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "civics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "ghazals",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "ghazals"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "geography & economics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "geography & economics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "malayalam (bt)",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "malayalam (bt)"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "philosophy",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "philosophy"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "office management and secretaryship",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "office management and secretaryship"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "nursing core",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "nursing core"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "food service mangement",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "food service mangement"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "hindi",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "hindi"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "basic automobile engineering",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "basic automobile engineering"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "entrepreneurship mindset curriculum ",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "entrepreneurship mindset curriculum "
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "math",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "math"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "ii language english",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "ii language english"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "other",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "other"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "odiya grammar",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "odiya grammar"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "democratic politics-i",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "democratic politics-i"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "basic civil engineering",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "basic civil engineering"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "botany",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "botany"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "child development",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "child development"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "kannada",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "kannada"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "environment & sustainable development",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "environment & sustainable development"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "tourism and travel management",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "tourism and travel management"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "plastic technology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "plastic technology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "ncc",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "ncc"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "nss",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "nss"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "japani",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "japani"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "khelu karu shiku",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "khelu karu shiku"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "ardhamagadhi prakrut",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "ardhamagadhi prakrut"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "cpse",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "cpse"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "computer",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "computer"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "food management",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "food management"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "english reader",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "english reader"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "physics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "physics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "evs part 1",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "evs part 1"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "nutrition and dietetics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "nutrition and dietetics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "evs part 2",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "evs part 2"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "micro biology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "micro biology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "health and physical education",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "health and physical education"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "ircs",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "ircs"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "general volunteer",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "general volunteer"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "environmental science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "environmental science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "griha shilpa",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "griha shilpa"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "granthalay",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "granthalay"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "maths part - 2 art & science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "maths part - 2 art & science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "business mathematics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "business mathematics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "statistics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "statistics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "basic electrical engineering",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "basic electrical engineering"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "aloko",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "aloko"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "nutrition diabetics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "nutrition diabetics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "textiles science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "textiles science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "textile & dress designing",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "textile & dress designing"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "history & civics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "history & civics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "sanskrit grammar",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "sanskrit grammar"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "nursing",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "nursing"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "rashiyan",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "rashiyan"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "general nursing",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "general nursing"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "o. c. m.",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "o. c. m."
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "bio-zoology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "bio-zoology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "standard 12 computer science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "standard 12 computer science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "textiles and designing",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "textiles and designing"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "scout guide shiksha",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "scout guide shiksha"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "environmental study",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "environmental study"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "health and beauty studies",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "health and beauty studies"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "telugu",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "telugu"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "odia",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "odia"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "communicative english",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "communicative english"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "secretarial practice ( s. p. )",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "secretarial practice ( s. p. )"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "parsi language",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "parsi language"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "gulha-a-farsi",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "gulha-a-farsi"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "history",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "history"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "political science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "political science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "fashion technology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "fashion technology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "social studies",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "social studies"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "logic science",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "logic science"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "mathematics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "mathematics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "sociology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "sociology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "krishi vigyan",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "krishi vigyan"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "food service management",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "food service management"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "hidayatul arabia",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "hidayatul arabia"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "malayalam",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "malayalam"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "urdu",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "urdu"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "ayush",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "ayush"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "environmental studies",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "environmental studies"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "mizo",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "mizo"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "sanskrit language",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "sanskrit language"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "evs",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "evs"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "malayalam (at)",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "malayalam (at)"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "history and civics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "history and civics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "social",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "social"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "graphic design",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "graphic design"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "nursing vocational",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "nursing vocational"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "basic civil engineering - practical",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "basic civil engineering - practical"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "economics",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "economics"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "computer applications",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "computer applications"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "bio-botany",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "bio-botany"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "zoology",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "zoology"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          },
          {
            "facet": "konkani",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "subject"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "subject": [
                "konkani"
              ]
            },
            "aggregate": {
              "groupBy": "primaryCategory"
            }
          }
        ],
        "dataSrc": {
          "name": "CONTENT_FACETS",
          "facet": "subject",
          "aggregate": {
            "groupBy": "primaryCategory"
          }
        },
        "theme": {
          "component": "sb-pills-grid",
          "inputs": {
            "pillShape": "default",
            "pillsViewType": "scroll",
            "minDisplayCount": 10,
            "showMoreViewType": "new_screen",
            "viewMoreText": "{\"en\":\"View all subjects\"}",
            "viewLessText": "{\"en\":\"View Less\"}",
            "pillsMultiRow": "double_view_column"
          }
        }
      },
      {
        "title": "{\"en\":\"Browse by category\"}",
        "data": [
          {
            "facet": "template",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "template"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "explanation content",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "explanation content"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "learning resource",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "learning resource"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "textbook unit",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "textbook unit"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "etextbook",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "etextbook"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "practice question set",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "practice question set"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "digital textbook",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "digital textbook"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "course assessment",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "course assessment"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "plugin",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "plugin"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "content playlist",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "content playlist"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "certificate template",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "certificate template"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "course",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "course"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "asset",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "asset"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "course unit",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "course unit"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "teacher resource",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "teacher resource"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          },
          {
            "facet": "lesson plan unit",
            "searchCriteria": {
              "offset": 0,
              "limit": 0,
              "mode": "soft",
              "facets": [
                "primaryCategory"
              ],
              "board": [
                "cbse"
              ],
              "medium": [
                "hindi",
                "english"
              ],
              "grade": [
                "class2",
                "class3",
                "class4"
              ],
              "searchType": "search",
              "primaryCategory": [
                "lesson plan unit"
              ]
            },
            "aggregate": {
              "groupBy": "subject"
            }
          }
        ],
        "dataSrc": {
          "name": "CONTENT_FACETS",
          "facet": "primaryCategory",
          "aggregate": {
            "groupBy": "subject"
          }
        },
        "theme": {
          "component": "sb-pills-grid",
          "inputs": {
            "pillShape": "image_overlap",
            "pillsViewType": "scroll"
          }
        }
      },
      {
        "title": "{\"en\":\"Recently viewed\"}",
        "data": {
          "name": "3",
          "sections": [
            {
              "name": "3",
              "count": 3,
              "contents": [
                {
                  "identifier": "do_31238576627803750422667",
                  "name": "157-T3L1SA1",
                  "contentData": {
                    "ownershipType": [
                      "createdBy"
                    ],
                    "copyright": "Tamilnadu",
                    "previewUrl": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/ecml/do_31238576627803750422667-latest",
                    "keywords": [
                      "Worksheet"
                    ],
                    "subject": [
                      "Tamil"
                    ],
                    "channel": "01235953109336064029450",
                    "downloadUrl": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/ecar_files/do_31238576627803750422667/157-t3l1sa1_1530902311533_do_31238576627803750422667_2.0.ecar",
                    "language": [
                      "Tamil"
                    ],
                    "mimeType": "application/vnd.ekstep.ecml-archive",
                    "variants": {
                      "spine": {
                        "ecarUrl": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/ecar_files/do_31238576627803750422667/157-t3l1sa1_1530902311692_do_31238576627803750422667_2.0_spine.ecar",
                        "size": 22816
                      }
                    },
                    "objectType": "Content",
                    "gradeLevel": [
                      "Class 3"
                    ],
                    "appIcon": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/do_31238576627803750422667/artifact/code_1511692541774.thumb.jpg",
                    "primaryCategory": "Learning Resource",
                    "collections": [
                      {
                        "identifier": "do_31242614246744064023552",
                        "name": "Course 25 2",
                        "description": "Test Description",
                        "objectType": "Collection",
                        "relation": "hasSequenceMember",
                        "status": "Retired"
                      },
                      {
                        "identifier": "do_31237864210493440011627",
                        "name": "157-T3L1SA2",
                        "description": "157 TAMIL CLASS 3 LESSON 1 STUDENT ACTIVITY 2",
                        "objectType": "Collection",
                        "relation": "hasSequenceMember",
                        "status": "Live"
                      }
                    ],
                    "appId": "prod.diksha.portal",
                    "contentEncoding": "gzip",
                    "artifactUrl": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/do_31238576627803750422667/artifact/1511934720601_do_31238576627803750422667.zip",
                    "sYS_INTERNAL_LAST_UPDATED_ON": "2018-10-17T10:52:57.817+0000",
                    "contentType": "Resource",
                    "identifier": "do_31238576627803750422667",
                    "lastUpdatedBy": "6628a4df-ceb2-47b4-954e-a77fceea4ac4",
                    "audience": [
                      "Student"
                    ],
                    "visibility": "Default",
                    "author": "Tamilnadu",
                    "consumerId": "150610ca-4ffb-4e0a-b4ef-c1305e9100d5",
                    "mediaType": "content",
                    "osId": "org.ekstep.quiz.app",
                    "languageCode": [
                      "ta"
                    ],
                    "lastPublishedBy": "6628a4df-ceb2-47b4-954e-a77fceea4ac4",
                    "version": 2,
                    "license": "CC BY 4.0",
                    "prevState": "Live",
                    "size": 77106,
                    "lastPublishedOn": "2018-07-06T18:38:31.533+0000",
                    "concepts": [
                      {
                        "identifier": "LO50",
                        "name": "Synonyms & Antonyms",
                        "description": "Synonyms & Antonyms",
                        "objectType": "Concept",
                        "relation": "associatedTo",
                        "status": "Live"
                      }
                    ],
                    "name": "157-T3L1SA1",
                    "status": "Live",
                    "code": "org.sunbird.ksEy0n",
                    "description": "157-T3L1SA1",
                    "streamingUrl": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/ecml/do_31238576627803750422667-latest",
                    "posterImage": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/do_31238378528853196822330/artifact/code_1511692541774.jpg",
                    "idealScreenSize": "normal",
                    "createdOn": "2017-11-29T05:46:00.112+0000",
                    "copyrightYear": 2019,
                    "contentDisposition": "inline",
                    "lastUpdatedOn": "2018-07-06T18:38:31.360+0000",
                    "createdFor": [
                      "01236114616673894486902",
                      "01235953109336064029450"
                    ],
                    "creator": "JaganathanR",
                    "os": [
                      "All"
                    ],
                    "pkgVersion": 2,
                    "versionKey": "1530902311360",
                    "idealScreenDensity": "hdpi",
                    "framework": "NCF",
                    "s3Key": "ecar_files/do_31238576627803750422667/157-t3l1sa1_1530902311533_do_31238576627803750422667_2.0.ecar",
                    "lastSubmittedOn": "2017-11-29T05:48:48.230+0000",
                    "createdBy": "3f5a846d-8981-4bd8-9130-92e0093b9b6e",
                    "compatibilityLevel": 2,
                    "board": "State (Tamil Nadu)",
                    "resourceType": "Practice",
                    "licenseDetails": {
                      "name": "CC BY 4.0",
                      "url": "https://creativecommons.org/licenses/by/4.0/legalcode",
                      "description": "For details see below:"
                    },
                    "trackable": {
                      "enabled": "No"
                    },
                    "cardImg": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/do_31238576627803750422667/artifact/code_1511692541774.thumb.jpg"
                  },
                  "isUpdateAvailable": false,
                  "mimeType": "application/vnd.ekstep.ecml-archive",
                  "basePath": "/storage/emulated/0/Android/data/org.sunbird.app.staging/files/content/do_31238576627803750422667/",
                  "primaryCategory": "learning resource",
                  "contentType": "resource",
                  "isAvailableLocally": false,
                  "referenceCount": 1,
                  "sizeOnDevice": 2721,
                  "lastUsedTime": 1610076045010,
                  "lastUpdatedTime": 1610010290000
                },
                {
                  "identifier": "do_2130569893070848001181",
                  "name": "4July Self asses",
                  "contentData": {
                    "ownershipType": [
                      "createdBy"
                    ],
                    "copyright": "Tamil Nadu",
                    "previewUrl": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/ecml/do_2130569893070848001181-latest",
                    "plugins": [
                      {
                        "identifier": "org.ekstep.stage",
                        "semanticVersion": "1.0"
                      },
                      {
                        "identifier": "org.ekstep.questionset",
                        "semanticVersion": "1.0"
                      },
                      {
                        "identifier": "org.ekstep.navigation",
                        "semanticVersion": "1.0"
                      },
                      {
                        "identifier": "org.ekstep.questionset.quiz",
                        "semanticVersion": "1.0"
                      },
                      {
                        "identifier": "org.ekstep.iterator",
                        "semanticVersion": "1.0"
                      },
                      {
                        "identifier": "org.ekstep.questionunit",
                        "semanticVersion": "1.2"
                      },
                      {
                        "identifier": "org.ekstep.questionunit.reorder",
                        "semanticVersion": "1.1"
                      },
                      {
                        "identifier": "org.ekstep.questionunit.mcq",
                        "semanticVersion": "1.3"
                      },
                      {
                        "identifier": "org.ekstep.questionunit.sequence",
                        "semanticVersion": "1.1"
                      },
                      {
                        "identifier": "org.ekstep.summary",
                        "semanticVersion": "1.0"
                      }
                    ],
                    "subject": [
                      "Science"
                    ],
                    "channel": "01269878797503692810",
                    "downloadUrl": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/ecar_files/do_2130569893070848001181/4july-self-asses_1593870979829_do_2130569893070848001181_1.0.ecar",
                    "questions": [
                      {
                        "identifier": "do_2130554591852789761345",
                        "name": "Arrange the given words in proper order to form a sentence.",
                        "description": null,
                        "objectType": "AssessmentItem",
                        "relation": "associatedTo",
                        "status": "Live"
                      },
                      {
                        "identifier": "do_2130555219171491841363",
                        "name": "Arrange in Sequence- Layout 2",
                        "description": "test",
                        "objectType": "AssessmentItem",
                        "relation": "associatedTo",
                        "status": "Live"
                      },
                      {
                        "identifier": "do_2130555217519902721362",
                        "name": "Arrange in Sequence- Layout 1",
                        "description": "test",
                        "objectType": "AssessmentItem",
                        "relation": "associatedTo",
                        "status": "Live"
                      },
                      {
                        "identifier": "do_2130554586453934081343",
                        "name": "hi how are you\n",
                        "description": null,
                        "objectType": "AssessmentItem",
                        "relation": "associatedTo",
                        "status": "Live"
                      }
                    ],
                    "organisation": [
                      "Tamil Nadu"
                    ],
                    "language": [
                      "English"
                    ],
                    "mimeType": "application/vnd.ekstep.ecml-archive",
                    "variants": {
                      "spine": {
                        "ecarUrl": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/ecar_files/do_2130569893070848001181/4july-self-asses_1593870979965_do_2130569893070848001181_1.0_spine.ecar",
                        "size": 17284
                      }
                    },
                    "editorState": "{\"plugin\":{\"noOfExtPlugins\":12,\"extPlugins\":[{\"plugin\":\"org.ekstep.contenteditorfunctions\",\"version\":\"1.2\"},{\"plugin\":\"org.ekstep.keyboardshortcuts\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.richtext\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.iterator\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.navigation\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.reviewercomments\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.questionunit.mtf\",\"version\":\"1.2\"},{\"plugin\":\"org.ekstep.questionunit.mcq\",\"version\":\"1.3\"},{\"plugin\":\"org.ekstep.keyboard\",\"version\":\"1.1\"},{\"plugin\":\"org.ekstep.questionunit.reorder\",\"version\":\"1.1\"},{\"plugin\":\"org.ekstep.questionunit.sequence\",\"version\":\"1.1\"},{\"plugin\":\"org.ekstep.questionunit.ftb\",\"version\":\"1.1\"}]},\"stage\":{\"noOfStages\":1,\"currentStage\":\"ceb0bb39-7ed6-45cb-9e8a-319d11bec749\",\"selectedPluginObject\":\"1e479e70-85c3-4369-8e96-c93626b8da19\"},\"sidebar\":{\"selectedMenu\":\"settings\"}}",
                    "objectType": "Content",
                    "gradeLevel": [
                      "Class 4"
                    ],
                    "appIcon": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_2130569893070848001181/artifact/class-5.thumb.png",
                    "primaryCategory": "Course Assessment",
                    "collections": [
                      {
                        "identifier": "do_21306327104475136013177",
                        "name": "umesh sanity course",
                        "description": "Test",
                        "objectType": "Collection",
                        "relation": "hasSequenceMember",
                        "status": "Live"
                      },
                      {
                        "identifier": "do_21306115427591782412824",
                        "name": "Course test 1 - 0710",
                        "description": "Course test 1 - 0710 description test",
                        "objectType": "Collection",
                        "relation": "hasSequenceMember",
                        "status": "Live"
                      },
                      {
                        "identifier": "do_2130569914095452161188",
                        "name": "4July Self Asses course",
                        "description": "Enter description for Course",
                        "objectType": "Collection",
                        "relation": "hasSequenceMember",
                        "status": "Live"
                      }
                    ],
                    "appId": "preprod.diksha.portal",
                    "contentEncoding": "gzip",
                    "artifactUrl": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_2130569893070848001181/artifact/1593870979657_do_2130569893070848001181.zip",
                    "lockKey": "d450f2da-4cdf-46f7-b7b3-a0f27be5c191",
                    "sYS_INTERNAL_LAST_UPDATED_ON": "2020-07-04T13:56:21.057+0000",
                    "contentType": "SelfAssess",
                    "identifier": "do_2130569893070848001181",
                    "lastUpdatedBy": "4cd4c690-eab6-4938-855a-447c7b1b8ea9",
                    "audience": [
                      "Teacher"
                    ],
                    "visibility": "Default",
                    "consumerId": "2eaff3db-cdd1-42e5-a611-bebbf906e6cf",
                    "mediaType": "content",
                    "osId": "org.ekstep.quiz.app",
                    "languageCode": [
                      "en"
                    ],
                    "lastPublishedBy": "08631a74-4b94-4cf7-a818-831135248a4a",
                    "version": 2,
                    "license": "CC BY-NC 4.0",
                    "prevState": "Review",
                    "size": 296192,
                    "lastPublishedOn": "2020-07-04T13:56:19.821+0000",
                    "name": "4July Self asses",
                    "status": "Live",
                    "totalQuestions": 4,
                    "code": "org.sunbird.nifnXe",
                    "prevStatus": "Processing",
                    "description": "Enter description for Assessment",
                    "streamingUrl": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/ecml/do_2130569893070848001181-latest",
                    "medium": [
                      "English"
                    ],
                    "posterImage": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_2130364729883197441220/artifact/class-5.png",
                    "idealScreenSize": "normal",
                    "createdOn": "2020-07-04T13:52:45.026+0000",
                    "copyrightYear": 2020,
                    "contentDisposition": "inline",
                    "licenseterms": "By creating any type of content (resources, books, courses etc.) on DIKSHA, you consent to publish it under the Creative Commons License Framework. Please choose the applicable creative commons license you wish to apply to your content.",
                    "lastUpdatedOn": "2020-07-04T13:56:17.871+0000",
                    "dialcodeRequired": "No",
                    "lastStatusChangedOn": "2020-07-04T13:56:21.048+0000",
                    "createdFor": [
                      "01269878797503692810"
                    ],
                    "creator": "Content_creator_TN",
                    "os": [
                      "All"
                    ],
                    "totalScore": 4,
                    "pkgVersion": 1,
                    "versionKey": "1593870977871",
                    "idealScreenDensity": "hdpi",
                    "framework": "tn_k-12_5",
                    "s3Key": "ecar_files/do_2130569893070848001181/4july-self-asses_1593870979829_do_2130569893070848001181_1.0.ecar",
                    "lastSubmittedOn": "2020-07-04T13:54:42.978+0000",
                    "createdBy": "4cd4c690-eab6-4938-855a-447c7b1b8ea9",
                    "compatibilityLevel": 2,
                    "board": "State (Tamil Nadu)",
                    "licenseDetails": {
                      "name": "CC BY-NC 4.0",
                      "url": "https://creativecommons.org/licenses/by-nc/4.0/legalcode",
                      "description": "For details see below:"
                    },
                    "trackable": {
                      "enabled": "No"
                    },
                    "cardImg": "https://sunbirdstagingpublic.blob.core.windows.net/sunbird-content-staging/content/do_2130569893070848001181/artifact/class-5.thumb.png"
                  },
                  "isUpdateAvailable": false,
                  "mimeType": "application/vnd.ekstep.ecml-archive",
                  "basePath": "/storage/emulated/0/Android/data/org.sunbird.app.staging/files/content/do_2130569893070848001181/",
                  "primaryCategory": "course assessment",
                  "contentType": "selfassess",
                  "isAvailableLocally": false,
                  "referenceCount": 1,
                  "sizeOnDevice": 3979,
                  "lastUsedTime": 1610019335972,
                  "lastUpdatedTime": 1610010647000
                },
                {
                  "identifier": "do_31243477011023462414423",
                  "name": "E3TTM1",
                  "contentData": {
                    "ownershipType": [
                      "createdBy"
                    ],
                    "copyright": "Tamilnadu",
                    "previewUrl": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/html/do_31243477011023462414423-latest",
                    "keywords": [
                      "E-resources for Professional Development"
                    ],
                    "subject": [
                      "Tamil"
                    ],
                    "channel": "01235953109336064029450",
                    "downloadUrl": "https://ntpproductionall.blob.core.windows.net/ntp-content-production/ecar_files/do_31243477011023462414423/e3ttm1_1530906385784_do_31243477011023462414423_2.0.ecar",
                    "showNotification": true,
                    "language": [
                      "Tamil"
                    ],
                    "mimeType": "application/vnd.ekstep.html-archive",
                    "variants": {
                      "spine": {
                        "ecarUrl": "https://ntpproductionall.blob.core.windows.net/ntp-content-production/ecar_files/do_31243477011023462414423/e3ttm1_1530906385885_do_31243477011023462414423_2.0_spine.ecar",
                        "size": 99826
                      }
                    },
                    "objectType": "Content",
                    "gradeLevel": [
                      "Class 3"
                    ],
                    "appIcon": "https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31243477011023462414423/artifact/lesson-plan_1517916340565.thumb.jpg",
                    "primaryCategory": "Learning Resource",
                    "collections": [
                      {
                        "identifier": "do_3124161821978050561801",
                        "name": "E3TTM1",
                        "description": "E3TTM1",
                        "objectType": "Collection",
                        "relation": "hasSequenceMember",
                        "status": "Live"
                      }
                    ],
                    "appId": "prod.diksha.portal",
                    "contentEncoding": "gzip",
                    "artifactUrl": "https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31243477011023462414423/artifact/e3ttm1_1517916273782.zip",
                    "sYS_INTERNAL_LAST_UPDATED_ON": "2018-10-14T13:19:22.974+0000",
                    "contentType": "Resource",
                    "identifier": "do_31243477011023462414423",
                    "lastUpdatedBy": "cc686b9a-df55-4142-96ae-632e355c80c5",
                    "audience": [
                      "Teacher"
                    ],
                    "visibility": "Default",
                    "author": "Tamilnadu",
                    "consumerId": "150610ca-4ffb-4e0a-b4ef-c1305e9100d5",
                    "mediaType": "content",
                    "osId": "org.ekstep.quiz.app",
                    "languageCode": [
                      "ta"
                    ],
                    "lastPublishedBy": "cc686b9a-df55-4142-96ae-632e355c80c5",
                    "license": "CC BY 4.0",
                    "prevState": "Live",
                    "size": 101051,
                    "lastPublishedOn": "2018-07-06T19:46:25.784+0000",
                    "concepts": [
                      {
                        "identifier": "BED20000",
                        "name": "Enhancing_Professional_Capacities",
                        "description": null,
                        "objectType": "Concept",
                        "relation": "associatedTo",
                        "status": "Live"
                      },
                      {
                        "identifier": "BED30000",
                        "name": "Perspectives_in_Education",
                        "description": null,
                        "objectType": "Concept",
                        "relation": "associatedTo",
                        "status": "Live"
                      }
                    ],
                    "name": "E3TTM1",
                    "status": "Live",
                    "code": "ba721c63-0b03-42e8-81a8-7c7c6a038ae4",
                    "description": "E3TTM1",
                    "streamingUrl": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/html/do_31243477011023462414423-latest",
                    "posterImage": "https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31243477065982771214425/artifact/lesson-plan_1517916340565.jpg",
                    "idealScreenSize": "normal",
                    "createdOn": "2018-02-06T11:24:33.222+0000",
                    "copyrightYear": 2019,
                    "contentDisposition": "inline",
                    "lastUpdatedOn": "2018-07-06T19:46:25.535+0000",
                    "createdFor": [
                      "01235953109336064029450"
                    ],
                    "creator": "Class 1 Tamil",
                    "os": [
                      "All"
                    ],
                    "pkgVersion": 2,
                    "versionKey": "1530906385535",
                    "idealScreenDensity": "hdpi",
                    "framework": "NCF",
                    "s3Key": "ecar_files/do_31243477011023462414423/e3ttm1_1530906385784_do_31243477011023462414423_2.0.ecar",
                    "lastSubmittedOn": "2018-02-06T11:25:44.871+0000",
                    "createdBy": "a9322c89-7225-4b31-ba28-bf897a70c7ed",
                    "compatibilityLevel": 1,
                    "board": "State (Tamil Nadu)",
                    "resourceType": "Teach",
                    "licenseDetails": {
                      "name": "CC BY 4.0",
                      "url": "https://creativecommons.org/licenses/by/4.0/legalcode",
                      "description": "For details see below:"
                    },
                    "trackable": {
                      "enabled": "No"
                    },
                    "cardImg": "https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31243477011023462414423/artifact/lesson-plan_1517916340565.thumb.jpg"
                  },
                  "isUpdateAvailable": false,
                  "mimeType": "application/vnd.ekstep.html-archive",
                  "basePath": "/storage/emulated/0/Android/data/org.sunbird.app.staging/files/content/do_31243477011023462414423/",
                  "primaryCategory": "learning resource",
                  "contentType": "resource",
                  "isAvailableLocally": false,
                  "referenceCount": 1,
                  "sizeOnDevice": 2774,
                  "lastUsedTime": 1610019237638,
                  "lastUpdatedTime": 1610010290000
                }
              ]
            }
          ]
        },
        "dataSrc": {
          "name": "RECENTLY_VIEWED_CONTENTS"
        },
        "theme": {
          "component": "sb-library-cards-hlist",
          "inputs": {
            "type": "mobile_textbook",
            "viewMoreButtonText": "{\"en\":\"View all\"}",
            "maxCardCount": 10,
            "viewMoreButtonPosition": "right"
          }
        }
      }
    ]
    displayItems = this.mapContentFacteTheme(displayItems);
    this.displaySections = displayItems;
  }

  handlePillSelect(event) {
    if (!event || !event.data || !event.data.length) {
      return;
    }
    const params = {
      formField: event.data[0].value
    };
    this.router.navigate([RouterLinks.CATEGORY_LIST], { state: params });
  }

  navigateToViewMoreContentsPage(section, pageName?) {
    const params: NavigationExtras = {
      state: {
        requestParams: {
          request: section.searchRequest
        },
        headerTitle: this.commonUtilService.getTranslatedValue(section.title, ''),
        pageName
      }
    };
    this.router.navigate([RouterLinks.VIEW_MORE_ACTIVITY], params);
  }

  navigateToDetailPage(event, sectionName) {
    event.data = event.data.content ? event.data.content : event.data;
    const item = event.data;
    const index = event.index;
    const identifier = item.contentId || item.identifier;
    // const corRelationList = [{ id: sectionName || '', type: CorReleationDataType.SECTION }];
    const values = {};
    values['sectionName'] = sectionName;
    values['positionClicked'] = index;
    // this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
    //   InteractSubtype.CONTENT_CLICKED,
    //   Environment.HOME,
    //   PageId.LIBRARY,
    //   ContentUtil.getTelemetryObject(item),
    //   values,
    //   ContentUtil.generateRollUp(undefined, identifier),
    //   corRelationList);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      this.navService.navigateToDetailPage(item, { content: item }); // TODO
      // this.navService.navigateToDetailPage(item, { content: item, corRelation: corRelationList });
    } else {
      this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI_1');
    }
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'download':
        this.redirectToActivedownloads();
        break;
      case 'notification':
        this.redirectToNotifications();
        break;

      default: console.warn('Use Proper Event name');
    }
  }

  redirectToActivedownloads() {
    // this.telemetryGeneratorService.generateInteractTelemetry(
    //   InteractType.TOUCH,
    //   InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
    //   Environment.HOME,
    //   PageId.LIBRARY);
    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  redirectToNotifications() {
    // this.telemetryGeneratorService.generateInteractTelemetry(
    //   InteractType.TOUCH,
    //   InteractSubtype.NOTIFICATION_CLICKED,
    //   Environment.HOME,
    //   PageId.LIBRARY);
    this.router.navigate([RouterLinks.NOTIFICATION]);
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe('update_header');
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
  }

  ngOnDestroy() {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
  }

  viewPreferenceInfo() {
    this.showPreferenceInfo = !this.showPreferenceInfo;
  }

  async onViewMorePillList(event, title) {
    if (!event || !event.data) {
      return;
    }
    const subjectListPopover = await this.popoverCtrl.create({
      component: SbSubjectListPopupComponent,
      componentProps: {
        subjectList: event.data,
        title: title
      },
      backdropDismiss: true,
      showBackdrop: true,
      cssClass: 'subject-list-popup',
    });
    await subjectListPopover.present();
    const { data } = await subjectListPopover.onDidDismiss();
    this.handlePillSelect(data);
  }

  mapContentFacteTheme(displayItems) {
    if (displayItems && displayItems.length) {
      for (let count = 0; count < displayItems.length; count++){
        if (!displayItems[count].data) {
          continue;
        }
        if (displayItems[count].dataSrc && (displayItems[count].dataSrc.name === 'CONTENT_FACETS') && (displayItems[count].dataSrc.facet === 'subject')) {
          displayItems[count] = this.mapSubjectTheme(displayItems[count]);
        }
        if (displayItems[count].dataSrc && (displayItems[count].dataSrc.name === 'CONTENT_FACETS') && (displayItems[count].dataSrc.facet === 'primaryCategory')) {
          displayItems[count] = this.mapPrimaryCategoryTheme(displayItems[count]);
        }
        if (displayItems[count].dataSrc && displayItems[count].dataSrc.name === 'RECENTLY_VIEWED_CONTENTS') {
          displayItems[count] = this.modifyContentData(displayItems[count]);
        }
      }
    }
    return displayItems;
  }

  mapSubjectTheme(displayItems) {
    displayItems.data.forEach(item => {
      const subjectMap = item.facet && SubjectMapping[item.facet.toLowerCase()] ? SubjectMapping[item.facet.toLowerCase()] : SubjectMapping['default'];
      item.icon = item.icon ? item.icon : subjectMap.icon;
      item.theme = item.theme ? item.theme : subjectMap.theme;
      if (!item.theme) {
        const colorTheme = ColorMapping[Math.floor(Math.random() * ColorMapping.length)];
        item.theme = {
          iconBgColor: colorTheme.primary,
          pillBgColor: colorTheme.secondary
        }
      }
    });
    return displayItems
  }

  mapPrimaryCategoryTheme(displayItems) {
    displayItems.data.forEach(item => {
      const primaryCaregoryMap = item.facet && PrimaryCaregoryMapping[item.facet.toLowerCase()] ? PrimaryCaregoryMapping[item.facet.toLowerCase()] :
        PrimaryCaregoryMapping['default'];
        item.icon = item.icon ? item.icon : primaryCaregoryMap.icon;
    });
    return displayItems
  }

  modifyContentData(displayItems) {
    if (!displayItems.data.sections && !displayItems.data.sections[0] && !displayItems.data.sections[0].contents) {
      return;
    }
    displayItems.data.sections[0].contents.forEach(item => {
      item['cardImg'] = item['cardImg'] || (item.contentData && item.contentData['cardImg']);
      item['subject'] = item['subject'] || (item.contentData && item.contentData['subject']);
      item['gradeLevel'] = item['gradeLevel'] || (item.contentData && item.contentData['gradeLevel']);
      item['medium'] = item['medium'] || (item.contentData && item.contentData['medium']);
      item['organisation'] = item['organisation'] || (item.contentData && item.contentData['organisation']);
      item['badgeAssertions'] = item['badgeAssertions'] || (item.contentData && item.contentData['badgeAssertions']);
      item['resourceType'] = item['resourceType'] || (item.contentData && item.contentData['resourceType']);
    });
    return displayItems
  }

}
