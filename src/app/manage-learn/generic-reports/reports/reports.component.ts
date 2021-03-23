import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService, ToastService } from '../../core';
import * as _ from 'lodash-es';
import { urlConstants } from '../../core/constants/urlConstants';
import { DhitiApiService } from '../../core/services/dhiti-api.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  state: { [k: string]: any };
  data: any;
  submissionId: any;
  constructor(
    private router: Router,
    private toast: ToastService,
    private loader: LoaderService,
    private dhiti: DhitiApiService
  ) {
    console.log(this.router.getCurrentNavigation().extras.state);
    this.state = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() {
    // remove null and undefined
    this.state = _.omitBy(this.state, _.isNil);
    this.getReport();
  }
  getReport() {
    this.loader.startLoader();
    let payload = this.state;
    const config = {
      url: urlConstants.API_URLS.GENERIC_REPORTS,
      payload: payload,
    };


    this.dhiti.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();
        if (success.result === true && success.reportSections) {
          this.data = success;
        } else {
          this.toast.openToast(success.message);
          this.data = success;
        }
      },
      (error) => {
        this.toast.openToast(error.message);
        this.loader.stopLoader();
      }
    );
  }

  instanceReport(e) {
    console.log('called instance');
    this.data.submissionId = this.submissionId;
    this.getReport();
  }
}
