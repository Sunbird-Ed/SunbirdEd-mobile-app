import { AddMemberToGroupPage } from './add-member-to-group.page';
import { ProfileService, GroupService, SystemSettingsService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import {
    AppHeaderService,
    CommonUtilService,
    Environment, ID,
    InteractSubtype,
    InteractType,
    PageId,
    TelemetryGeneratorService,
    UtilityService
} from '../../../services';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { RecaptchaComponent } from 'ng-recaptcha';

describe('AddMemberToGroupPage', () => {
    let addMemberToGroupPage: AddMemberToGroupPage;
    const mockGroupService: Partial<GroupService> = {};
    const mockSystemSettingService: Partial<SystemSettingsService> = {
        getSystemSettings: jest.fn(() => of({
            value: JSON.stringify({
                isEnabled: true,
                key: 'e344ijewjee43'
            })
        })) as any
    };
    const mockPreferences: Partial<SharedPreferences> = {};
    const captchaConfig = new Map();
    // captchaConfig.set('isEnabled', true);
    // captchaConfig.set('key', 'dasewqe33414');
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getGoogleCaptchaSitekey: jest.fn(() => { }),
        setGoogleCaptchaSitekey: jest.fn(),
        showToast: jest.fn(),
        // getGoogleCaptchaConfig: jest.fn(() => captchaConfig),
        setGoogleCaptchaConfig: jest.fn(),
        networkInfo: {
            isNetworkAvailable: true
        },
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {
        backButton: {
            subscribeWithPriority: jest.fn(() => ({ data: 's-id', unsubscribe: jest.fn() })) as any,
        } as any
    };
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockProfileService: Partial<ProfileService> = {};
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
    const mockSbUtility: Partial<UtilityService> = {};

    beforeAll(() => {
        addMemberToGroupPage = new AddMemberToGroupPage(
            mockProfileService as ProfileService,
            mockGroupService as GroupService,
            mockSystemSettingService as SystemSettingsService,
            mockPreferences as SharedPreferences,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockLocation as Location,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockPopoverCtrl as PopoverController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockSbUtility as UtilityService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of addMemberToGroupPage', () => {
        expect(addMemberToGroupPage).toBeTruthy();
    });

    it('should create a instance of addMemberToGroupPage', () => {
        const captchaConfigs = new Map();
        captchaConfigs.set('isEnabled', true);
        captchaConfigs.set('key', 'dasewqe33414');
        mockCommonUtilService.getGoogleCaptchaConfig = jest.fn(() => captchaConfigs);
        addMemberToGroupPage.getGoogleCaptchaSiteKey();
        // assert
        expect(mockCommonUtilService.getGoogleCaptchaConfig).toHaveBeenCalled();
    });

    it('should call systemSettingsService if captchaConfigSize is zero', (done) => {
        const captchaConfigs = new Map();
        mockCommonUtilService.setGoogleCaptchaConfig = jest.fn();
        mockCommonUtilService.getGoogleCaptchaConfig = jest.fn(() => captchaConfigs);
        mockSystemSettingService.getSystemSettings = jest.fn(() => of(
            {
                value: JSON.stringify({
                    isEnabled: true,
                    key: 'e344ijewjee43'
                })
            }
        ));
        addMemberToGroupPage.getGoogleCaptchaSiteKey();
        // assert
        expect(mockCommonUtilService.getGoogleCaptchaConfig).toHaveBeenCalled();
        setTimeout(() => {
            expect(mockCommonUtilService.setGoogleCaptchaConfig).toHaveBeenCalledWith('e344ijewjee43', true);
            done();
        }, 0);
    });

    describe('handleBackButton', () => {
        it('should return userIdVerified', () => {
            addMemberToGroupPage.isUserIdVerified = true;
            addMemberToGroupPage.handleBackButton(true);
            expect(addMemberToGroupPage.isUserIdVerified).toBeFalsy();
        });

        it('should back to previous page', () => {
            addMemberToGroupPage.isUserIdVerified = false;
            mockLocation.back = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            addMemberToGroupPage.handleBackButton(true);
            expect(addMemberToGroupPage.isUserIdVerified).toBeFalsy();
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.ADD_MEMBER,
                Environment.GROUP,
                true, undefined, addMemberToGroupPage.corRelationList
            );
            expect(mockLocation.back).toHaveBeenCalled();
        });
    });

    it('should handle DeviceBackButton', () => {
        if (mockPlatform.backButton) {
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn({ data: 's-id', unsubscribe: jest.fn() })) as any,
            } as any;
        }
        jest.spyOn(addMemberToGroupPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        addMemberToGroupPage.handleDeviceBackButton();
    });

    it('should handle device back button', () => {
        const data = {
            name: 'back'
        };
        jest.spyOn(addMemberToGroupPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        addMemberToGroupPage.handleHeaderEvents(data);
        expect(data.name).toBe('back');
    });

    it('should show header with back button', () => {
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        mockHeaderService.headerEventEmitted$ = of({
            subscribe: jest.fn((fn) => fn({ name: 'sample-event' }))
        });
        jest.spyOn(addMemberToGroupPage, 'handleHeaderEvents').mockImplementation(() => {
            return;
        });
        jest.spyOn(addMemberToGroupPage, 'handleDeviceBackButton').mockImplementation(() => {
            return;
        });
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        // act
        addMemberToGroupPage.ionViewWillEnter();
        // assert
        expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        expect(mockHeaderService.headerEventEmitted$).not.toBeUndefined();
    });

    describe('onIonViewDidEnter', () => {

        it('should fetch from preferences and store it const variable if ' +
            'false then trigger native element click and put true in preferences again', (done) => {
                // arrange
                mockPreferences.getBoolean = jest.fn(() => of(false));
                mockPreferences.putBoolean = jest.fn();
                addMemberToGroupPage.addMemberInfoPopupRef = { nativeElement: { click: jest.fn() } };
                // act
                addMemberToGroupPage.ionViewDidEnter();
                // assert
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith('add_member_to_group_info_popup');
                setTimeout(() => {
                    expect(addMemberToGroupPage.addMemberInfoPopupRef.nativeElement.click).toHaveBeenCalled();
                    expect(mockPreferences.putBoolean).toHaveBeenCalledWith('add_member_to_group_info_popup', true);
                    done();
                }, 0);
            });

        it('should not call preferences put boolean if return value is true ', () => {
            // arrange
            mockPreferences.getBoolean = jest.fn(() => of(true));
            mockPreferences.putBoolean = jest.fn();
            // act
            addMemberToGroupPage.ionViewDidEnter();
            // assert
            expect(mockPreferences.putBoolean).not.toHaveBeenCalled();
        });
    });
    describe('onVerifyClick', () => {
        beforeEach(() => {
            addMemberToGroupPage.cap = {
                execute: jest.fn(),
                reset: jest.fn(),
                resolved: of('sample') as any
            } as Partial<RecaptchaComponent> as RecaptchaComponent;
        });
        it('should return errorMessage if userId is undefined', (done) => {
            addMemberToGroupPage.isCaptchaEnabled = true;
            addMemberToGroupPage.username = undefined;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(addMemberToGroupPage, 'getGoogleCaptchaSiteKey').mockImplementation(() => {
                return Promise.resolve({
                    isCaptchaEnabled: true,
                    captchaKey: 'site key'
                });
            });
            mockSbUtility.verifyCaptcha = jest.fn(() => Promise.resolve('api key'));
            addMemberToGroupPage.onVerifyClick();
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.VERIFY_USER,
                    InteractSubtype.VERIFY_CLICKED,
                    Environment.GROUP,
                    PageId.ADD_MEMBER,
                    undefined, undefined, undefined, addMemberToGroupPage.corRelationList,
                    ID.VERIFY_USER);
                expect(addMemberToGroupPage.username).toBeUndefined();
                expect(addMemberToGroupPage.showErrorMsg).toBeTruthy();
                done();
            }, 0);
        });

        it('should return false if captchaResponse is undefined', (done) => {
            addMemberToGroupPage.isCaptchaEnabled = false;
            addMemberToGroupPage.username = 'sample-user-name';
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(addMemberToGroupPage, 'getGoogleCaptchaSiteKey').mockImplementation(() => {
                return Promise.resolve({
                    isCaptchaEnabled: false,
                    captchaKey: 'site key'
                });
            });
            mockSbUtility.verifyCaptcha = jest.fn(() => Promise.resolve('api key'));
            mockProfileService.checkServerProfileExists = jest.fn(() => throwError(''));
            addMemberToGroupPage.onVerifyClick();
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.VERIFY_USER,
                    InteractSubtype.VERIFY_CLICKED,
                    Environment.GROUP,
                    PageId.ADD_MEMBER,
                    undefined, undefined, undefined, addMemberToGroupPage.corRelationList,
                    ID.VERIFY_USER);
                expect(addMemberToGroupPage.username).toBe('sample-user-name');
                expect(addMemberToGroupPage.showLoader).toBe(false);
                done();
            }, 0);
        });

        it('should return userDetails for serverProfile', (done) => {
            // arrange
            addMemberToGroupPage.isCaptchaEnabled = true;
            addMemberToGroupPage.username = 'sample-user-id';
            mockProfileService.checkServerProfileExists = jest.fn(() => of({
                exists: true,
                name: 'jhon'
            })) as any;
            jest.spyOn(addMemberToGroupPage, 'getGoogleCaptchaSiteKey').mockImplementation(() => {
                return Promise.resolve({
                    isCaptchaEnabled: false,
                    captchaKey: 'site key'
                });
            });
            mockSbUtility.verifyCaptcha = jest.fn(() => Promise.resolve('api key'));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            addMemberToGroupPage.onVerifyClick();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.ADD_MEMBER,
                    undefined,
                    undefined,
                    undefined,
                    addMemberToGroupPage.corRelationList,
                    ID.VERIFY_MEMBER
                );
                expect(addMemberToGroupPage.username).not.toBeUndefined();
                expect(mockProfileService.checkServerProfileExists).toHaveBeenCalled();
                expect(addMemberToGroupPage.userDetails).toStrictEqual({
                    exists: true,
                    name: 'jhon'
                });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.SUCCESS,
                    '',
                    Environment.GROUP,
                    PageId.ADD_MEMBER,
                    undefined,
                    undefined,
                    undefined,
                    addMemberToGroupPage.corRelationList,
                    ID.VERIFY_MEMBER
                );
                expect(addMemberToGroupPage.isUserIdVerified).toBeTruthy();
                done();
            }, 0);
        });

        it('should not return userDetails if serverProfile is undefined', (done) => {
            addMemberToGroupPage.username = 'sample-user-id';
            addMemberToGroupPage.isCaptchaEnabled = false;
            jest.spyOn(addMemberToGroupPage, 'getGoogleCaptchaSiteKey').mockImplementation(() => {
                return Promise.resolve({
                    isCaptchaEnabled: false,
                    captchaKey: 'site key'
                });
            });
            mockSbUtility.verifyCaptcha = jest.fn(() => Promise.reject('api key'));
            mockProfileService.checkServerProfileExists = jest.fn(() => of(undefined)) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            addMemberToGroupPage.onVerifyClick();
            // assert
            setTimeout(() => {
                expect(addMemberToGroupPage.username).not.toBeUndefined();
                expect(mockProfileService.checkServerProfileExists).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.VERIFY_USER,
                    InteractSubtype.VERIFY_CLICKED,
                    Environment.GROUP,
                    PageId.ADD_MEMBER,
                    undefined, undefined, undefined, addMemberToGroupPage.corRelationList,
                    ID.VERIFY_USER);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.ADD_MEMBER,
                    undefined, undefined, undefined,
                    addMemberToGroupPage.corRelationList,
                    ID.VERIFY_MEMBER);
                done();
            }, 0);
        });

        it('should not return userDetails for catch part', (done) => {
            addMemberToGroupPage.username = 'sample-user-id';
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockProfileService.checkServerProfileExists = jest.fn(() => throwError({ error: 'error' })) as any;
            jest.spyOn(addMemberToGroupPage, 'getGoogleCaptchaSiteKey').mockImplementation(() => {
                return Promise.resolve({
                    isCaptchaEnabled: false,
                    captchaKey: 'site key'
                });
            });
            // act
            addMemberToGroupPage.onVerifyClick();
            // assert
            setTimeout(() => {
                expect(addMemberToGroupPage.username).not.toBeUndefined();
                expect(mockProfileService.checkServerProfileExists).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.VERIFY_USER,
                    InteractSubtype.VERIFY_CLICKED,
                    Environment.GROUP,
                    PageId.ADD_MEMBER,
                    undefined, undefined, undefined, addMemberToGroupPage.corRelationList,
                    ID.VERIFY_USER);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.INITIATED,
                    '',
                    Environment.GROUP,
                    PageId.ADD_MEMBER,
                    undefined, undefined, undefined,
                    addMemberToGroupPage.corRelationList,
                    ID.VERIFY_MEMBER);
                done();
            }, 0);
        });
    });

    it('should clear all user', () => {
        addMemberToGroupPage.onClearUser();
        expect(addMemberToGroupPage.isUserIdVerified).toBeFalsy();
        expect(addMemberToGroupPage.username).toBe('');
    });

    describe('onAddToGroupClick', () => {
        it('should add member into group', (done) => {
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            addMemberToGroupPage.memberList = [
                {
                    userId: 'some-user-id'
                }
            ];
            addMemberToGroupPage.userDetails = { userId: 'sample-user-id' };
            //  GroupMemberRole.MEMBER;
            mockGroupService.addMembers = jest.fn(() => of({ error: { members: [{errorCode: 'EXCEEDED_MEMBER_MAX_LIMIT'}] } })) as any;
            mockCommonUtilService.showToast = jest.fn();
            // act
            addMemberToGroupPage.onAddToGroupClick();
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(addMemberToGroupPage.userDetails).not.toBeNull();
                expect(mockGroupService.addMembers).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should add member into group', (done) => {
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            addMemberToGroupPage.memberList = [
                {
                    userId: 'some-user-id'
                }
            ];
            addMemberToGroupPage.userDetails = { userId: 'sample-user-id' };
            mockGroupService.addMembers = jest.fn(() => of({})) as any;
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            // act
            addMemberToGroupPage.onAddToGroupClick();
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(addMemberToGroupPage.userDetails).not.toBeNull();
                expect(mockGroupService.addMembers).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('MEMBER_ADDED_TO_GROUP');
                expect(dismissFn).toHaveBeenCalled();
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not add member into group if already exists', (done) => {
            addMemberToGroupPage.memberList = [
                {
                    userId: 'sample-user-id'
                }
            ];
            addMemberToGroupPage.userDetails = { id: 'sample-user-id' };
            mockCommonUtilService.showToast = jest.fn();
            // act
            addMemberToGroupPage.onAddToGroupClick();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('MEMBER_ALREADY_EXISTS_IN_GROUP');
                done();
            }, 0);
        });

        it('should add member into group for catch part', (done) => {
            addMemberToGroupPage.memberList = [
                {
                    userId: 'some-user-id'
                }
            ];
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            addMemberToGroupPage.userDetails = { userId: 'sample-user-id' };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockGroupService.addMembers = jest.fn(() => throwError({ error: 'error' })) as any;
            mockCommonUtilService.showToast = jest.fn();
            // act
            addMemberToGroupPage.onAddToGroupClick();
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ADD_MEMBER_TO_GROUP_CLICKED,
                    Environment.GROUP,
                    PageId.ADD_MEMBER,
                    undefined, undefined, undefined, addMemberToGroupPage.corRelationList);
                expect(addMemberToGroupPage.userDetails).not.toBeNull();
                expect(mockGroupService.addMembers).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG');
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return if network is not available', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            mockCommonUtilService.presentToastForOffline = jest.fn();
            // act
            addMemberToGroupPage.onAddToGroupClick();
            // assert
            expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalledWith('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
        });
    });

    it('should unsubscribe headerService', () => {
        addMemberToGroupPage.headerObservable = {
            unsubscribe: jest.fn()
        };
        mockPlatform.backButton = {
            unsubscribe: jest.fn()
        } as any;
        addMemberToGroupPage.ionViewWillLeave();
    });

    describe('openInfoPopup', () => {
        it('should return undefined for backDrop clicked', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined }))
            } as any)));
            addMemberToGroupPage.openInfoPopup();
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should close popup for clicked on close icpn', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { closeDeletePopOver: true } }))
            } as any)));
            addMemberToGroupPage.openInfoPopup();
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should delete popup', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
            } as any)));
            addMemberToGroupPage.openInfoPopup();
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not delete popup', (done) => {
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: false } }))
            } as any)));
            addMemberToGroupPage.openInfoPopup();
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    // it('should return captchaResponse', (done) => {
    //     addMemberToGroupPage.captchaResolved('');
    //     setTimeout(() => {
    //         expect(addMemberToGroupPage.captchaResponse).toBe('');
    //         done();
    //     }, 0);
    // });
});
