import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DiscoverMentorsPage } from './discover-mentors.page';
import { ComponentsModule } from '../components/components.module';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from '../../directives/directives.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';


const routes: Routes = [
  {
    path: '',
    component: DiscoverMentorsPage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        PipesModule,
        DirectivesModule,
        ComponentsModule,
        CommonConsumptionModule
    ],
    declarations: [
        DiscoverMentorsPage
    ]
})
export class DiscoverMentorsPageModule {}
