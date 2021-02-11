import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmissionPreviewPageComponent } from './submission-preview-page/submission-preview-page.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';


const routes: Routes = [
  {
    path: '',
    component: SubmissionPreviewPageComponent
  }
];

@NgModule({
  declarations: [SubmissionPreviewPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    CoreModule,
    SharedModule,
    TranslateModule
  ]
})
export class SubmissionPreviewModule { }
