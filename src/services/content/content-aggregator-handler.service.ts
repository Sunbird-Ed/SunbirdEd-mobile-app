import { Inject, Injectable } from '@angular/core';
import { FormConstants } from '../../app/form.constants';
import {
    ContentAggregatorResponse, ContentService, CourseService,
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
        try {
            this.aggregatorResponse = await this.aggregateContent(request, dataSrc,
                {...FormConstants.CONTENT_AGGREGATOR, subType: pageName});
            if (this.aggregatorResponse && this.aggregatorResponse.result) {
                this.aggregatorResponse.result.forEach((val) => {
                    val['name'] = this.commonUtilService.getTranslatedValue(val.title, JSON.parse(val.title)['en']);
                    if (val.theme.orientation === Orientation.HORIZONTAL && val.data.sections.length
                        && val.data.sections[0].contents && val.data.sections[0].contents.length) {
                        for (let count = 0; count < val.data.sections[0].contents.length; count++) {
                            val.data.sections[0].contents[count]['cardImg'] =
                                this.commonUtilService.getContentImg(val.data.sections[0].contents[count]);
                        }
                    } else if (val.theme.orientation === Orientation.VERTICAL) {
                        for (let i = 0; i < val.data.sections.length; i++) {
                            if (val.data.sections[i].contents && val.data.sections[i].contents.length) {
                                for (let count = 0; count < val.data.sections[i].contents.length; count++) {
                                    val.data.sections[i].contents[count]['cardImg'] =
                                        this.commonUtilService.getContentImg(val.data.sections[i].contents[count]);
                                }
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


    async newAggregate(request, pageName: AggregatorPageType, rootOrgId?: string): Promise<any> {
        let dataSrc: DataSourceType[] = ['TRACKABLE_COLLECTIONS'];

        if (this.appGlobalService.isUserLoggedIn()) {
            dataSrc = [];
        }

        try {
            this.aggregatorResponse = await this.aggregateContent(request, dataSrc,
                {...FormConstants.CONTENT_AGGREGATOR, subType: pageName, rootOrgId: rootOrgId || '*'});
            return this.aggregatorResponse.result;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    private async aggregateContent(request, dataSrc, formRequest): Promise<ContentAggregatorResponse> {
        return this.contentService.buildContentAggregator(this.formService, this.courseService, this.profileService)
            .aggregate(request, dataSrc, formRequest, undefined, true).toPromise();
    }

    public populateIcons(aggregatorResponse) {
        if (!aggregatorResponse) {
            return aggregatorResponse;
        }
        aggregatorResponse.forEach((displaySection) => {
            if (displaySection.dataSrc.type === 'CONTENT_FACETS' && displaySection.data && displaySection.data.length) {
                displaySection.data.forEach((element) => {
                    element['icon'] = this.iconMap[element.code];
                });
            } else if ((displaySection.dataSrc.type === 'TRACKABLE_COLLECTIONS' || displaySection.dataSrc.type === 'CONTENTS') &&
            displaySection.data.sections.length && displaySection.data.sections[0].contents) {
                displaySection.data.sections[0].contents.forEach((value, index) => {
                    value['cardImg'] = value['courseLogoUrl'] || (value.content ? value.content['appIcon'] : value['appIcon']) ||
                    'assets/imgs/ic_launcher.png';
                    value = value.content;
                });
            }
        });
        return aggregatorResponse;
    }
}
