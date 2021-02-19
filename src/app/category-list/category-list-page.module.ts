import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {CategoryListPage} from './category-list-page';
import {CommonConsumptionModule} from '@project-sunbird/common-consumption-v8';
import {TranslateModule} from '@ngx-translate/core';
import {ComponentsModule} from '@app/app/components/components.module';
import {CommonFormElementsModule} from 'common-form-elements-v8';
import {PipesModule} from '@app/pipes/pipes.module';
import {SearchFilterPage} from '@app/app/search-filter/search-filter.page';

const routes: Routes = [
    {
        path: '',
        component: CategoryListPage
    }
];

@NgModule({
    entryComponents: [
        SearchFilterPage
    ],
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
        ReactiveFormsModule
    ],
    declarations: [CategoryListPage, SearchFilterPage]
})
export class CategoryListPageModule {
}
