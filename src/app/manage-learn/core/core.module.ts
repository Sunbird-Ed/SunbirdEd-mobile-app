import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from './services/network.service';
import { SyncService } from './services/sync.service';
import { ApiService } from './services/api.service';
import { KendraApiService } from './services/kendra-api.service';
import { UnnatiDataService } from './services/unnati-data.service';
import { SunbirdService } from './services/sunbird.service';
import { UpdateLocalSchoolDataService } from './services/update-local-school-data.service';
import { LocalStorageService, UtilsService } from './services';
import { IonicStorageModule } from '@ionic/storage';
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
    NetworkService, SyncService, ApiService, KendraApiService, UnnatiDataService, SunbirdService,
    UpdateLocalSchoolDataService, LocalStorageService, UpdateTrackerService, EvidenceService,ProjectReportService,
    ProgramService, AssessmentApiService, DhitiApiService,
    DownloadAndPreviewService,SharingFeatureService
  ],
})
export class CoreModule {}
