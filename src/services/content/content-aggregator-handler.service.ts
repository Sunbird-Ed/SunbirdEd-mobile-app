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
    private iconMap = {
        program: 'assets/imgs/ic_program.svg',
        project: 'assets/imgs/ic_project.svg',
        observation: 'assets/imgs/ic_observation.svg',
        survey: 'assets/imgs/ic_survey.svg',
        report: 'assets/imgs/ic_report.svg',
        course: 'assets/imgs/ic_course_admin.svg'
    };
    constructor(
        @Inject('COURSE_SERVICE') private courseService: CourseService,
        @Inject('FORM_SERVICE') private formService: FormService,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('CONTENT_SERVICE') private contentService: ContentService,
        public commonUtilService: CommonUtilService,
        private appGlobalService: AppGlobalService,
    ) { }

    async aggregate(request, pageName): Promise<any> {
        let dataSrc: DataSourceType[] = ['TRACKABLE_COLLECTIONS'];

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
                    val['name'] = this.commonUtilService.getTranslatedValue(val.title, JSON.parse(val.title)['en']);
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
        let dataSrc: DataSourceType[] = ['TRACKABLE_COLLECTIONS'];

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

    public populateIcons(aggregatorResponse) {
        if (!aggregatorResponse) {
            return aggregatorResponse;
        }
        aggregatorResponse.forEach((displaySection) => {
            if (displaySection.dataSrc.name === 'CONTENT_FACETS_ADMIN' && displaySection.data && displaySection.data.length) {
                displaySection.data.forEach((element) => {
                    element['icon'] = this.iconMap[element.code];
                });
            } else if (displaySection.dataSrc.name === 'TRACKABLE_CONTENTS' ||
                         displaySection.dataSrc.name === 'TRACKABLE_COURSE_CONTENTS') {
                displaySection.data.sections[0].contents.forEach((value, index) => {
                    value['cardImg'] = value['courseLogoUrl'] || 'assets/imgs/ic_launcher.png';
                });
            }
        });
        return aggregatorResponse;
    }
}
