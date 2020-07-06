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
    const mockFilterPipe: Partial<FilterPipe> = {};
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
            subscribeWithPriority: jest.fn(() => ({unsubscribe: jest.fn()})),
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

        it('should navigate to my_GROUP page', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { selectedItem: undefined } }))
            } as any)));
            groupDetailsPage.groupMenuClick();
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    });

    
});
