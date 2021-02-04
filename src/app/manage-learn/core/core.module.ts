import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateLocalSchoolDataService } from './services/update-local-school-data.service';
import { LocalStorageService } from './services';
import { UpdateTrackerService } from './services/update-tracker.service';
import { EvidenceService } from './services/evidence.service';
import { ProjectReportService } from './services/project-report.service';
import { ProgramService } from './services/program.service';
import { AssessmentApiService } from './services/assessment-api.service';
import { DhitiApiService } from './services/dhiti-api.service';
import { DownloadAndPreviewService } from './services/download-and-preview.service';
import { SharingFeatureService } from './services/sharing-feature.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    UpdateLocalSchoolDataService, LocalStorageService, UpdateTrackerService, EvidenceService,ProjectReportService,
    ProgramService, AssessmentApiService, DhitiApiService,
    DownloadAndPreviewService,SharingFeatureService,
  ],
})
export class CoreModule {}
