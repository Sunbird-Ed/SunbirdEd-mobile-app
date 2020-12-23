import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilsService } from './services/utils.service';
import { UpdateLocalSchoolDataService } from './services/update-local-school-data.service';
import { LocalStorageService } from './services';
import { IonicStorageModule } from '@ionic/storage';
import { UpdateTrackerService } from './services/update-tracker.service';
import { EvidenceService } from './services/evidence.service';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [UtilsService, UpdateLocalSchoolDataService, LocalStorageService, UpdateTrackerService, EvidenceService],
})
export class CoreModule {}
