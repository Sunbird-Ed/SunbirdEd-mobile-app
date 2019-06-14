import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSettingsPage } from '../language-settings/language-settings';
import { IonicModule } from '@ionic/angular';
import { FormsModule} from '@angular/forms';
import { CommonModule} from '@angular/common';
// import { OnboardingPageModule } from '../onboarding/onboarding.module';

@NgModule({
  declarations: [LanguageSettingsPage],
  imports: [
    // OnboardingPageModule,
    IonicModule,
    FormsModule,
    CommonModule,
    TranslateModule.forChild()
  ],
  exports: [LanguageSettingsPage]
})
export class LanguageSettingsPageModule { }
