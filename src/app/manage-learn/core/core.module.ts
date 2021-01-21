import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateLocalSchoolDataService } from './services/update-local-school-data.service';
import { LocalStorageService } from './services';
import { UpdateTrackerService } from './services/update-tracker.service';
import { EvidenceService } from './services/evidence.service';
import { ProjectReportService } from './services/project-report.service';
import { ProgramService } from './services/program.service';
import { AssessmentApiService } from './services/assessment-api.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    UpdateLocalSchoolDataService, LocalStorageService, UpdateTrackerService, EvidenceService,ProjectReportService,
    ProgramService,AssessmentApiService       
  ],
})
export class CoreModule {}
