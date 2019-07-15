import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RouterLinks } from '../app.constant';
import { ReportsPage } from './reports.page';
import { ReportListComponent } from './report-list/report-list.component';
import { UserReportComponent } from './user-report/user-report.component';
import { GroupReportListComponent } from './group-report-list/group-report-list.component';

const routes: Routes = [
    { path: '', component: ReportsPage },
    { path: RouterLinks.REPORTS_LIST, component: ReportListComponent },
    { path: RouterLinks.USER_REPORT, component: UserReportComponent },
    { path: RouterLinks.GROUP_REPORT, component: GroupReportListComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class ReportsRoutingModule { }
