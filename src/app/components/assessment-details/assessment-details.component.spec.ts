import { AssessmentDetailsComponent } from './assessment-details.component';
import { PopoverController, Platform } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { NgZone } from '@angular/core';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Location } from '@angular/common';
import { TelemetryObject, ReportSummary } from 'sunbird-sdk';

describe('AssessmentDetailsComponent', () => {
    let assessmentDetailsComponent: AssessmentDetailsComponent;
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockRouter: Partial<Router> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockLocation: Partial<Location> = {};
    const mockZone: Partial<NgZone> = {};

    beforeAll(() => {
        assessmentDetailsComponent = new AssessmentDetailsComponent(
            mockPopoverCtrl as PopoverController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockRouter as Router,
            mockPlatform as Platform,
            mockLocation as Location,
            mockZone as NgZone
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of assessmentDetailsComponent', () => {
        expect(assessmentDetailsComponent).toBeTruthy();
    });

    it('should show assessment result by invoked ngOnInit()', () => {
        // arrange
        assessmentDetailsComponent.assessmentData = {
            showResult: true
        };
        const data = jest.fn();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        mockPopoverCtrl.dismiss = jest.fn();
        assessmentDetailsComponent.backButtonFunc = {
            unsubscribe: data
        }as any;
        // act
        assessmentDetailsComponent.ngOnInit();
        // assert
        expect(subscribeWithPriorityData).toHaveBeenCalled();
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
        expect(data).toHaveBeenCalled();
    });

    it('should showing question details popup for fromUser by invoked onActive()', (done) => {
        // arrange
        const event = {};
        const showPopup = {};
        const callback = {};
        const report = {};
        assessmentDetailsComponent.assessmentData = {
            fromUser: {}
        };
        const telemetry: Partial<TelemetryObject> = {
            id: '',
            type: 'Question',
            version: undefined
        };
        const presentFn = jest.fn(() => Promise.resolve());
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
            present: presentFn
        }) as any);
        // act
        assessmentDetailsComponent.onActivate(event, showPopup, callback, report);
        // assert
        setTimeout(() => {
            expect(assessmentDetailsComponent.assessmentData.fromUser).not.toBeNull();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenLastCalledWith(
                'TOUCH',
                'question-clicked',
                'user',
                'user-assesment-details',
                telemetry
            );
            expect(mockPopoverCtrl.create).toHaveBeenCalledWith({
                component: {},
                componentProps: { callback: {} }, cssClass: 'report-alert'
            });
            expect(presentFn).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should showed question details popup for fromGroup by invoked onActive() if user is available', (done) => {
        // arrange
        const event = {};
        const showPopup = undefined;
        const callback = undefined;
        const report = {
            userName: 'SAMPLE_USER',
            qid: 'Q000',
            name: 'SAMPLE_NAME',
            uid: 'SAMPLE_UID',
            contentId: 'SAMPLE_CONTENT_ID'
        };
        assessmentDetailsComponent.assessmentData = {
            fromGroup: {},
            questionsScore: 5
        };
        const telemetry: Partial<TelemetryObject> = {
            id: 'Q000',
            type: 'User',
            version: undefined
        };
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const reportSummaryRequest: Partial<ReportSummary> = {
            name: report.name,
            uid: report.uid,
            contentId: report.contentId,
            totalQuestionsScore: assessmentDetailsComponent.assessmentData.questionsScore
        };
        mockRouter.navigate = jest.fn();
        const navigationExtras: NavigationExtras = { state: { report: reportSummaryRequest } };
        // act
        assessmentDetailsComponent.onActivate(event, showPopup, callback, report);
        // assert
        setTimeout(() => {
            expect(assessmentDetailsComponent.assessmentData.fromUser).toBeUndefined();
            expect(assessmentDetailsComponent.assessmentData.fromGroup).not.toBeNull();
            expect(report.userName).not.toBeNull();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/reports/user-report'], navigationExtras);
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenLastCalledWith(
                'TOUCH',
                'user-clicked',
                'user',
                'group-assesment-details',
                telemetry
            );
            done();
        }, 0);
    });

    it('should showed question details popup for fromGroup by invoked onActive() if user is not available', (done) => {
        // arrange
        const event = {};
        const showPopup = {};
        const callback = {};
        const report = {
            qid: 'Q000',
            name: 'SAMPLE_NAME',
            uid: 'SAMPLE_UID',
            contentId: 'SAMPLE_CONTENT_ID'
        };
        assessmentDetailsComponent.assessmentData = {
            fromGroup: {},
            questionsScore: 5
        };
        const telemetry: Partial<TelemetryObject> = {
            id: 'SAMPLE_UID',
            type: 'Question',
            version: undefined
        };
        const presentFn = jest.fn(() => Promise.resolve());
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
            present: presentFn
        }) as any);
        // act
        assessmentDetailsComponent.onActivate(event, showPopup, callback, report);
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.create).toHaveBeenCalledWith({
                component: {},
                componentProps: {
                    callback: {
                        qid: 'Q000',
                        name: 'SAMPLE_NAME',
                        uid: 'SAMPLE_UID',
                        contentId: 'SAMPLE_CONTENT_ID'
                    }
                }, cssClass: 'report-alert'
            });
            expect(report.qid).toBe('Q000');
            expect(presentFn).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenLastCalledWith(
                'TOUCH',
                'question-clicked',
                'user',
                'group-assesment-details',
                telemetry
            );
            done();
        }, 0);
    });

    it('should be shorted as asesending order by question number', () => {
        // arrange
        assessmentDetailsComponent.sortProps = {
            key: 'prop',
            type: 'asc'
        };
        // act
        assessmentDetailsComponent.onSortChange('prop');
        // assert
        expect(assessmentDetailsComponent.sortProps.type).toBe('desc');
    });

    it('should be shorted as desending order by question number', () => {
        // arrange
        assessmentDetailsComponent.sortProps = {
            key: 'prop',
            type: 'desc'
        };
        // act
        assessmentDetailsComponent.onSortChange('prop');
        // assert
        expect(assessmentDetailsComponent.sortProps.type).toBe('asc');
    });

    it('should be shorted asending order for default type by question number', () => {
        // arrange
        assessmentDetailsComponent.sortProps = {
            key: 'prop',
            type: ''
        };
        // act
        assessmentDetailsComponent.onSortChange('prop');
        // assert
        expect(assessmentDetailsComponent.sortProps.type).toBe('asc');
    });

    it('should be shorted as asending order by question number for else part', () => {
        // arrange
        assessmentDetailsComponent.sortProps = {
            key: '',
            type: ''
        };
        // act
        assessmentDetailsComponent.onSortChange('prop');
        // assert
        expect(assessmentDetailsComponent.sortProps.key).toBe('prop');
        expect(assessmentDetailsComponent.sortProps.type).toBe('asc');
    });

    it('should be handle backbutton by invoked ngOnDestroy()', () => {
        // arrange
        const data = jest.fn();
        assessmentDetailsComponent.backButtonFunc = {
            unsubscribe: data
        } as any;
        // act
        assessmentDetailsComponent.ngOnDestroy();
        // assert
        expect(data).toHaveBeenCalled();
    });
});
