import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { NavController, NavParams, Platform, ModalController, IonFab } from '@ionic/angular';
import { LoaderService, ToastService, UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { DhitiApiService } from '../../core/services/dhiti-api.service';
import { File } from '@ionic-native/file/ngx';
import { QuestionListComponent } from '../../shared/components/question-list/question-list.component';
import { CriteriaListComponent } from '../../shared/components/criteria-list/criteria-list.component';
import { DownloadAndPreviewService } from '../../core/services/download-and-preview.service';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';

@Component({
  selector: 'app-report-with-score',
  templateUrl: './report-with-score.component.html',
  styleUrls: ['./report-with-score.component.scss'],
})
export class ReportWithScoreComponent implements OnInit {
  reportObj;
  submissionId;
  observationId;
  entityId;
  error;
  payload;
  appFolderPath;
  isIos;
  fileName;
  action;
  solutionId: string;
  entityType: string;
  reportType: string;
  allQuestions: Array<Object> = [];
  filteredQuestions: Array<any> = [];
  selectedTab: string;
  filteredCriterias: any = [];
  allCriterias: any = [];
  reportObjCriteria: any;
  // @ViewChild(FabContainer) fab: FabContainer;
  @ViewChild(IonFab, { static: false }) fab;
  from: any;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
  };
  constructor(
    private routerParam: ActivatedRoute,
    public navCtrl: NavController,
    private dap: DownloadAndPreviewService,
    // public navParams: NavParams,
    private platform: Platform,
    private fileTransfer: FileTransfer,
    private utils: UtilsService,
    private androidPermissions: AndroidPermissions,
    private datepipe: DatePipe,
    // private apiService: ApiProvider,
    private file: File,
    private modal: ModalController,
    private loader: LoaderService,
    private toast: ToastService,
    private dhiti: DhitiApiService,
    private router: Router,
    private headerService: AppHeaderService
  ) {
    this.routerParam.queryParams.subscribe((params) => {
      this.selectedTab = 'questionwise';
      this.submissionId = params.submissionId;
      this.observationId = params.observationId;
      this.entityId = params.entityId;
      this.solutionId = params.solutionId;
      this.entityType = params.entityType;
      this.reportType = params.reportType;
      this.from = params.from;
    });
  }
  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  ngOnInit() {
    this.payload = {
      entityId: this.entityId,
      submissionId: this.submissionId,
      observationId: this.observationId,
    };
    this.isIos = this.platform.is('ios') ? true : false;
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + '/Download/'
      : cordova.file.externalRootDirectory + '/Download/';

    this.getObservationReports();
  }

  async getObservationReports(download = false) {
    this.loader.startLoader();
    let url;

    if (this.solutionId) {
      this.payload.solutionId = this.solutionId;
      this.payload.entityType = this.entityType;
      this.payload.reportType = this.reportType;
      url = urlConstants.API_URLS.OBSERVATION_REPORTS_WITH_SCORE.SOLUTION_REPORT;
    } else if (this.submissionId) {
      // view submission report
      url = urlConstants.API_URLS.OBSERVATION_REPORTS_WITH_SCORE.INSTANCE_REPORT;
    } else if (this.observationId && this.entityId) {
      // view entity report
      this.payload.entityType = this.entityType;
      url = urlConstants.API_URLS.OBSERVATION_REPORTS_WITH_SCORE.ENTITY_REPORT;
    } else {
      this.payload.entityType = this.entityType;
      url = urlConstants.API_URLS.OBSERVATION_REPORTS_WITH_SCORE.OBSERVATION_REPORT;
    }
    this.payload.filter = {
      questionId: this.filteredQuestions,
    };
    let payload = await this.utils.getProfileInfo();
    payload = { ...payload, ...this.payload };
    if (this.observationId && this.entityId) {
      url = 'v3' + url; 

    } else {
      url = 'v2' + url;
    }

    const config = {
      url: url,
      payload: payload,
    };

    this.dhiti.post(config).subscribe(
      (success) => {
        console.log(JSON.stringify(success));
        this.allQuestions =
          success.allQuestions && !this.allQuestions.length ? success.allQuestions : this.allQuestions;
        if (success) {
          this.error = !success.result ? success.message : null;
          this.reportObj = success;
        } else {
          this.error = 'No data found';
          this.toast.openToast(this.error);
        }
        this.loader.stopLoader();
        !this.filteredQuestions.length ? this.markAllQuestionSelected() : null;
      },
      (error) => {
        this.error = 'No data found';
        this.toast.openToast(error.message);
        this.loader.stopLoader();
      }
    );

    // this.apiService.httpPost(
    //   url,
    //   this.payload,
    //   (success) => {
    //     console.log(JSON.stringify(success));
    //     this.allQuestions =
    //       success.allQuestions && !this.allQuestions.length ? success.allQuestions : this.allQuestions;
    //     if (success) {
    //       this.error = !success.result ? success.message : null;
    //       this.reportObj = success;
    //     } else {
    //       this.error = 'No data found';
    //       this.toast.openToast(this.error);
    //     }
    //     this.loader.stopLoader();
    //     !this.filteredQuestions.length ? this.markAllQuestionSelected() : null;
    //   },
    //   (error) => {
    //     this.error = 'No data found';
    //     this.toast.openToast(error.message);
    //     this.loader.stopLoader();
    //   },
    //   {
    //     baseUrl: 'dhiti',
    //     version: this.observationId && this.entityId ? 'v2' : 'v1',
    //   }
    // );
  }

  async getObservationCriteriaReports() {
    this.loader.startLoader();
    let url;

    if (this.entityType && this.reportType) {
      this.payload.solutionId = this.solutionId;
      this.payload.entityType = this.entityType;
      this.payload.reportType = this.reportType;
    } else if (this.submissionId) {
      url = urlConstants.API_URLS.CRITERIA_REPORTS_WITH_SCORE.INSTANCE_REPORT;
    } else if (!this.submissionId && !this.entityId) {
      this.payload.entityType = this.entityType;

      url = urlConstants.API_URLS.CRITERIA_REPORTS_WITH_SCORE.OBSERVATION_REPORT;
    } else {
      url = urlConstants.API_URLS.CRITERIA_REPORTS_WITH_SCORE.ENTITY_REPORT;
    }

    this.payload.filter = {
      criteria: this.filteredCriterias,
    };
    let payload = await this.utils.getProfileInfo();
    payload = { ...payload, ...this.payload };

    const config = {
      url: url,
      payload: payload,
    };

    this.dhiti.post(config).subscribe(
      (success) => {
        //this will be initialized only on page load
        this.allCriterias =
          success.allCriterias && !this.allCriterias.length ? success.allCriterias : this.allCriterias;
        if (success) {
          this.reportObjCriteria = success;
        } else {
          this.error = 'No data found';
        }

        this.loader.stopLoader();
        !this.filteredCriterias.length ? this.markAllCriteriaSelected() : null;
      },
      (error) => {
        this.error = 'No data found';
        this.loader.stopLoader();
      }
    );

    // this.apiService.httpPost(
    //   url,
    //   this.payload,
    //   (success) => {
    //     //this will be initialized only on page load
    //     this.allCriterias =
    //       success.allCriterias && !this.allCriterias.length ? success.allCriterias : this.allCriterias;
    //     if (success) {
    //       this.reportObjCriteria = success;
    //     } else {
    //       this.error = 'No data found';
    //     }

    //     this.loader.stopLoader();
    //     !this.filteredCriterias.length ? this.markAllCriteriaSelected() : null;
    //   },
    //   (error) => {
    //     this.error = 'No data found';
    //     this.loader.stopLoader();
    //   },
    //   {
    //     baseUrl: 'dhiti',
    //     version: 'v1',
    //   }
    // );
  }

  downloadSharePdf(action) {
    this.action = action;
    this.androidPermissions
      .checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
      .then((status) => {
        if (status.hasPermission) {
          this.getObservationReportUrl();
        } else {
          this.androidPermissions
            .requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
            .then((success) => {
              if (success.hasPermission) {
                this.getObservationReportUrl();
              }
            })
            .catch((error) => {});
        }
      });
  }

  async getObservationReportUrl() {
    this.loader.startLoader();
    let url =
      this.selectedTab == 'questionwise'
        ? urlConstants.API_URLS.OBSERVATION_REPORTS_WITH_SCORE.GET_REPORTS_PDF_URLS
        : urlConstants.API_URLS.CRITERIA_REPORTS_WITH_SCORE.GET_REPORTS_PDF_URLS;
    const timeStamp = '_' + this.datepipe.transform(new Date(), 'yyyy-MMM-dd-HH-mm-ss a');
    if (this.solutionId) {
      this.fileName = this.solutionId + timeStamp + '.pdf';
    } else if (this.submissionId) {
      this.fileName = this.submissionId + timeStamp + '.pdf';
    } else if (this.observationId && this.entityId) {
      this.fileName = this.observationId + `_${this.entityId}_` + timeStamp + '.pdf';
    } else if (this.observationId) {
      this.fileName = this.observationId + timeStamp + '.pdf';
    }

    let payload = await this.utils.getProfileInfo();
    payload = { ...payload, ...this.payload };

    if (this.selectedTab == 'criteriawise') {
      url = 'v1' + url;
    } else if (this.observationId && this.entityId) {
      url = 'v2' + url;
    } else {
      url = 'v1' + url;
    }

    const config = {
      url: url,
      payload: payload,
    };

    this.dhiti.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();
        if (success.status === 'success' && success.pdfUrl) {
          this.downloadSubmissionDoc(success.pdfUrl);
        } else {
          this.toast.openToast(success.message);
        }
        this.loader.stopLoader();
      },
      (error) => {
        this.error = 'No data found';
        this.loader.stopLoader();
      }
    );

    // this.apiService.httpPost(
    //   url,
    //   this.payload,
    //   (success) => {
    //     this.loader.stopLoader();
    //     if (success.status === 'success' && success.pdfUrl) {
    //       this.downloadSubmissionDoc(success.pdfUrl);
    //     } else {
    //       this.toast.openToast(success.message);
    //     }
    //     this.loader.stopLoader();
    //   },
    //   (error) => {
    //     this.error = 'No data found';
    //     this.loader.stopLoader();
    //   },
    //   {
    //     baseUrl: 'dhiti',
    //     version: this.selectedTab == 'criteriawise' ? 'v1' : this.observationId && this.entityId ? 'v2' : 'v1',
    //   }
    // );
  }
  downloadSubmissionDoc(fileRemoteUrl) {
    this.loader.startLoader();
    if (this.isIos) {
      this.checkForDowloadDirectory(fileRemoteUrl);
    } else {
      this.filedownload(fileRemoteUrl);
    }
  }

  filedownload(fileRemoteUrl) {
    const fileTransfer: FileTransferObject = this.fileTransfer.create();
    fileTransfer
      .download(fileRemoteUrl, this.appFolderPath + this.fileName)
      .then((success) => {
        this.action === 'share'
          ? this.dap.shareSubmissionDoc(this.appFolderPath + this.fileName)
          : this.dap.previewSubmissionDoc(this.appFolderPath + this.fileName);
      })
      .catch((error) => {});
  }

  checkForDowloadDirectory(fileRemoteUrl) {
    this.file
      .checkDir(this.file.documentsDirectory, 'Download')
      .then((success) => {
        this.filedownload(fileRemoteUrl);
      })
      .catch((err) => {
        this.file.createDir(cordova.file.documentsDirectory, 'Download', false).then(
          (success) => {
            this.filedownload(fileRemoteUrl);
          },
          (error) => {}
        );
      });
  }

  markAllQuestionSelected() {
    for (const question of this.allQuestions) {
      this.filteredQuestions.push(question['questionExternalId']);
    }
  }

  markAllCriteriaSelected() {
    for (const criteria of this.allCriterias) {
      this.filteredCriterias.push(criteria['criteriaId']);
    }
  }

  async openFilter() {
    const modal = await this.modal.create({
      component: QuestionListComponent,
      componentProps: {
        allQuestions: this.allQuestions,
        filteredQuestions: JSON.parse(JSON.stringify(this.filteredQuestions)),
      },
    });
    await modal.present();
    await modal.onDidDismiss().then((response: any) => {
      if (
        response.data &&
        response.data.action === 'updated' &&
        JSON.stringify(response.data.filter) !== JSON.stringify(this.filteredQuestions)
      ) {
        this.filteredQuestions = response.data.filter;
        this.getObservationReports();
      }
    });
  }

  async openCriteriaFilter() {
    const modal = await this.modal.create({
      component: CriteriaListComponent,
      componentProps: {
        allCriterias: this.allCriterias,
        filteredCriterias: JSON.parse(JSON.stringify(this.filteredCriterias)),
      },
    });
    await modal.present();
    await modal.onDidDismiss().then((response: any) => {
      if (
        response &&
        response.data.action === 'updated' &&
        JSON.stringify(response.data.filter) !== JSON.stringify(this.filteredCriterias)
      ) {
        this.filteredCriterias = response.data.filter;
        this.getObservationCriteriaReports();
      }
    });
  }

  allEvidence(index) {
    console.log(this.allQuestions[index]);

    this.router.navigate([RouterLinks.ALL_EVIDENCE], {
      queryParams: {
        submissionId: this.submissionId,
        observationId: this.observationId,
        entityId: this.entityId,
        questionExternalId: this.allQuestions[index]['questionExternalId'],
        entityType: this.entityType,
      },
    });
    //TODO:uncomment
    // this.navCtrl.push(EvidenceAllListComponent, {
    //   submissionId: this.submissionId,
    //   observationId: this.observationId,
    //   entityId: this.entityId,
    //   questionExternalId: this.allQuestions[index]["questionExternalId"],
    //   entityType: this.entityType,
    // });
  }

  onTabChange(tabName) {
    this.fab.close();
    this.selectedTab = tabName;
    !this.allCriterias.length ? this.getObservationCriteriaReports() : null;
  }
}
