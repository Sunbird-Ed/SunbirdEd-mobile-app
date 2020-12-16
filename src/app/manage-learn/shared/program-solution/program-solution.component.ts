import { HttpClient } from '@angular/common/http'; //TODO:remove
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';

@Component({
  selector: "program-solution",
  templateUrl: "./program-solution.component.html",
  styleUrls: ["./program-solution.component.scss"],
})
export class ProgramSolutionComponent implements OnInit {
  programList: any;
  constructor(private httpClient: HttpClient, private router: Router) {}

  ngOnInit() {
    this.httpClient.get("assets/dummy/programs.json").subscribe((data: any) => {
      console.log(data);
      this.programList = data.result;
    });
  }

  redirectOnSoluctionClick(solution, programIndex, solutionIndex) {
    switch (solution.type) {
      case "observation":
        this.goToProgSolObservationDetails(programIndex, solutionIndex);
        break;

      default:
        break;
    }
  }

  goToProgSolObservationDetails(programIndex, solutionIndex) {
    let navParams = {
      programIndex,solutionIndex
    }
    this.router.navigate([RouterLinks.OBSERVATION_DETAILS]);
   /*  this.navCtrl.push(ProgramSolutionObservationDetailPage, {
      programIndex: this.programIndex,
      solutionIndex: this.solutionIndex,
    }); */
  }
}
