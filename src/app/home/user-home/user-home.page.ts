import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppGlobalService, AppHeaderService, CommonUtilService, ContentAggregatorHandler, SunbirdQRScanner} from '@app/services';
import {
  ButtonPosition,
  CourseCardGridTypes,
  LibraryCardTypes,
  PillShape,
  PillsMultiRow,
  PillsViewType,
  SelectMode,
  ShowMoreViewType
} from '@project-sunbird/common-consumption-v8';
import {NavigationExtras, Router} from '@angular/router';
import {
  CachedItemRequestSourceFrom,
  ContentAggregatorRequest,
  ContentSearchCriteria,
  Framework,
  FrameworkCategoryCodesGroup,
  FrameworkDetailsRequest,
  FrameworkService,
  Profile,
  ProfileService,
  ProfileType,
  SearchType
} from '@project-sunbird/sunbird-sdk';
import {
  AudienceFilter,
  ColorMapping,
  EventTopics,
  PrimaryCaregoryMapping,
  ProfileConstants,
  RouterLinks,
  SubjectMapping,
  ViewMore
} from '../../app.constant';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {OnTabViewWillEnter} from '@app/app/tabs/on-tab-view-will-enter';
import { AggregatorPageType } from '@app/services/content/content-aggregator-namespaces';
import { NavigationService } from '@app/services/navigation-handler.service';
import { Events, IonContent as ContentView, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SbSubjectListPopupComponent } from '@app/app/components/popups/sb-subject-list-popup/sb-subject-list-popup.component';
import { FrameworkCategory } from '@project-sunbird/client-services/models/channel';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.page.html',
  styleUrls: ['./user-home.page.scss'],
})
export class UserHomePage implements OnInit, OnDestroy, OnTabViewWillEnter {
  private frameworkCategoriesMap: {[code: string]: FrameworkCategory | undefined} = {};

  aggregatorResponse = [];
  courseCardType = CourseCardGridTypes;
  selectedFilter: string;
  concatProfileFilter: Array<string> = [];
  boards: string;
  medium: string;
  grade: string;
  profile: Profile;
  guestUser: boolean;
  appLabel: string;

  displaySections?: any[];
  headerObservable: Subscription;

  pillsViewType = PillsViewType;
  selectMode = SelectMode;
  pillShape = PillShape;
  @ViewChild('contentView', { static: false }) contentView: ContentView;
  showPreferenceInfo = false;

  LibraryCardTypes = LibraryCardTypes;
  ButtonPosition = ButtonPosition;
  ShowMoreViewType = ShowMoreViewType;
  PillsMultiRow = PillsMultiRow;
  audienceFilter = [];

  constructor(
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    public commonUtilService: CommonUtilService,
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

  async getUserProfileDetails() {
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

  async getFrameworkDetails(frameworkId?: string) {
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

        if (this.profile.board && this.profile.board.length) {
          this.boards = this.commonUtilService.arrayToString(this.getFieldDisplayValues(this.profile.board, 'board'));
        }
        if (this.profile.medium && this.profile.medium.length) {
          this.medium = this.commonUtilService.arrayToString(this.getFieldDisplayValues(this.profile.medium, 'medium'));
        }
        if (this.profile.grade && this.profile.grade.length) {
          this.grade = this.commonUtilService.arrayToString(this.getFieldDisplayValues(this.profile.grade, 'gradeLevel'));
        }
      });
  }

  getFieldDisplayValues(field: Array<any>, categoryCode: string): any[] {
    const displayValues = [];

    if (!this.frameworkCategoriesMap[categoryCode]) {
      return displayValues;
    }

    this.frameworkCategoriesMap[categoryCode].terms.forEach(element => {
      if (field.includes(element.code)) {
        displayValues.push(element.name.toLowerCase());
      }
    });

    return displayValues;
  }

  async fetchDisplayElements() {
    this.displaySections = undefined;
    const request: ContentAggregatorRequest = {
      userPreferences: {
        'board': this.getFieldDisplayValues(this.profile.board, 'board'),
        'medium': this.getFieldDisplayValues(this.profile.medium, 'medium'),
        'gradeLevel': this.getFieldDisplayValues(this.profile.grade, 'gradeLevel'),
        'subject': this.getFieldDisplayValues(this.profile.subject, 'subject'),
      },
      interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => {
        contentSearchCriteria.board = this.getFieldDisplayValues(this.profile.board, 'board');
        contentSearchCriteria.medium = this.getFieldDisplayValues(this.profile.medium, 'medium');
        contentSearchCriteria.grade = this.getFieldDisplayValues(this.profile.grade, 'gradeLevel');
        return contentSearchCriteria;
      }, from: CachedItemRequestSourceFrom.SERVER
    };
    let displayItems = await this.contentAggregatorHandler.newAggregate(request, AggregatorPageType.HOME);
    displayItems = this.mapContentFacteTheme(displayItems);
    this.displaySections = displayItems;
  }

  handlePillSelect(event) {
    if (!event || !event.data || !event.data.length) {
      return;
    }
    const params = {
      formField: event.data[0].value,
      fromLibrary: false
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
    const params: NavigationExtras = {
      state
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
        title
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
        if (displayItems[count].dataSrc && (displayItems[count].dataSrc.type === 'CONTENT_FACETS') && (displayItems[count].dataSrc.facet === 'subject')) {
          displayItems[count] = this.mapSubjectTheme(displayItems[count]);
        }
        if (displayItems[count].dataSrc && (displayItems[count].dataSrc.type === 'CONTENT_FACETS') && (displayItems[count].dataSrc.facet === 'primaryCategory')) {
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
    return displayItems;
  }

  mapPrimaryCategoryTheme(displayItems) {
    displayItems.data.forEach(item => {
      const primaryCaregoryMap = item.facet && PrimaryCaregoryMapping[item.facet.toLowerCase()] ? PrimaryCaregoryMapping[item.facet.toLowerCase()] :
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

  tabViewWillEnter() {
    this.headerService.showHeaderWithHomeButton(['download', 'notification']);
    this.getUserProfileDetails();
  }
}
