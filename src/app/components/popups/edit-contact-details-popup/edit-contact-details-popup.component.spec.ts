import { EditContactDetailsPopupComponent } from './edit-contact-details-popup.component';
import { CommonUtilService } from '../../../../services';
import { PopoverController, Platform, NavParams, MenuController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ProfileService } from '@project-sunbird/sunbird-sdk';
import { FormBuilder } from '@angular/forms';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';

describe('EditContactDetailsPopupComponent', () => {
    let editContactDetailsPopupComponent: EditContactDetailsPopupComponent;
    const mockProfileService: Partial<ProfileService> = {
        isProfileAlreadyInUse: jest.fn(),
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

    const formGroup = {} as any;
    const mockFormBuilder: Partial<FormBuilder> = {
        group: jest.fn(() => formGroup)
    };

    const mockPopoverCtrl: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockKeyBoard: Partial<Keyboard> = {
        hide: jest.fn()
    };
    const mockMenuController: Partial<MenuController> = {
        enable: jest.fn()
    };

    beforeAll(() => {
        editContactDetailsPopupComponent = new EditContactDetailsPopupComponent(
            mockProfileService as ProfileService,
            mockNavParams as NavParams,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockFormBuilder as FormBuilder,
            mockPopoverCtrl as PopoverController,
            mockKeyBoard as Keyboard,
            mockMenuController as MenuController,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of EditContactDetailsPopupComponent', () => {
        expect(editContactDetailsPopupComponent).toBeTruthy();
    });

    it('should disable the Menu drawer  and handle the back button in ionViewWillEnter ', (done) => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        // act
        editContactDetailsPopupComponent.initEditForm();
        editContactDetailsPopupComponent.ionViewWillEnter();
        // assert
        expect(mockMenuController.enable).toHaveBeenCalledWith(false);
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            done()
        }, 0);
    });

    it('should dismiss the popup when cancel is invoked', () => {
        // arrange
        // act
        editContactDetailsPopupComponent.cancel({ sourceCapabilities: true });
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({ isEdited: false });
    });

    it('should hide the keyboard when cancel is invoked', () => {
        // arrange
        // act
        editContactDetailsPopupComponent.cancel();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({ isEdited: false });

    });

    it('should enable MenuDrawer and unsubscribe back function', (done) => {
        // arrange
        editContactDetailsPopupComponent.unregisterBackButton = {
            unsubscribe: jest.fn(),
        } as any;
        // act
        editContactDetailsPopupComponent.ionViewWillLeave();
        // assert
        expect(mockMenuController.enable).toHaveBeenCalledWith(true);
        setTimeout(() => {
            expect(editContactDetailsPopupComponent.unregisterBackButton.unsubscribe).toHaveBeenCalled();
            done()
        }, 0);
    });

    it('should refresh the error values', () => {
        // arrange
        editContactDetailsPopupComponent.err = true;
        editContactDetailsPopupComponent.updateErr = true;
        editContactDetailsPopupComponent.blockedAccount = true;
        // act
        editContactDetailsPopupComponent.refreshErr();
        // assert
        expect(editContactDetailsPopupComponent.err).toBeFalsy();
        expect(editContactDetailsPopupComponent.updateErr).toBeFalsy();
        expect(editContactDetailsPopupComponent.blockedAccount).toBeFalsy();
    });

    it('should validate phone number', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        editContactDetailsPopupComponent.userId = 'sample_uid';
        editContactDetailsPopupComponent.personEditForm = { value: '1234567890' } as any;
        mockProfileService.isProfileAlreadyInUse = jest.fn(() => of({
            response: { id: 'sample_uid' }
        } as any));
        // act
        editContactDetailsPopupComponent.validate();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.getLoader().present).toHaveBeenCalled();
            expect(mockCommonUtilService.getLoader().dismiss).toHaveBeenCalled();
            expect(editContactDetailsPopupComponent.updateErr).toBeTruthy();
            done();
        }, 1);
    });

    it('should validate phone number', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        editContactDetailsPopupComponent.userId = 'sample_uid';
        editContactDetailsPopupComponent.personEditForm = { value: '1234567890' } as any;
        mockProfileService.isProfileAlreadyInUse = jest.fn(() => of({
            response: { id: 'sample_uid1' }
        } as any));
        // act
        editContactDetailsPopupComponent.validate();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.getLoader().present).toHaveBeenCalledTimes(1);
            expect(mockCommonUtilService.getLoader().dismiss).toHaveBeenCalledTimes(1);
            expect(editContactDetailsPopupComponent.err).toBeTruthy();
            done();
        }, 1);
    });

    it('should generate OTP in case of response while validate phone number', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        editContactDetailsPopupComponent.userId = 'sample_uid';
        editContactDetailsPopupComponent.personEditForm = { value: '1234567890' } as any;
        jest.spyOn(editContactDetailsPopupComponent, 'generateOTP');
        mockProfileService.isProfileAlreadyInUse = jest.fn(() => throwError({ response: { body: { params: { err: 'UOS_USRRED0013' } } } }));
        // act
        editContactDetailsPopupComponent.validate();
        // assert
        setTimeout(() => {
            expect(editContactDetailsPopupComponent.generateOTP).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should  dismiss the loader in case of  USER_ACCOUNT_BLOCKED while validate phone number', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        editContactDetailsPopupComponent.userId = 'sample_uid';
        editContactDetailsPopupComponent.personEditForm = { value: '1234567890' } as any;
        jest.spyOn(editContactDetailsPopupComponent, 'generateOTP');
        mockProfileService.isProfileAlreadyInUse = jest.fn(() => throwError(
            { response: { body: { params: { err: 'UOS_USRRED0013' } } } }));
        // act
        editContactDetailsPopupComponent.validate();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.getLoader().dismiss).toHaveBeenCalledTimes(1);
            expect(editContactDetailsPopupComponent.loader).toBeUndefined();
            done();
        }, 1);
    });

    it('should  dismiss the loader in case of  any other error while validate phone number', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        editContactDetailsPopupComponent.userId = 'sample_uid';
        editContactDetailsPopupComponent.personEditForm = { value: '1234567890' } as any;
        jest.spyOn(editContactDetailsPopupComponent, 'generateOTP');
        mockProfileService.isProfileAlreadyInUse = jest.fn(() => throwError(
            { response: { body: { params: { err: 'ANY_OTHER_ERROR' } } } }));
        // act
        editContactDetailsPopupComponent.validate();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.getLoader().dismiss).toHaveBeenCalledTimes(1);
            expect(editContactDetailsPopupComponent.loader).toBeUndefined();
            done();
        }, 1);
    });

    it('should show NETWORK ERROR popup in case of no network connection', () => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
        // act
        editContactDetailsPopupComponent.validate();
        // assert
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('INTERNET_CONNECTIVITY_NEEDED');
    });

    it('should  dismiss the popup in case of generating OTP for email', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        editContactDetailsPopupComponent.type = 'email';
        editContactDetailsPopupComponent.personEditForm = { value: { email: 'abc@email.com' } } as any;
        mockProfileService.isProfileAlreadyInUse = jest.fn(() => throwError({ response: { body: { params: { err: 'USER_NOT_FOUND' } } } }));
        mockProfileService.generateOTP = jest.fn(() => of({} as any));
        // act
        editContactDetailsPopupComponent.validate();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.getLoader().dismiss).toHaveBeenCalledTimes(1);
            expect(editContactDetailsPopupComponent.loader).toBeUndefined();
            done();
        }, 1);
    });

    it('should dismiss the popup if any error is thrown in the generateOTPAPI', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        editContactDetailsPopupComponent.type = 'email';
        editContactDetailsPopupComponent.personEditForm = { value: { email: 'abc@email.com' } } as any;
        mockProfileService.isProfileAlreadyInUse = jest.fn(() => throwError(
            { response: { body: { params: { err: 'USER_NOT_FOUND' } } } }));
        mockProfileService.generateOTP = jest.fn(() => throwError(
            { err: 'UOS_OTPCRT0059' }));
        // act

        editContactDetailsPopupComponent.validate();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.getLoader().dismiss).toHaveBeenCalledTimes(1);
            expect(editContactDetailsPopupComponent.loader).toBeUndefined();
            done();
        }, 1);
    });

    it('should poulate personEditForm', () => {
        // arrange
        editContactDetailsPopupComponent.type = 'email';
        // act
        editContactDetailsPopupComponent.initEditForm();
        // assert
        expect(editContactDetailsPopupComponent.personEditForm).toBeDefined();
    });
});
