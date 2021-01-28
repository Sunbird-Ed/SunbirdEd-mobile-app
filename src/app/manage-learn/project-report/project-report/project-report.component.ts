import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AlertController, IonSelect, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../core';
import { ProjectReportService } from '../../core/services/project-report.service';
import { FilterModalComponent } from '../../shared/components/filter-modal/filter-modal.component';
import { urlConstants } from '../../core/constants/urlConstants';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
@Component({
  selector: 'app-project-report',
  templateUrl: './project-report.component.html',
  styleUrls: ['./project-report.component.scss'],
})
export class ProjectReportComponent implements OnInit {
  reportData: any;
  showFilter: boolean = false;
  filterType: { label: string; value: number }[];
  filter = { type: 1, entity: undefined, program: undefined };
  @ViewChild('mySelect', { static: false }) selectRef: IonSelect;
  texts: any;
  constructor(
    private translate: TranslateService,
    private httpClient: HttpClient,
    private utils: UtilsService,
    public alertController: AlertController,
    private router: Router,
    private reportSrvc: ProjectReportService,
    public modalController: ModalController,
    public unnatiService: UnnatiDataService
  ) {
    this.translate
      .get([
        'FRMELEMENTS_LBL_SELECT_ENTITY',
        'FRMELEMNTS_MSG_SELECT_ENTITY_TO_SELECT_PROGRAM',
        'FRMELEMNTS_MSG_NO_DATA_AVAILABLE',
        'FRMELEMNTS_MSG_NO_DATA_AVAILABLE_FOR_ENTITY_OR_PROGRAM',
        'FRMELEMNTS_LBL_OK',
      ])
      .subscribe((data) => {
        this.texts = data;
      });
  }

  projectsArr = [
    {
      name: 'Total Projects',
      img: '../../assets/imgs/reports-page/Note 1.svg',
      key: 'total',
    },
    {
      name: 'Projects Completed',
      img: '../../assets/imgs/reports-page/note.svg',
      key: 'completed',
    },
    {
      name: 'Projects In Progress',
      img: '../../assets/imgs/reports-page/Note 4.svg',
      key: 'inProgress',
    },
    {
      name: 'Projects Overdue',
      img: '../../assets/imgs/reports-page/Note 3.svg',
      key: 'overdue',
    },
  ];
  ionViewWillEnter() {
    this.getReports();
    this.loadFilterType();
  }

  ngOnInit() {}

  loadFilterType() {
    //TODO:remove
    // this.httpClient.get('assets/dummy/reportTypes.json').subscribe(
    //   (res: any) => {
    //     if (res.result) {
    //       this.filterType = res.result;
    //     }
    //   },
    //   (err) => {
    //     this.filterType = [];
    //   }
    // );
    //TODO:Till here
    const config = {
      url: urlConstants.API_URLS.GET_REPORT_TYPES,
    };
    this.unnatiService.get(config).subscribe(
      (res) => {
        if (res.result) {
          this.filterType = res.result;
        }
      },
      (err) => {
        this.filterType = [];
      }
    );
  }

  async getReports(preFilter?) {
    const entityId = this.filter.entity ? this.filter.entity._id : null;
    let url;
    if (entityId) {
      url = urlConstants.API_URLS.GET_REPORT + entityId; // to get entity report
    } else {
      url = urlConstants.API_URLS.GET_REPORT; // overall report
    }
    const query = {
      reportType: this.filter.type,
      programId: this.filter.program ? this.filter.program._id : null,
    };
    url = this.utils.queryUrl(url, query);
    let payload = await this.utils.getProfileInfo();
    if (payload) {
      const config = {
        url: url,
        payload: payload,
      };
      this.unnatiService.post(config).subscribe(
        (data) => {
          if (data.result && !data.result.dataAvailable) {
            this.presentAlert(
              this.texts['FRMELEMNTS_MSG_NO_DATA_AVAILABLE'],
              this.texts['FRMELEMNTS_MSG_NO_DATA_AVAILABLE_FOR_ENTITY_OR_PROGRAM']
            );
            preFilter ? (this.filter = JSON.parse(preFilter)) : null;
            if (this.reportData) {
              return;
            }
          }
          this.reportData = data.result ? data.result.data : {};
          this.reportData.tasks.series = this.generateCircleData(this.reportData.tasks, 80);
          this.reportData.categories.series = this.generateCircleData(this.reportData.categories, 50);
        },
        (err) => {}
      );
    } else {
    }
  }

  generateCircleData(obj, innerRadius) {
    let data = [];
    for (const key in obj) {
      if (key == 'total') {
        continue;
      }
      let x = {};
      x['name'] = this.utils.cameltoNormalCase(key);
      x['value'] = ((obj[key] / obj.total) * 100).toFixed(1) + '%';
      x['y'] = obj[key];
      x['z'] = 0;
      if (key == 'completed') {
        x['color'] = 'green';
      }

      if (key == 'notStarted') {
        x['color'] = '#B80000  ';
      }

      data.push(x);
    }
    let series = [
      {
        minPointSize: 100 - innerRadius,
        innerSize: innerRadius + '%',
        zMin: 0,
        showInLegend: true,
        data: data,
      },
    ];
    return series;
  }
  ionViewDidLeave() {
    this.filter = { type: 1, entity: null, program: null };
  }
  reportTypeChange() {
    this.getReports();
  }

  async presentAlert(heading, msg) {
    const alert = await this.alertController.create({
      header: heading,
      message: msg,
      buttons: [this.texts['FRMELEMNTS_LBL_OK']],
    });

    await alert.present();
  }

  viewFullReport() {
    // this.reportSrvc.filterForReport = this.filter;
    // this.router.navigate([RouterLinks.PROJECT_FULL_REPORT]);
    this.router.navigate([RouterLinks.PROJECT_FULL_REPORT], {
      state: this.filter,
    });
  }

  fileName() {
    let arr = ['report'];
    this.filter.program ? arr.push(this.filter.program.name) : null;
    return arr;
  }

  downloadUrl() {
    let url = urlConstants.API_URLS.GET_REPORT;
    if (this.filter.entity) {
      url = url + this.filter.entity._id;
    }

    let query = {
      requestPdf: true,
      reportType: this.filter.type,
      programId: this.filter.program ? this.filter.program._id : null,
    };

    url = this.utils.queryUrl(url, query);

    return url;
  }

  async openFilterModal(type) {
    console.log(type, "type");
    console.log(this.filter.entity, "this.filter.entity");
    // if (type == 'program' && this.filter.entity == undefined) {
    //   this.presentAlert(
    //     this.texts['FRMELEMENTS_LBL_SELECT_ENTITY'],
    //     this.texts['FRMELEMNTS_MSG_SELECT_ENTITY_TO_SELECT_PROGRAM']
    //   );
    //   return;
    // }
    let preFilter = JSON.stringify(this.filter);

    const modal = await this.modalController.create({
      component: FilterModalComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        type: type,
        entityId: this.filter.entity ? this.filter.entity._id : null,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    type == 'entity' ? (this.filter.entity = data) : (this.filter.program = data);
    JSON.stringify(this.filter) !== preFilter ? this.getReports(preFilter) : null;
  }
}
