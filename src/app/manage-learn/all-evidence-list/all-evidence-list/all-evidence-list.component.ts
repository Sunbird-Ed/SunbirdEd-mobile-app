import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private routerParam: ActivatedRoute, private httpClient: HttpClient) {}

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
    //TODO:move to ngOninit
    // const submissionId = this.navParams.get('submissionId');
    // const observationId = this.navParams.get('observationId');
    // const entityId = this.navParams.get('entityId');
    // const questionExternalId = this.navParams.get('questionExternalId');
    // const entityType = this.navParams.get('entityType');
    // const surveyEvidence = this.navParams.get('surveyEvidence'); // for survey evidence true/false
    // const solutionId = this.navParams.get('solutionId');
    // this.data = this.navParams.get('data');
    // this.payload = {
    //   submissionId: submissionId,
    //   questionId: questionExternalId,
    //   observationId: observationId,
    //   entityId: entityId,
    //   entityType: entityType,
    //   solutionId: solutionId,
    // };
    // if (this.data) {
    //   this.setAllEvidence();
    // } else {
    //   surveyEvidence ? this.getSurveyEvidence() : this.getAllEvidence();
    // }
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
  getAllEvidence() {
    //TODO:remove
    this.httpClient.get('assets/dummy/allEvidenceList.json').subscribe((success: any) => {
      if (success.result === true && success.data) {
        this.images = success.data.images;
        this.videos = success.data.videos;
        this.documents = success.data.documents;
        this.remarks = success.data.remarks;
        this.audios = success.data.audios;
      } else {
        // this.utils.openToast(success.data);
      }
    });
    //TODO:till here
    // let url = AppConfigs.observationReports.allEvidence;
    // this.utils.startLoader();

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
  getSurveyEvidence() {
    //TODO:uncomment
    //   const url = AppConfigs.surveyFeedback.listAllEvidences;
    //   this.utils.startLoader();
    //   this.apiService.httpPost(
    //     url,
    //     this.payload,
    //     (success) => {
    //       this.utils.stopLoader();
    //       console.log(JSON.stringify(success));
    //       if (success.result === true && success.data) {
    //         this.images = success.data.images;
    //         this.videos = success.data.videos;
    //         this.documents = success.data.documents;
    //         this.remarks = success.data.remarks;
    //         this.audios = success.data.audios;
    //       } else {
    //         this.utils.openToast(success.data);
    //       }
    //     },
    //     (error) => {
    //       this.utils.openToast(error.message);
    //       this.utils.stopLoader();
    //     },
    //     { baseUrl: 'dhiti', version: 'v1' }
    //   );
  }
}
