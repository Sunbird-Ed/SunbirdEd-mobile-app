import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilsService } from './services/utils.service';
import { UpdateLocalSchoolDataService } from './services/update-local-school-data.service';
import { LocalStorageService } from './services';
import { IonicStorageModule } from '@ionic/storage';

@NgModule({
  declarations: [],
  imports: [CommonModule, IonicStorageModule.forRoot({'name': '__mydb', 'driverOrder': ['websql', 'indexeddb', 'sqlite']})],
  providers: [UtilsService, UpdateLocalSchoolDataService, LocalStorageService],
})
export class CoreModule {}
