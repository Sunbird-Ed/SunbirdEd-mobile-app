import { Inject, Injectable } from '@angular/core';
import { ContentAggregatorResponse, ContentService, CourseService, FormService, ProfileService } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../common-util.service';

@Injectable()

export class ContentAggregatorHandler {
    aggregatorResponse: any;
    constructor(
        @Inject('COURSE_SERVICE') private courseService: CourseService,
        @Inject('FORM_SERVICE') private formService: FormService,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('CONTENT_SERVICE') private contentService: ContentService,
        public commonUtilService: CommonUtilService,
    ) { }

    async aggregate(request, dataSrc, formRequest): Promise<any> {
        try {
            this.aggregatorResponse = await this.aggregateContent(request, dataSrc, formRequest);
            if (this.aggregatorResponse && this.aggregatorResponse.result) {
                this.aggregatorResponse.result.forEach((val) => {
                    val['name'] = this.commonUtilService.getTranslatedValue(val.title, '');
                    if (val.orientation === 'horizontal') {
                        for (let count = 0; count < val.section.sections[0].contents.length; count++) {
                            val.section.sections[0].contents[count]['cardImg'] =
                                this.commonUtilService.getContentImg(val.section.sections[0].contents[count]);
                        }
                    }
                    if (val.orientation === 'vertical') {
                        for (let i = 0; i < val.section.sections.length; i++) {
                            for (let count = 0; count < val.section.sections[i].contents.length; count++) {
                                val.section.sections[i].contents[count]['cardImg'] =
                                    this.commonUtilService.getContentImg(val.section.sections[i].contents[count]);
                            }
                        }
                    }
                });
            }
            return this.aggregatorResponse.result;
        } catch (e) {
            throw e;
        }
    }

    private async aggregateContent(request, dataSrc, formRequest): Promise<ContentAggregatorResponse> {
        return this.contentService.buildContentAggregator(this.formService, this.courseService, this.profileService)
            .aggregate(request, dataSrc, formRequest).toPromise();
    }
}
