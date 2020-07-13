import { GroupDetailsPage } from './group-details.page';
import { GroupService, GroupMemberRole, GroupEntityStatus } from '@project-sunbird/sunbird-sdk';
import {
    AppHeaderService,
    FormAndFrameworkUtilService,
    CommonUtilService,
    AppGlobalService,
    TelemetryGeneratorService, ImpressionType, PageId, Environment, InteractType, InteractSubtype, ID
} from '../../../services';
import { Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { RouterLinks } from '../../app.constant';

describe('GroupDetailsPage', () => {
    let groupDetailsPage: GroupDetailsPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockFilterPipe: Partial<FilterPipe> = {
        transform: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
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

    beforeAll(() => {
        groupDetailsPage = new GroupDetailsPage(
            mockGroupService as GroupService,
            mockAppGlobalService as AppGlobalService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockLocation as Location,
            mockPlatform as Platform,
            mockPopoverCtrl as PopoverController,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockCommonUtilService as CommonUtilService,
            mockFilterPipe as FilterPipe,
            mockTelemetryGeneratorService as TelemetryGeneratorService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of groupDetailsPage', () => {
        expect(groupDetailsPage).toBeTruthy();
    });

    it('should return active profile uid', () => {
        mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
        groupDetailsPage.ngOnInit();
        expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
    });

    it('should navigate to previous page', () => {
        mockLocation.back = jest.fn();
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        groupDetailsPage.handleBackButton(true);
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.GROUP_DETAIL, Environment.GROUP, true);
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

    it('should return header with back button', (done) => {
        groupDetailsPage.userId = 'sample-uid';
        const dismissFn = jest.fn(() => Promise.resolve());
        const presentFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
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
        mockGroupService.getById = jest.fn(() => of({
            groupId: 'sample-group-id', members: [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                username: 'SOME_NAME'
            }]
        })) as any;
        // act
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        groupDetailsPage.ionViewWillEnter();
        // assert
        expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW,
            '',
            PageId.GROUP_DETAIL,
            Environment.GROUP
        );
        setTimeout(() => {
            expect(presentFn).toHaveBeenCalled();
            expect(dismissFn).toHaveBeenCalled();
            expect(mockGroupService.getById).toHaveBeenCalled();
            expect(groupDetailsPage.memberList).toStrictEqual([{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                username: 'SOME_NAME'
            }]);
            done();
        }, 0);
    });

    it('should return header with back button in error case', (done) => {
        const dismissFn = jest.fn(() => Promise.resolve());
        const presentFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
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
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        // act
        groupDetailsPage.ionViewWillEnter();
        // assert
        expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW,
            '',
            PageId.GROUP_DETAIL,
            Environment.GROUP
        );
        setTimeout(() => {
            expect(presentFn).toHaveBeenCalled();
            expect(dismissFn).toHaveBeenCalled();
            expect(mockGroupService.getById).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should navigate To AddUserPage', () => {
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        groupDetailsPage.navigateToAddUserPage();
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.ADD_MEMBER_TO_GROUP}`],
            {
                state: {
                    groupId: 'sample-group-id', memberList: [{
                        groupId: '',
                        role: 'member',
                        status: 'active',
                        userId: 'sample-uid',
                        username: 'SOME_NAME',
                    }]
                }
            });
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.ADD_MEMBER_CLICKED,
            Environment.GROUP,
            PageId.GROUP_DETAIL);
    });

    it('should unsubscribe registerBackButton', () => {
        groupDetailsPage.headerObservable = {
            unsubscribe: jest.fn()
        };
        groupDetailsPage.ionViewWillLeave();
        expect(groupDetailsPage.headerObservable).not.toBeUndefined();
    });

    it('should switch to tabs', () => {
        groupDetailsPage.switchTabs('activities');
        expect(groupDetailsPage.activeTab).toStrictEqual('activities');
    });

    describe('groupMenuClick', () => {
        it('should navigate to my_GROUP page', (done) => {
            groupDetailsPage.userId = 'some-userId';
            groupDetailsPage.groupCreator = {
                userId: 'some-userId',
                username: 'some-username',
                groupId: 'some-groupId',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_EDIT_GROUP_DETAILS' } }))
            } as any)));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            groupDetailsPage.groupMenuClick({});
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.CREATE_EDIT_GROUP}`]);
                done();
            }, 0);
        });

        it('should invoked showDeleteGroupPopup', (done) => {
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_DELETE_GROUP' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group'
            } as any;
            mockGroupService.deleteById = jest.fn(() => of({})) as any;
            mockLocation.back = jest.fn();
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
                done();
            }, 0);
        });

        it('should invoked showDeleteGroupPopup for catch part', (done) => {
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_DELETE_GROUP' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'delete group popup title');
            groupDetailsPage.groupDetails = {
                name: 'sample-group'
            } as any;
            mockGroupService.deleteById = jest.fn(() => throwError({ error: 'error' })) as any;
            mockLocation.back = jest.fn();
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
                username: 'some-username',
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
    });

    describe('activityMenuClick', () => {
        it('should return showRemoveActivityPopup if data is not undefined', (done) => {
            const request = {
                id: 'sample-id'
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { id: 'group-id' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Removing the activity takes it off from');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.removeActivities = jest.fn(() => of({ error: { members: undefined } })) as any;
            // act
            groupDetailsPage.activityMenuClick(true, request).then(() => {
                setTimeout(() => {
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_ACTIVITY_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_ACTIVITY');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_ACTIVITY_GROUP_DESC');
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.REMOVE_ACTIVITY
                    );
                    expect(mockGroupService.removeActivities).toHaveBeenCalled();
                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalledWith();
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                        InteractType.SUCCESS,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.REMOVE_ACTIVITY
                    );
                }, 0);
                done();
            });
        });

        it('should return showRemoveActivityPopup if data is error members', (done) => {
            const request = {
                id: 'sample-id'
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { id: 'group-id' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Removing the activity takes it off from');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.removeActivities = jest.fn(() => of({ error: { members: ['member-1'] } })) as any;
            // act
            groupDetailsPage.activityMenuClick(true, request).then(() => {
                setTimeout(() => {
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_ACTIVITY_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_ACTIVITY');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_ACTIVITY_GROUP_DESC');
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.REMOVE_ACTIVITY
                    );
                    expect(mockGroupService.removeActivities).toHaveBeenCalled();
                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalledWith();
                }, 0);
                done();
            });
        });

        it('should not return showRemoveActivityPopup if data undefined', (done) => {
            const request = {
                id: 'sample-id'
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { id: 'group-id' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Removing the activity takes it off from');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.removeActivities = jest.fn(() => throwError({ error: {} })) as any;
            // act
            groupDetailsPage.activityMenuClick(true, request).then(() => {
                setTimeout(() => {
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_ACTIVITY_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_ACTIVITY');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_ACTIVITY_GROUP_DESC');
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.REMOVE_ACTIVITY
                    );
                    expect(mockGroupService.removeActivities).toHaveBeenCalled();
                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalledWith();
                }, 0);
                done();
            });
        });
    });

    describe('memberMenuClick', () => {
        it('should invoked showMakeGroupAdminPopup', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                username: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_MAKE_GROUP_ADMIN' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Making the group admin gives them admin permissions');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.updateMembers = jest.fn(() => of({ error: { members: undefined } }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'MAKE_GROUP_ADMIN_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'MAKE_ADMIN');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'MAKE_GROUP_ADMIN_POPUP_DESC',
                        { member_name: undefined });
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.MAKE_GROUP_ADMIN
                    );
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                        InteractType.SUCCESS,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.MAKE_GROUP_ADMIN);
                    expect(mockGroupService.updateMembers).toHaveBeenCalled();
                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalledWith();
                }, 0);
                done();
            });
        });

        it('should invoked showMakeGroupAdminPopup for error part', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.ADMIN,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                username: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_MAKE_GROUP_ADMIN' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Making the group admin gives them admin permissions');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.updateMembers = jest.fn(() => of({
                error: {
                    members: ['member-1']
                }
            })) as any;
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'MAKE_GROUP_ADMIN_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'MAKE_ADMIN');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'MAKE_GROUP_ADMIN_POPUP_DESC',
                        { member_name: undefined });
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.MAKE_GROUP_ADMIN
                    );
                    expect(mockGroupService.updateMembers).toHaveBeenCalled();
                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalledWith();
                }, 0);
                done();
            });
        });

        it('should invoked showMakeGroupAdminPopup for catch part', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                username: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_MAKE_GROUP_ADMIN' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Make admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Making the group admin gives them admin permissions');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.updateMembers = jest.fn(() => throwError({ error: {} })) as any;
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'MAKE_GROUP_ADMIN_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'MAKE_ADMIN');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'MAKE_GROUP_ADMIN_POPUP_DESC',
                        { member_name: undefined });
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.MAKE_GROUP_ADMIN
                    );
                    expect(mockGroupService.updateMembers).toHaveBeenCalled();
                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalledWith();
                }, 0);
                done();
            });
        });

        it('should invoked showRemoveMemberPopup', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                username: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_REMOVE_FROM_GROUP' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member');
            mockCommonUtilService.translateMessage = jest.fn(() => 'permanently removes him/her from the group');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.removeMembers = jest.fn(() => of({ error: { members: undefined } }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_MEMBER_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_MEMBER');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_MEMBER_GROUP_DESC',
                        { member_name: undefined });
                    expect(mockGroupService.removeMembers).toHaveBeenCalled();
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.REMOVE_MEMBER
                    );
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                        InteractType.SUCCESS,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.REMOVE_MEMBER);
                    expect(mockGroupService.updateMembers).toHaveBeenCalled();
                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalledWith();
                }, 0);
                done();
            });
        });

        it('should invoked showRemoveMemberPopup', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                username: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_REMOVE_FROM_GROUP' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member');
            mockCommonUtilService.translateMessage = jest.fn(() => 'permanently removes him/her from the group');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.removeMembers = jest.fn(() => of({ error: { members: ['member-1'] } })) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_MEMBER_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_MEMBER');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_MEMBER_GROUP_DESC',
                        { member_name: undefined });
                    expect(mockGroupService.removeMembers).toHaveBeenCalled();
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.REMOVE_MEMBER
                    );
                    expect(mockGroupService.updateMembers).toHaveBeenCalled();
                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalledWith();
                }, 0);
                done();
            });
        });

        it('should invoked showRemoveMemberPopup for catch part', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                username: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_REMOVE_FROM_GROUP' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove member');
            mockCommonUtilService.translateMessage = jest.fn(() => 'permanently removes him/her from the group');
            mockGroupService.removeMembers = jest.fn(() => throwError({ error: 'error' }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_MEMBER_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_MEMBER');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_MEMBER_GROUP_DESC',
                        { member_name: undefined });
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.REMOVE_MEMBER
                    );

                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalledWith();
                    expect(mockGroupService.removeMembers).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should invoked showDismissAsGroupAdminPopup', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                username: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'DISMISS_AS_GROUP_ADMIN' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dissmissing group admin removes admin permissions from the member');
            mockGroupService.updateMembers = jest.fn(() => of({}));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DISMISS_AS_GROUP_ADMIN_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'DISMISS_AS_GROUP_ADMIN');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DISMISS_AS_GROUP_ADMIN_POPUP_DESC',
                        { member_name: undefined });
                    expect(mockGroupService.updateMembers).toHaveBeenCalled();
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.DISMISS_GROUP_ADMIN
                    );
                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalled();
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                        InteractType.SUCCESS,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.DISMISS_GROUP_ADMIN
                    );
                }, 0);
                done();
            });
        });

        it('should invoked showDismissAsGroupAdminPopup', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                username: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'DISMISS_AS_GROUP_ADMIN' } }))
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
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DISMISS_AS_GROUP_ADMIN_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'DISMISS_AS_GROUP_ADMIN');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DISMISS_AS_GROUP_ADMIN_POPUP_DESC',
                        { member_name: undefined });
                    expect(mockGroupService.updateMembers).toHaveBeenCalled();
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.DISMISS_GROUP_ADMIN
                    );
                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should invoked showDismissAsGroupAdminPopup catch part', (done) => {
            groupDetailsPage.memberList = [{
                groupId: '',
                role: GroupMemberRole.MEMBER,
                status: GroupEntityStatus.ACTIVE,
                userId: 'sample-uid',
                username: 'SOME_NAME'
            }];
            const req = {
                data: {
                    userId: 'sample-uid'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'DISMISS_AS_GROUP_ADMIN' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dismiss as group admin');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Dissmissing group admin removes admin permissions from the member');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.updateMembers = jest.fn(() => throwError({ error: 'error' }));
            // act
            groupDetailsPage.memberMenuClick(req, groupDetailsPage.memberList[0]).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DISMISS_AS_GROUP_ADMIN_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'DISMISS_AS_GROUP_ADMIN');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DISMISS_AS_GROUP_ADMIN_POPUP_DESC',
                        { member_name: undefined });
                    expect(mockGroupService.updateMembers).toHaveBeenCalled();
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                        InteractType.INITIATED,
                        '',
                        Environment.GROUP,
                        PageId.GROUP_DETAIL,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ID.DISMISS_GROUP_ADMIN
                    );
                    expect(presentFn).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalled();
                }, 0);
                done();
            });
        });
    });

    // it('should return search text', () => {
    //     const request = 'search-text';
    //     mockFilterPipe.transform = jest.fn();
    //     groupDetailsPage.onSearch(request);
    //     expect(groupDetailsPage.searchValue).toBe(request);
    //     expect(mockFilterPipe.transform).toHaveBeenCalled();
    // });

    it('should return group name', () => {
        const name = 'new group';
        groupDetailsPage.extractInitial(name);
    });

    it('should navigate To ActivityDetails page', () => {
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        groupDetailsPage.navigateToActivityDetails('');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.ACTIVITY_DETAILS}`],
            {
                state: {
                    groupId: 'sample-group-id', memberList: [{
                        groupId: '',
                        role: GroupMemberRole.MEMBER,
                        status: GroupEntityStatus.ACTIVE,
                        userId: 'sample-uid',
                        username: 'SOME_NAME'
                    }]
                }
            });
    });

    describe('showAddActivityPopup', () => {
        it('should return activity popup', (done) => {
            mockFormAndFrameworkUtilService.invokeSupportedGroupActivitiesFormApi = jest.fn(() => Promise.resolve({}));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedVal: {
                            index: 0,
                            title: 'ACTIVITY_COURSE_TITLE',
                            desc: 'ACTIVITY_COURSE_DESC',
                            activityType: 'Content',
                            isEnabled: true,
                            filters: {
                                contentTypes: [
                                    'Course'
                                ]
                            }
                        }
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Select activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Next');
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            groupDetailsPage.showAddActivityPopup().then(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ADD_ACTIVITY_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL);
                expect(mockFormAndFrameworkUtilService.invokeSupportedGroupActivitiesFormApi).toHaveBeenCalled();
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'SELECT_ACTIVITY');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'NEXT');
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SEARCH],
                    {
                        state: {
                            activityFilters: {
                                contentTypes: [
                                    'Course'
                                ]
                            }, groupId: 'sample-group-id', source: 'group-detail'
                        }
                    });
                done();
            });
        });

        it('should not return activity popup if type is not content', (done) => {
            mockFormAndFrameworkUtilService.invokeSupportedGroupActivitiesFormApi = jest.fn(() => Promise.resolve({}));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedVal: {
                            index: 0,
                            title: 'ACTIVITY_COURSE_TITLE',
                            desc: 'ACTIVITY_COURSE_DESC',
                            activityType: 'Content',
                            isEnabled: true,
                            filters: {
                                contentTypes: [
                                    'Course'
                                ]
                            }
                        }
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Select activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Next');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            groupDetailsPage.showAddActivityPopup().then(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ADD_ACTIVITY_CLICKED,
                    Environment.GROUP,
                    PageId.GROUP_DETAIL);
                expect(mockFormAndFrameworkUtilService.invokeSupportedGroupActivitiesFormApi).toHaveBeenCalled();
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'SELECT_ACTIVITY');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'NEXT');
                done();
            });
        });
    });
});
