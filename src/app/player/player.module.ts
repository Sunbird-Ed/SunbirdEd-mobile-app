import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PlayerPage } from './player.page';
import { CanvasPlayerService } from '../../services/canvas-player.service';




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
