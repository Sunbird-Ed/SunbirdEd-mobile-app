import { RouterLinks } from '../../../app/app.constant';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { GroupDetailsPage } from './group-details.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { AddActivityToGroupPage } from '../add-activity-to-group/add-activity-to-group.page';
import { ViewMoreActivityPage } from '../view-more-activity/view-more-activity.page';
import { ViewMoreActivityDelegateService } from '../view-more-activity/view-more-activity-delegate.page';

const routes: Routes = [
  {
    path: '',
    component: GroupDetailsPage
  },
  {
    path: RouterLinks.ADD_ACTIVITY_TO_GROUP,
    component: AddActivityToGroupPage
  },
  {
    path: RouterLinks.ACTIVITY_VIEW_MORE,
    component: ViewMoreActivityPage
  }
];

@NgModule({
    declarations: [GroupDetailsPage, AddActivityToGroupPage, ViewMoreActivityPage],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        CommonConsumptionModule,
        ComponentsModule,
        PipesModule
    ],
    exports: [GroupDetailsPage],
    providers: [ViewMoreActivityDelegateService]
})
export class GroupDetailsPageModule {}
