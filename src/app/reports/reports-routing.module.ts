import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RouterLinks } from '../app.constant';
import { ReportsPage } from './reports.page';

const routes: Routes = [
    { path: '', component: ReportsPage },
    { path: RouterLinks.REPORTS, component: ReportsPage }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)

    ],
    exports: [RouterModule]
})
export class ReportsRoutingModule { }
