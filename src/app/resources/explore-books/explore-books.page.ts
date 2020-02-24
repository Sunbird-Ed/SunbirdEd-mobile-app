import {
  Component, ElementRef,
  Inject, NgZone, OnDestroy, QueryList,
  ViewChild, ViewChildren, OnInit
} from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { AudienceFilter, ContentType, MimeType, Search, ExploreConstants, RouterLinks } from 'app/app.constant';
import { Map } from 'app/telemetryutil';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId
} from 'services/telemetry-constants';
import {
  ContentSearchCriteria,
  ContentSearchFilter,
  ContentSearchResult,
  ContentService,
  CorrelationData,
  FilterValue,
  ProfileType,
  SearchType
} from 'sunbird-sdk';
import { AppGlobalService, AppHeaderService, CommonUtilService, TelemetryGeneratorService } from '@app/services';
import { animate, group, state, style, transition, trigger } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subscription, of } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import { ExploreBooksSortComponent } from '../explore-books-sort/explore-books-sort.component';
import { tap, switchMap, catchError, mapTo, debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-explore-books',
  templateUrl: './explore-books.page.html',
  styleUrls: ['./explore-books.page.scss'],
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
export class ExploreBooksPage implements OnInit, OnDestroy {
  public pageId = 'ExploreBooksPage';

  @ViewChild('searchInput') public searchInputRef: ElementRef;
  @ViewChildren('filteredItems') public filteredItemsQueryList: QueryList<any>;

  categoryGradeLevels: Array<any>;
  subjects: any;
  mimeTypes = [
    { name: 'ALL', selected: true, value: [], iconNormal: '', iconActive: '' },
    { name: 'TEXTBOOK', value: [MimeType.COLLECTION], iconNormal: './assets/imgs/book.svg', iconActive: './assets/imgs/book-active.svg' },
    {
      name: 'VIDEOS',
      value: ['video/mp4', 'video/x-youtube', 'video/webm'],
      iconNormal: './assets/imgs/play.svg',
      iconActive: './assets/imgs/play-active.svg'
    },
    {
      name: 'DOCS',
      value: ['application/pdf', 'application/epub'],
      iconNormal: './assets/imgs/doc.svg',
      iconActive: './assets/imgs/doc-active.svg'
    },
    {
      name: 'INTERACTION',
      value: ['application/vnd.ekstep.ecml-archive', 'application/vnd.ekstep.h5p-archive', 'application/vnd.ekstep.html-archive'],
      iconNormal: './assets/imgs/touch.svg', iconActive: './assets/imgs/touch-active.svg'
    }
  ];
  headerObservable: any;
  unregisterBackButton: Subscription;
  contentType: Array<string> = [];
  audienceFilter = [];
  contentSearchResult: Array<any> = [];
  showLoader = false;
  searchFormSubscription?: Subscription;
  selectedGrade: string;
  selectedMedium: string;
  selectedContentType = 'all';

  searchForm: FormGroup = new FormGroup({
    grade: new FormControl([]),
    subject: new FormControl([]),
    board: new FormControl([]),
    medium: new FormControl([]),
    query: new FormControl('', { updateOn: 'submit' }),
    mimeType: new FormControl([])
  });
  layoutName = 'explore';
  boardList: Array<FilterValue>;
  mediumList: Array<FilterValue>;
  corRelationList: Array<CorrelationData>;
  checkedSortByButton = true;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    public modalCtrl: ModalController,
    private zone: NgZone,
    public commonUtilService: CommonUtilService,
    private headerService: AppHeaderService,
    private appGlobalService: AppGlobalService,
    private translate: TranslateService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private platform: Platform,
    private router: Router,
    private location: Location
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    if (extras) {
      this.selectedGrade = extras.selectedGrade;
      this.selectedMedium = extras.selectedMedium;
      this.categoryGradeLevels = extras.categoryGradeLevels;
      this.subjects = extras.subjects;
      this.subjects.unshift({ name: this.commonUtilService.translateMessage('ALL'), selected: true });
      this.contentType = extras.contentType;

      this.corRelationList = [{
        id: this.selectedGrade,
        type: 'Grade'
      }, {
        id: this.selectedMedium,
        type: 'Medium'
      }];

      const index = this.categoryGradeLevels.findIndex((grade) => grade.name === this.searchForm.value['grade'][0]);
      this.classClick(index);
    }
  }

  async ngOnInit() {
    this.checkUserSession();
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      ImpressionSubtype.EXPLORE_MORE_CONTENT,
      PageId.EXPLORE_MORE_CONTENT,
      Environment.HOME,
      undefined,
      undefined,
      undefined,
      undefined,
      this.corRelationList);

  }

  ionViewWillEnter() {

    this.searchFormSubscription = this.onSearchFormChange()
      .subscribe(() => { });

    this.searchForm.patchValue({
      grade: this.selectedGrade,
      medium: this.selectedMedium
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleBackButton();
    this.headerService.showHeaderWithBackButton();
    window.addEventListener('keyboardDidHide', this.showSortByButton);
    window.addEventListener('keyboardWillShow', this.hideSortByButton);
  }

  ngOnDestroy(): void {
    if (this.searchFormSubscription) {
      this.searchFormSubscription.unsubscribe();
    }
  }

  handleBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.DEVICE_BACK_CLICKED,
        Environment.HOME,
        PageId.EXPLORE_MORE_CONTENT,
      );
      this.unregisterBackButton.unsubscribe();
      this.location.back();
    });
  }

  handleHeaderEvents($event) {
    if ($event.name === 'back') {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.EXPLORE_MORE_CONTENT, Environment.HOME, true);
      this.location.back();
    }
  }

  checkUserSession() {
    const isGuestUser = !this.appGlobalService.isUserLoggedIn();

    if (isGuestUser) {
      const userType = this.appGlobalService.getGuestUserType();
      if (userType === ProfileType.STUDENT) {
        this.audienceFilter = AudienceFilter.GUEST_STUDENT;
      } else if (userType === ProfileType.TEACHER) {
        this.audienceFilter = AudienceFilter.GUEST_TEACHER;
      }
    } else {
      this.audienceFilter = AudienceFilter.LOGGED_IN_USER;
    }
  }

  union(arrA: { name: string }[], arrB: { name: string }[]): { name: string }[] {
    return [
      ...arrA, ...arrB.filter((bItem) => !arrA.find((aItem) => bItem.name === aItem.name))
    ];
  }


  private onSearchFormChange(): Observable<undefined> {
    const value = new Map();
    return this.searchForm.valueChanges.pipe(
      tap(() => { }),
      debounceTime(200),
      switchMap(() => {
        const searchCriteria: ContentSearchCriteria = {
          ...this.searchForm.getRawValue(),
          query: this.searchInputRef.nativeElement['value'],
          searchType: SearchType.SEARCH,
          contentTypes: this.selectedContentType === ContentType.TEXTBOOK ? [ContentType.TEXTBOOK] : this.contentType,
          facets: Search.FACETS,
          audience: this.audienceFilter,
          mode: 'soft',
          languageCode: this.translate.currentLang,
          fields: ExploreConstants.REQUIRED_FIELDS
        };
        const values = new Map();
        values['searchCriteria'] = searchCriteria;
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.OTHER,
          InteractSubtype.SEARCH_INITIATED,
          Environment.HOME,
          PageId.EXPLORE_MORE_CONTENT,
          undefined,
          values);
        this.showLoader = true;
        this.contentSearchResult = [];
        return this.contentService.searchContent(searchCriteria).pipe(
          catchError(() => {
            this.zone.run(() => {
              this.showLoader = false;
              if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
                this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
              }
            });

            return of(undefined);
          })
        );
      }),
      tap(() => {
        (window as any).cordova.plugins.Keyboard.close();
      }),
      tap((result?: ContentSearchResult) => {
        this.zone.run(() => {
          if (result) {
            let facetFilters: Array<ContentSearchFilter>;
            this.showLoader = false;
            facetFilters = result.filterCriteria.facetFilters;

            this.fetchingBoardMediumList(facetFilters);
            this.showLoader = false;
            const gradeLevel = result.filterCriteria.facetFilters.find((f) => f.name === 'gradeLevel').values;
            gradeLevel.sort((a, b) => b.count - a.count);
            this.categoryGradeLevels = this.union(this.categoryGradeLevels, gradeLevel);
            const subjects = result.filterCriteria.facetFilters.find((f) => f.name === 'subject').values;
            subjects.sort((a, b) => b.count - a.count);
            this.subjects = this.union(this.subjects, subjects);
            this.contentSearchResult = result.contentDataList || [];
            value['searchResult'] = this.contentSearchResult.length;
          }
        });
      }),
      tap(() => {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.OTHER,
          InteractSubtype.SEARCH_COMPLETED,
          Environment.HOME,
          PageId.EXPLORE_MORE_CONTENT,
          undefined,
          value);
      }),
      mapTo(undefined)
    );

  }

  openContent(content, index) {
    const identifier = content.contentId || content.identifier;
    const value = new Map();
    value['identifier'] = identifier;
    this.corRelationList = [{
      id: 'explore',
      type: 'Source'
    }];

    const navigationExtras: NavigationExtras = {
      state: {
        content,
        corRelation: this.corRelationList
      }
    };

    if (content.mimeType === MimeType.COLLECTION) {
      this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], navigationExtras);
    } else {
      this.router.navigate([RouterLinks.CONTENT_DETAILS], navigationExtras);
    }

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.HOME,
      PageId.EXPLORE_MORE_CONTENT,
      undefined,
      value,
      undefined,
      this.corRelationList);

  }

  ionViewWillLeave() {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }

    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }

    if (this.searchFormSubscription) {
      this.searchFormSubscription.unsubscribe();
    }
    window.removeEventListener('keyboardDidHide', this.showSortByButton);
    window.removeEventListener('keyboardWillShow', this.hideSortByButton);
  }

  async openSortOptionsModal() {
    const sortOptionsModal = await this.modalCtrl.create({
      component: ExploreBooksSortComponent,
      componentProps:
      {
        searchForm: this.searchForm,
        boardList: this.boardList,
        mediumList: this.mediumList
      }
    });
    await sortOptionsModal.present();
    const { data } = await sortOptionsModal.onDidDismiss();
    if (data && data.values) {
      this.searchForm.patchValue({
        board: data.values.board || [],
        medium: data.values.medium || []
      });
      this.corRelationList = [{
        id: ( data.values.board && data.values.board.length )  ?  data.values.board[0] : '',
        type: 'Board'
      }, {
        id: (data.values.medium && data.values.medium.length) ? data.values.medium[0] : '' ,
        type: 'Medium'
      }];
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.SORT_BY_FILTER_SET,
        Environment.HOME,
        PageId.EXPLORE_MORE_CONTENT,
        undefined,
        undefined,
        undefined,
        this.corRelationList);
    }
    if (!data) {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
          PageId.EXPLORE_MORE_CONTENT,
          Environment.HOME,
          false);
    }
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SORT_BY_CLICKED,
      Environment.HOME,
      PageId.EXPLORE_MORE_CONTENT
    );
  }

  onMimeTypeClicked(mimeType, index) {

    this.mimeTypes.forEach((value) => {
      value.selected = false;
    });

    this.mimeTypes[index].selected = true;

    const idx = this.mimeTypes.findIndex((value) => value.name === 'TEXTBOOK');

    this.generateMimeTypeClickedTelemetry(mimeType.name);

    if (idx === index) {
      this.selectedContentType = ContentType.TEXTBOOK;
    } else {
      this.selectedContentType = 'all';
    }

  }

  fetchingBoardMediumList(facetFilters) {
    return facetFilters.filter(value => {
      if (value.name === 'board') {
        this.boardList = value.values;
      }

      if (value.name === 'medium') {
        this.mediumList = value.values;
      }
    });
  }

  classClick(index) {
    const el: HTMLElement | null = document.getElementById('gradeLevel' + index);
    setTimeout(() => {
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
      }
    }, 0);
  }

  classClickedForTelemetry(currentClass: string) {
    this.corRelationList = [{
      id: currentClass,
      type: 'Class'
    }];

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CLASS_CLICKED,
      Environment.HOME,
      PageId.EXPLORE_MORE_CONTENT,
      undefined,
      undefined,
      undefined,
      this.corRelationList
    );
  }

  subjectClicked(index, currentSubject: string) {
    this.corRelationList = [{
      id: currentSubject,
      type: 'Subject'
    }];

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SUBJECT_CLICKED,
      Environment.HOME,
      PageId.EXPLORE_MORE_CONTENT,
      undefined,
      undefined,
      undefined,
      this.corRelationList);
  }

  generateMimeTypeClickedTelemetry(mimeTypeName) {
    this.corRelationList = [{
      id: mimeTypeName,
      type: 'MimeType'
    }];

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.FILTER_CLICKED,
      Environment.HOME,
      PageId.EXPLORE_MORE_CONTENT,
      undefined,
      undefined,
      undefined,
      this.corRelationList);
  }

  hideSortByButton = () => {
    this.zone.run(() => {
      this.checkedSortByButton = false;
    });
  }

  showSortByButton = () => {
    this.zone.run(() => {
      this.checkedSortByButton = true;
    });
  }
}
