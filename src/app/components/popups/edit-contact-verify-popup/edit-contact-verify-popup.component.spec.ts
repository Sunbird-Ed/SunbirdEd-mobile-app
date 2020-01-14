import { EditContactVerifyPopupComponent } from './edit-contact-verify-popup.component';
import { CommonUtilService } from '../../../../services';
import { PopoverController, Platform, NavParams, MenuController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ProfileService } from 'sunbird-sdk';

describe('EditContactVerifyPopupComponent', () => {
    let editContactVerifyPopupComponent: EditContactVerifyPopupComponent;
    const mockProfileService: Partial<ProfileService> = {
        verifyOTP: jest.fn(() => of(undefined)),
        generateOTP: jest.fn(() => of(undefined))
    };

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'userId':
                    value = '01234567890';
                    break;
                case 'title':
                    value = 'sample_title';
                    break;
                case 'description':
                    value = 'sample_description';
                    break;
                case 'key':
                    value = 'sample_key';
                    break;
                case 'type':
                    value = 'phone';
                    break;
            }
            return value;
        })
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
        editContactVerifyPopupComponent = new EditContactVerifyPopupComponent(
            mockProfileService as ProfileService,
            mockNavParams as NavParams,
            mockPopoverCtrl as PopoverController,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockMenuController as MenuController,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of EditContactVerifyPopupComponent', () => {
        expect(editContactVerifyPopupComponent).toBeTruthy();
    });

    it('should disable the Menu drawer  and handle the back button in ionViewWillEnter ', () => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;

        editContactVerifyPopupComponent.unregisterBackButton = {
            unsubscribe: jest.fn(),
        } as any;

        // act
        editContactVerifyPopupComponent.ngOnInit();
        editContactVerifyPopupComponent.ionViewWillEnter();
        // assert
        expect(mockMenuController.enable).toHaveBeenCalledWith(false);
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });

    it('should dismiss the popup when cancel is invoked', () => {
        // arrange
        // act
        editContactVerifyPopupComponent.cancel();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({  OTPSuccess: false });
    });

    it('should enable MenuDrawer and unsubscribe back function', () => {
        // arrange
        editContactVerifyPopupComponent.unregisterBackButton = {
            unsubscribe: jest.fn(),

        } as any;
        // act
        editContactVerifyPopupComponent.ionViewWillLeave();
        // assert
        expect(mockMenuController.enable).toHaveBeenCalledWith(true);
        expect(editContactVerifyPopupComponent.unregisterBackButton.unsubscribe).toHaveBeenCalled();
    });

    it('should verify phone number', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };

        // act
        editContactVerifyPopupComponent.verify();
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({ OTPSuccess: true, value: 'sample_key' });
            done();
        }, 1);
    });

    it('should verify emailid', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        editContactVerifyPopupComponent.type = 'email';
        // act
        editContactVerifyPopupComponent.verify();
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({ OTPSuccess: true, value: 'sample_key' });
            done();
        }, 1);
    });

    it('should handle when ERROR_INVALID_OTP error is returned from API', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        mockProfileService.verifyOTP = jest.fn(() => throwError({ response: { body: { params: { err: 'ERROR_INVALID_OTP' } } } }));
        // act
        editContactVerifyPopupComponent.verify();
        // assert
        setTimeout(() => {
            expect(editContactVerifyPopupComponent.invalidOtp).toBeTruthy();
            done();
        }, 1);
    });

    it('should show  NETWORK_ERROR toast in case of no network while verifying popup', () => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
        // act
        editContactVerifyPopupComponent.verify();
        // assert
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('INTERNET_CONNECTIVITY_NEEDED');
    });

    it('should show  NETWORK_ERROR toast in case of no network in case of resending OTP', () => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
        // act
        editContactVerifyPopupComponent.resendOTP();
        // assert
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('INTERNET_CONNECTIVITY_NEEDED');
    });

    it('should resend OTP for Emailid', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        editContactVerifyPopupComponent.type = 'email';
        // act
        editContactVerifyPopupComponent.resendOTP();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('OTP_RESENT');
            expect(mockCommonUtilService.getLoader().present).toHaveBeenCalledTimes(1);
            expect(mockCommonUtilService.getLoader().dismiss).toHaveBeenCalledTimes(1);
            done();
        }, 1);
    });

    it('should dismiss the loader incase of API failure', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        editContactVerifyPopupComponent.type = 'phone';
        mockProfileService.generateOTP = jest.fn(() => throwError(
            { err: 'ERROR_RATE_LIMIT_EXCEEDED' }));
        // act
        editContactVerifyPopupComponent.resendOTP();
        // assert
        setTimeout(() => {
            expect(editContactVerifyPopupComponent.enableResend).toBeTruthy();
            expect(mockCommonUtilService.getLoader().dismiss).toHaveBeenCalledTimes(1);
            done();
        }, 1);
    });

});
