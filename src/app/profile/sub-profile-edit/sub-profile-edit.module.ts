import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { SubProfileEditPage } from './sub-profile-edit.page';
import { DirectivesModule } from '@app/directives/directives.module';

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
    TranslateModule
  ],
  declarations: [SubProfileEditPage]
})
export class SubProfileEditPageModule {}
