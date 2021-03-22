import { Component, Inject, NgZone, OnDestroy, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Platform, PopoverController, IonContent, NavController } from '@ionic/angular';
import { Events } from '@app/util/events';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import each from 'lodash/each';
import find from 'lodash/find';
import map from 'lodash/map';
import {
  CachedItemRequestSourceFrom, Content, ContentDetailRequest, ContentEventType, ContentImport, ContentImportRequest,
  ContentImportResponse, ContentImportStatus, ContentSearchCriteria, ContentSearchResult, ContentService,
  CorrelationData, DownloadEventType, DownloadProgress, EventsBusEvent, EventsBusService, PageAssembleCriteria,
  PageAssembleFilter, PageAssembleService, PageName, ProfileType, SearchType, SharedPreferences, TelemetryObject,
  NetworkError, CourseService, CourseBatchesRequest, CourseEnrollmentType, CourseBatchStatus, Course, Batch,
  FetchEnrolledCourseRequest, Profile,
  ProfileService, Framework,
  FrameworkCategoryCodesGroup,
  FrameworkDetailsRequest,
  FrameworkService,
  FrameworkUtilService,
  GetSuggestedFrameworksRequest, SearchEntry,
  SearchHistoryService, SortOrder,
  GroupActivity
} from 'sunbird-sdk';
import { Map } from '@app/app/telemetryutil';
import {
  BatchConstants,
  RouterLinks, Search, ContentCard,
  ContentFilterConfig
} from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
  Environment, ImpressionType, InteractSubtype,
  InteractType, LogLevel, Mode, PageId, CorReleationDataType,
  AuditType, ImpressionSubtype, ObjectType
} from '@app/services/telemetry-constants';
import { AppHeaderService } from '@app/services/app-header.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { SearchHistoryNamespaces } from '@app/config/search-history-namespaces';
import { featureIdMap } from '@app/app/feature-id-map';
import { EnrollmentDetailsComponent } from '../components/enrollment-details/enrollment-details.component';
import { ContentUtil } from '@app/util/content-util';
import { LibraryCardTypes, PillBorder, PillsViewType, SelectMode } from '@project-sunbird/common-consumption-v8';
import { Subscription, Observable, from } from 'rxjs';
import { switchMap, tap, map as rxjsMap, share, startWith, debounceTime } from 'rxjs/operators';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { applyProfileFilter, updateFilterInSearchQuery } from '@app/util/filter.util';
import { GroupHandlerService } from '@app/services';
import { NavigationService } from '@app/services/navigation-handler.service';
import { CsGroupAddableBloc } from '@project-sunbird/client-services/blocs';
import { CsContentType } from '@project-sunbird/client-services/services/content';
import { ProfileHandler } from '@app/services/profile-handler';
import { FormConstants } from '../form.constants';
import { animate, state, style, transition, trigger } from '@angular/animations';

declare const cordova;
@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  animations: [
    trigger('labelVisibility', [
      state(
        'show',
        style({
          maxHeight: '50vh',
          overflow: 'hidden'
        })
      ),
      state(
        'hide',
        style({
          maxHeight: '0',
          overflow: 'hidden'
        })
      ),
      transition('* => show', [animate('500ms ease-out')]),
      transition('show => hide', [animate('500ms ease-in')])
    ])
  ],
})
export class SearchPage implements OnInit, AfterViewInit, OnDestroy {
  public searchHistory$: Observable<SearchEntry[]>;
  appName: string;
  showLoading: boolean;
  downloadProgress: any;
  @ViewChild('searchInput', { static: false }) searchBar;
  primaryCategories: Array<string> = [];
  source: string;
  groupId: string;
  activityTypeData: any;
  activityList: GroupActivity[] = [];
  isFromGroupFlow = false;
  dialCode: string;
  dialCodeResult: Array<any> = [];
  dialCodeContentResult: Array<any> = [];
  searchContentResult: Array<any> = [];
  showLoader = false;
  filterIcon;
  searchKeywords = '';
  responseData: any;
  isDialCodeSearch = false;
  showEmptyMessage: boolean;
  defaultAppIcon: string;
  isEmptyResult = false;
  queuedIdentifiers = [];
  isDownloadStarted = false;
  currentCount = 0;
  parentContent: any = undefined;
  contentData: any;
  childContent: any = undefined;
  loadingDisplayText = this.commonUtilService.translateMessage('LOADING_CONTENT');
  eventSubscription?: Subscription;
  displayDialCodeResult: any;
  profile: Profile;
  isFirstLaunch = false;
  shouldGenerateEndTelemetry = false;
  backButtonFunc: Subscription;
  isSingleContent = false;
  currentFrameworkId = '';
  selectedLanguageCode = '';
  private corRelationList: Array<CorrelationData>;
  layoutName = 'search';
  enrolledCourses: any;
  guestUser: any;
  batches: any;
  loader?: any;
  userId: any;
  identifier: string;
  categories: Array<any> = [];
  boardList: Array<any> = [];
  mediumList: Array<any> = [];
  gradeList: Array<any> = [];
  isProfileUpdated: boolean;
  isQrCodeLinkToContent: any;
  LibraryCardTypes = LibraryCardTypes;
  initialFilterCriteria: any;
  showAddToGroupButtons = false;
  supportedUserTypesConfig: Array<any>;
  searchFilterConfig: Array<any>;
  preAppliedFilter: any;
  enableSearch = false;
  searchInfolVisibility = 'show';

  @ViewChild('contentView', { static: false }) contentView: IonContent;
  headerObservable: Subscription;
  primaryCategoryFilters;
  PillsViewType = PillsViewType;
  PillBorder = PillBorder;
  SelectMode = SelectMode;
  appPrimaryColor: string;
  selectedPrimaryCategoryFilter: any;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('PAGE_ASSEMBLE_SERVICE') private pageService: PageAssembleService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('SEARCH_HISTORY_SERVICE') private searchHistoryService: SearchHistoryService,
    private appVersion: AppVersion,
    private changeDetectionRef: ChangeDetectorRef,
    private zone: NgZone,
    private event: Events,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private platform: Platform,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    public commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private translate: TranslateService,
    private headerService: AppHeaderService,
    private popoverCtrl: PopoverController,
    private location: Location,
    private router: Router,
    private navCtrl: NavController,
    private sbProgressLoader: SbProgressLoader,
    private groupHandlerService: GroupHandlerService,
    private navService: NavigationService,
    private profileHandler: ProfileHandler
  ) {

    const extras = this.router.getCurrentNavigation().extras.state;

    if (extras) {
      this.dialCode = extras.dialCode;
      this.primaryCategories = extras.primaryCategories;
      this.corRelationList = extras.corRelation;
      this.source = extras.source;
      if (this.source === PageId.GROUP_DETAIL) {
        this.isFromGroupFlow = true;
        this.searchOnFocus();
      }
      this.groupId = extras.groupId;
      this.activityTypeData = extras.activityTypeData;
      this.activityList = extras.activityList;
      this.enrolledCourses = extras.enrolledCourses;
      this.guestUser = extras.guestUser;
      this.userId = extras.userId;
      this.shouldGenerateEndTelemetry = extras.shouldGenerateEndTelemetry;
      this.preAppliedFilter = extras.preAppliedFilter;
      if (this.preAppliedFilter) {
        this.enableSearch = true;
        this.searchKeywords = this.preAppliedFilter.query;
      }
    }

    this.checkUserSession();
    this.isFirstLaunch = true;
    this.init();
    this.defaultAppIcon = 'assets/imgs/ic_launcher.png';
    this.getFrameworkId();
    this.selectedLanguageCode = this.translate.currentLang;
  }

  async ngOnInit() {
    this.getAppName();
    this.supportedUserTypesConfig = await this.profileHandler.getSupportedUserTypes();
    this.appPrimaryColor = getComputedStyle(document.querySelector('html')).getPropertyValue('--app-primary-medium');
  }

  async ionViewWillEnter() {
    if (this.dialCode) {
      this.enableSearch = true;
    }
    this.events.subscribe('update_header', () => {
      this.headerService.showHeaderWithHomeButton();
    });
    this.events.subscribe('update_back_header', () => {
      this.headerService.showHeaderWithBackButton();
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    if(!this.isFromGroupFlow){
      this.headerService.showHeaderWithHomeButton();
    }
    this.handleDeviceBackButton();
    this.searchFilterConfig = await this.formAndFrameworkUtilService.getFormFields(FormConstants.SEARCH_FILTER);
    if ((this.source === PageId.GROUP_DETAIL && this.isFirstLaunch) || this.preAppliedFilter) {
      this.isFirstLaunch = false;
      this.handleSearch(true);
    }
  }

  ionViewDidEnter() {
    if (!this.dialCode && this.isFirstLaunch && this.source !== PageId.GROUP_DETAIL) {
      setTimeout(() => {
        this.isFirstLaunch = false;
      }, 100);
    }
    this.sbProgressLoader.hide({ id: this.dialCode });

    this.checkUserSession();
  }

  ngAfterViewInit() {
    this.searchHistory$ = this.searchBar && (this.searchBar as any).ionChange.pipe(
      rxjsMap((e: CustomEvent) => e.target['value']),
      share(),
      startWith(''),
      debounceTime(500),
      switchMap((v: string) => {
        if (v) {
          return from(this.searchHistoryService.getEntries({
            like: v,
            limit: 5,
            namespace: SearchHistoryNamespaces.LIBRARY
          }).toPromise());
        }

        return from(this.searchHistoryService.getEntries({
          limit: 10,
          namespace: SearchHistoryNamespaces.LIBRARY
        }).toPromise());
      }),
      tap(() => {
        setTimeout(() => {
          this.showAddToGroupButtons = false;
          this.changeDetectionRef.detectChanges();
        });
      }) as any

    );
  }

  onSearchHistoryTap(searchEntry: SearchEntry) {
    this.searchKeywords = searchEntry.query;
    this.handleSearch();

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SEARCH_HISTORY_CLICKED,
      Environment.HOME,
      PageId.SEARCH,
      undefined,
      {
        selectedSearchHistory: searchEntry.query
      },
      undefined,
      featureIdMap.searchHistory.SEARCH_HISTORY_QUERY_FROM_HISTORY
    );
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  private async getAppName() {
    return this.appVersion.getAppName()
      .then((appName: any) => {
        this.appName = appName;
      });
  }

  getFrameworkId() {
    this.preferences.getString('current_framework_id').toPromise()
      .then(value => {
        this.currentFrameworkId = value;

      })
      .catch(() => {
      });
  }

  async navigateToPreviousPage() {
    if (this.shouldGenerateEndTelemetry) {
      this.generateQRSessionEndEvent(this.source, this.dialCode);
    }

    if (this.appGlobalService.isGuestUser) {
      if ((this.source === PageId.PERMISSION || this.source === PageId.ONBOARDING_PROFILE_PREFERENCES)
        && this.appGlobalService.isOnBoardingCompleted) {
        if (this.appGlobalService.isProfileSettingsCompleted || !this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
          if (await this.commonUtilService.isDeviceLocationAvailable()) {
            this.router.navigate([`/${RouterLinks.TABS}`], { state: { loginMode: 'guest' }, replaceUrl: true });
          } else {
            const navigationExtras: NavigationExtras = {
              state: {
                isShowBackButton: false
              }
            };
            this.navCtrl.navigateForward([`/${RouterLinks.DISTRICT_MAPPING}`], navigationExtras);
          }
        } else {
          this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`],
            { state: { isCreateNavigationStack: false, hideBackButton: true, showFrameworkCategoriesMenu: true } });
        }
      } else {
        if (this.source === PageId.ONBOARDING_PROFILE_PREFERENCES) {
          this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], { state: { showFrameworkCategoriesMenu: true }, replaceUrl: true });
        } else {
          this.popCurrentPage();
        }
      }
    } else {
      this.popCurrentPage();
    }
  }

  popCurrentPage() {
    this.location.back();
  }

  handleDeviceBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.navigateToPreviousPage();
      if (this.displayDialCodeResult && this.displayDialCodeResult[0].dialCodeResult &&
        this.displayDialCodeResult[0].dialCodeResult.length) {
        this.telemetryGeneratorService.generateBackClickedNewTelemetry(
          true,
          this.source === PageId.ONBOARDING ? Environment.ONBOARDING : Environment.HOME,
          PageId.QR_BOOK_RESULT
        );
      } else {
        this.telemetryGeneratorService.generateBackClickedTelemetry(ImpressionType.SEARCH,
          Environment.HOME, false, undefined, this.corRelationList);
      }
    });
  }

  openCollection(collection) {
    const values = new Map();
    values.root = true;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_SEARCH,
      ContentUtil.getTelemetryObject(collection),
      values,
      undefined,
      this.corRelationList);
    this.showContentDetails(collection, true);
  }

  async openContent(collection, content, index?, isQrCodeLinkToSingleContent?, markAsSelected?) {
    if (markAsSelected && this.isFromGroupFlow) {
      this.searchContentResult.forEach((element, idx) => {
        if (idx === index) {
          element.selected = true;
        } else {
          element.selected = false;
        }
      });
      this.showAddToGroupButtons = true;
    } else {
      this.showLoader = false;
      this.parentContent = collection;
      this.isQrCodeLinkToContent = isQrCodeLinkToSingleContent;
      this.generateInteractEvent(content.identifier, content.contentType, content.pkgVersion, index ? index : 0);
      if (collection !== undefined) {
        this.parentContent = collection;
        this.childContent = content;
        this.checkParent(collection, content);
      } else {
        this.showLoader = false;
        await this.checkRetiredOpenBatch(content);
      }
    }
  }

  private async showContentDetails(content, isRootContent: boolean = false, isAvailableLocally: boolean = true) {
    this.showLoader = false;
    let params;
    if (this.shouldGenerateEndTelemetry) {
      params = {
        content,
        corRelation: this.corRelationList,
        source: this.source,
        shouldGenerateEndTelemetry: this.shouldGenerateEndTelemetry,
        parentContent: this.parentContent,
        isSingleContent: this.isSingleContent,
        onboarding: this.appGlobalService.isOnBoardingCompleted,
        isProfileUpdated: this.isProfileUpdated,
        isQrCodeLinkToContent: this.isQrCodeLinkToContent,
        isAvailableLocally
      };
    } else {
      params = {
        content,
        corRelation: this.corRelationList,
        parentContent: this.parentContent,
        isSingleContent: this.isSingleContent,
        onboarding: this.appGlobalService.isOnBoardingCompleted,
        isProfileUpdated: this.isProfileUpdated,
        isQrCodeLinkToContent: this.isQrCodeLinkToContent,
        isAvailableLocally
      };
    }
    if (this.loader) {
      this.loader.dismiss();
    }

    if (this.isDialCodeSearch && !this.appGlobalService.isOnBoardingCompleted && await this.appGlobalService.getProfileSettingsStatus()) {
      this.appGlobalService.setOnBoardingCompleted();
    }

    switch (ContentUtil.isTrackable(content)) {
      case 1:
        if (!this.guestUser) {
          this.enrolledCourses = await this.getEnrolledCourses(false);
        } else {
          this.enrolledCourses = [];
        }
        if (this.enrolledCourses && this.enrolledCourses.length) {
          for (let i = 0; i < this.enrolledCourses.length; i++) {
            if (content.identifier === this.enrolledCourses[i].courseId) {
              params.content = this.enrolledCourses[i];
            }
          }
        }
        const correlationData: CorrelationData = new CorrelationData();
        if (this.source === PageId.GROUP_DETAIL) {
          correlationData.id = PageId.GROUP_DETAIL;
          correlationData.type = CorReleationDataType.FROM_PAGE;
          if (params && params.corRelation) {
            params.corRelation.push(correlationData);
          }
        }
        if (CsGroupAddableBloc.instance.initialised) {
          this.updateCsGroupAddableBloc(params, PageId.COURSE_DETAIL);
        }
        this.navService.navigateToTrackableCollection(
          {
            source: this.source,
            groupId: this.groupId,
            activityList: this.activityList,
            content: params.content,
            corRelation: params.corRelation,
            isSingleContent: params.isSingleContent,
            onboarding: params.onboarding,
            parentContent: params.parentContent,
            isQrCodeLinkToContent: params.isQrCodeLinkToContent,
            isOnboardingSkipped: !this.appGlobalService.isOnBoardingCompleted
          }
        );
        if (this.isSingleContent) {
          this.isSingleContent = false;
        }
        break;
      case 0:
        if (this.isDialCodeSearch && !isRootContent) {
          params.isCreateNavigationStack = true;

          const corRelationList: Array<CorrelationData> = [];
          corRelationList.push({ id: this.dialCode, type: CorReleationDataType.QR });

          const telemetryObject = new TelemetryObject(content.identifier, ObjectType.TEXTBOOK, undefined);
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.SELECT_BOOK, '',
            this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
            PageId.QR_BOOK_RESULT,
            telemetryObject,
            undefined, undefined,
            corRelationList
          );

          this.navCtrl.navigateForward([RouterLinks.QRCODERESULT], {
            state: {
              content: params.content,
              corRelation: params.corRelation,
              isSingleContent: params.isSingleContent,
              onboarding: params.onboarding,
              parentContent: params.parentContent,
              isProfileUpdated: params.isProfileUpdated,
              isQrCodeLinkToContent: params.isQrCodeLinkToContent,
              isAvailableLocally: params.isAvailableLocally,
              source: params.source,
              dialCode: this.dialCode
            }
          });
          if (this.isSingleContent) {
            this.isSingleContent = false;
          }
        } else {
          if (CsGroupAddableBloc.instance.initialised) {
            this.updateCsGroupAddableBloc(params, PageId.COLLECTION_DETAIL);
          }
          this.navService.navigateToCollection({
            source: this.source,
            groupId: this.groupId,
            activityList: this.activityList,
            content: params.content,
            corRelation: params.corRelation,
            isSingleContent: params.isSingleContent,
            onboarding: params.onboarding,
            parentContent: params.parentContent
          });
        }
        break;
      case -1:
        if (CsGroupAddableBloc.instance.initialised) {
          this.updateCsGroupAddableBloc(params, PageId.CONTENT_DETAIL);
        }
        this.navService.navigateToContent({
          content: params.content,
          corRelation: params.corRelation,
          isSingleContent: params.isSingleContent,
          onboarding: params.onboarding,
          parentContent: params.parentContent
        });
        break;
    }
  }

  setGrade(reset, grades) {
    if (reset) {
      this.profile.grade = [];
      this.profile.gradeValue = {};
    }
    each(grades, (grade) => {
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
    each(mediums, (medium) => {
      if (medium && this.profile.medium.indexOf(medium) === -1) {
        if (this.profile.medium && this.profile.medium.length) {
          this.profile.medium.push(medium);
        } else {
          this.profile.medium = [medium];
        }
      }
    });
  }

  findCode(categoryList: Array<any>, data, categoryType) {
    if (find(categoryList, (category) => category.name === data[categoryType])) {
      return find(categoryList, (category) => category.name === data[categoryType]).code;
    } else {
      return undefined;
    }
  }

  setCurrentProfile(index, data) {
    if (!this.profile.medium || !this.profile.medium.length) {
      this.profile.medium = [];
    }
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
    }
    this.editProfile();
  }

  checkProfileData(data, profile) {
    if (data && data.framework) {

      const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
        language: this.translate.currentLang,
        requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
      };
      // Auto update the profile if that board/framework is listed in custodian framework list.
      this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
        .then((res: Framework[]) => {
          this.isProfileUpdated = false;
          res.forEach(element => {
            // checking whether content data framework Id exists/valid in syllabus list
            if (data.framework === element.identifier || data.board.indexOf(element.name) !== -1) {
              data.framework = element.identifier;
              this.isProfileUpdated = true;
              const frameworkDetailsRequest: FrameworkDetailsRequest = {
                frameworkId: element.identifier,
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
              };
              this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
                .then((framework: Framework) => {
                  this.categories = framework.categories;
                  this.boardList = find(this.categories, (category) => category.code === 'board').terms;
                  this.mediumList = find(this.categories, (category) => category.code === 'medium').terms;
                  this.gradeList = find(this.categories, (category) => category.code === 'gradeLevel').terms;
                  //                  this.subjectList = find(this.categories, (category) => category.code === 'subject').terms;
                  if (data.board) {
                    data.board = this.findCode(this.boardList, data, 'board');
                  }
                  if (data.medium) {
                    if (typeof data.medium === 'string') {
                      data.medium = [this.findCode(this.mediumList, data, 'medium')];
                    } else {
                      data.medium = map(data.medium, (dataMedium) => {
                        return find(this.mediumList, (medium) => medium.name === dataMedium).code;
                      });
                    }
                  }
                  if (data.gradeLevel && data.gradeLevel.length) {
                    data.gradeLevel = map(data.gradeLevel, (dataGrade) => {
                      return find(this.gradeList, (grade) => grade.name === dataGrade).code;
                    });
                  }
                  if (profile && profile.syllabus && profile.syllabus[0] && data.framework === profile.syllabus[0]) {
                    if (data.board) {
                      if (profile.board && !(profile.board.length > 1) && data.board === profile.board[0]) {
                        if (data.medium) {
                          let existingMedium = false;
                          for (let i = 0; i < data.medium.length; i++) {
                            const mediumExists = find(profile.medium, (medium) => {
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
                              const gradeExists = find(profile.grade, (grade) => {
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
                  if (NetworkError.isInstance(err)) {
                    this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
                  }
                });

              return;
            }
          });
        })
        .catch((err) => {
          if (NetworkError.isInstance(err)) {
            this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
          }
        });
    }
  }

  editProfile() {
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
          this.appGlobalService.setOnBoardingCompleted();
        }
        this.commonUtilService.handleToTopicBasedNotification();
        this.appGlobalService.guestUserProfile = res;
        this.telemetryGeneratorService.generateProfilePopulatedTelemetry(PageId.DIAL_CODE_SCAN_RESULT,
          req, 'auto');
      })
      .catch(() => {
      });
  }

  showFilter() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.FILTER_BUTTON_CLICKED,
      Environment.HOME,
      this.source || PageId.SEARCH, undefined);
    const filterCriteriaData = this.responseData.filterCriteria;
    filterCriteriaData.facetFilters.forEach(element => {
      this.searchFilterConfig.forEach(item => {
        if (element.name === item.code) {
          element.translatedName = this.commonUtilService.getTranslatedValue(item.translations, item.name);
          return;
        }
      });

      this.initialFilterCriteria.facetFilters.forEach(newElement => {
        this.searchFilterConfig.forEach(item => {
          if (newElement.name === item.code) {
            newElement.translatedName = this.commonUtilService.getTranslatedValue(item.translations, item.name);
            return;
          }
        });
      });
      this.router.navigate(['/filters'], {
        state: {
          filterCriteria: this.responseData.filterCriteria,
          initialfilterCriteria: this.initialFilterCriteria,
          supportedUserTypesConfig: this.supportedUserTypesConfig,
          source: this.source
        }
      });
    });
  }

  applyFilter() {
    this.showAddToGroupButtons = false;
    this.showLoader = true;
    this.responseData.filterCriteria.mode = 'hard';
    this.responseData.filterCriteria.searchType = SearchType.FILTER;
    const modifiedCriteria = JSON.parse(JSON.stringify(this.responseData.filterCriteria));
    modifiedCriteria.facetFilters.forEach(facet => {
      if (facet.values && facet.values.length > 0) {
        if (facet.name === 'audience') {
          facet.values = ContentUtil.getAudienceFilter(facet, this.supportedUserTypesConfig);
        }
      }
    });
    this.contentService.searchContent(modifiedCriteria).toPromise()
      .then((responseData: ContentSearchResult) => {

        this.zone.run(() => {
          this.responseData = responseData;
          if (responseData) {
            if (this.isDialCodeSearch) {
              this.processDialCodeResult(responseData.contentDataList);
            } else {
              this.searchContentResult = responseData.contentDataList;
              this.isEmptyResult = !(this.searchContentResult && this.searchContentResult.length > 0);
              const values = new Map();
              values.from = this.source;
              values.searchCount = this.responseData.length;
              values.searchCriteria = this.responseData.filterCriteria;
              this.telemetryGeneratorService.generateExtraInfoTelemetry(values, PageId.SEARCH);
            }
            if (this.responseData.filterCriteria && this.responseData.filterCriteria.facetFilters) {
              this.fetchPrimaryCategoryFilters(this.responseData.filterCriteria.facetFilters);
            }
            this.updateFilterIcon();
          } else {
            this.isEmptyResult = true;
          }
          this.showLoader = false;
        });
      }).catch(() => {
        this.zone.run(() => {
          this.showLoader = false;
        });
      });
  }

  handleCancel() {
    this.searchKeywords = '';
    this.searchBar.setFocus();
    this.searchContentResult = undefined;
    this.filterIcon = false;
    this.isEmptyResult = false;
  }

  handleSearch(shouldApplyProfileFilter = false) {
    this.scrollToTop();
    if (this.searchKeywords.length < 3 && this.source !== PageId.GROUP_DETAIL && !this.preAppliedFilter) {
      return;
    }
    this.showAddToGroupButtons = false;
    this.addSearchHistoryEntry();

    this.showLoader = true;

    (window as any).cordova.plugins.Keyboard.close();
    const facets = this.searchFilterConfig.reduce((acc, filterConfig) => {
      acc.push(filterConfig.code);
      return acc;
    }, []);
    const contentSearchRequest: ContentSearchCriteria = {
      searchType: SearchType.SEARCH,
      query: this.searchKeywords,
      primaryCategories: this.primaryCategories,
      facets: facets ? facets : Search.FACETS,
      mode: 'soft',
      framework: this.currentFrameworkId,
      languageCode: this.selectedLanguageCode,
    };

    if (this.profile && this.source === PageId.GROUP_DETAIL && shouldApplyProfileFilter) {
      if (this.profile.board && this.profile.board.length) {
        contentSearchRequest.board = applyProfileFilter(this.appGlobalService, this.profile.board,
          contentSearchRequest.board, 'board');
      }

      if (this.profile.medium && this.profile.medium.length) {
        contentSearchRequest.medium = applyProfileFilter(this.appGlobalService, this.profile.medium,
          contentSearchRequest.medium, 'medium');
      }

      if (this.profile.grade && this.profile.grade.length) {
        contentSearchRequest.grade = applyProfileFilter(this.appGlobalService, this.profile.grade,
          contentSearchRequest.grade, 'gradeLevel');
      }
    }

    this.isDialCodeSearch = false;

    this.dialCodeContentResult = undefined;
    this.dialCodeResult = undefined;
    this.corRelationList = [];
    let searchQuery;
    if (this.activityTypeData ||  this.preAppliedFilter) {
      const query = this.activityTypeData ? this.activityTypeData.searchQuery :
        JSON.stringify({ request:  this.preAppliedFilter });
      searchQuery = updateFilterInSearchQuery(query, undefined, false);
      searchQuery.request.query = this.searchKeywords;
      searchQuery.request.facets = contentSearchRequest.facets;
      if (this.activityTypeData) {
        searchQuery.request.mode = contentSearchRequest.mode;
      }
      searchQuery.request.searchType = SearchType.FILTER;
      const profileFilters = {
        board: contentSearchRequest.board || [],
        medium: contentSearchRequest.medium || [],
        gradeLevel: contentSearchRequest.grade || []
      };
      searchQuery.request.filters = {
        ...searchQuery.request.filters,
        ...profileFilters,
        board: [...(searchQuery.request.filters.board || []), ...(profileFilters.board || [])],
        medium: [...(searchQuery.request.filters.medium || []), ...(profileFilters.medium || [])],
        gradeLevel: [...(searchQuery.request.filters.gradeLevel || []), ...(profileFilters.gradeLevel || [])]
      };
    }
    this.contentService.searchContent(contentSearchRequest, searchQuery).toPromise()
      .then((response: ContentSearchResult) => {
        this.zone.run(() => {
          this.responseData = response;
          this.preAppliedFilter = undefined;
          if (response) {
            if (!this.initialFilterCriteria) {
              this.initialFilterCriteria = JSON.parse(JSON.stringify(this.responseData.filterCriteria));
            }
            this.addCorRelation(response.responseMessageId, 'API');
            this.searchContentResult = response.contentDataList;
            this.isEmptyResult = !this.searchContentResult || this.searchContentResult.length === 0;

            this.updateFilterIcon();

            this.generateLogEvent(response);
            const values = new Map();
            values.from = this.source;
            values.searchCount = this.searchContentResult ? this.searchContentResult.length : 0;
            values.searchCriteria = response.request;
            this.telemetryGeneratorService.generateExtraInfoTelemetry(values, PageId.SEARCH);
            if (response.filterCriteria && response.filterCriteria.facetFilters) {
              this.fetchPrimaryCategoryFilters(response.filterCriteria.facetFilters);
            }
          } else {
            this.isEmptyResult = true;
          }
          this.showEmptyMessage = this.searchContentResult.length === 0;
          this.showLoader = false;
        });
      }).catch(() => {
        this.zone.run(() => {
          this.showLoader = false;
          if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
            this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
          }
        });
      });
  }

  private addSearchHistoryEntry() {
    if (!this.searchKeywords) {
      return;
    }
    this.searchHistoryService
      .addEntry({
        query: this.searchKeywords,
        namespace: SearchHistoryNamespaces.LIBRARY
      })
      .toPromise();
  }

  private async checkRetiredOpenBatch(content: any, layoutName?: string) {
    this.showLoader = false;
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();
    this.loader.onDidDismiss(() => { this.loader = undefined; });
    let retiredBatches: Array<any> = [];
    let anyOpenBatch = false;
    await this.getEnrolledCourses(true);
    this.enrolledCourses = this.enrolledCourses || [];
    if (layoutName !== ContentCard.LAYOUT_INPROGRESS) {
      retiredBatches = this.enrolledCourses.filter((element) => {
        if (element.contentId === content.identifier && element.batch.status === 1 && element.cProgress !== 100) {
          anyOpenBatch = true;
          content.batch = element.batch;
        }
        if (element.contentId === content.identifier && element.batch.status === 2 && element.cProgress !== 100) {
          return element;
        }
      });
    }
    if (anyOpenBatch || !retiredBatches.length) {
      // open the batch directly
      await this.showContentDetails(content, true);
    } else if (retiredBatches.length) {
      await this.navigateToBatchListPopup(content, layoutName, retiredBatches);
    }
  }

  // TODO: SDK changes by Swayangjit
  async navigateToBatchListPopup(content: any, layoutName?: string, retiredBatched?: any) {
    const ongoingBatches = [];
    const courseBatchesRequest: CourseBatchesRequest = {
      filters: {
        courseId: layoutName === ContentCard.LAYOUT_INPROGRESS ? content.contentId : content.identifier,
        enrollmentType: CourseEnrollmentType.OPEN,
        status: [CourseBatchStatus.IN_PROGRESS]
      },
      sort_by: { createdDate: SortOrder.DESC },
      fields: BatchConstants.REQUIRED_FIELDS
    };
    const reqvalues = new Map();
    reqvalues.enrollReq = courseBatchesRequest;

    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      if (!this.guestUser) {
        this.courseService.getCourseBatches(courseBatchesRequest).toPromise()
          .then((res: Batch[]) => {
            this.zone.run(async () => {
              this.batches = res;
              if (this.batches.length) {
                this.batches.forEach((batch) => {
                  if (batch.status === 1) {
                    ongoingBatches.push(batch);
                  }
                });
                this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
                  'ongoing-batch-popup',
                  Environment.HOME,
                  PageId.SEARCH, undefined,
                  reqvalues);
                const popover = await this.popoverCtrl.create({
                  component: EnrollmentDetailsComponent,
                  componentProps: {
                    upcommingBatches: [],
                    ongoingBatches,
                    retiredBatched,
                    content
                  },
                  cssClass: 'enrollement-popover'
                });
                await this.loader.dismiss();
                await popover.present();
                const { data } = await popover.onDidDismiss();
                if (data && data.isEnrolled) {
                  this.getEnrolledCourses();
                }
                if (data && typeof data.isEnrolled === 'function') {
                  (data.isEnrolled as Function).call(this);
                }
              } else {
                await this.loader.dismiss();
                this.showContentDetails(content, true);
              }
            });
          })
          .catch((error: any) => {
            console.log('error while fetching course batches ==>', error);
          });
      }
    } else {
      if (this.loader) {
        this.loader.dismiss();
      }
      this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
  }

  init() {
    this.generateImpressionEvent();
    const values = new Map();
    values.from = this.source;
    this.telemetryGeneratorService.generateExtraInfoTelemetry(values, PageId.SEARCH);
    if (this.dialCode !== undefined && this.dialCode.length > 0) {
      this.getContentForDialCode();
    }

    this.event.subscribe('search.applyFilter', (filterCriteria) => {
      this.responseData.filterCriteria = filterCriteria;
      this.primaryCategoryFilters = undefined;
      this.applyFilter();
    });
  }

  async getContentForDialCode() {
    if (this.dialCode === undefined || this.dialCode.length === 0) {
      return;
    }

    this.isDialCodeSearch = true;

    this.showLoader = true;

    const primaryCategories = await this.formAndFrameworkUtilService.getSupportedContentFilterConfig(
      ContentFilterConfig.NAME_DIALCODE);
    this.primaryCategories = primaryCategories;

    // Page API START
    const pageAssemblefilter: PageAssembleFilter = {};
    pageAssemblefilter.dialcodes = this.dialCode;
    pageAssemblefilter.primaryCategory = this.primaryCategories;

    const pageAssembleCriteria: PageAssembleCriteria = {
      name: PageName.DIAL_CODE,
      filters: pageAssemblefilter,
      source: 'app',
      from: CachedItemRequestSourceFrom.SERVER
    };
    if (this.profile && this.profile.board && this.profile.board.length) {
      pageAssembleCriteria.userProfile = { board: applyProfileFilter(this.appGlobalService, this.profile.board, [], 'board') };
    }

    this.pageService.getPageAssemble(pageAssembleCriteria).toPromise()
      .then((res: any) => {
        this.zone.run(() => {
          const sections = res.sections;
          if (sections && sections.length) {
            this.addCorRelation(sections[0].resmsgId, 'API');
            this.processDialCodeResult(sections);
          }
          this.showLoader = false;
        });
      }).catch(() => {
        this.zone.run(() => {
          this.showLoader = false;
          if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
            this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
            const corRelationList: Array<CorrelationData> = [];
            corRelationList.push({ id: this.dialCode, type: CorReleationDataType.QR });

            this.telemetryGeneratorService.generateImpressionTelemetry(
              AuditType.TOAST_SEEN,
              ImpressionSubtype.OFFLINE_MODE,
              PageId.SCAN_OR_MANUAL,
              this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
              undefined, undefined, undefined, undefined,
              corRelationList
            );
          } else {
            this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
          }
          this.location.back();
        });
      });
  }

  generateInteractEvent(identifier, contentType, pkgVersion, index) {
    const values = new Map();
    values.SearchPhrase = this.searchKeywords;
    values.PositionClicked = index;
    values.source = this.source;
    if (this.isDialCodeSearch) {
      values.root = false;
    }
    const telemetryObject = new TelemetryObject(identifier, contentType, pkgVersion);
    if (!this.corRelationList) {
      this.corRelationList = [];
    }
    this.corRelationList.push({
      id: 'SearchResult',
      type: 'Section'
    });
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      this.isDialCodeSearch ? PageId.DIAL_SEARCH : (this.source || PageId.SEARCH),
      telemetryObject,
      values,
      ContentUtil.generateRollUp(undefined, identifier),
      this.corRelationList);
  }

  generateQRSessionEndEvent(pageId: string, qrData: string) {
    if (pageId !== undefined) {
      const telemetryObject = new TelemetryObject(qrData, 'qr', '');
      this.telemetryGeneratorService.generateEndTelemetry(
        'qr',
        Mode.PLAY,
        pageId,
        Environment.HOME,
        telemetryObject,
        undefined,
        this.corRelationList);
    }
  }

  processDialCodeResult(dialResult) {
    console.log('dialresult', dialResult);
    const displayDialCodeResult = [];
    dialResult.forEach(searchResult => {
      const collectionArray: Array<any> = searchResult.collections;
      const contentArray: Array<any> = searchResult.contents;
      const addedContent = new Array<any>();
      const dialCodeResultObj = {
        isCourse: false,
        dialCodeResult: [],
        dialCodeContentResult: []
      };
      const dialCodeCourseResultObj = {
        isCourse: true,
        dialCodeResult: [],
        dialCodeContentResult: []
      };

      // Handle localization
      if (searchResult.display) {
        dialCodeResultObj['name'] = this.commonUtilService.getTranslatedValue(searchResult.display, searchResult.name);
      } else {
        dialCodeResultObj['name'] = searchResult.name;
      }

      if (collectionArray && collectionArray.length > 0) {
        collectionArray.forEach((collection) => {
          contentArray.forEach((content) => {
            if (collection.childNodes.includes(content.identifier)) {
              if (collection.content === undefined) {
                collection.content = [];
              }
              collection.content.push(content);
              addedContent.push(content.identifier);
            }
          });
          dialCodeResultObj.dialCodeResult.push(collection);
        });
        // displayDialCodeResult[searchResult.name] = dialCodeResult;
        displayDialCodeResult.push(dialCodeResultObj);
      }

      let isAllContentMappedToCollection = false;
      if (contentArray) {
        isAllContentMappedToCollection = contentArray.length === addedContent.length;
      }

      if (!isAllContentMappedToCollection && contentArray && contentArray.length > 1) {
        const dialCodeContentResult = [];
        const dialCodeContentCourseResult = []; // content type course
        contentArray.forEach((content) => {
          if (content.contentType === CsContentType.COURSE) {
            dialCodeContentCourseResult.push(content);
          } else if (addedContent.indexOf(content.identifier) < 0) {
            dialCodeContentResult.push(content);
          }
        });

        if (dialCodeContentResult.length) {
          dialCodeResultObj.dialCodeContentResult = dialCodeContentResult;
          if (displayDialCodeResult && !(displayDialCodeResult.length > 0)) {
            displayDialCodeResult.push(dialCodeResultObj);
          } else {
            displayDialCodeResult[0].dialCodeContentResult = dialCodeContentResult;
          }
        }
        if (dialCodeContentCourseResult.length) {
          dialCodeCourseResultObj.dialCodeContentResult = dialCodeContentCourseResult;
          displayDialCodeResult.push(dialCodeCourseResultObj);
        }
      }
      if (displayDialCodeResult.length && displayDialCodeResult[0].dialCodeResult) {
        this.generateImpressionEvent(displayDialCodeResult[0].dialCodeResult);
      }
      let isParentCheckStarted = false;
      if (dialCodeResultObj.dialCodeResult.length === 1 && dialCodeResultObj.dialCodeResult[0].content.length === 1
        && isAllContentMappedToCollection) {
        this.parentContent = dialCodeResultObj.dialCodeResult[0];
        this.childContent = dialCodeResultObj.dialCodeResult[0].content[0];
        this.checkParent(dialCodeResultObj.dialCodeResult[0], dialCodeResultObj.dialCodeResult[0].content[0]);
        isParentCheckStarted = true;
      }
      this.generateQRScanSuccessInteractEvent((contentArray ? contentArray.length : 0), this.dialCode);

      if (contentArray && contentArray.length === 1 && !isParentCheckStarted) {
        this.isSingleContent = true;
        this.openContent(contentArray[0], contentArray[0], 0, true);
        // return;
      }
    });

    this.displayDialCodeResult = displayDialCodeResult;
    if (this.displayDialCodeResult.length === 0 && !this.isSingleContent) {
      this.location.back();
      if (this.shouldGenerateEndTelemetry) {
        this.generateQRSessionEndEvent(this.source, this.dialCode);
      }
      this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
        '',
        PageId.DIAL_NOT_LINKED,
        Environment.HOME);
      this.commonUtilService.showContentComingSoonAlert(this.source, undefined, this.dialCode);
    }
  }

  generateQRScanSuccessInteractEvent(dialCodeResultCount, dialCode) {
    const values = new Map();
    values.networkAvailable = this.commonUtilService.networkInfo.isNetworkAvailable ? 'Y' : 'N';
    values.scannedData = dialCode;
    values.count = dialCodeResultCount;

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.DIAL_SEARCH_RESULT_FOUND,
      this.source ? this.source : PageId.SEARCH,
      PageId.SEARCH,
      undefined,
      values
    );
  }

  updateFilterIcon() {
    let isFilterApplied = false;

    if (!this.responseData.filterCriteria) {
      return;
    }

    this.responseData.filterCriteria.facetFilters.forEach(facet => {
      if (facet.values && facet.values.length > 0) {
        facet.values.forEach(value => {
          if (value.apply) {
            isFilterApplied = true;
          }
        });
      }
    });

    if (isFilterApplied) {
      this.filterIcon = './assets/imgs/ic_action_filter_applied.png';
      this.corRelationList.push({
        id: 'filter',
        type: CorReleationDataType.DISCOVERY_TYPE
      });
    } else {
      this.filterIcon = './assets/imgs/ic_action_filter.png';
    }
    if (this.isEmptyResult) {
      this.filterIcon = undefined;
    }
  }

  checkParent(parent, child) {
    const identifier = parent.identifier;
    const contentRequest: ContentDetailRequest = {
      contentId: identifier
    };
    this.contentService.getContentDetails(contentRequest).toPromise()
      .then((data: Content) => {
        if (data) {
          if (data.isAvailableLocally) {
            this.zone.run(() => {
              this.showContentDetails(child, false, true);
            });
          } else {
            this.subscribeSdkEvent();
            this.downloadParentContent(parent);
            this.profile = this.appGlobalService.getCurrentUser();
            this.checkProfileData(data.contentData, this.profile);
            setTimeout(() => {
              this.showContentDetails(this.childContent, false, false);
            }, 400);
          }
        } else {
          this.zone.run(() => {
            this.showContentDetails(child);
          });
        }
      }).catch((err) => {
        if (NetworkError.isInstance(err)) {
          this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
        }
      });
  }

  downloadParentContent(parent) {
    this.zone.run(() => {
      this.downloadProgress = 0;
      // this.showLoading = true;
      this.isDownloadStarted = true;
    });

    const option: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody([parent.identifier], false),
      contentStatusArray: ['Live'],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    };
    // Call content service
    this.contentService.importContent(option).toPromise()
      .then((data: ContentImportResponse[]) => {
        this.zone.run(() => {

          if (data && data.length && this.isDownloadStarted) {
            data.forEach((value) => {
              if (value.status === ContentImportStatus.ENQUEUED_FOR_DOWNLOAD) {
                this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
                  InteractSubtype.LOADING_SPINE,
                  this.source === PageId.USER_TYPE_SELECTION ? Environment.ONBOARDING : Environment.HOME,
                  PageId.DIAL_SEARCH,
                  undefined,
                  undefined,
                  undefined,
                  this.corRelationList
                );
                this.queuedIdentifiers.push(value.identifier);
              }
            });
          }

          if (this.queuedIdentifiers.length === 0) {
            this.showLoading = false;
            this.isDownloadStarted = false;
            if (this.commonUtilService.networkInfo.isNetworkAvailable) {
              this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
            } else {
              this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
            }
          }
        });
      })
      .catch((err) => {
        if (NetworkError.isInstance(err)) {
          this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
          this.showLoading = false;
          this.isDownloadStarted = false;
        }
      });
  }

  /**
   * Subscribe Sunbird-SDK event to get content download progress
   */
  subscribeSdkEvent() {
    this.eventSubscription = this.eventsBusService.events()
      .subscribe((event: EventsBusEvent) => {
        this.zone.run(() => {
          if (event.type === DownloadEventType.PROGRESS && event.payload.progress) {
            const downloadEvent = event as DownloadProgress;
            this.downloadProgress = downloadEvent.payload.progress === -1 ? 0 : downloadEvent.payload.progress;
            this.loadingDisplayText = this.commonUtilService.translateMessage('LOADING_CONTENT') + ' ' + this.downloadProgress + ' %';

            if (this.downloadProgress === 100) {
              // this.showLoading = false;
              this.loadingDisplayText = this.commonUtilService.translateMessage('LOADING_CONTENT') + ' ';
            }
          }

          if (event.type === ContentEventType.IMPORT_PROGRESS) {
            const totalCountMsg = Math.floor((event.payload.currentCount / event.payload.totalCount) * 100) +
              '% (' + event.payload.currentCount + ' / ' + event.payload.totalCount + ')';
            this.loadingDisplayText = this.commonUtilService.translateMessage('EXTRACTING_CONTENT', totalCountMsg);
            if (event.payload.currentCount === event.payload.totalCount) {
              let timer = 30;
              const interval = setInterval(() => {
                this.loadingDisplayText = `Getting things ready in ${timer--}  seconds`;
                if (timer === 0) {
                  this.loadingDisplayText = 'Getting things ready';
                  clearInterval(interval);
                }
              }, 1000);
            }
          }
          // if (event.payload && event.payload.status === 'IMPORT_COMPLETED' && event.type === 'contentImport') {
          if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED) {
            if (this.queuedIdentifiers.length && this.isDownloadStarted) {
              if (this.queuedIdentifiers.includes(event.payload.contentId)) {
                this.currentCount++;
              }
              if (this.queuedIdentifiers.length === this.currentCount) {
                this.showLoading = false;
                this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
                  InteractSubtype.LOADING_SPINE_COMPLETED,
                  this.source === PageId.USER_TYPE_SELECTION ? Environment.ONBOARDING : Environment.HOME,
                  PageId.DIAL_SEARCH,
                  undefined,
                  undefined,
                  undefined,
                  this.corRelationList
                );
                // this.showContentDetails(this.childContent);
                this.events.publish('savedResources:update', {
                  update: true
                });
              }
            } else {
              this.events.publish('savedResources:update', {
                update: true
              });
            }
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
  getImportContentRequestBody(identifiers: Array<string>, isChild: boolean): Array<ContentImport> {
    const requestParams = [];
    identifiers.forEach((value) => {
      requestParams.push({
        isChildContent: isChild,
        // TODO - check with Anil for destination folder path
        destinationFolder: cordova.file.externalDataDirectory,
        contentId: value,
        correlationData: this.corRelationList !== undefined ? this.corRelationList : []
      });
    });

    return requestParams;
  }

  cancelDownload() {
    this.contentService.cancelDownload(this.parentContent.identifier).toPromise().then(() => {
      this.zone.run(() => {
        this.showLoading = false;
        if (this.isSingleContent) {
          this.location.back();
        }
      });
    }).catch(() => {
      this.zone.run(() => {
        this.showLoading = false;
        if (this.isSingleContent) {
          this.location.back();
        }
      });
    });
  }

  checkUserSession() {
    this.profile = this.appGlobalService.getCurrentUser();
  }

  private addCorRelation(id: string, type: string) {
    if (this.corRelationList === undefined || this.corRelationList === null) {
      this.corRelationList = new Array<CorrelationData>();
    }
    const corRelation: CorrelationData = new CorrelationData();
    corRelation.id = id || '';
    corRelation.type = type;
    this.corRelationList.push(corRelation);
  }

  private generateImpressionEvent(dialCodeResult?) {
    if (dialCodeResult && dialCodeResult.length) {
      const corRelationList: Array<CorrelationData> = [];
      corRelationList.push({ id: this.dialCode, type: CorReleationDataType.QR });
      corRelationList.push({ id: dialCodeResult.length.toString(), type: CorReleationDataType.COUNT_BOOK });
      this.telemetryGeneratorService.generatePageLoadedTelemetry(
        PageId.QR_BOOK_RESULT,
        this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
        undefined,
        undefined,
        undefined,
        undefined,
        corRelationList
      );
    } else {
      this.telemetryGeneratorService.generateImpressionTelemetry(
        ImpressionType.SEARCH, '',
        this.source ? this.source : PageId.SEARCH,
        Environment.HOME, '', '', '',
        undefined,
        this.corRelationList);
    }
  }

  private generateLogEvent(searchResult) {
    if (searchResult != null) {
      const contentArray: Array<any> = searchResult.contentDataList;
      const params = new Array<any>();
      const paramsMap = new Map();
      paramsMap.SearchResults = contentArray ? contentArray.length : 0;
      paramsMap.SearchCriteria = searchResult.request;
      params.push(paramsMap);
      this.telemetryGeneratorService.generateLogEvent(LogLevel.INFO,
        this.source ? this.source : PageId.SEARCH,
        Environment.HOME,
        ImpressionType.SEARCH,
        params);
    }
  }

  /**
   * To get enrolled course(s) of logged-in user.
   *
   * It internally calls course handler of genie sdk
   */
  private getEnrolledCourses(returnRefreshedCourses: boolean = false): Promise<any> {
    this.showLoader = true;
    const option: FetchEnrolledCourseRequest = {
      userId: this.userId,
      returnFreshCourses: returnRefreshedCourses
    };
    return this.courseService.getEnrolledCourses(option).toPromise()
      .then((enrolledCourses) => {
        if (enrolledCourses) {
          this.zone.run(() => {
            this.enrolledCourses = enrolledCourses ? enrolledCourses : [];
            if (this.enrolledCourses.length > 0) {
              const courseList: Array<Course> = [];
              for (const course of this.enrolledCourses) {
                courseList.push(course);
              }

              this.appGlobalService.setEnrolledCourseList(courseList);
            }
            this.showLoader = false;
          });
          return enrolledCourses;
        }
      }, () => {
        this.showLoader = false;
        return [];
      });
  }

  scrollToTop() {
    this.contentView.scrollToTop();
  }

  goBack() {
    if (this.displayDialCodeResult && this.displayDialCodeResult[0].dialCodeResult && this.displayDialCodeResult[0].dialCodeResult.length) {
      this.telemetryGeneratorService.generateBackClickedNewTelemetry(
        false,
        this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
        PageId.QR_BOOK_RESULT
      );
    } else {
      this.telemetryGeneratorService.generateBackClickedTelemetry(ImpressionType.SEARCH,
        Environment.HOME, true, undefined, this.corRelationList);
    }
    this.navigateToPreviousPage();
  }

  getContentCount(displayDialCodeResult) {
    let totalCount = 0;
    displayDialCodeResult.forEach(resultlist => {
      if (resultlist.dialCodeResult.length) {
        for (let i = 0; i < resultlist.dialCodeResult.length; i++) {
          if (resultlist.dialCodeResult[i].content && resultlist.dialCodeResult[i].content.length) {
            totalCount += resultlist.dialCodeResult[i].content.length;
          }
        }
      }
      if (resultlist.dialCodeContentResult.length) {
        totalCount += resultlist.dialCodeContentResult.length;
      }
    });
    return totalCount;
  }

  async addActivityToGroup() {
    const content = this.searchContentResult.find((c) => c.selected);
    if (this.activityList) {
      const activityExist = this.activityList.find(activity => activity.id === content.identifier);
      if (activityExist) {
        this.commonUtilService.showToast('ACTIVITY_ALREADY_ADDED_IN_GROUP');
        return;
      }
    }
    this.groupHandlerService.addActivityToGroup(
      this.groupId,
      content.identifier,
      (this.activityTypeData && this.activityTypeData.activityType) || {},
      PageId.SEARCH,
      this.corRelationList,
      -2);
  }

  openSelectedContent() {
    let index = 0;
    let content;
    this.searchContentResult.forEach((element, idx) => {
      if (element.selected) {
        index = idx;
        content = element;
      }
    });
    this.openContent(undefined, content, index, undefined, false);
  }

  private updateCsGroupAddableBloc(params, pageId) {
    const cData = {
      type: CorReleationDataType.GROUP_ID,
      id: CsGroupAddableBloc.instance.state.groupId
    }
    params.corRelation.push(cData)
    CsGroupAddableBloc.instance.updateState(
      {
        pageIds: [pageId],
        groupId: CsGroupAddableBloc.instance.state.groupId,
        params: {
          ...CsGroupAddableBloc.instance.state.params,
          corRelation: params.corRelation,
          noOfPagesToRevertOnSuccess: -3,
          activityType: (this.activityTypeData && this.activityTypeData.activityType) || {}
        }
      }
    );
  }

  searchOnFocus() {
    this.enableSearch = true;
    this.searchInfolVisibility = 'hide';
    this.headerService.showHeaderWithBackButton();
    this.appGlobalService.isDiscoverBackEnabled = true;
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back':
        if(this.isFromGroupFlow){
          this.location.back()
        }  else {
          this.enableSearch = false;
          this.searchInfolVisibility = 'show';
          this.headerService.showHeaderWithHomeButton();
          this.appGlobalService.isDiscoverBackEnabled = false; 
        }
        break;
      default: console.warn('Use Proper Event name');
    }
  }

  fetchPrimaryCategoryFilters(facetFilters) {
    if (!this.primaryCategoryFilters) {
      setTimeout(() => {
        for (let index = 0; index < facetFilters.length; index++) {
          if (facetFilters[index].name === 'primaryCategory') {
            this.primaryCategoryFilters = facetFilters[index].values;
            break;
          }
        }
      });
    }
  }

  handleFilterSelect(event) {
    if (!event || !event.data || !event.data.length) {
      return;
    }
    if (this.initialFilterCriteria) {
      this.responseData.filterCriteria = JSON.parse(JSON.stringify(this.initialFilterCriteria));
    }
    let primaryCategoryFilter = (this.responseData.filterCriteria as ContentSearchCriteria).facetFilters.find(facet => {
      return facet.name === 'primaryCategory'
    });
    if (!primaryCategoryFilter) {
      return;
    }
    let primaryCategoryFilterValue = primaryCategoryFilter.values.find(f => {
      return f.name ===  (event.data[0].value && event.data[0].value.name);
    })
    if (!primaryCategoryFilterValue) {
      return
    }
    if (!primaryCategoryFilterValue.apply) {
      this.selectedPrimaryCategoryFilter = primaryCategoryFilterValue;
      primaryCategoryFilterValue.apply = true;
      this.applyFilter();
    }
  }

}
