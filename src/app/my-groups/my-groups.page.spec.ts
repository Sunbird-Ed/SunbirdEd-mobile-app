import { MyGroupsPage } from './my-groups.page';
import { AuthService, ClassRoomService, SharedPreferences, GroupService } from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { AppHeaderService } from '@app/services/app-header.service';
import { LoginHandlerService } from '@app/services/login-handler.service';
import { CommonUtilService, AppGlobalService } from '@app/services';
import { of, throwError } from 'rxjs';
import { PreferenceKey, RouterLinks } from '../app.constant';
import { MyGroupsPopoverComponent } from '../components/popups/sb-my-groups-popover/sb-my-groups-popover.component';

describe('MyGroupsPage', () => {
    let myGroupsPage: MyGroupsPage;
    const mockAuthService: Partial<AuthService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockRouter: Partial<Router> = {};
    const mockGroupService: Partial<GroupService> = {};

    beforeAll(() => {
        myGroupsPage = new MyGroupsPage(
            mockAuthService as AuthService,
            mockGroupService as GroupService,
            mockPreferences as SharedPreferences,
            mockAppGlobalService as AppGlobalService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockLoginHandlerService as LoginHandlerService,
            mockCommonUtilService as CommonUtilService,
            mockPopoverCtrl as PopoverController
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance for myGroupesPage', () => {
        expect(myGroupsPage).toBeTruthy();
    });

    it('should return session', (done) => {
        mockAuthService.getSession = jest.fn(() => of({ sessionId: 'sample-session-id' }) as any);
        myGroupsPage.checkUserLoggedIn();
        setTimeout(() => {
            expect(mockAuthService.getSession).toHaveBeenCalled();
            expect(myGroupsPage.isGuestUser).toBeFalsy();
            done();
        }, 0);
    });

    it('should checked loggedIn or not by invoked ngOnInit', () => {
        jest.spyOn(myGroupsPage, 'checkUserLoggedIn').mockImplementation(() => {
            return Promise.resolve();
        });
        mockAppGlobalService.getCurrentUser = jest.fn(() => {});
        myGroupsPage.ngOnInit();
    });

    describe('openinfopopup', () => {
        it('should return undefined for backDrop clicked', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'ANDROID_NOT_SUPPORTED');
            mockCommonUtilService.translateMessage = jest.fn(() => 'ANDROID_NOT_SUPPORTED_DESC');
            mockCommonUtilService.translateMessage = jest.fn(() => 'INSTALL_CROSSWALK');
            myGroupsPage.openinfopopup();
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'ANDROID_NOT_SUPPORTED');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'ANDROID_NOT_SUPPORTED_DESC');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'INSTALL_CROSSWALK');
                done();
            }, 0);
        });

        it('should close popup for clicked on close icpn', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: {closeDeletePopOver: true} }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'ANDROID_NOT_SUPPORTED');
            mockCommonUtilService.translateMessage = jest.fn(() => 'ANDROID_NOT_SUPPORTED_DESC');
            mockCommonUtilService.translateMessage = jest.fn(() => 'INSTALL_CROSSWALK');
            myGroupsPage.openinfopopup();
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'ANDROID_NOT_SUPPORTED');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'ANDROID_NOT_SUPPORTED_DESC');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'INSTALL_CROSSWALK');
                done();
            }, 0);
        });

        it('should delete popup', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: {canDelete: true} }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'ANDROID_NOT_SUPPORTED');
            mockCommonUtilService.translateMessage = jest.fn(() => 'ANDROID_NOT_SUPPORTED_DESC');
            mockCommonUtilService.translateMessage = jest.fn(() => 'INSTALL_CROSSWALK');
            myGroupsPage.openinfopopup();
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'ANDROID_NOT_SUPPORTED');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'ANDROID_NOT_SUPPORTED_DESC');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'INSTALL_CROSSWALK');
                done();
            }, 0);
        });

        it('should not delete popup', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: {canDelete: false} }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'ANDROID_NOT_SUPPORTED');
            mockCommonUtilService.translateMessage = jest.fn(() => 'ANDROID_NOT_SUPPORTED_DESC');
            mockCommonUtilService.translateMessage = jest.fn(() => 'INSTALL_CROSSWALK');
            myGroupsPage.openinfopopup();
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'ANDROID_NOT_SUPPORTED');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'ANDROID_NOT_SUPPORTED_DESC');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'INSTALL_CROSSWALK');
                done();
            }, 0);
        });
    });

    it('should return popup for groupInfo', () => {
        const data = {
            name: 'groupInfo'
        };
        jest.spyOn(myGroupsPage, 'openinfopopup').mockImplementation(() => {
            return Promise.resolve();
        });
        myGroupsPage.handleHeaderEvents(data);
        expect(data.name).toBe('groupInfo');
    });

    describe('fetchGroupList', () => {
        it('should return groupList', (done) => {
            myGroupsPage.groupListLoader = true;
            mockGroupService.search = jest.fn(() => of([]));
            myGroupsPage.fetchGroupList();
            setTimeout(() => {
                expect(myGroupsPage.groupListLoader).toBeFalsy();
                done();
            }, 0);
        });

        it('should not return groupList', (done) => {
            myGroupsPage.groupListLoader = true;
            mockGroupService.search  = jest.fn(() => throwError({ error: 'error' }));
            myGroupsPage.fetchGroupList();
            setTimeout(() => {
                expect(myGroupsPage.groupListLoader).toBeFalsy();
                done();
            }, 0);
        });
    });

    it('should handled headerService and fetch group list', (done) => {
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        mockHeaderService.headerEventEmitted$ = {
            subscribe: jest.fn((fn) => fn({ name: 'sample-event' }))
        } as any;
        jest.spyOn(myGroupsPage, 'handleHeaderEvents').mockImplementation(() => {
            return;
        });
        jest.spyOn(myGroupsPage, 'fetchGroupList').mockImplementation(() => {
            return Promise.resolve();
        });
        // act
        myGroupsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
            expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
            done();
        }, 0);
    });

    describe('ionViewDidEnter', () => {
        it('should not open infoPopup if groupInfoScreen is true', (done) => {
            mockPreferences.getBoolean = jest.fn(() => of(true));
            myGroupsPage.ionViewDidEnter();
            setTimeout(() => {
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(PreferenceKey.CREATE_GROUP_INFO_POPUP);
                done();
            }, 0);
        });

        it('should return openInfoPopup by if groupInfoScreen is false', (done) => {
            mockPreferences.getBoolean = jest.fn(() => of(false));
            jest.spyOn(myGroupsPage, 'openinfopopup').mockImplementation(() => {
                return Promise.resolve();
            });
            mockPreferences.putBoolean = jest.fn(() => of(true));
            myGroupsPage.ionViewDidEnter();
            setTimeout(() => {
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(PreferenceKey.CREATE_GROUP_INFO_POPUP);
                expect(mockPreferences.putBoolean).toHaveBeenCalledWith(PreferenceKey.CREATE_GROUP_INFO_POPUP, true);
                done();
            }, 0);
        });
    });

    describe('ngOnDestroy', () => {
        it('should unsubscribe headerService', () => {
            myGroupsPage.headerObservable = {
                unsubscribe: jest.fn()
            };
            myGroupsPage.ngOnDestroy();
            expect(myGroupsPage.headerObservable).toBeTruthy();
        });

        it('should unsubscribe headerService', () => {
            myGroupsPage.headerObservable = undefined;
            myGroupsPage.ngOnDestroy();
            expect(myGroupsPage.headerObservable).toBeUndefined();
        });
    });

    it('should navigate to CREATE_EDIT_GROUP', () => {
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        myGroupsPage.createClassroom();
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.CREATE_EDIT_GROUP}`]);
    });

    it('should return loggedIn user', () => {
        mockLoginHandlerService.signIn = jest.fn(() => Promise.resolve());
        myGroupsPage.login();
        expect(mockLoginHandlerService.signIn).toHaveBeenCalledWith({ skipRootNavigation: true });
    });

    it('should navigate To GroupdetailsPage', () => {
        // arrange
        const data = {
            data: {
                id: 'sample-id'
            }
        };
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        myGroupsPage.navigateToGroupdetailsPage(data);
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.MY_GROUP_DETAILS}`],
            { state: { groupId: data.data.id } });
    });
});
