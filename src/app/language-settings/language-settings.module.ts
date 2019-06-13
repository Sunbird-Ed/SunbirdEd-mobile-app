import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSettingsPage } from '../language-settings/language-settings';
// import { OnboardingPageModule } from '../onboarding/onboarding.module';

@NgModule({
  declarations: [LanguageSettingsPage],
  imports: [
    // OnboardingPageModule,
    TranslateModule.forChild()
  ],
  exports: [LanguageSettingsPage]
})
export class LanguageSettingsPageModule { }
