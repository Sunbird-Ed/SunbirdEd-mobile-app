import { RouterLinks } from '@app/app/app.constant';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { GroupDetailsPage } from './group-details.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { ComponentsModule } from '../../components/components.module';
import { OverflowMenuComponent } from '../../profile/overflow-menu/overflow-menu.component';
import { PipesModule } from '@app/pipes/pipes.module';
import { AddActivityToGroupPage } from '../add-activity-to-group/add-activity-to-group.page';

const routes: Routes = [
  {
    path: '',
    component: GroupDetailsPage
  },
  {
    path: RouterLinks.ADD_ACTIVITY_TO_GROUP,
    component: AddActivityToGroupPage
  }
];

@NgModule({
  declarations: [GroupDetailsPage, AddActivityToGroupPage],
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
  entryComponents: [OverflowMenuComponent]
})
export class GroupDetailsPageModule {}
