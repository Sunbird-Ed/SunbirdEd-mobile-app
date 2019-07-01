import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewMoreActivityComponent } from './view-more-activity.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  declarations: [
    ViewMoreActivityComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    IonicModule.forRoot({
      scrollPadding: false,
      scrollAssist: true,
      // autoFocusAssist: false
    }),
    // IonicPageModule.forChild(ViewMoreActivityComponent),
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: ViewMoreActivityComponent
      }
    ]),
  ],
  exports: [
    ViewMoreActivityComponent
  ]
})
export class ViewMoreActivityModule { }
