import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { NotificationPage } from './notification.page';
import { ComponentsModule } from '../components/components.module';
import { SbNotificationModule } from '@project-sunbird/sb-notification';

const routes: Routes = [
  {
    path: '',
    component: NotificationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    SbNotificationModule
  ],
  declarations: [NotificationPage]
})
export class NotificationPageModule {}
