import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GuestEditPage } from './guest-edit.page';
import { TranslateModule } from '@ngx-translate/core';
import {PipesModule} from '../../../pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: GuestEditPage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule,
        PipesModule
    ],
  declarations: [GuestEditPage]
})
export class GuestEditPageModule {}
