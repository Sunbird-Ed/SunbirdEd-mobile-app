import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService, ToastService } from '../../core';
import * as _ from 'lodash-es';
import { urlConstants } from '../../core/constants/urlConstants';
import { DhitiApiService } from '../../core/services/dhiti-api.service';
import { ModalController } from '@ionic/angular';
import { ReportModalFilter } from '../../shared/components/report-modal-filter/report.modal.filter';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  state: { [k: string]: any };
  data: any;
  error: { result: boolean; message: string };
  submissionId: any;
  action;
  filters: any;
  segmentValue: string;
  filteredData: any;
  modalFilterData: any;
  reportSections: any;
  constructor(
    private router: Router,
    private toast: ToastService,
    private loader: LoaderService,
    private dhiti: DhitiApiService,
    private modal: ModalController
  ) {
    console.log(this.router.getCurrentNavigation().extras.state);
    this.state = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() {
    this.segmentValue = 'questionwise';
    this.state['pdf'] = false;
    this.getReport();
  }
  getReport() {
    // remove null and undefined
    this.state = _.omitBy(this.state, _.isNil);
    this.error = null;
    this.loader.startLoader();
    const config = {
      url: urlConstants.API_URLS.GENERIC_REPORTS,
      payload: this.state,
    };

    this.dhiti.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();
        if (success.result === true && success.reportSections) {
          this.data = success;
          this.reportSections = this.filterBySegment();

          if (this.data.filters && !this.filters) {
            this.filters = this.data.filters;
          }
        } else {
          this.toast.openToast(success.message);
          this.error = success;
          this.reportSections = [];
        }
      },
      (error) => {
        this.toast.openToast(error.message);
        this.loader.stopLoader();
        this.reportSections = [];
        this.error = error;
      }
    );
  }

  instanceReport(e) {
    this.state.submissionId = this.submissionId;
    this.getReport();
  }

  config() {
    let payload = Object.assign({}, this.state, { pdf: true }); // will not change state obj
    const config = {
      url: urlConstants.API_URLS.GENERIC_REPORTS,
      payload: payload,
    };

    return config;
  }

  segmentChanged(segment) {
    segment === 'criteriawise' ? (this.state.criteriaWise = true) : (this.state.criteriaWise = false);
    this.state.filter = null;
    this.modalFilterData = null;
    this.getReport();
  }

  filterBySegment() {
    if (this.segmentValue == 'questionwise') {
      let reportSections = [{ questionArray: this.data.reportSections }];
      return reportSections;
    }

    return this.data.reportSections;
  }

  async openFilter(data, keyToSend) {
    this.modalFilterData ? null : (this.modalFilterData = data);
    let filteredData;
    if (this.state.filter && this.state.filter.length) {
      filteredData = this.state.filter[keyToSend];
    } else {
      filteredData = data.map((d) => d._id);
    }
    const modal = await this.modal.create({
      component: ReportModalFilter,
      componentProps: {
        data: this.modalFilterData,
        filteredData: JSON.parse(JSON.stringify(filteredData)),
      },
    });
    await modal.present();
    await modal.onDidDismiss().then((response: any) => {
      if (
        response.data &&
        response.data.action === 'updated' &&
        JSON.stringify(response.data.filter) !== JSON.stringify(filteredData)
      ) {
        this.state.filter = {};
        this.state.filter[keyToSend] = response.data.filter;
        this.getReport();
      }
    });
  }
}
