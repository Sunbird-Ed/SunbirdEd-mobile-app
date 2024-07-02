import { GroupHandlerService } from './group-handler.service';
import { CommonUtilService, TelemetryGeneratorService } from '..';
import { Location } from '@angular/common';
import {
    GroupService
} from '@project-sunbird/sunbird-sdk';
import { of, throwError } from 'rxjs';
import { InteractType, InteractSubtype, Environment, ID } from '../telemetry-constants';

describe('GroupHandlerService', () => {
    let groupHandlerService: GroupHandlerService;
    const mockGroupService: GroupService = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockLocation: Partial<Location> = {};
    window.console.error = jest.fn();
    beforeAll(() => {
        groupHandlerService = new GroupHandlerService(
            mockGroupService as GroupService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockLocation as Location
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('Should create instatance', () => {
        expect(groupHandlerService).toBeTruthy();
    });

    describe('addActivityToGroup', () => {
        it('Should not add activity to group if user is offline', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());
            // act
            groupHandlerService.addActivityToGroup('group_id', 'activity_id', 'activity_type', '', []);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalledWith('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
                done();
            }, 0);
        });

        it('Should add activity to group if user is online', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.addActivities = jest.fn(() => of({}));
            mockCommonUtilService.showToast = jest.fn();
            // act
            groupHandlerService.addActivityToGroup('group_id', 'activity_id', 'activity_type', 'some_page_id', []);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.SELECT_ACTIVITY,
                    InteractSubtype.ADD_TO_GROUP_CLICKED,
                    Environment.GROUP,
                    'some_page_id',
                    undefined, undefined, undefined, [], ID.SELECT_ACTIVITY);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    'some_page_id',
                    undefined,
                    undefined,
                    undefined,
                    [],
                    ID.ADD_ACTIVITY_TO_GROUP);
                expect(mockGroupService.addActivities).toHaveBeenCalledWith({
                    groupId: 'group_id',
                    addActivitiesRequest: {
                        activities: [
                            {
                                id: 'activity_id',
                                type: 'activity_type'
                            }
                        ]
                    }
                });
                expect(mockCommonUtilService.showToast).toHaveBeenLastCalledWith('ADD_ACTIVITY_SUCCESS_MSG');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(3,
                    InteractType.SUCCESS,
                    '',
                    Environment.GROUP,
                    'some_page_id',
                    undefined,
                    undefined,
                    undefined,
                    [],
                    ID.ADD_ACTIVITY_TO_GROUP);
                done();
            }, 0);
        });

        it('Should return error', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.addActivities = jest.fn(() => of({
                error: {
                    activities: [{
                        errorCode: 'EXCEEDED_ACTIVITY_MAX_LIMIT'
                    }]
                }
            }));
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            // act
            groupHandlerService.addActivityToGroup('group_id', 'activity_id', 'activity_type', 'some_page_id', []);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.SELECT_ACTIVITY,
                    InteractSubtype.ADD_TO_GROUP_CLICKED,
                    Environment.GROUP,
                    'some_page_id',
                    undefined, undefined, undefined, [], ID.SELECT_ACTIVITY);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    'some_page_id',
                    undefined,
                    undefined,
                    undefined,
                    [],
                    ID.ADD_ACTIVITY_TO_GROUP);
                expect(mockGroupService.addActivities).toHaveBeenCalledWith({
                    groupId: 'group_id',
                    addActivitiesRequest: {
                        activities: [
                            {
                                id: 'activity_id',
                                type: 'activity_type'
                            }
                        ]
                    }
                });
                expect(mockCommonUtilService.showToast).toHaveBeenLastCalledWith('ERROR_MAXIMUM_ACTIVITY_COUNT_EXCEEDS');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('Should return error', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.addActivities = jest.fn(() => of({
                error: {
                    activities: [{
                        errorCode: 'Err'
                    }]
                }
            }));
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            // act
            groupHandlerService.addActivityToGroup('group_id', 'activity_id', 'activity_type', 'some_page_id', []);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.SELECT_ACTIVITY,
                    InteractSubtype.ADD_TO_GROUP_CLICKED,
                    Environment.GROUP,
                    'some_page_id',
                    undefined, undefined, undefined, [], ID.SELECT_ACTIVITY);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    'some_page_id',
                    undefined,
                    undefined,
                    undefined,
                    [],
                    ID.ADD_ACTIVITY_TO_GROUP);
                expect(mockGroupService.addActivities).toHaveBeenCalledWith({
                    groupId: 'group_id',
                    addActivitiesRequest: {
                        activities: [
                            {
                                id: 'activity_id',
                                type: 'activity_type'
                            }
                        ]
                    }
                });
                expect(mockCommonUtilService.showToast).toHaveBeenLastCalledWith('ADD_ACTIVITY_ERROR_MSG');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('Should navigate to previous page for catch', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.addActivities = jest.fn(() => throwError({
                error: 'some_error'
            }));
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            // act
            groupHandlerService.addActivityToGroup('group_id', 'activity_id', 'activity_type', 'some_page_id', []);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.SELECT_ACTIVITY,
                    InteractSubtype.ADD_TO_GROUP_CLICKED,
                    Environment.GROUP,
                    'some_page_id',
                    undefined, undefined, undefined, [], ID.SELECT_ACTIVITY);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    'some_page_id',
                    undefined,
                    undefined,
                    undefined,
                    [],
                    ID.ADD_ACTIVITY_TO_GROUP);
                expect(mockGroupService.addActivities).toHaveBeenCalledWith({
                    groupId: 'group_id',
                    addActivitiesRequest: {
                        activities: [
                            {
                                id: 'activity_id',
                                type: 'activity_type'
                            }
                        ]
                    }
                });
                expect(mockCommonUtilService.showToast).toHaveBeenLastCalledWith('ADD_ACTIVITY_ERROR_MSG');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
});
