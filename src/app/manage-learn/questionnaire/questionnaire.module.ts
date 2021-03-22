import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { QuestionnairePage } from './questionnaire.page';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatrixModalComponent } from './matrix-modal/matrix-modal.component';
import { QuestionMapModalComponent } from './question-map-modal/question-map-modal.component';

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
    SharedModule,
    TranslateModule
  ],
  declarations: [QuestionnairePage, MatrixModalComponent, QuestionMapModalComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [MatrixModalComponent, QuestionMapModalComponent]
})
export class QuestionnairePageModule { }
