import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { QuestionnairePage } from './questionnaire.page';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: QuestionnairePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    CoreModule,
    SharedModule
  ],
  declarations: [QuestionnairePage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class QuestionnairePageModule {}
