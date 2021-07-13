import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ObservationRoutingModule } from "./observation-routing.module";
import { ObservationHomeComponent } from "./observation-home/observation-home.component";
import { SharedModule } from "../shared/shared.module";
import { ObservationDetailComponent } from "./observation-detail/observation-detail.component";
import { TranslateModule } from "@ngx-translate/core";
import { IonicModule } from "@ionic/angular";
import { ObservationService } from "./observation.service";
import { ObservationSubmissionComponent } from "./observation-submission/observation-submission.component";
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [ObservationHomeComponent, ObservationDetailComponent, ObservationSubmissionComponent],
  imports: [
    CommonModule,
    CoreModule,
    ObservationRoutingModule,
    // HttpClientModule, // TODO:Tremove after api integration
    TranslateModule.forChild(),
    SharedModule,
    IonicModule,
    FormsModule,
  ]
})
export class ObservationModule {}