import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DirectivesModule } from '@app/directives/directives.module';
import { PipesModule } from '@app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { AddMemberToGroupPage } from './add-member-to-group.page';
import { OverflowMenuComponent } from '../../profile/overflow-menu/overflow-menu.component';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';

const routes: Routes = [
  {
    path: '',
    component: AddMemberToGroupPage
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
    RecaptchaModule,
    RecaptchaFormsModule
  ],
  declarations: [AddMemberToGroupPage],
  entryComponents: [OverflowMenuComponent]
})
export class AddMemberToGroupPageModule {}
