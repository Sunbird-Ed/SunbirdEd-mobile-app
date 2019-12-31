import { GroupReportAlertComponent } from './group-report-alert.component';
import { NavParams, ModalController, NavController, LoadingController, Platform, PopoverController } from '@ionic/angular';
import { SummarizerService, SummaryRequest } from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { CommonUtilService } from '@app/services/common-util.service';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('GroupReportAlertComponent', () => {
    let groupReportAlertComponent: GroupReportAlertComponent;
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn()
    };
    const mockModalCtrl: Partial<ModalController> = {};
    const mockNavCtrl: Partial<NavController> = {};
    const mockLoading: Partial<LoadingController> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockSummarizerService: Partial<SummarizerService> = {};
    const mockTranslate: Partial<TranslateService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'first name')
    };
    const mockPopOverCtrl: Partial<PopoverController> = {};
    const mockLocation: Partial<Location> = {};

    beforeAll(() => {
        groupReportAlertComponent = new GroupReportAlertComponent(
            mockNavParams as NavParams,
            mockModalCtrl as ModalController,
            mockNavCtrl as NavController,
            mockLoading as LoadingController,
            mockPlatform as Platform,
            mockSummarizerService as SummarizerService,
            mockTranslate as TranslateService,
            mockCommonUtilService as CommonUtilService,
            mockPopOverCtrl as PopoverController,
            mockLocation as Location
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be creaate a instance of groupReportAlertComponent', () => {
        expect(groupReportAlertComponent).toBeTruthy();
    });

    it('should show assessment report for user by invoked getAssessmentByUser()', (done) => {
        // arrange
        const event = 'users';
        const dismissFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            dismiss: dismissFn
        }));
        const userData = new Map();
        userData.set('uid', 'sampe-uid');
        groupReportAlertComponent.assessment = {
            qid: 'Q001',
            uids: 'sample-user',
            contentId: 'sample-content-id',
            time: '2:06',
            users: userData
        };
        const summaryRequest: SummaryRequest = {
            qId: groupReportAlertComponent.assessment.qid,
            uids: groupReportAlertComponent.assessment.uids,
            contentId: groupReportAlertComponent.assessment.contentId,
            hierarchyData: null
        };
        const assessmentResult = [{
            time: '7.00s',
            name: groupReportAlertComponent.assessment.uids,
            max_score: '5',
            result: '3.0',
            res: '3.0/5',
            uid: 'uid'
        }];
        mockSummarizerService.getDetailsPerQuestion = jest.fn(() => of(assessmentResult));
        // act
        groupReportAlertComponent.getAssessmentByUser(event).then(() => {
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockSummarizerService.getDetailsPerQuestion).toHaveBeenCalledWith(summaryRequest);
                done();
            }, 0);
        });
    });

    it('should not show assessment report for user by invoked getAssessmentByUser() for catch part', (done) => {
        // arrange
        const event = 'users';
        const dismissFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            dismiss: dismissFn
        }));
        groupReportAlertComponent.assessment = {
            qid: 'Q001',
            uids: 'sample-user',
            contentId: 'sample-content-id',
            time: '2:06',
        };
        const summaryRequest: SummaryRequest = {
            qId: groupReportAlertComponent.assessment.qid,
            uids: groupReportAlertComponent.assessment.uids,
            contentId: groupReportAlertComponent.assessment.contentId,
            hierarchyData: null
        };
        const assessmentResult = [{
            time: '7.00s',
            name: groupReportAlertComponent.assessment.uids,
            max_score: '5',
            result: '3.0',
            res: '3.0/5',
            uid: 'uid'
        }];
        mockSummarizerService.getDetailsPerQuestion = jest.fn(() => throwError(assessmentResult));
        // act
        groupReportAlertComponent.getAssessmentByUser(event);
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
            expect(mockSummarizerService.getDetailsPerQuestion).toHaveBeenCalledWith(summaryRequest);
            expect(dismissFn).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should be dismissed the popup by invocked cancel()', () => {
        // arrange
        mockPopOverCtrl.dismiss = jest.fn();
        // act
        groupReportAlertComponent.cancel();
        // assert
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
    });

    it('should used for bckbutton subscribe and unsubscribe', () => {
        // arrange
        const subscribeWithPriorityFn = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityFn
        } as any;
        jest.spyOn(groupReportAlertComponent, 'dismissPopup').mockImplementation();
        const unsubscribeFn = jest.fn();
        groupReportAlertComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn
        } as any;
        // act
        groupReportAlertComponent.ionViewWillEnter();
        // assert
        expect(subscribeWithPriorityFn).toHaveBeenCalled();
        expect(groupReportAlertComponent.dismissPopup).toHaveBeenCalled();
        expect(unsubscribeFn).toHaveBeenCalled();
    });

    it('should be unsubscribe device backbutton', () => {
        // arrange
        const unsubscribeFn = jest.fn();
        groupReportAlertComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn
        } as any;
        // act
        groupReportAlertComponent.ionViewWillLeave();
        // assert
        expect(unsubscribeFn).toHaveBeenCalled();
    });

    it('should dissmiss active popup', (done) => {
        // arrange
        const dismissFn = jest.fn();
        mockPopOverCtrl.getTop = jest.fn(() => Promise.resolve({dismiss: dismissFn}as any));
        groupReportAlertComponent = new GroupReportAlertComponent(
            mockNavParams as NavParams,
            mockModalCtrl as ModalController,
            mockNavCtrl as NavController,
            mockLoading as LoadingController,
            mockPlatform as Platform,
            mockSummarizerService as SummarizerService,
            mockTranslate as TranslateService,
            mockCommonUtilService as CommonUtilService,
            mockPopOverCtrl as PopoverController,
            mockLocation as Location
        );
        // act
        groupReportAlertComponent.dismissPopup();
        setTimeout(() => {
            // assert
            expect(mockPopOverCtrl.getTop).toHaveBeenCalled();
            expect(dismissFn).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should not dissmiss active popup only for location back', (done) => {
        // arrange
        mockPopOverCtrl.getTop = jest.fn(() => (''));
        mockLocation.back = jest.fn();
        // act
        groupReportAlertComponent.dismissPopup();
        setTimeout(() => {
            // assert
            expect(mockPopOverCtrl.getTop).toHaveBeenCalled();
            expect(mockLocation.back).toHaveBeenCalled();
            done();
        }, 0);
    });
});
