import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { NavParams, PopoverController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import {
  Environment, InteractSubtype, InteractType, PageId
} from '../../../services/telemetry-constants';

@Component({
  selector: 'app-filteroption',
  templateUrl: './filteroption.component.html',
  styleUrls: ['./filteroption.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilteroptionComponent implements OnDestroy {

  facets: any;
  backButtonFunc: Subscription;
  source: string;

  constructor(
    private navParams: NavParams,
    private popCtrl: PopoverController,
    private platform: Platform,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    this.facets = this.navParams.get('facet');
    this.source = this.navParams.get('source');
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, async () => {
      await this.popCtrl.dismiss();
    });
  }

  ngOnDestroy() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  async confirm() {
    const values = new Map();
    values['option'] = this.facets.name;
    const appliedFilter = [];
    this.facets.values.map((element) => {
      if (element.apply) {
        appliedFilter.push(element.name);
      }
    });
    values['selectedFilter'] = appliedFilter;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.APPLY_FILTER_CLICKED,
      Environment.HOME,
      (this.source && this.source.match('courses')) ? PageId.COURSE_SEARCH_FILTER : PageId.LIBRARY_SEARCH_FILTER,
      undefined,
      values);
      await this.popCtrl.dismiss({ isFilterApplied: true });
  }
}
