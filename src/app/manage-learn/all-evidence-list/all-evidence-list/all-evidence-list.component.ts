import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoaderService, ToastService, UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { DhitiApiService } from '../../core/services/dhiti-api.service';

@Component({
  selector: 'app-all-evidence-list',
  templateUrl: './all-evidence-list.component.html',
  styleUrls: ['./all-evidence-list.component.scss'],
})
export class AllEvidenceListComponent implements OnInit {
  selectedTab;
  payload: any;
  remarks: any;
  images: any;
  videos: any;
  documents: any;
  audios: any;
  data: any;

  constructor(
    private routerParam: ActivatedRoute,
    private httpClient: HttpClient,
    private dhiti: DhitiApiService,
    private utils: UtilsService,
    private loader: LoaderService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.selectedTab = 'evidence';

    this.routerParam.queryParams.subscribe((params) => {
      const submissionId = params.submissionId;
      const observationId = params.observationId;
      const entityId = params.entityId;
      const questionExternalId = params.questionExternalId;
      const entityType = params.entityType;
      const surveyEvidence = params.surveyEvidence;
      const solutionId = params.solutionId;
      this.data = params.data;
      this.payload = {
        submissionId: submissionId,
        questionId: questionExternalId,
        observationId: observationId,
        entityId: entityId,
        entityType: entityType,
        solutionId: solutionId,
      };
      if (this.data) {
        this.setAllEvidence();
      } else {
        surveyEvidence ? this.getSurveyEvidence() : this.getAllEvidence();
      }
    });
  }

  ionViewDidLoad() {
    this.selectedTab = 'evidence';
  }

  onTabChange(tabName) {
    this.selectedTab = tabName;
  }

  setAllEvidence() {
    console.log(this.data);
    this.images = this.data.images;
    this.videos = this.data.videos;
    this.documents = this.data.documents;
    this.remarks = this.data.remarks;
    this.audios = this.data.audios;
  }
  async getAllEvidence() {
    let url = urlConstants.API_URLS.ALL_EVIDENCE;
    this.loader.startLoader();
    let payload = await this.utils.getProfileInfo();
    payload = { ...this.payload, ...payload };
    const config = {
      url: url,
      payload: payload,
    };
    this.dhiti.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();
        if (success.result === true && success.data) {
          this.images = success.data.images;
          this.videos = success.data.videos;
          this.documents = success.data.documents;
          this.remarks = success.data.remarks;
          this.audios = success.data.audios;
        } else {
          this.toast.openToast(success.data);
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

    //    if (success.result === true && success.data) {
    //       this.images = success.data.images;
    //       this.videos = success.data.videos;
    //       this.documents = success.data.documents;
    //       this.remarks = success.data.remarks;
    //       this.audios = success.data.audios;
    //     } else {
    //       this.utils.openToast(success.data);
    //     }
    //   },
    //   (error) => {
    //     this.utils.openToast(error.message);

    //     this.utils.stopLoader();
    //   },
    //   { baseUrl: 'dhiti', version: 'v1' }
    // );
  }

  //for surveyEvidence
  async getSurveyEvidence() {
    let url = urlConstants.API_URLS.SURVEY_FEEDBACK.LIST_ALL_EVIDENCES;
    this.loader.startLoader();
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
        if (success.result === true && success.data) {
          this.images = success.data.images;
          this.videos = success.data.videos;
          this.documents = success.data.documents;
          this.remarks = success.data.remarks;
          this.audios = success.data.audios;
        } else {
          this.toast.openToast(success.data);
        }
      },
      (error) => {
        this.toast.openToast(error.message);
        this.loader.stopLoader();
      }
    );

  }
}
