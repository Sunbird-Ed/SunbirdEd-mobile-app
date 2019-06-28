import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ResourcesComponent} from './resources.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components/components.module';
// import { PlayerPageModule } from '../player/player.module';
// import { DirectivesModule } from '@app/directives/directives.module';
// import { NotificationsPageModule } from '../notifications/notifications.module';

@NgModule({
  declarations: [
    ResourcesComponent
  ],
  imports: [
    CommonModule,
    IonicModule.forRoot({
      scrollPadding: false,
      scrollAssist: true,
      // autoFocusAssist: false
    }),
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: ResourcesComponent
      }
    ]),
    ComponentsModule,
    // PlayerPageModule,
    // DirectivesModule,
    // NotificationsPageModule
  ],
  exports: [
    ResourcesComponent
  ]
})
export class ResourcesModule { }
