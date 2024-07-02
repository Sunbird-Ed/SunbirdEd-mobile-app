import { PopoverController } from '@ionic/angular';
import { ProfileService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { of } from 'rxjs';
import { AppGlobalService, CommonUtilService, NavigationService } from '../../../../services';
import { mockProfileData, paylod } from '../../../profile/profile.page.spec.data';
import { ProfileNameConfirmationPopoverComponent } from './sb-profile-name-confirmation-popup.component';
import { PageId } from '../../../../services/telemetry-constants';
import { PreferenceKey } from '../../../app.constant';

describe('ProfileNameConfirmationPopoverComponent', () => {
    let profileNameConfirmationPopoverComponent: ProfileNameConfirmationPopoverComponent;

    const mockProfileService: Partial<ProfileService> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockNavService: Partial<NavigationService> = {
        navigateToEditPersonalDetails: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        openPopover: jest.fn(() => Promise.resolve())
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};

    beforeAll(() => {
        profileNameConfirmationPopoverComponent = new ProfileNameConfirmationPopoverComponent(
            mockProfileService as ProfileService,
            mockPreferences as SharedPreferences,
            mockPopoverCtrl as PopoverController,
            mockNavService as NavigationService,
            mockAppGlobalService as AppGlobalService,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of ProfileNameConfirmationPopoverComponent', () => {
        expect(profileNameConfirmationPopoverComponent).toBeTruthy();
    });

    describe('ionViewWillEnter()', () => {
        it('should initialize profile data', (done) => {
            // arrange
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('app-name'));
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(mockProfileData) as any);

            // act
            profileNameConfirmationPopoverComponent.ionViewWillEnter();

            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('closePopOver()', () => {
        it('should close popover', () => {
            // arrange
            // act
            profileNameConfirmationPopoverComponent.closePopover({});
            // assert
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({});
        });
    });

    describe('onSubmitClick()', () => {
        it('onSubmitClick should close popover', () => {
            // arrange
            mockPreferences.putBoolean = jest.fn(() => of(undefined)) as any;
            // act
            profileNameConfirmationPopoverComponent.onSubmitClick();
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({ buttonClicked: true });
                expect(mockPreferences.putBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-sample_user_id', false);
            }, 0);
        });
    });

    describe('onProfilePageClick  test-suites', () => {
        it('should generate telemetry and navigate to district mapping if network is available,  if no project content', () => {
            // arrange
            // act
            profileNameConfirmationPopoverComponent.projectContent = "Project content";
            profileNameConfirmationPopoverComponent.onProfilePageClick();
            // assert
            setTimeout(() => {
                expect(mockNavService.navigateToEditPersonalDetails).toHaveBeenCalledWith(
                    mockProfileData,
                    PageId.PROFILE_NAME_CONFIRMATION_POPUP,
                    paylod
                );
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({ editProfileClicked: true });
            }, 0);
        });
        it('should generate telemetry and navigate to district mapping if network is available, if no project content', () => {
            // arrange
            // act
            profileNameConfirmationPopoverComponent.projectContent = "";
            profileNameConfirmationPopoverComponent.onProfilePageClick();
            // assert
            setTimeout(() => {
                expect(mockNavService.navigateToEditPersonalDetails).toHaveBeenCalledWith(
                    mockProfileData,
                    PageId.PROFILE_NAME_CONFIRMATION_POPUP,
                    ''
                );
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({ editProfileClicked: true });
            
            })
        });
    });
});