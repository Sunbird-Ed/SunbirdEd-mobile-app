import { PageId, Environment, ImpressionType, InteractSubtype } from '../../../services/telemetry-constants';
import { ActivityTocPage } from './activity-toc.page';
import { Router } from '@angular/router';
import { TelemetryGeneratorService } from '../../../services';
import { AppHeaderService, AppGlobalService } from '../../../services';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { InteractType } from '@project-sunbird/sunbird-sdk';

describe('ActivityTocPage', () => {
    let activityTocPage: ActivityTocPage;

    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    courseList: {
                        children: [{
                            contentType: 'collection',
                            children: [
                                {
                                    contentType: 'Course',
                                    identifier: 'id1'
                                }
                            ]
                        }]
                    }
                }
            }
        })) as any
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        selectedActivityCourseId: ''
    };

    beforeAll(() => {
        activityTocPage = new ActivityTocPage(
            mockRouter as Router,
            mockHeaderService as AppHeaderService,
            mockPlatform as Platform,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockLocation as Location,
            mockAppGlobalService as AppGlobalService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of activityTocPage', () => {
        expect(activityTocPage).toBeTruthy();
    });

    it('should generate telemetry for back clicked', () => {
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        activityTocPage.handleBackButton(true);
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.ACTIVITY_TOC, Environment.GROUP, true, undefined, activityTocPage.corRelationList);
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should handle device back button', () => {
        const data = {
            name: 'back'
        };
        jest.spyOn(activityTocPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        activityTocPage.handleHeaderEvents(data);
        expect(data.name).toBe('back');
    });

    it('should invoked handleDeviceBackButton', () => {
        mockPlatform.backButton = {
            subscribeWithPriority: jest.fn((_, fn) => fn(Promise.resolve({ event: {} }))) as any
        } as any;
        jest.spyOn(activityTocPage, 'handleBackButton').mockImplementation();
        // act
        activityTocPage.handleDeviceBackButton();
        // assert
        expect(mockPlatform.backButton).not.toBeUndefined();
    });

    describe('ionViewWillEnter', () => {
        beforeEach(() => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(activityTocPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(activityTocPage, 'handleDeviceBackButton').mockImplementation();
        });
        it('should handle device header and back-button for b.userId', (done) => {
            // assert
            mockAppGlobalService.selectedActivityCourseId = '';
            // act
            activityTocPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW, '', PageId.ACTIVITY_TOC, Environment.GROUP,
                    undefined, undefined, undefined, undefined, activityTocPage.corRelationList);
                done();
            }, 0);
        });
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe all header service', () => {
            activityTocPage.unregisterBackButton = {
                unsubscribe: jest.fn()
            } as any;
            // act
            activityTocPage.ionViewWillLeave();
            // assert
            expect(activityTocPage.unregisterBackButton).not.toBeUndefined();
        });

        it('should not unsubscribe all header service', () => {
            activityTocPage.unregisterBackButton = undefined;
            // act
            activityTocPage.ionViewWillLeave();
            // assert
            expect(activityTocPage.unregisterBackButton).toBeUndefined();
        });
    });

    describe('onCourseChange', () => {
        it('should set selectedActivityCourseId', () => {
            // arrange
            const course = {
                identifier: 'id1'
            };
            // act
            activityTocPage.onCourseChange(course);
            // assert
            expect(mockAppGlobalService.selectedActivityCourseId).toEqual('id1');
            expect(mockLocation.back).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH, InteractSubtype.CONTENT_CLICKED, Environment.GROUP,
                PageId.ACTIVITY_TOC, { id: 'id1', type: undefined, version: '' },
                undefined, { l1: 'id1' }, activityTocPage.corRelationList
            );
        });
        it('should not set selectedActivityCourseId', () => {
            // act
            activityTocPage.onCourseChange();
            // assert
            expect(mockAppGlobalService.selectedActivityCourseId).toBe('');
            expect(mockLocation.back).toHaveBeenCalled();
        });
    });

});
