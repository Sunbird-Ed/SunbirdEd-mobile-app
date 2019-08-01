import { Component } from '@angular/core';
import { NavParams, PopoverController, NavController, Events, Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { CommonUtilService } from '@app/services';
import { Subscription } from 'rxjs/Subscription';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FilteroptionComponent } from '@app/app/components/filteroption/filteroption.component';
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
    private router: Router
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
          facet.values = _.orderBy(facet.values, ['name'], ['asc']);
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
      const filterName = _.find(this.filterCriteria.facetFilters, ['name', facet]);
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
    // this.unregisterBackButton = this.platform.registerBackButtonAction(() => {
    //   const activePortal = this.ionicApp._modalPortal.getActive() ||
    //     this.ionicApp._toastPortal.getActive() || this.ionicApp._overlayPortal.getActive();
    //   if (activePortal) {
    //     activePortal.dismiss();
    //   } else if (this.navCtrl.canGoBack()) {
    //     this.navCtrl.pop();
    //   }
    //   this.unregisterBackButton();
    // }, 11);
    this.unregisterBackButton = this.platform.backButton.subscribe(() => {
      this.location.back();
    });
  }

  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    if (this.unregisterBackButton) {
      // this.unregisterBackButton();
      this.unregisterBackButton.unsubscribe();
    }
  }

}
