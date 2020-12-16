import { HttpClient } from '@angular/common/http'; //TODO:remove
import { Component, OnInit } from '@angular/core';

@Component({
  selector: "program-solution",
  templateUrl: "./program-solution.component.html",
  styleUrls: ["./program-solution.component.scss"],
})
export class ProgramSolutionComponent implements OnInit {
  programList: any;
  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.httpClient.get("assets/dummy/programs.json").subscribe((data: any) => {
      console.log(data)
      this.programList=data.result
    });
  }
}
