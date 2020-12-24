import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyHomeComponent } from './survey-home/survey-home.component';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  {
    path: '',
    component: SurveyHomeComponent,
  },
 
];

@NgModule({
  declarations: [SurveyHomeComponent],
  imports: [CommonModule, TranslateModule.forChild(), IonicModule, RouterModule.forChild(routes)],
})
export class SurveyModule {}
