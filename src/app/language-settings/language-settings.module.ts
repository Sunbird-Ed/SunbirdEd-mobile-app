import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { LanguageSettingsPage } from '../language-settings/language-settings';

// import { OnboardingPageModule } from '../onboarding/onboarding.module';

@NgModule({
  declarations: [LanguageSettingsPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: LanguageSettingsPage
      },
      {
        path: 'language-setting/:isFromSettings',
        component: LanguageSettingsPage
      }
    ]),
    // OnboardingPageModule,
    TranslateModule.forChild()
  ],
  exports: [LanguageSettingsPage]
})
export class LanguageSettingsPageModule { }
