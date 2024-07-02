import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { CommonUtilService } from '../../../services/common-util.service';
import { FilterValue } from '@project-sunbird/sunbird-sdk';

@Component({
  selector: 'app-explore-books-sort',
  templateUrl: './explore-books-sort.component.html',
  styleUrls: ['./explore-books-sort.component.scss'],
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
    this.boardList = this.navParams.get('boardList');
    this.mediumList = this.navParams.get('mediumList');
    this.sortForm = this.fb.group({
      board: [this.searchForm.value.board || []],
      medium: [this.searchForm.value.medium || []]
    });
  }

  async dismiss() {
    if ((this.sortForm.value.board !== this.searchForm.value.board) || (this.sortForm.value.medium !== this.searchForm.value.medium)) {
      await this.modalCtrl.dismiss({ values: this.sortForm.value });
    } else {
      await this.modalCtrl.dismiss(null);
    }
  }
}