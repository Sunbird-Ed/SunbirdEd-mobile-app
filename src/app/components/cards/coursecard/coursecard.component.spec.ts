import { CourseCardComponent } from './coursecard.component';
import { SharedPreferences, CourseService, Content, InteractType } from 'sunbird-sdk';
import { NavController, Events, PopoverController } from '@ionic/angular';
import { CourseUtilService } from '../../../../services/course-util.service';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import { CommonUtilService } from '../../../../services/common-util.service';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';
import { InteractSubtype, CorReleationDataType } from '../../../../services/telemetry-constants';
import { identifier } from '@babel/types';

describe('CourseCardComponent', () => {
    let courseCardComponent: CourseCardComponent;
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockNavCtrl: Partial<NavController> = {};
    const mockCourseUtilService: Partial<CourseUtilService> = {};
    const mockEvents: Partial<Events> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        convertFileSrc: jest.fn(() => '')
    };
    const mockRouter: Partial<Router> = {};
    const mockZone: Partial<NgZone> = {};

    beforeAll(() => {
        courseCardComponent = new CourseCardComponent(
            mockPreferences as SharedPreferences,
            mockCourseService as CourseService,
            mockNavCtrl as NavController,
            mockCourseUtilService as CourseUtilService,
            mockEvents as Events,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockPopoverCtrl as PopoverController,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockZone as NgZone
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be craeate a instance of courseCardComponent', () => {
        expect(courseCardComponent).toBeTruthy();
    });

    it('should update the corerelation list by invoked navigateToDetailPage()', (done) => {
        // arrange
        const content: Partial<Content> = {
            mimeType: 'sample_mime_type',
            contentType: 'course'
        };
        const layoutName = 'SAMPLE_LAYOUT';
        courseCardComponent.isFilterApplied = true;
        mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
        mockCommonUtilService.deDupe = jest.fn(() => [{id: 'filter', type: CorReleationDataType.DISCOVERY_TYPE}]);
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn(() => { });
        mockRouter.navigate = jest.fn();
        // act
        courseCardComponent.navigateToDetailPage(content, layoutName);
        // assert
        setTimeout(() => {
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                undefined,
                undefined,
                expect.anything(),
                expect.anything(),
                expect.anything(),
                [{id: 'filter', type: CorReleationDataType.DISCOVERY_TYPE}]
            );
            // expect(mockTelemetryGeneratorService.isCollection)
            done();
        }, 0);
    });
});
