import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ComponentsModule } from '../../../app/components/components.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { GuestProfilePage } from './guest-profile.page';

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
