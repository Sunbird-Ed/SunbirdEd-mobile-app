import { MyGroupsPage } from './my-groups.page';
import {
    AuthService, GroupMemberRole, SharedPreferences, GroupService, SystemSettingsService, ProfileService
} from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import { AppHeaderService } from '../../services/app-header.service';
import { LoginHandlerService } from '../../services/login-handler.service';
import {
    CommonUtilService, AppGlobalService, TelemetryGeneratorService,
    InteractType, InteractSubtype, Environment, PageId, ImpressionType
} from '../../services';
import { of, throwError } from 'rxjs';
import { PreferenceKey, RouterLinks } from '../app.constant';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { Location } from '@angular/common';

describe('MyGroupsPage', () => {
    let myGroupsPage: MyGroupsPage;
    const mockAuthService: Partial<AuthService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn()
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    fromRegistrationFlow: false
                }
            }
        })) as any
    };
    const mockGroupService: Partial<GroupService> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockPlatform: Platform<Platform> = {};
    const mockLocation: Partial<Location> = {};
    const mockSystemSettingService: Partial<SystemSettingsService> = {};
    const mockProfileService: Partial<ProfileService> = {};

    beforeAll(() => {
        myGroupsPage = new MyGroupsPage(
            mockAuthService as AuthService,
            mockGroupService as GroupService,
            mockPreferences as SharedPreferences,
            mockSystemSettingService as SystemSettingsService,
            mockProfileService as ProfileService,
            mockAppGlobalService as AppGlobalService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
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
        jest.resetAllMocks();
    });

    it('should create a instance for myGroupesPage', () => {
        expect(myGroupsPage).toBeTruthy();
    });
    describe('openAcceptGuidelinesPopup', () => {
        it('should show acceptTermsAndConditions popup', (done) => {
            // arrange
            myGroupsPage.groupTncVersion = '3.4.0';
            myGroupsPage.userId = 'sample-uid';
            mockCommonUtilService.translateMessage = jest.fn(() => 'msg');
            // mockGroupService.updateMembers = jest.fn(() => of('success') as any);
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true) as any);
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { isLeftButtonClicked: true } }))
            } as any)));
            const nanavigationExtras = {
                state: {
                    groupId: 'some_group'
                }
            }
            // act
            myGroupsPage.openAcceptGuidelinesPopup(true, nanavigationExtras);
            // expect
            setTimeout(() => {
                expect(mockProfileService.acceptTermsAndConditions).toHaveBeenCalledWith(
                    {
                        tncType: 'groupsTnc',
                        version: '3.4.0'
                    }
                );
                done();
            }, 0);
        });

        it('should fail while acceptTermsAndConditions popup', (done) => {
            // arrange
            myGroupsPage.groupTncVersion = '3.4.0';
            myGroupsPage.userId = 'sample-uid';
            mockCommonUtilService.translateMessage = jest.fn(() => 'msg');
            // mockGroupService.updateMembers = jest.fn(() => of('success') as any);
            mockProfileService.acceptTermsAndConditions = jest.fn(() => throwError('error') as any);
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { isLeftButtonClicked: true } }))
            } as any)));
            const nanavigationExtras = {
                state: {
                    groupId: 'some_group'
                }
            }
            // act
            myGroupsPage.openAcceptGuidelinesPopup(true, nanavigationExtras);
            // expect
            setTimeout(() => {
                expect(mockProfileService.acceptTermsAndConditions).toHaveBeenCalledWith(
                    {
                        tncType: 'groupsTnc',
                        version: '3.4.0'
                    }
                );
                done();
            }, 0);
        });

        it('should navigate to groupdetails after accepting guidelines', (done) => {
            // arrange
            myGroupsPage.groupTncVersion = '3.4.0';
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockCommonUtilService.translateMessage = jest.fn(() => 'msg');
            mockGroupService.updateGroupGuidelines = jest.fn(() => of('success') as any);
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true) as any);
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { isLeftButtonClicked: true } }))
            } as any)));
            const navigationExtras = {
                state: {
                    groupId: 'sample_group_id'
                }
            };

            // act
            myGroupsPage.openAcceptGuidelinesPopup(false, navigationExtras);
            // expect
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.MY_GROUP_DETAILS}`],
                    navigationExtras);
                done();
            }, 0);
        });

        it('should not navigate to groupdetails after failure in accepting guidelines', () => {
            // arrange
            myGroupsPage.groupTncVersion = '3.4.0';
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockCommonUtilService.translateMessage = jest.fn(() => 'msg');
            mockGroupService.updateMembers = jest.fn(() => throwError('error') as any);
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true) as any);
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { isLeftButtonClicked: true } }))
            } as any)));
            const navigationExtras = {
                state: {
                    groupId: 'sample_group_id'
                }
            };

            // act
            myGroupsPage.openAcceptGuidelinesPopup(false, navigationExtras);
            // expect
        });
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

    describe('handleHeaderEvents', () => {
        it('should return popup for groupInfo', () => {
            const data = {
                name: 'groupInfo'
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(myGroupsPage, 'openinfopopup').mockImplementation(() => {
                return Promise.resolve();
            });
            myGroupsPage.handleHeaderEvents(data);
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.INFORMATION_ICON_CLICKED, Environment.GROUP, PageId.MY_GROUP,
                undefined, undefined, undefined, undefined, undefined
            );
            expect(data.name).toBe('groupInfo');
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
                InteractSubtype.INFORMATION_ICON_CLICKED, Environment.GROUP, PageId.MY_GROUP,
                undefined, undefined, undefined, undefined, undefined
            );
        });

        it('should return back telemetry for back clicked', () => {
            const data = {
                name: 'back'
            };
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            // act
            myGroupsPage.handleHeaderEvents(data);
            // assert
            expect(data.name).toBe('back');
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.MY_GROUP, Environment.GROUP, true
            );
        });
    });

    describe('fetchGroupList', () => {
        it('should return groupList', (done) => {
            myGroupsPage.groupListLoader = true;
            mockGroupService.search = jest.fn(() => of([{ memberRole: GroupMemberRole.ADMIN }])) as any;
            mockCommonUtilService.extractInitial = jest.fn(() => 'extract');
            myGroupsPage.fetchGroupList();
            setTimeout(() => {
                expect(myGroupsPage.groupListLoader).toBeFalsy();
                expect(mockGroupService.search).toHaveBeenCalled();
                expect(mockCommonUtilService.extractInitial).toHaveBeenCalled();
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
                expect(mockGroupService.search).toHaveBeenCalled();
                expect(myGroupsPage.groupListLoader).toBeFalsy();
                done();
            }, 0);
        });
    });

    describe('ionViewWillEnter', () => {

        let subscribeWithPriorityData;
        beforeEach(() => {
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
            subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
        });
        it('should open openinfopopup by invoked ionViewWillEnter', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
            mockPreferences.getBoolean = jest.fn(() => of(false));
            jest.spyOn(myGroupsPage, 'openinfopopup').mockImplementation(() => {
                return Promise.resolve();
            });
            mockPreferences.putBoolean = jest.fn(() => of(true));
            // act
            myGroupsPage.ionViewWillEnter();
            // assert
            expect(myGroupsPage.isGuestUser).toBeFalsy();
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            setTimeout(() => {
                expect(subscribeWithPriorityData).toBeTruthy();
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.MY_GROUP,
                    Environment.GROUP,
                    false);
                expect(mockLocation.back).toHaveBeenCalled();
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(myGroupsPage.userId).toBe('sample-uid');
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(PreferenceKey.CREATE_GROUP_INFO_POPUP);
                done();
            }, 0);
        });
        it('should not open openinfopopup by invoked ionViewWillEnter', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
            mockPreferences.getBoolean = jest.fn(() => of(true));
            // act
            myGroupsPage.ionViewWillEnter();
            // assert
            expect(myGroupsPage.isGuestUser).toBeTruthy();
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            setTimeout(() => {
                expect(subscribeWithPriorityData).toBeTruthy();
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.MY_GROUP,
                    Environment.GROUP,
                    false);
                expect(mockLocation.back).toHaveBeenCalled();
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(myGroupsPage.userId).toBe('sample-uid');
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(PreferenceKey.CREATE_GROUP_INFO_POPUP);
                done();
            }, 0);
        });
    });

    describe('ionViewDidEnter', () => {
        it('should invoked fetchGroupList', (done) => {

            mockSbProgressLoader.hide = jest.fn(() => Promise.resolve());
            myGroupsPage.isGuestUser = false;
            jest.spyOn(myGroupsPage, 'fetchGroupList').mockImplementation(() => {
                return Promise.resolve();
            });
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // act
            myGroupsPage.ionViewDidEnter();
            // assert
            setTimeout(() => {
                expect(mockSbProgressLoader.hide).toHaveBeenCalled();
                expect(myGroupsPage.isGuestUser).toBeFalsy();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '',
                    PageId.MY_GROUP,
                    Environment.GROUP
                );
                done();
            }, 0);
        });

        it('should return only impression event for else pare', (done) => {
            mockSbProgressLoader.hide = jest.fn(() => Promise.resolve());
            myGroupsPage.isGuestUser = true;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // act
            myGroupsPage.ionViewDidEnter();
            // assert
            setTimeout(() => {
                expect(mockSbProgressLoader.hide).toHaveBeenCalled();
                expect(myGroupsPage.isGuestUser).toBeTruthy();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '',
                    PageId.MY_GROUP,
                    Environment.GROUP
                );
                done();
            }, 0);
        });
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe headerService', () => {
            myGroupsPage.headerObservable = {
                unsubscribe: jest.fn()
            };
            myGroupsPage.unregisterBackButton = { unsubscribe: jest.fn() } as any;
            myGroupsPage.ionViewWillLeave();
            expect(myGroupsPage.headerObservable).toBeTruthy();
        });

        it('should unsubscribe headerService', () => {
            myGroupsPage.headerObservable = undefined;
            myGroupsPage.unregisterBackButton = { unsubscribe: jest.fn() } as any;
            myGroupsPage.ionViewWillLeave();
            expect(myGroupsPage.headerObservable).toBeUndefined();
        });

        it('should unsubscribe unregisterBackButton', () => {
            myGroupsPage.unregisterBackButton = { unsubscribe: jest.fn() } as any;
            myGroupsPage.ionViewWillLeave();
            expect(myGroupsPage.unregisterBackButton).toBeDefined();
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

        it('should unsubscribe unregisterBackButton', () => {
            myGroupsPage.unregisterBackButton = { unsubscribe: jest.fn() } as any;
            myGroupsPage.ngOnDestroy();
            expect(myGroupsPage.unregisterBackButton).toBeDefined();
        });
    });

    it('should navigate to CREATE_EDIT_GROUP', () => {
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        myGroupsPage.createClassroom();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.SELECT_CREATE_GROUP,
            InteractSubtype.CREATE_GROUP_CLICKED,
            Environment.GROUP,
            PageId.MY_GROUP,
            undefined, undefined, undefined, undefined, InteractType.SELECT_CREATE_GROUP
        );
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.CREATE_EDIT_GROUP}`]);
    });

    it('should return loggedIn user', () => {
        mockRouter.navigate = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        myGroupsPage.login();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.LOGIN_CLICKED,
            Environment.GROUP,
            PageId.MY_GROUP,
            undefined, undefined, undefined, undefined, undefined
        );
        expect(mockRouter.navigate).
        toHaveBeenCalledWith([RouterLinks.SIGN_IN],
            {state: {skipRootNavigation: true,
                    redirectUrlAfterLogin: RouterLinks.MY_GROUPS}});
    });

    it('should navigate To GroupdetailsPage', () => {
        // arrange
        const data = {
            data: {
                id: 'sample-id',
                visited: true
            }
        };
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));

        // act
        myGroupsPage.navigateToGroupdetailsPage(data);

        // assert
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.MY_GROUPS}/${RouterLinks.MY_GROUP_DETAILS}`],
            { state: { groupId: data.data.id } });
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.SELECT_GROUP, InteractSubtype.GROUP_CLICKED, Environment.GROUP, PageId.MY_GROUP,
                { id: 'sample-id', type: 'Group', version: undefined }, undefined, undefined, undefined,
                InteractType.SELECT_GROUP
            );
    });

    it('should open groupguidelines popup', () => {
        // arrange
        const data = {
            data: {
                id: 'sample-id',
                visited: false
            }
        };
        jest.spyOn(myGroupsPage, 'openAcceptGuidelinesPopup').mockImplementation();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));

        // act
        myGroupsPage.navigateToGroupdetailsPage(data);

        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.SELECT_GROUP, InteractSubtype.GROUP_CLICKED, Environment.GROUP, PageId.MY_GROUP,
            { id: 'sample-id', type: 'Group', version: undefined }, undefined, undefined, undefined,
            InteractType.SELECT_GROUP
        );
        expect(myGroupsPage.openAcceptGuidelinesPopup).toHaveBeenCalled();
    });

    describe('goback', () => {
        it('should go to tabs page', () => {
            // arrange
            myGroupsPage.fromRegistrationFlow = true;
            // act
            myGroupsPage.goback();
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                [RouterLinks.TABS]
            );
        });
        it('should go to previous page', () => {
            // arrange
            myGroupsPage.fromRegistrationFlow = false;
            // act
            myGroupsPage.goback();
            // assert
            expect(mockLocation.back).toHaveBeenCalled();
        });
    });

    describe('checkIfUserAcceptedGuidelines', () => {
        it('should open openAcceptGuidelinesPopup if grouplist is empty', () => {
            // arrange
            myGroupsPage.groupList = ['group1'] as any;
            myGroupsPage.userId = 'sampleuserid';
            const profile = {
                allTncAccepted: {
                    groupsTnc: {
                        version: '3.4.0'
                    }
                }
            };
            const systemSetings = {
                value: JSON.stringify({
                    latestversion: '3.4.0'
                })
            };
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(profile) as any);
            jest.spyOn(myGroupsPage, 'openAcceptGuidelinesPopup').mockImplementation();
            mockSystemSettingService.getSystemSettings = jest.fn(() => of(systemSetings)) as any;
            // act
            myGroupsPage.checkIfUserAcceptedGuidelines();
            // assert
            setTimeout(() => {
                expect(myGroupsPage.openAcceptGuidelinesPopup).toHaveBeenCalled();
            });
        });

        it('should directly call  updateGroupTnc if grouplist is empty', () => {
            // arrange
            myGroupsPage.groupList = [];
            myGroupsPage.userId = 'sampleuserid';
            const profile = {
                allTncAccepted: {
                    groupsTnc: {
                        version: '3.4.0'
                    }
                }
            };
            const systemSetings = {
                value: JSON.stringify({
                    latestversion: '3.4.0'
                })
            };
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true) as any);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(profile) as any);
            mockSystemSettingService.getSystemSettings = jest.fn(() => of(systemSetings)) as any;
            // act
            myGroupsPage.checkIfUserAcceptedGuidelines();
            // assert
            setTimeout(() => {
                expect(mockProfileService.acceptTermsAndConditions).toHaveBeenCalled();
            });
        });

        it('should directly call updateGroupTnc with userid when profile is managed', () => {
            // arrange
            myGroupsPage.groupList = [];
            myGroupsPage.userId = 'sampleuserid';
            const profile = {
                allTncAccepted: {
                    groupsTnc: {
                        version: '3.4.0'
                    }
                },
                managedBy: 'some_uid'
            };
            const systemSetings = {
                value: JSON.stringify({
                    latestversion: '3.4.0'
                })
            };
            mockProfileService.getActiveProfileSession = jest.fn(() => of({uid: 'root_uid'} as any))
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true) as any);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(profile) as any);
            mockSystemSettingService.getSystemSettings = jest.fn(() => of(systemSetings)) as any;
            // act
            myGroupsPage.checkIfUserAcceptedGuidelines();
            // assert
            setTimeout(() => {
                expect(mockProfileService.acceptTermsAndConditions).toHaveBeenCalledWith(
                    {
                        userId: 'root_uid'
                    }
                );
            });
        });
    });
});
