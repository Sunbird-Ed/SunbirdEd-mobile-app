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

    // this.data = {
    //   result: true,
    //   programName: '',
    //   solutionName: '',
    //   filters: [
    //     {
    //       order: '',
    //       filter: {
    //         type: 'dropdown',
    //         title: '',
    //         keyToSend: 'submissionId',
    //         data: [
    //           {
    //             _id: '1',
    //             name: 'submission 1',
    //           },
    //         ],
    //       },
    //     },
    //   ],
    //   reportSections: [
    //     {
    //       order: 1,
    //       chart: {
    //         type: 'horizontalBar',
    //         title: '',
    //         submissionDateArray: ['26 September 2019', '26 September 2019', '26 September 2019'],
    //         data: {
    //           labels: [
    //             'Community Participation and EWS/DG Integration ',
    //             'Safety and Security',
    //             'Teaching and Learning',
    //           ],
    //           datasets: [
    //             {
    //               label: 'L1',
    //               data: [2, 2, 5],
    //             },
    //             {
    //               label: 'L2',
    //               data: [4, 3, 9],
    //             },
    //           ],
    //         },
    //       },
    //     },
    //     {
    //       order: 2,
    //       chart: {
    //         type: 'expansion',
    //         title: 'Descriptive view',
    //         heading: ['Assess. 1', 'Assess. 2'],
    //         domains: [
    //           {
    //             domainName: 'Community Participation and EWS/DG Integration',
    //             criterias: [
    //               {
    //                 criteriaName: 'Academic Integration',
    //                 levels: ['Level 4'],
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     },
    //   ],
    // };

    this.dhiti.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();
        if (success.result === true && success.reportSections) {
          this.data = success;
        } else {
          this.toast.openToast(success.message);
        }
      },
      (error) => {
        this.toast.openToast(error.message);
        this.loader.stopLoader();
      }
    );
  }

  instanceReport() {
    console.log('called instance')
    this.data.submissionId = this.submissionId
    this.getReport()
  }
}
