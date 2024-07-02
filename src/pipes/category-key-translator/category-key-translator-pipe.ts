import { Pipe, PipeTransform } from '@angular/core';
import { CommonUtilService } from '../../services/common-util.service';
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
        content: any,
        fields?: string | any): string {

        if (!content) {
            return '';
        }
        content = !content.trackable ? ((content.contentData && content.contentData.trackable) ? content.contentData : content) : content;
        const trackable = content.trackable;
        const primaryCategory = content.primaryCategory ? content.primaryCategory : content.contentType;
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
        switch (primaryCategory.toLowerCase()) {
            case CsPrimaryCategory.COURSE.toLowerCase():
                prefix = 'CRS';
                break;
            case CsPrimaryCategory.DIGITAL_TEXTBOOK.toLowerCase():
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
        switch (primaryCategory.toLowerCase()) {
            case CsPrimaryCategory.COURSE.toLowerCase():
                prefix = 'TRK';
                break;
            case CsPrimaryCategory.DIGITAL_TEXTBOOK.toLowerCase():
            case CsContentType.COLLECTION.toLowerCase():
            case CsContentType.TEXTBOOK.toLowerCase():
                prefix = 'NONTRK';
                break;
        }
        return prefix;
    }
}
