import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { KendraApiService } from '../../core/services/kendra-api.service';
import { urlConstants } from '../../core/constants/urlConstants';
import { UtilsService } from '../../core';
import { LoaderService } from '../../core';

@Component({
  selector: 'app-solution-listing',
  templateUrl: './solution-listing.component.html',
  styleUrls: ['./solution-listing.component.scss'],
})
export class SolutionListingComponent implements OnInit {
  programId: any;
  solutions = [];
  description;
  count = 0;
  limit = 25;
  page = 1;

  constructor(private activatedRoute: ActivatedRoute,
    private utils: UtilsService,
    private kendraService: KendraApiService,
    private loader: LoaderService,
    private location: Location) {
    activatedRoute.params.subscribe((param) => {
      this.programId = param.id;
      this.getSolutions();
    });

  }

  ngOnInit() { }

  selectedSolution(data) {

  }
  async getSolutions() {
    this.loader.startLoader();
    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.SOLUTIONS_LISTING + this.programId + '?page=' + this.page + '&limit=' + this.limit + '&search=',
      payload: payload
    }
    this.kendraService.post(config).subscribe(success => {
      this.loader.stopLoader();
      if (success.result.data) {
        this.solutions = this.solutions.concat(success.result.data);
        this.count = success.result.count;
        this.description = success.result.description;
      }
    }, error => {
      this.loader.stopLoader();
      this.solutions = [];
    })
  }
  goBack() {
    this.location.back();
  }
  loadMore() {
    this.page = this.page + 1;
    this.getSolutions();
  }
}
