import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';

@Component({
  selector: 'app-imp-suggestions',
  templateUrl: './imp-suggestions.page.html',
  styleUrls: ['./imp-suggestions.page.scss'],
})
export class ImpSuggestionsPage implements OnInit {

  criterias;

  constructor(private router: Router) {
    this.criterias = this.router.getCurrentNavigation().extras.state.data;
    console.log(this.criterias)
  }

  ngOnInit() {
  }

  goToTemplateDetails(id) {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
      queryParams: {
        // projectId: id,
        // programId: project.programId,
        // solutionId: project.solutionId,
        // type: selectedFilter
        viewOnlyMode: true,
        templateId: id
      }
    });
  }

}
