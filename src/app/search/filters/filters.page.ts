import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { PopoverController, Platform } from '@ionic/angular';
import { Events } from '../../../util/events';
import find from 'lodash/find';
import { CommonUtilService } from '../../../services/common-util.service';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FilteroptionComponent } from '../../../app/components/filteroption/filteroption.component';
import { AppHeaderService } from '../../../services/app-header.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import {
  Environment, InteractSubtype, InteractType, PageId
} from '../../../services/telemetry-constants';
import { ContentService, ContentSearchResult, SearchType } from '@project-sunbird/sunbird-sdk';
import { ContentUtil } from '../../../util/content-util';
import { FormAndFrameworkUtilService } from '../../../services/formandframeworkutil.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.page.html',
  styleUrls: ['./filters.page.scss']
})
export class FiltersPage implements OnInit, OnDestroy {

  filterCriteria: any;
  initialFilterCriteria: any;

  facetsFilter: Array<any> = [];

  unregisterBackButton: Subscription;
  source: string;
  shouldEnableFilter = true;
  supportedUserTypesConfig: Array<any> = [];

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private popCtrl: PopoverController,
    private events: Events,
    private commonUtilService: CommonUtilService,
    private platform: Platform,
    private location: Location,
    private router: Router,
    private headerService: AppHeaderService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService
  ) {
    this.filterCriteria = this.router.getCurrentNavigation().extras.state.filterCriteria;
    this.initialFilterCriteria = this.router.getCurrentNavigation().extras.state.initialfilterCriteria;
    this.source = this.router.getCurrentNavigation().extras.state.source;
    this.supportedUserTypesConfig = this.router.getCurrentNavigation().extras.state.supportedUserTypesConfig;
    this.handleBackButton();
  }

  async ngOnInit(): Promise<void> {
    await this.fetchChannelIdName();
    this.init();
  }

  private async fetchChannelIdName() {
    this.filterCriteria = await this.formAndFrameworkUtilService.changeChannelIdToName(this.filterCriteria);
    this.initialFilterCriteria = await this.formAndFrameworkUtilService.changeChannelIdToName(this.initialFilterCriteria);
  }

  async ionViewWillEnter() {
    await this.headerService.showHeaderWithBackButton([]);
  }

  ionViewWillLeave() {
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  async openFilterOptions(facet) {
    const popUp = await this.popCtrl.create({
      component: FilteroptionComponent,
      componentProps:
      {
        facet,
        source: this.source
      },
      cssClass: 'option-box'
    });
    const values = new Map();
    values['facetsClicked'] = facet.name;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.FILTER_CLICKED,
      Environment.HOME,
      (this.source && this.source.match('courses')) ? PageId.COURSE_SEARCH_FILTER : PageId.LIBRARY_SEARCH_FILTER,
      undefined,
      values);
    await popUp.present();
    const { data } = await popUp.onDidDismiss();
    if (data && data.isFilterApplied) {
      await this.applyInterimFilter();
    }
  }

  reset() {
    this.filterCriteria = JSON.parse(JSON.stringify(this.initialFilterCriteria));
    this.facetsFilter = [];
    this.init();
  }

  async applyFilter() {
    const values = {
      appliedFilter: {}
    };
    values.appliedFilter = this.filterCriteria;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.APPLY_FILTER_CLICKED,
      Environment.HOME,
      PageId.COURSE_SEARCH_FILTER,
      undefined,
      values);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.APPLY_FILTER_CLICKED,
      Environment.HOME,
      (this.source && this.source.match('courses')) ? PageId.COURSE_SEARCH_FILTER : PageId.LIBRARY_SEARCH_FILTER,
      undefined,
      values);
    this.filterCriteria = await this.formAndFrameworkUtilService.changeChannelNameToId(this.filterCriteria);
    this.events.publish('search.applyFilter', this.filterCriteria);
    this.location.back();
  }

  getSelectedOptionCount(facet) {
    let count = 0;

    facet.values.forEach((value) => {
      if (value.apply) {
        count += 1;
      }
    });

    if (count > 0) {
      return `${count} ` + this.commonUtilService.translateMessage('FILTER_ADDED');
    }

    return '';
  }

  init() {
    const filters: Array<any> = [];
    this.filterCriteria.facets.forEach(facet => {
      const data = this.getFilterValues(facet);
      if (data) {
        filters.push(data);
      }
    });

    if (filters && filters.length) {
      this.filterCriteria.facetFilters.length = 0;
      this.filterCriteria.facetFilters = filters;
    }

    this.filterCriteria.facetFilters.forEach(facet => {
      if (facet.values && facet.values.length > 0) {
        if (facet.name === 'gradeLevel') {
          const maxIndex: number = facet.values.reduce((acc, val) => (val.index && (val.index > acc)) ? val.index : acc, 0);
          facet.values.sort((i, j) => (i.index || maxIndex + 1) - (j.index || maxIndex + 1));
        } else if (facet.name === 'audience') {
          facet.values.sort((i, j) => i.name.localeCompare(j.name));
          facet.values.forEach((element, index) => {
            this.supportedUserTypesConfig.forEach((userType, newIndex) => {
              if (userType['ambiguousFilters'].includes(element.name)) {
                element.name = userType['code'];
              }
            });

          });
          facet.values = this.commonUtilService.deDupe(facet.values, 'name');
        } else {
          facet.values.sort((i, j) => i.name.localeCompare(j.name));
        }
        facet.values.forEach((element, index) => {
          if (element.name.toUpperCase() === 'other'.toUpperCase()) {
            const elementVal = element;
            facet.values.splice(index, 1);
            facet.values.push(elementVal);
          }
        });
        this.facetsFilter.push(facet);
      }
    });
  }

  getFilterValues(facet: string) {
    if (facet) {
      const filterName = find(this.filterCriteria.facetFilters, ['name', facet]);
      if (filterName && filterName.values && filterName.values.length) {
        return filterName;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * It will hndle the device back button functionality
   */
  handleBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
    });
  }

  public async applyInterimFilter() {
    this.filterCriteria.mode = 'hard';
    this.filterCriteria.searchType = SearchType.FILTER;
    this.filterCriteria.fields = [];
    this.shouldEnableFilter = false;
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.filterCriteria = await this.formAndFrameworkUtilService.changeChannelNameToId(this.filterCriteria);
    const modifiedCriteria = JSON.parse(JSON.stringify(this.filterCriteria));
    modifiedCriteria.facetFilters.forEach(facet => {
      if (facet.values && facet.values.length > 0) {
        if (facet.name === 'audience') {
          facet.values = ContentUtil.getAudienceFilter(facet, this.supportedUserTypesConfig);
        }
      }
    });
    this.contentService.searchContent(modifiedCriteria).toPromise()
      .then(async (responseData: ContentSearchResult) => {
        this.shouldEnableFilter = true;
        if (responseData) {
          this.facetsFilter = [];
          this.filterCriteria = undefined;
          this.filterCriteria = await this.formAndFrameworkUtilService.changeChannelIdToName(responseData.filterCriteria);
          responseData.filterCriteria.facetFilters.forEach(element => {
            this.initialFilterCriteria.facetFilters.forEach(item => {
              if (element.name === item.name) {
                element['translatedName'] = item.translatedName;
                return;
              }
            });
          });
          await loader.dismiss();
          this.init();
        }
      }).catch(async () => {
        await loader.dismiss();
        this.shouldEnableFilter = true;
      });
  }

  ngOnDestroy() {
    this.events.publish('update_back_header', true);
  }

}
