import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { CommonUtilService } from '../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { AppHeaderService } from '../../../services/app-header.service';
import { LogoutHandlerService } from '../../../services/handlers/logout-handler.service';
import {
    SystemSettingsService,
    ProfileService,
    GenerateOtpRequest,
    VerifyOtpRequest,
} from '@project-sunbird/sunbird-sdk';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    Environment,
    InteractType,
    InteractSubtype,
    PageId,
    ID
} from '../../../services/telemetry-constants';

@Component({
    selector: 'app-delete-account',
    templateUrl: './delete-account.page.html',
    styleUrls: ['./delete-account.page.scss'],
    standalone: false
})
export class DeleteAccountPage implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();

    profile: any = {};
    conditions: string[] = [];
    checkedConditions: string[] = [];
    enableSubmitBtn = false;
    isLoading = false;
    skipOtpVerification = false;
    showOtpModal = false;
    otpData: any = {};
    otpValue: string = '';
    headerConfig: any;

    enableResendButton = false;
    disableResendButton = false;
    resendOtpCounter = 0;
    maxResendTry = 4;
    resendOTPbtn = '';
    counter = 0;
    resendInterval: any;

    remainingAttempts: number = 0;
    otpErrorMessage = '';
    maxAttemptsReached = false;
    deleteConditions = [
        "Personal Information: Your personal account information, including your profile and login details, will be permanently deleted, including your activity history. This information cannot be recovered",
        "Certificates: For certificate verification purposes, only your name will be stored",
        "Access Loss: You will lose access to all features and services associated with this account, and any subscriptions or memberships may be terminated.",
        "Single Sign-On (SSO): If you use Single Sign-On (SSO) to sign in, be aware that a new account will be created the next time you sign in. This new account will not have any historical information.",
        "Resource Retention: Even after your account is deleted, any contributions, content, or resources you have created within the portal will not be deleted. These will remain accessible to other users as part of the collective content.You will no longer have control or management rights over them.",
        "Usage Reports: Usage reports will retain location data declared by you.",
        "Make sure you have backed up any important data and have considered the consequences before confirming account deletion and downloaded your certificates."
    ];

    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
        private router: Router,
        private navCtrl: NavController,
        private alertCtrl: AlertController,
        private commonUtilService: CommonUtilService,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private headerService: AppHeaderService,
        private logoutHandler: LogoutHandlerService
    ) {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras?.state) {
            this.profile = navigation.extras.state.profile;
        }
    }

    async ngOnInit() {
        await this.initializeProfile();
        this.setupHeader();
        this.checkOtpVerificationSetting();
        this.generateTelemetry();
        this.clearAllConditions();

        this.resendOTPbtn = 'Resend OTP';
    }

    ionViewWillEnter() {
        this.clearAllConditions();
    }

    ionViewWillLeave() {
        this.clearAllConditions();
        this.otpValue = '';
        this.showOtpModal = false;
        this.clearResendTimer();
        this.otpErrorMessage = '';
        this.remainingAttempts = 0;
        this.maxAttemptsReached = false;
    } ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.clearResendTimer();
    }

    private async initializeProfile() {
        if (!this.profile || !this.profile.userId) {
            try {
                const session = await this.profileService.getActiveProfileSession().toPromise();
                if (session) {
                    this.profile = session;
                } else {
                    this.goBack();
                }
            } catch (error) {
                console.error('Error getting profile session:', error);
                this.goBack();
            }
        }
    }

    private setupHeader() {
        this.headerConfig = this.headerService.getDefaultPageConfig();
        this.headerConfig.actionButtons = [];
        this.headerConfig.showHeader = true;
        this.headerConfig.showBurgerMenu = false;
        this.headerConfig.title = 'Delete Account';
        this.headerService.updatePageConfig(this.headerConfig);
    } private generateTelemetry() {
        this.telemetryGeneratorService.generateImpressionTelemetry(
            InteractType.OTHER,
            '',
            PageId.PROFILE,
            Environment.USER
        );
    }

    private checkOtpVerificationSetting() {
        const request = {
            id: 'verifyOtpOnDelete',
            field: 'verifyOtpOnDelete'
        };

        this.systemSettingsService.getSystemSettings(request)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (response) => {
                    if (response && response.value === 'false') {
                        this.skipOtpVerification = true;
                    } else {
                        this.skipOtpVerification = false;
                    }
                },
                (error) => {
                    console.error('Error getting system settings:', error);
                    this.skipOtpVerification = false;
                }
            );
    }

    onConditionChange(condition: string, isChecked: boolean) {
        if (isChecked) {
            if (!this.checkedConditions.includes(condition)) {
                this.checkedConditions.push(condition);
            }
        } else {
            const index = this.checkedConditions.indexOf(condition);
            if (index > -1) {
                this.checkedConditions.splice(index, 1);
            }
        }

        this.enableSubmitBtn = this.checkedConditions.length === this.deleteConditions.length;
    }

    private clearAllConditions() {
        this.checkedConditions = [];
        this.enableSubmitBtn = false;
    }
    async onSubmit() {
        if (!this.enableSubmitBtn) {
            await this.commonUtilService.showToast('Please accept all conditions to proceed');
            return;
        }

        this.generateSubmitTelemetry()

        this.clearAllConditions();
        if (this.skipOtpVerification) {
            await this.confirmDirectDelete();
        } else {
            await this.initiateOtpFlow();
        }
    }

    private async confirmDirectDelete() {
        const alert = await this.alertCtrl.create({
            header: 'Confirm Delete Account',
            message: 'Are you sure you want to delete your account? This action cannot be undone.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Delete',
                    handler: () => this.deleteAccount()
                }
            ]
        });

        await alert.present();
    } private async initiateOtpFlow() {
        let contactType = '';
        let contactValue = '';

        if (this.profile.maskedEmail || this.profile.email) {
            contactType = 'email';
            contactValue = this.profile.maskedEmail || this.profile.email;
        } else if (this.profile.maskedPhone || this.profile.phone) {
            contactType = 'phone';
            contactValue = this.profile.maskedPhone || this.profile.phone;
        } else {
            await this.commonUtilService.showToast('No contact information available for OTP verification');
            return;
        }

        this.otpData = {
            type: contactType,
            value: contactValue,
            userId: this.profile.userId,
            instructions: contactType === 'phone'
                ? 'An OTP has been sent you your registered mobile number. Please enter the OTP to proceed with account deletion.'
                : 'An OTP has been sent you your registered email. Please enter the OTP to proceed with account deletion',
            retryMessage: 'Unable to delete account. Please try again later.',
            wrongOtpMessage: contactType === 'phone'
                ? 'Invalid OTP. Please check the OTP sent to your mobile number.'
                : 'Invalid OTP. Please check the OTP sent to your email address.'
        }; await this.presentOtpPopover();
    }

    private async generateOTP() {
        const loader = await this.commonUtilService.getLoader();
        await loader.present();

        try {
            const generateOtpRequest: GenerateOtpRequest = {
                key: this.otpData.type === 'email' ? this.profile.email : this.profile.phone,
                type: this.otpData.type,
                userId: this.profile.userId
            };

            await this.profileService.generateOTP(generateOtpRequest).toPromise();
            console.log('OTP generated successfully:', generateOtpRequest);


            await loader.dismiss();
            this.showOtpModal = true;

            this.otpErrorMessage = '';
            this.maxAttemptsReached = false;

            this.resendOtpEnablePostTimer();
        } catch (error) {
            await loader.dismiss();
            console.error('Error generating OTP:', error);
            await this.commonUtilService.showToast('Failed to generate OTP. Please try again.');
        }
    }

    private resendOtpEnablePostTimer() {
        this.counter = 30;
        this.disableResendButton = false;
        this.enableResendButton = false;

        if (this.resendInterval) {
            clearInterval(this.resendInterval);
        }

        this.resendInterval = setInterval(() => {
            this.counter--;

            if (this.counter > 0) {
                this.resendOTPbtn = `Resend OTP in ${this.counter} seconds`;
            } else {
                this.enableResendButton = true;
                this.resendOTPbtn = 'Resend OTP';
                clearInterval(this.resendInterval);
            }
        }, 1000);
    }

    async resendOTP() {
        if (!this.enableResendButton) {
            return;
        }

        this.resendOtpCounter = this.resendOtpCounter + 1;

        if (this.resendOtpCounter >= this.maxResendTry) {
            this.disableResendButton = false;
            await this.commonUtilService.showToast('Maximum OTP resend attempts reached. Please try again later.');
            return false;
        }

        this.otpValue = '';

        this.otpErrorMessage = '';
        this.remainingAttempts = 0;
        this.maxAttemptsReached = false;

        try {
            const generateOtpRequest: GenerateOtpRequest = {
                key: this.otpData.type === 'email' ? this.profile.email : this.profile.phone,
                type: this.otpData.type,
                userId: this.profile.userId
            };

            await this.profileService.generateOTP(generateOtpRequest).toPromise();

            this.resendOtpEnablePostTimer();
            await this.commonUtilService.showToast('OTP has been resent successfully');
        } catch (error) {
            console.error('Error resending OTP:', error);
            await this.commonUtilService.showToast('Failed to resend OTP. Please try again.');
        }

        return true;
    } private async presentOtpPopover() {
        await this.generateOTP();
    }

    async verifyOtpAndDelete() {
        await this.onOtpVerificationSuccess(null);
    }

    async onOtpVerificationSuccess(data: any) {
        if (!this.otpValue) {
            await this.commonUtilService.showToast('Please enter the OTP');
            return;
        }

        if (this.maxAttemptsReached) {
            await this.commonUtilService.showToast('Max attempts limit reached. Cannot delete account.');
            return;
        }

        const loader = await this.commonUtilService.getLoader();
        await loader.present();

        try {
            const verifyOtpRequest: VerifyOtpRequest = {
                key: this.otpData.type === 'email' ? this.profile.email : this.profile.phone,
                type: this.otpData.type,
                otp: `${this.otpValue}`,
                userId: this.profile.userId
            };

            await this.profileService.verifyOTP(verifyOtpRequest).toPromise();

            await loader.dismiss();
            this.showOtpModal = false;
            this.clearResendTimer();

            this.otpErrorMessage = '';
            this.remainingAttempts = 0;
            this.maxAttemptsReached = false;

            await this.deleteAccount();

        } catch (error) {
            await loader.dismiss();
            console.error('OTP verification failed:', error);

            if (error?.response?.body?.result?.remainingAttempt === 0) {
                this.maxAttemptsReached = true;
                this.otpErrorMessage = 'Max attempts limit reached';
                await this.commonUtilService.showToast('Max attempts limit reached. Cannot delete account.');
            } else if (error?.response?.body?.result?.remainingAttempt !== undefined) {
                this.otpValue = '';

                this.remainingAttempts = error.response.body.result.remainingAttempt;

                const isOtpVerificationFailed = error?.response?.body?.params?.err === 'UOS_OTPVERFY0063' ||
                    error?.response?.body?.params?.status === 'OTP_VERIFICATION_FAILED';

                if (isOtpVerificationFailed) {
                    this.otpErrorMessage = `Incorrect OTP. Number of attempts remaining : ${this.remainingAttempts}`;
                } else {
                    const wrongOTPMessage = this.otpData.type === 'phone' ?
                        'Invalid OTP. Please check the OTP sent to your mobile number.' :
                        'Invalid OTP. Please check the OTP sent to your email address.';
                    this.otpErrorMessage = wrongOTPMessage;
                }
            } else {
                this.otpValue = '';
                const wrongOTPMessage = this.otpData.type === 'phone' ?
                    'Invalid OTP. Please check the OTP sent to your mobile number.' :
                    'Invalid OTP. Please check the OTP sent to your email address.';
                this.otpErrorMessage = wrongOTPMessage;
            }
        }
    }

    onOtpModalClose() {
        this.showOtpModal = false;
        this.clearResendTimer();

        this.otpErrorMessage = '';
        this.remainingAttempts = 0;
        this.maxAttemptsReached = false;
        this.otpValue = '';
    }

    private clearResendTimer() {
        if (this.resendInterval) {
            clearInterval(this.resendInterval);
            this.resendInterval = null;
        }
        this.enableResendButton = false;
        this.disableResendButton = false;
        this.resendOTPbtn = 'Resend OTP';
        this.counter = 0;

        this.otpErrorMessage = '';
        this.remainingAttempts = 0;
        this.maxAttemptsReached = false;
    }

    private async deleteAccount() {
        const loader = await this.commonUtilService.getLoader();
        await loader.present();

        try {
            const deleteRequest = {
                userId: this.profile.userId
            };

            await this.profileService.deleteUser(deleteRequest).toPromise();

            await this.profileService.deleteProfileData(this.profile.uid).toPromise();

            await loader.dismiss();

            await this.commonUtilService.showToast('Your account has been deleted successfully');

            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.TOUCH,
                InteractSubtype.DELETE_CLICKED,
                Environment.USER,
                PageId.PROFILE,
                undefined,
                undefined,
                undefined,
                undefined,
                ID.DELETE_GROUP
            );

            this.logoutHandler.onLogout();

        } catch (error) {
            await loader.dismiss();
            console.error('Error deleting account:', error);
            await this.commonUtilService.showToast('Account deletion failed. Please try again.');

            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.TOUCH,
                InteractSubtype.DELETE_CLICKED,
                Environment.USER,
                PageId.PROFILE,
                undefined,
                undefined,
                undefined,
                undefined,
                ID.DELETE_GROUP
            );
        }
    }

    private generateSubmitTelemetry() {
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.DELETE_CLICKED,
            Environment.USER,
            PageId.PROFILE,
            undefined,
            undefined,
            undefined,
            undefined,
            ID.SUBMIT_CLICKED
        );
    }

    goBack() {
        this.telemetryGeneratorService.generateBackClickedTelemetry(
            PageId.PROFILE,
            Environment.USER,
            false
        );
        this.navCtrl.back();
    }

    async handleHeaderEvents(event: any) {
        if (event.name === 'back') {
            this.goBack();
        }
    }
}
