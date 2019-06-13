import { ProfileSettingsPage } from './../profile-settings/profile-settings';

import { UserTypeSelectionPage } from './user-type-selection';
import { navCtrlMock,
        navParamsMock,
        translateServiceMock,
        sharedPreferencesMock,
        profileServiceMock,
        telemetryGeneratorServiceMock,
        containerServiceMock,
        zoneMock,
        platformMock,
        eventsMock,
        commonUtilServiceMock,
        appGlobalServiceMock,
        sunbirdQRScannerMock} from './../../__tests__/mocks';

import {
  SharedPreferences, ProfileService, ServiceProvider,
  TelemetryService, ContainerService, ImpressionType, PageId, Environment, ProfileType, UserSource, TabsPage
} from 'sunbird';
describe('UserTypeSelectionPage Component', () => {
  let userTypeSelectionPage: UserTypeSelectionPage;

  beforeEach(() => {
    userTypeSelectionPage = new UserTypeSelectionPage(
        navCtrlMock as any,
        navParamsMock as any,
        translateServiceMock as any,
        sharedPreferencesMock as any,
        profileServiceMock as any,
        telemetryGeneratorServiceMock as any,
        containerServiceMock as any,
        zoneMock as any,
        eventsMock as any,
        commonUtilServiceMock as any,
        appGlobalServiceMock as any,
        sunbirdQRScannerMock as any,
        platformMock as any
    );
    jest.resetAllMocks();
  });
  it('can load instance', () => {
    expect(userTypeSelectionPage).toBeTruthy();
});
it('backButtonFunc defaults to: undefined', () => {
  expect(userTypeSelectionPage.backButtonFunc).toEqual(undefined);
});


  it('#ionViewDidload should generate impression telemetry event and set navBar back func ', (done) => {
    // arrange
    (userTypeSelectionPage.navBar as any) = {};
    // act
    userTypeSelectionPage.ionViewDidLoad();
    userTypeSelectionPage.navBar.backButtonClick({} as any);

    setTimeout(() => {
      // assert
      expect(userTypeSelectionPage.navBar.backButtonClick).toBeDefined();
      expect(telemetryGeneratorServiceMock.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.VIEW, '',
      PageId.USER_TYPE_SELECTION,
      Environment.HOME, '', '', '');
      expect(telemetryGeneratorServiceMock.generateBackClickedTelemetry).toHaveBeenCalledWith(PageId.USER_TYPE_SELECTION,
      Environment.HOME, true);
      done();
    }, 10);

  });
  describe('ionViewWillEnter', () => {
    it('makes expected calls', () => {
      // arrange
      platformMock.registerBackButtonAction.mockReturnValue(jest.fn());

      // act
      userTypeSelectionPage.ionViewWillEnter();

      // assert
      expect(platformMock.registerBackButtonAction).toHaveBeenCalledWith(expect.anything(), 10);
    });
  it('#ionViewWillEnter should set profile and register backButtonFunc', () => {
     // arrange
     platformMock.registerBackButtonAction.mockReturnValue(jest.fn());

    navParamsMock.get.mockReturnValue(true);
    spyOn(userTypeSelectionPage, 'handleBackButton');

    // act
    userTypeSelectionPage.ionViewWillEnter();
    // assert
    platformMock.registerBackButtonAction.mock.calls[0][0].call(userTypeSelectionPage);
    expect(telemetryGeneratorServiceMock.generateBackClickedTelemetry).toHaveBeenCalled();
    expect(userTypeSelectionPage.backButtonFunc).toHaveBeenCalled();

  });
});

    describe('ionViewWillLeave', () => {
      it('should call registered backButton', () => {
        // arrange
        userTypeSelectionPage.backButtonFunc = jest.fn();

        // act
        userTypeSelectionPage.ionViewWillLeave();

        // assert
        expect(userTypeSelectionPage.backButtonFunc).toHaveBeenCalled();
      });
    });


  it('#selectTeacherCard should select teacher card', (done) => {
    // act
    userTypeSelectionPage.selectTeacherCard();
    // assert
    setTimeout(() => {
      zoneMock.run.mock.calls[0][0].call();
      expect(userTypeSelectionPage.selectedUserType).toBe(ProfileType.TEACHER);
      expect(sharedPreferencesMock.putString).toHaveBeenCalledWith('selected_user_type', ProfileType.TEACHER);
      done();
  }, 0);
  });

  it('#selectStudentCard should select student card', (done) => {
    // act
    userTypeSelectionPage.selectStudentCard();
    // assert
    setTimeout(() => {
      zoneMock.run.mock.calls[0][0].call();
      expect(userTypeSelectionPage.selectedUserType).toBe(ProfileType.STUDENT);
      expect(sharedPreferencesMock.putString).toHaveBeenCalledWith('selected_user_type', ProfileType.STUDENT);
      done();
    }, 0);
  });

  it('#continue should navigate to Tabs Page if profile type is same as selected profileType as TEACHER', () => {
    // arrange
    userTypeSelectionPage.profile = { handle: 'SAMPLE_NAME', profileType: ProfileType.TEACHER, source: UserSource.LOCAL };
    userTypeSelectionPage.selectedUserType = ProfileType.TEACHER;
    profileServiceMock.updateProfile.mockResolvedValue('');
    appGlobalServiceMock.isProfileSettingsCompleted = jest.fn();
    spyOn(userTypeSelectionPage, 'generateInteractEvent');

    // act
    userTypeSelectionPage.continue();
    // assert
    expect(userTypeSelectionPage.generateInteractEvent).toHaveBeenCalled();
    expect(navCtrlMock.push).toHaveBeenCalledWith(TabsPage, {
      loginMode: 'guest'
    });
  });

  it('#continue should navigate to Tabs Page if profile type is same as selected profileType as STUDENT', () => {
    // arrange
    userTypeSelectionPage.profile = { handle: 'SAMPLE_NAME', profileType: ProfileType.STUDENT, source: UserSource.LOCAL };
    userTypeSelectionPage.selectedUserType = ProfileType.STUDENT;
    profileServiceMock.updateProfile.mockResolvedValue('');
    appGlobalServiceMock.isProfileSettingsCompleted = jest.fn();
    spyOn(userTypeSelectionPage, 'generateInteractEvent');
    // act
    userTypeSelectionPage.continue();
    // assert
    expect(userTypeSelectionPage.generateInteractEvent).toHaveBeenCalled();
    expect(navCtrlMock.push).toHaveBeenCalledWith(TabsPage, {
      loginMode: 'guest'
    });
  });


  it('#continue should navigate to Tabs Page after updating the profile if profile type is not same as selected profileType',
  (done) => {
    // arrange
    userTypeSelectionPage.profile = { handle: 'SAMPLE_NAME', profileType: ProfileType.STUDENT, source: UserSource.LOCAL };
    userTypeSelectionPage.selectedUserType = ProfileType.TEACHER;
    profileServiceMock.updateProfile.mockResolvedValue('');
    appGlobalServiceMock.isProfileSettingsCompleted = undefined;
    spyOn(userTypeSelectionPage, 'generateInteractEvent');
    // act
    userTypeSelectionPage.continue();

    // assert
    setTimeout(() => {
      expect(userTypeSelectionPage.generateInteractEvent).toHaveBeenCalled();
      expect(profileServiceMock.updateProfile).toHaveBeenCalled();
      expect(navCtrlMock.push).toHaveBeenCalledWith(TabsPage, {
      loginMode: 'guest'
    });
    done();
    }, 0);

  });

  it('#continue should handle if error response comes from updateProfile API', (done) => {
    // arrange
    userTypeSelectionPage.profile = { handle: 'SAMPLE_NAME', profileType: ProfileType.STUDENT, source: UserSource.LOCAL };
    userTypeSelectionPage.selectedUserType = ProfileType.TEACHER;
    profileServiceMock.updateProfile.mockRejectedValue('');
    appGlobalServiceMock.isProfileSettingsCompleted = undefined;
    spyOn(userTypeSelectionPage, 'generateInteractEvent');
    // act
    userTypeSelectionPage.continue();

    // assert
    setTimeout(() => {
      expect(userTypeSelectionPage.generateInteractEvent).toHaveBeenCalled();
      expect(profileServiceMock.updateProfile).toHaveBeenCalled();
      expect(navCtrlMock.push).not.toHaveBeenCalledWith(TabsPage, {
      loginMode: 'guest'
    });
    done();
    }, 0);
  });
  it('#continue should navigate to Tabs Page if  profile type is same, changeRoleRequest ON and profileSetting is OFF', () => {
    // arrange
    userTypeSelectionPage.profile = { handle: 'SAMPLE_NAME', profileType: ProfileType.STUDENT, source: UserSource.LOCAL };
    userTypeSelectionPage.selectedUserType = ProfileType.STUDENT;
    profileServiceMock.updateProfile.mockResolvedValue('');
    userTypeSelectionPage.isChangeRoleRequest = true;
    appGlobalServiceMock.DISPLAY_ONBOARDING_SCAN_PAGE = jest.fn();
    spyOn(userTypeSelectionPage, 'generateInteractEvent');
    // act
    userTypeSelectionPage.continue();
    // assert
    expect(userTypeSelectionPage.generateInteractEvent).toHaveBeenCalled();
    expect(navCtrlMock.push).toHaveBeenCalledWith(TabsPage, {
      loginMode: 'guest'
    });
  });

  it('#goToTabsPage should navigate to profile setting page if isChangeRoleRequest and isUserTypeChanged is true', () => {
    // arrange
    userTypeSelectionPage.profile = { handle: 'SAMPLE_NAME', profileType: ProfileType.STUDENT, source: UserSource.LOCAL };
    userTypeSelectionPage.selectedUserType = ProfileType.TEACHER;
    userTypeSelectionPage.isChangeRoleRequest = true;
    appGlobalServiceMock.DISPLAY_ONBOARDING_CATEGORY_PAGE = jest.fn();
    containerServiceMock.removeAllTabs.mockReturnValue('');
    // act
    userTypeSelectionPage.gotoTabsPage(true);
    // assert
    expect(containerServiceMock.removeAllTabs).toHaveBeenCalled();
    expect(navCtrlMock.push).toHaveBeenCalledWith(ProfileSettingsPage, {
      isChangeRoleRequest: true, selectedUserType: ProfileType.TEACHER
    });
  });

  it('#goToTabsPage should navigate to Tabs page if isChangeRoleRequest and isUserTypeChanged is true and Onboarding is false', (done) => {
    // arrange
    userTypeSelectionPage.profile = { handle: 'SAMPLE_NAME', profileType: ProfileType.STUDENT, source: UserSource.LOCAL };
    userTypeSelectionPage.selectedUserType = ProfileType.TEACHER;
    profileServiceMock.updateProfile.mockResolvedValue('');
    userTypeSelectionPage.isChangeRoleRequest = true;
    appGlobalServiceMock.DISPLAY_ONBOARDING_CATEGORY_PAGE = undefined;
    // act
    userTypeSelectionPage.gotoTabsPage(true);
    // assert
    setTimeout(() => {
      expect( profileServiceMock.updateProfile).toHaveBeenCalled();
      expect(navCtrlMock.push).toHaveBeenCalledWith(TabsPage, {
        loginMode: 'guest'
      });
      done();
    }, 10 );
  });

  it('#goToTabsPage should not navigate to Tabs page on change role if updateProfile gives error response', (done) => {
    // arrange
    userTypeSelectionPage.profile = { handle: 'SAMPLE_NAME', profileType: ProfileType.STUDENT, source: UserSource.LOCAL };
    userTypeSelectionPage.selectedUserType = ProfileType.TEACHER;
    profileServiceMock.updateProfile.mockRejectedValue('');
    userTypeSelectionPage.isChangeRoleRequest = true;
    appGlobalServiceMock.DISPLAY_ONBOARDING_CATEGORY_PAGE = undefined;
    // act
    userTypeSelectionPage.gotoTabsPage(true);
    // assert
    setTimeout(() => {
      expect( profileServiceMock.updateProfile).toHaveBeenCalled();
      expect(navCtrlMock.push).not.toHaveBeenCalledWith(TabsPage, {
        loginMode: 'guest'
      });
      done();
    }, 10 );
  });

  it('#continue should create a profile if profile is not available', () => {
    // arrange
    userTypeSelectionPage.selectedUserType = ProfileType.STUDENT;
    profileServiceMock.setCurrentProfile.mockResolvedValue('');
    spyOn(userTypeSelectionPage, 'setProfile');
    // act
    userTypeSelectionPage.continue();
    // assert
    expect(userTypeSelectionPage.setProfile).toHaveBeenCalled();

  });

  it('#continue should create a profile if profile is not available and should handle error result from getCurrntUser', (done) => {
   // arrange
    userTypeSelectionPage.selectedUserType = ProfileType.STUDENT;
    profileServiceMock.setCurrentProfile.mockResolvedValue('');
    profileServiceMock.getCurrentUser.mockRejectedValue('');
    spyOn(userTypeSelectionPage, 'setProfile').and.callThrough();
    // act
    userTypeSelectionPage.continue();
    // assert
    setTimeout(() => {
      expect(userTypeSelectionPage.setProfile).toHaveBeenCalled();
      expect(navCtrlMock.push).not.toHaveBeenCalledWith(TabsPage, {
               loginMode: 'guest'
            });
            done();
    }, 0);


    });

  it('#continue should create a profile if profile is not available and should handle error result from getCurrentProfile', (done) => {
    // arrange
    userTypeSelectionPage.selectedUserType = ProfileType.STUDENT;
    profileServiceMock.setCurrentProfile.mockRejectedValue('');
    spyOn(userTypeSelectionPage, 'setProfile').and.callThrough();
    // act
    userTypeSelectionPage.continue();
    // assert
    setTimeout(() => {
      expect(userTypeSelectionPage.setProfile).toHaveBeenCalled();
      expect(navCtrlMock.push).not.toHaveBeenCalledWith(TabsPage, {
               loginMode: 'guest'
            });
            done();
    }, 0);
  });

});
