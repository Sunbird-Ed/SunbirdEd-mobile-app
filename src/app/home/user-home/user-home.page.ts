import { CorReleationDataType, ImpressionType, PageId } from './../../../services/telemetry-constants';
import { TelemetryGeneratorService } from './../../../services/telemetry-generator.service';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AppGlobalService,
  AppHeaderService,
  CommonUtilService,
  ContentAggregatorHandler,
  Environment,
  FormAndFrameworkUtilService,
  ImpressionSubtype,
  InteractSubtype,
  InteractType,
  SunbirdQRScanner
} from '@app/services';
import {
  ButtonPosition,
  CourseCardGridTypes,
  LibraryCardTypes,
  PillShape,
  PillsMultiRow,
  PillsViewType,
  SelectMode,
  ShowMoreViewType
} from '@project-sunbird/common-consumption';
import {NavigationExtras, Router} from '@angular/router';
import {
  CachedItemRequestSourceFrom,
  ContentAggregatorRequest,
  ContentSearchCriteria,
  ContentService,
  CorrelationData,
  Framework,
  FrameworkCategoryCode,
  FrameworkCategoryCodesGroup,
  FrameworkDetailsRequest,
  FrameworkService,
  FrameworkUtilService,
  GetFrameworkCategoryTermsRequest,
  Profile,
  ProfileService,
  ProfileType,
  SearchType,
  SharedPreferences
} from '@project-sunbird/sunbird-sdk';
import {
  AudienceFilter,
  ColorMapping,
  EventTopics,
  PrimaryCaregoryMapping,
  PrimaryCategory,
  ProfileConstants,
  RouterLinks,
  SubjectMapping,
  ViewMore
} from '../../app.constant';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {OnTabViewWillEnter} from '@app/app/tabs/on-tab-view-will-enter';
import {AggregatorPageType} from '@app/services/content/content-aggregator-namespaces';
import {NavigationService} from '@app/services/navigation-handler.service';
import {IonContent as ContentView, IonRefresher, ModalController} from '@ionic/angular';
import {Events} from '@app/util/events';
import {Subscription} from 'rxjs';
import {SbSubjectListPopupComponent} from '@app/app/components/popups/sb-subject-list-popup/sb-subject-list-popup.component';
import {CategoryTerm, FrameworkCategory} from '@project-sunbird/client-services/models/channel';
import { FrameworkSelectionDelegateService } from './../../profile/framework-selection/framework-selection.page';
import { TranslateService } from '@ngx-translate/core';
import { SplaschreenDeeplinkActionHandlerDelegate } from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { SegmentationTagService } from '@app/services/segmentation-tag/segmentation-tag.service';
import { FormConstants } from '@app/app/form.constants';
import { SbPopoverComponent } from '../../components/popups';
import { PopoverController } from '@ionic/angular'
import { SbPreferencePopupComponent } from './../../components/popups/sb-preferences-popup/sb-preferences-popup.component';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.page.html',
  styleUrls: ['./user-home.page.scss'],
})
export class UserHomePage implements OnInit, OnDestroy, OnTabViewWillEnter {
  private frameworkCategoriesMap: {[code: string]: FrameworkCategory | undefined} = {};

  @ViewChild('refresher', { static: false }) refresher: IonRefresher;

  aggregatorResponse = [];
  courseCardType = CourseCardGridTypes;
  selectedFilter: string;
  concatProfileFilter: Array<string> = [];
  profile: Profile;
  guestUser: boolean;
  appLabel: string;

  displaySections?: any[];
  headerObservable: Subscription;

  pillsViewType = PillsViewType;
  selectMode = SelectMode;
  pillShape = PillShape;
  @ViewChild('contentView', { static: false }) contentView: ContentView;

  LibraryCardTypes = LibraryCardTypes;
  ButtonPosition = ButtonPosition;
  ShowMoreViewType = ShowMoreViewType;
  PillsMultiRow = PillsMultiRow;
  audienceFilter = [];
  newThemeTimeout: any;
  refresh: boolean;
  homeDataAvailable = false;
  displayBanner: boolean;
  bannerSegment: any;
  preferenceList = [];
  boardList = [];
  mediumList = [];
  gradeLevelList = [];
  otherCategories=[];
  subjectList = [];
  primaryBanner = [];
  secondaryBanner = [];

  constructor(
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    public commonUtilService: CommonUtilService,
    private router: Router,
    private appGlobalService: AppGlobalService,
    private appVersion: AppVersion,
    private contentAggregatorHandler: ContentAggregatorHandler,
    private navService: NavigationService,
    private headerService: AppHeaderService,
    private events: Events,
    private qrScanner: SunbirdQRScanner,
    private modalCtrl: ModalController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private frameworkSelectionDelegateService: FrameworkSelectionDelegateService,
    private translate: TranslateService,
    private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
    private segmentationTagService: SegmentationTagService,
    private popoverCtrl: PopoverController,
  ) {
  }

  ngOnInit() {
    this.events.subscribe(AppGlobalService.PROFILE_OBJ_CHANGED, () => {
      this.getUserProfileDetails();
    });

    this.events.subscribe('refresh:loggedInProfile', () => {
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
    this.getUserProfileDetails();
  }

  doRefresh(refresher?) {
    this.refresh = true;
    this.fetchDisplayElements(refresher);
  }

  private async getUserProfileDetails() {
    this.profile = await this.profileService.getActiveSessionProfile(
      { requiredFields: ProfileConstants.REQUIRED_FIELDS }
    ).toPromise();
    await this.getFrameworkDetails();
    await this.fetchDisplayElements();
    this.guestUser = !this.appGlobalService.isUserLoggedIn();
    if (this.guestUser) {
      this.audienceFilter = AudienceFilter.GUEST_TEACHER;
    } else if (this.guestUser && this.profile.profileType === ProfileType.STUDENT) {
      this.audienceFilter = AudienceFilter.GUEST_STUDENT;
    } else {
      this.audienceFilter = AudienceFilter.LOGGED_IN_USER;
    }
    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appLabel = appName;
      });
    // impression telemetry
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.PAGE_LOADED,
      ImpressionSubtype.LOCATION,
      PageId.HOME,
      Environment.HOME
    );
  }


  editProfileDetails() {
    if (!this.guestUser) {
      this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {state: {shouldUpdatePreference: true}});
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

  private async getFrameworkDetails(frameworkId?: string) {
    const frameworkDetailsRequest: FrameworkDetailsRequest = {
      frameworkId: (this.profile && this.profile.syllabus && this.profile.syllabus[0]) ? this.profile.syllabus[0] : '',
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };
    await this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
      .then(async (framework: Framework) => {
        this.frameworkCategoriesMap = framework.categories.reduce((acc, category) => {
          acc[category.code] = category;
          return acc;
        }, {});
        this.preferenceList = [];
        setTimeout(() => {
          this.boardList = this.getFieldDisplayValues(this.profile.board, 'board');
          this.mediumList = this.getFieldDisplayValues(this.profile.medium, 'medium');
          this.gradeLevelList = this.getFieldDisplayValues(this.profile.grade, 'gradeLevel');
          this.subjectList = this.getFieldDisplayValues(this.profile.subject, 'subject');

          this.preferenceList.push(this.boardList);
          this.preferenceList.push(this.mediumList);
          this.preferenceList.push(this.gradeLevelList);
        }, 0);
      });
  }

  getFieldDisplayValues(field: Array<any>, categoryCode: string, lowerCase?: boolean): any[] {
    const displayValues = [];

    if (!this.frameworkCategoriesMap[categoryCode]) {
      return displayValues;
    }

    this.frameworkCategoriesMap[categoryCode].terms.forEach(element => {
      if (field.includes(element.code)) {
        if (lowerCase) {
          displayValues.push(element.name.toLowerCase());
        } else {
          displayValues.push(element.name);
        }
      }
    });

    return displayValues;
  }

  private async fetchDisplayElements(refresher?) {
    this.displaySections = undefined;
    const request: ContentAggregatorRequest = {
      userPreferences: {
        board: this.getFieldDisplayValues(this.profile.board, 'board', true),
        medium: this.getFieldDisplayValues(this.profile.medium, 'medium', true),
        gradeLevel: this.getFieldDisplayValues(this.profile.grade, 'gradeLevel', true),
        subject: this.getFieldDisplayValues(this.profile.subject, 'subject', true),
      },
      interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => {
        contentSearchCriteria.board = this.getFieldDisplayValues(this.profile.board, 'board', true);
        contentSearchCriteria.medium = this.getFieldDisplayValues(this.profile.medium, 'medium', true);
        contentSearchCriteria.grade = this.getFieldDisplayValues(this.profile.grade, 'gradeLevel', true);
        return contentSearchCriteria;
      }, from: refresher ? CachedItemRequestSourceFrom.SERVER : CachedItemRequestSourceFrom.CACHE
    };
    let displayItems = await this.contentAggregatorHandler.newAggregate(request, AggregatorPageType.HOME);
    this.getOtherMLCategories()
    displayItems = this.mapContentFacteTheme(displayItems);
    this.checkHomeData(displayItems);
    this.displaySections = displayItems;
    this.showorHideBanners();
    this.refresh = false;
    refresher ? refresher.target.complete() : null;
  }

  handlePillSelect(event, section, isFromPopover?: boolean) {
    if (!event || !event.data || !event.data.length) {
      return;
    }
    const corRelationList: Array<CorrelationData> = [];
    corRelationList.push({
      id: event.data[0].name || '',
      type: isFromPopover ? CorReleationDataType.SUBJECT : CorReleationDataType.CATEGORY});
    this.telemetryGeneratorService.generateInteractTelemetry(
      isFromPopover ? InteractType.SELECT_ATTRIBUTE : InteractType.SELECT_CATEGORY,
      isFromPopover ? '' : event.data[0].name,
      Environment.HOME,
      PageId.HOME,
      undefined, undefined, undefined,
      isFromPopover ? corRelationList : undefined
    );
    if(section.dataSrc && section.dataSrc.params && section.dataSrc.params.config){
      const filterConfig = section.dataSrc.params.config.find(((facet) => (facet.type === 'filter' && facet.code === section.code)));
      event.data[0].value['primaryFacetFilters'] = filterConfig ? filterConfig.values : undefined;
    }
    const params = {
      code: section.code,
      formField: event.data[0].value,
      fromLibrary: false,
      description: (section && section.description) || ''
    };
    this.router.navigate([RouterLinks.CATEGORY_LIST], { state: params });
  }

  navigateToViewMoreContentsPage(section, subsection) {
    let state = {};
    switch (section.dataSrc.type) {
      case 'TRACKABLE_COLLECTIONS':
        state = {
          enrolledCourses: subsection.contents,
          pageName: ViewMore.PAGE_COURSE_ENROLLED,
          headerTitle: this.commonUtilService.getTranslatedValue(section.title, ''),
          userId: this.appGlobalService.getUserId()
        };
        break;
      case 'RECENTLY_VIEWED_CONTENTS':
        state = {
          requestParams: {
            request: {
              searchType: SearchType.FILTER,
              offset: 0
            }
          },
          pageName: ViewMore.PAGE_TV_PROGRAMS,
          headerTitle: this.commonUtilService.getTranslatedValue(section.title, ''),
        };
        break;
    }

    const values = new Map();
    values['SectionName'] = JSON.parse(section.title)['en'];
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.VIEWALL_CLICKED,
      Environment.HOME,
      PageId.HOME, undefined,
      values);
    const params: NavigationExtras = {
      state
    };
    this.router.navigate([RouterLinks.VIEW_MORE_ACTIVITY], params);
  }

  navigateToDetailPage(event, sectionName) {
    event.data = event.data.content ? event.data.content : event.data;
    const item = event.data;
    const index = event.index;
    const values = {};
    values['sectionName'] = sectionName;
    values['positionClicked'] = index;
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      this.navService.navigateToDetailPage(item, { content: item }); 
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
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.HOME,
      PageId.HOME);
    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  redirectToNotifications() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SELECT_BELL,
      Environment.HOME,
      PageId.HOME);
    this.router.navigate([RouterLinks.NOTIFICATION]);
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe('update_header');
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    this.refresher.disabled = true;
  }

  ngOnDestroy() {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
  }

  ionViewDidLeave() {
    if (this.newThemeTimeout && this.newThemeTimeout.clearTimeout) {
      this.newThemeTimeout.clearTimeout();
    }
  }

  ionViewDidEnter() {
    // Need timer to load the newTheme screen and for the newTheme screen to hide if user comes from deeplink.
    // this.newThemeTimeout = setTimeout(() => {
    //   this.appGlobalService.showJoyfulPopup();
    // }, 2000);
    this.refresher.disabled = false;
  }

  async viewPreferenceInfo() {
    const preferenceData = [
      {
        name: this.commonUtilService.translateMessage('BOARD'),
        list: this.boardList && this.boardList.length ? [this.boardList] : []
      },
      {
          name: this.commonUtilService.translateMessage('MEDIUM'),
          list: this.mediumList && this.mediumList.length ? [this.mediumList] : []
      },
      {
          name: this.commonUtilService.translateMessage('CLASS'),
          list: this.gradeLevelList && this.gradeLevelList.length ? [this.gradeLevelList] : []
      },
      {
          name: this.commonUtilService.translateMessage('SUBJECT'),
          list: this.subjectList && this.subjectList.length ? [this.subjectList] : []
      }
    ]
    const subjectListPopover = await this.modalCtrl.create({
      component: SbPreferencePopupComponent,
      componentProps: {
        userName: this.profile && this.profile.handle || '',
        preferenceData
      },
      backdropDismiss: true,
      showBackdrop: true,
      cssClass: 'preference-popup',
    });
    await subjectListPopover.present();
    const { data } = await subjectListPopover.onDidDismiss();
    if (data && data.showPreference) {
      this.editProfileDetails();
    }
  }

  async onViewMorePillList(event, section) {
    if (!event || !event.data) {
      return;
    }
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_VIEW_ALL,
      '',
      Environment.HOME,
      PageId.HOME
    );
    const subjectListPopover = await this.modalCtrl.create({
      component: SbSubjectListPopupComponent,
      componentProps: {
        subjectList: event.data,
        title: section && section.title,
        theme: section && section.theme
      },
      backdropDismiss: true,
      showBackdrop: true,
      cssClass: 'subject-list-popup',
    });
    await subjectListPopover.present();
    const { data } = await subjectListPopover.onDidDismiss();
    this.handlePillSelect(data, section, true);
  }

  mapContentFacteTheme(displayItems) {
    if (displayItems && displayItems.length) {
      for (let count = 0; count < displayItems.length; count++) {
        if (!displayItems[count].data) {
          continue;
        }
        if (displayItems[count].dataSrc && (displayItems[count].dataSrc.type
           === 'CONTENT_FACETS') && (displayItems[count].dataSrc.facet === 'subject')) {
          displayItems[count] = this.mapSubjectTheme(displayItems[count]);
        }
        if (displayItems[count].dataSrc && (displayItems[count].dataSrc.type
           === 'CONTENT_FACETS') && (displayItems[count].dataSrc.facet === 'primaryCategory')) {
          displayItems[count] = this.mapPrimaryCategoryTheme(displayItems[count]);
        }
        if (displayItems[count].dataSrc && displayItems[count].dataSrc.type === 'RECENTLY_VIEWED_CONTENTS') {
          displayItems[count] = this.modifyContentData(displayItems[count]);
        }
        if (displayItems[count].dataSrc && displayItems[count].dataSrc.type === 'TRACKABLE_COLLECTIONS') {
          displayItems[count] = this.modifyCourseData(displayItems[count]);
        }
      }
    }
    return displayItems;
  }

  mapSubjectTheme(displayItems) {
    displayItems.data.forEach(item => {
      const subjectMap = item.facet && SubjectMapping[item.facet.toLowerCase()]
       ? SubjectMapping[item.facet.toLowerCase()] : SubjectMapping['default'];
      item.icon = item.icon ? item.icon : subjectMap.icon;
      item.theme = item.theme ? item.theme : subjectMap.theme;
      if (!item.theme) {
        const colorTheme = ColorMapping[Math.floor(Math.random() * ColorMapping.length)];
        item.theme = {
          iconBgColor: colorTheme.primary,
          pillBgColor: colorTheme.secondary
        };
      }
    });
    return displayItems;
  }

  mapPrimaryCategoryTheme(displayItems) {
    displayItems.data.forEach(item => {
      const primaryCaregoryMap = item.facet && PrimaryCaregoryMapping
      [item.facet.toLowerCase()] ? PrimaryCaregoryMapping[item.facet.toLowerCase()] :
        PrimaryCaregoryMapping['default'];
      item.icon = item.icon ? item.icon : primaryCaregoryMap.icon;
    });
    return displayItems;
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
    return displayItems;
  }

  modifyCourseData(displayItems) {
    if (!displayItems.data.sections && !displayItems.data.sections[0] && !displayItems.data.sections[0].contents) {
      return;
    }
    displayItems.data.sections[0].contents.forEach(item => {
      item['cardImg'] = item['cardImg'] || (item.content && item.content['appIcon']);
    });
    return displayItems;
  }

  checkHomeData(displayItems) {
    this.homeDataAvailable = false;
    for (let index = 0; index < displayItems.length; index++) {
      if (displayItems[index] && displayItems[index].data && ((displayItems[index].data.length) ||
        (displayItems[index].data.sections && displayItems[index].data.sections.length && displayItems[index].data.sections[0].contents && displayItems[index].data.sections[0].contents.length)
      )) {
        this.homeDataAvailable = true;
        break;
      }
    }
  }

  async requestMoreContent() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.LET_US_KNOW_CLICKED,
      Environment.LIBRARY,
      PageId.LIBRARY,
    );

    const formConfig = await this.formAndFrameworkUtilService.getContentRequestFormConfig();
    this.appGlobalService.formConfig = formConfig;
    this.frameworkSelectionDelegateService.delegate = this;
    this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.FRAMEWORK_SELECTION}`],
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
    router.navigate([`/${RouterLinks.RESOURCES}/${RouterLinks.RELEVANT_CONTENTS}`], { state: params });
  }

  async exploreOtherContents() {
    const categories: Array<FrameworkCategoryCode> = FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES;
    const syllabus: Array<string> = this.appGlobalService.getCurrentUser().syllabus;
    const frameworkId = (syllabus && syllabus.length) ? syllabus[0] : undefined;

    const navigationExtras = {
      state: {
        subjects: await this.getFrameworkData(frameworkId, categories, FrameworkCategoryCode.SUBJECT),
        categoryGradeLevels:  await this.getFrameworkData(frameworkId, categories, FrameworkCategoryCode.GRADE_LEVEL),
        primaryCategories: PrimaryCategory.FOR_LIBRARY_TAB,
        selectedGrade: this.profile.grade,
        selectedMedium: this.profile.medium
      }
    };
    this.router.navigate([RouterLinks.EXPLORE_BOOK], navigationExtras);
  }

  async getFrameworkData(frameworkId, requiredCategories, currentCategoryCode): Promise<CategoryTerm[]> {
    const req: GetFrameworkCategoryTermsRequest = {
      currentCategoryCode,
      language: this.translate.currentLang,
      requiredCategories,
      frameworkId
    };
    try {
      return await this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise();
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  tabViewWillEnter() {
    this.headerService.showHeaderWithHomeButton(['download', 'notification']);
    this.getUserProfileDetails();
  }

  navigateToSpecificLocation(event, section) {
    let banner = Array.isArray(event.data) ? event.data[0].value : event.data;
    const corRelationList: Array<CorrelationData> = [];
    corRelationList.push({ id: banner || '', type: 'BannerType' });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_BANNER,
      '',
      Environment.HOME,
      PageId.HOME, undefined, undefined, undefined,
      corRelationList
     );
    switch (banner.code) {
      case 'banner_external_url':
           this.commonUtilService.openLink(banner.action.params.route);
           break;
      case 'banner_internal_url':
            if (this.guestUser && banner.action.params.route === RouterLinks.PROFILE) {
              this.router.navigate([`/${RouterLinks.GUEST_PROFILE}`]);
            } else {
              this.router.navigate([banner.action.params.route]);
            }
            break;
      case 'banner_search':
          // const extras = {
          //   state: {
          //     source: PageId.HOME,
          //     corRelation: corRelationList,
          //     preAppliedFilter: event.data.action.params.filter,
          //     hideSearchOption: true,
          //     searchWithBackButton: true
          //   }
          // };
          // this.router.navigate(['search'], extras);
        if (banner.action && banner.action.params && banner.action.params.filter) {
          (banner['searchCriteria'] as ContentSearchCriteria) =
            this.contentService.formatSearchCriteria({ request: banner.action.params.filter });
          if (section.dataSrc && section.dataSrc.mapping) {
            const bannerMap = section.dataSrc.mapping.find(m => m.code === banner.code);
            if(bannerMap){
              banner = {...banner, ...bannerMap};
            }
            banner['facet'] = (banner.ui && banner.ui.text) || ''
          }
        }
        this.handlePillSelect({data: [{value: banner}]}, section);
        break;
      case 'banner_content':
        this.splaschreenDeeplinkActionHandlerDelegate.navigateContent(banner.action.params.identifier,
          undefined, undefined, undefined, undefined, corRelationList);
        break;
    }
  }

  showorHideBanners() {
    this.bannerSegment = this.segmentationTagService.exeCommands.filter((cmd) => {
      if (cmd.controlFunction === 'BANNER_CONFIG') {
        return cmd;
      }
    });
    this.displayBanner = !!(this.bannerSegment && this.bannerSegment.length);
    this.bannerSegment = this.bannerSegment.reduce((accumulator, cmd) => {
      const bannerConfig = cmd.controlFunctionPayload.values.filter((value) =>
        Number(value.expiry) > Math.floor(Date.now() / 1000));
      accumulator = accumulator.concat(bannerConfig);
      return accumulator;
    }, []);
    if (this.bannerSegment ) {
      this.setBannerConfig();
    }
  }

  setBannerConfig() {
    this.displaySections.forEach((section, index) => {
      if (section.dataSrc.type === 'CONTENT_DISCOVERY_BANNER') {
        const corRelationList: Array<CorrelationData> = [];
        corRelationList.push({ id: this.boardList.join(',') || '', type: CorReleationDataType.BOARD });
        corRelationList.push({ id: this.gradeLevelList.join(',') || '', type: CorReleationDataType.CLASS });
        corRelationList.push({ id: this.mediumList.join(',') || '', type: CorReleationDataType.MEDIUM });
        corRelationList.push({ id: (this.profile && this.profile.profileType)
          ? this.profile.profileType : '', type: CorReleationDataType.USERTYPE });
        this.telemetryGeneratorService.generateImpressionTelemetry(
          ImpressionType.VIEW, ImpressionSubtype.BANNER,
          PageId.HOME,
          Environment.HOME,
          undefined,
          undefined,
          undefined,
          undefined,
          corRelationList
         );
         this.displaySections[index]['data'] = this.bannerSegment;
         this.primaryBanner = [];
         this.secondaryBanner = [];
         this.bannerSegment.forEach((banner) => {
           if (banner.type === 'secondary') {
             this.secondaryBanner.push(banner);
           } else {
             this.primaryBanner.push(banner)
           }
         });
      }
    });
  }

  async getOtherMLCategories() {
    try {
      const board = this.profile.syllabus[0]
      let role = this.profile.profileType.toLowerCase()
      if (this.profile.serverProfile) {
        role = this.profile.serverProfile.profileUserType.type.toLowerCase()
      }
      const otherCategories = await this.formAndFrameworkUtilService.getFormFields(
        FormConstants.ML_HOME_CATEGORIES
      );
      this.otherCategories = otherCategories[board][role]
      if (this.otherCategories.length) {
        this.homeDataAvailable=true
        this.events.publish('onPreferenceChange:showReport',true)
      } else {
        this.events.publish('onPreferenceChange:showReport',false)
      }
    } catch (error) {
      this.otherCategories = [],
      this.events.publish('onPreferenceChange:showReport',false)

    }
  }

  async handleOtherCategories(event) {
    if (!event || !event.data || !event.data.length) {
      return;
    }
    let selectedPill = event.data[0].value.name
    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverMainTitle: this.commonUtilService.translateMessage('FRMELEMENTS_MSG_YOU_MUST_JOIN_TO_OBSERVATIONS'),
        metaInfo: this.commonUtilService.translateMessage('FRMELEMENTS_MSG_ONLY_REGISTERED_USERS_CAN_TAKE_OBSERVATION'),
        sbPopoverHeading: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
        isNotShowCloseIcon: true,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
            btnClass: 'popover-color label-uppercase label-bold-font'
          },
        ]
      },
      cssClass: 'sb-popover info',
    });
    if (this.guestUser) {
      await confirm.present();
      const { data } = await confirm.onDidDismiss();
      if (data && data.canDelete) {
        this.router.navigate([RouterLinks.SIGN_IN], {state: {navigateToCourse: true}});
      }
      return
    }
    switch (selectedPill) {
      case 'observation':
      this.router.navigate([RouterLinks.OBSERVATION], {})
        break;
      default:
        break;
    }
  }


}


