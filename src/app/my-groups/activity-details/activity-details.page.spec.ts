import { ActivityDetailsPage } from './activity-details.page';
import { Router } from '@angular/router';
import { FilterPipe } from '../../../pipes/filter/filter.pipe';
import {
    CommonUtilService, Environment, ImpressionType,
    PageId, TelemetryGeneratorService
} from '../../../services';
import { GroupService, GroupMemberRole, MimeType } from '@project-sunbird/sunbird-sdk';
import { AppHeaderService, CollectionService, AppGlobalService, InteractType, InteractSubtype, AndroidPermissionsService } from '../../../services';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { CsGroupActivityAggregationMetric } from '@project-sunbird/client-services/services/group/activity';
import { RouterLinks } from '../../app.constant';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { doesNotReject } from 'assert';

describe('ActivityDetailsPage', () => {
    let activityDetailsPage: ActivityDetailsPage;
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(),
        translateMessage: jest.fn()
    };
    const mockFilterPipe: Partial<FilterPipe> = {};
    const mockGroupService: Partial<GroupService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {
        is: jest.fn()
    };
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
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        selectedActivityCourseId: ''
    };
    const mockCollectionService: Partial<CollectionService> = {
        fetchCollectionData: jest.fn(() => Promise.reject(''))
    };
    const mockFileService: Partial<File> = {
    };
    const mockPermissionService: Partial<AndroidPermissionsService> = {
    };
    const mockFileOpener: Partial<FileOpener> = {
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sample_app_name'))
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
            mockAppGlobalService as AppGlobalService,
            mockFileService as File,
            mockPermissionService as AndroidPermissionsService,
            mockFileOpener as FileOpener,
            mockAppVersion as AppVersion
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
        it('should generate impression telemetry', () => {
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            activityDetailsPage.ngOnInit();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                '',
                PageId.ACTIVITY_DETAIL,
                Environment.GROUP,
                undefined, undefined, undefined, undefined, activityDetailsPage.corRelationList);
        });
    });

    describe('ionViewWillEnter', () => {
        beforeEach(() => {
            mockCollectionService.fetchCollectionData = jest.fn(() => Promise.reject('err'));
        });

        it('should handle device header and back-button for b.userId', (done) => {
            mockCollectionService.fetchCollectionData = jest.fn(() => Promise.reject('err'));
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
            activityDetailsPage.courseData = {
                contentData: {
                    leafNodes: ['node1']
                }
            } as any;
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
            activityDetailsPage.activity = {
                type: 'Course'
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

        it('should set selected course', (done) => {
            const cData = {
                children: [{
                    contentType: 'collection',
                    children: [
                        {
                            contentType: 'Course',
                            identifier: 'id1',
                            mimeType: MimeType.COLLECTION
                        },
                        {
                            contentType: 'collection',
                            children: [
                                {
                                    contentType: 'Course',
                                    identifier: 'id2',
                                    name: 'name2',
                                    mimeType: MimeType.COLLECTION,
                                    contentData: {
                                        leafNodes: ['node1']
                                    }
                                }
                            ]
                        }
                    ]
                }],
                contentData: {
                    leafNodes: ['node1']
                }
            };
            mockCollectionService.fetchCollectionData = jest.fn(() => Promise.resolve(cData));
            mockAppGlobalService.selectedActivityCourseId = 'id2';
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
            activityDetailsPage.courseData = {
                contentData: {
                    leafNodes: ['node1']
                }
            } as any;
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
                expect(activityDetailsPage.courseList.length).toEqual(2);
                expect(activityDetailsPage.selectedCourse.name).toEqual('name2');
                done();
            }, 0);
        });

        it('should not set selected course', (done) => {
            const cData = {
                children: [{
                    contentType: 'collection',
                    children: [
                        {
                            contentType: 'Course',
                            identifier: 'id1',
                            mimeType: MimeType.COLLECTION
                        },
                        {
                            contentType: 'collection',
                            children: [
                                {
                                    contentType: 'Course',
                                    identifier: 'id2',
                                    mimeType: MimeType.COLLECTION
                                }
                            ]
                        }
                    ]
                }],
                contentData: {
                    leafNodes: ['node1']
                }
            };
            mockCollectionService.fetchCollectionData = jest.fn(() => Promise.resolve(cData));
            mockAppGlobalService.selectedActivityCourseId = '';
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
            activityDetailsPage.courseData = {
                contentData: {
                    leafNodes: ['node1']
                }
            } as any;
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
                expect(activityDetailsPage.courseList.length).toEqual(2);
                expect(activityDetailsPage.selectedCourse).toBe('');
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
            const cData = {
                children: [{
                    contentType: 'collection',
                }],
                contentData: {
                    leafNodes: ['node1']
                }
            };
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

    it('should generate telemetry for back clicked', () => {
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        activityDetailsPage.handleBackButton(true);
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.ACTIVITY_DETAIL, Environment.GROUP, true, undefined, activityDetailsPage.corRelationList);
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
            subscribeWithPriority: jest.fn((_, fn) => fn(Promise.resolve({ event: {} }))) as any
        } as any;
        jest.spyOn(activityDetailsPage, 'handleBackButton').mockImplementation();
        // act
        activityDetailsPage.handleDeviceBackButton();
        // assert
        expect(mockPlatform.backButton).not.toBeUndefined();
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

    it('should openActivityToc', () => {
        // arrange
        mockRouter.navigate = jest.fn();
        activityDetailsPage.activity = {
            activityInfo: {
                name: 'course1'
            }
        } as any;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        activityDetailsPage.openActivityToc();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH, InteractSubtype.SELECT_NESTED_ACTIVITY_CLICKED,
            Environment.GROUP, PageId.ACTIVITY_DETAIL,
            undefined, undefined, undefined, activityDetailsPage.corRelationList);
        expect(mockRouter.navigate).toHaveBeenCalledWith(
            [`/${RouterLinks.MY_GROUPS}/${RouterLinks.ACTIVITY_DETAILS}/${RouterLinks.ACTIVITY_TOC}`],
            expect.anything()
        );
    });
    it('should reset selectedActivity Id', () => {
        activityDetailsPage.ngOnDestroy();
        expect(mockAppGlobalService.selectedActivityCourseId).toBe('');
    });
    describe('openCSV', () => {
        it('should open Intent for opening CSV', () => {
            //arrange
            mockFileOpener.open = jest.fn(() => Promise.resolve('msg'))
            const type = 'text/csv';
            //act
            activityDetailsPage.openCsv('path')
            //assert
            expect( mockFileOpener.open).toHaveBeenCalledWith('path', type)
        })
        it('should open Intent for opening CSV', (done) => {
            //arrange
            mockFileOpener.open = jest.fn(() => Promise.reject('msg'))
            const type = 'text/csv';
            //act
            activityDetailsPage.openCsv('path')
            //assert
            expect( mockFileOpener.open).toHaveBeenCalledWith('path', type)
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CERTIFICATE_ALREADY_DOWNLOADED');
               
                done();
            }, 0);
        })
    })

    describe('checkForPermissions', () => {
        it('should return true if permissions are already accepted', () => {
            // arrange
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: true}))
            // act
            activityDetailsPage.checkForPermissions().then((res) => {
                expect(res).toBe(true)
            })
        })
        it('should return false if permissions are not accepted', () => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({isPermissionAlwaysDenied: true}))
            // act
            activityDetailsPage.checkForPermissions().then((res) => {
                expect(res).toBe(false)
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    undefined,
                    'profile',
                    true
                )
            })
        })

        it('should show settinngs toast when user doesnt give permission', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({isPermissionAlwaysDenied: false}))
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('NOT_NOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            // act
            activityDetailsPage.checkForPermissions()
            setTimeout(() => {
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    undefined,
                    PageId.PROFILE, true
                )
                done()
            });
        })
        it('should return true if user gives permission', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({isPermissionAlwaysDenied: false}))
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: true}))
            // act
            activityDetailsPage.checkForPermissions()
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled()
                done()
            });
        })

        it('should show toast when permissions not set', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({isPermissionAlwaysDenied: false}))
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockPermissionService.requestPermission = jest.fn(() => of({isPermissionAlwaysDenied: true}))
            // act
            activityDetailsPage.checkForPermissions()
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled()
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    undefined,
                    PageId.PROFILE, true
                )
                done()
            });
        })
    })
    describe('convertToCSV', () => {
        it('should return CSV', () => {
            // arrange
            const memberList = [
                {
                    name: 'name1',
                    agg: [
                        {metric: "progress", value: 100}
                    ]
                }
            ]
            activityDetailsPage.courseData = {
                name: 'some_name'
            } as any
            //act
            activityDetailsPage.convertToCSV(memberList)
        })
    })
    describe('downloadCSV', () => {
        it('should download csv successfully', (done) => {
            // arrange
            activityDetailsPage.memberList = [
                {
                    name: 'name1',
                    agg: [
                        {metric: "progress", value: 100}
                    ]
                }
            ];
            activityDetailsPage.courseData = {
                name: 'sample_name'
            } as any;
            jest.spyOn(activityDetailsPage, 'checkForPermissions').mockResolvedValue(true);
            mockFileService.writeFile = jest.fn(() => Promise.resolve('path'));
            jest.spyOn(activityDetailsPage, 'openCsv').mockImplementation();
            
            //act
            activityDetailsPage.downloadCsv()
            //assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CLICKED,
                    Environment.USER,
                    PageId.ACTIVITY_DETAIL
                )
                expect(activityDetailsPage.openCsv).toHaveBeenCalled();
                done();
            });
        })
    })
    describe('openDashboard', () => {
        it('should open activity dashboard', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            activityDetailsPage.openDashboard()
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled()
        })
    })
});
