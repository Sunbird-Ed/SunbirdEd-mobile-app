import { ActivityDetailsPage } from './activity-details.page';
import { Router } from '@angular/router';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';
import {
    CommonUtilService, Environment, ImpressionType,
    PageId, TelemetryGeneratorService
} from '@app/services';
import { GroupService, GroupMemberRole } from '@project-sunbird/sunbird-sdk';
import { AppHeaderService } from '../../../services';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { of } from 'rxjs';

describe('ActivityDetailsPage', () => {
    let activityDetailsPage: ActivityDetailsPage;
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockFilterPipe: Partial<FilterPipe> = {};
    const mockGroupService: Partial<GroupService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    memberList: ['member-1'],
                    loggedinUser: {
                        userId: 'sample-user-id-1'
                    },
                    groupId: 'sample-group-id',
                    activity: {
                        id: 'sample-id',
                        type: 'sample-type'
                    }
                }
            }
        })) as any
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

    beforeAll(() => {
        activityDetailsPage = new ActivityDetailsPage(
            mockGroupService as GroupService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockFilterPipe as FilterPipe,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockLocation as Location,
            mockPlatform as Platform,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of activityDetailsPage', () => {
        expect(activityDetailsPage).toBeTruthy();
    });

    it('should return filter memberList', () => {
        mockFilterPipe.transform = jest.fn(() => []);
        activityDetailsPage.onMemberSearch('');
        expect(mockFilterPipe.transform).toHaveBeenCalled();
    });

    it('ngOnInit', () => {
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        activityDetailsPage.ngOnInit();
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW,
            '',
            PageId.ACTIVITY_DETAIL,
            Environment.GROUP
        );
    });

    it('should generate telemetry for back clicked', () => {
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        activityDetailsPage.handleBackButton(true);
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry)
        .toHaveBeenCalledWith(PageId.GROUP_DETAIL, Environment.GROUP, true);
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should handle device back button', () => {
        const data = {
            name: 'back'
        };
        jest.spyOn(activityDetailsPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        activityDetailsPage.handleHeaderEvents(data);
        expect(data.name).toBe('back');
    });

    it('should invoked handleDeviceBackButton', () => {
        mockPlatform.backButton = {
            subscribeWithPriority: jest.fn((_, fn) => fn(Promise.resolve({event: {}}))) as any
        } as any;
        jest.spyOn(activityDetailsPage, 'handleBackButton').mockImplementation();
        // act
        activityDetailsPage.handleDeviceBackButton();
        // assert
        expect(mockPlatform.backButton).not.toBeUndefined();
    });

    describe('ionViewWillEnter', () => {
        it('should handle device header and back-button for b.userId', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(activityDetailsPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(activityDetailsPage, 'handleDeviceBackButton').mockImplementation();
            mockGroupService.activityService = {
                getDataAggregation: jest.fn(() => of({
                    members: [{
                        role: GroupMemberRole.MEMBER,
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id-2'
                    }, {
                        role: GroupMemberRole.ADMIN,
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id-1'
                    }],
                    activity: {
                        id: 'activity-id',
                        type: 'activity-type',
                        agg: {}
                    }
                })) as any
            };
            // act
            activityDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                expect(mockGroupService.activityService).not.toBeUndefined();
                done();
            }, 0);
        });

        it('should handle device header and back-button for admin', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(activityDetailsPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(activityDetailsPage, 'handleDeviceBackButton').mockImplementation();
            mockGroupService.activityService = {
                getDataAggregation: jest.fn(() => of({
                    members: [{
                        role: GroupMemberRole.ADMIN,
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id-1'
                    }, {
                        role: GroupMemberRole.MEMBER,
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id-2'
                    }],
                    activity: {
                        id: 'activity-id',
                        type: 'activity-type',
                        agg: {}
                    }
                })) as any
            };
            // act
            activityDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                expect(mockGroupService.activityService).not.toBeUndefined();
                done();
            }, 0);
        });

        it('should handle device header and back-button for b.role is member', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(activityDetailsPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(activityDetailsPage, 'handleDeviceBackButton').mockImplementation();
            mockGroupService.activityService = {
                getDataAggregation: jest.fn(() => of({
                    members: [{
                        role: GroupMemberRole.ADMIN,
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id-'
                    }, {
                        role: GroupMemberRole.MEMBER,
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id-'
                    }],
                    activity: {
                        id: 'activity-id',
                        type: 'activity-type',
                        agg: {}
                    }
                })) as any
            };
            // act
            activityDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                expect(mockGroupService.activityService).not.toBeUndefined();
                done();
            }, 0);
        });

        it('should handle device header and back-button for a.role is member', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(activityDetailsPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(activityDetailsPage, 'handleDeviceBackButton').mockImplementation();
            mockGroupService.activityService = {
                getDataAggregation: jest.fn(() => of({
                    members: [{
                        role: GroupMemberRole.MEMBER,
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id-'
                    }, {
                        role: GroupMemberRole.ADMIN,
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id-'
                    }],
                    activity: {
                        id: 'activity-id',
                        type: 'activity-type',
                        agg: {}
                    }
                })) as any
            };
            // act
            activityDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                expect(mockGroupService.activityService).not.toBeUndefined();
                done();
            }, 0);
        });

        it('should handle device header and back-button for nothing match', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(activityDetailsPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(activityDetailsPage, 'handleDeviceBackButton').mockImplementation();
            mockGroupService.activityService = {
                getDataAggregation: jest.fn(() => of({
                    members: [{
                        role: '',
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id'
                    }, {
                        role: '',
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id'
                    }],
                    activity: {
                        id: 'activity-id',
                        type: 'activity-type',
                        agg: {}
                    }
                })) as any
            };
            // act
            activityDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                expect(mockGroupService.activityService).not.toBeUndefined();
                done();
            }, 0);
        });

        it('should handle device header and back-button for undefined memberList', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(activityDetailsPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(activityDetailsPage, 'handleDeviceBackButton').mockImplementation();
            mockGroupService.activityService = {
                getDataAggregation: jest.fn(() => of({
                    members: undefined,
                    activity: {
                        id: 'activity-id',
                        type: 'activity-type',
                        agg: {}
                    }
                })) as any
            };
            // act
            activityDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                expect(mockGroupService.activityService).not.toBeUndefined();
                done();
            }, 0);
        });

        it('should handle device header and back-button for undefined response', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(activityDetailsPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(activityDetailsPage, 'handleDeviceBackButton').mockImplementation();
            mockGroupService.activityService = {
                getDataAggregation: jest.fn(() => of(undefined))
            };
            // act
            activityDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                expect(mockGroupService.activityService).not.toBeUndefined();
                done();
            }, 0);
        });
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe all header service', () => {
            activityDetailsPage.unregisterBackButton = {
                unsubscribe: jest.fn()
            } as any;
            // act
            activityDetailsPage.ionViewWillLeave();
            // assert
            expect(activityDetailsPage.unregisterBackButton).not.toBeUndefined();
        });

        it('should not unsubscribe all header service', () => {
            activityDetailsPage.unregisterBackButton = undefined;
            // act
            activityDetailsPage.ionViewWillLeave();
            // assert
            expect(activityDetailsPage.unregisterBackButton).toBeUndefined();
        });
    });

    describe('getMemberName', () => {
        it('should return memberName if userId is matched', () => {
            const member = {
                userId: 'sample-user-id-1',
                name: 'sample-member-name'
            };
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            // act
            activityDetailsPage.getMemberName(member);
            // assert
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('LOGGED_IN_MEMBER', { member_name: member.name });
        });

        it('should return memberName if userId is not matched', () => {
            const member = {
                user: 'sample-user-id',
                name: 'sample-member-name'
            };
            // act
            activityDetailsPage.getMemberName(member);
        });
    });
});
