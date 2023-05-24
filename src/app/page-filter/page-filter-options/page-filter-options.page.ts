import { AppGlobalService } from '../../../services/app-global-service.service';
import { Component, ViewEncapsulation } from '@angular/core';
import {
  NavParams,
  Platform,
  PopoverController,
} from '@ionic/angular';
import { PageAssembleFilter } from '@project-sunbird/sunbird-sdk';
@Component({
  selector: 'app-page-filter-options',
  templateUrl: './page-filter-options.page.html',
  styleUrls: ['./page-filter-options.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PageFilterOptionsPage {

  pagetAssemblefilter: PageAssembleFilter = {};
  facets: any;
  backButtonFunc = undefined;
  selected: boolean;
  topicsSelected: any[];
  items: any[];

  shownGroup = null;
  topicsArr = [];
  topicsVal = [];
  filteredTopicArr = [];
  showTopicFilterList = false;
  prevSelectedTopic = [];
  constructor(
    private navParams: NavParams,
    private viewCtrl: PopoverController,
    private appGlobalService: AppGlobalService,
    private platform: Platform) {

    this.facets = this.navParams.get('facets');
    if (this.facets.name === 'Topic') {

      // tslint:disable-next-line:forin
      for (let i = 0; i < this.facets.values.length; i++) {
        this.topicsArr.push(Object.keys(this.facets.values[i])[0]);
        this.topicsVal.push(this.facets.values[i][this.topicsArr[i]]);
      }
      if (this.facets.selected) {
        this.prevSelectedTopic = [...this.facets.selected];
      }

    }
    this.handleDeviceBackButton();
  }

  handleDeviceBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10 , async () => {
      await this.viewCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
  }

  isSelected(value) {
    if (!this.facets.selected) {
      return false;
    }

    return this.facets.selected.includes(value);
  }

  changeValue(value, index) {
    if (!this.facets.selected) {
      this.facets.selected = [];
      if (this.facets.code === 'contentType') {
        this.facets.selectedValuesIndices = [];
      }
    }
    if (this.facets.selected.includes(value)) {
      index = this.facets.selected.indexOf(value);
      if (index > -1) {
        this.facets.selected.splice(index, 1);
        if (this.facets.code === 'contentType') {
          this.facets.selectedValuesIndices.splice(index, 1);
        }
      }
    } else {
      if (!this.appGlobalService.isUserLoggedIn() && this.facets.code === 'board') {
        this.facets.selected = [];
      }
      this.facets.selected.push(value);
      if (this.facets.code === 'contentType') {
        this.facets.selectedValuesIndices.push(index);
      }
    }

  }

  async confirm() {
    await this.viewCtrl.dismiss();
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }
  toggleGroup(group) {
    if (this.isGroupShown(group)) {
      this.shownGroup = null;
    } else {
      this.shownGroup = group;
    }
  }
  isGroupShown(group) {
    return this.shownGroup === group;
  }

  getItems(ev: any) {
    this.filteredTopicArr = [];
    let val = ev.srcElement.value;
    if (val && val.trim() !== '') {
      val = val.toLowerCase();
      this.showTopicFilterList = true;
      for (let i = 0; i < this.topicsVal.length; i++) {
        let filtered = [];
        filtered = this.topicsVal[i].filter((item) => {
          return (item.name.toString().toLowerCase().match(val));
        });
        if (filtered.length > 0) {
          for (let j = 0; j < filtered.length; j++) {
            this.filteredTopicArr.push(filtered[j]);
          }
          filtered = [];
        }
      }
    } else {
      this.showTopicFilterList = false;
      this.filteredTopicArr = [];
    }
  }

  getSelectedOptionCount(facet) {
    if (facet.selected && facet.selected.length > 0) {
      this.pagetAssemblefilter[facet.code] = facet.selected;
      return `${facet.selected.length}`;
    }

    return '';
  }

  async cancel() {
    this.facets.selected = [...this.prevSelectedTopic];
    await this.viewCtrl.dismiss();
  }

  async apply() {
    this.prevSelectedTopic = [...this.facets.selected];
    await this.confirm();
  }

}
