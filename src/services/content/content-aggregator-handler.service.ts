import { Inject, Injectable } from '@angular/core';
import {
    ContentAggregatorResponse, ContentService, CourseService, FormRequest,
    FormService, ProfileService
} from '@project-sunbird/sunbird-sdk';
import { DataSourceType } from '@project-sunbird/sunbird-sdk/content/handlers/content-aggregator';
import { AppGlobalService } from '../app-global-service.service';
import { CommonUtilService } from '../common-util.service';
import { AggregatorPageType, Orientation } from './content-aggregator-namespaces';

@Injectable()

export class ContentAggregatorHandler {
    aggregatorResponse: any;
    constructor(
        @Inject('COURSE_SERVICE') private courseService: CourseService,
        @Inject('FORM_SERVICE') private formService: FormService,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('CONTENT_SERVICE') private contentService: ContentService,
        public commonUtilService: CommonUtilService,
        private appGlobalService: AppGlobalService,
    ) { }

    async aggregate(request, pageName: AggregatorPageType): Promise<any> {
        const dataSrc: DataSourceType[] = ['CONTENTS', 'CONTENT_FACETS', 'RECENTLY_VIEWED_CONTENTS'];

        if (this.appGlobalService.isUserLoggedIn()) {
            dataSrc.push('TRACKABLE_CONTENTS');
        }

        const formRequest: FormRequest = {
            type: 'config',
            subType: pageName,
            action: 'get',
            // component: 'app',
        };
        try {
            this.aggregatorResponse = await this.aggregateContent(request, dataSrc, formRequest);
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
