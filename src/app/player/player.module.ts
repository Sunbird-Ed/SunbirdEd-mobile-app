import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PlayerPage } from './player.page';
import { CanvasPlayerService } from '../../services/canvas-player.service';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { SunbirdPdfPlayerModule } from '@project-sunbird/sunbird-pdf-player-v9';
import { SunbirdEpubPlayerModule } from '@project-sunbird/sunbird-epub-player-v9';
import { QumlLibraryModule } from '@project-sunbird/sunbird-quml-player';





const routes: Routes = [
  {
    path: '',
    component: PlayerPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SunbirdPdfPlayerModule,
    SunbirdEpubPlayerModule,
    QumlLibraryModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PlayerPage],
  providers: [
    CanvasPlayerService,
    ScreenOrientation,
  ]
})
export class PlayerPageModule { }
