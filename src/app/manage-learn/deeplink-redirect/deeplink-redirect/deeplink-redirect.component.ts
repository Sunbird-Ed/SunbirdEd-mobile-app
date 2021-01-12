import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { NavController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-deeplink-redirect',
  templateUrl: './deeplink-redirect.component.html',
  styleUrls: ['./deeplink-redirect.component.scss'],
})
export class DeeplinkRedirectComponent implements OnInit {
  data: any;
  translateObject: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    // public deeplinkProvider: DeeplinkProvider,
    // public programSrvc: ProgramServiceProvider,
    // public viewCtrl: ViewController,
    // public utils: UtilsProvider,
    private translate: TranslateService,
    private router: Router
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeepLinkRedirectPage');
    this.data = this.navParams.data;
    let key = Object.keys(this.data)[0];
    this.switch(key);
  }
  ngOnInit() {
    this.translate.get(['message.canNotOpenLink']).subscribe((translations) => {
      this.translateObject = translations;
    });
  }

  switch(key) {
    switch (key) {
      case 'observationLink':
        this.redirectObservation(this.data[key]);
        break;
      case 'observationParams':
        this.redirectWithParams(this.data[key], 'observation');
        break;
      case 'assessmentParams':
        this.redirectWithParams(this.data[key], 'assessment');
        break;
      case 'observationReportParams':
        this.redirectReportWithParams(this.data[key], 'observation');
        break;
      case 'assessmentReportParams':
        this.redirectReportWithParams(this.data[key], 'assessment');
        break;

      default:
        break;
    }
  }

  redirectWithParams(params: string, type) {
    let paramsArr = params.split('-');
    console.log(paramsArr);
    let pId = paramsArr[0];
    let sId = paramsArr[1];
    let eId = paramsArr[2];
    // TODO:Implement
    // this.programSrvc
    //   .getProgramApi(true)
    //   .then((data: any) => {
    //     console.log(data);
    //     const pIndex = data.findIndex((p) => p._id == pId);
    //     let sIndex;

    //     let page;
    //     if (type == "observation") {
    //       page = ProgramSolutionObservationDetailPage;
    //       const solution = data[pIndex].solutions;
    //       sIndex = solution.findIndex((s) => s.solutionId == sId);
    //     } else {
    //       page = ProgramSolutionEntityPage;
    //       const solution = data[pIndex].solutions;
    //       sIndex = solution.findIndex((s) => s._id == sId);
    //     }
    //     this.navCtrl
    //       .push(page, {
    //         programIndex: pIndex,
    //         solutionIndex: sIndex,
    //       })
    //       .then(() => {
    //         this.navCtrl.remove(1, 1);
    //       });
    //   })
    //   .catch(() => {
    //     this.utils.openToast(this.translateObject["message.canNotOpenLink"]);
    //     this.navCtrl.popToRoot();
    //   });
  }

  redirectObservation(link) {
    let pId, sId, oId;
    //TODO:Implement
    // this.deeplinkProvider
    //   .createObsFromLink(link)
    //   .then((res: any) => {
    //     if (!res.result) {
    //       throw "";
    //     }
    //     res = res.result;
    //     pId = res.programId;
    //     sId = res.solutionId;
    //     oId = res._id;
    //     return this.programSrvc.getProgramApi(true);
    //   })
    //   .then((data: any) => {
    //     console.log(data);
    //     const pIndex = data.findIndex((p) => p._id == pId);
    //     const solution = data[pIndex].solutions;
    //     const sIndex = solution.findIndex((s) => s.solutionId == sId);
    //     this.navCtrl
    //       .push(ProgramSolutionObservationDetailPage, {
    //         programIndex: pIndex,
    //         solutionIndex: sIndex,
    //       })
    //       .then(() => {
    //         this.navCtrl.remove(1, 1);
    //       });
    //   })
    //   .catch(() => {
    //     this.utils.openToast(this.translateObject["message.canNotOpenLink"]);
    //     this.navCtrl.popToRoot();
    //   });
  }

  redirectReportWithParams(params: string, type) {
    let paramsArr = params.split('-');
    console.log(paramsArr);
    let pId = paramsArr[0];
    let sId = paramsArr[1];
    let eId = paramsArr[2];
    let etype = paramsArr[3];
    let oId = paramsArr[4];

    if (type == 'observation') {
      let payload = {
        entityId: eId,
        entityType: etype,
        observationId: oId,
      };
      setTimeout(() => {
        // will go call entity report
        this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
          queryParams: {
            entityId: eId,
            entityType: etype,
            observationId: oId,
          },
        });
        // this.navCtrl
        //   .push(ObservationReportsPage, payload)
        //   .then(() => {
        //     this.navCtrl.remove(1, 1);
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
      }, 1000);
    }

    if (type == 'assessment') {
      let payload = {
        programId: pId,
        entity: {
          _id: eId,
          entityType: etype,
        },
        entityType: etype,
        solutionId: sId,
      };
      // TODO:assessment not there yet
      // setTimeout(() => {
      //   this.navCtrl
      //     .push(DashboardPage, payload)
      //     .then(() => {
      //       this.navCtrl.remove(1, 1);
      //     })
      //     .catch((err) => {
      //       console.log(err);
      //     });
      // }, 1000);
    }
  }
}
