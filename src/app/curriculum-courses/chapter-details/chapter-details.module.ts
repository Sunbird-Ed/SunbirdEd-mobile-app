import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChapterDetailsPage } from './chapter-details.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../app/components/components.module';
import { PipesModule } from '../../../pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: ChapterDetailsPage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CommonConsumptionModule,
        ComponentsModule,
        PipesModule,
        TranslateModule.forChild(),
        RouterModule.forChild(routes),
    ],
    declarations: [ChapterDetailsPage],
    providers: [DatePipe]
})
export class ChapterDetailsPageModule {}
