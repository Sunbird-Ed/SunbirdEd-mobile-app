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

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    UtilsService, NetworkService, SyncService, ApiService, KendraApiService, UnnatiDataService, SunbirdService,
    ApiInterceptor
  ],
})
export class CoreModule { }
