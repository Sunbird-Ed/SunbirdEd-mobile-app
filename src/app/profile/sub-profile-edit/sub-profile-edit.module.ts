import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { SubProfileEditPage } from './sub-profile-edit.page';
import { DirectivesModule } from '../../../directives/directives.module';
import { ComponentsModule } from '../../../app/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: SubProfileEditPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DirectivesModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule
  ],
  declarations: [SubProfileEditPage]
})
export class SubProfileEditPageModule {}
