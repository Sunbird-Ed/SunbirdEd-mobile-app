import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { MentorsPage } from './mentors.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: MentorsPage
      }
    ])
  ],
  declarations: [MentorsPage]
})
export class MentorsPageModule {}
