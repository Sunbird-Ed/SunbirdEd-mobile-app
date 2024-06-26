import { animate, group, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import {
  AudienceFilter,
  ContentCard,
  ContentFilterConfig,
  EventTopics,
  ExploreConstants,
  PreferenceKey,
  PrimaryCategory, ProfileConstants,
  RouterLinks,
  Search, ViewMore
} from '../../app/app.constant';
import { SbTutorialPopupComponent } from '../../app/components/popups/sb-tutorial-popup/sb-tutorial-popup.component';
import { AppGlobalService } from '../../services/app-global-service.service';
import { AppHeaderService } from '../../services/app-header.service';
import { CommonUtilService } from '../../services/common-util.service';
import { ContentAggregatorHandler } from '../../services/content/content-aggregator-handler.service';
import { AggregatorPageType, Orientation } from '../../services/content/content-aggregator-namespaces';
import { FormAndFrameworkUtilService } from '../../services/formandframeworkutil.service';
import { NavigationService } from '../../services/navigation-handler.service';
import { NotificationService } from '../../services/notification.service';
import { ProfileHandler } from '../../services/profile-handler';
import { SplaschreenDeeplinkActionHandlerDelegate } from '../../services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { SunbirdQRScanner } from '../../services/sunbirdqrscanner.service';
import {
  CorReleationDataType,
  Environment,
  ID,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId
} from '../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { ContentUtil } from '../../util/content-util';
import { applyProfileFilter } from '../../util/filter.util';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { IonContent as ContentView, IonRefresher, MenuController, PopoverController, ToastController } from '@ionic/angular';
import { Events } from '../../util/events';
import { TranslateService } from '@ngx-translate/core';
import { CsPrimaryCategory } from '@project-sunbird/client-services/services/content';
import { CourseCardGridTypes, LibraryFiltersLayout } from '@project-sunbird/common-consumption';
import forEach from 'lodash/forEach';
import has from 'lodash/has';
import { Subscription } from 'rxjs';
import {
  CategoryTerm,
  ContentAggregatorRequest,
  ContentEventType,
  ContentRequest,
  ContentSearchCriteria,
  ContentService,
  CorrelationData,
  EventsBusEvent,
  EventsBusService,
  FrameworkCategoryCode,
  FrameworkCategoryCodesGroup,
  FrameworkService,
  FrameworkUtilService,
  GetFrameworkCategoryTermsRequest,
  Profile,
  ProfileService,
  ProfileType,
  SearchType,
  SharedPreferences,
  SortOrder
} from '@project-sunbird/sunbird-sdk';
import { animationGrowInTopRight } from '../animations/animation-grow-in-top-right';
import { animationShrinkOutTopRight } from '../animations/animation-shrink-out-top-right';
import {
  FrameworkSelectionActionsDelegate, FrameworkSelectionDelegateService
} from '../profile/framework-selection/framework-selection.page';
import { PageFilterCallback } from './../page-filter/page-filter.page';
import { OnTabViewWillEnter } from './../tabs/on-tab-view-will-enter';
import { FormConstants } from '../form.constants';

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
export class ResourcesComponent implements OnInit, AfterViewInit, OnDestroy, FrameworkSelectionActionsDelegate, OnTabViewWillEnter {
  @ViewChild('libraryRefresher', { static: false }) refresher: IonRefresher;

  pageLoadedSuccess = false;
  storyAndWorksheets: Array<any>;
  selectedValue: Array<string> = [];
  guestUser = false;
  showSignInCard = false;
  userId: string;

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
  selectedLanguage = 'en';
  audienceFilter = [];
  profile: Profile;
  appLabel: string;
  mode = 'soft';
  pageFilterCallBack: PageFilterCallback;
  getGroupByPageReq: ContentSearchCriteria = {
    searchType: SearchType.SEARCH
  };

  layoutName = 'textbook';
  layoutPopular = ContentCard.LAYOUT_POPULAR;
  layoutSavedContent = ContentCard.LAYOUT_SAVED_CONTENT;
  categoryGradeLevels: any;
  categoryMediums: any;
  current_index: any;
  currentGrade: any;
  currentMedium: string;
  defaultImg: string;
  isUpgradePopoverShown = false;

  refresh: boolean;
  private eventSubscription: Subscription;

  headerObservable: Subscription;
  scrollEventRemover: any;
  subjects: any;
  searchGroupingContents: any;
  /**
   * Flag to show latest and popular course loader
   */
  pageApiLoader = true;
  dynamicResponse: any;
  courseCardType = CourseCardGridTypes;
  @ViewChild('contentView', { static: false }) contentView: ContentView;
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
  defaultAppIcon:string = '';
  userFrameworkCategories = {};
  listofCategory: any;
  requiredCategories = [];
  category1Code = '';
  category2Code = '';
  category3Code = '';

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
    private navService: NavigationService,
    private router: Router,
    private changeRef: ChangeDetectorRef,
    private appNotificationService: NotificationService,
    private popoverCtrl: PopoverController,
    private frameworkSelectionDelegateService: FrameworkSelectionDelegateService,
    private contentAggregatorHandler: ContentAggregatorHandler,
    private profileHandler: ProfileHandler
  ) {
    this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise()
      .then(val => {
        if (val && val.length) {
          this.selectedLanguage = val;
        }
      }).catch(e => console.error(e));
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
    this.events.subscribe('savedResources:update', async (res) => {
      if (res && res.update) {
        await this.getLocalContent();
      }
    });
    this.events.subscribe('event:showScanner', async (data) => {
      if (data.pageName === PageId.LIBRARY) {
        await this.qrScanner.startScanner(PageId.LIBRARY, false);
      }
    });
    this.events.subscribe('onAfterLanguageChange:update', async (res) => {
      if (res && res.selectedLanguage) {
        this.selectedLanguage = res.selectedLanguage;
        await this.getPopularContent(true);
      }
    });

    this.events.subscribe(AppGlobalService.PROFILE_OBJ_CHANGED, async () => {
      await this.swipeDownToRefresh(false, true);
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
    const isFirstTimeOnboarding = await this.preferences.getBoolean(PreferenceKey.COACH_MARK_SEEN).toPromise();
    if (!isFirstTimeOnboarding) {
      this.telemetryGeneratorService.generateImpressionTelemetry(
        ImpressionType.PAGE_REQUEST, '',
        PageId.LIBRARY,
        Environment.ONBOARDING
      );
    }
    await this.getCurrentUser();
    this.initNetworkDetection();
    this.appGlobalService.generateConfigInteractEvent(PageId.LIBRARY, this.isOnBoardingCardCompleted);
    await this.appNotificationService.handleNotification();

    this.events.subscribe(EventTopics.TAB_CHANGE, async (data: string) => {
      await this.scrollToTop();
      if (data === '') {
        await this.qrScanner.startScanner(this.appGlobalService.getPageIdForTelemetry());
      }
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
  }

  ionViewDidLeave() {
    if (this.coachTimeout && this.coachTimeout.clearTimeout) {
      this.coachTimeout.clearTimeout();
    }
  }

  /**
   * It will fetch the guest user profile details
   */
  async getCurrentUser(): Promise<void> {
    this.guestUser = !this.appGlobalService.isUserLoggedIn();
    const profileType = this.appGlobalService.getGuestUserType();
    this.showSignInCard = false;

    if (this.guestUser) {
      this.showSignInCard = this.commonUtilService.isAccessibleForNonStudentRole(profileType);
      if (this.showSignInCard) {
        this.audienceFilter = AudienceFilter.GUEST_TEACHER;
      } else if (profileType === ProfileType.STUDENT) {
        this.audienceFilter = AudienceFilter.GUEST_STUDENT;
      }
    } else {
      this.audienceFilter = AudienceFilter.LOGGED_IN_USER;
    }

    this.profile = this.appGlobalService.getCurrentUser();
    if (this.profile && this.profile.serverProfile && this.profile.serverProfile.framework && Object.keys(this.profile.serverProfile.framework).length>1) {
      this.userFrameworkCategories = this.profile.serverProfile.framework;
    } 
    await this.getFrameworkCategoriesLabel();
    await this.getLocalContent();
  }

  /**
   * Get popular content
   */
  async getPopularContent(isAfterLanguageChange = false, contentSearchCriteria?: ContentSearchCriteria) {
    this.storyAndWorksheets = [];
    this.searchApiLoader = true;

    if (!contentSearchCriteria) {
      contentSearchCriteria = {
        mode: 'hard'
      };
    }

    this.mode = contentSearchCriteria.mode;
   // swipe down to refresh should not over write current selected options
   Object.entries(this.userFrameworkCategories).forEach(([key, value]) => {
    let values: Array<any> = Array.isArray(value) ? value : [value]
    this.getGroupByPageReq[key] = applyProfileFilter(this.appGlobalService, values, contentSearchCriteria[key], key);
  });

  this.getGroupByPageReq = {...contentSearchCriteria, ...this.getGroupByPageReq}
  this.getGroupByPageReq.channel = [this.channelId];

    this.getGroupByPageReq.mode = 'hard';
    this.getGroupByPageReq.facets = Search.FACETS_ETB;
    this.getGroupByPageReq.primaryCategories = [CsPrimaryCategory.DIGITAL_TEXTBOOK];
    this.getGroupByPageReq.fields = ExploreConstants.REQUIRED_FIELDS;
    await this.getGroupByPage(isAfterLanguageChange);
  }

  // Make this method as private
  async getGroupByPage(isAfterLanguageChange = false) {
    
    const selectedBoardMediumGrade = ((this.getGroupByPageReq[this.category1Code] && this.getGroupByPageReq[this.category1Code].length
      && this.getGroupByPageReq[this.category1Code][0]) ? this.getGroupByPageReq[this.category1Code][0] + ', ' : '') +
      (this.getGroupByPageReq[this.category2Code] && this.getGroupByPageReq[this.category2Code].length
        && this.getGroupByPageReq[this.category2Code][0]) + ' Medium, ' +
      (this.getGroupByPageReq[this.category3Code] && this.getGroupByPageReq[this.category3Code].length && this.getGroupByPageReq[this.category3Code][0]);
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
    const audience: string[] = await this.profileHandler.getAudience(this.profile.profileType);
    const request = {
      userPreferences: this.updateSearchRequest(this.userFrameworkCategories, this.getGroupByPageReq),
      applyFirstAvailableCombination: {
        [this.category2Code] : this.getGroupByPageReq[this.category2Code],
        [this.category3Code]: this.getGroupByPageReq[this.category3Code]
      },
      interceptSearchCriteria: (contentSearchCriteria) => {
        for (let i = 0; i < 3; i++) {
          let code = this.listofCategory[i].code; 
          contentSearchCriteria[code] = this.getGroupByPageReq[code];
        }
        return contentSearchCriteria;
      }
    };
    // Get the book data
    try {
      let rootOrgId = this.profile.serverProfile ? this.profile.serverProfile['rootOrgId'] : undefined;
      this.dynamicResponse = await this.contentAggregatorHandler.aggregate(request, AggregatorPageType.LIBRARY, rootOrgId, this.profile.syllabus[0]);
      if (this.dynamicResponse) {
        this.dynamicResponse.forEach((val) => {
          if (val.theme && val.theme.orientation === Orientation.VERTICAL) {
            this.searchGroupingContents = val.data;
          }
        });
        this.dynamicResponse = this.contentAggregatorHandler.populateIcons(this.dynamicResponse);
      }
      const newSections = [];
      this.getCategoryData();
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
      if (this.profile.subject && this.profile.subject.length) {
        this.storyAndWorksheets = this.orderBySubject([...newSections]);
      } else {
        this.storyAndWorksheets = newSections;
      }
      this.pageLoadedSuccess = true;
      this.refresh = false;
      this.searchApiLoader = false;
      this.generateExtraInfoTelemetry(newSections.length);
    } catch (error) {
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
    }
  }

  updateSearchRequest(target, src) {
    const res = {};
    Object.keys(target)
          .forEach(k => res[k] = (k in src || (k.includes('grade')) ? (src[k] || src['grade']) : target[k]));
    return res;
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
    this.events.subscribe('update_header', async () => {
      await this.headerService.showHeaderWithHomeButton(['search', 'download', 'notification']);
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(async eventName => {
      await this.handleHeaderEvents(eventName);
    });
    await this.headerService.showHeaderWithHomeButton(['search', 'download', 'notification']);

    this.getCategoryData();

    await this.getCurrentUser();

    await this.getChannelId();

    if (!this.pageLoadedSuccess) {
      await this.getPopularContent();
    }
    this.subscribeSdkEvent();

    this.splaschreenDeeplinkActionHandlerDelegate.isDelegateReady = true;
    const isFirstTimeOnboarding = await this.preferences.getBoolean(PreferenceKey.COACH_MARK_SEEN).toPromise();
    if (!isFirstTimeOnboarding) {
      this.telemetryGeneratorService.generatePageLoadedTelemetry(
        PageId.LIBRARY,
        Environment.ONBOARDING
      );
    }
  }

  async ionViewDidEnter() {
    this.refresher.disabled = false;
    const utilityConfigFields = await this.formAndFrameworkUtilService.getFormFields(FormConstants.UTILITY_CONFIG);
    if (utilityConfigFields.find(field => field.code === 'experienceSwitchPopupConfig').config.isEnabled) {
      this.coachTimeout = setTimeout(async () => {
        await this.appGlobalService.showNewTabsSwitchPopup();
       }, 2000);
    }
  }

  subscribeSdkEvent() {
    this.eventSubscription = this.eventsBusService.events().subscribe((event: EventsBusEvent) => {
      (async () => {
        if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED) {
          await this.getLocalContent();
        }
      })
    }) as any;
  }

  async swipeDownToRefresh(refresher?, avoidRefreshList?) {
    this.refresh = true;
    this.storyAndWorksheets = [];

    await this.getCurrentUser();
    if (refresher) {
      refresher.target.complete();
      this.telemetryGeneratorService.generatePullToRefreshTelemetry(PageId.LIBRARY, Environment.HOME);
      await this.getGroupByPage(false);
    } else {
      await this.getPopularContent(false, null);
    }
  }

  async scanQRCode() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.QRCodeScanClicked,
      Environment.HOME,
      PageId.LIBRARY);
    await this.qrScanner.startScanner(PageId.LIBRARY);
  }

  async search() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.SEARCH_BUTTON_CLICKED,
      Environment.HOME,
      PageId.LIBRARY);
    const primaryCategories = await this.formAndFrameworkUtilService.getSupportedContentFilterConfig(
      ContentFilterConfig.NAME_LIBRARY);
    await this.router.navigate([RouterLinks.SEARCH], {
      state: {
        primaryCategories,
        source: PageId.LIBRARY,
        searchWithBackButton: true
      }
    });
  }

  async getCategoryData() {
    const syllabus: Array<string> = this.appGlobalService.getCurrentUser().syllabus;
    const frameworkId = (syllabus && syllabus.length > 0) ? syllabus[0] : undefined;
    let categories = this.listofCategory || await this.formAndFrameworkUtilService.invokedGetFrameworkCategoryList(frameworkId).then();
    this.requiredCategories = categories.map(e => e.code) 
    this.getMediumData(frameworkId, categories);
    this.getGradeLevelData(frameworkId, categories);
    this.getSubjectData(frameworkId, categories);
  }

  getSubjectData(frameworkId, categories): any {
    const req: GetFrameworkCategoryTermsRequest = {
      currentCategoryCode: categories[categories.length-1].code,
      language: this.translate.currentLang,
      requiredCategories: [categories[categories.length-1].code],
      frameworkId
    };
    this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise()
      .then((res: CategoryTerm[]) => {
        this.subjects = res;
      }).catch(e => console.error(e));
  }

  getMediumData(frameworkId, categories): any {
    const req: GetFrameworkCategoryTermsRequest = {
      currentCategoryCode: categories[1].code,
      language: this.translate.currentLang,
      requiredCategories: [categories[1].code],
      frameworkId
    };
    this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise()
      .then(async (res: CategoryTerm[]) => {
        this.categoryMediums = res;
        this.categoryMediumNamesArray = res.map(a => (a.name));
        await this.arrangeMediumsByUserData([...this.categoryMediumNamesArray], categories[1]);
      }).catch(e => console.error(e));
  }

  async arrangeMediumsByUserData(categoryMediumsParam, category) {
    let selectedCategory = [];
    if (this.guestUser) {
      selectedCategory =typeof this.profile.categories === 'string' ?  JSON.parse(this.profile.categories)[category.identifier] : this.profile.categories[category.identifier];
    } else {
      selectedCategory = this.profile.serverProfile.framework[category.code]
    }
    // if (this.appGlobalService.getCurrentUser() &&
    //   this.appGlobalService.getCurrentUser().medium &&
    //   this.appGlobalService.getCurrentUser().medium.length) {
      const matchedIndex = this.categoryMediumNamesArray.map(x => x.toLocaleLowerCase())
        .indexOf(selectedCategory[0].toLocaleLowerCase());
      for (let i = matchedIndex; i > 0; i--) {
        categoryMediumsParam[i] = categoryMediumsParam[i - 1];
        if (i === 1) {
          categoryMediumsParam[0] = this.categoryMediumNamesArray[matchedIndex];
        }
      }
      this.categoryMediumNamesArray = categoryMediumsParam;
      if (this.searchGroupingContents && this.searchGroupingContents.combination[this.category2Code]!) {
        const indexOfSelectedmediums = this.categoryMediumNamesArray.indexOf(this.searchGroupingContents.combination[this.category2Code]!);
        await this.mediumClickHandler(indexOfSelectedmediums, this.categoryMediumNamesArray[indexOfSelectedmediums]);
      } else {
        for (let i = 0, len = this.categoryMediumNamesArray.length; i < len; i++) {
          if ((selectedCategory[0].toLowerCase().replace(/\s/g, '')) === this.categoryMediumNamesArray[i].toLowerCase().replace(/\s/g, '')) {
            await this.mediumClickHandler(i, this.categoryMediumNamesArray[i]);
          }
        }
      }
   // }
  }

  getGradeLevelData(frameworkId, categories): any {
    const req: GetFrameworkCategoryTermsRequest = {
      currentCategoryCode: categories[2].code,
      language: this.translate.currentLang,
      requiredCategories: this.requiredCategories || this.appGlobalService.getRequiredCategories(),
      frameworkId
    };
    this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise()
      .then(async (res: CategoryTerm[]) => {
        this.categoryGradeLevels = res;
        let selectedCategory = [];
        if (this.guestUser) {
          selectedCategory = typeof this.profile.categories === 'string' ? JSON.parse(this.profile.categories)[categories[2].identifier] : this.profile.categories[categories[2].identifier];
        } else {
          selectedCategory = this.profile.serverProfile.framework[categories[2].code]
        }
        this.categoryGradeLevelsArray = res.map(a => (a.name));
        selectedCategory = this.classSelected.length ? this.categoryGradeLevelsArray[this.classSelected[0]] : selectedCategory;
        if (this.searchGroupingContents && this.searchGroupingContents.combination[this.category3Code]!) {
          const indexOfselectedClass =
            this.categoryGradeLevelsArray.indexOf(this.searchGroupingContents.combination[this.category3Code]!);
          await this.classClickHandler(indexOfselectedClass);
        } else {
          for (let i = 0, len = this.categoryGradeLevelsArray.length; i < len; i++) {
            if (selectedCategory[0].toLowerCase().replace(/\s/g, '') === this.categoryGradeLevelsArray[i].toLowerCase().replace(/\s/g, '')) {
              await this.classClickHandler(i);
            }
          }
        }
      }).catch(e => console.error(e));
  }

  generateClassInteractTelemetry(currentClass: string, previousClass: string) {
    const values = {};
    values['currentSelected'] = currentClass;
    values['previousSelected'] = previousClass;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CATEGORY_CLICKED.replace('%', this.category3Code),
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
      InteractSubtype.CATEGORY_CLICKED.replace('%', this.category2Code),
      Environment.HOME,
      PageId.LIBRARY,
      undefined,
      values);
  }

  async classClickEvent(event, isClassClicked?: boolean) {
    await this.classClickHandler(event.data.index, isClassClicked);
  }

  async classClickHandler(index, isClassClicked?: boolean) {
    if (isClassClicked) {
      this.generateClassInteractTelemetry(this.categoryGradeLevelsArray[index], this.getGroupByPageReq[this.category3Code][0]);
    }
    this.getGroupByPageReq[this.category3Code] = [this.categoryGradeLevelsArray[index]];

    if ((this.currentGrade) && (this.currentGrade !== this.categoryGradeLevelsArray[index]) && isClassClicked) {
      this.dynamicResponse = [];
      await this.getGroupByPage(false);
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

  async mediumClickEvent(event, isMediumClicked?: boolean) {
    await this.mediumClickHandler(event.data.index, event.data.text, isMediumClicked);
  }

  async mediumClickHandler(index: number, mediumName, isMediumClicked?: boolean) {
    if (isMediumClicked) {
      this.generateMediumInteractTelemetry(mediumName, this.getGroupByPageReq[this.category2Code][0]);
    }
    this.getGroupByPageReq[this.category2Code] = [mediumName];
    if (this.currentMedium !== mediumName && isMediumClicked) {
      this.dynamicResponse = [];
      await this.getGroupByPage(false);
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

  async navigateToDetailPage(event, sectionName) {
    event.data = event.data.content ? event.data.content : event.data;
    const item = event.data;
    const index = event.index;
    const identifier = item.contentId || item.identifier;
    const corRelationList = [{ id: sectionName || '', type: CorReleationDataType.SECTION }];
    const values = {};
    values['sectionName'] = sectionName;
    values['positionClicked'] = index;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.HOME,
      PageId.LIBRARY,
      ContentUtil.getTelemetryObject(item),
      values,
      ContentUtil.generateRollUp(undefined, identifier),
      corRelationList);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      await this.navService.navigateToDetailPage(item, { content: item, corRelation: corRelationList });
    } else {
      await this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI');
    }
  }

  async navigateToTextbookPage(items, subject) {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.VIEW_MORE_CLICKED,
      Environment.HOME,
      PageId.LIBRARY,
      ContentUtil.getTelemetryObject(items));
    if (this.commonUtilService.networkInfo.isNetworkAvailable || items.isAvailableLocally) {

      await this.router.navigate([RouterLinks.TEXTBOOK_VIEW_MORE], {
        state: {
          contentList: items,
          subjectName: subject,
          categoryKeys: this.listofCategory
        }
      });
    } else {
      this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI');
    }
  }

  async launchContent() {
    await this.router.navigate([RouterLinks.PLAYER]);
  }

  async handleHeaderEvents($event) {
    switch ($event.name) {
      case 'search':
        await this.search();
        break;
      case 'download':
        await this.redirectToActivedownloads();
        break;
      case 'notification':
        await this.redirectToNotifications();
        break;
      // case 'information':
      //   this.appTutorialScreen();
      //   break;
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
      componentProps: { appLabel: this.appLabel },
      enterAnimation: animationGrowInTopRight,
      leaveAnimation: animationShrinkOutTopRight,
      backdropDismiss: false,
      showBackdrop: true
    });
    this.tutorialPopover.present();
  }

  async redirectToActivedownloads() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.HOME,
      PageId.LIBRARY);
    await this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  async redirectToNotifications() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.NOTIFICATION_CLICKED,
      Environment.HOME,
      PageId.LIBRARY);
    await this.router.navigate([RouterLinks.NOTIFICATION]);
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

  async scrollToTop() {
    await this.contentView.scrollToTop();
  }

  async exploreOtherContents() {
    let rootOrgId = this.profile.serverProfile ? this.profile.serverProfile['rootOrgId'] : undefined;
    let searchFilter = await this.formAndFrameworkUtilService.getFrameworkCategoryFilter(this.profile.syllabus[0], {...FormConstants.SEARCH_FILTER, framework: this.profile.syllabus[0], rootOrgId});
    const facets = searchFilter.reduce((acc, filterConfig) => {
      acc.push(filterConfig.code);
      return acc;
    }, []);
    const requiredCategory = this.listofCategory ? this.listofCategory.map(e => e.code) : this.appGlobalService.getRequiredCategories();
    const navigationExtras = {
      state: {
        subjects: this.subjects ? [...this.subjects] : [],
        categoryGradeLevels: this.categoryGradeLevels,
        storyAndWorksheets: this.storyAndWorksheets,
        primaryCategories: PrimaryCategory.FOR_LIBRARY_TAB,
        selectedGrade: this.getGroupByPageReq[this.category3Code],
        selectedMedium: this.getGroupByPageReq[this.category2Code],
        facets,
        requiredCategory,
        userFrameworkCategories: this.userFrameworkCategories,
        categories: this.listofCategory
      }
    };
    await this.router.navigate([RouterLinks.EXPLORE_BOOK], navigationExtras);

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
      primaryCategories: [],
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
                  if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
                    this.imageSrcMap.set(content.identifier, content.appIcon);
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
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    this.frameworkSelectionDelegateService.delegate = undefined;
  }

  async onCourseCardClick(event) {
    const corRelationList: Array<CorrelationData> = [];
    corRelationList.push({ id: event.data.title || '', type: CorReleationDataType.SUBJECT });
    corRelationList.push({ id: (event.data.contents.length).toString(), type: CorReleationDataType.COURSE_COUNT });

    if (event.data.contents && event.data.contents.length > 1) {
      const appliedFilter = {
        board: this.getGroupByPageReq.board,
        medium: this.getGroupByPageReq.medium,
        gradeLevel: this.getGroupByPageReq.grade,
      };
      const curriculumCourseParams: NavigationExtras = {
        state: {
          theme: event.data.theme,
          titleColor: event.data.titleColor,
          subjectIcon: event.data.cardImg,
          subjectName: event.data.title,
          courseList: event.data.contents,
          corRelationList,
          appliedFilter
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
      await this.router.navigate([RouterLinks.CURRICULUM_COURSES], curriculumCourseParams);
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
      console.log('Content Data', event);
      await this.navService.navigateToTrackableCollection(
        {
          content: event.data.contents[0],
          corRelation: corRelationList
        }
      );
    }
  }

  async navigateToViewMoreContentsPage(section) {
    let navState = {};
    switch (section.dataSrc.type) {
      case 'TRACKABLE_COLLECTIONS':
        navState = {
          enrolledCourses: section.data.sections[0].contents,
          pageName: ViewMore.PAGE_COURSE_ENROLLED,
          headerTitle: this.commonUtilService.getTranslatedValue(section.title, ''),
          userId: this.appGlobalService.getUserId()
        };
        break;
      case 'CONTENTS':
      navState = {
        requestParams: {
          request: section.meta && section.meta.searchRequest
        },
        headerTitle: this.commonUtilService.getTranslatedValue(section.title, ''),
        pageName: ViewMore.PAGE_TV_PROGRAMS
      };
      break;
    }
    const params: NavigationExtras = {
      state: navState
    };
    await this.router.navigate([RouterLinks.VIEW_MORE_ACTIVITY], params);
  }

  async requestMoreContent() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.LET_US_KNOW_CLICKED,
      Environment.LIBRARY,
      PageId.LIBRARY,
    );
    let rootOrgId = this.profile.serverProfile ? this.profile.serverProfile['rootOrgId'] : undefined;
    const formConfig = await this.formAndFrameworkUtilService.getContentRequestFormConfig(this.profile.syllabus[0], rootOrgId);
    this.appGlobalService.formConfig = formConfig;
    this.frameworkSelectionDelegateService.delegate = this;
    await this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.FRAMEWORK_SELECTION}`],
      {
        state: {
          showHeader: true,
          corRelation: [{ id: PageId.LIBRARY, type: CorReleationDataType.FROM_PAGE }],
          title: this.commonUtilService.translateMessage('FRMELEMNTS_LBL_REQUEST_CONTENT'),
          subTitle: this.commonUtilService.translateMessage('FRMELEMNTS_LBL_RELEVANT_CONTENT_SUB_HEADING'),
          formConfig,
          submitDetails: {
            label: this.commonUtilService.translateMessage('BTN_SUBMIT')
          }
        }
      });
  }

  async onFrameworkSelectionSubmit(formInput: any, formOutput: any, router: Router, commonUtilService: CommonUtilService,
    telemetryGeneratorService: TelemetryGeneratorService, corRelation: Array<CorrelationData>) {
    if (!commonUtilService.networkInfo.isNetworkAvailable) {
      await commonUtilService.showToast('OFFLINE_WARNING_ETBUI');
      return;
    }
    const selectedCorRelation: Array<CorrelationData> = [];

    if (formOutput['children']) {
      for (const key in formOutput['children']) {
        if (formOutput[key] && formOutput['children'][key]['other']) {
          formOutput[key] = formOutput['children'][key]['other'];
        }
      }

      delete formOutput['children'];
    }

    for (const key in formOutput) {
      if (typeof formOutput[key] === 'string') {
        selectedCorRelation.push({ id: formOutput[key], type: key });
      } else if (typeof formOutput[key] === 'object' && formOutput[key].name) {
        selectedCorRelation.push({ id: formOutput[key].name, type: key });
      }
    }
    telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SUBMIT_CLICKED,
      Environment.HOME,
      PageId.FRAMEWORK_SELECTION,
      undefined,
      undefined,
      undefined,
      selectedCorRelation);
    const params = {
      formInput,
      formOutput,
      corRelation
    };
    await router.navigate([`/${RouterLinks.RESOURCES}/${RouterLinks.RELEVANT_CONTENTS}`], { state: params });
  }

  async tabViewWillEnter() {
    await this.headerService.showHeaderWithHomeButton(['search', 'download', 'notification']);
  }

  onScroll(event: any) {}

  async getFrameworkCategoriesLabel() {
    let rootOrgId = this.profile.serverProfile ? this.profile.serverProfile['rootOrgId'] : undefined;
    await this.formAndFrameworkUtilService.invokedGetFrameworkCategoryList(this.profile.syllabus[0], rootOrgId).then((categories) => {
      if (categories) {
        this.listofCategory = categories.sort((a, b) => a.index - b.index)
        this.category1Code = this.listofCategory[0].code;
        this.category2Code = this.listofCategory[1].code;
        this.category3Code = this.listofCategory[2].code;
        if (this.profile.categories && !this.profile.serverProfile) {
          this.userFrameworkCategories = {}
          let frameworkValue =typeof this.profile.categories === 'string' ? JSON.parse(this.profile.categories) : this.profile.categories;
          this.listofCategory.forEach((e) => {
              this.userFrameworkCategories[e.code] = Array.isArray(frameworkValue[e.identifier]) ? frameworkValue[e.identifier] : [frameworkValue[e.identifier]]
            })
        }
      }
    });
  }
}
