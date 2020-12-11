import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-solution-listing',
  templateUrl: './solution-listing.component.html',
  styleUrls: ['./solution-listing.component.scss'],
})
export class SolutionListingComponent implements OnInit {
  programId: any;
  result = [
    {
      name: "Aadhyaan Assesment SSIP Program",
      description: "Course Completed",
      image: "",
      id: '111'
    },
    {
      name: "Improvement project demo Program",
      description: "Assesment Completed",
      image: "",
      id: '222'
    },
    {
      name: "Africa Test  Program",
      description: "Assesment",
      image: "",
      id: '333'
    }
  ]
  constructor(private activatedRoute: ActivatedRoute,
    private location: Location) { 
    activatedRoute.params.subscribe((param) => {
     this.programId = param.id;
    });

  }

  ngOnInit() {}

  selectedSolution(data){

  }

  goBack() {
    this.location.back();
  }

}
