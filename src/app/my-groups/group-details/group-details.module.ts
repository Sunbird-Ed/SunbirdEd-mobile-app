import { RouterLinks } from '@app/app/app.constant';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { GroupDetailsPage } from './group-details.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption-v8';
import { ComponentsModule } from '../../components/components.module';
import { OverflowMenuComponent } from '../../profile/overflow-menu/overflow-menu.component';
import { PipesModule } from '@app/pipes/pipes.module';
import { AddActivityToGroupPage } from '../add-activity-to-group/add-activity-to-group.page';
import { ViewMoreActivityPage, ViewMoreActivityDelegateService } from '../view-more-activity/view-more-activity.page';

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
  providers: [ViewMoreActivityDelegateService],
  entryComponents: [OverflowMenuComponent]
})
export class GroupDetailsPageModule {}
