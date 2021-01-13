import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AppHeaderService } from '@app/services';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { ObservationService } from '../observation.service';
import { Subscription } from 'rxjs';
import { RouterLinks } from '@app/app/app.constant';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityfilterComponent } from '../../shared/components/entityfilter/entityfilter.component';
import { UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';

@Component({
  selector: 'app-observation-detail',
  templateUrl: './observation-detail.component.html',
  styleUrls: ['./observation-detail.component.scss'],
})
export class ObservationDetailComponent implements OnInit {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
  };
  // programIndex: any;
  // solutionIndex: any;
  observationId: any;
  solutionId: any;
  programId: any;
  selectedSolution: any;
  submissionCount: any;
  solutionName: any;
  constructor(
    private location: Location,
    private headerService: AppHeaderService,
    private platform: Platform,
    private httpClient: HttpClient,
    private observationService: ObservationService,
    private router: Router,
    private popCtrl: PopoverController,
    private modalCtrl: ModalController,
    private routerParam: ActivatedRoute,
    private utils: UtilsService,
    private assessmentService: AssessmentApiService
  ) {
    this.routerParam.queryParams.subscribe((params) => {
      this.observationId = params.observationId;
      this.solutionId = params.solutionId;
      this.programId = params.programId;
      this.solutionName = params.solutionName;
    });
  }

  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  ngOnInit() {
    // this.programIndex = this.observationService.getProgramIndex();
    // this.solutionIndex = this.observationService.getSolutionIndex(); //
    // this.getLocalStorageData();
    this.getObservationEntities()
  }

  async getObservationEntities() {
    let payload = await this.utils.getProfileInfo();
    const config = {
      url:
        urlConstants.API_URLS.GET_OBSERVATION_ENTITIES +
        `${this.observationId}?solutionId=${this.solutionId}&programId=${this.programId}`,
      payload: payload,
    };
    this.assessmentService.post(config).subscribe(
      (success) => {
        console.log(success);
        this.selectedSolution = success.result;
      },
      (error) => {}
    );
    // this.httpClient.get('assets/dummy/programs.json').subscribe((data: any) => {
    //   console.log(data);
    //   let programList = data.result;
    //   this.selectedSolution = programList[this.programIndex].solutions[this.solutionIndex];
    //   this.checkForAnySubmissionsMade();
    // });

    /*  this.localStorage
       .getLocalStorage("programList")
       .then((data) => {
         this.programs = data;
         this.selectedSolution = data[this.programIndex].solutions[this.solutionIndex];
         this.checkForAnySubmissionsMade();
       })
       .catch((error) => {
       });
   } */
  }

  checkForAnySubmissionsMade() {
    const payload = {
      observationId: this.selectedSolution._id,
    };
    this.httpClient.post('assets/dummy/submissionCount.json', payload).subscribe((success: any) => {
      console.log(success);
      this.submissionCount = success.data.noOfSubmissions;
    });

    //   this.apiProviders.httpPost(
    //     AppConfigs.cro.observationSubmissionCount,
    //     payload,
    //     (success) => {
    //       this.submissionCount = success.data.noOfSubmissions;
    //     },
    //     (error) => {},
    //     { baseUrl: "dhiti" }
    //   );
    // }
  }

  goToObservationSubmission(entity) {
    let entityIndex = this.selectedSolution.entities.findIndex((e) => e._id == entity._id);
    if (
      this.selectedSolution.entities[entityIndex].submissions &&
      this.selectedSolution.entities[entityIndex].submissions.length
    ) {
      // this.observationService.setIndex(this.programIndex, this.solutionIndex, entityIndex);
      this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_SUBMISSION}`]);
    } /* else {
      let event = {
        programIndex: this.programIndex,
        solutionIndex: this.solutionIndex,
        entityIndex: entityIndex,
        submission: {
          submissionNumber: 1,
          observationId: this.selectedSolution._id,
        },
      };

      this.programService
        .getAssessmentDetailsForObservation(event, this.programs)
        .then(async (programs) => {
          this.utils.startLoader();
          await this.programService.refreshObservationList();
          await this.getLocalStorageData();
          this.utils.stopLoader();
          this.app.getRootNav().push(ProgramObservationSubmissionPage, { data });
        })
        .catch((err) => {});
    } */
  }

  async openEntityFilter() {
    const filterDialog = await this.modalCtrl.create({
      component: EntityfilterComponent,
      componentProps: {},
      // cssClass: 'sb-popover',
    });
    await filterDialog.present();
  }
}
