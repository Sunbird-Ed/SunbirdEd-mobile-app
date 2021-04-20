import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PlayerPage } from './player.page';
import { CanvasPlayerService } from '@app/services/canvas-player.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { SunbirdPdfPlayerModule } from '@project-sunbird/sunbird-pdf-player-v8';
import { SunbirdEpubPlayerModule } from '@project-sunbird/sunbird-epub-player-v8';
import { QumlLibraryModule } from '@project-sunbird/sunbird-quml-player-v8';




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
