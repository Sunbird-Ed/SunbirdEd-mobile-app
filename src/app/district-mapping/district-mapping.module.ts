import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DistrictMappingPage } from './district-mapping.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonFormElementsModule } from 'common-form-elements';
import { LocationHandler } from '../../services/location-handler';
import {ProfileHandler} from '../../services/profile-handler';

const routes: Routes = [
  {
    path: '',
    component: DistrictMappingPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    PipesModule,
    CommonFormElementsModule

  ],
  declarations: [DistrictMappingPage],
  providers: [LocationHandler, ProfileHandler]
})
export class DistrictMappingPageModule {}
