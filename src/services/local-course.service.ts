import { Injectable, Inject } from '@angular/core';
import { Batch, Course, CourseService, EnrollCourseRequest, TelemetryObject, CorrelationData, Rollup, InteractType } from 'sunbird-sdk';
import { Observable } from 'rxjs';
import { AppGlobalService } from './app-global-service.service';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Environment, InteractSubtype, PageId } from './telemetry-constants';
import { Map } from '@app/app/telemetryutil';
import { CommonUtilService } from './common-util.service';
import { EnrollCourse } from './../app/enrolled-course-details-page/course.interface';

@Injectable()
export class LocalCourseService {

    constructor(
        @Inject('COURSE_SERVICE') private courseService: CourseService,
        private appGlobalService: AppGlobalService,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private commonUtilService: CommonUtilService
    ) {
    }

    enrollIntoBatch(enrollCourse: EnrollCourse): Observable<any> {
        const enrollCourseRequest: EnrollCourseRequest = this.prepareEnrollCourseRequest(
            enrollCourse.userId, enrollCourse.batch, enrollCourse.courseId);
        return this.courseService.enrollCourse(enrollCourseRequest)
        .map((data: boolean) => {
            if (data) {
                this.telemetryGeneratorService.generateInteractTelemetry(
                    InteractType.OTHER,
                    InteractSubtype.ENROLL_SUCCESS,
                    Environment.HOME,
                    enrollCourse.pageId, enrollCourse.telemetryObject,
                    this.prepareRequestValue(enrollCourseRequest),
                    enrollCourse.objRollup,
                    enrollCourse.corRelationList
                );
            } else {
                this.telemetryGeneratorService.generateInteractTelemetry(
                    InteractType.OTHER,
                    InteractSubtype.ENROLL_FAILED,
                    Environment.HOME,
                    enrollCourse.pageId, enrollCourse.telemetryObject,
                    this.prepareRequestValue(enrollCourseRequest),
                    enrollCourse.objRollup,
                    enrollCourse.corRelationList
                );
            }
            return data;
        })
        .catch(err => {
            const requestValue = this.prepareRequestValue(enrollCourseRequest)
            if (err && err.code === 'NETWORK_ERROR') {
                requestValue.error = err.code;
                this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
            } else if (err && err.response
                && err.response.body && err.response.body.params && err.response.body.params.err === 'USER_ALREADY_ENROLLED_COURSE') {
                    requestValue.error = err.response.body.params.err;
                    this.commonUtilService.showToast(this.commonUtilService.translateMessage('ALREADY_ENROLLED_COURSE'));
            }
            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.OTHER,
                InteractSubtype.ENROLL_FAILED,
                Environment.HOME,
                enrollCourse.pageId, enrollCourse.telemetryObject,
                requestValue,
                enrollCourse.objRollup,
                enrollCourse.corRelationList
            );
            throw err;
        });
    }

    prepareEnrollCourseRequest(userId: string, batch: Batch | any, courseId?: string): EnrollCourseRequest {
        const enrollCourseRequest: EnrollCourseRequest = {
            batchId: batch.id,
            courseId: batch.courseId || courseId,
            userId,
            batchStatus: batch.status
        };
        return enrollCourseRequest;
    }
    prepareRequestValue(enrollCourseRequest): Map {
        const reqvalues = new Map();
        reqvalues['enrollReq'] = enrollCourseRequest;
        return reqvalues;
    }
}
