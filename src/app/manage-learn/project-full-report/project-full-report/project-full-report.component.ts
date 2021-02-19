import { Component, OnInit } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { LoaderService, UtilsService } from '../../core';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { ProjectReportService } from '../../core/services/project-report.service';
import { HttpClient } from '@angular/common/http';
import { urlConstants } from '../../core/constants/urlConstants';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-project-full-report',
  templateUrl: './project-full-report.component.html',
  styleUrls: ['./project-full-report.component.scss'],
})
export class ProjectFullReportComponent implements OnInit {
  // reports: {
  //   title: { text: string };
  //   series: { name: string; data: { name: string; id: string; color: string; start: number; end: number }[] }[];
  //   xAxis: { min: number; max: number };
  // }[];
  reports: any;
  showCharts: boolean;
  idvalue = 'container';
  filter: any;
  barChartPlugins: any;

  constructor(
    private loader: LoaderService,
    public unnatiSrvc: UnnatiDataService,
    public screenOrientation: ScreenOrientation,
    public reportService: ProjectReportService,
    public utils: UtilsService,
    public httpClient: HttpClient,
    private router: Router
  ) {
    this.filter = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() {
    // this.filter = this.reportService.filterForReport;
    try {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    } catch (error) {}

    this.loadFullData();
  }

  async loadFullData() {
    this.loader.startLoader();

    let payload = await this.utils.getProfileInfo();

    let url = urlConstants.API_URLS.GET_FULL_REPORT;
    if (this.filter.entity) {
      url = urlConstants.API_URLS.GET_FULL_REPORT + this.filter.entity._id;
    }
    const query = {
      programId: this.filter.program ? this.filter.program._id : null,
      reportType: this.filter.type,
    };

    url = this.utils.queryUrl(url, query);
    const config = {
      url: url,
      payload: payload,
    };
    this.unnatiSrvc.post(config).subscribe(
      (data: any) => {
        this.loader.stopLoader();
        if (data.result) {
          this.reports = data.result;
          if (this.reports.length > 0) {
            // setTimeout(() => {
            //   this.showCharts = true;
            //   this.setUpChart(this.reports[0]);
            // }, 1000);
            this.reports.map((data) => {
              this.createChart(data);
            });
          }
        }
      },
      (error) => {
        this.loader.stopLoader();
      }
    );
  }

  MS_PER_DAY = 1000 * 60 * 60 * 24;

  data;

  chartData;
  options;
  plantingDays;

  lables = [];

  graph = [];

  createChart(data) {
    this.lables = data.labels;
    this.data = data.taskArr;
    this.chartData = {
      labels: this.lables,
      datasets: data.datasets,
    };

    this.options = {
      maintainAspectRatio: false,
      title: {
        display: true,
        text: data.title,
      },
      legend: { display: false },
      tooltips: {
        mode: 'index',
        callbacks: {
          label: (tooltipItem, d) => {
            let x = this.reports.filter((d) => {
              return d.taskArr[tooltipItem.index].title == tooltipItem.label;
            })[0];
            this.data = x.taskArr;
            this.plantingDays = x.leastStartDate;
            let label = d.datasets[tooltipItem.datasetIndex].label || '';
            const date = new Date(this.plantingDays);
            if (tooltipItem.datasetIndex === 0) {
              const diff = this.dateDiffInDays(date, new Date(this.data[tooltipItem.index].startDate));
              date.setDate(diff + 1);
              label += 'Start Date: ' + this.getDate(date);
            } else if (tooltipItem.datasetIndex === 1) {
              const diff = this.dateDiffInDays(date, new Date(this.data[tooltipItem.index].endDate));
              date.setDate(diff + 1);
              label += 'End Date: ' + this.getDate(date);
            }
            return label;
          },
        },
      },
      scales: {
        xAxes: [
          {
            stacked: true,
            ticks: {
              callback: (value, index, values) => {
                console.log(data.leastStartDate);

                const date = new Date(data.leastStartDate);
                date.setDate(value);
                return this.getDate(date);
              },
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
          },
        ],
      },
      plugins: {
        datalabels: {
          formatter: () => {
            return null;
          },
        },
      },
    };
    this.barChartPlugins = [
      {
        beforeUpdate: function (c) {
          var chartHeight = c.chart.height;
          var size = (chartHeight * 5) / 100;
          c.scales['y-axis-0'].options.ticks.minor.fontSize = size;
        },
      },
    ];

    let d = {
      chartData: this.chartData,
      options: this.options,
      labels: this.lables,
    };
    this.graph.push(d);
  }

  getDate(date) {
    return (
      date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).substr(-2) + '-' + ('0' + date.getDate()).substr(-2)
    );
  }

  dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / this.MS_PER_DAY);
  }

  fileName() {
    let arr = ['report'];
    this.filter.program ? arr.push(this.filter.program.name) : null;
    return arr;
  }

  downloadUrl() {
    let url = urlConstants.API_URLS.GET_FULL_REPORT;
    if (this.filter.entity) {
      url = url + this.filter.entity._id;
    }

    let query = {
      reportType: this.filter.type,
      programId: this.filter.program ? this.filter.program._id : null,
      requestPdf: true,
    };

    url = this.utils.queryUrl(url, query);

    return url;
  }

  ngOnDestroy() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }
}
