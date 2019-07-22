import { CommonUtilService } from './../../services/common-util.service';
import { Component, Inject, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { AlertController, Events, NavController, NavParams, Platform, PopoverController } from '@ionic/angular';
import { ContentDetailsPage } from '../content-details/content-details.page';
import { EnrolledCourseDetailsPage } from '../enrolled-course-details-page/enrolled-course-details-page';
import { ContentType, MimeType, RouterLinks } from '../../app/app.constant';
import { CollectionDetailsPage } from '../collection-details/collection-details.page';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobalService } from '../../services/app-global-service.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import * as _ from 'lodash';
import { ProfileSettingsPage } from '../profile-settings/profile-settings.page';
import {
  ChildContentRequest,
  Content,
  ContentDetailRequest,
  ContentEventType,
  ContentImport,
  ContentImportRequest,
  ContentImportResponse,
  ContentMarkerRequest,
  ContentService,
  CorrelationData,
  DownloadEventType,
  DownloadProgress,
  EventsBusEvent,
  EventsBusService,
  Framework,
  FrameworkCategoryCodesGroup,
  FrameworkDetailsRequest,
  FrameworkService,
  FrameworkUtilService,
  GetAllProfileRequest,
  GetSuggestedFrameworksRequest,
  MarkerType,
  NetworkError,
  PlayerService,
  Profile,
  ProfileService,
  TelemetryObject
} from 'sunbird-sdk';
import { Subscription } from 'rxjs';
import { Environment, ImpressionType, InteractSubtype, InteractType, PageId } from '../../services/telemetry-constants';
import { TabsPage } from '../tabs/tabs.page';
import { PlayerPage } from '../player/player.page';
import { CanvasPlayerService } from '../../services/canvas-player.service';
import { File } from '@ionic-native/file/ngx';
import { AppHeaderService } from '../../services/app-header.service';
import { CollectionDetailEtbPage } from '../collection-detail-etb/collection-detail-etb.page';
import { Location } from '@angular/common';
import { NavigationExtras, Router } from '@angular/router';
declare const cordova;

@Component({
  selector: 'app-qrcoderesult',
  templateUrl: './qrcoderesult.page.html',
  styleUrls: ['./qrcoderesult.page.scss'],
})
export class QrcoderesultPage implements OnDestroy {

  unregisterBackButton: any;
  /**
   * To hold identifier
   */
  identifier: string;

  /**
   * To hold identifier
   */
  searchIdentifier: string;

  /**
   * Show loader while importing content
   */
  showChildrenLoader: boolean;

  /**
   * Contains card data of previous state
   */
  content: Content;

  /**
   * Contains Parent Content Details
   */
  parentContent: any;

  /**
   * Contains
   */
  isParentContentAvailable = false;
  profile: Profile;

  corRelationList: Array<CorrelationData>;
  shouldGenerateEndTelemetry = false;
  source = '';
  results: Array<any> = [];
  defaultImg: string;
  parents: Array<any> = [];
  paths: Array<any> = [];
  categories: Array<any> = [];
  boardList: Array<any> = [];
  mediumList: Array<any> = [];
  gradeList: Array<any> = [];
  isSingleContent = false;
  showLoading: boolean;
  isDownloadStarted: boolean;
  userCount = 0;
  /**
   * To hold previous state data
   */
  cardData: any;
  // migration-TODO
  // @ViewChild(Navbar) navBar: any;
  downloadProgress: any = 0;
  isUpdateAvailable: boolean;
  eventSubscription: Subscription;
  headerObservable: any;
  navData: any;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    // public navCtrl: NavController,
    // public navParams: NavParams,
    public zone: NgZone,
    public translate: TranslateService,
    public platform: Platform,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private alertCtrl: AlertController,
    public appGlobalService: AppGlobalService,
    private events: Events,
    private popOverCtrl: PopoverController,
    public commonUtilService: CommonUtilService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('PLAYER_SERVICE') private playerService: PlayerService,
    private canvasPlayerService: CanvasPlayerService,
    private location: Location,
    private file: File,
    private headerService: AppHeaderService,
    private router: Router
  ) {
    this.getNavData();
    this.defaultImg = 'assets/imgs/ic_launcher.png';
  }

  getNavData() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.navData = navigation.extras.state;
    }
  }

  /**
   * Ionic life cycle hook
   */
  ionViewWillEnter(): void {
    this.headerService.hideHeader();
    this.content = this.navData.content;
    this.corRelationList = this.navData.corRelation;
    this.shouldGenerateEndTelemetry = this.navData.shouldGenerateEndTelemetry;
    this.source = this.navData.source;
    this.isSingleContent = this.navData.isSingleContent;

    // check for parent content
    this.parentContent = this.navData.parentContent;
    this.searchIdentifier = this.content.identifier;

    if (this.parentContent) {
      this.isParentContentAvailable = true;
      this.identifier = this.parentContent.identifier;
    } else {
      this.isParentContentAvailable = false;
      this.identifier = this.content.identifier;
    }
    this.setContentDetails(this.identifier, true);
    this.getChildContents();
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(11, () => {
      this.handleBackButton(InteractSubtype.DEVICE_BACK_CLICKED);
    });
    this.subscribeSdkEvent();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
  }

  ionViewDidEnter() {
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW, '',
      PageId.DIAL_CODE_SCAN_RESULT,
      !this.appGlobalService.isProfileSettingsCompleted ? Environment.ONBOARDING : this.appGlobalService.getPageIdForTelemetry());
    // // migration-TODO
    // this.navBar.backButtonClick = () => {
    //   this.handleBackButton(InteractSubtype.NAV_BACK_CLICKED);
    // };

    if (!AppGlobalService.isPlayerLaunched) {
      this.calculateAvailableUserCount();
    }
  }


  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    // Unregister the custom back button action for this page
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
    this.downloadProgress = 0;
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  handleBackButton(clickSource) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      clickSource,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT);
    if (this.source === PageId.LIBRARY || this.source === PageId.COURSES || !this.isSingleContent) {
      this.location.back();
    } else if (this.isSingleContent && this.appGlobalService.isProfileSettingsCompleted) {
      const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
      this.router.navigate([`/${RouterLinks.TABS}`], navigationExtras);
    } else if (this.appGlobalService.isGuestUser && this.isSingleContent && !this.appGlobalService.isProfileSettingsCompleted) {
      const navigationExtras: NavigationExtras = { state: { isCreateNavigationStack: false, hideBackButton: true } };
      this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
    } else {

      this.location.back();
    }
  }

  getChildContents() {
    const request: ChildContentRequest = { contentId: this.identifier, hierarchyInfo: [] };
    this.contentService.getChildContents(
      request).toPromise()
      .then((data: Content) => {
        this.parents.splice(0, this.parents.length);
        this.parents.push(data);
        this.results = [];
        this.profile = this.appGlobalService.getCurrentUser();
        const contentData = data.contentData;
        this.checkProfileData(contentData, this.profile);
        this.findContentNode(data);

        if (this.results && this.results.length === 0) {
          this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
            '',
            PageId.DIAL_LINKED_NO_CONTENT,
            Environment.HOME);
          this.commonUtilService.showContentComingSoonAlert(this.source);
          this.location.back();

        }

      })
      .catch(() => {
        this.zone.run(() => {
          this.showChildrenLoader = false;
        });
        this.commonUtilService.showContentComingSoonAlert(this.source);
        this.location.back();

      });

  }

  calculateAvailableUserCount() {
    const profileRequest: GetAllProfileRequest = {
      local: true,
      server: false
    };
    this.profileService.getAllProfiles(profileRequest)
      .map((profiles) => profiles.filter((profile) => !!profile.handle))
      .subscribe(profiles => {
        if (profiles) {
          this.userCount = profiles.length;
        }
        if (this.appGlobalService.isUserLoggedIn()) {
          this.userCount += 1;
        }
      }, () => {
      });
  }

  /**
   * Play content
   */
  playContent(content: Content) {
    const extraInfoMap = { hierarchyInfo: [] };
    if (this.cardData && this.cardData.hierarchyInfo) {
      extraInfoMap.hierarchyInfo = this.cardData.hierarchyInfo;
    }
    const req: ContentMarkerRequest = {
      uid: this.appGlobalService.getCurrentUser().uid,
      contentId: content.identifier,
      data: JSON.stringify(content.contentData),
      marker: MarkerType.PREVIEWED,
      isMarked: true,
      extraInfo: extraInfoMap
    };
    this.contentService.setContentMarker(req).toPromise()
      .then(() => {
      }).catch(() => {
      });
    const request: any = {};
    request.streaming = true;
    AppGlobalService.isPlayerLaunched = true;
    const values = new Map();
    values['isStreaming'] = request.streaming;
    const identifier = content.identifier;
    let telemetryObject: TelemetryObject;
    const objectType = this.telemetryGeneratorService.isCollection(content.mimeType) ? content.contentType : ContentType.RESOURCE;
    telemetryObject = new TelemetryObject(identifier, objectType, undefined);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_PLAY,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT,
      telemetryObject,
      values,
      undefined,
      this.corRelationList);
    this.openPlayer(content, request);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      content.isAvailableLocally ? InteractSubtype.PLAY_FROM_DEVICE : InteractSubtype.PLAY_ONLINE,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : this.appGlobalService.getPageIdForTelemetry(),
      PageId.DIAL_CODE_SCAN_RESULT,
      telemetryObject,
      undefined,
      undefined,
      this.corRelationList);
  }

  playOnline(content) {
    const identifier = content.identifier;
    let telemetryObject: TelemetryObject;
    const objectType = this.telemetryGeneratorService.isCollection(content.mimeType) ? content.contentType : ContentType.RESOURCE;
    telemetryObject = new TelemetryObject(identifier, objectType, undefined);

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT,
      telemetryObject);
    if (content.contentData.streamingUrl && !content.isAvailableLocally) {
      this.playContent(content);
    } else {
      this.navigateToDetailsPage(content);
    }
  }

  navigateToDetailsPage(content) {
    if (content && content.contentData && content.contentData.contentType === ContentType.COURSE) {
      // this.navCtrl.push(EnrolledCourseDetailsPage, {
      //   content: content,
      //   corRelation: this.corRelationList
      // });
    } else if (content && content.mimeType === MimeType.COLLECTION) {
      // this.navCtrl.push(CollectionDetailsEtbPage, {
      //   content: content,
      //   corRelation: this.corRelationList
      // });
    } else {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        Boolean(content.isAvailableLocally) ? InteractSubtype.PLAY_FROM_DEVICE : InteractSubtype.DOWNLOAD_PLAY_CLICKED,
        !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
        PageId.DIAL_CODE_SCAN_RESULT);
      // this.navCtrl.push(ContentDetailsPage, {
      //   content: content,
      //   depth: '1',
      //   isChildContent: true,
      //   downloadAndPlay: true,
      //   corRelation: this.corRelationList
      // });
    }
  }

  editProfile(): void {
    const req: Profile = {
      board: this.profile.board,
      grade: this.profile.grade,
      medium: this.profile.medium,
      subject: this.profile.subject,
      uid: this.profile.uid,
      handle: this.profile.handle,
      profileType: this.profile.profileType,
      source: this.profile.source,
      createdAt: this.profile.createdAt,
      syllabus: this.profile.syllabus
    };
    if (this.profile.grade && this.profile.grade.length > 0) {
      this.profile.grade.forEach(gradeCode => {
        for (let i = 0; i < this.gradeList.length; i++) {
          if (this.gradeList[i].code === gradeCode) {
            req.gradeValue = this.profile.gradeValue;
            req.gradeValue[this.gradeList[i].code] = this.gradeList[i].name;
            break;
          }
        }
      });
    }

    this.profileService.updateProfile(req).toPromise()
      .then((res: any) => {
        if (res.syllabus && res.syllabus.length && res.board && res.board.length
          && res.grade && res.grade.length && res.medium && res.medium.length) {
          this.events.publish(AppGlobalService.USER_INFO_UPDATED);
          this.events.publish('refresh:profile');
        }
        this.appGlobalService.guestUserProfile = res;
        this.telemetryGeneratorService.generateProfilePopulatedTelemetry(PageId.DIAL_CODE_SCAN_RESULT,
          req, 'auto');
      })
      .catch(() => {
      });
  }

  /** funtion add elipses to the texts**/

  addElipsesInLongText(msg: string) {
    if (this.commonUtilService.translateMessage(msg).length >= 12) {
      return this.commonUtilService.translateMessage(msg).slice(0, 8) + '....';
    } else {
      return this.commonUtilService.translateMessage(msg);
    }
  }

  /**
   * To set content details in local variable
   * @param {string} identifier identifier of content / course
   */
  setContentDetails(identifier, refreshContentDetails: boolean) {
    const option: ContentDetailRequest = {
      contentId: identifier,
      attachFeedback: true,
      attachContentAccess: true,
      emitUpdateIfAny: refreshContentDetails
    };
    this.contentService.getContentDetails(option).toPromise()
      .then((data: any) => {
      })
      .catch((error: any) => {
      });
  }

  setGrade(reset, grades) {
    if (reset) {
      this.profile.grade = [];
      this.profile.gradeValue = {};
    }
    _.each(grades, (grade) => {
      if (grade && this.profile.grade.indexOf(grade) === -1) {
        if (this.profile.grade && this.profile.grade.length) {
          this.profile.grade.push(grade);
        } else {
          this.profile.grade = [grade];
        }
      }
    });
  }

  setMedium(reset, mediums) {
    if (reset) {
      this.profile.medium = [];
    }
    _.each(mediums, (medium) => {
      if (medium && this.profile.medium.indexOf(medium) === -1) {
        if (this.profile.medium && this.profile.medium.length) {
          this.profile.medium.push(medium);
        } else {
          this.profile.medium = [medium];
        }
      }
    });
  }

  /**
   * @param categoryList
   * @param data
   * @param categoryType
   * return the code of board,medium and subject based on Name
   */
  findCode(categoryList: Array<any>, data, categoryType) {
    if (_.find(categoryList, (category) => category.name === data[categoryType])) {
      return _.find(categoryList, (category) => category.name === data[categoryType]).code;
    } else {
      return undefined;
    }
  }

  /**
   * Assigning board, medium, grade and subject to profile
   */

  setCurrentProfile(index, data) {
    if (!this.profile.medium || !this.profile.medium.length) {
      this.profile.medium = [];
    }
    /*     if (!this.profile.subject || !this.profile.subject.length) {
          this.profile.subject = [];
        }
     */
    switch (index) {
      case 0:
        this.profile.syllabus = [data.framework];
        this.profile.board = [data.board];
        this.setMedium(true, data.medium);
        // this.profile.subject = [data.subject];
        this.profile.subject = [];
        this.setGrade(true, data.gradeLevel);
        break;
      case 1:
        this.profile.board = [data.board];
        this.setMedium(true, data.medium);
        // this.profile.subject = [data.subject];
        this.profile.subject = [];
        this.setGrade(true, data.gradeLevel);
        break;
      case 2:
        this.setMedium(false, data.medium);
        break;
      case 3:
        this.setGrade(false, data.gradeLevel);
        break;
      /*       case 4:
              this.profile.subject.push(data.subject);
              break;
       */
    }
    this.editProfile();
  }

  /**
   * comparing current profile data with qr result data, If not matching then reset current profile data
   * @param {object} data
   * @param {object} profile
   */
  checkProfileData(data, profile) {

    if (data && data.framework) {

      const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
        language: this.translate.currentLang,
        requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
      };
      // Auto update the profile if that board/framework is listed in custodian framework list.
      this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
        .then((res: Framework[]) => {
          let isProfileUpdated = false;
          res.forEach(element => {
            // checking whether content data framework Id exists/valid in syllabus list
            if (data.framework === element.identifier || data.board.indexOf(element.name) !== -1) {
              isProfileUpdated = true;
              const frameworkDetailsRequest: FrameworkDetailsRequest = {
                frameworkId: data.framework,
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
              };
              this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
                .then((framework: Framework) => {
                  this.categories = framework.categories;
                  this.boardList = _.find(this.categories, (category) => category.code === 'board').terms;
                  this.mediumList = _.find(this.categories, (category) => category.code === 'medium').terms;
                  this.gradeList = _.find(this.categories, (category) => category.code === 'gradeLevel').terms;
                  //                  this.subjectList = _.find(this.categories, (category) => category.code === 'subject').terms;
                  if (data.board) {
                    data.board = this.findCode(this.boardList, data, 'board');
                  }
                  if (data.medium) {
                    if (typeof data.medium === 'string') {
                      data.medium = [this.findCode(this.mediumList, data, 'medium')];
                    } else {
                      data.medium = _.map(data.medium, (dataMedium) => {
                        return _.find(this.mediumList, (medium) => medium.name === dataMedium).code;
                      });
                    }
                  }
                  /*                   if (data.subject) {
                                      data.subject = this.findCode(this.subjectList, data, 'subject');
                                    } */
                  if (data.gradeLevel && data.gradeLevel.length) {
                    data.gradeLevel = _.map(data.gradeLevel, (dataGrade) => {
                      return _.find(this.gradeList, (grade) => grade.name === dataGrade).code;
                    });
                  }
                  if (profile && profile.syllabus && profile.syllabus[0] && data.framework === profile.syllabus[0]) {
                    if (data.board) {
                      if (profile.board && !(profile.board.length > 1) && data.board === profile.board[0]) {
                        if (data.medium) {
                          let existingMedium = false;
                          for (let i = 0; i < data.medium.length; i++) {
                            const mediumExists = _.find(profile.medium, (medium) => {
                              return medium === data.medium[i];
                            });
                            if (!mediumExists) {
                              break;
                            }
                            existingMedium = true;
                          }
                          if (!existingMedium) {
                            this.setCurrentProfile(2, data);
                          }
                          if (data.gradeLevel && data.gradeLevel.length) {
                            let existingGrade = false;
                            for (let i = 0; i < data.gradeLevel.length; i++) {
                              const gradeExists = _.find(profile.grade, (grade) => {
                                return grade === data.gradeLevel[i];
                              });
                              if (!gradeExists) {
                                break;
                              }
                              existingGrade = true;
                            }
                            if (!existingGrade) {
                              this.setCurrentProfile(3, data);
                            }
                            /*                             let existingSubject = false;
                                                        existingSubject = _.find(profile.subject, (subject) => {
                                                          return subject === data.subject;
                                                        });
                                                        if (!existingSubject) {
                                                          this.setCurrentProfile(4, data);
                                                        }
                             */
                          }
                        }
                      } else {
                        this.setCurrentProfile(1, data);
                      }
                    }
                  } else {
                    this.setCurrentProfile(0, data);
                  }
                }).catch((err) => {
                  if (err instanceof NetworkError) {
                    this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
                  }
                });

              return;
            }
          });
        })
        .catch((err) => {
          if (err instanceof NetworkError) {
            this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
          }
        });
    }
  }

  /**
   * Subscribe genie event to get content download progress
   */
  subscribeSdkEvent() {
    this.eventSubscription = this.eventsBusService.events().subscribe((event: EventsBusEvent) => {
      this.zone.run(() => {

        if (event.type === DownloadEventType.PROGRESS && event.payload.progress) {
          const downloadEvent = event as DownloadProgress;
          if (downloadEvent.payload.progress === -1) {
            this.downloadProgress = 0;
          } else if (downloadEvent.payload.identifier === this.content.identifier) {
            this.downloadProgress = downloadEvent.payload.progress;
          }

        }
        // Get child content
        // if (res.data && res.data.status === 'IMPORT_COMPLETED' && res.type === 'contentImport') {
        if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED) {
          this.showLoading = false;
          this.isDownloadStarted = false;
          this.results = [];
          this.parents = [];
          this.paths = [];
          this.getChildContents();
        }
        // For content update available
        // if (res.data && res.type === 'contentUpdateAvailable' && res.data.identifier === this.identifier) {
        if (event.payload && event.type === ContentEventType.UPDATE && event.payload.contentId === this.identifier) {
          this.zone.run(() => {
            if (this.parentContent) {
              const parentIdentifier = this.parentContent.contentId || this.parentContent.identifier;
              this.showLoading = true;
              this.importContent([parentIdentifier], false);
            }
          });
        }
      });
    }) as any;
  }

  /**
   * Function to get import content api request params
   *
   * @param {Array<string>} identifiers contains list of content identifier(s)
   * @param {boolean} isChild
   */
  importContent(identifiers: Array<string>, isChild: boolean, isDownloadAllClicked?) {
    const option: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: [],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    };

    // Call content service
    this.contentService.importContent(option).toPromise()
      .then((data: ContentImportResponse[]) => {
        this.zone.run(() => {
          data = data;
        });
      })
      .catch((error: any) => {
        this.zone.run(() => {
          this.isDownloadStarted = false;
          this.showLoading = false;
          if (error instanceof NetworkError) {
            this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
          } else {
            this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
          }
        });
      });
  }

  /**
   * Function to get import content api request params
   *
   * @param {Array<string>} identifiers contains list of content identifier(s)
   * @param {boolean} isChild
   */
  getImportContentRequestBody(identifiers: Array<string>, isChild: boolean): Array<ContentImport> {
    const requestParams = [];
    _.forEach(identifiers, (value) => {
      requestParams.push({
        isChildContent: isChild,
        destinationFolder: cordova.file.externalDataDirectory,
        contentId: value,
        correlationData: this.corRelationList !== undefined ? this.corRelationList : []
      });
    });

    return requestParams;
  }

  cancelDownload() {
    this.telemetryGeneratorService.generateCancelDownloadTelemetry(this.content);
    this.contentService.cancelDownload(this.identifier).toPromise()
      .then(() => {
        this.zone.run(() => {
          this.showLoading = false;
          this.location.back();

        });
      }).catch(() => {
        this.zone.run(() => {
          this.showLoading = false;
          this.location.back();

        });
      });
  }

  skipSteps() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SKIP_CLICKED,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT
    );
    if ((this.appGlobalService.isOnBoardingCompleted && this.appGlobalService.isProfileSettingsCompleted)
      || !this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {

      const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
      this.router.navigate([`/${RouterLinks.TABS}`], navigationExtras);
    } else {
      this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`]);
    }
  }

  private showAllChild(content: any) {
    this.zone.run(() => {
      if (content.children === undefined) {
        if (content.mimeType !== MimeType.COLLECTION) {
          if (content.contentData.appIcon) {
            if (content.contentData.appIcon.includes('http:') || content.contentData.appIcon.includes('https:')) {
              if (this.commonUtilService.networkInfo.isNetworkAvailable) {
                content.contentData.appIcon = content.contentData.appIcon;
              } else {
                content.contentData.appIcon = this.defaultImg;
              }
            } else if (content.basePath) {
              content.contentData.appIcon = content.basePath + '/' + content.contentData.appIcon;
            }
          }
          this.results.push(content);

          const path = [];
          this.parents.forEach(ele => {
            path.push(ele);
          });
          path.splice(-1, 1);
          this.paths.push(path);
        }
        return;
      }
      content.children.forEach(child => {
        this.parents.push(child);
        this.showAllChild(child);
        this.parents.splice(-1, 1);
      });
    });
  }

  private findContentNode(data: any) {
    if (data && data.identifier === this.searchIdentifier) {
      this.showAllChild(data);
      return true;
    }

    if (data && data.children !== undefined) {
      data.children.forEach(child => {
        this.parents.push(child);
        const isFound = this.findContentNode(child);

        if (isFound === true) {
          return true;
        }
        this.parents.splice(-1, 1);
      });
    }

    return false;
  }

  private openPlayer(playingContent, request) {
    this.playerService.getPlayerConfig(playingContent, request).subscribe((data) => {
      data['data'] = {};
      if (data.metadata.mimeType === 'application/vnd.ekstep.ecml-archive') {
        if (!request.streaming) {
          this.file.checkFile(`file://${data.metadata.basePath}/`, 'index.ecml').then((isAvailable) => {
            this.canvasPlayerService.xmlToJSon(`${data.metadata.basePath}/index.ecml`).then((json) => {
              data['data'] = json;
              const navigationExtras: NavigationExtras = { state: { config: data } };
              this.router.navigate([`/${RouterLinks.PLAYER}`], navigationExtras);
            }).catch((error) => {
              console.error('error1', error);
            });
          }).catch((err) => {
            console.error('err', err);
            this.canvasPlayerService.readJSON(`${data.metadata.basePath}/index.json`).then((json) => {
              data['data'] = json;
              const navigationExtras: NavigationExtras = { state: { config: data } };
              this.router.navigate([`/${RouterLinks.PLAYER}`], navigationExtras);
            }).catch((e) => {
              console.error('readJSON error', e);
            });
          });
        } else {
          const navigationExtras: NavigationExtras = { state: { config: data } };
          this.router.navigate([`/${RouterLinks.PLAYER}`], navigationExtras);
        }

      } else {
        const navigationExtras: NavigationExtras = { state: { config: data } };
        this.router.navigate([`/${RouterLinks.PLAYER}`], navigationExtras);
      }
    });
  }
  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back': this.handleBackButton(InteractSubtype.NAV_BACK_CLICKED);
        break;
    }
  }

  goBack() {
    this.location.back();
  }
}
