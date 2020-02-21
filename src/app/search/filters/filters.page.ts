import { Component } from '@angular/core';
import { NavParams, PopoverController, NavController, Events, Platform } from '@ionic/angular';
import orderBy from 'lodash/orderBy';
import find from 'lodash/find';
import { CommonUtilService } from '@app/services/common-util.service';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FilteroptionComponent } from '@app/app/components/filteroption/filteroption.component';
import { AppHeaderService } from '@app/services/app-header.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
  Environment, InteractSubtype, InteractType, PageId
} from '@app/services/telemetry-constants';
@Component({
  selector: 'app-filters',
  templateUrl: './filters.page.html',
  styleUrls: ['./filters.page.scss']
})
export class FiltersPage {

  filterCriteria: any;

  facetsFilter: Array<any> = [];

  unregisterBackButton: Subscription;

  constructor(
    // private navParams: NavParams,
    private popCtrl: PopoverController,
    private navCtrl: NavController,
    private events: Events,
    private commonUtilService: CommonUtilService,
    private platform: Platform,
    private location: Location,
    private router: Router,
    private headerService: AppHeaderService,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    this.filterCriteria = this.router.getCurrentNavigation().extras.state.filterCriteria;
    this.init();
    this.handleBackButton();
    console.log('filer ciriteria', this.filterCriteria);
  }

  async openFilterOptions(facet) {
    const popUp = await this.popCtrl.create({
      component: FilteroptionComponent,
      componentProps:
      {
        facet: facet
      },
      cssClass: 'option-box'
    });
    const values = new Map();
    values['facetsClicked'] = facet.name;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.FILTER_CLICKED,
      Environment.HOME,
      PageId.LIBRARY_SEARCH_FILTER,
      undefined,
      values);
    await popUp.present();
  }

  applyFilter() {
    this.navCtrl.pop();
    this.events.publish('search.applyFilter', this.filterCriteria);
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
        if (facet.name !== 'gradeLevel') {
          facet.values = orderBy(facet.values, ['name'], ['asc']);
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

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton([], this.commonUtilService.translateMessage('FILTER'));
  }

  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

}
