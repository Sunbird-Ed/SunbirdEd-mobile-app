import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PlayerPage } from './player.page';
import { CanvasPlayerService } from '../../services/canvas-player.service';
import { SunbirdPdfPlayerModule } from '@project-sunbird/sunbird-pdf-player-v9';
import { SunbirdEpubPlayerModule } from '@project-sunbird/sunbird-epub-player-v9';
// TODO: Capacitor temp fix 
// import { QumlLibraryModule } from '@project-sunbird/sunbird-quml-player';





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
    // QumlLibraryModule, // TODO: Capacitor temp fix 
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PlayerPage],
  providers: [
    CanvasPlayerService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PlayerPageModule { }
