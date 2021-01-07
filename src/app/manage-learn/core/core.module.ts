import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilsService } from './services/utils.service';
import { NetworkService } from './services/network.service';
import { SyncService } from './services/sync.service';
import { ApiService } from './services/api.service';
import { ApiInterceptor } from './interceptor/apiInterceptor';
import { KendraApiService } from './services/kendra-api.service';
import { UnnatiDataService } from './services/unnati-data.service';
import { SunbirdService } from './services/sunbird.service';
import { UpdateLocalSchoolDataService } from './services/update-local-school-data.service';
import { LocalStorageService } from './services';
import { IonicStorageModule } from '@ionic/storage';
import { UpdateTrackerService } from './services/update-tracker.service';
import { EvidenceService } from './services/evidence.service';
import { ProjectReportService } from './services/project-report.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    UtilsService, NetworkService, SyncService, ApiService, KendraApiService, UnnatiDataService, SunbirdService,
    ApiInterceptor, UpdateLocalSchoolDataService, LocalStorageService, UpdateTrackerService, EvidenceService,ProjectReportService        
  ],
})
export class CoreModule {}
