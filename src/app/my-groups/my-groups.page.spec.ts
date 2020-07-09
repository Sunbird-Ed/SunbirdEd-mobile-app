import { MyGroupsPage } from './my-groups.page';
import {AuthService, ClassRoomService, SharedPreferences, GroupService} from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import {Platform, PopoverController} from '@ionic/angular';
import { AppHeaderService } from '@app/services/app-header.service';
import { LoginHandlerService } from '@app/services/login-handler.service';
import {
    CommonUtilService,
    AppGlobalService,
    TelemetryGeneratorService,
    InteractType,
    InteractSubtype,
    Environment,
    PageId
} from '@app/services';
import { of, throwError } from 'rxjs';
import { PreferenceKey, RouterLinks } from '../app.constant';
import { MyGroupsPopoverComponent } from '../components/popups/sb-my-groups-popover/sb-my-groups-popover.component';
import {SbProgressLoader} from '@app/services/sb-progress-loader.service';
import {Location} from '@angular/common';

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
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockPlatform: Platform<Platform> = {};
    const mockLocation: Partial<Location> = {};

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
            mockPopoverCtrl as PopoverController,
            mockSbProgressLoader as SbProgressLoader,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockPlatform as Platform,
            mockLocation as Location
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance for myGroupesPage', () => {
        expect(myGroupsPage).toBeTruthy();
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
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { closeDeletePopOver: true } }))
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
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
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
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: false } }))
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


    it('should open openinfopopup by invoked ngOnInit', (done) => {
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
        mockPreferences.getBoolean = jest.fn(() => of(false));
        jest.spyOn(myGroupsPage, 'openinfopopup').mockImplementation(() => {
            return Promise.resolve();
        });
        mockPreferences.putBoolean = jest.fn(() => of(true));
        myGroupsPage.ngOnInit();
        setTimeout(() => {
            expect(myGroupsPage.isGuestUser).toBeTruthy();
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
            expect(myGroupsPage.userId).toBe('sample-uid');
            expect(mockPreferences.getBoolean).toHaveBeenCalledWith(PreferenceKey.CREATE_GROUP_INFO_POPUP);
            expect(mockPreferences.putBoolean).toHaveBeenCalledWith(PreferenceKey.CREATE_GROUP_INFO_POPUP, true);
            done();
        }, 0);
    });

    it('should not open openinfopopup by invoked ngOnInit', (done) => {
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
        mockPreferences.getBoolean = jest.fn(() => of(true));
        myGroupsPage.ngOnInit();
        setTimeout(() => {
            expect(myGroupsPage.isGuestUser).toBeTruthy();
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
            expect(myGroupsPage.userId).toBe('sample-uid');
            expect(mockPreferences.getBoolean).toHaveBeenCalledWith(PreferenceKey.CREATE_GROUP_INFO_POPUP);
            done();
        }, 0);
    });

    it('should return popup for groupInfo', () => {
        const data = {
            name: 'groupInfo'
        };
        jest.spyOn(myGroupsPage, 'openinfopopup').mockImplementation(() => {
            return Promise.resolve();
        });
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        myGroupsPage.handleHeaderEvents(data);
        expect(data.name).toBe('groupInfo');
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.INFORMATION_ICON_CLICKED, Environment.GROUP, PageId.MY_GROUP
        );
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
            mockGroupService.search = jest.fn(() => throwError({ error: 'error' }));
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
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData
        } as any;
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        myGroupsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(subscribeWithPriorityData).toBeTruthy();
            expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
            expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.MY_GROUP,
                Environment.GROUP,
                false);
            expect(mockLocation.back).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('ionViewDidEnter', () => {
        it('should invoked fetchGroupList', () => {
            jest.spyOn(myGroupsPage, 'fetchGroupList').mockImplementation(() => {
                return Promise.resolve();
            });
            myGroupsPage.ionViewDidEnter();
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
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        myGroupsPage.createClassroom();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.CREATE_GROUP_CLICKED,
            Environment.GROUP,
            PageId.MY_GROUP
        );
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.CREATE_EDIT_GROUP}`]);
    });

    it('should return loggedIn user', () => {
        mockLoginHandlerService.signIn = jest.fn(() => Promise.resolve());
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        myGroupsPage.login();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.LOGIN_CLICKED,
            Environment.GROUP,
            PageId.MY_GROUP
        );
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
