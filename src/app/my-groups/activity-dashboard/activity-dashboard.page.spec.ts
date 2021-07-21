import { PageId, Environment, ImpressionType, InteractSubtype } from '../../../services/telemetry-constants';
import { ActivityDashboardPage } from './activity-dashboard.page';
import { Router } from '@angular/router';
import { TelemetryGeneratorService } from '@app/services';
import { AppHeaderService, AppGlobalService, CommonUtilService } from '../../../services';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { GroupService, InteractType } from '@project-sunbird/sunbird-sdk';

describe('ActivityTocPage', () => {
    let activityDashboardPage: ActivityDashboardPage;

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
    const mockGroupService: Partial<GroupService> = {
        activityService: {
        }as any
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
    };

    beforeAll(() => {
        activityDashboardPage = new ActivityDashboardPage(
            mockGroupService as GroupService,
            mockRouter as Router,
            mockHeaderService as AppHeaderService,
            mockPlatform as Platform,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockLocation as Location,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of activityDashboardPage', () => {
        expect(activityDashboardPage).toBeTruthy();
    });

    it('should generate telemetry for back clicked', () => {
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        activityDashboardPage.handleBackButton(true);
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.ACTIVITY_TOC, Environment.GROUP, true);
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should handle device back button', () => {
        const data = {
            name: 'back'
        };
        jest.spyOn(activityDashboardPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        activityDashboardPage.handleHeaderEvents(data);
        expect(data.name).toBe('back');
    });

    it('should invoked handleDeviceBackButton', () => {
        mockPlatform.backButton = {
            subscribeWithPriority: jest.fn((_, fn) => fn(Promise.resolve({ event: {} }))) as any
        } as any;
        jest.spyOn(activityDashboardPage, 'handleBackButton').mockImplementation();
        // act
        activityDashboardPage.handleDeviceBackButton();
        // assert
        expect(mockPlatform.backButton).not.toBeUndefined();
    });

    describe('ionViewWillEnter', () => {
        beforeEach(() => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(activityDashboardPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(activityDashboardPage, 'handleDeviceBackButton').mockImplementation();
            activityDashboardPage.hierarchyData = {
                children: [
                    {
                        name: "some-name"
                    }
                ]
            }
            activityDashboardPage.aggData = {
                members: [
                    {
                        name: "some-name"
                    }
                ]
            }
            const resp = {
                columns: [
                    {title: "Title 1", data: "title1"}
                ]
            }
            mockGroupService.activityService.getDataForDashlets = jest.fn(() => of(resp))
        });
        it('should handle device header and back-button for b.userId', (done) => {
            // assert
            mockAppGlobalService.selectedActivityCourseId = '';
            // act
            activityDashboardPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                // expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                //     ImpressionType.VIEW, '', PageId.ACTIVITY_TOC, Environment.GROUP,
                //     undefined, undefined, undefined, undefined, activityTocPage.corRelationList);
                done();
            }, 0);
        });
    });

    // describe('ionViewWillLeave', () => {
    //     it('should unsubscribe all header service', () => {
    //         activityDashboardPage.unregisterBackButton = {
    //             unsubscribe: jest.fn()
    //         } as any;
    //         activityDashboardPage.headerObservable = of({})
    //         // act
    //         activityDashboardPage.ionViewWillLeave();
    //         // assert
    //         expect(activityDashboardPage.unregisterBackButton).not.toBeUndefined();
    //     });

    //     it('should not unsubscribe all header service', () => {
    //         activityDashboardPage.unregisterBackButton = undefined;
    //         activityDashboardPage.headerObservable = of({})
    //         // act
    //         activityDashboardPage.ionViewWillLeave();
    //         // assert
    //         expect(activityDashboardPage.unregisterBackButton).toBeUndefined();
    //     });
    // });

});
