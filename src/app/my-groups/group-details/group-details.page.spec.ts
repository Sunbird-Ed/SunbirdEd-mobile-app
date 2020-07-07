import { GroupDetailsPage } from './group-details.page';
import { GroupService } from '@project-sunbird/sunbird-sdk';
import { AppHeaderService, FormAndFrameworkUtilService, CommonUtilService, AppGlobalService } from '../../../services';
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
            mockFilterPipe as FilterPipe
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
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
        groupDetailsPage.handleBackButton(true);
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

    it('should handel device back button', () => {
        const data = {
            name: 'back'
        };
        jest.spyOn(groupDetailsPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        groupDetailsPage.handleHeaderEvents(data);
        expect(data.name).toBe('back');
    });

    it('should returu header with back button', (done) => {
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
        mockGroupService.getById = jest.fn(() => of({ groupId: 'sample-group-id', members: [] })) as any;
        // act
        groupDetailsPage.ionViewWillEnter();
        // assert
        expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
        setTimeout(() => {
            expect(mockGroupService.getById).toHaveBeenCalled();
            expect(groupDetailsPage.memberList).toStrictEqual([]);
            done();
        }, 0);
    });

    it('should returu header with back button', (done) => {
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

    it('should navigate To AddUserPage', () => {
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        groupDetailsPage.navigateToAddUserPage();
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.ADD_MEMBER_TO_GROUP}`],
            { state: { groupId: 'sample-group-id' } });
    });

    it('should unsubscribe registerBackButton', () => {
        groupDetailsPage.headerObservable = {
            unsubscribe: jest.fn()
        };
        groupDetailsPage.ionViewWillLeave();
        expect(groupDetailsPage.headerObservable).not.toBeUndefined();
    });

    it('should switch to tabs', () => {
        groupDetailsPage.switchTabs('courses');
        expect(groupDetailsPage.activeTab).toStrictEqual('courses');
    });

    describe('groupMenuClick', () => {
        it('should navigate to my_GROUP page', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: 'MENU_EDIT_GROUP_DETAILS' } }))
            } as any)));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            groupDetailsPage.groupMenuClick();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.CREATE_EDIT_GROUP}`]);
                done();
            }, 0);
        });

        it('should invoked showDeleteGroupPopup', (done) => {
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
            groupDetailsPage.groupMenuClick();
            // assert
            setTimeout(() => {
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

        it('should return null if selected Item is not matched or undefined', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: undefined } }))
            } as any)));
            groupDetailsPage.groupMenuClick();
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return null if data is undefined', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined }))
            } as any)));
            groupDetailsPage.groupMenuClick();
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('activityMenuClick', () => {
        it('should return showRemoveActivityPopup if data is not undefined', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { id: 'group-id' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity?');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Remove activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Removing the activity takes it off from');
            mockGroupService.removeActivities = jest.fn(() => of({}));
            // act
            groupDetailsPage.activityMenuClick(true).then(() => {
                setTimeout(() => {
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_ACTIVITY_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_ACTIVITY');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_ACTIVITY_GROUP_DESC');
                    expect(mockGroupService.removeActivities).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should not return showRemoveActivityPopup if data undefined', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined }))
            } as any)));
            // act
            groupDetailsPage.activityMenuClick(true).then(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('memberMenuClick', () => {
        it('should invoked showMakeGroupAdminPopup', (done) => {
            groupDetailsPage.memberList = [{
                userId: 'sample-uid'
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
            mockGroupService.updateMembers = jest.fn(() => of());
            groupDetailsPage.memberMenuClick(req).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'MAKE_GROUP_ADMIN_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'MAKE_ADMIN');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'MAKE_GROUP_ADMIN_POPUP_DESC',
                        { member_name: undefined });
                    expect(mockGroupService.updateMembers).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should invoked showRemoveMemberPopup', (done) => {
            groupDetailsPage.memberList = [{
                userId: 'sample-uid'
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
            mockGroupService.removeMembers = jest.fn(() => of({}));
            // act
            groupDetailsPage.memberMenuClick(req).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_MEMBER_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_MEMBER');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_MEMBER_GROUP_DESC',
                        { member_name: undefined });
                    expect(mockGroupService.removeMembers).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should invoked showRemoveMemberPopup for catch part', (done) => {
            groupDetailsPage.memberList = [{
                userId: 'sample-uid'
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
            // act
            groupDetailsPage.memberMenuClick(req).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'REMOVE_MEMBER_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'REMOVE_MEMBER');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'REMOVE_MEMBER_GROUP_DESC',
                        { member_name: undefined });
                    expect(mockGroupService.removeMembers).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should invoked showDismissAsGroupAdminPopup', (done) => {
            groupDetailsPage.memberList = [{
                userId: 'sample-uid'
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
            // act
            groupDetailsPage.memberMenuClick(req).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DISMISS_AS_GROUP_ADMIN_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'DISMISS_AS_GROUP_ADMIN');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DISMISS_AS_GROUP_ADMIN_POPUP_DESC',
                        { member_name: undefined });
                    expect(mockGroupService.updateMembers).toHaveBeenCalled();
                }, 0);
                done();
            });
        });

        it('should invoked showDismissAsGroupAdminPopup catch part', (done) => {
            groupDetailsPage.memberList = [{
                userId: 'sample-uid'
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
            mockGroupService.updateMembers = jest.fn(() => throwError({ error: 'error' }));
            // act
            groupDetailsPage.memberMenuClick(req).then((e) => {
                setTimeout(() => {
                    expect(groupDetailsPage.memberList[0].userId).toEqual(req.data.userId);
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DISMISS_AS_GROUP_ADMIN_POPUP_TITLE');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'DISMISS_AS_GROUP_ADMIN');
                    expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DISMISS_AS_GROUP_ADMIN_POPUP_DESC',
                        { member_name: undefined });
                    expect(mockGroupService.updateMembers).toHaveBeenCalled();
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
            { state: { groupId: 'sample-group-id', memberList: [{ userId: 'sample-uid' }] } });
    });

    describe('showAddActivityPopup', () => {
        it('should return activity popup', (done) => {
            mockFormAndFrameworkUtilService.invokeSupportedGroupActivitiesFormApi = jest.fn(() => Promise.resolve({}));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedVal:
                            { activityType: 'Content', activityValues: 'value' }
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Select activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Next');
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            groupDetailsPage.showAddActivityPopup().then(() => {
                // assert
                expect(mockFormAndFrameworkUtilService.invokeSupportedGroupActivitiesFormApi).toHaveBeenCalled();
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'SELECT_ACTIVITY');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'NEXT');
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SEARCH],
                    {state: {contentType: 'value', groupId: 'sample-group-id', source: 'group-detail'}});
                done();
            });
        });

        it('should not return activity popup if type is not content', (done) => {
            mockFormAndFrameworkUtilService.invokeSupportedGroupActivitiesFormApi = jest.fn(() => Promise.resolve({}));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        selectedVal:
                            { activityType: '', activityValues: 'value' }
                    }
                }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'Select activity');
            mockCommonUtilService.translateMessage = jest.fn(() => 'Next');
            // act
            groupDetailsPage.showAddActivityPopup().then(() => {
                // assert
                expect(mockFormAndFrameworkUtilService.invokeSupportedGroupActivitiesFormApi).toHaveBeenCalled();
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'SELECT_ACTIVITY');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'NEXT');
                done();
            });
        });
    });
});
