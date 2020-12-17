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

    async aggregate(request, pageName): Promise<any> {
        let dataSrc: DataSourceType[] = ['TRACKABLE_CONTENTS', 'TRACKABLE_COURSE_CONTENTS'];

        if (this.appGlobalService.isUserLoggedIn()) {
            dataSrc = [];
        }
        const formRequest: FormRequest = {
            type: 'config',
            subType: pageName,
            action: 'get',
            component: 'app',
        };
        try {
            this.aggregatorResponse = await this.aggregateContent(request, dataSrc, formRequest);
            if (this.aggregatorResponse && this.aggregatorResponse.result) {
                this.aggregatorResponse.result.forEach((val) => {
                    val['name'] = this.commonUtilService.getTranslatedValue(val.title, '');
                    if (val.orientation === Orientation.HORIZONTAL) {
                        for (let count = 0; count < val.section.sections[0].contents.length; count++) {
                            val.section.sections[0].contents[count]['cardImg'] =
                                this.commonUtilService.getContentImg(val.section.sections[0].contents[count]);
                        }
                    } else if (val.orientation === Orientation.VERTICAL) {
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
            console.error(e);
            throw e;
        }
    }


    async newAggregate(request, pageName: AggregatorPageType): Promise<any> {
        let dataSrc: DataSourceType[] = ['TRACKABLE_CONTENTS', 'TRACKABLE_COURSE_CONTENTS'];

        if (this.appGlobalService.isUserLoggedIn()) {
            dataSrc = [];
        }

        const formRequest: FormRequest = {
            type: 'config',
            subType: pageName,
            action: 'get',
            component: 'app',
        };
        try {
            this.aggregatorResponse = await this.aggregateContent(request, dataSrc, formRequest);
            return this.aggregatorResponse.result;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    private async aggregateContent(request, dataSrc, formRequest): Promise<ContentAggregatorResponse> {
        return this.contentService.buildContentAggregator(this.formService, this.courseService, this.profileService)
            .aggregate(request, dataSrc, formRequest).toPromise();
    }
}
