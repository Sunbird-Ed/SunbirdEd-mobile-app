import { PageId, Environment, ImpressionType, InteractSubtype } from '../../../services/telemetry-constants';
import { AddActivityToGroupPage } from './add-activity-to-group.page';
import { Router } from '@angular/router';
import { TelemetryGeneratorService } from '@app/services';
import { AppHeaderService, AppGlobalService } from '../../../services';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { InteractType } from '@project-sunbird/sunbird-sdk';
import { RouterLinks } from '../../app.constant';

describe('AddActivityToGroupPage', () => {
    let addActivityToGroupPage: AddActivityToGroupPage;

    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    activityList: {
                        contentType: 'Course',
                        identifier: 'id1'
                    },
                    groupId: 'g1',
                    supportedActivityList: [
                        {title: 'some_title'}
                    ]
                }
            }
        }
        )) as any
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        selectedActivityCourseId: ''
    };
    beforeAll(() => {
        addActivityToGroupPage = new AddActivityToGroupPage(
            mockRouter as Router,
            mockHeaderService as AppHeaderService,
            mockPlatform as Platform,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockLocation as Location,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of addActivityToGroupPage', () => {
        expect(addActivityToGroupPage).toBeTruthy();
    });

    it('should generate telemetry for back clicked', () => {
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        addActivityToGroupPage.handleBackButton(true);
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry)
        .toHaveBeenCalledWith(PageId.ACTIVITY_TOC, Environment.GROUP, true);
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should handle device back button', () => {
        const data = {
            name: 'back'
        };
        jest.spyOn(addActivityToGroupPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        addActivityToGroupPage.handleHeaderEvents(data);
        expect(data.name).toBe('back');
    });

    it('should invoked handleDeviceBackButton', () => {
        mockPlatform.backButton = {
            subscribeWithPriority: jest.fn((_, fn) => fn(Promise.resolve({event: {}}))) as any
        } as any;
        jest.spyOn(addActivityToGroupPage, 'handleBackButton').mockImplementation();
        // act
        addActivityToGroupPage.handleDeviceBackButton();
        // assert
        expect(mockPlatform.backButton).not.toBeUndefined();
    });

    describe('ionViewWillEnter', () => {
        beforeEach(() => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(addActivityToGroupPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(addActivityToGroupPage, 'handleDeviceBackButton').mockImplementation();
        });
        it('should handle device header and back-button', (done) => {
            // assert
            mockAppGlobalService.selectedActivityCourseId = '';
            // act
            addActivityToGroupPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '',
                    PageId.ADD_ACTIVITY_TO_GROUP,
                    Environment.GROUP
                );
                done();
            }, 0);
        });

    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe all header service', () => {
            addActivityToGroupPage.unregisterBackButton = {
                unsubscribe: jest.fn()
            } as any;
            // act
            addActivityToGroupPage.ionViewWillLeave();
            // assert
            expect(addActivityToGroupPage.unregisterBackButton).not.toBeUndefined();
        });

        it('should not unsubscribe all header service', () => {
            addActivityToGroupPage.unregisterBackButton = undefined;
            // act
            addActivityToGroupPage.ionViewWillLeave();
            // assert
            expect(addActivityToGroupPage.unregisterBackButton).toBeUndefined();
        });
    });

    describe('search', () => {
        it('should redirect to search page', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            addActivityToGroupPage.search('data');
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                [RouterLinks.SEARCH],
                expect.anything()
            );
        });
    });

});
