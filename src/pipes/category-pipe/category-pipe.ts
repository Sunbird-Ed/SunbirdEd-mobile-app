import { Pipe, PipeTransform } from '@angular/core';
import { CommonUtilService, OnboardingConfigurationService } from '@app/services';


@Pipe({
    name: 'category',
    pure: true
})
export class CategoryPipe implements PipeTransform {
    constructor(
        private commonUtilService: CommonUtilService,
        private onboardingConfigurationService: OnboardingConfigurationService

    ) {
    }

    transform(
        key: string,
        category: string,
        fields?: string | any): string {
        const translationKey = this.onboardingConfigurationService.getCategoryTranslationKey(category)
        const translation = this.commonUtilService.translateMessage(translationKey)
        if(!key) {
            return translation
        }
        const lblTranslation = this.commonUtilService.translateMessage(key, fields)
        return lblTranslation.replace("{{category}}", translation);
    }

}
