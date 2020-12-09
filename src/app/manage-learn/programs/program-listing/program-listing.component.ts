import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterLinks } from '@app/app/app.constant';

@Component({
  selector: 'app-program-listing',
  templateUrl: './program-listing.component.html',
  styleUrls: ['./program-listing.component.scss'],
})
export class ProgramListingComponent implements OnInit {

  programListDetails = [
    {
      title: "Aadhyaan Assesment SSIP Program",
      Description: " 4 Resources",
      image: "",
      id: '111'
    },
    {
      title: "Improvement project demo Program",
      Description: "10 Resources",
      image: "",
      id: '222'
    },
    {
      title: "Africa Test  Program",
      Description: "6 Resources",
      image: "",
      id: '333'
    }
  ]

  constructor(private router: Router, private location:Location) { }

  ngOnInit() {}


  selectedProgram(data){
    this.router.navigate([`/${RouterLinks.PROGRAM}/${RouterLinks.SOLUTIONS}`, data.id]);
  }

  handleNavBackButton(){
    this.location.back();
  }

}
