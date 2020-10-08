import { Inject, Injectable } from '@angular/core';
import { ContentAggregatorResponse, ContentService, CourseService, FormService, ProfileService } from '@project-sunbird/sunbird-sdk';

@Injectable()

export class ContentAggregatorHandler {
    constructor(
        @Inject('COURSE_SERVICE') private courseService: CourseService,
        @Inject('FORM_SERVICE') private formService: FormService,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('CONTENT_SERVICE') private contentService: ContentService,
    ) { }

    aggregate(request, dataSrc, formRequest): Promise<ContentAggregatorResponse> {
        try {
            return this.contentService.buildContentAggregator(this.formService, this.courseService, this.profileService)
            .aggregate(request, dataSrc, formRequest).toPromise();
        } catch (e) {
            console.error(e);
            throw e;
          }
    }
}
