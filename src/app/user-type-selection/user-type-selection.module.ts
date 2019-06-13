import { NgModule } from '@angular/core';
// import { IonicPageModule } from '@ionic/angular';
import { UserTypeSelectionPage } from './user-type-selection';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    UserTypeSelectionPage
  ],
  imports: [
    // IonicPageModule.forChild(UserTypeSelectionPage),
    TranslateModule.forChild()
  ],
  exports: [
    UserTypeSelectionPage
  ],
})
export class UserTypeSelectionPageModule {}
