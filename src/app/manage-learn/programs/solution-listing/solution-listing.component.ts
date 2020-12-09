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
  programDetails = [
    {
      title: "Aadhyaan Assesment SSIP Program",
      Description: "Course Completed",
      image: "",
      id: '111'
    },
    {
      title: "Improvement project demo Program",
      Description: "Assesment Completed",
      image: "",
      id: '222'
    },
    {
      title: "Africa Test  Program",
      Description: "Assesment",
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

  selectedProgram(data){

  }

  goBack() {
    this.location.back();
  }

}
