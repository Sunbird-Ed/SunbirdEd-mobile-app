import {
  Component, ElementRef,
  Inject, NgZone, OnDestroy, QueryList,
  ViewChild, ViewChildren, OnInit
} from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { MimeType, Search, ExploreConstants } from 'app/app.constant';
import { Map } from 'app/telemetryutil';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId,
  CorReleationDataType
} from 'services/telemetry-constants';
import {
  ContentSearchCriteria,
  ContentSearchFilter,
  ContentSearchResult,
  ContentService,
  CorrelationData,
  FilterValue,
  SearchType
} from '@project-sunbird/sunbird-sdk';
import { LibraryCardTypes } from '@project-sunbird/common-consumption';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { CommonUtilService } from '../../../services/common-util.service';
import { AppHeaderService } from '../../../services/app-header.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { animate, group, state, style, transition, trigger } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subscription, of } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import { ExploreBooksSortComponent } from '../explore-books-sort/explore-books-sort.component';
import { tap, switchMap, catchError, mapTo, debounceTime } from 'rxjs/operators';
import { NavigationService } from '../../../services/navigation-handler.service';
import { CsPrimaryCategory } from '@project-sunbird/client-services/services/content';

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

  @ViewChild('searchInput', { static: false }) public searchInputRef: ElementRef;
  @ViewChildren('filteredItems') public filteredItemsQueryList: QueryList<any>;

  LibraryCardTypes = LibraryCardTypes;
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
  primaryCategories: Array<string> = [];
  contentSearchResult: Array<any> = [];
  showLoader = false;
  searchFormSubscription?: Subscription;
  selectedGrade: string;
  selectedMedium: string;
  selectedPrimartCategory = 'all';

  searchForm: FormGroup = new FormGroup({
    grade: new FormControl([]),
    subject: new FormControl([]),
    board: new FormControl([]),
    medium: new FormControl([]),
    query: new FormControl('', { updateOn: 'submit' }),
    mimeType: new FormControl([])
  });
  boardList: Array<FilterValue>;
  mediumList: Array<FilterValue>;
  corRelationList: Array<CorrelationData>;
  checkedSortByButton = true;
  currentSelectedClass: any;

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
    private location: Location,
    private navService: NavigationService
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    if (extras) {
      this.selectedGrade = extras.selectedGrade;
      this.selectedMedium = extras.selectedMedium;
      this.categoryGradeLevels = extras.categoryGradeLevels;
      this.subjects = extras.subjects;
      this.subjects.unshift({ name: this.commonUtilService.translateMessage('ALL'), selected: true });
      this.primaryCategories = extras.primaryCategories;

      this.corRelationList = [
        ... this.populateCData(this.selectedGrade, CorReleationDataType.CLASS),
        ... this.populateCData(this.selectedMedium, CorReleationDataType.MEDIUM)
      ];

      const index = this.categoryGradeLevels.findIndex((grade) => grade.name === this.searchForm.value['grade'][0]);
      this.classClick(index);
    }
  }

  async ngOnInit() {
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

  async ionViewWillEnter() {
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
    await this.headerService.showHeaderWithBackButton();
    window.addEventListener('keyboardDidHide', this.showSortByButton);
    window.addEventListener('keyboardWillShow', this.hideSortByButton);
  }

  ngOnDestroy(): void {
    if (this.searchFormSubscription) {
      this.searchFormSubscription.unsubscribe();
    }
  }

  private populateCData(profileAtributes, correlationType): Array<CorrelationData> {
    const correlationList: Array<CorrelationData> = [];
    if (profileAtributes) {
      profileAtributes.forEach((value) => {
        correlationList.push({
          id: value || '',
          type: correlationType
        });
      });
    }
    return correlationList;
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
          primaryCategories: this.selectedPrimartCategory === CsPrimaryCategory.DIGITAL_TEXTBOOK ?
            [CsPrimaryCategory.DIGITAL_TEXTBOOK] : this.primaryCategories,
          facets: Search.FACETS,
          audience: [],
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
        if (this.currentSelectedClass) {
          searchCriteria.grade[0] = this.currentSelectedClass;
        }
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
        (window as any).Keyboard.hide();
      }),
      tap((result?: ContentSearchResult) => {
        this.zone.run(() => {
          if (result) {
            let facetFilters: Array<ContentSearchFilter>;
            this.showLoader = false;
            facetFilters = result.filterCriteria.facetFilters;

            this.fetchingBoardMediumList(facetFilters);
            this.showLoader = false;
            const gradeLevel = result.filterCriteria.facetFilters.find((f) => f.name === 'se_gradeLevels').values;
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

  async openContent(content, index) {
    const identifier = content.contentId || content.identifier;
    const value = new Map();
    value['identifier'] = identifier;
    const corRelationList = [{
      id: 'explore',
      type: CorReleationDataType.SOURCE
    }];

    const navigationExtras: NavigationExtras = {
      state: {
        content,
        corRelation: corRelationList
      }
    };

    await this.navService.navigateToDetailPage(content, navigationExtras.state);

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.HOME,
      PageId.EXPLORE_MORE_CONTENT,
      undefined,
      value,
      undefined,
      corRelationList);

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
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.SORT_BY_FILTER_SET,
        Environment.HOME,
        PageId.EXPLORE_MORE_CONTENT,
        undefined,
        undefined,
        undefined,
        [
          ...this.populateCData(data.values.board, CorReleationDataType.BOARD),
          ...this.populateCData(data.values.medium, CorReleationDataType.MEDIUM),
        ]);
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
      this.selectedPrimartCategory = CsPrimaryCategory.DIGITAL_TEXTBOOK;
    } else {
      this.selectedPrimartCategory = 'all';
    }
  }

  fetchingBoardMediumList(facetFilters) {
    return facetFilters.filter(value => {
      if (value.name === 'se_boards') {
        this.boardList = value.values;
      }

      if (value.name === 'se_mediums') {
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
    this.currentSelectedClass = currentClass;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CLASS_CLICKED,
      Environment.HOME,
      PageId.EXPLORE_MORE_CONTENT,
      undefined,
      undefined,
      undefined,
      [{
        id: currentClass,
        type: CorReleationDataType.CLASS
      }]
    );
  }

  subjectClicked(index, currentSubject: string) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SUBJECT_CLICKED,
      Environment.HOME,
      PageId.EXPLORE_MORE_CONTENT,
      undefined,
      undefined,
      undefined,
      [{
        id: currentSubject,
        type: CorReleationDataType.SUBJECT
      }]);
  }

  generateMimeTypeClickedTelemetry(mimeTypeName) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.FILTER_CLICKED,
      Environment.HOME,
      PageId.EXPLORE_MORE_CONTENT,
      undefined,
      undefined,
      undefined,
      [{
        id: mimeTypeName,
        type: CorReleationDataType.MIMETYPE
      }]);
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
