import { Component } from '@angular/core';
import { DsepService } from '../../services/dsep.service';
// import { SearchResponse } from './path-to-dsep-service.models'; // Adjust the path

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class DiscoverTutorsPage {
  tutors: any[] = [];

  constructor(private dsepService: DsepService) {}

  searchTutors(query: string) {
    // Implement your search logic here
    // this.dsepService.searchTutors({ query }).subscribe((response: SearchResponse) => {
    //   this.tutors = response.tutors;
    // });
  }
}

