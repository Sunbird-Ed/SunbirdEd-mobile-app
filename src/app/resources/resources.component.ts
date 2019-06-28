import { Component, OnInit, AfterViewInit, Inject, NgZone, ViewChild } from '@angular/core';
import {Events, NavController, ToastController, MenuController} from '@ionic/angular';
import {IonContent as ContentView} from '@ionic/angular';
import {
  AudienceFilter,
  CardSectionName,
  ContentCard,
  ContentType,
  PreferenceKey,
  ViewMore,
  Search,
  ProfileConstants
} from '../../app/app.constant';
import { Map } from '../../app/telemetryutil';
import {AppGlobalService} from '../../services/app-global-service.service';
import * as Driver from 'driver.js';

// import { ActiveDownloadsPage } from '@app/pages/active-downloads/active-downloads';

import * as _ from 'lodash';
// import { ViewMoreActivityPage } from '../view-more-activity/view-more-activity';
import { SunbirdQRScanner } from '../../services/sunbirdqrscanner.service';
// import { SearchPage } from '../search/search';


// import { PageFilterCallback } from '../page-filter/page.filter';


import { AppVersion } from '@ionic-native/app-version/ngx';
import { updateFilterInSearchQuery } from '../../util/filter.util';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { CommonUtilService } from '../../services/common-util.service';
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@ionic-native/network';
import { animate, group, state, style, transition, trigger } from '@angular/animations';
// import { CollectionDetailsEtbPage } from '../collection-details-etb/collection-details-etb';
import {
  CategoryTerm,
  ContentEventType,
  ContentRequest,
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
} from 'sunbird-sdk';
import { Environment, ImpressionType, InteractSubtype, InteractType, PageId } from '../../services/telemetry-constants';
// import { PlayerPage } from '../player/player';
import { Subscription } from 'rxjs';
import { AppHeaderService } from '../../services';
import { NavigationExtras, Router } from '@angular/router';
// import { GuestProfilePage } from '../profile';
// import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
  animations: [
    trigger('appear', [
      state('true', style({
        left: '{{left_indent}}',
      }), { params: { left_indent: 0 } }), // default parameters values required

      transition('* => classAnimate', [
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

      transition('* => classAnimate', [
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
export class ResourcesComponent implements OnInit, AfterViewInit {
  pageLoadedSuccess = false;
  storyAndWorksheets: Array<any>;
  selectedValue: Array<string> = [];
  guestUser = false;
  showSignInCard = false;
  localResources: Array<any>;
  recentlyViewedResources: Array<any>;
  userId: string;
  showLoader = false;

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
  // pageFilterCallBack: PageFilterCallback;
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
  networkSubscription: Subscription;
  headerObservable: any;
  scrollEventRemover: any;
  @ViewChild('contentView') contentView: ContentView;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    public navCtrl: NavController,
    private ngZone: NgZone,
    // private qrScanner: SunbirdQRScanner,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private appVersion: AppVersion,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private translate: TranslateService,
    // private network: Network,
    // private tabs: Tabs,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    public toastController: ToastController,
    public menuCtrl: MenuController,
    private headerServie: AppHeaderService,
    private router: Router
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
    this.defaultImg = 'assets/imgs/ic_launcher.png';
    this.generateNetworkType();
  }

  test() {
    const navigationExtras: NavigationExtras = {
      state: {
        user: 'Christy Fernandes'
      }
    };
    this.router.navigate(['/view-more-activity'], navigationExtras);
  }

  subscribeUtilityEvents() {
    this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).subscribe((profile: Profile) => {
      this.profile = profile;
    });
    this.events.subscribe('savedResources:update', (res) => {
      if (res && res.update) {
        this.loadRecentlyViewedContent();
      }
    });
    this.events.subscribe('event:showScanner', (data) => {
      if (data.pageName === PageId.LIBRARY) {
        // this.qrScanner.startScanner(PageId.LIBRARY, false);
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

    this.events.subscribe('tab.change', (data) => {
      // this.ngZone.run(() => {
      if (data === 'LIBRARY') {
        if (this.appliedFilter) {
          this.filterIcon = './assets/imgs/ic_action_filter.png';
          this.resourceFilter = undefined;
          this.appliedFilter = undefined;
          this.isFilterApplied = false;
          this.getPopularContent();
        }
      } else if (data === '') {
        // this.qrScanner.startScanner(PageId.LIBRARY);
      }
      // });
    });

  }

  ngOnInit() {
    this.getCurrentUser();
  }

  generateNetworkType() {
    const values = new Map();
    // values['network-type'] = this.network.type;
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
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    this.events.unsubscribe('update_header');
    this.events.unsubscribe('onboarding-card:completed');
    this.headerObservable.unsubscribe();
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
      if (this.toast) {
        this.toast.dismiss();
        this.toast = undefined;
      }
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
      if (profileType === ProfileType.TEACHER) {
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
  }

  // goToUserAndGroups() {
  //   this.navCtrl.push(UserAndGroupsPage);
  // }
  // goToReports() {
  //   this.navCtrl.push(ReportsPage);
  // }
  // goToLanguageSettings() {
  //   this.navCtrl.push(LanguageSettingsPage, {
  //     mainPage: true
  //   });
  // }
  // goToSettings() {
  //   this.navCtrl.push(SettingsPage);
  // }

  navigateToViewMoreContentsPage(section: string) {
    const values = new Map();
    let headerTitle;
    let pageName;
    let showDownloadOnlyToggleBtn;
    const uid = this.profile ? this.profile.uid : undefined;
    if (section === this.savedResourcesSection) {
      // values['SectionName'] = this.savedResourcesSection;
      headerTitle = 'SAVED_RESOURCES';
      pageName = ViewMore.PAGE_RESOURCE_SAVED;
    } else if (section === this.recentViewedSection) {
      // values['SectionName'] = this.recentViewedSection;
      headerTitle = 'RECENTLY_VIEWED';
      pageName = ViewMore.PAGE_RESOURCE_RECENTLY_VIEWED;
      showDownloadOnlyToggleBtn = true;
    }
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.VIEWALL_CLICKED,
      Environment.HOME,
      this.source, undefined,
      values);
    // Migration TODO
    // this.navCtrl.push(ViewMoreActivityPage, {
    //   headerTitle: headerTitle,
    //   pageName: pageName,
    //   showDownloadOnlyToggle: showDownloadOnlyToggleBtn,
    //   uid: uid,
    //   audience: this.audienceFilter,
    // });
  }

  /**
   * Navigate to search page
   *
   * @param {string} queryParams search query params
   */
  navigateToViewMoreContentsPageWithParams(queryParams, headerTitle): void {
    const values = new Map();
    values['SectionName'] = headerTitle;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.VIEWALL_CLICKED,
      Environment.HOME,
      this.source,
      undefined,
      values);

    queryParams = updateFilterInSearchQuery(queryParams, this.appliedFilter, this.profile, this.mode,
      this.isFilterApplied, this.appGlobalService);

    // this.navCtrl.push(ViewMoreActivityPage, {
    //   requestParams: queryParams,
    //   headerTitle: headerTitle
    // });
  }

  /**
	 * Get saved content
	 */
  async setSavedContent() {
    this.showLoader = true;
    const requestParams: ContentRequest = {
      uid: this.profile ? this.profile.uid : undefined,
      contentTypes: ContentType.FOR_LIBRARY_TAB,
      audience: this.audienceFilter
    };
    await this.contentService.getContents(requestParams).toPromise()
      .then(data => {
        _.forEach(data, (value) => {
          value.contentData.lastUpdatedOn = value.lastUpdatedTime;
          if (value.contentData.appIcon) {
            if (value.contentData.appIcon.includes('http:') || value.contentData.appIcon.includes('https:')) {
              if (this.commonUtilService.networkInfo.isNetworkAvailable) {
                value.contentData.appIcon = value.contentData.appIcon;
              } else {
                value.contentData.appIcon = this.defaultImg;
              }
            } else if (value.basePath) {
              value.contentData.appIcon = value.basePath + '/' + value.contentData.appIcon;
            }
          }

        });
        this.ngZone.run(() => {
          this.localResources = data;
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.showLoader = false;
        });
      });
    // }
  }

  /**
	 * Load/get recently viewed content
	 */
  async loadRecentlyViewedContent() {
    this.recentlyViewedResources = [];
    this.showLoader = true;
    const requestParams: ContentRequest = {
      uid: this.profile ? this.profile.uid : undefined,
      contentTypes: ContentType.FOR_RECENTLY_VIEWED,
      audience: this.audienceFilter,
      recentlyViewed: true,
      limit: 20
    };
    await this.setSavedContent();
    this.contentService.getContents(requestParams).toPromise()
      .then(data => {
        _.forEach(data, (value) => {
          value.contentData.lastUpdatedOn = value.lastUpdatedTime;
          if (value.contentData.appIcon) {
            if (value.contentData.appIcon.includes('http:') || value.contentData.appIcon.includes('https:')) {
              if (this.commonUtilService.networkInfo.isNetworkAvailable) {
                value.contentData.appIcon = value.contentData.appIcon;
              } else {
                value.contentData.appIcon = this.defaultImg;
              }
            } else if (value.basePath) {
              value.contentData.appIcon = value.basePath + '/' + value.contentData.appIcon;
            }
          }
        });
        this.ngZone.run(() => {
          // merge downloadedResources after recently viewed, which are not yet viewed
          if ((data && data.length) && (this.localResources && this.localResources.length)) {
            // remove if same content is downloaded and viewed.
            for (let i = 0; i < data.length; i++) {
              const index = this.localResources.findIndex((el) => {
                return el.identifier === data[i].identifier;
              });

              if (index !== -1) {
                this.localResources.splice(index, 1);
              }
            }
            data.push(...this.localResources);
            this.recentlyViewedResources = data;
          } else {
            if (!(data && data.length) && (this.localResources && this.localResources.length)) {
              this.recentlyViewedResources = this.localResources;
            } else if ((data && data.length) && !(this.localResources && this.localResources.length)) {
              this.recentlyViewedResources = data;
            }
          }
          this.showLoader = false;
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.showLoader = false;
        });
      });
  }

  /**
   * Get popular content
   */
  getPopularContent(isAfterLanguageChange = false, contentSearchCriteria?: ContentSearchCriteria,avoidRefreshList = false) {
    // if (this.isOnBoardingCardCompleted || !this.guestUser) {
    this.storyAndWorksheets = [];
    this.searchApiLoader = true;
    // this.noInternetConnection = false;
    const that = this;

    if (!contentSearchCriteria) {
      contentSearchCriteria = {
        mode: 'hard'
      };
    }

    this.mode = contentSearchCriteria.mode;

    if (this.profile && !this.isFilterApplied) {

      if (this.profile.board && this.profile.board.length) {
        contentSearchCriteria.board = this.applyProfileFilter(this.profile.board, contentSearchCriteria.board, 'board');
      }

      if (this.profile.medium && this.profile.medium.length) {
        contentSearchCriteria.medium = this.applyProfileFilter(this.profile.medium, contentSearchCriteria.medium, 'medium');
      }

      if (this.profile.grade && this.profile.grade.length) {
        contentSearchCriteria.grade = this.applyProfileFilter(this.profile.grade,
          contentSearchCriteria.grade, 'gradeLevel');
      }

    }
    // swipe down to refresh should not over write current selected options
    if (contentSearchCriteria.grade) {
      this.getGroupByPageReq.grade = [contentSearchCriteria.grade[0]];
    }
    if (contentSearchCriteria.medium) {
      this.getGroupByPageReq.medium = [contentSearchCriteria.medium[0]];
    }
    if (contentSearchCriteria.board) {
      this.getGroupByPageReq.board = [contentSearchCriteria.board[0]];
    }
    this.getGroupByPageReq.mode = 'hard';
    this.getGroupByPageReq.facets = Search.FACETS_ETB;
    this.getGroupByPageReq.contentTypes = [ContentType.TEXTBOOK];
    this.getGroupByPage(isAfterLanguageChange, avoidRefreshList);
  }

  getGroupByPage(isAfterLanguageChange = false, avoidRefreshList = false) {
    const selectedBoardMediumGrade = this.getGroupByPageReq.board[0] + ', ' +
                                     this.getGroupByPageReq.medium[0] + ' Medium, ' +
                                     this.getGroupByPageReq.grade[0] ;
    this.appGlobalService.setSelectedBoardMediumGrade(selectedBoardMediumGrade);
    this.storyAndWorksheets = [];
    if (!this.refresh) {
      this.searchApiLoader = true;
    } else {
      this.searchApiLoader = false;
    }
    const reqvalues = new Map();
    reqvalues['pageReq'] = this.getGroupByPageReq;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
      InteractSubtype.RESOURCE_PAGE_REQUEST,
      Environment.HOME,
      this.source, undefined,
      reqvalues);
    this.contentService.searchContentGroupedByPageSection(this.getGroupByPageReq).toPromise()
      .then((response: any) => {
        this.ngZone.run(() => {
          // TODO Temporary code - should be fixed at backend
          const sections = response.sections;
          const newSections = [];
          sections.forEach(element => {
            // element.display = JSON.parse(element.display);
            if (element.display.name) {
              if (_.has(element.display.name, this.selectedLanguage)) {
                const langs = [];
                _.forEach(element.display.name, (value, key) => {
                  langs[key] = value;
                });
                element.name = langs[this.selectedLanguage];
              }
            }
            newSections.push(element);
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

            for (let k = 0, len = this.storyAndWorksheets[i].contents.length; k < len; k++) {
              const content = this.storyAndWorksheets[i].contents[k];
              if (content.appIcon) {
                if (content.appIcon.includes('http:') || content.appIcon.includes('https:')) {
                  if (this.commonUtilService.networkInfo.isNetworkAvailable) {
                    content.appIcon = content.appIcon;
                  } else {
                    content.appIcon = this.defaultImg;
                  }
                } else if (content.basePath) {
                  content.appIcon = content.basePath + '/' + content.appIcon;
                }
              }
            }

            // check if locally available
            this.markLocallyAvailableTextBook();
            sectionInfo[sectionName] = count;
          }

          const resvalues = new Map();
          resvalues['pageRes'] = sectionInfo;
          this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
            InteractSubtype.RESOURCE_PAGE_LOADED,
            Environment.HOME,
            this.source, undefined,
            resvalues);
          this.pageLoadedSuccess = true;
          this.refresh = false;
          this.searchApiLoader = false;
          // this.noInternetConnection = false;
          this.generateExtraInfoTelemetry(newSections.length);
          // this.checkEmptySearchResult(isAfterLanguageChange);
          if (this.storyAndWorksheets.length === 0 && this.commonUtilService.networkInfo.isNetworkAvailable) {
            // if (this.tabs.getSelected().tabTitle === 'LIBRARY‌' && !avoidRefreshList) {
            //   this.commonUtilService.showToast(
            //     this.commonUtilService.translateMessage('EMPTY_LIBRARY_TEXTBOOK_FILTER',
            //       `${this.getGroupByPageReq.grade} (${this.getGroupByPageReq.medium} ${this.commonUtilService.translateMessage('MEDIUM')})`));
            // }
          }
        });
      })
      .catch(error => {
        console.log('error while getting popular resources...', error);
        this.ngZone.run(() => {
          this.refresh = false;
          this.searchApiLoader = false;
          if (error === 'CONNECTION_ERROR') {
          } else if (error === 'SERVER_ERROR' || error === 'SERVER_AUTH_ERROR') {
            if (!isAfterLanguageChange) {
              this.commonUtilService.showToast('ERROR_FETCHING_DATA');
            }
          } else if (this.storyAndWorksheets.length === 0 && this.commonUtilService.networkInfo.isNetworkAvailable  && !avoidRefreshList) {
            this.commonUtilService.showToast(
              this.commonUtilService.translateMessage('EMPTY_LIBRARY_TEXTBOOK_FILTER',
                `${this.getGroupByPageReq.grade} (${this.getGroupByPageReq.medium} ${this.commonUtilService.translateMessage('MEDIUM')})`));
          }
          const errvalues = new Map();
          errvalues['isNetworkAvailable'] = this.commonUtilService.networkInfo.isNetworkAvailable ? 'Y' : 'N';
          this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
            InteractSubtype.RESOURCE_PAGE_ERROR,
            Environment.HOME,
            this.source, undefined,
            errvalues);
        });
      });
  }

  orderBySubject(searchResults: any[]) {
    let selectedSubject: string[];
    const filteredSubject: string[] = [];
    selectedSubject = this.applyProfileFilter(this.profile.subject, selectedSubject, 'subject');
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
    if (!this.recentlyViewedResources || !this.storyAndWorksheets) {
      return;
    }
    for (let i = 0; i < this.recentlyViewedResources.length; i++) {
      for (let j = 0; j < this.storyAndWorksheets.length; j++) {
        for (let k = 0; k < this.storyAndWorksheets[j].contents.length; k++) {
          if (this.recentlyViewedResources[i].isAvailableLocally &&
            this.recentlyViewedResources[i].identifier === this.storyAndWorksheets[j].contents[k].identifier) {
            this.storyAndWorksheets[j].contents[k].isAvailableLocally = true;
          }
        }
      }
    }
  }
  generateExtraInfoTelemetry(sectionsCount) {
    const values = new Map();
    values['savedItemVisible'] = (this.localResources && this.localResources.length) ? 'Y' : 'N';
    values['pageSectionCount'] = sectionsCount;
    values['networkAvailable'] = this.commonUtilService.networkInfo.isNetworkAvailable ? 'Y' : 'N';
    this.telemetryGeneratorService.generateExtraInfoTelemetry(
      values,
      PageId.LIBRARY
    );
  }

  applyProfileFilter(profileFilter: Array<any>, assembleFilter: Array<any>, categoryKey?: string) {
    if (categoryKey) {
      const nameArray = [];
      profileFilter.forEach(filterCode => {
        let nameForCode = this.appGlobalService.getNameForCodeInFramework(categoryKey, filterCode);

        if (!nameForCode) {
          nameForCode = filterCode;
        }

        nameArray.push(nameForCode);
      });

      profileFilter = nameArray;
    }


    if (!assembleFilter) {
      assembleFilter = [];
    }
    assembleFilter = assembleFilter.concat(profileFilter);

    const unique_array = [];

    for (let i = 0; i < assembleFilter.length; i++) {
      if (unique_array.indexOf(assembleFilter[i]) === -1 && assembleFilter[i].length > 0) {
        unique_array.push(assembleFilter[i]);
      }
    }

    assembleFilter = unique_array;

    if (assembleFilter.length === 0) {
      return undefined;
    }

    return assembleFilter;
  }
  ionViewDidLoad() {
    this.appGlobalService.generateConfigInteractEvent(PageId.LIBRARY, this.isOnBoardingCardCompleted);
  }

  ionViewDidEnter() {
    this.scrollToTop();
    this.preferences.getString('show_app_walkthrough_screen').toPromise()
      .then(value => {
        if (value === 'true') {
          const driver = new Driver({
            allowClose: true,
            closeBtnText: this.commonUtilService.translateMessage('DONE'),
            showButtons: true,
          });

          setTimeout(() => {
            driver.highlight({
              element: '#qrIcon',
              popover: {
                title: this.commonUtilService.translateMessage('ONBOARD_SCAN_QR_CODE'),
                description: '<img src="assets/imgs/ic_scanqrdemo.png" /><p>' + this.commonUtilService
                  .translateMessage('ONBOARD_SCAN_QR_CODE_DESC', this.appLabel) + '</p>',
                showButtons: true,         // Do not show control buttons in footer
                closeBtnText: this.commonUtilService.translateMessage('DONE'),
              }
            });

            const element = document.getElementById('driver-highlighted-element-stage');
            const img = document.createElement('img');
            img.src = 'assets/imgs/ic_scan.png';
            img.id = 'qr_scanner';
            element.appendChild(img);
          }, 100);
          this.telemetryGeneratorService.generatePageViewTelemetry(PageId.ONBOARDING_QR_SHOWCASE, Environment.ONBOARDING, PageId.LIBRARY);
          this.preferences.putString('show_app_walkthrough_screen', 'false').toPromise().then();
        }
      });
  }

  ionViewWillEnter() {
    this.events.subscribe('update_header', (data) => {
      this.headerServie.showHeaderWithHomeButton(['search', 'download']);
    });
    this.headerObservable = this.headerServie.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.headerServie.showHeaderWithHomeButton(['search', 'download']);

    this.getCategoryData();

    this.getCurrentUser();

    if (!this.pageLoadedSuccess) {
      this.getPopularContent();
    }
    this.subscribeSdkEvent();
    this.networkSubscription = this.commonUtilService.networkAvailability$.subscribe((available: boolean) => {
      if (available) {
        if (this.toast) {
          this.toast.dismiss();
          this.toast = undefined;
        }
      } else {
        this.presentToastForOffline('NO_INTERNET_TITLE');
      }
    });
  }

  // Offline Toast
  async presentToastForOffline(msg: string) {
    this.toast = await this.toastController.create({
      duration: 3000,
      message: this.commonUtilService.translateMessage(msg),
      showCloseButton: true,
      position: 'top',
      closeButtonText: '',
      cssClass: 'toastHeader'
    });
    this.toast.present();
    this.toast.onDidDismiss(() => {
      this.toast = undefined;
    });
  }

  subscribeSdkEvent() {
    this.eventSubscription = this.eventsBusService.events().subscribe((event: EventsBusEvent) => {
      if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED) {
        this.loadRecentlyViewedContent();
      }
    }) as any;
  }

  /**
   *
   * @param refresher
   */
  swipeDownToRefresh(refresher?, avoidRefreshList?) {
    this.refresh = true;
    this.storyAndWorksheets = [];

    this.getCategoryData();
    this.getCurrentUser();
    if (refresher) {
      refresher.complete();
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
    // this.qrScanner.startScanner(PageId.LIBRARY);
  }


  search() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.SEARCH_BUTTON_CLICKED,
      Environment.HOME,
      PageId.LIBRARY);
    // this.navCtrl.push(SearchPage, { contentType: ContentType.FOR_LIBRARY_TAB, source: PageId.LIBRARY });
  }
  onProfileClick() {
    // const currentProfile = (this.appGlobalService.isGuestUser) ? GuestProfilePage : ProfilePage;
    // this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
    //   'profile-button-clicked',
    //   Environment.HOME,
    //   PageId.LIBRARY);
    // this.navCtrl.push(currentProfile, { contentType: ContentType.FOR_LIBRARY_TAB, source: PageId.LIBRARY });
  }

  getCategoryData() {
    const syllabus: Array<string> = this.appGlobalService.getCurrentUser().syllabus;
    const frameworkId = (syllabus && syllabus.length > 0) ? syllabus[0] : undefined;
    const categories: Array<FrameworkCategoryCode> = FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES;
    this.getMediumData(frameworkId, categories);
    this.getGradeLevelData(frameworkId, categories);
  }

  getMediumData(frameworkId, categories): any {
    const req: GetFrameworkCategoryTermsRequest = {
      currentCategoryCode: FrameworkCategoryCode.MEDIUM,
      language: this.translate.currentLang,
      requiredCategories: categories,
      frameworkId: frameworkId
    };
    this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise()
      .then((res: CategoryTerm[]) => {
        this.categoryMediums = res;
        this.arrangeMediumsByUserData(this.categoryMediums.map(a => ({ ...a })));
      })
      .catch(() => {
      });
  }


  findWithAttr(array, attr, value) {
    for (let i = 0; i < array.length; i += 1) {
      if (array[i][attr].toLowerCase() === value.toLowerCase()) {
        return i;
      }
    }
    return -1;
  }

  arrangeMediumsByUserData(categoryMediumsParam) {
    if (this.appGlobalService.getCurrentUser() &&
      this.appGlobalService.getCurrentUser().medium &&
      this.appGlobalService.getCurrentUser().medium.length) {
      const mediumIndex = this.findWithAttr(categoryMediumsParam, 'name', this.appGlobalService.getCurrentUser().medium[0]);

      for (let i = mediumIndex; i > 0; i--) {
        categoryMediumsParam[i] = categoryMediumsParam[i - 1];
        if (i === 1) {
          categoryMediumsParam[0] = this.categoryMediums[mediumIndex];
        }
      }
      this.categoryMediums = categoryMediumsParam;

      for (let i = 0, len = this.categoryMediums.length; i < len; i++) {
        if (this.getGroupByPageReq.medium[0].toLowerCase().trim() === this.categoryMediums[i].name.toLowerCase().trim()) {
          this.mediumClick(this.categoryMediums[i].name);
        }
      }
    }
  }

  getGradeLevelData(frameworkId, categories): any {
    const req: GetFrameworkCategoryTermsRequest = {
      currentCategoryCode: FrameworkCategoryCode.GRADE_LEVEL,
      language: this.translate.currentLang,
      requiredCategories: categories,
      frameworkId: frameworkId
    };
    this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise()
      .then((res: CategoryTerm[]) => {
        this.categoryGradeLevels = res;
        for (let i = 0, len = this.categoryGradeLevels.length; i < len; i++) {
          if (this.getGroupByPageReq.grade[0] === this.categoryGradeLevels[i].name) {
            this.classClick(i);
          }
        }
      })
      .catch(err => {
      });
  }

  checkEmptySearchResult(isAfterLanguageChange = false) {
    const flags = [];
    _.forEach(this.storyAndWorksheets, (value, key) => {
      if (value.contents && value.contents.length) {
        flags[key] = true;
      }
    });

    if (flags.length && _.includes(flags, true)) {
    } else {
      if (!isAfterLanguageChange) {
        // if (this.tabs.getSelected().tabTitle === 'LIBRARY‌') {
        //   this.commonUtilService.showToast('NO_CONTENTS_FOUND');
        // }
      }
    }
  }

  showOfflineNetworkWarning() {
    this.presentToastForOffline('NO_INTERNET_TITLE');
  }

  checkNetworkStatus(showRefresh = false) {
    if (this.commonUtilService.networkInfo.isNetworkAvailable && showRefresh) {
      this.swipeDownToRefresh();
    }
  }


  showDisabled(resource) {
    return !resource.isAvailableLocally && !this.commonUtilService.networkInfo.isNetworkAvailable;
  }

  generateClassInteractTelemetry(currentClass: string, previousClass: string) {
    const values = new Map();
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
    const values = new Map();
    values['currentSelected'] = currentMedium;
    values['previousSelected'] = previousMedium;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.MEDIUM_CLICKED,
      Environment.HOME,
      PageId.LIBRARY,
      undefined,
      values);
  }

  classClick(index, isClassClicked?: boolean) {
    if (isClassClicked) {
      this.generateClassInteractTelemetry(this.categoryGradeLevels[index].name, this.getGroupByPageReq.grade[0]);
    }
    this.getGroupByPageReq.grade = [this.categoryGradeLevels[index].name];
    // [grade.name];
    if ((this.currentGrade) && (this.currentGrade.name !== this.categoryGradeLevels[index].name)) {
      this.getGroupByPage(false, !isClassClicked);
    }
    for (let i = 0, len = this.categoryGradeLevels.length; i < len; i++) {
      if (i === index) {
        this.currentGrade = this.categoryGradeLevels[i];
        this.current_index = this.categoryGradeLevels[i];
        this.categoryGradeLevels[i].selected = 'classAnimate';
      } else {
        this.categoryGradeLevels[i].selected = '';
      }
    }
    let el: HTMLElement | null = document.getElementById('class' + index);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
    } else {
      setTimeout(() => {
        el = document.getElementById('class' + index);
        el.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
      }, 1000);
    }
  }

  mediumClick(mediumName: string, isMediumClicked?: boolean) {
    if (isMediumClicked) {
      this.generateMediumInteractTelemetry(mediumName, this.getGroupByPageReq.medium[0]);
    }
    this.getGroupByPageReq.medium = [mediumName];
    if (this.currentMedium !== mediumName) {
      this.getGroupByPage(false, !isMediumClicked);
    }

    for (let i = 0, len = this.categoryMediums.length; i < len; i++) {
      if (this.categoryMediums[i].name === mediumName) {
        this.currentMedium = this.categoryMediums[i].name;
        this.categoryMediums[i].selected = true;
      } else {
        this.categoryMediums[i].selected = false;
      }
    }
  }

  navigateToDetailPage(item, index, sectionName) {
    const identifier = item.contentId || item.identifier;
    let telemetryObject: TelemetryObject;
    telemetryObject = new TelemetryObject(identifier, item.contentType, undefined);

    const values = new Map();
    values['sectionName'] = sectionName;
    values['positionClicked'] = index;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      'home',
      'library',
      telemetryObject,
      values);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      // this.navCtrl.push(CollectionDetailsEtbPage, {
      //   content: item
      // });
    } else {
    this.presentToastForOffline('OFFLINE_WARNING_ETBUI_1');
    }
  }

  launchContent() {
    // this.navCtrl.push(PlayerPage);
  }

  handleHeaderEvents($event) {
    console.log('inside handleHeaderEvents', $event);
    switch ($event.name) {
      case 'search': this.search();
            break;
      case 'download': this.redirectToActivedownloads();
            break;

    }
  }

  redirectToActivedownloads() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.HOME,
      PageId.LIBRARY);
    // this.navCtrl.push(ActiveDownloadsPage);
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  logScrollEnd(event) {
    // Added Telemetry on reaching Vertical Scroll End
    if (event && event.scrollElement.scrollHeight <= event.scrollElement.scrollTop + event.scrollElement.offsetHeight) {
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.SCROLL,
        InteractSubtype.BOOK_LIST_END_REACHED,
        Environment.HOME,
        this.source, undefined,
      );
    }
  }
  onScroll(event) {
    // Added Telemetry on reaching Horizontal Scroll End
    if (event && event.target.scrollWidth <= event.target.scrollLeft + event.target.offsetWidth) {
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.SCROLL,
        InteractSubtype.RECENTLY_VIEWED_END_REACHED,
        Environment.HOME,
        this.source, undefined,
      );
    }
  }

  scrollToTop() {

    this.contentView.scrollToTop();
    // this.contentView._scrollContent.nativeElement.scrollToTop();

  }

}
