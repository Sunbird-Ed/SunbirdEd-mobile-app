import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLinks } from '@app/app/app.constant';
import { AppGlobalService, AppHeaderService } from '@app/services';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { ObservationService } from '../observation.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-observation-home',
  templateUrl: './observation-home.component.html',
  styleUrls: ['./observation-home.component.scss'],
})
export class ObservationHomeComponent implements OnInit {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
  };
  programList: any;
  constructor(
    private httpClient: HttpClient,
    private location: Location,
    private headerService: AppHeaderService,
    private platform: Platform,
    private router: Router,
    private observationService: ObservationService,
  ) {}

  ngOnInit() {
    this.httpClient.get('assets/dummy/programs.json').subscribe((data: any) => {
      console.log(data);
      this.programList = data.result;
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


  observationDetails(programIndex, solutionIndex) {
    this.observationService.setIndex(programIndex, solutionIndex);
    this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_DETAILS}`]);
    /*  this.navCtrl.push(ProgramSolutionObservationDetailPage, {
      programIndex: this.programIndex,
      solutionIndex: this.solutionIndex,
    }); */
  }
}
