import { NgModule } from '@angular/core';
// import { IonicPageModule } from '@ionic/angular';
import { UserTypeSelectionPage } from './user-type-selection';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    UserTypeSelectionPage
  ],
  imports: [
    // IonicPageModule.forChild(UserTypeSelectionPage),
    IonicModule,
    TranslateModule.forChild()
  ],
  exports: [
    UserTypeSelectionPage
  ],
})
export class UserTypeSelectionPageModule {}
