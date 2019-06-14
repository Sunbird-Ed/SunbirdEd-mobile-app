import { NgModule } from '@angular/core';
// import { IonicPageModule } from '@ionic/angular';
import { UserTypeSelectionPage } from './user-type-selection';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule} from '@angular/forms';
import { CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    UserTypeSelectionPage
  ],
  imports: [
    // IonicPageModule.forChild(UserTypeSelectionPage),
    IonicModule,
    FormsModule,
    CommonModule,
    TranslateModule.forChild()
  ],
  exports: [
    UserTypeSelectionPage
  ],
})
export class UserTypeSelectionPageModule {}
