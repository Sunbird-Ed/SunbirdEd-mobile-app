import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { IonFab, ModalController, Platform } from '@ionic/angular';
import { LoaderService, ToastService, UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
import { DhitiApiService } from '../../core/services/dhiti-api.service';
import { DownloadAndPreviewService } from '../../core/services/download-and-preview.service';
import { CriteriaListComponent } from '../../shared/components/criteria-list/criteria-list.component';
import { QuestionListComponent } from '../../shared/components/question-list/question-list.component';
import { File } from '@ionic-native/file/ngx';
import { AppHeaderService } from '@app/services';

@Component({
  selector: 'app-observation-reports',
  templateUrl: './observation-reports.component.html',
  styleUrls: ['./observation-reports.component.scss'],
})
export class ObservationReportsComponent implements OnInit {
  reportObj;
  submissionId;
  observationId;
  solutionId;
  entityId;
  error;
  payload;
  appFolderPath;
  isIos;
  fileName;
  action;
  entityType;
  immediateChildEntityType;
  reportType: string;
  allQuestions: Array<Object> = [];
  filteredQuestions: Array<any> = [];
  selectedTab: any;
  reportObjCriteria: any;
  allCriterias: any = [];
  filteredCriterias: any = [];
  // @ViewChild(FabContainer) fab: FabContainer //TODO:check fab action
  @ViewChild(IonFab, { static: false }) fab; //TODO check fab with this.
  from: any;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
  };
  constructor(
    private routerParam: ActivatedRoute,
    private headerService: AppHeaderService,
    private platform: Platform,
    private loader: LoaderService,
    private httpClient: HttpClient,
    private modal: ModalController,
    private utils: UtilsService,
    private assessmentService: AssessmentApiService,
    private dhiti: DhitiApiService,
    private router: Router,
    private androidPermissions: AndroidPermissions,
    private datepipe: DatePipe,
    private toast: ToastService,
    private fileTransfer: FileTransfer,
    private dap: DownloadAndPreviewService,
    private file: File
  ) {
    this.routerParam.queryParams.subscribe((params) => {
      this.submissionId = params.submissionId;
      this.observationId = params.observationId;
      this.solutionId = params.solutionId;
      this.entityId = params.entityId;
      this.entityType = params.entityType;
      this.from = params.from;
      this.immediateChildEntityType = params.immediateChildEntityType;
      this.reportType = params.reportType;
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
    this.selectedTab = 'questionwise';

    this.payload = {
      entityId: this.entityId,
      submissionId: this.submissionId,
      observationId: this.observationId,
      entityType: this.entityType,
    };
    this.isIos = this.platform.is('ios') ? true : false;
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + '/Download/'
      : cordova.file.externalRootDirectory + '/Download/';
    this.getObservationReports();
  }
  ionViewDidLoad() {
    //TODO:moved to contructor
    // this.selectedTab = 'questionwise';
    // this.submissionId = this.navParams.get('submissionId');
    // this.observationId = this.navParams.get('observationId');
    // this.solutionId = this.navParams.get('solutionId');
    // this.entityId = this.navParams.get('entityId');
    // this.entityType = this.navParams.get('entityType');
    // this.from = this.navParams.get('from');
    // this.immediateChildEntityType = this.navParams.get('immediateChildEntityType');
    // this.reportType = this.navParams.get('reportType');
    // this.selectedTab = 'questionwise';
    // this.payload = {
    //   entityId: this.entityId,
    //   submissionId: this.submissionId,
    //   observationId: this.observationId,
    //   entityType: this.entityType,
    // };
    // this.isIos = this.platform.is('ios') ? true : false;
    // this.appFolderPath = this.isIos
    //   ? cordova.file.documentsDirectory + '/Download/'
    //   : cordova.file.externalRootDirectory + '/Download/';
    // this.getObservationReports();
  }

  async getObservationReports(download = false) {
    //TODO:remove
    // this.loader.startLoader();
    // this.httpClient.get('assets/dummy/observationInstanceReport.json').subscribe((success: any) => {
    //   this.allQuestions = success.allQuestions && !this.allQuestions.length ? success.allQuestions : this.allQuestions;
    //   if (success) {
    //     this.reportObj = success;
    //   } else {
    //     this.error = 'No data found';
    //   }
    //   // this.loader.stopLoader();
    //   !this.filteredQuestions.length ? this.markAllQuestionSelected() : null;
    // });
    //TODO:till here

    let url;
    if (this.entityType && this.reportType) {
      this.payload = {
        entityId: this.entityId,
        entityType: this.entityType,
        solutionId: this.solutionId,
        immediateChildEntityType: this.immediateChildEntityType,
        reportType: this.reportType,
      };
      url = urlConstants.API_URLS.OBSERVATION_REPORTS.ENTITY_SOLUTION_REPORT;
    } else if (this.submissionId) {
      url = urlConstants.API_URLS.OBSERVATION_REPORTS.INSTANCE_REPORT;
    } else if (!this.submissionId && !this.entityId) {
      url = urlConstants.API_URLS.OBSERVATION_REPORTS.OBSERVATION_REPORT;
    } else {
      url = urlConstants.API_URLS.OBSERVATION_REPORTS.ENTITY_REPORT;
    }
    if (this.entityType && this.reportType) {
      url = 'v3' + url;
    } else {
      url = 'v2' + url;
    }

    this.payload.filter = {
      questionId: this.filteredQuestions,
    };
    // console.log(JSON.stringify(this.payload));
    let payload = await this.utils.getProfileInfo();
    payload = { ...payload, ...this.payload };

    const config = {
      url: url,
      payload: payload,
    };
    this.loader.startLoader();

    this.dhiti.post(config).subscribe(
      (success) => {
        //this will be initialized only on page load
        this.allQuestions =
          success.allQuestions && !this.allQuestions.length ? success.allQuestions : this.allQuestions;
        if (success) {
          this.reportObj = success;
        } else {
          this.error = 'No data found';
        }
        this.loader.stopLoader();
        !this.filteredQuestions.length ? this.markAllQuestionSelected() : null;
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
    //     this.allQuestions =
    //       success.allQuestions && !this.allQuestions.length
    //         ? success.allQuestions
    //         : this.allQuestions;
    //     if (success) {
    //       this.reportObj = success;
    //     } else {
    //       this.error = "No data found";
    //     }
    //     // this.utils.stopLoader()
    //     this.loader.stopLoader()
    //     !this.filteredQuestions.length ? this.markAllQuestionSelected() : null;
    //   },
    //   (error) => {
    //     this.error = "No data found";
    //     // this.utils.stopLoader();
    //     this.loader.stopLoader()
    //   },
    //   {
    //     baseUrl: "dhiti",
    //     version: this.entityType && this.reportType ? "v2" : "v1",
    //   }
    // );
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
  onTabChange(tabName) {
    this.fab ? this.fab.close() : null;
    this.selectedTab = tabName;
    !this.allCriterias.length ? this.getObservationCriteriaReports() : null;
  }

  async getObservationCriteriaReports() {
    this.loader.startLoader();
    let url;
    if (this.entityType && this.reportType) {
      this.payload = {
        entityId: this.entityId,
        entityType: this.entityType,
        solutionId: this.solutionId,
        immediateChildEntityType: this.immediateChildEntityType,
        reportType: this.reportType,
      };
      // url = AppConfigs.criteriaReports.entitySolutionReport;
    } else if (this.submissionId) {
      url = urlConstants.API_URLS.CRITERIA_REPORTS.INSTANCE_REPORT;
    } else if (!this.submissionId && !this.entityId) {
      url = urlConstants.API_URLS.CRITERIA_REPORTS.OBSERVATION_REPORT;
    } else {
      url = urlConstants.API_URLS.CRITERIA_REPORTS.ENTITY_REPORT;
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
    //     this.utils.stopLoader();
    //     !this.filteredCriterias.length ? this.markAllCriteriaSelected() : null;
    //   },
    //   (error) => {
    //     this.error = 'No data found';
    //     this.utils.stopLoader();
    //   },
    //   {
    //     baseUrl: 'dhiti',
    //     version: 'v1',
    //   }
    // );
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
        response.data &&
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
    // this.navCtrl.push(EvidenceAllListComponent, {
    //   submissionId: this.submissionId,
    //   observationId: this.observationId,
    //   entityId: this.entityId,
    //   questionExternalId: this.allQuestions[index]['questionExternalId'],
    //   entityType: this.entityType,
    // });
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
        ? urlConstants.API_URLS.OBSERVATION_REPORTS.GET_REPORTS_PDF_URLS
        : urlConstants.API_URLS.CRITERIA_REPORTS.GET_REPORTS_PDF_URLS;
    const timeStamp = '_' + this.datepipe.transform(new Date(), 'yyyy-MMM-dd-HH-mm-ss a');
    if (this.selectedTab == 'questionwise') {
      url = 'v2' + url;
    } else {
      url = 'v1' + url;
    }
    if (this.submissionId) {
      this.fileName = this.submissionId + timeStamp + '.pdf';
    } else if (!this.submissionId && !this.entityId) {
      this.fileName = this.observationId + timeStamp + '.pdf';
    } else {
      this.fileName = this.entityId + '_' + this.observationId + timeStamp + '.pdf';
    }
    let payload = await this.utils.getProfileInfo();
    payload = { ...this.payload, ...payload };
    const config = {
      url: url,
      payload: payload,
    };
    this.dhiti.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();
        console.log(JSON.stringify(success));
        if (success.status === 'success' && success.pdfUrl) {
          this.downloadSubmissionDoc(success.pdfUrl);
        } else {
          this.toast.openToast(success.message);
        }
      },
      (error) => {
        this.toast.openToast(error.message);

        this.loader.stopLoader();
      }
    );

    // this.apiService.httpPost(
    //   url,
    //   this.payload,
    //   (success) => {
    //     this.utils.stopLoader();
    //     console.log(JSON.stringify(success));
    //     if (success.status === "success" && success.pdfUrl) {
    //       this.downloadSubmissionDoc(success.pdfUrl);
    //     } else {
    //       this.utils.openToast(success.message);
    //     }
    //   },
    //   (error) => {
    //     this.utils.openToast(error.message);

    //     this.utils.stopLoader();
    //   },
    //   {
    //     baseUrl: "dhiti",
    //     version: this.selectedTab == "questionwise" ? "v2" : "v1",
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

  filedownload(fileRemoteUrl) {
    const fileTransfer: FileTransferObject = this.fileTransfer.create();
    fileTransfer
      .download(fileRemoteUrl, this.appFolderPath + this.fileName)
      .then((success) => {
        this.action === 'share'
          ? this.dap.shareSubmissionDoc(this.appFolderPath + this.fileName)
          : this.dap.previewSubmissionDoc(this.appFolderPath + this.fileName);
        this.loader.stopLoader();
      })
      .catch((error) => {
        this.loader.stopLoader();
      });
  }
}
