import { ActivityDetailsPage } from './activity-details.page';
import { Router } from '@angular/router';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';
import {
    CommonUtilService, Environment, ImpressionType,
    PageId, TelemetryGeneratorService
} from '@app/services';
import { GroupService, GroupMemberRole, MimeType } from '@project-sunbird/sunbird-sdk';
import { AppHeaderService, CollectionService, AppGlobalService } from '../../../services';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { CsGroupActivityAggregationMetric } from '@project-sunbird/client-services/services/group/activity';
import { RouterLinks } from '../../app.constant';

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
                    group: {
                        id: 'sample-group-id'
                    },
                    activity: {
                        id: 'sample-id',
                        type: 'sample-type'
                    }
                }
            }
        })) as any
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        selectedActivityCourseId: ''
    };
    const mockCollectionService: Partial<CollectionService> = {
        fetchCollectionData: jest.fn(() => Promise.reject(''))
    };

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
            mockCollectionService as CollectionService,
            mockAppGlobalService as AppGlobalService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        mockGroupService.activityService = {
            getDataAggregation: jest.fn(() => of({
                members: [{
                    role: GroupMemberRole.ADMIN,
                    createdBy: 'sample-creator',
                    name: 'member-name',
                    userId: 'sample-user-id-1',
                    agg: [{
                        metric: 'completedCount',
                        value: 2
                    }]
                }, {
                    role: GroupMemberRole.MEMBER,
                    createdBy: 'sample-creator',
                    name: 'member-name',
                    userId: 'sample-user-id-2',
                    agg: [{
                        metric: 'completedCount',
                        value: 1
                    }]
                }],
                activity: {
                    id: 'activity-id',
                    type: 'activity-type',
                    agg: {}
                }
            })) as any
        };
    });

    it('should be create a instance of activityDetailsPage', () => {
        expect(activityDetailsPage).toBeTruthy();
    });

    it('should return filter memberList', () => {
        mockFilterPipe.transform = jest.fn(() => []);
        activityDetailsPage.onMemberSearch('');
        expect(mockFilterPipe.transform).toHaveBeenCalled();
    });

    describe('ngOnInit', () => {
        it('should generate impression telemetry', (done) => {
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            activityDetailsPage.ngOnInit();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                '',
                PageId.ACTIVITY_DETAIL,
                Environment.GROUP
            );
            setTimeout(() => {
                expect(activityDetailsPage.courseList.length).toBe(0);
                done();
            });
        });
        it('should set selected course', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            const cData = { children: [{
                contentType: 'collection',
                children : [
                    {
                        contentType: 'Course',
                        identifier: 'id1',
                        mimeType: MimeType.COLLECTION
                    },
                    {
                        contentType: 'collection',
                        children : [
                            {
                                contentType: 'Course',
                                identifier: 'id2',
                                name: 'name2',
                                mimeType: MimeType.COLLECTION
                            }
                        ]
                    }
                ]
            }]};
            mockCollectionService.fetchCollectionData = jest.fn(() => Promise.resolve(cData));
            mockAppGlobalService.selectedActivityCourseId = 'id2';
            // act
            activityDetailsPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(activityDetailsPage.courseList.length).toEqual(2);
                expect(activityDetailsPage.selectedCourse.name).toEqual('name2');
                done();
            });
        });

        it('should not set selected course', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            const cData = { children: [{
                contentType: 'collection',
                children : [
                    {
                        contentType: 'Course',
                        identifier: 'id1',
                        mimeType: MimeType.COLLECTION
                    },
                    {
                        contentType: 'collection',
                        children : [
                            {
                                contentType: 'Course',
                                identifier: 'id2',
                                mimeType: MimeType.COLLECTION
                            }
                        ]
                    }
                ]
            }]};
            mockCollectionService.fetchCollectionData = jest.fn(() => Promise.resolve(cData));
            mockAppGlobalService.selectedActivityCourseId = '';
            // act
            activityDetailsPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(activityDetailsPage.courseList.length).toEqual(2);
                expect(activityDetailsPage.selectedCourse).toBe('');
                done();
            });
        });
    });

    it('should generate telemetry for back clicked', () => {
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        activityDetailsPage.handleBackButton(true);
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry)
        .toHaveBeenCalledWith(PageId.ACTIVITY_DETAIL, Environment.GROUP, true);
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
        beforeEach(() => {
            mockCollectionService.fetchCollectionData = jest.fn(() => Promise.reject('err'));
        });
        it('should handle device header and back-button for b.userId', (done) => {
            activityDetailsPage.group = { id: 'group-id' } as any;
            activityDetailsPage.loggedinUser = {
                userId: 'userId'
            } as any;
            // mockCollectionService.fetchCollectionData = jest.fn(() => Promise.reject(''));
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
                        userId: 'sample-user-id-2',
                        agg: [{
                            metric: 'completedCount',
                            value: 2
                        }]
                    }, {
                        role: GroupMemberRole.ADMIN,
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id-1',
                        agg: [{
                            metric: 'completedCount',
                            value: 1
                        }]
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
            activityDetailsPage.group = { id: 'group-id' } as any;
            activityDetailsPage.loggedinUser = {
                userId: 'userId'
            } as any;
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
                        userId: 'userId',
                        agg: [{
                            metric: 'completedCount',
                            value: 2
                        }]
                    }, {
                        role: GroupMemberRole.MEMBER,
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'sample-user-id-2',
                        agg: [{
                            metric: 'completedCount',
                            value: 1
                        }]
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
            activityDetailsPage.group = { id: 'group-id' } as any;
            activityDetailsPage.loggedinUser = {
                userId: 'userId'
            } as any;
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
                        userId: 'sample-user-id-',
                        agg: [{
                            metric: 'completedCount',
                            value: 2
                        }]
                    }, {
                        role: GroupMemberRole.MEMBER,
                        createdBy: 'sample-creator',
                        name: 'member-name',
                        userId: 'userId',
                        agg: [{
                            metric: 'completedCount',
                            value: 2
                        }]
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
            activityDetailsPage.group = { id: 'group-id' } as any;
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(activityDetailsPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(activityDetailsPage, 'handleDeviceBackButton').mockImplementation();
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
            activityDetailsPage.group = { id: 'group-id' } as any;
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            jest.spyOn(activityDetailsPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(activityDetailsPage, 'handleDeviceBackButton').mockImplementation();
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
            activityDetailsPage.group = { id: 'group-id' } as any;
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
            const cData = { children: [{
                contentType: 'collection',
            }]};
            mockCollectionService.fetchCollectionData = jest.fn(() => Promise.resolve(cData));
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
            activityDetailsPage.loggedinUser = {
                userId: 'sample-user-id-1'
            } as any;
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

    describe('calculateProgress', () => {
        it('should return progress for activityAgg', () => {
            activityDetailsPage.filteredMemberList = [{
                agg: [{
                    metric: CsGroupActivityAggregationMetric.COMPLETED_COUNT,
                    value: 1
                }]
            }];
            activityDetailsPage.selectedCourse = {
                contentData: {
                    leafNodes: ['node1']
                }
            };
            activityDetailsPage.activityDetail = {
                agg: [{
                    metric: CsGroupActivityAggregationMetric.LEAF_NODES_COUNT,
                    value: 1
                }]
            };
            // act
            activityDetailsPage.calculateProgress();
            // assert
            expect(activityDetailsPage.filteredMemberList[0].progress).toBe('100');
        });

        it('should return progress for activityAgg value is lessthan 0', () => {
            activityDetailsPage.filteredMemberList = [{
                agg: [{
                    metric: CsGroupActivityAggregationMetric.COMPLETED_COUNT,
                    value: 0
                }]
            }];
            activityDetailsPage.activity = {
                activityInfo: {
                    leafNodes: ['node1']
                }
            } as any;
            activityDetailsPage.activityDetail = {
                agg: [{
                    metric: CsGroupActivityAggregationMetric.LEAF_NODES_COUNT,
                    value: 0
                }]
            };
            // act
            activityDetailsPage.calculateProgress();
            // assert
            expect(activityDetailsPage.filteredMemberList[0].progress).toBe('0');
        });

        it('should return progress 0 if member agg is empty', () => {
            activityDetailsPage.filteredMemberList = [{
                agg: []
            }];
            activityDetailsPage.activityDetail = {
                agg: [{
                    metric: CsGroupActivityAggregationMetric.LEAF_NODES_COUNT,
                    value: 0
                }]
            };
            // act
            activityDetailsPage.calculateProgress();
            // assert
            expect(activityDetailsPage.filteredMemberList[0].progress).toBe('0');
        });
    });

    describe('getActivityAggLastUpdatedOn', () => {
        it('should return lastUpdatedOn for activityAgg lastUpdatedOn as a string', () => {
            activityDetailsPage.activityDetail = {
                agg: [{
                    metric: CsGroupActivityAggregationMetric.ENROLMENT_COUNT,
                    lastUpdatedOn: '70'
                }]
            };
            // act
            const data = activityDetailsPage.getActivityAggLastUpdatedOn();
            // assert
            expect(data).toBe(70);
        });

        it('should return lastUpdatedOn for activityAgg lastUpdatedOn as a number', () => {
            activityDetailsPage.activityDetail = {
                agg: [{
                    metric: CsGroupActivityAggregationMetric.ENROLMENT_COUNT,
                    lastUpdatedOn: 50
                }]
            };
            // act
            const data = activityDetailsPage.getActivityAggLastUpdatedOn();
            // assert
            expect(data).toBe(50);
        });

        it('should return lastUpdatedOn for activityAgg lastUpdatedOn is undefined', () => {
            activityDetailsPage.activityDetail = {
                agg: [{
                    metric: CsGroupActivityAggregationMetric.ENROLMENT_COUNT,
                    lastUpdatedOn: undefined
                }]
            };
            // act
            const data = activityDetailsPage.getActivityAggLastUpdatedOn();
            // assert
            expect(data).toBe(0);
        });

        it('should return 0 for activityAgg is empty for else part', () => {
            activityDetailsPage.activityDetail = {
                agg: undefined
            };
            // act
            const data = activityDetailsPage.getActivityAggLastUpdatedOn();
            // assert
            expect(data).toBe(0);
        });
    });

    it('should openActivityToc', () => {
        // arrange
        mockRouter.navigate = jest.fn();
        activityDetailsPage.activity = {
            activityInfo: {
                name: 'course1'
            }
        } as any;
        // act
        activityDetailsPage.openActivityToc();
        // assert
        expect(mockRouter.navigate).toHaveBeenCalledWith(
            [`/${RouterLinks.MY_GROUPS}/${RouterLinks.ACTIVITY_DETAILS}/${RouterLinks.ACTIVITY_TOC}`],
            expect.anything()
        );
    });
    it('should reset selectedActivity Id', () => {
        activityDetailsPage.ngOnDestroy();
        expect(mockAppGlobalService.selectedActivityCourseId).toBe('');
    });
});
