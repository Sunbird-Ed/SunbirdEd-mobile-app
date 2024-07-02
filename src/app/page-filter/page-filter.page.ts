import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { NavParams, Platform, PopoverController, MenuController } from '@ionic/angular';
import { Events } from '../../util/events';
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import { TranslateService } from '@ngx-translate/core';
import {
  CategoryTerm,
  FrameworkCategoryCode,
  FrameworkCategoryCodesGroup,
  FrameworkUtilService,
  GetFrameworkCategoryTermsRequest,
  PageAssembleFilter,
  CachedItemRequestSourceFrom
} from '@project-sunbird/sunbird-sdk';

import { PageFilterOptionsPage } from './page-filter-options/page-filter-options.page';
import { AppGlobalService } from 'services/app-global-service.service';
import { TelemetryGeneratorService } from 'services/telemetry-generator.service';
import { CommonUtilService } from 'services/common-util.service';
import { FormAndFrameworkUtilService } from 'services/formandframeworkutil.service';
import { PageId, ImpressionType, Environment, InteractSubtype, InteractType } from '../../services/telemetry-constants';

@Component({
  selector: 'app-page-filter',
  templateUrl: './page-filter.page.html',
  styleUrls: ['./page-filter.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PageFilterPage {
  pagetAssemblefilter: PageAssembleFilter = {};
  callback: PageFilterCallback;
  filters = [];
  pageId;
  facetsFilter;
  backupFilters;

  backButtonFunc = undefined;
  selectedLanguage = 'en';
  categories: Array<FrameworkCategoryCode> = FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES;

  constructor(
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    private popCtrl: PopoverController,
    private navParams: NavParams,
    private platform: Platform,
    private translate: TranslateService,
    private appGlobalService: AppGlobalService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private menuCtrl: MenuController
  ) {
    this.callback = this.navParams.get('callback');
    this.initFilterValues();

    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popCtrl.dismiss();
    });

    this.events.subscribe('onAfterLanguageChange:update', () => {
      this.onLanguageChange();
    });
  }

  async ionViewWillEnter() {
    await this.menuCtrl.enable(false);
  }

  onLanguageChange() {
    if (this.filters) {
      this.filters.forEach(filter => {
        if (filter.code === 'contentType' && filter.hasOwnProperty('resourceTypeValues')) {
          const resourceTypes = [];
          filter.resourceTypeValues.forEach(element => {
            resourceTypes.push(this.commonUtilService.getTranslatedValue(element.translations, element.name));
          });
          filter.values = resourceTypes;
          if (filter.hasOwnProperty('selected')) {
            const translatedSected = [];
            filter.selectedValuesIndices.forEach(selectedIndex => {
              translatedSected.push(filter.values[selectedIndex]);
            });
            filter.selected = translatedSected;
          }
        }
      });
    }
  }

  async initFilterValues() {
    this.filters = this.navParams.get('filter');
    this.backupFilters = JSON.parse(JSON.stringify(this.filters));
    this.pageId = this.navParams.get('pageId');
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    if (this.pageId === PageId.COURSES) {
      this.pageId = PageId.COURSE_PAGE_FILTER;
      this.categories = FrameworkCategoryCodesGroup.COURSE_FRAMEWORK_CATEGORIES;
    } else if (this.pageId === PageId.LIBRARY) {
      this.pageId = PageId.LIBRARY_PAGE_FILTER;
    }
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      this.pageId,
      Environment.HOME
    );

    if (this.filters) {
      const filterNames = [];
      this.filters.forEach(element => {
        element.name = this.commonUtilService.getTranslatedValue(element.translations, element.name);
        filterNames.push(element.code);
      });

      const values = new Map();
      values['categories'] = filterNames;
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.OTHER,
        InteractSubtype.FILTER_CONFIG,
        Environment.HOME,
        this.pageId,
        undefined,
        values
      );
    }

    this.filters.forEach(filter => {
      if (filter.code === 'contentType' && !filter.hasOwnProperty('resourceTypeValues')) {
        filter.resourceTypeValues = cloneDeep(filter.values);
        const resourceTypes = [];
        filter.values.forEach(element => {
          resourceTypes.push(this.commonUtilService.getTranslatedValue(element.translations, element.name));
        });
        filter.values = resourceTypes;
      }
    });

    const syllabus: Array<string> = this.appGlobalService.getCurrentUser().syllabus;
    let frameworkId;

    if (this.pageId === PageId.COURSE_PAGE_FILTER) {
      frameworkId = await this.formAndFrameworkUtilService.getCourseFrameworkId();
    } else {
      frameworkId = (syllabus && syllabus.length > 0) ? syllabus[0] : undefined;
    }
    let index = 0;
    for (const element of this.filters) {
      try {
        if (!element.frameworkCategory && this.pageId === PageId.COURSE_PAGE_FILTER) {
          await this.getRootOrganizations(index);
        } else {
          await this.getFrameworkData(frameworkId, element.code, index);
        }
      } catch (error) {
        console.log('error: ' + error);
      }
      // Framework API doesn't return domain and content Type exclude them
      if (index === this.filters.length - 1) {
        this.facetsFilter = this.filters;
        await loader.dismiss();
      }
      index++;
    }
  }

  /**
   * This will internally call framework API
   * @param  currentCategory - request Parameter passing to the framework API
   * @param index - Local variable name to hold the list data
   */
  async getFrameworkData(frameworkId: string, currentCategory: string, index: number) {
    return new Promise((resolve, reject) => {
      const req: GetFrameworkCategoryTermsRequest = {
        from: CachedItemRequestSourceFrom.SERVER,
        currentCategoryCode: currentCategory,
        language: this.translate.currentLang,
        requiredCategories: this.categories,
        frameworkId
      };
      this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise()
        .then((res: CategoryTerm[]) => {
          const category = res;
          const responseArray = category;
          if (responseArray && responseArray.length > 0) {
            if (req.currentCategoryCode === 'topic' && this.pageId === PageId.COURSE_PAGE_FILTER) {
              for (let i = 0; i < responseArray.length; i++) {
                const name = responseArray[i].name;
                this.filters[index].values[i] = {};
                this.filters[index].values[i][name] = responseArray[i].children;
              }
              resolve('');
            } else {
              resolve(this.filters[index].values = map(responseArray, 'name'));
            }
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  async openFilterOptions(facet) {
    const filterDialog = await this.popCtrl.create({
      component: PageFilterOptionsPage,
      componentProps: {
        facets: facet
      },
      cssClass: 'resource-filter-options'
    });
    await filterDialog.present();
  }

  getSelectedOptionCount(facet) {
    if (facet.selected && facet.selected.length > 0) {
      this.pagetAssemblefilter[facet.code] = facet.selected;
      return `${facet.selected.length} ` + this.commonUtilService.translateMessage('FILTER_ADDED');
    }

    return '';
  }

  async apply() {
    if (this.callback) {
      const filters = cloneDeep(this.facetsFilter);
      filters.forEach(element => {
        if (element.code === 'contentType' && element.selectedValuesIndices && element.selectedValuesIndices.length) {
          const resourceTypeSelectedValues = [];
          element.resourceTypeValues.forEach((item, index) => {
            if (element.selectedValuesIndices.includes(index)) {
              resourceTypeSelectedValues.push(item.code);
            }
          });
          this.pagetAssemblefilter[element.code] = resourceTypeSelectedValues;
        }
      });
      this.callback.applyFilter(this.pagetAssemblefilter, this.facetsFilter, true);
    }
    await this.popCtrl.dismiss({apply: true});
  }

  async cancel() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CANCEL,
      Environment.HOME,
      this.pageId);

    this.callback.applyFilter(this.pagetAssemblefilter, this.backupFilters, false);
    await this.popCtrl.dismiss();
  }

  async getRootOrganizations(index) {
    await this.formAndFrameworkUtilService.getRootOrganizations()
      .then(res => {
        this.filters[index].values = res;
      })
      .catch(error => {
        console.log(error, 'index', index);
      });
  }

  async ionViewWillLeave(): Promise<void> {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
    await this.menuCtrl.enable(true);
  }
}

export interface PageFilterCallback {
  applyFilter(filter: PageAssembleFilter, appliedFilter: any, isChecked: boolean);
}

