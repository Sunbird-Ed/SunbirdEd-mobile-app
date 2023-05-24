import { Location } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentAggregatorHandler } from '../../services/content/content-aggregator-handler.service';
import { AppHeaderService } from '../../services/app-header.service';
import { CommonUtilService } from '../../services/common-util.service';
import { AggregatorPageType } from '../../services/content/content-aggregator-namespaces';
import { NavigationService } from '../../services/navigation-handler.service';
import { CorReleationDataType, Environment, InteractSubtype, InteractType, PageId } from '../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { ContentUtil } from '../../util/content-util';
import { LibraryCardTypes } from '@project-sunbird/common-consumption';
import { ContentsGroupedByPageSection, ContentSearchCriteria, ContentData, SearchType, ProfileService, Profile, ContentService, CourseService, FormService, CachedItemRequestSourceFrom, ContentAggregatorRequest } from '@project-sunbird/sunbird-sdk';
import { AggregatorConfigField, ContentAggregation } from '@project-sunbird/sunbird-sdk/content/handlers/content-aggregator';
import { Subscription } from 'rxjs';
import { ProfileConstants } from '../app.constant';
import { FrameworkCategory } from '@project-sunbird/client-services/models/channel';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-textbook-view-more',
  templateUrl: './textbook-view-more.page.html',
  styleUrls: ['./textbook-view-more.page.scss'],
})
export class TextbookViewMorePage {
  private frameworkCategoriesMap: { [code: string]: FrameworkCategory | undefined } = {};
  @ViewChild('contentView', { static: false }) contentView: IonContent;

  LibraryCardTypes = LibraryCardTypes;
  contentList: any;
  subjectName: any;
  corRelationList: any;
  toast: any;
  sectionGroup?: ContentsGroupedByPageSection;
  formField: {
    facet: string;
    searchCriteria: ContentSearchCriteria;
    aggregate: {
      sortBy?: {
        [field in keyof ContentData]: 'asc' | 'desc';
      }[];
      groupBy?: keyof ContentData;
      groupSortBy?: any
    };
    showNavigationPill?: boolean;
    filterPillBy?: string;
  };
  fromLibrary = false;
  sectionCode = '';
  primaryFacetFiltersFormGroup: FormGroup;

  private searchCriteria: ContentSearchCriteria;
  // header
  private _appHeaderSubscription?: Subscription;
  private _headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [] as string[]
  };
  filterIdentifier: any;
  supportedFacets: any;
  profile: Profile;
  displaySections?: any[];
  totalCount: number;
  viewMoreTotalCount: number;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FORM_SERVICE') private formService: FormService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private headerService: AppHeaderService,
    public commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private router: Router,
    private location: Location,
    private navService: NavigationService,
    private contentAggregatorHandler: ContentAggregatorHandler
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    if (extras) {
      this.contentList = extras.contentList;
      this.subjectName = extras.subjectName;
      this.corRelationList = extras.corRelation;
      this.supportedFacets = extras.supportedFacets;
      this.totalCount = this.contentList.length;
      this.viewMoreTotalCount = extras.totalCount;
    }
    if(this.corRelationList) {
      this.corRelationList.forEach(list => {
        if (list.type == CorReleationDataType.CONTENT) {
          this.formField = list.id;
          this.searchCriteria = JSON.parse(JSON.stringify(list.id.searchCriteria));
          if (this.formField && this.formField.facet && this.formField.facet.toLowerCase() === 'course') {
            if (!this.searchCriteria.impliedFiltersMap) {
              this.searchCriteria.impliedFiltersMap = [];
            }
            this.searchCriteria.impliedFiltersMap = this.searchCriteria.impliedFiltersMap.concat([{
              'batches.enrollmentType': 'open'
            }, {
              'batches.status': 1
            }
          ]);
          }
          this.formField.facet = this.formField.facet.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
        }
      });
    }
  }

  async ionViewWillEnter() {
    await this.initAppHeader();
  }

  ionViewWillLeave() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }

  private async initAppHeader() {
    this.profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
    this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this._headerConfig = this.headerService.getDefaultPageConfig();
    this._headerConfig.actionButtons = [];
    this._headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this._headerConfig);
  }

  private handleHeaderEvents(event: { name: string }) {
    if (event.name === 'back') {
      this.location.back();
    }
  }

  async navigateToDetailPage(item, index, sectionName) {
    const values = new Map();
    values['sectionName'] = item.subject;
    values['positionClicked'] = index;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.HOME,
      PageId.LIBRARY,
      ContentUtil.getTelemetryObject(item),
      values);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      await this.navService.navigateToDetailPage(item, {
        content: item,
        corRelation: this.corRelationList
      });
    } else {
      this.commonUtilService.showToast('OFFLINE_WARNING_ETBUI', false, 'toastHeader', 3000, 'top');
    }
  }

  loadData(event) {
    setTimeout(async () => {
      if (this.subjectName === "Recently published courses") {
        await this.fetchRecentPlublishedCourses();
      } else {
        await this.fetchAndSortData({
          ...this.searchCriteria,
          facets: this.supportedFacets,
          searchType: SearchType.SEARCH,
          limit: 10
        }, event)
      }
    }, 500);
  }

  async fetchRecentPlublishedCourses() {
    let refresher = true;
    this.displaySections = undefined;
    this.totalCount = 0;
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
        contentSearchCriteria.offset = this.contentList.length;
        contentSearchCriteria.limit = 10
        return contentSearchCriteria;
      }, from: refresher ? CachedItemRequestSourceFrom.SERVER : CachedItemRequestSourceFrom.CACHE
    };
    let displayItems = await this.contentAggregatorHandler.newAggregate(request, AggregatorPageType.HOME);
    this.displaySections = this.contentAggregatorHandler.populateIcons(displayItems);
    this.displaySections.forEach(section => {
      if (this.commonUtilService.getTranslatedValue(section.title, '') == this.subjectName) {
        this.totalCount = section.data.sections[0].contents.length;
        section.data.sections[0].contents.forEach(list => {
          this.contentList.push(list);
        })
      }
    })
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
  
  private async fetchAndSortData(searchCriteria, event: any, onSelectedFilter?: any,) {
    if (onSelectedFilter) {
      const selectedData = [];
      onSelectedFilter.forEach((selectedFilter) => {
        selectedData.push(selectedFilter.name);
      });
      if (this.formField.aggregate && this.formField.aggregate.groupSortBy && this.formField.aggregate.groupSortBy.length) {
        this.formField.aggregate.groupSortBy.forEach((data) => {
          data.name.preference = selectedData;
        });
      }
    }

    if (this.profile.subject.length >= 1) {
      if (this.formField.aggregate && this.formField.aggregate.groupSortBy && this.formField.aggregate.groupSortBy.length) {
        this.formField.aggregate.groupSortBy.forEach((sortData) => {
          if (sortData.name.preference) {
            sortData.name.preference.push(this.profile.subject);
          }
        });
      }
    }
    searchCriteria.offset = this.contentList.length;
    searchCriteria.limit = 10;
    this.totalCount = 0;
    const temp = ((await this.contentService.buildContentAggregator
      (this.formService, this.courseService, this.profileService)
      .aggregate({
        interceptSearchCriteria: () => (searchCriteria),
        userPreferences: {
          board: this.profile.board,
          medium: this.profile.medium,
          gradeLevel: this.profile.grade,
          subject: this.profile.subject,
        }
      },
        [], null, [{
          dataSrc: {
            type: 'CONTENTS',
            request: {
              type: 'POST',
              path: '/api/content/v1/search',
              withBearerToken: true
            },
            mapping: [{
              aggregate: this.formField.aggregate
            }]
          },
          sections: [
            {
              index: 0,
              title: this.formField.facet,
              theme: {}
            }
          ],
        } as AggregatorConfigField<'CONTENTS'>]).toPromise()).result);
    (this as any)['filterCriteria'] = temp[0].meta.filterCriteria;
    console.log('temp ', temp);
    this.sectionGroup = (temp[0] as ContentAggregation<'CONTENTS'>).data;
    this.sectionGroup.sections.forEach(section => {
      if (section.name == this.subjectName) {
        this.viewMoreTotalCount = section.totalCount;
        this.totalCount = section.contents.length;
        section.contents.forEach(list => {
          this.contentList.push(list);
        })
      }
    });
  }

  async scrollUp() {
    await this.contentView.scrollToTop();
  }
}
