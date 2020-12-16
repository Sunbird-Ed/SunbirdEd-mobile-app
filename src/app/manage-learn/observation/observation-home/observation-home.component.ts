import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: "app-observation-home",
  templateUrl: "./observation-home.component.html",
  styleUrls: ["./observation-home.component.scss"],
})
export class ObservationHomeComponent implements OnInit {
  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
  this.httpClient.get("assets/dummy/programs.json").subscribe((data) => {
    console.log(data);
    
    
  });
  }
}
