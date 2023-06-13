import { AccountRecoveryInfoComponent } from './account-recovery-id-popup.component';
import { CommonUtilService, TelemetryGeneratorService, AppGlobalService } from '../../../../services';
import { PopoverController, Platform, MenuController } from '@ionic/angular';
import { ImpressionType, Environment, PageId } from '../../../../services/telemetry-constants';
import { of, throwError } from 'rxjs';
import { ProfileService } from '@project-sunbird/sunbird-sdk';

describe('AccountRecoveryInfoComponent', () => {
    let accountRecoveryInfoComponent: AccountRecoveryInfoComponent;

    const serverProfileResponse = { response: 'SUCCESS' } as any;
    const mockProfileService: Partial<ProfileService> = {
        updateServerProfile: jest.fn(() => of(serverProfileResponse)),
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    const profile = { uid: '0123456789' } as any;
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getCurrentUser: jest.fn(() => profile)
    };

    const mockPlatform: Partial<Platform> = {
    };

    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(() => { })
    };
    const dismissFn = jest.fn(() => Promise.resolve());
    const presentFn = jest.fn(() => Promise.resolve());
    mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
    }));

    const mockPopoverCtrl: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockMenuController: Partial<MenuController> = {
        enable: jest.fn()
    };

    beforeAll(() => {
        accountRecoveryInfoComponent = new AccountRecoveryInfoComponent(
            mockProfileService as ProfileService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockCommonUtilService as CommonUtilService,
            mockPopoverCtrl as PopoverController,
            mockPlatform as Platform,
            mockMenuController as MenuController,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of EditContactDetailsPopupComponent', () => {
        expect(accountRecoveryInfoComponent).toBeTruthy();
    });

    it('should generate IMPRESSION telemtry on ngOnInit', () => {
        // arrange
        accountRecoveryInfoComponent.recoveryPhone = 'phone';
        // act
        accountRecoveryInfoComponent.ngOnInit();
        // assert
        expect(accountRecoveryInfoComponent['profile']).toEqual({ uid: '0123456789' });
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW, '',
            PageId.RECOVERY_ACCOUNT_ID_POPUP,
            Environment.USER
        );
        expect(mockMenuController.enable).toHaveBeenCalledWith(false);
    });

    it('should generate IMPRESSION telemtry on ngOnInit for recovery mail', () => {
        // arrange
        accountRecoveryInfoComponent.recoveryPhone = '';
        // act
        accountRecoveryInfoComponent.ngOnInit();
        // assert
        expect(accountRecoveryInfoComponent['profile']).toEqual({ uid: '0123456789' });
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW, '',
            PageId.RECOVERY_ACCOUNT_ID_POPUP,
            Environment.USER
        );
        expect(mockMenuController.enable).toHaveBeenCalledWith(false);
    });

    it('should  handle the back button in ionViewWillEnter ', () => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;

        accountRecoveryInfoComponent['unregisterBackButton'] = {
            unsubscribe: jest.fn(),
        } as any;

        // act
        accountRecoveryInfoComponent.ionViewWillEnter();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });

    it('should enable MenuDrawer and unsubscribe back function', (done) => {
        // arrange
        accountRecoveryInfoComponent['unregisterBackButton'] = {
            unsubscribe: jest.fn(),
        } as any;
        // act
        accountRecoveryInfoComponent.ionViewWillLeave();
        // assert
        expect(mockMenuController.enable).toHaveBeenCalledWith(true);
        setTimeout(() => {
            expect(accountRecoveryInfoComponent['unregisterBackButton'].unsubscribe).toHaveBeenCalled();
            done()
        }, 0);
    });

    it('should enable MenuDrawer and should not unsubscribe back function', () => {
        // arrange
        // accountRecoveryInfoComponent['unregisterBackButton'] = undefined;
        // act
        accountRecoveryInfoComponent.ionViewWillLeave();
        // assert
        expect(mockMenuController.enable).toHaveBeenCalledWith(true);
    });

    it('should update the server profile successfully', (done) => {
        // arrange
        accountRecoveryInfoComponent.recoveryPhone = '';
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        accountRecoveryInfoComponent.recoveryEmailForm = { value: { email: 'abc@email.com' } } as any;
        // act
        accountRecoveryInfoComponent.submitRecoveryId(accountRecoveryInfoComponent.RecoveryType.EMAIL);
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({ isEdited: true });
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should handle the error scenario incase of API failure while updating email', (done) => {
        // arrange
        accountRecoveryInfoComponent.recoveryPhone = '';
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        accountRecoveryInfoComponent.recoveryEmailForm = { value: { email: 'abc@email.com' } } as any;
        mockProfileService.updateServerProfile = jest.fn(() => throwError(
            { response: { body: { params: { err: 'UOS_USRUPD0062' } } } }));
        // act
        accountRecoveryInfoComponent.submitRecoveryId(accountRecoveryInfoComponent.RecoveryType.EMAIL);
        // assert
        setTimeout(() => {
            expect(accountRecoveryInfoComponent.sameEmailErr).toBeTruthy();
            done();
        }, 1);
    });


    it('should handle the error scenario incase of API failure while updating phone', (done) => {
        // arrange
        accountRecoveryInfoComponent.recoveryPhone = 'phone';
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        accountRecoveryInfoComponent.recoveryEmailForm = { value: { phone: '0123456789' } } as any;
        mockProfileService.updateServerProfile = jest.fn(() => throwError(
            { response: { body: { params: { err: 'UOS_USRUPD0062' } } } }));
        // act
        accountRecoveryInfoComponent.submitRecoveryId(accountRecoveryInfoComponent.RecoveryType.PHONE);
        // assert
        setTimeout(() => {
            expect(accountRecoveryInfoComponent.samePhoneErr).toBeTruthy();
            done();
        }, 1);
    });

    it('should show TOAST in case of unexpected error scenario incase of API failure while updating phone', (done) => {
        // arrange
        accountRecoveryInfoComponent.recoveryPhone = 'phone';
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        accountRecoveryInfoComponent.recoveryEmailForm = { value: { phone: '0123456789' } } as any;
        mockProfileService.updateServerProfile = jest.fn(() => throwError(
            { response: { body: { params: { err: 'ANY_OTHER_ERROR' } } } }));
        // act
        accountRecoveryInfoComponent.submitRecoveryId(accountRecoveryInfoComponent.RecoveryType.PHONE);
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG');
            done();
        }, 1);
    });

    it('should show NETWORK ERROR popup in case of no network connection', () => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
        // act
        accountRecoveryInfoComponent.submitRecoveryId(accountRecoveryInfoComponent.RecoveryType.PHONE);
        // assert
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('INTERNET_CONNECTIVITY_NEEDED');
    });

    it('should update the server profile successfully and handle any response from updateServerProfile', (done) => {
        // arrange
        accountRecoveryInfoComponent.recoveryPhone = '';
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        accountRecoveryInfoComponent.recoveryEmailForm = { value: { email: 'abc@email.com' } } as any;
        mockProfileService.updateServerProfile = jest.fn(() => of(
            { response: 'SUCCESS1' } as any));
        // act
        accountRecoveryInfoComponent.submitRecoveryId(accountRecoveryInfoComponent.RecoveryType.EMAIL);
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).not.toHaveBeenCalledWith({ isEdited: true });
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).not.toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should dismiss the popup when cancel is clicked', () => {
        // arrange
        // act
        accountRecoveryInfoComponent.cancel();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({ isEdited: false });
    });

    it('should reset the error properties', () => {
        // arrange
        accountRecoveryInfoComponent.sameEmailErr = true;
        // act
        accountRecoveryInfoComponent.removeSameRecoveryIdErr(accountRecoveryInfoComponent.RecoveryType.EMAIL);
        // assert
        expect(accountRecoveryInfoComponent.sameEmailErr).toBeFalsy();

        // arrange
        accountRecoveryInfoComponent.samePhoneErr = true;
        // act
        accountRecoveryInfoComponent.removeSameRecoveryIdErr(accountRecoveryInfoComponent.RecoveryType.PHONE);
        // assert
        expect(accountRecoveryInfoComponent.samePhoneErr).toBeFalsy();
    });


});
