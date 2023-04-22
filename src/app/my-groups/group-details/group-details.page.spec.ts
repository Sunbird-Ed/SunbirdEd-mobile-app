import { GroupDetailsPage } from './group-details.page';
import {
    GroupService, GroupMemberRole,
    GroupEntityStatus,
    DiscussionService,
    ProfileService,
    FormService
} from '@project-sunbird/sunbird-sdk';
import {
    AppHeaderService,
    AppGlobalService,
    TelemetryGeneratorService, ImpressionType, PageId,
    Environment, InteractType, InteractSubtype, ID
} from '../../../services';
import { Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import { FilterPipe } from '../../../pipes/filter/filter.pipe';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { RouterLinks } from '../../app.constant';
import { CommonUtilService } from '../../../services/common-util.service';
import { NavigationService } from '../../../services/navigation-handler.service';
import { ViewMoreActivityDelegateService } from '../view-more-activity/view-more-activity.page';
import { DiscussionTelemetryService } from '../../../services/discussion/discussion-telemetry.service';

describe('GroupDetailsPage', () => {
    let groupDetailsPage: GroupDetailsPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        networkInfo: {
            isNetworkAvailable: true
        },
    };
    const mockFilterPipe: Partial<FilterPipe> = {
        transform: jest.fn()
    };
    const mockGroupService: Partial<GroupService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    groupId: 'sample-group-id'
                }
            }
        })) as any
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockNavigationService: Partial<NavigationService> = {
        navigateToTrackableCollection: jest.fn(),
        navigateTo: jest.fn(),
        navigateToDetailPage: jest.fn()
    };
    const mockViewMoreActivityDelegateService: Partial<ViewMoreActivityDelegateService> = {};
    const mockDiscussionService: Partial<DiscussionService> = {};
    const mockProfileService: Partial<ProfileService> = {}
    const mockFormService: Partial<FormService> = {
        getForm: jest.fn()
    };
    

    beforeAll(() => {
        groupDetailsPage = new GroupDetailsPage(
            mockGroupService as GroupService,
            mockDiscussionService as DiscussionService,
            mockProfileService as ProfileService,
            mockFormService as FormService,
            mockAppGlobalService as AppGlobalService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockLocation as Location,
            mockPlatform as Platform,
            mockPopoverCtrl as PopoverController,
            mockNavigationService as NavigationService,
            mockCommonUtilService as CommonUtilService,
            mockFilterPipe as FilterPipe,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockViewMoreActivityDelegateService as ViewMoreActivityDelegateService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of groupDetailsPage', () => {
        expect(groupDetailsPage).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should return active profile uid', () => {
            // arrange
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // jest.spyOn(groupDetailsPage, 'fetchForumIds').mockImplementation()
            mockDiscussionService.getForumIds = jest.fn(() => throwError({ error: 'error' })) as any;
            mockFormService.getForm = jest.fn(() => throwError({ error: 'error' })) as any;
            const mockProfileRes = {
                serverProfile: {
                    userName: 'some_user'
                }
            };
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileRes) as any);
            // act
            groupDetailsPage.ngOnInit();
    
            // assert
            expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW, '', PageId.GROUP_DETAIL, Environment.GROUP,
                undefined, undefined, undefined, undefined, groupDetailsPage.corRelationList
            );
        });
    })
    

    it('should navigate to previous page', () => {
        // arrange
        mockLocation.back = jest.fn();
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();

        // act
        groupDetailsPage.handleBackButton(true);

        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.GROUP_DETAIL, Environment.GROUP, true, undefined, groupDetailsPage.corRelationList);
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should invoked device back button', () => {
        const subscribeWithPriorityData = jest.fn(() => ({
            unsubscribe: jest.fn()
        }));
        mockPlatform.backButton = {
            subscribeWithPriority: jest.fn(() => ({ unsubscribe: jest.fn() })),
        } as any;
        jest.spyOn(groupDetailsPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        // act
        groupDetailsPage.handleDeviceBackButton();
        // assert
        expect(mockPlatform.backButton).not.toBeUndefined();
    });

    it('should handle device back button', () => {
        const data = {
            name: 'back'
        };
        jest.spyOn(groupDetailsPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        groupDetailsPage.handleHeaderEvents(data);
        expect(data.name).toBe('back');
    });

    describe('ionViewWillEnter', () => {
        it('should return header with back button for b.userId', (done) => {
            groupDetailsPage.userId = 'sample-uid-2';
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => ({
                    unsubscribe: jest.fn()
                }))
            });
            jest.spyOn(groupDetailsPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            jest.spyOn(groupDetailsPage, 'handleDeviceBackButton').mockImplementation(() => {
                return;
            });
            groupDetailsPage.userId = 'sample-uid-2';
            mockGroupService.getById = jest.fn(() => of({
                groupId: 'sample-group-id',
                members: [{
                    groupId: '',
                    role: GroupMemberRole.MEMBER,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid-1',
                    name: 'SOME_NAME',
                }, {
                    groupId: '',
                    role: GroupMemberRole.MEMBER,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid-2',
                    name: 'SOME_NAME',
                }]
            })) as any;

            // act
            groupDetailsPage.ionViewWillEnter();

            // assert
            expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
            expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
            setTimeout(() => {
                expect(mockGroupService.getById).toHaveBeenCalled();
                // expect(groupDetailsPage.memberList).toStrictEqual([{
                //     groupId: '',
                //     role: GroupMemberRole.MEMBER,
                //     status: GroupEntityStatus.ACTIVE,
                //     userId: 'sample-uid-2',
                //     name: 'SOME_NAME'
                // }, {
                //     groupId: '',
                //     role: GroupMemberRole.MEMBER,
                //     status: GroupEntityStatus.ACTIVE,
                //     userId: 'sample-uid-1',
                //     name: 'SOME_NAME'
                // }]);
                done();
            }, 0);
        });

        it('should return header with back button for a.userId', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => ({
                    unsubscribe: jest.fn()
                }))
            });
            jest.spyOn(groupDetailsPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            jest.spyOn(groupDetailsPage, 'handleDeviceBackButton').mockImplementation(() => {
                return;
            });
            groupDetailsPage.userId = 'sample-uid-1';
            mockGroupService.getById = jest.fn(() => of({
                groupId: 'sample-group-id', members: [{
                    groupId: '',
                    role: GroupMemberRole.MEMBER,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid-1',
                    name: 'SOME_NAME'
                }, {
                    groupId: '',
                    role: GroupMemberRole.MEMBER,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid-2',
                    name: 'SOME_NAME'
                }]
            })) as any;

            // act
            groupDetailsPage.ionViewWillEnter();

            // assert
            expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
            expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
            setTimeout(() => {
                expect(mockGroupService.getById).toHaveBeenCalled();
                // expect(groupDetailsPage.memberList).toStrictEqual([{
                //     groupId: '',
                //     role: GroupMemberRole.MEMBER,
                //     status: GroupEntityStatus.ACTIVE,
                //     userId: 'sample-uid-1',
                //     name: 'SOME_NAME'
                // }, {
                //     groupId: '',
                //     role: GroupMemberRole.MEMBER,
                //     status: GroupEntityStatus.ACTIVE,
                //     userId: 'sample-uid-2',
                //     name: 'SOME_NAME'
                // }]);
                done();
            }, 0);
        });

        it('should return header with back button for a.role is member', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => ({
                    unsubscribe: jest.fn()
                }))
            });
            jest.spyOn(groupDetailsPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            jest.spyOn(groupDetailsPage, 'handleDeviceBackButton').mockImplementation(() => {
                return;
            });
            groupDetailsPage.userId = 'sample-uid';
            mockGroupService.getById = jest.fn(() => of({
                groupId: 'sample-group-id', members: [{
                    groupId: '',
                    role: GroupMemberRole.MEMBER,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid-2',
                    name: 'SOME_NAME'
                }, {
                    groupId: '',
                    role: GroupMemberRole.ADMIN,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid-1',
                    name: 'SOME_NAME'
                }]
            })) as any;

            // act
            groupDetailsPage.ionViewWillEnter();

            // assert
            expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
            expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
            setTimeout(() => {
                expect(mockGroupService.getById).toHaveBeenCalled();
                // expect(groupDetailsPage.memberList).toStrictEqual([{
                //     groupId: '',
                //     role: GroupMemberRole.ADMIN,
                //     status: GroupEntityStatus.ACTIVE,
                //     userId: 'sample-uid-1',
                //     name: 'SOME_NAME'
                // }, {
                //     groupId: '',
                //     role: GroupMemberRole.MEMBER,
                //     status: GroupEntityStatus.ACTIVE,
                //     userId: 'sample-uid-2',
                //     name: 'SOME_NAME'
                // }]);
                done();
            }, 0);
        });

        it('should return header with back button for a.role is ADMIN', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => ({
                    unsubscribe: jest.fn()
                }))
            });
            jest.spyOn(groupDetailsPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            jest.spyOn(groupDetailsPage, 'handleDeviceBackButton').mockImplementation(() => {
                return;
            });
            groupDetailsPage.userId = 'sample-uid-2';
            mockGroupService.getById = jest.fn(() => of({
                groupId: 'sample-group-id', members: [{
                    groupId: '',
                    role: GroupMemberRole.ADMIN,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid',
                    name: 'SOME_NAME'
                }, {
                    groupId: '',
                    role: GroupMemberRole.MEMBER,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid',
                    name: 'SOME_NAME'
                }]
            })) as any;

            // act
            groupDetailsPage.ionViewWillEnter();

            // assert
            expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
            expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
            setTimeout(() => {
                expect(mockGroupService.getById).toHaveBeenCalled();
                // expect(groupDetailsPage.memberList).toStrictEqual([{
                //     groupId: '',
                //     role: GroupMemberRole.ADMIN,
                //     status: GroupEntityStatus.ACTIVE,
                //     userId: 'sample-uid',
                //     name: 'SOME_NAME'
                // }, {
                //     groupId: '',
                //     role: GroupMemberRole.MEMBER,
                //     status: GroupEntityStatus.ACTIVE,
                //     userId: 'sample-uid',
                //     name: 'SOME_NAME'
                // }]);
                done();
            }, 0);
        });

        it('should return header with back button for last else part', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => ({
                    unsubscribe: jest.fn()
                }))
            });
            jest.spyOn(groupDetailsPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            jest.spyOn(groupDetailsPage, 'handleDeviceBackButton').mockImplementation(() => {
                return;
            });
            groupDetailsPage.userId = 'sample-uid-2';
            mockGroupService.getById = jest.fn(() => of({
                groupId: 'sample-group-id', members: [{
                    groupId: '',
                    role: '',
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid',
                    name: 'SOME_NAME'
                }, {
                    groupId: '',
                    role: '',
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid',
                    name: 'SOME_NAME'
                }]
            })) as any;

            // act
            groupDetailsPage.ionViewWillEnter();

            // assert
            expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
            expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
            setTimeout(() => {
                expect(mockGroupService.getById).toHaveBeenCalled();
                // expect(groupDetailsPage.memberList).toStrictEqual([{
                //     groupId: '',
                //     role: '',
                //     status: GroupEntityStatus.ACTIVE,
                //     userId: 'sample-uid',
                //     name: 'SOME_NAME'
                // }, {
                //     groupId: '',
                //     role: '',
                //     status: GroupEntityStatus.ACTIVE,
                //     userId: 'sample-uid',
                //     name: 'SOME_NAME'
                // }]);
                done();
            }, 0);
        });

        it('should return header with back button in error case', (done) => {
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => ({
                    unsubscribe: jest.fn()
                }))
            });
            jest.spyOn(groupDetailsPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            jest.spyOn(groupDetailsPage, 'handleDeviceBackButton').mockImplementation(() => {
                return;
            });
            mockGroupService.getById = jest.fn(() => throwError({ error: 'error' })) as any;

            // act
            groupDetailsPage.ionViewWillEnter();

            // assert
            expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
            expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
            setTimeout(() => {
                expect(mockGroupService.getById).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    it('should navigate To AddUserPage', () => {
        // arrange
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        groupDetailsPage.corRelationList = [{ id: 'sample-group-id', type: 'GroupId' }];

        // act
        groupDetailsPage.navigateToAddUserPage();

        // assert
        expect(mockNavigationService.navigateTo).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.ADD_MEMBER_TO_GROUP}`],
            {
                groupId: 'sample-group-id',
                memberList: [],
                corRelation: groupDetailsPage.corRelationList
            });
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.ADD_MEMBER,
            InteractSubtype.ADD_MEMBER_CLICKED,
            Environment.GROUP,
            PageId.GROUP_DETAIL,
            undefined, undefined, undefined, groupDetailsPage.corRelationList, ID.ADD_MEMBER);
    });

    it('should unsubscribe registerBackButton', () => {
        groupDetailsPage.headerObservable = {
            unsubscribe: jest.fn()
        };

        // act
        groupDetailsPage.ionViewWillLeave();
        expect(groupDetailsPage.headerObservable).not.toBeUndefined();
    });

    it('should not unsubscribe registerBackButton if undefined', () => {
        groupDetailsPage.headerObservable = {
            unsubscribe: jest.fn()
        };
        mockPlatform.backButton = {
            subscribeWithPriority: jest.fn(() => (undefined)),
        } as any;

        // act
        groupDetailsPage.ionViewWillLeave();
        expect(groupDetailsPage.headerObservable).not.toBeUndefined();
    });

    it('should switch to activity tabs', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

        // act
        groupDetailsPage.switchTabs('activities');

        // assert
        expect(groupDetailsPage.activeTab).toStrictEqual('activities');
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.ACTIVITY_TAB_CLICKED,
            Environment.GROUP,
            PageId.GROUP_DETAIL,
            undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
    });

    it('should switch to member tabs', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

        // act
        groupDetailsPage.switchTabs('members');

        // assert
        expect(groupDetailsPage.activeTab).toStrictEqual('members');
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.MEMBER_TAB_CLICKED,
            Environment.GROUP,
            PageId.GROUP_DETAIL,
            undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
    });

    describe('groupMenuClick', () => {
        it('should navigate to my_GROUP page', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                name: 'some-name',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            groupDetailsPage.groupDetails = {
                status: 'sample-status'
            } as any;
            groupDetailsPage.userId = 'some-userId';
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_EDIT_GROUP_DETAILS' } }))
            } as any)));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

            // act
            groupDetailsPage.groupMenuClick({});

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.UPDATE_GROUP,
                    InteractSubtype.EDIT_GROUP_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, ID.UPDATE_GROUP);
                expect(mockNavigationService.navigateTo).toHaveBeenCalledWith(
                    [`/${RouterLinks.MY_GROUPS}/${RouterLinks.CREATE_EDIT_GROUP}`],
                    {
                        groupDetails: groupDetailsPage.groupDetails,
                        corRelation: groupDetailsPage.corRelationList
                    });
                done();
            }, 0);
        });

        it('should invoked showDeleteGroupPopup', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                name: 'some-name',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            groupDetailsPage.userId = 'some-user-Id';
            groupDetailsPage.loggedinUser = {
                role: 'admin',
            } as any;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockCommonUtilService.showToast = jest.fn();
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_DELETE_GROUP', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;
            mockGroupService.deleteById = jest.fn(() => of({})) as any;
            mockLocation.back = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

            // act
            groupDetailsPage.groupMenuClick({});

            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DELETE_GROUP_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DELETE_GROUP_DESC',
                    { group_name: groupDetailsPage.groupDetails.name });
                expect(mockGroupService.deleteById).toHaveBeenCalled();
                expect(mockLocation.back).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.SELECT_DELETE,
                    InteractSubtype.DELETE_GROUP_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, ID.SELECT_DELETE);
                done();
            }, 0);
        });

        it('should invoked showDeleteGroupPopup for offline scenario', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                name: 'some-name',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            groupDetailsPage.userId = 'some-user-Id';
            groupDetailsPage.loggedinUser = {
                role: 'admin',
            } as any;
            mockCommonUtilService.showToast = jest.fn();
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_DELETE_GROUP', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;

            // act
            groupDetailsPage.groupMenuClick({});
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DELETE_GROUP_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DELETE_GROUP_DESC',
                    { group_name: groupDetailsPage.groupDetails.name });
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                        InteractType.SELECT_DELETE,
                        InteractSubtype.DELETE_GROUP_CLICKED,
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined, undefined, undefined, groupDetailsPage.corRelationList, ID.SELECT_DELETE);
                done();
            }, 0);
        });

        it('should invoked showDeleteGroupPopup for catch part', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                name: 'some-name',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            groupDetailsPage.userId = 'some-user-Id';
            groupDetailsPage.loggedinUser = {
                role: 'creator',
            } as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_DELETE_GROUP', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;
            mockGroupService.deleteById = jest.fn(() => throwError({ error: 'error' })) as any;
            mockLocation.back = jest.fn();
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.groupMenuClick({});
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DELETE_GROUP_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DELETE_GROUP_DESC',
                    { group_name: groupDetailsPage.groupDetails.name });
                expect(mockGroupService.deleteById).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.SELECT_DELETE,
                    InteractSubtype.DELETE_GROUP_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, ID.SELECT_DELETE);
                done();
            }, 0);
        });

        it('should invoked showLeaveGroupPopup', (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_LEAVE_GROUP', isLeftButtonClicked: true } }))
            } as any)));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;
            groupDetailsPage.userId = 'sample-user-id';
            groupDetailsPage.groupCreator = {
                userId: 'sample-user-id'
            } as any;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.removeMembers = jest.fn(() => of({})) as any;
            mockLocation.back = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            // act
            groupDetailsPage.groupMenuClick({});
            // assert
            expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBe(true);
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.GROUP_KEBAB_MENU_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LEAVE_GROUP_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LEAVE_GROUP');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'LEAVE_GROUP_POPUP_DESC',
                    { group_name: groupDetailsPage.groupDetails.name });
                // expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                //     InteractType.INITIATED,
                //     '',
                //     Environment.GROUP,
                //     PageId.GROUP_DETAIL,
                //     undefined,
                //     undefined,
                //     undefined,
                //     groupDetailsPage.corRelationList,
                //     ID.LEAVE_GROUP
                // );
                expect(mockGroupService.removeMembers).toHaveBeenCalled();
                expect(mockLocation.back).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('LEAVE_GROUP_SUCCESS_MSG');
                // expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(3,
                //     InteractType.SUCCESS,
                //     '',
                //     Environment.GROUP,
                //     PageId.GROUP_DETAIL,
                //     undefined,
                //     undefined,
                //     undefined,
                //     groupDetailsPage.corRelationList,
                //     ID.LEAVE_GROUP
                // );
                done();
            }, 0);
        });

        it('should invoked showLeaveGroupPopup and return error message', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'sample-user-id'
            } as any;
            groupDetailsPage.loggedinUser = { role: GroupMemberRole.MEMBER } as any;
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_LEAVE_GROUP', isLeftButtonClicked: true } }))
            } as any)));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.removeMembers = jest.fn(() => of({ error: { members: ['sample-member'] } })) as any;
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.groupMenuClick({});

            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.GROUP_KEBAB_MENU_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LEAVE_GROUP_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LEAVE_GROUP');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'LEAVE_GROUP_POPUP_DESC',
                    { group_name: groupDetailsPage.groupDetails.name });
                // expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                //     InteractType.INITIATED,
                //     '',
                //     Environment.GROUP,
                //     PageId.GROUP_DETAIL,
                //     undefined,
                //     undefined,
                //     undefined,
                //     groupDetailsPage.corRelationList,
                //     ID.LEAVE_GROUP
                // );
                expect(mockGroupService.removeMembers).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('LEAVE_GROUP_ERROR_MSG');
                done();
            }, 0);
        });

        it('should invoked showLeaveGroupPopup and return error message for catch part', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'sample-user-id'
            } as any;
            groupDetailsPage.loggedinUser = { role: GroupMemberRole.MEMBER } as any;
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_LEAVE_GROUP', isLeftButtonClicked: true } }))
            } as any)));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.removeMembers = jest.fn(() => throwError({ error: 'error' })) as any;
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.groupMenuClick({});

            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.GROUP_KEBAB_MENU_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LEAVE_GROUP_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LEAVE_GROUP');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'LEAVE_GROUP_POPUP_DESC',
                    { group_name: groupDetailsPage.groupDetails.name });
                // expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                //     InteractType.INITIATED,
                //     '',
                //     Environment.GROUP,
                //     PageId.GROUP_DETAIL,
                //     undefined,
                //     undefined,
                //     undefined,
                //     groupDetailsPage.corRelationList,
                //     ID.LEAVE_GROUP
                // );
                expect(mockGroupService.removeMembers).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('LEAVE_GROUP_ERROR_MSG');
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoked showLeaveGroupPopup for offline scenario', (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_LEAVE_GROUP', isLeftButtonClicked: true } }))
            } as any)));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;
            groupDetailsPage.userId = 'sample-user-id';
            groupDetailsPage.groupCreator = {
                userId: 'sample-user-id'
            } as any;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());

            // act
            groupDetailsPage.groupMenuClick({});

            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.GROUP_KEBAB_MENU_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LEAVE_GROUP_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LEAVE_GROUP');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'LEAVE_GROUP_POPUP_DESC',
                    { group_name: groupDetailsPage.groupDetails.name });
                expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalledWith('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
                done();
            }, 0);
        });

        it('should return null if selected Item is not matched or undefined', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: undefined } }))
            } as any)));
            groupDetailsPage.groupMenuClick({});
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return null if data is undefined', (done) => {
            groupDetailsPage.userId = 'some-userId';
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                name: 'some-name',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined }))
            } as any)));
            groupDetailsPage.groupMenuClick({});
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoke showDeactivateGroupPopup', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                name: 'some-name',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            groupDetailsPage.userId = 'some-user-Id';
            groupDetailsPage.loggedinUser = {
                role: 'admin',
            } as any;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockCommonUtilService.showToast = jest.fn();
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'FRMELEMENTS_LBL_DEACTIVATEGRP', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'suspended'
            } as any;
            mockGroupService.suspendById = jest.fn(() => of({})) as any;
            mockLocation.back = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

            // act
            groupDetailsPage.groupMenuClick({});

            // assert
            setTimeout(() => {
                // expect(presentFn).toHaveBeenCalled();
                // expect(dismissFn).toHaveBeenCalled();
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'FRMELEMENTS_LBL_DEACTIVATEGRPQUES');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'FRMELEMENTS_BTN_DEACTIVATEGRP');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'FRMELEMENTS_MSG_DEACTIVATEGRPMSG');
                // expect(mockGroupService.suspendById).toHaveBeenCalled();

                done();
            }, 0);
        });

        it('should invoked showDeactivateGroupPopup for offline scenario', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                name: 'some-name',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            groupDetailsPage.userId = 'some-user-Id';
            groupDetailsPage.loggedinUser = {
                role: 'admin',
            } as any;
            mockCommonUtilService.showToast = jest.fn();
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'FRMELEMENTS_LBL_DEACTIVATEGRP', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;

            // act
            groupDetailsPage.groupMenuClick({});
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'FRMELEMENTS_LBL_DEACTIVATEGRPQUES');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'FRMELEMENTS_BTN_DEACTIVATEGRP');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'FRMELEMENTS_MSG_DEACTIVATEGRPMSG',
                    // { group_name: groupDetailsPage.groupDetails.name });
            }, 0);
            done();
        });

        it('should invoked showDeactivateGroupPopup for catch part', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                name: 'some-name',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            groupDetailsPage.userId = 'some-user-Id';
            groupDetailsPage.loggedinUser = {
                role: 'creator',
            } as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'FRMELEMENTS_LBL_DEACTIVATEGRP', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;
            mockGroupService.suspendById = jest.fn(() => throwError({ error: 'error' })) as any;
            mockLocation.back = jest.fn();
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.groupMenuClick({});
            // assert
            setTimeout(() => {
                // expect(presentFn).toHaveBeenCalled();
                // expect(dismissFn).toHaveBeenCalled();
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'FRMELEMENTS_LBL_DEACTIVATEGRPQUES');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'FRMELEMENTS_BTN_DEACTIVATEGRP');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'FRMELEMENTS_MSG_DEACTIVATEGRPMSG',
                    // { group_name: groupDetailsPage.groupDetails.name });
                // expect(mockGroupService.suspendById).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoke showReactivateGroupPopup', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                name: 'some-name',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            groupDetailsPage.userId = 'some-user-Id';
            groupDetailsPage.loggedinUser = {
                role: 'admin',
            } as any;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockCommonUtilService.showToast = jest.fn();
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'FRMELEMENTS_LBL_ACTIVATEGRP', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;
            mockGroupService.reactivateById = jest.fn(() => of({})) as any;
            mockLocation.back = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

            // act
            groupDetailsPage.groupMenuClick({});

            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'FRMELEMENTS_LBL_ACTIVATEGRPQUES');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'FRMELEMENTS_BTN_ACTIVATEGRP');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'FRMELEMENTS_MSG_ACTIVATEGRPMSG');
                // expect(mockGroupService.reactivateById).toHaveBeenCalled();

                done();
            }, 0);
        });

        it('should invoked showReactivateGroupPopup for offline scenario', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                name: 'some-name',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            groupDetailsPage.userId = 'some-user-Id';
            groupDetailsPage.loggedinUser = {
                role: 'admin',
            } as any;
            mockCommonUtilService.showToast = jest.fn();
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'FRMELEMENTS_LBL_ACTIVATEGRP', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;

            // act
            groupDetailsPage.groupMenuClick({});
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'FRMELEMENTS_LBL_ACTIVATEGRPQUES');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'FRMELEMENTS_BTN_ACTIVATEGRP');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'FRMELEMENTS_MSG_ACTIVATEGRPMSG',
                    // { group_name: groupDetailsPage.groupDetails.name });
            }, 0);
            done();
        });

        it('should invoked showReactivateGroupPopup for catch part', (done) => {
            // arrange
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                name: 'some-name',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            groupDetailsPage.userId = 'some-user-Id';
            groupDetailsPage.loggedinUser = {
                role: 'creator',
            } as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'FRMELEMENTS_LBL_ACTIVATEGRP', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group',
                status: 'sample-status'
            } as any;
            mockGroupService.reactivateById = jest.fn(() => throwError({ error: 'error' })) as any;
            mockLocation.back = jest.fn();
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.groupMenuClick({});
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'FRMELEMENTS_LBL_ACTIVATEGRPQUES');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'FRMELEMENTS_BTN_ACTIVATEGRP');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'FRMELEMENTS_MSG_ACTIVATEGRPMSG');
                // expect(mockGroupService.reactivateById).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('activityMenuClick', () => {
        it('should return showRemoveActivityPopup if data is not undefined', (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { id: 'group-id', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Removing the activity takes it off from');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            groupDetailsPage.corRelationList = [{ id: 'sample-group-id', type: 'GroupId' }];
            mockGroupService.removeActivities = jest.fn(() => of({ error: { members: undefined } })) as any;
            mockGroupService.getById = jest.fn(() => of({
                groupId: 'sample-group-id', members: [{
                    groupId: '',
                    role: GroupMemberRole.ADMIN,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid',
                    name: 'SOME_NAME'
                }, {
                    groupId: '',
                    role: GroupMemberRole.MEMBER,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid',
                    name: 'SOME_NAME'
                }]
            })) as any;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockCommonUtilService.showToast = jest.fn();
            const request = {
                event: {},
                data: {
                    identifier: 'id'
                }
            };

            // act
            groupDetailsPage.activityMenuClick(request);

            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_ACTIVITY_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_ACTIVITY');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_ACTIVITY_GROUP_DESC');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.REMOVE_ACTIVITY_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.REMOVE_ACTIVITY
                );
                expect(mockGroupService.removeActivities).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(3,
                    InteractType.SUCCESS,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.REMOVE_ACTIVITY
                );
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('REMOVE_ACTIVITY_SUCCESS_MSG');
                done();
            }, 0);
        });

        it('should return showRemoveActivityPopup if data is error members', (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { id: 'group-id', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Removing the activity takes it off from');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockGroupService.removeActivities = jest.fn(() => of({ error: { activities: ['activity-1'] } })) as any;
            mockCommonUtilService.showToast = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const request = {
                event: {},
                data: {
                    identifier: 'id'
                }
            };
            // act
            groupDetailsPage.activityMenuClick(request);

            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_ACTIVITY_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_ACTIVITY');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_ACTIVITY_GROUP_DESC');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.REMOVE_ACTIVITY_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.REMOVE_ACTIVITY
                );
                expect(mockGroupService.removeActivities).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('REMOVE_ACTIVITY_ERROR_MSG');
                done();
            }, 0);
        });

        it('should not return showRemoveActivityPopup if throws error', (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { id: 'group-id', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Removing the activity takes it off from');
            mockCommonUtilService.showToast = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockGroupService.removeActivities = jest.fn(() => throwError({ error: {} })) as any;
            const request = {
                event: {},
                data: {
                    identifier: 'id'
                }
            };
            // act
            groupDetailsPage.activityMenuClick(request);

            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.REMOVE_ACTIVITY_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('REMOVE_ACTIVITY_ERROR_MSG');
                done();
            }, 0);
        });

        it('should not return showRemoveActivityPopup if data undefined', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { id: 'group-id', isLeftButtonClicked: true } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Removing the activity takes it off from');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());
            const request = {
                event: {},
                data: {
                    identifier: 'id'
                }
            };

            // act
            groupDetailsPage.activityMenuClick(request);

            // arrange
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_ACTIVITY_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_ACTIVITY');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_ACTIVITY_GROUP_DESC');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.REMOVE_ACTIVITY_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
                expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not return showRemoveActivityPopup if dismissdata is undefined', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({}))
            } as any)));
            const request = {
                event: {},
                data: {
                    identifier: 'id'
                }
            };
            // act
            groupDetailsPage.activityMenuClick(request);

            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('memberMenuClick', () => {
        it('should invoked showMakeGroupAdminPopup for offline scenario', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'MENU_MAKE_GROUP_ADMIN',
                        isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Making the group admin gives them admin permissions');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'MAKE_GROUP_ADMIN_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'MAKE_ADMIN');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'MAKE_GROUP_ADMIN_POPUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalledWith('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
                done();
            }, 0);
        });

        it('should invoked showMakeGroupAdminPopup for online scenario', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid-1'
                }
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'MENU_MAKE_GROUP_ADMIN',
                        isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Making the group admin gives them admin permissions');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockGroupService.updateMembers = jest.fn(() => of({ error: { members: undefined } }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            mockGroupService.getById = jest.fn(() => of({
                groupId: 'sample-group-id',
                members: [{
                    groupId: '',
                    role: GroupMemberRole.MEMBER,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid-1',
                    name: 'SOME_NAME'
                }, {
                    groupId: '',
                    role: GroupMemberRole.MEMBER,
                    status: GroupEntityStatus.ACTIVE,
                    userId: 'sample-uid-2',
                    name: 'SOME_NAME'
                }]
            })) as any;

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                // expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'MAKE_GROUP_ADMIN_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'MAKE_ADMIN');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'MAKE_GROUP_ADMIN_POPUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.MAKE_GROUP_ADMIN
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(3,
                    InteractType.SUCCESS,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.MAKE_GROUP_ADMIN);
                expect(mockGroupService.updateMembers).toHaveBeenCalled();
                expect(mockGroupService.getById).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoked showMakeGroupAdminPopup for error part', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'MENU_MAKE_GROUP_ADMIN',
                        isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Making the group admin gives them admin permissions');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockGroupService.updateMembers = jest.fn(() => of({
                error: {
                    members: ['member-1']
                }
            })) as any;
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'MAKE_GROUP_ADMIN_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'MAKE_ADMIN');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'MAKE_GROUP_ADMIN_POPUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.MAKE_GROUP_ADMIN_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.MAKE_GROUP_ADMIN
                );
                expect(mockGroupService.updateMembers).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(
                    'MAKE_GROUP_ADMIN_ERROR_MSG', { member_name: 'SOME_NAME' });
                done();
            }, 0);
        });

        it('should invoked showMakeGroupAdminPopup for catch part', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'MENU_MAKE_GROUP_ADMIN',
                        isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Making the group admin gives them admin permissions');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockGroupService.updateMembers = jest.fn(() => throwError({ error: {} })) as any;
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'MAKE_GROUP_ADMIN_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'MAKE_ADMIN');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'MAKE_GROUP_ADMIN_POPUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.MAKE_GROUP_ADMIN
                );
                expect(mockGroupService.updateMembers).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(
                    'MAKE_GROUP_ADMIN_ERROR_MSG', { member_name: 'SOME_NAME' });
                done();
            }, 0);
        });

        it('should invoked showRemoveMemberPopup', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'MENU_REMOVE_FROM_GROUP', isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member');
            mockCommonUtilService.translateMessage = jest.fn(() => 'permanently removes him/her from the group');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockGroupService.removeMembers = jest.fn(() => of({ error: { members: undefined } }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_MEMBER_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_MEMBER');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_MEMBER_GROUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockGroupService.removeMembers).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.REMOVE_MEMBER
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(3,
                    InteractType.SUCCESS,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.REMOVE_MEMBER);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(
                    'REMOVE_MEMBER_SUCCESS_MSG', { member_name: 'SOME_NAME' });
                done();
            }, 0);
        });

        it('should invoked showRemoveMemberPopup', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'MENU_REMOVE_FROM_GROUP', isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member');
            mockCommonUtilService.translateMessage = jest.fn(() => 'permanently removes him/her from the group');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockGroupService.removeMembers = jest.fn(() => of({ error: { members: ['member-1'] } })) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_MEMBER_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_MEMBER');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_MEMBER_GROUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockGroupService.removeMembers).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.REMOVE_MEMBER
                );
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('REMOVE_MEMBER_ERROR_MSG');
                done();
            }, 0);
        });

        it('should invoked showRemoveMemberPopup for catch part', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'MENU_REMOVE_FROM_GROUP', isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member');
            mockCommonUtilService.translateMessage = jest.fn(() => 'permanently removes him/her from the group');
            mockGroupService.removeMembers = jest.fn(() => throwError({ error: 'error' }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_MEMBER_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_MEMBER');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_MEMBER_GROUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.REMOVE_MEMBER
                );
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('REMOVE_MEMBER_ERROR_MSG');
                expect(mockGroupService.removeMembers).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoked showRemoveMemberPopup for offline scenario', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'MENU_REMOVE_FROM_GROUP', isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member');
            mockCommonUtilService.translateMessage = jest.fn(() => 'permanently removes him/her from the group');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_MEMBER_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_MEMBER');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_MEMBER_GROUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalledWith('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
                done();
            }, 0);
        });

        it('should invoked showDismissAsGroupAdminPopup', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'DISMISS_AS_GROUP_ADMIN',
                        isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dissmissing group admin removes admin permissions from the member');
            mockGroupService.updateMembers = jest.fn(() => of({}));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DISMISS_AS_GROUP_ADMIN_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'DISMISS_AS_GROUP_ADMIN');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DISMISS_AS_GROUP_ADMIN_POPUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockGroupService.updateMembers).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.DISMISS_GROUP_ADMIN);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(3,
                    InteractType.SUCCESS,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.DISMISS_GROUP_ADMIN);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(
                    'DISMISS_AS_GROUP_ADMIN_SUCCESS_MSG', { member_name: 'SOME_NAME' });
                done();
            }, 0);
        });

        it('should invoked showDismissAsGroupAdminPopup', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'DISMISS_AS_GROUP_ADMIN',
                        isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dissmissing group admin removes admin permissions from the member');
            mockGroupService.updateMembers = jest.fn(() => of({
                error: {
                    members: ['member-1']
                }
            })) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DISMISS_AS_GROUP_ADMIN_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'DISMISS_AS_GROUP_ADMIN');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DISMISS_AS_GROUP_ADMIN_POPUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockGroupService.updateMembers).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.DISMISS_GROUP_ADMIN
                );
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(
                    'DISMISS_AS_GROUP_ADMIN_ERROR_MSG', { member_name: 'SOME_NAME' });
                done();
            }, 0);
        });

        it('should invoked showDismissAsGroupAdminPopup catch part', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'DISMISS_AS_GROUP_ADMIN',
                        isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dissmissing group admin removes admin permissions from the member');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockGroupService.updateMembers = jest.fn(() => throwError({ error: 'error' }));
            mockCommonUtilService.showToast = jest.fn();

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DISMISS_AS_GROUP_ADMIN_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'DISMISS_AS_GROUP_ADMIN');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DISMISS_AS_GROUP_ADMIN_POPUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockGroupService.updateMembers).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined,
                    undefined,
                    undefined,
                    groupDetailsPage.corRelationList,
                    ID.DISMISS_GROUP_ADMIN
                );
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(
                    'DISMISS_AS_GROUP_ADMIN_ERROR_MSG', { member_name: 'SOME_NAME' });
                done();
            }, 0);
        });

        it('should invoked showDismissAsGroupAdminPopup for offline scenario', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'DISMISS_AS_GROUP_ADMIN',
                        isLeftButtonClicked: true
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dissmissing group admin removes admin permissions from the member');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DISMISS_AS_GROUP_ADMIN_POPUP_TITLE');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'DISMISS_AS_GROUP_ADMIN');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DISMISS_AS_GROUP_ADMIN_POPUP_DESC',
                    { member_name: 'SOME_NAME' });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.DISMISS_GROUP_ADMIN_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, undefined);
                expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalledWith('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
                done();
            }, 0);
        });

        it('should invoked not showDismissAsGroupAdminPopup for last else part', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedItem: 'DISMISS_AS_GROUP_ADMIN_MEMBER',
                        isLeftButtonClicked: true
                    }
                }))
            } as any)));

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return null if dismissData is undefined', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                name: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined }))
            } as any)));

            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]);

            // assert
            setTimeout(() => {
                expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    it('should return group name', () => {
        const name = 'new group';
        groupDetailsPage.extractInitial(name);
    });

    // it('should navigate To ActivityDetails page if loggeding user is admin', () => {
    //     // arrange
    //     groupDetailsPage.loggedinUser = { role: GroupMemberRole.ADMIN } as any;
    //     mockRouter.navigate = jest.fn(() => Promise.resolve(true));

    //     // act
    //     groupDetailsPage.onActivityCardClick({ data: { type: 'course' } });

    //     // assert
    //     expect(mockNavigationService.navigateTo).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.ACTIVITY_DETAILS}`], {
    //         loggedinUser: groupDetailsPage.loggedinUser,
    //         group: groupDetailsPage.groupDetails,
    //         memberList: groupDetailsPage.memberList,
    //         activity: { type: 'course' },
    //         isGroupCreatorOrAdmin: true,
    //         corRelation: groupDetailsPage.corRelationList
    //     });
    // });

    it('should not navigate To course page if loggeding user is not a admin', () => {
        // arrange
        groupDetailsPage.loggedinUser = { role: GroupMemberRole.MEMBER } as any;
        groupDetailsPage.isGroupCreatorOrAdmin = true
        groupDetailsPage.groupDetails = {
            id: 'some-id'
        } as any
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));

        // act
        groupDetailsPage.onActivityCardClick({ data: { type: 'course' } });

        // assert
        expect(mockNavigationService.navigateToDetailPage).toHaveBeenCalled()
            
    });

    describe('navigateToAddActivityPage', () => {
        it('should return activity popup', (done) => {
            mockCommonUtilService.networkInfo = {isNetworkAvailable:true};
            mockGroupService.getSupportedActivities = jest.fn(() => of({
                data: {
                    fields: [
                        {
                            index: 0,
                            title: 'COURSES',
                            desc: 'ACTIVITY_COURSE_DESC',
                            activityType: 'Content',
                            isEnabled: true,
                            filters: {
                                contentTypes: [
                                    'Course'
                                ]
                            }
                        }
                    ]
                }
            })) as any;
            groupDetailsPage.activityList = [];
            mockCommonUtilService.translateMessage = jest.fn(() => 'COURSES');
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            groupDetailsPage.navigateToAddActivityPage().then(() => {
                // assert
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBe(true);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.ADD_ACTIVITY,
                    InteractSubtype.ADD_ACTIVITY_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, ID.ADD_ACTIVITY);
                expect(mockGroupService.getSupportedActivities).toHaveBeenCalled();
                expect(mockNavigationService.navigateTo)
                    .toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.MY_GROUP_DETAILS}/${RouterLinks.ADD_ACTIVITY_TO_GROUP}`],
                        {
                            supportedActivityList: [
                                {
                                    index: 0,
                                    title: 'COURSES',
                                    desc: 'ACTIVITY_COURSE_DESC',
                                    activityType: 'Content',
                                    isEnabled: true,
                                    filters: {
                                        contentTypes: [
                                            'Course'
                                        ]
                                    }
                                }
                            ],
                            activityList: [],
                            groupId: 'sample-group-id',
                            corRelation: groupDetailsPage.corRelationList
                        });
                done();
            });
        });

        it('should not return activity popup if type is not content', (done) => {
            mockCommonUtilService.networkInfo = {isNetworkAvailable:true};
            mockGroupService.getSupportedActivities = jest.fn(() => of({
                data: {
                    fields: [
                        {
                            index: 0,
                            title: 'COURSES',
                            desc: 'ACTIVITY_COURSE_DESC',
                            activityType: 'Content',
                            isEnabled: true,
                            filters: {
                                contentTypes: [
                                    'Course'
                                ]
                            }
                        }
                    ]
                }
            })) as any;
            mockCommonUtilService.translateMessage = jest.fn(() => 'Select activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Next');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            groupDetailsPage.navigateToAddActivityPage().then(() => {
                // assert
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBe(true);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.ADD_ACTIVITY,
                    InteractSubtype.ADD_ACTIVITY_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, ID.ADD_ACTIVITY);
                expect(mockGroupService.getSupportedActivities).toHaveBeenCalled();
                done();
            });
        });

        it('should not return activity popup if type is not content and dismissData is undefined', (done) => {
            mockCommonUtilService.networkInfo = {isNetworkAvailable:true};
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockGroupService.getSupportedActivities = jest.fn(() => of({
                data: {
                    fields: [
                        {
                            index: 0,
                            title: 'COURSES',
                            desc: 'ACTIVITY_COURSE_DESC',
                            activityType: 'Content',
                            isEnabled: true,
                            filters: {
                                contentTypes: [
                                    'Course'
                                ]
                            }
                        }
                    ]
                }
            })) as any;
            mockCommonUtilService.translateMessage = jest.fn(() => 'Select activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Next');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            groupDetailsPage.corRelationList = [{ id: 'sample-group-id', type: 'GroupId' }];

            // act
            groupDetailsPage.navigateToAddActivityPage().then(() => {
                // assert
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBe(true);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.ADD_ACTIVITY,
                    InteractSubtype.ADD_ACTIVITY_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, ID.ADD_ACTIVITY);
                expect(mockGroupService.getSupportedActivities).toHaveBeenCalled();
                expect(mockNavigationService.navigateTo).toHaveBeenCalledWith(
                    [`/${RouterLinks.MY_GROUPS}/${RouterLinks.MY_GROUP_DETAILS}/${RouterLinks.ADD_ACTIVITY_TO_GROUP}`],
                    {
                        activityList: [],
                        corRelation: [
                            {
                                id: 'sample-group-id',
                                type: 'GroupId',
                            },
                        ],
                        groupId: 'sample-group-id',
                        supportedActivityList: [
                            {
                                activityType: 'Content',
                                desc: 'ACTIVITY_COURSE_DESC',
                                filters: {
                                    contentTypes: [
                                        'Course',
                                    ],
                                },
                                index: 0,
                                isEnabled: true,
                                title: 'COURSES',
                            },
                        ],
                    });
                done();
            });
        });

        it('should not go to activity page if throws error should go to catch part', (done) => {
            mockCommonUtilService.networkInfo = {isNetworkAvailable:true};
            mockGroupService.getSupportedActivities = jest.fn(() => throwError({ error: 'error' })) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            groupDetailsPage.corRelationList = [{ id: 'sample-group-id', type: 'GroupId' }];

            // act
            groupDetailsPage.navigateToAddActivityPage().then(() => {
                // assert
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBe(true);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.ADD_ACTIVITY,
                    InteractSubtype.ADD_ACTIVITY_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL,
                    undefined, undefined, undefined, groupDetailsPage.corRelationList, ID.ADD_ACTIVITY);
                expect(mockGroupService.getSupportedActivities).toHaveBeenCalled();
                done();
            });
        });

        it('should not go to activity page if network is not available', (done) => {
            mockCommonUtilService.networkInfo = {isNetworkAvailable:false};
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());

            // act
            groupDetailsPage.navigateToAddActivityPage().then(() => {
                // assert
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBe(false);
                expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalledWith('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
                done();
            });
        });
    });

    describe('getMemberName', () => {
        it('should return memberNames', () => {
            const member = {
                name: 'member',
                userId: 'sample-user-id'
            };
            groupDetailsPage.loggedinUser = {
                userId: 'sample-user-id'
            } as any;
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            groupDetailsPage.getMemberName(member);
            // assert
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('LOGGED_IN_MEMBER', { member_name: member.name });
        });

        it('should return memberNames for else part', () => {
            const member = {
                name: 'member',
                userId: 'sample-user-id'
            };
            groupDetailsPage.loggedinUser = {
                userId: 'member-user-id'
            } as any;
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            groupDetailsPage.getMemberName(member);
        });
    });
    describe('Search', () => {
        it('should return filter memberList', () => {
            mockFilterPipe.transform = jest.fn(() => []);
            groupDetailsPage.onMemberSearch('');
            expect(mockFilterPipe.transform).toHaveBeenCalled();
        });
        it('should return filtered activityList', () => {
            // assert
            groupDetailsPage.groupedActivityListMap = {
                course: [
                    { name: 'name1' },
                    { name: 'name2' }
                ]
            } as any;
            groupDetailsPage.filteredGroupedActivityListMap = {};
            // act
            groupDetailsPage.onActivitySearch('name1');
            // assert
            expect(groupDetailsPage.filteredGroupedActivityListMap).toEqual({ course: [{ name: 'name1' }] });
        });
    });

    describe('showMemberMenu', () => {
        it('should return showmenu if user role is admin', () => {
            groupDetailsPage.loggedinUser = {
                role: GroupMemberRole.ADMIN,
                userId: 'loggedin-user-id'
            } as any;
            const member = {
                userId: 'member-user-id'
            };
            groupDetailsPage.groupCreator = {
                userId: 'creator-user-id'
            } as any;
            // act
            const showMenu = groupDetailsPage.showMemberMenu(member);
            // assert
            expect(showMenu).toBeTruthy();
        });

        it('should return showmenu as false if user role is notadmin', () => {
            groupDetailsPage.loggedinUser = {
                role: GroupMemberRole.MEMBER,
                userId: 'loggedin-user-id'
            } as any;
            const member = {
                userId: 'member-user-id'
            };
            groupDetailsPage.groupCreator = {
                userId: 'creator-user-id'
            } as any;
            // act
            const showMenu = groupDetailsPage.showMemberMenu(member);
            // assert
            expect(showMenu).toBeFalsy();
        });
    });

    describe('enableDF', () => {
        beforeEach(() => {
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
        })
        it('should enable DF with appropriate request', (done) => {
            // arrange
            // const req = {
            //     cid: 'some_cid'
            // }
            // groupDetailsPage.forumDetails = req;
            mockDiscussionService.attachForum = jest.fn(() => of({}) as any)
            // act
            groupDetailsPage.enableDF()
            // assert
            setTimeout(() => {
                expect(mockDiscussionService.attachForum).toHaveBeenCalled()
                done()
            });
        })

        it('should show toast when enabling DF fails', (done) => {
            // arrange
            // const req = {
            //     cid: 'some_cid'
            // }
            // groupDetailsPage.forumDetails = req;
            mockDiscussionService.attachForum = jest.fn(() => throwError('err') as any)
            mockCommonUtilService.showToast = jest.fn();
            // act
            groupDetailsPage.enableDF()
            // assert
            setTimeout(() => {
                expect(mockDiscussionService.attachForum).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalled()
                done()
            });
        })
    })

    describe('disableDF', () => {

        beforeEach(() => {
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
        })
        it('should disable DF with appropriate request', (done) => {
            // arrange
            const req = {
                cid: 'some_cid'
            }
            groupDetailsPage.forumDetails = req;
            mockDiscussionService.removeForum = jest.fn(() => of({}) as any)
            // act
            groupDetailsPage.disableDF()
            // assert
            setTimeout(() => {
                expect(mockDiscussionService.removeForum).toHaveBeenCalledWith(
                    {
                        cid: ['some_cid']
                    }
                )
                done()
            });
        })

        it('should show toast when disabling DF fails', (done) => {
            // arrange
            const req = {
                cid: 'some_cid'
            }
            groupDetailsPage.forumDetails = req;
            mockDiscussionService.removeForum = jest.fn(() => throwError('err') as any)
            mockCommonUtilService.showToast = jest.fn();
            // act
            groupDetailsPage.disableDF()
            // assert
            setTimeout(() => {
                expect(mockDiscussionService.removeForum).toHaveBeenCalledWith(
                    {
                        cid: ['some_cid']
                    }
                );
                expect(mockCommonUtilService.showToast).toHaveBeenCalled()
                done()
            });
        })
    })

});