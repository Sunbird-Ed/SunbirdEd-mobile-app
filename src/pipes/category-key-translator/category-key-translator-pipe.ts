import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';
import {CommonUtilService} from '@app/services';
import { Trackable } from '@project-sunbird/sunbird-sdk';
import { CsContentType, CsPrimaryCategory } from '@project-sunbird/client-services/services/content';


@Pipe({
    name: 'categoryKeyTranslate',
    pure: true
})
export class CategoryKeyTranslator implements PipeTransform {
    constructor(
        private commonUtilService: CommonUtilService
    ) {
    }

    transform(
        key: string,
        trackable?: Trackable,
        primaryCategory?: string,
        fields?: string | any
    ): string {
        const translationKey = this.getTranslationKeyPrefix(trackable, primaryCategory).concat('_').concat(key);
        return this.commonUtilService.translateMessage(translationKey, fields);
    }

    private getTranslationKeyPrefix(trackable: Trackable, primaryCategory: string): string {

        let trackabilityPrefix = '';
        if (trackable && trackable.enabled && trackable.enabled === 'Yes') {
            trackabilityPrefix = 'TRK';
        } else if (trackable && trackable.enabled && trackable.enabled === 'No') {
            trackabilityPrefix = 'NONTRK';
        } else {
            trackabilityPrefix = this.getTrackablePrefix(primaryCategory);
        }
        return this.getContetPrefix(primaryCategory).concat('_').concat(trackabilityPrefix);
    }

    private getContetPrefix(primaryCategory: string) {
        let prefix = 'DFLT';
        switch (primaryCategory) {
            case CsPrimaryCategory.COURSE:
                prefix = 'CRS';
                break;
            case CsPrimaryCategory.DIGITAL_TEXTBOOK:
                prefix = 'TBK';
                break;
            default:
                prefix = 'DFLT';
                break;
        }
        return prefix;
    }

    private getTrackablePrefix(primaryCategory: string): string {
        let prefix = '';
        switch (primaryCategory) {
            case CsPrimaryCategory.COURSE:
                prefix = 'TRK';
                break;
            case CsPrimaryCategory.DIGITAL_TEXTBOOK:
            case CsContentType.TEXTBOOK:
                prefix = 'NONTRK';
                break;
        }
        return prefix;
    }
}
