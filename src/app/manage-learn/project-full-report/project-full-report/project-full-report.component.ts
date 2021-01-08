import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts/highcharts-gantt';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { LoaderService, UtilsService } from '../../core';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { ProjectReportService } from '../../core/services/project-report.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-project-full-report',
  templateUrl: './project-full-report.component.html',
  styleUrls: ['./project-full-report.component.scss'],
})
export class ProjectFullReportComponent implements OnInit {
  reports: {
    title: { text: string };
    series: { name: string; data: { name: string; id: string; color: string; start: number; end: number }[] }[];
    xAxis: { min: number; max: number };
  }[];
  showCharts: boolean;
  highcharts = Highcharts;
  idvalue = 'container';
  filter: any;

  constructor(
    private loader: LoaderService,
    public unnatiSrvc: UnnatiDataService,
    public screenOrientation: ScreenOrientation,
    public reportService: ProjectReportService,
    public utils: UtilsService,
    public httpClient: HttpClient
  ) {}

  ngOnInit() {
    this.filter = this.reportService.filterForReport;
    try {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    } catch (error) {}

    this.loadFullData();
  }

  loadFullData() {
    this.loader.startLoader();

    //TODO:remove
    this.httpClient.get('assets/dummy/projectFullReport.json').subscribe(
      (data: any) => {
        this.loader.stopLoader();
        if (data.result) {
          this.reports = data.result;
          if (this.reports.length > 0) {
            setTimeout(() => {
              this.showCharts = true;
              this.setUpChart(this.reports[0]);
            }, 1000);
          }
        }
      },
      (error) => {
        this.loader.stopLoader();
      }
    );
    //TODO:Till here

    // this.loader.startLoader();

    // let url = urlConstants.API_URLS.GET_FULL_REPORT;
    // if (this.filter.entity) {
    //   url = urlConstants.API_URLS.GET_FULL_REPORT + this.filter.entity._id;
    // }
    // const query = {
    //   programId: this.filter.program ? this.filter.program._id : null,
    //   reportType: this.filter.type,
    // };

    // url = this.utils.queryUrl(url, query);
    // const config = {
    //   url: url,
    // };

    // this.unnatiSrvc.get(config).subscribe(
    //   (data) => {
    //     this.loader.stopLoader();
    //     if (data.result) {
    //       this.reports = data.result;
    //       if (this.reports.length > 0) {
    //         setTimeout(() => {
    //           this.showCharts = true;
    //           this.setUpChart(this.reports[0]);
    //         }, 1000);
    //       }
    //     }
    //   },
    //   (error) => {
    //     this.loader.stopLoader();
    //   }
    // );
  }

  public setUpChart(data) {
    for (let i = 0; i < this.reports.length; i++) {
      let minDate = new Date(this.reports[i].xAxis.min);
      let maxDate = new Date(this.reports[i].xAxis.max);
      let sdate = minDate.getDate();
      let smonth = minDate.getMonth() + 1;
      let syear = minDate.getFullYear();
      let edate = maxDate.getDate();
      let emonth = maxDate.getMonth() + 1;
      let eyear = maxDate.getFullYear();
      let minDate1 = Date.UTC(syear, smonth, sdate);
      let maxDate1 = Date.UTC(eyear, emonth, edate);
      Highcharts.ganttChart('container' + i, {
        title: {
          text: '',
        },
        xAxis: {
          min: minDate1,
          max: maxDate1,
        },
        legend: {
          enabled: false,
        },
        credits: {
          enabled: false,
        },
        series: [
          {
            type: 'gantt',
            data: this.reports[i].series[0].data,
          },
        ],
      });
    }
  }

  fileName() {
    return 'file-name';
    // let arr = ['report'];
    // this.filter.program ? arr.push(this.filter.program.name) : null;
    // return arr;
  }

  downloadUrl() {
    return 'String -xyc';
    // TODO:remove
    // let url = urlConstants.API_URLS.GET_FULL_REPORT;
    // if (this.filter.entity) {
    //   url = url + this.filter.entity._id;
    // }

    // let query = {
    //   reportType: this.filter.type,
    //   programId: this.filter.program ? this.filter.program._id : null,
    //   requestPdf: true,
    // };

    // url = this.utils.queryUrl(url, query);

    // return url;
  }

  ngOnDestroy() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }
}
