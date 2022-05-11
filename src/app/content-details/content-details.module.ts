import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from '@app/pipes/pipes.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../components/components.module';
import { ContentDetailsPage } from './content-details.page';
import { SunbirdVideoPlayerModule } from '@project-sunbird/sunbird-video-player-v9';

const routes: Routes = [
  {
    path: '',
    component: ContentDetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    PipesModule,
    SunbirdVideoPlayerModule
  ],
  declarations: [ContentDetailsPage]
})
export class ContentDetailsPageModule {}
