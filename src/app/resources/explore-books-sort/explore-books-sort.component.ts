import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { CommonUtilService } from '../../../services/common-util.service';
import { FilterValue } from '@project-sunbird/sunbird-sdk';

@Component({
    selector: 'app-explore-books-sort',
    templateUrl: './explore-books-sort.component.html',
    styleUrls: ['./explore-books-sort.component.scss'],
    standalone: false
})
export class ExploreBooksSortComponent {
  @ViewChild('boardSelect', { static: false }) boardSelect;
  @ViewChild('mediumSelect', { static: false }) mediumSelect;

  categories;
  backButtonFunc = undefined;
  sortForm: FormGroup;
  searchForm: FormGroup;
  boardList: Array<FilterValue>;
  mediumList: Array<FilterValue>;
  facetFilterList: any;
  group: any = {};
  boardOptions = {
    title: this.commonUtilService.translateMessage('BOARD_OPTION_TEXT'),
    cssClass: 'select-box'
  };
  mediumOptions = {
    title: this.commonUtilService.translateMessage('MEDIUM_OPTION_TEXT'),
    cssClass: 'select-box'
  };

  constructor(
      private navParams: NavParams,
      private commonUtilService: CommonUtilService,
      private fb: FormBuilder,
      private modalCtrl: ModalController
  ) {
    this.initForm();
  }


  initForm() {
    this.searchForm = this.navParams.get('searchForm');
    this.facetFilterList = this.navParams.get('facetFilterList');
    this.facetFilterList.forEach((ele: any, index) => {
      this.group[ele.code] = new FormControl(this.searchForm.value[ele.code] || []);
      });
      this.sortForm = new FormGroup(this.group);
  }

  async dismiss() {
    this.facetFilterList.forEach(async (e) => {
      if (this.searchForm.value[e.code] !== this.sortForm.value[e.code]) {
        await this.modalCtrl.dismiss({ values: this.sortForm.value });
      }
    })
    
    await this.modalCtrl.dismiss(null);
  }
}