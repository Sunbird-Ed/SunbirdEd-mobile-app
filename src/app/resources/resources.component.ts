import { PageFilterCallback } from './../page-filter/page-filter.page';
import { Component, OnInit, AfterViewInit, Inject, NgZone, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {IonContent as ContentView, Events, ToastController, MenuController, PopoverController, IonRefresher} from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { animate, group, state, style, transition, trigger } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import has from 'lodash/has';
import forEach from 'lodash/forEach';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { LibraryFiltersLayout } from '@project-sunbird/common-consumption';
import {
  CategoryTerm,
  ContentEventType,
  ContentSearchCriteria,
  ContentService,
  EventsBusEvent,
  EventsBusService,
  FrameworkCategoryCode,
  FrameworkCategoryCodesGroup,
  FrameworkUtilService,
  GetFrameworkCategoryTermsRequest,
  Profile,
  ProfileService,
  ProfileType,
  SearchType,
  SharedPreferences,
  TelemetryObject,
  ContentRequest,
  FrameworkService,
  SortOrder,
  CorrelationData,
  ContentsGroupedByPageSection,
  SearchAndGroupContentRequest
} from 'sunbird-sdk';

import {
  AudienceFilter,
  CardSectionName,
  ContentCard,
  ContentType,
  PreferenceKey,
  ViewMore,
  Search,
  ProfileConstants,
  RouterLinks,
  ContentFilterConfig,
  MimeType,
  EventTopics,
  ExploreConstants
} from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { SunbirdQRScanner } from '@app/services/sunbirdqrscanner.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import {
  Environment, InteractSubtype, InteractType, PageId, CorReleationDataType, ID, ImpressionType, ImpressionSubtype
} from '@app/services/telemetry-constants';
import { AppHeaderService } from '@app/services/app-header.service';
import { SplaschreenDeeplinkActionHandlerDelegate } from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { ContentUtil } from '@app/util/content-util';
import { NotificationService } from '@app/services/notification.service';
import { applyProfileFilter } from '@app/util/filter.util';
import {SbTutorialPopupComponent} from '@app/app/components/popups/sb-tutorial-popup/sb-tutorial-popup.component';
import {animationGrowInTopRight} from '../animations/animation-grow-in-top-right';
import {animationShrinkOutTopRight} from '../animations/animation-shrink-out-top-right';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
  animations: [
    trigger('appear', [
      state('true', style({
        left: '{{left_indent}}',
      }), { params: { left_indent: 0 } }), // default parameters values required

      transition('* => active', [
        style({ width: 5, opacity: 0 }),
        group([
          animate('0.3s 0.2s ease', style({
            transform: 'translateX(0) scale(1.2)', width: '*',
          })),
          animate('0.2s ease', style({
            opacity: 1
          }))
        ])
      ]),
    ]),
    trigger('ScrollHorizontal', [
      state('true', style({
        left: '{{left_indent}}',
        transform: 'translateX(-100px)',
      }), { params: { left_indent: 0 } }), // default parameters values required

      transition('* => active', [
        // style({ width: 5, transform: 'translateX(-100px)', opacity: 0 }),
        group([
          animate('0.3s 0.5s ease', style({
            transform: 'translateX(-100px)'
          })),
          animate('0.3s ease', style({
            opacity: 1
          }))
        ])
      ]),
    ])
  ]
})
export class ResourcesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('libraryRefresher') refresher: IonRefresher;

  pageLoadedSuccess = false;
  storyAndWorksheets: Array<any>;
  selectedValue: Array<string> = [];
  guestUser = false;
  showSignInCard = false;
  recentlyViewedResources: Array<any>;
  userId: string;
  showLoader = false;

  /**
   * Common consumption
   */
  mediumFilterLayout = LibraryFiltersLayout.SQUARE;
  classFilterLayout = LibraryFiltersLayout.ROUND;
  cardDefaultImg;
  offlineImg;
  categoryMediumNamesArray = [];
  mediumsSelected = [];
  categoryGradeLevelsArray = [];
  classSelected = [];
  private networkSubscription?: Subscription;
  networkFlag: boolean;
  public imageSrcMap = new Map();

  /**
   * Flag to show latest and popular course loader
   */
  searchApiLoader = true;
  isOnBoardingCardCompleted = false;
  public source = PageId.LIBRARY;
  resourceFilter: any;
  appliedFilter: any;
  filterIcon = './assets/imgs/ic_action_filter.png';
  selectedLanguage = 'en';
  audienceFilter = [];
  profile: Profile;
  appLabel: string;
  mode = 'soft';
  isFilterApplied = false;
  pageFilterCallBack: PageFilterCallback;
  getGroupByPageReq: ContentSearchCriteria = {
    searchType: SearchType.SEARCH
  };

  layoutName = 'textbook';
  layoutPopular = ContentCard.LAYOUT_POPULAR;
  layoutSavedContent = ContentCard.LAYOUT_SAVED_CONTENT;
  savedResourcesSection = CardSectionName.SECTION_SAVED_RESOURCES;
  recentViewedSection = CardSectionName.SECTION_RECENT_RESOURCES;
  categoryGradeLevels: any;
  categoryMediums: any;
  current_index: any;
  currentGrade: any;
  currentMedium: string;
  defaultImg: string;
  isUpgradePopoverShown = false;

  refresh: boolean;
  private eventSubscription: Subscription;

  toast: any;
  headerObservable: any;
  scrollEventRemover: any;
  subjects: any;
  searchGroupingContents: any;
  /**
   * Flag to show latest and popular course loader
   */
  pageApiLoader = true;
  @ViewChild('contentView') contentView: ContentView;
  locallyDownloadResources;
  channelId: string;
  coachTimeout: any;
  courseList = [];
  subjectThemeAndIconsMap = {
    Science: {
      background: '#FFD6EB',
      titleColor: '#FD59B3',
      icon: 'assets/imgs/sub_science.svg'
    },
    Mathematics: {
      background: '#FFDFD9',
      titleColor: '#EA2E52',
      icon: 'assets/imgs/sub_math.svg'
    },
    English: {
      background: '#DAFFD8',
      titleColor: '#218432',
      icon: 'assets/imgs/sub_english.svg'
    },
    Social: {
      background: '#DAD4FF',
      titleColor: '#635CDC',
      icon: 'assets/imgs/sub_social.svg'
    },
    Hindi: {
      background: '#C2E2E9',
      titleColor: '#07718A',
      icon: 'assets/imgs/sub_hindi.svg'
    },
    Chemistry: {
      background: '#FFE59B',
      titleColor: '#8D6A00',
      icon: 'assets/imgs/sub_chemistry.svg'
    },
    Geography: {
      background: '#C2ECE6',
      titleColor: '#149D88',
      icon: 'assets/imgs/sub_geography.svg'
    },
    Sanskrit: {
      background: '#FFDFC7',
      titleColor: '#AD632D',
      icon: 'assets/imgs/sub_science.svg'
    },
  };

  private tutorialPopover;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
    private ngZone: NgZone,
    private qrScanner: SunbirdQRScanner,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private appVersion: AppVersion,
    private network: Network,
    private telemetryGeneratorService: TelemetryGeneratorService,
    public commonUtilService: CommonUtilService,
    public formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private translate: TranslateService,
    public toastController: ToastController,
    public menuCtrl: MenuController,
    private headerService: AppHeaderService,
    private router: Router,
    private changeRef: ChangeDetectorRef,
    private appNotificationService: NotificationService,
    private popoverCtrl: PopoverController
  ) {
    this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise()
      .then(val => {
        if (val && val.length) {
          this.selectedLanguage = val;
        }
      });
    this.subscribeUtilityEvents();
    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appLabel = appName;
      });
    this.defaultImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_launcher.png');
    this.cardDefaultImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_launcher.png');
    this.offlineImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_offline_white_sm.png');
    this.generateNetworkType();

  }

  subscribeUtilityEvents() {
    this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).subscribe((profile: Profile) => {
      this.profile = profile;
    });
    this.events.subscribe('savedResources:update', (res) => {
      if (res && res.update) {
        this.loadRecentlyViewedContent(true);
        this.getLocalContent();
      }
    });
    this.events.subscribe('event:showScanner', (data) => {
      if (data.pageName === PageId.LIBRARY) {
        this.qrScanner.startScanner(PageId.LIBRARY, false);
      }
    });
    this.events.subscribe('onAfterLanguageChange:update', (res) => {
      if (res && res.selectedLanguage) {
        this.selectedLanguage = res.selectedLanguage;
        this.getPopularContent(true);
      }
    });

    this.events.subscribe(AppGlobalService.PROFILE_OBJ_CHANGED, () => {
      this.swipeDownToRefresh(false, true);
    });

    // Event for optional and forceful upgrade
    this.events.subscribe('force_optional_upgrade', async (upgrade) => {
      if (upgrade && !this.isUpgradePopoverShown) {
        await this.appGlobalService.openPopover(upgrade);
        this.isUpgradePopoverShown = true;
      }
    });
  }

  async ngOnInit() {
    this.getCurrentUser();
    this.initNetworkDetection();
    this.appGlobalService.generateConfigInteractEvent(PageId.LIBRARY, this.isOnBoardingCardCompleted);
    this.appNotificationService.handleNotification();

    this.events.subscribe(EventTopics.TAB_CHANGE, (data: string) => {
      this.scrollToTop();
      if (data.trim().toUpperCase() === 'LIBRARY') {
        if (this.appliedFilter) {
          this.filterIcon = './assets/imgs/ic_action_filter.png';
          this.resourceFilter = undefined;
          this.appliedFilter = undefined;
          this.isFilterApplied = false;
          this.getPopularContent();
        }
      } else if (data === '') {
        this.qrScanner.startScanner(this.appGlobalService.getPageIdForTelemetry());
      }
    });
    this.events.subscribe('event:update_recently_viewed', () => {
      this.loadRecentlyViewedContent();
    });
  }

  generateNetworkType() {
    const values = {};
    values['network-type'] = this.network.type;
    this.telemetryGeneratorService.generateExtraInfoTelemetry(
      values,
      PageId.LIBRARY
    );
  }

  ngAfterViewInit() {
    this.events.subscribe('onboarding-card:completed', (param) => {
      this.isOnBoardingCardCompleted = param.isOnBoardingCardCompleted;
    });
  }

  ionViewWillLeave(): void {
    this.refresher.disabled = true;
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    this.events.unsubscribe('update_header');
    this.events.unsubscribe('onboarding-card:completed');
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    this.coachTimeout.clearTimeout();
  }

  ionViewDidLeave() {
    if (this.coachTimeout && this.coachTimeout.clearTimeout) {
      this.coachTimeout.clearTimeout();
    }
  }

  /**
   * It will fetch the guest user profile details
   */
  getCurrentUser(): void {
    this.guestUser = !this.appGlobalService.isUserLoggedIn();
    const profileType = this.appGlobalService.getGuestUserType();
    this.showSignInCard = false;

    if (this.guestUser) {
      if (this.commonUtilService.isAccessibleForNonStudentRole(profileType)) {
        this.showSignInCard = this.appGlobalService.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER;
        this.audienceFilter = AudienceFilter.GUEST_TEACHER;
      } else if (profileType === ProfileType.STUDENT) {
        this.showSignInCard = this.appGlobalService.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT;
        this.audienceFilter = AudienceFilter.GUEST_STUDENT;
      }
    } else {
      this.audienceFilter = AudienceFilter.LOGGED_IN_USER;
    }

    this.profile = this.appGlobalService.getCurrentUser();
    this.loadRecentlyViewedContent();
    this.getLocalContent();
  }

  navigateToViewMoreContentsPage(section: string) {
    const values = {};
    let headerTitle;
    let pageName;
    let showDownloadOnlyToggleBtn;
    const uid = this.profile ? this.profile.uid : undefined;
    if (section === this.savedResourcesSection) {
      values['SectionName'] = this.savedResourcesSection;
      headerTitle = 'SAVED_RESOURCES';
      pageName = ViewMore.PAGE_RESOURCE_SAVED;
    } else if (section === this.recentViewedSection) {
      values['SectionName'] = this.recentViewedSection;
      headerTitle = 'RECENTLY_VIEWED';
      pageName = ViewMore.PAGE_RESOURCE_RECENTLY_VIEWED;
      showDownloadOnlyToggleBtn = true;
    }
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.VIEWALL_CLICKED,
      Environment.HOME,
      this.source, undefined,
      values);

    const resourcesParams: NavigationExtras = {
      state: {
        headerTitle,
        pageName,
        showDownloadOnlyToggle: showDownloadOnlyToggleBtn,
        uid,
        audience: this.audienceFilter,
      }
    };
    this.router.navigate([RouterLinks.VIEW_MORE_ACTIVITY], resourcesParams);
  }

  /**
	 * Load/get recently viewed content
	 */
  // hide recently viewed as part of school@home
  async loadRecentlyViewedContent(hideLoaderFlag?: boolean) {
    // this.recentlyViewedResources = [];
    // if (!hideLoaderFlag) {
    //   this.showLoader = true;
    // }
    // const requestParams: ContentRequest = {
    //   uid: this.profile ? this.profile.uid : undefined,
    //   contentTypes: [],
    //   audience: this.audienceFilter,
    //   recentlyViewed: true,
    //   limit: 20
    // };

    // this.contentService.getContents(requestParams).toPromise()
    //   .then(data => {
    //     data.forEach((value) => {
    //       value.contentData['lastUpdatedOn'] = value.lastUpdatedTime;
    //       if (value.contentData.appIcon) {
    //         if (value.contentData.appIcon.includes('http:') || value.contentData.appIcon.includes('https:')) {
    //           if (this.commonUtilService.networkInfo.isNetworkAvailable) {
    //             value.contentData.appIcon = value.contentData.appIcon;
    //           } else {
    //             value.contentData.appIcon = this.defaultImg;
    //           }
    //         } else if (value.basePath) {
    //           value.contentData.appIcon = value.basePath + '/' + value.contentData.appIcon;
    //         }
    //       }
    //     });
    //     this.ngZone.run(() => {
    //       this.recentlyViewedResources = data;
    //       if (!hideLoaderFlag) {
    //         this.showLoader = false;
    //       }
    //     });
    //   })
    //   .catch(() => {
    //     this.ngZone.run(() => {
    //       if (!hideLoaderFlag) {
    //         this.showLoader = false;
    //       }
    //     });
    //   });
  }

  /**
   * Get popular content
   */
  getPopularContent(isAfterLanguageChange = false, contentSearchCriteria?: ContentSearchCriteria, avoidRefreshList = false) {
    this.storyAndWorksheets = [];
    this.searchApiLoader = true;

    if (!contentSearchCriteria) {
      contentSearchCriteria = {
        mode: 'hard'
      };
    }

    this.mode = contentSearchCriteria.mode;

    if (this.profile && !this.isFilterApplied) {

      if (this.profile.board && this.profile.board.length) {
        contentSearchCriteria.board = applyProfileFilter(this.appGlobalService, this.profile.board,
          contentSearchCriteria.board, 'board');
      }

      if (this.profile.medium && this.profile.medium.length) {
        contentSearchCriteria.medium = applyProfileFilter(this.appGlobalService, this.profile.medium,
          contentSearchCriteria.medium, 'medium');
      }

      if (this.profile.grade && this.profile.grade.length) {
        contentSearchCriteria.grade = applyProfileFilter(this.appGlobalService, this.profile.grade,
          contentSearchCriteria.grade, 'gradeLevel');
      }

    }
    // swipe down to refresh should not over write current selected options
    if (contentSearchCriteria.grade) {
      this.getGroupByPageReq.grade = contentSearchCriteria.grade;
    }
    if (contentSearchCriteria.medium) {
      this.getGroupByPageReq.medium = contentSearchCriteria.medium;
    }
    if (contentSearchCriteria.board) {
      this.getGroupByPageReq.board = contentSearchCriteria.board;
    } else {
      this.getGroupByPageReq.channel = [this.channelId];
    }

    this.getGroupByPageReq.mode = 'hard';
    this.getGroupByPageReq.facets = Search.FACETS_ETB;
    this.getGroupByPageReq.contentTypes = [ContentType.TEXTBOOK];
    this.getGroupByPageReq.fields = ExploreConstants.REQUIRED_FIELDS;
    this.getGroupByPage(isAfterLanguageChange, avoidRefreshList);
  }

  // Make this method as private
  async getGroupByPage(isAfterLanguageChange = false, avoidRefreshList = false) {

    const selectedBoardMediumGrade = ((this.getGroupByPageReq.board && this.getGroupByPageReq.board.length
      && this.getGroupByPageReq.board[0]) ? this.getGroupByPageReq.board[0] + ', ' : '') +
      (this.getGroupByPageReq.medium && this.getGroupByPageReq.medium.length
        && this.getGroupByPageReq.medium[0]) + ' Medium, ' +
      (this.getGroupByPageReq.grade && this.getGroupByPageReq.grade.length && this.getGroupByPageReq.grade[0]);
    this.appGlobalService.setSelectedBoardMediumGrade(selectedBoardMediumGrade);

    this.storyAndWorksheets = [];
    this.searchApiLoader = !this.refresh;
    const reqvalues = {};
    reqvalues['pageReq'] = this.getGroupByPageReq;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
      InteractSubtype.RESOURCE_PAGE_REQUEST,
      Environment.HOME,
      this.source, undefined,
      reqvalues);
    this.getGroupByPageReq.sortCriteria = [{
      sortAttribute: 'name',
      sortOrder: SortOrder.ASC
    }];
    const request: SearchAndGroupContentRequest = {
      groupBy: 'subject',
      combination: {
        medium: this.getGroupByPageReq.medium,
        gradeLevel: this.getGroupByPageReq.grade
      },
      searchCriteria: this.getGroupByPageReq
    };

    const requestBody = JSON.parse(JSON.stringify(request));
    // Get the book data
    this.contentService.searchAndGroupContent(requestBody).toPromise()
      .then((response: ContentsGroupedByPageSection) => {
        this.ngZone.run(() => {
          this.searchGroupingContents = response;
          const newSections = [];
          this.getCategoryData();
          // Get the course data
          this.getCurriculumCourses(requestBody, response);
          this.searchGroupingContents.sections.forEach(section => {
            if (section.name) {
              if (has(section.name, this.selectedLanguage)) {
                const langs = [];
                forEach(section.name, (value, key) => {
                  langs[key] = value;
                });
                section.name = langs[this.selectedLanguage];
              }
            }
            newSections.push(section);
          });
          // END OF TEMPORARY CODE
          if (this.profile.subject && this.profile.subject.length) {
            this.storyAndWorksheets = this.orderBySubject([...newSections]);
          } else {
            this.storyAndWorksheets = newSections;
          }
          const sectionInfo = {};
          for (let i = 0; i < this.storyAndWorksheets.length; i++) {
            const sectionName = this.storyAndWorksheets[i].name,
              count = this.storyAndWorksheets[i].contents.length;
            // check if locally available
            this.markLocallyAvailableTextBook();
            for (let k = 0, len = this.storyAndWorksheets[i].contents.length; k < len; k++) {
              const content = this.storyAndWorksheets[i].contents[k];
              if (content.appIcon) {
                if (content.appIcon.includes('http:') || content.appIcon.includes('https:')) {
                  if (this.commonUtilService.networkInfo.isNetworkAvailable) {
                    content.appIcon = content.appIcon;
                  } else {
                    this.imageSrcMap.set(content.identifier, content.appIcon);
                    content.appIcon = this.defaultImg;
                  }
                } else if (content.basePath) {
                  content.appIcon = content.basePath + '/' + content.appIcon;
                }
              }
              // add custom attribute('cardImg') for common consumption
              if (!(!content.isAvailableLocally && !this.commonUtilService.networkInfo.isNetworkAvailable)) {
                if (this.commonUtilService.convertFileSrc(content.courseLogoUrl)) {
                  this.storyAndWorksheets[i].contents[k].cardImg = this.commonUtilService.convertFileSrc(content.courseLogoUrl);
                } else if (this.commonUtilService.convertFileSrc(content.appIcon)) {
                  this.storyAndWorksheets[i].contents[k].cardImg = this.commonUtilService.convertFileSrc(content.appIcon);
                } else {
                  this.storyAndWorksheets[i].contents[k].cardImg = this.defaultImg;
                }
              } else {
                this.storyAndWorksheets[i].contents[k].cardImg = 'assets/imgs/ic_offline_white_sm.png';
              }
            }

            sectionInfo[sectionName] = count;
            sectionInfo['board'] = (this.getGroupByPageReq.board && this.getGroupByPageReq.board.length
              && this.getGroupByPageReq.board[0]) ? this.getGroupByPageReq.board[0] : '';
            sectionInfo['medium'] = this.getGroupByPageReq.medium[0];
            sectionInfo['grade'] = this.getGroupByPageReq.grade[0];
          }

          const resValues = {};
          resValues['pageRes'] = sectionInfo;
          this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
            InteractSubtype.RESOURCE_PAGE_LOADED,
            Environment.HOME,
            this.source, undefined,
            resValues);
          this.pageLoadedSuccess = true;
          this.refresh = false;
          this.searchApiLoader = false;
          this.generateExtraInfoTelemetry(newSections.length);
        });
      })
      .catch(error => {
        this.ngZone.run(() => {
          this.refresh = false;
          this.searchApiLoader = false;
          if (error === 'SERVER_ERROR' || error === 'SERVER_AUTH_ERROR') {
            if (!isAfterLanguageChange) {
              this.commonUtilService.showToast('ERROR_FETCHING_DATA');
            }
          }
          const errValues = {};
          errValues['isNetworkAvailable'] = this.commonUtilService.networkInfo.isNetworkAvailable ? 'Y' : 'N';
          this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
            InteractSubtype.RESOURCE_PAGE_ERROR,
            Environment.HOME,
            this.source, undefined,
            errValues);
        });
      });
  }

  private getCurriculumCourses(request: SearchAndGroupContentRequest, bookResponse) {
    if (bookResponse && bookResponse.combination) {
      if (bookResponse.combination.medium) {
        request.searchCriteria.medium = [bookResponse.combination.medium];
        request.combination.medium = [bookResponse.combination.medium];
      }
      if (bookResponse.combination.gradeLevel) {
        request.searchCriteria.grade = [bookResponse.combination.gradeLevel];
        request.combination.gradeLevel = [bookResponse.combination.gradeLevel];
      }
    }
    request.searchCriteria.contentTypes = [ContentType.COURSE];
    request.searchCriteria.languageCode = this.selectedLanguage;
    // request.searchCriteria.framework = ;
    console.log('getCurriculumCourses:request = ', request);

    this.contentService.searchAndGroupContent(JSON.parse(JSON.stringify(request))).toPromise()
      .then((response: ContentsGroupedByPageSection) => {
        console.log('getCurriculumCourses:response = ', response);
        this.ngZone.run(() => {
          this.courseList = [];
          response.sections.forEach(section => {
            let countLabel = this.commonUtilService.translateMessage('NO_COURSES');
            if (section.contents) {
              if (section.contents.length === 1) {
                countLabel = this.commonUtilService.translateMessage('NUMBER_OF_COURSE_1');
              } else {
                countLabel = this.commonUtilService.translateMessage('NUMBER_OF_COURSES', section.contents.length);
              }
            }
            const contentListObj = {
              contents: section.contents,
              title: section.name,
              count: countLabel,
              theme: this.subjectThemeAndIconsMap[section.name] ?
                this.subjectThemeAndIconsMap[section.name].background
                : null,

              titleColor: this.subjectThemeAndIconsMap[section.name] ?
                this.subjectThemeAndIconsMap[section.name].titleColor
                : null,

              cardImg: this.subjectThemeAndIconsMap[section.name] ?
                this.subjectThemeAndIconsMap[section.name].icon
                : null
            };
            this.courseList.push(contentListObj);
          });
        });
      })
      .catch(error => {
      });
  }

  orderBySubject(searchResults: any[]) {
    let selectedSubject: string[];
    const filteredSubject: string[] = [];
    selectedSubject = applyProfileFilter(this.appGlobalService, this.profile.subject, selectedSubject, 'subject');

    for (let i = 0; i < selectedSubject.length; i++) {
      const index = searchResults.findIndex((el) => {
        return el.name.toLowerCase().trim() === selectedSubject[i].toLowerCase().trim();
      });
      if (index !== -1) {
        filteredSubject.push(searchResults.splice(index, 1)[0]);
      }
    }
    filteredSubject.push(...searchResults);
    return filteredSubject;
  }
  markLocallyAvailableTextBook() {
    if (!this.locallyDownloadResources || !this.storyAndWorksheets) {
      return;
    }
    for (let i = 0; i < this.locallyDownloadResources.length; i++) {
      for (let j = 0; j < this.storyAndWorksheets.length; j++) {
        for (let k = 0; k < this.storyAndWorksheets[j].contents.length; k++) {
          if (this.locallyDownloadResources[i].isAvailableLocally &&
            this.locallyDownloadResources[i].identifier === this.storyAndWorksheets[j].contents[k].identifier) {
            this.storyAndWorksheets[j].contents[k].isAvailableLocally = true;
          }
        }
      }
    }
  }

  generateExtraInfoTelemetry(sectionsCount) {
    const values = {};
    values['pageSectionCount'] = sectionsCount;
    values['networkAvailable'] = this.commonUtilService.networkInfo.isNetworkAvailable ? 'Y' : 'N';
    this.telemetryGeneratorService.generateExtraInfoTelemetry(
      values,
      PageId.LIBRARY
    );
  }

  async ionViewWillEnter() {
    this.events.subscribe('update_header', () => {
      this.headerService.showHeaderWithHomeButton(['search', 'download', 'information']);
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.headerService.showHeaderWithHomeButton(['search', 'download', 'information']);

    this.getCategoryData();

    this.getCurrentUser();

    await this.getChannelId();

    if (!this.pageLoadedSuccess) {
      this.getPopularContent();
    }
    this.subscribeSdkEvent();

    this.splaschreenDeeplinkActionHandlerDelegate.isDelegateReady = true;
  }

  ionViewDidEnter() {
    this.refresher.disabled = false;
    // Need timer to load the coach screen and for the coach screen to hide if user comes from deeplink.
    this.coachTimeout = setTimeout(() => {
      this.appGlobalService.showTutorialScreen();
    }, 2000);
  }

  // Offline Toast
  async presentToastForOffline(msg: string) {
    this.toast = await this.toastController.create({
      duration: 3000,
      message: this.commonUtilService.translateMessage(msg),
      showCloseButton: true,
      position: 'top',
      closeButtonText: 'X',
      cssClass: ['toastHeader', 'offline']
    });
    await this.toast.present();
    this.toast.onDidDismiss(() => {
      this.toast = undefined;
    });
  }

  subscribeSdkEvent() {
    this.eventSubscription = this.eventsBusService.events().subscribe((event: EventsBusEvent) => {
      if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED) {
        this.loadRecentlyViewedContent();
        this.getLocalContent();
      }
    }) as any;
  }

  swipeDownToRefresh(refresher?, avoidRefreshList?) {
    this.refresh = true;
    this.storyAndWorksheets = [];

    this.getCurrentUser();
    if (refresher) {
      refresher.target.complete();
      this.telemetryGeneratorService.generatePullToRefreshTelemetry(PageId.LIBRARY, Environment.HOME);
      this.getGroupByPage();
    } else {
      this.getPopularContent(false, null, avoidRefreshList);
    }
  }

  scanQRCode() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.QRCodeScanClicked,
      Environment.HOME,
      PageId.LIBRARY);
    this.qrScanner.startScanner(PageId.LIBRARY);
  }


  async search() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.SEARCH_BUTTON_CLICKED,
      Environment.HOME,
      PageId.LIBRARY);
    const contentTypes = await this.formAndFrameworkUtilService.getSupportedContentFilterConfig(
      ContentFilterConfig.NAME_LIBRARY);
    this.router.navigate([RouterLinks.SEARCH], {
      state: {
        contentType: contentTypes,
        source: PageId.LIBRARY
      }
    });
  }


  getCategoryData() {
    const syllabus: Array<string> = this.appGlobalService.getCurrentUser().syllabus;
    const frameworkId = (syllabus && syllabus.length > 0) ? syllabus[0] : undefined;
    const categories: Array<FrameworkCategoryCode> = FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES;
    this.getMediumData(frameworkId, categories);
    this.getGradeLevelData(frameworkId, categories);
    this.getSubjectData(frameworkId, categories);
  }

  getSubjectData(frameworkId, categories): any {
    const req: GetFrameworkCategoryTermsRequest = {
      currentCategoryCode: FrameworkCategoryCode.SUBJECT,
      language: this.translate.currentLang,
      requiredCategories: categories,
      frameworkId
    };
    this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise()
      .then((res: CategoryTerm[]) => {
        this.subjects = res;
      })
      .catch(() => { });
  }

  getMediumData(frameworkId, categories): any {
    const req: GetFrameworkCategoryTermsRequest = {
      currentCategoryCode: FrameworkCategoryCode.MEDIUM,
      language: this.translate.currentLang,
      requiredCategories: categories,
      frameworkId
    };
    this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise()
      .then((res: CategoryTerm[]) => {
        this.categoryMediums = res;
        this.categoryMediumNamesArray = res.map(a => (a.name));
        this.arrangeMediumsByUserData([...this.categoryMediumNamesArray]);
      })
      .catch(() => {
      });
  }

  arrangeMediumsByUserData(categoryMediumsParam) {
    if (this.appGlobalService.getCurrentUser() &&
      this.appGlobalService.getCurrentUser().medium &&
      this.appGlobalService.getCurrentUser().medium.length) {
      const matchedIndex = this.categoryMediumNamesArray.map(x => x.toLocaleLowerCase())
        .indexOf(this.appGlobalService.getCurrentUser().medium[0].toLocaleLowerCase());
      for (let i = matchedIndex; i > 0; i--) {
        categoryMediumsParam[i] = categoryMediumsParam[i - 1];
        if (i === 1) {
          categoryMediumsParam[0] = this.categoryMediumNamesArray[matchedIndex];
        }
      }
      this.categoryMediumNamesArray = categoryMediumsParam;
      if (this.searchGroupingContents.combination.medium) {
        const indexOfSelectedmediums = this.categoryMediumNamesArray.indexOf(this.searchGroupingContents.combination.medium);
        this.mediumClickHandler(indexOfSelectedmediums, this.categoryMediumNamesArray[indexOfSelectedmediums]);
      } else {
        for (let i = 0, len = this.categoryMediumNamesArray.length; i < len; i++) {
          if ((this.getGroupByPageReq.medium[0].toLowerCase().trim()) === this.categoryMediumNamesArray[i].toLowerCase().trim()) {
            this.mediumClickHandler(i, this.categoryMediumNamesArray[i]);
          }
        }
      }
    }
  }

  getGradeLevelData(frameworkId, categories): any {
    const req: GetFrameworkCategoryTermsRequest = {
      currentCategoryCode: FrameworkCategoryCode.GRADE_LEVEL,
      language: this.translate.currentLang,
      requiredCategories: categories,
      frameworkId
    };
    this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise()
      .then((res: CategoryTerm[]) => {
        this.categoryGradeLevels = res;
        this.categoryGradeLevelsArray = res.map(a => (a.name));
        if (this.searchGroupingContents.combination.gradeLevel) {
          const indexOfselectedClass =
            this.categoryGradeLevelsArray.indexOf(this.searchGroupingContents.combination.gradeLevel);
          this.classClickHandler(indexOfselectedClass);
        } else {
          for (let i = 0, len = this.categoryGradeLevelsArray.length; i < len; i++) {
            if (this.getGroupByPageReq.grade[0] === this.categoryGradeLevelsArray[i]) {
              this.classClickHandler(i);
            }
          }
        }
      })
      .catch(err => {
      });
  }

  generateClassInteractTelemetry(currentClass: string, previousClass: string) {
    const values = {};
    values['currentSelected'] = currentClass;
    values['previousSelected'] = previousClass;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CLASS_CLICKED,
      Environment.HOME,
      PageId.LIBRARY,
      undefined,
      values);
  }

  generateMediumInteractTelemetry(currentMedium: string, previousMedium: string) {
    const values = {};
    values['currentSelected'] = currentMedium;
    values['previousSelected'] = previousMedium;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.MEDIUM_CLICKED,
      Environment.HOME,
      PageId.LIBRARY,
      undefined,
      values);
  }

  classClickEvent(event, isClassClicked?: boolean) {
    this.classClickHandler(event.data.index, isClassClicked);
  }

  classClickHandler(index, isClassClicked?: boolean) {
    if (isClassClicked) {
      this.generateClassInteractTelemetry(this.categoryGradeLevelsArray[index], this.getGroupByPageReq.grade[0]);
    }
    this.getGroupByPageReq.grade = [this.categoryGradeLevelsArray[index]];

    if ((this.currentGrade) && (this.currentGrade !== this.categoryGradeLevelsArray[index]) && isClassClicked) {
      this.getGroupByPage(false, !isClassClicked);
    }

    for (let i = 0, len = this.categoryGradeLevelsArray.length; i < len; i++) {
      if (i === index) {
        this.currentGrade = this.categoryGradeLevelsArray[i];
        this.current_index = this.categoryGradeLevels[i];
        this.categoryGradeLevels[i].selected = 'classAnimate';
      } else {
        this.categoryGradeLevels[i].selected = '';
      }
    }
    this.classSelected = [index];
    let el: HTMLElement | null = document.getElementById('class' + index);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
    } else {
      setTimeout(() => {
        el = document.getElementById('class' + index);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
        }
      }, 1000);
    }
  }

  mediumClickEvent(event, isMediumClicked?: boolean) {
    this.mediumClickHandler(event.data.index, event.data.text, isMediumClicked);
  }

  mediumClickHandler(index: number, mediumName, isMediumClicked?: boolean) {
    if (isMediumClicked) {
      this.generateMediumInteractTelemetry(mediumName, this.getGroupByPageReq.medium[0]);
    }
    this.getGroupByPageReq.medium = [mediumName];
    if (this.currentMedium !== mediumName && isMediumClicked) {
      this.getGroupByPage(false, !isMediumClicked);
    }
    for (let i = 0, len = this.categoryMediumNamesArray.length; i < len; i++) {
      if (this.categoryMediumNamesArray[i] === mediumName) {
        this.currentMedium = this.categoryMediumNamesArray[i];
      }
    }
    this.mediumsSelected = [index];
    setTimeout(() => {
      const el = document.getElementById('medium' + index);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
      }
    }, 1000);
  }

  navigateToDetailPage(event, sectionName) {
    const item = event.data;
    const index = event.index;
    const identifier = item.contentId || item.identifier;
    const telemetryObject: TelemetryObject = new TelemetryObject(identifier, item.contentType, item.pkgVersion);
    const corRelationList = [{ id: sectionName, type: CorReleationDataType.SUBJECT }];
    const values = {};
    values['sectionName'] = item.subject;
    values['positionClicked'] = index;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.HOME,
      PageId.LIBRARY,
      telemetryObject,
      values,
      ContentUtil.generateRollUp(undefined, identifier),
      corRelationList);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], { state: { content: item, corRelation: corRelationList } });
    } else {
      this.presentToastForOffline('OFFLINE_WARNING_ETBUI_1');
    }
  }

  navigateToTextbookPage(items, subject) {
    const identifier = items.contentId || items.identifier;
    let telemetryObject: TelemetryObject;
    telemetryObject = new TelemetryObject(identifier, items.contentType, undefined);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.VIEW_MORE_CLICKED,
      Environment.HOME,
      PageId.LIBRARY,
      telemetryObject);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || items.isAvailableLocally) {

      this.router.navigate([RouterLinks.TEXTBOOK_VIEW_MORE], {
        state: {
          content: items,
          subjectName: subject
        }
      });
    } else {
      this.presentToastForOffline('OFFLINE_WARNING_ETBUI_1');
    }
  }

  launchContent() {
    this.router.navigate([RouterLinks.PLAYER]);
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'search':
        this.search();
        break;
      case 'download':
        this.redirectToActivedownloads();
        break;
      // case 'notification':
      //   this.redirectToNotifications();
      //   break;
      case 'information':
        this.appTutorialScreen();
        break;
      default: console.warn('Use Proper Event name');
    }
  }

  async appTutorialScreen() {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.INFORMATION_ICON_CLICKED,
        Environment.HOME,
        PageId.LIBRARY
    );
    this.tutorialPopover = await this.popoverCtrl.create({
      component: SbTutorialPopupComponent,
      componentProps: {appLabel: this.appLabel},
      enterAnimation: animationGrowInTopRight,
      leaveAnimation: animationShrinkOutTopRight,
      backdropDismiss: false,
      showBackdrop: true
    });
    this.tutorialPopover.present();
  }

  redirectToActivedownloads() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.HOME,
      PageId.LIBRARY);
    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  redirectToNotifications() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.NOTIFICATION_CLICKED,
      Environment.HOME,
      PageId.LIBRARY);
    this.router.navigate([RouterLinks.NOTIFICATION]);
  }

  logScrollEnd(event) {
    // Added Telemetry on reaching Vertical Scroll End
    if (event && event.target.scrollHeight <= event.target.scrollTop + event.target.offsetHeight) {
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.SCROLL,
        InteractSubtype.BOOK_LIST_END_REACHED,
        Environment.HOME,
        this.source
      );
    }
  }

  scrollToTop() {
    this.contentView.scrollToTop();
  }
  exploreOtherContents() {
    const navigationExtras = {
      state: {
        subjects: [...this.subjects],
        categoryGradeLevels: this.categoryGradeLevels,
        storyAndWorksheets: this.storyAndWorksheets,
        contentType: ContentType.FOR_LIBRARY_TAB,
        selectedGrade: this.getGroupByPageReq.grade,
        selectedMedium: this.getGroupByPageReq.medium
      }
    };
    this.router.navigate([RouterLinks.EXPLORE_BOOK], navigationExtras);

    const corRelationList: Array<CorrelationData> = [];
    corRelationList.push({ id: this.profile.board ? this.profile.board.join(',') : '', type: CorReleationDataType.BOARD });
    corRelationList.push({ id: this.currentGrade ? this.currentGrade : '', type: CorReleationDataType.CLASS });
    corRelationList.push({ id: this.currentMedium ? this.currentMedium : '', type: CorReleationDataType.MEDIUM });

    this.telemetryGeneratorService.generateInteractTelemetry(
      this.storyAndWorksheets.length === 0 ? InteractType.WITHOUT_CONTENT : InteractType.WITH_CONTENT,
      '',
      Environment.LIBRARY,
      PageId.LIBRARY,
      undefined,
      undefined, undefined, corRelationList,
      ID.SEE_MORE_CONTENT_BUTTON_CLICKED);
  }
  async getLocalContent() {
    this.locallyDownloadResources = [];

    const requestParams: ContentRequest = {
      uid: this.profile ? this.profile.uid : undefined,
      contentTypes: [],
      audience: this.audienceFilter,
      recentlyViewed: false,
    };
    this.contentService.getContents(requestParams).subscribe((data) => {
      this.ngZone.run(() => {
        this.locallyDownloadResources = data;
      });
    });
  }

  async getChannelId() {
    return this.frameworkService.getActiveChannelId().subscribe((data) => {
      this.channelId = data;
    });
  }

  recentlyViewedCardClick(event, course) {
    const item = event.data;
    const index = event.index;

    const identifier = item.contentId || item.identifier;

    const type = this.telemetryGeneratorService.isCollection(item.mimeType) ?
      item.contentType : ContentType.RESOURCE;

    const telemetryObject: TelemetryObject = new TelemetryObject(identifier, type, '');
    const values = {};
    values['sectionName'] = this.recentViewedSection;
    values['positionClicked'] = index;

    if (!course.isAvailableLocally && !this.commonUtilService.networkInfo.isNetworkAvailable) {
      return false;
    }

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      'home',
      'library',
      telemetryObject,
      values);
    if (course.mimeType === MimeType.COLLECTION) {
      this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], {
        state: {
          content: course
        }
      });
    } else {
      this.router.navigate([RouterLinks.CONTENT_DETAILS], {
        state: {
          content: course.contentData
        }
      });
    }
  }

  private initNetworkDetection() {
    this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
    this.networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
      if (this.networkFlag !== available) {
        if (this.storyAndWorksheets.length) {
          for (let i = 0, leng = this.storyAndWorksheets.length; i < leng; i++) {
            for (let k = 0, len = this.storyAndWorksheets[i].contents.length; k < len; k++) {
              const content = this.storyAndWorksheets[i].contents[k];
              if (content.appIcon) {
                if (content.appIcon.includes('http:') || content.appIcon.includes('https:')) {
                  if (this.commonUtilService.networkInfo.isNetworkAvailable) {
                    content.appIcon = content.appIcon;
                  } else {
                    this.imageSrcMap.set(content.identifier, content.appIcon);
                    // this.imageSrcMap[content.identifier] = content.appIcon;
                    content.appIcon = this.defaultImg;
                  }
                } else if (content.basePath) {
                  content.appIcon = content.basePath + '/' + content.appIcon;
                }
              }
              if (!available) {
                // add custom attribute('cardImg') for common consumption
                if (!(!content.isAvailableLocally && !this.commonUtilService.networkInfo.isNetworkAvailable)) {
                  if (this.commonUtilService.convertFileSrc(content.courseLogoUrl)) {
                    this.storyAndWorksheets[i].contents[k].cardImg = this.commonUtilService.convertFileSrc(content.courseLogoUrl);
                  } else if (this.commonUtilService.convertFileSrc(content.appIcon)) {
                    this.storyAndWorksheets[i].contents[k].cardImg = this.commonUtilService.convertFileSrc(content.appIcon);
                  } else {
                    this.storyAndWorksheets[i].contents[k].cardImg = this.defaultImg;
                  }
                } else {
                  this.storyAndWorksheets[i].contents[k].cardImg = 'assets/imgs/ic_offline_white_sm.png';
                }
              } else {
                content.cardImg = this.commonUtilService.convertFileSrc(this.imageSrcMap.get(content.identifier));
                content.appIcon = this.commonUtilService.convertFileSrc(this.imageSrcMap.get(content.identifier));
              }
            }
          }
        }
      }
      this.networkFlag = available;
      this.storyAndWorksheets = [...this.storyAndWorksheets];
      this.changeRef.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }

  onCourseCardClick(event) {
    const corRelationList: Array<CorrelationData> = [];
    corRelationList.push({id: event.data.title, type: CorReleationDataType.SUBJECT});
    corRelationList.push({id: (event.data.contents.length).toString() , type: CorReleationDataType.COURSE_COUNT});

    if (event.data.contents && event.data.contents.length > 1) {
      const curriculumCourseParams: NavigationExtras = {
        state: {
          theme: event.data.theme,
          titleColor: event.data.titleColor,
          subjectIcon: event.data.cardImg,
          subjectName: event.data.title,
          courseList: event.data.contents,
          corRelationList
        }
      };
      this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.SUBJECT_CARD_CLICKED,
          Environment.HOME,
          PageId.LIBRARY,
          undefined,
          undefined,
          undefined,
          corRelationList
      );
      this.router.navigate([RouterLinks.CURRICULUM_COURSES], curriculumCourseParams);
    } else {
      this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.SUBJECT_CARD_CLICKED,
          Environment.HOME,
          PageId.LIBRARY,
          undefined,
          undefined,
          undefined,
          corRelationList
      );
      this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
        state: {
          content: event.data.contents[0],
          corRelation: corRelationList
        }
      });
    }
  }
}
