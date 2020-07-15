import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DirectivesModule } from '@app/directives/directives.module';
import { PipesModule } from '@app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../components/components.module';

import { AddUserToClassPage } from './add-user-to-class.page';

const routes: Routes = [
  {
    path: '',
    component: AddUserToClassPage
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
    DirectivesModule,
    ComponentsModule
  ],
  declarations: [AddUserToClassPage]
})
export class AddUserToClassPageSModule {}
