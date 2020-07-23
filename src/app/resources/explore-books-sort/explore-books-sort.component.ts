import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavParams, Platform, ModalController } from '@ionic/angular';
import { CommonUtilService } from '@app/services/common-util.service';
import { FilterValue } from 'sunbird-sdk';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';

@Component({
  selector: 'app-explore-books-sort',
  templateUrl: './explore-books-sort.component.html',
  styleUrls: ['./explore-books-sort.component.scss'],
})
export class ExploreBooksSortComponent implements OnInit {
  @ViewChild('boardSelect') boardSelect;
  @ViewChild('mediumSelect') mediumSelect;

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
      private platform: Platform,
      private commonUtilService: CommonUtilService,
      private telemetryGeneratorService: TelemetryGeneratorService,
      private fb: FormBuilder,
      private modalCtrl: ModalController
  ) {
    this.initForm();
  }

  ngOnInit() {}

  initForm() {
    this.searchForm = this.navParams.get('searchForm');
    this.boardList = this.navParams.get('boardList');
    this.mediumList = this.navParams.get('mediumList');
    this.sortForm = this.fb.group({
      board: [this.searchForm.value.board || []],
      medium: [this.searchForm.value.medium || []]
    });
  }

  dismiss() {
    if ((this.sortForm.value.board !== this.searchForm.value.board) || (this.sortForm.value.medium !== this.searchForm.value.medium)) {
      this.modalCtrl.dismiss({ values: this.sortForm.value });
    } else {
      this.modalCtrl.dismiss(null);
    }
  }
}