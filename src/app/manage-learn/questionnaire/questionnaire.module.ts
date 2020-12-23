import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { QuestionnairePage } from './questionnaire.page';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { RemarksModalComponent } from './remarks-modal/remarks-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatrixModalComponent } from './matrix-modal/matrix-modal.component';

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
  declarations: [QuestionnairePage, RemarksModalComponent, MatrixModalComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [RemarksModalComponent, MatrixModalComponent]
})
export class QuestionnairePageModule { }
