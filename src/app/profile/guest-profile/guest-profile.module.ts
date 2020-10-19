import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { GuestProfilePage } from './guest-profile.page';
import { ComponentsModule } from '@app/app/components/components.module';
import { RouterLinks } from '@app/app/app.constant';
import {PipesModule} from '@app/pipes/pipes.module';

const routes: Routes = [
  {
    path: '', component: GuestProfilePage,
  },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule,
        ComponentsModule,
        PipesModule
    ],
  declarations: [GuestProfilePage]
})
export class GuestProfilePageModule { }
