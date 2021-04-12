import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SbSearchFilterModule } from '@project-sunbird/search-filter-widget';

import { IonicModule } from '@ionic/angular';

const routes: Routes = [];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        SbSearchFilterModule
    ],
})
export class SearchFilterPageModule {}
