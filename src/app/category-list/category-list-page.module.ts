import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {CategoryListPage} from './category-list-page';
import {CommonConsumptionModule} from '@project-sunbird/common-consumption';
import {TranslateModule} from '@ngx-translate/core';
import {ComponentsModule} from '../../app/components/components.module';
import {CommonFormElementsModule, SbSearchFilterModule} from 'common-form-elements';
import {PipesModule} from '../../pipes/pipes.module';
import {SearchFilterPage} from '../../app/search-filter/search-filter.page';

const routes: Routes = [
    {
        path: '',
        component: CategoryListPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CommonConsumptionModule,
        TranslateModule,
        ComponentsModule,
        CommonFormElementsModule,
        PipesModule,
        ReactiveFormsModule,
        SbSearchFilterModule
    ],
    declarations: [CategoryListPage, SearchFilterPage]
})
export class CategoryListPageModule {
}
