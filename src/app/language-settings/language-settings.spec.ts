import {LanguageSettingsPage} from '@app/pages/language-settings/language-settings';
import {
  appGlobalServiceMock,
  commonUtilServiceMock,
  eventsMock,
  navCtrlMock,
  navParamsMock,
  platformMock,
  sharedPreferencesMock,
  telemetryGeneratorServiceMock,
  translateServiceMock,
  zoneMock
} from '@app/__tests__/mocks';
import {PreferenceKey} from '@app/app';

import {Environment, ImpressionType, InteractSubtype, InteractType, PageId} from 'sunbird';
import {OnboardingPage} from '@app/pages/onboarding/onboarding';
import {UserTypeSelectionPage} from '@app/pages/user-type-selection';

describe('LanguageSettingsPage', () => {
  let languageSettingsPage: LanguageSettingsPage;

  beforeEach(() => {
    languageSettingsPage = new LanguageSettingsPage(
      navCtrlMock as any,
      navParamsMock as any,
      translateServiceMock as any,
      sharedPreferencesMock as any,
      eventsMock as any,
      zoneMock as any,
      telemetryGeneratorServiceMock as any,
      platformMock as any,
      appGlobalServiceMock as any,
      commonUtilServiceMock as any
    );

    jest.resetAllMocks();
  });

  it('can load instance', () => {
    expect(languageSettingsPage).toBeTruthy();
  });

  it('languages defaults to: []', () => {
    expect(languageSettingsPage.languages).toEqual([]);
  });

  it('isLanguageSelected defaults to: false', () => {
    expect(languageSettingsPage.isLanguageSelected).toEqual(false);
  });

  it('isFromSettings defaults to: false', () => {
    expect(languageSettingsPage.isFromSettings).toEqual(false);
  });

  it('btnColor defaults to: #55acee', () => {
    expect(languageSettingsPage.btnColor).toEqual('#55acee');
  });

  describe('init', () => {
    it('should set language if language selected in preferences', (done) => {
      // arrange
      sharedPreferencesMock.getString.mockResolvedValue('SOME_LANGUAGE');

      // act
      languageSettingsPage.init();
      zoneMock.run.mock.calls[0][0].call(languageSettingsPage);

      // assert
      expect(sharedPreferencesMock.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE_CODE);
      setTimeout(() => {
        expect(languageSettingsPage.previousLanguage).toEqual('SOME_LANGUAGE');
        expect(languageSettingsPage.language).toEqual('SOME_LANGUAGE');
        done();
      }, 0);
    });

    it('should not set language if language selected in preferences', (done) => {
      // arrange
      sharedPreferencesMock.getString.mockResolvedValue(undefined);

      // act
      languageSettingsPage.init();
      zoneMock.run.mock.calls[0][0].call(languageSettingsPage);

      // assert
      expect(sharedPreferencesMock.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE_CODE);
      setTimeout(() => {
        expect(languageSettingsPage.previousLanguage).toEqual(undefined);
        done();
      }, 0);
    });
  });

  describe('ionViewDidLoad', () => {
    it('should generate Impresstion Telemetry on load', () => {
      // act
      languageSettingsPage.ionViewDidLoad();

      // assert
      expect(telemetryGeneratorServiceMock.generateImpressionTelemetry).toHaveBeenCalledWith(
        ImpressionType.VIEW, '',
        languageSettingsPage.isFromSettings ? PageId.SETTINGS_LANGUAGE : PageId.ONBOARDING_LANGUAGE_SETTING,
        languageSettingsPage.isFromSettings ? Environment.SETTINGS : Environment.ONBOARDING
      );
    });

    describe('Register backButton Function', () => {
      it('should bind backButton action with a function', () => {
        // act
        languageSettingsPage.ionViewDidLoad();

        // assert
        expect(platformMock.registerBackButtonAction).toHaveBeenCalledWith(expect.any(Function), 10);
      });

      it('should bind backButton action with a function that generates Interact telemetry', () => {
        // arrange
        platformMock.registerBackButtonAction.mockReturnValue(jest.fn());

        // act
        languageSettingsPage.ionViewDidLoad();
        platformMock.registerBackButtonAction.mock.calls[0][0].call(languageSettingsPage);

        // assert
        expect(telemetryGeneratorServiceMock.generateInteractTelemetry).toHaveBeenCalledWith(
          InteractType.TOUCH, InteractSubtype.DEVICE_BACK_CLICKED,
          languageSettingsPage.isFromSettings ? Environment.SETTINGS : Environment.ONBOARDING,
          languageSettingsPage.isFromSettings ? PageId.SETTINGS_LANGUAGE : PageId.ONBOARDING_LANGUAGE_SETTING,
        );
      });

      it('should bind backButton action with a function that pops current page if isFromSettings', () => {
        // arrange
        navParamsMock.get.mockReturnValue(true);
        platformMock.registerBackButtonAction.mockReturnValue(jest.fn());

        // act
        languageSettingsPage.ionViewDidLoad();
        platformMock.registerBackButtonAction.mock.calls[0][0].call(languageSettingsPage);

        // assert
        expect(navCtrlMock.pop).toHaveBeenCalled();
      });

      it('should bind backButton action with a function that exits app if not isFromSettings', () => {
        // arrange
        platformMock.registerBackButtonAction.mockReturnValue(jest.fn());

        // act
        languageSettingsPage.ionViewDidLoad();
        platformMock.registerBackButtonAction.mock.calls[0][0].call(languageSettingsPage);

        // assert
        expect(commonUtilServiceMock.showExitPopUp).toHaveBeenCalled();
      });
    });
  });

  describe('onLanguageSelected', () => {
    it('should set button color to #8FC4FF if language not selected', () => {
      // arrange
      languageSettingsPage.language = false;

      // act
      languageSettingsPage.onLanguageSelected();

      // assert
      expect(languageSettingsPage.language).toEqual(false);
      expect(languageSettingsPage.btnColor).toEqual('#8FC4FF');
    });

    it('should set button color to #8FC4FF if language not selected', () => {
      // arrange
      languageSettingsPage.language = true;

      // act
      languageSettingsPage.onLanguageSelected();
      zoneMock.run.mock.calls[0][0].call(languageSettingsPage);

      // assert
      expect(translateServiceMock.use).toHaveBeenCalledWith(true);
      expect(languageSettingsPage.btnColor).toEqual('#006DE5');
      expect(languageSettingsPage.language).toEqual(true);
    });
  });

  describe('generateLanguageSuccessInteractEvent', () => {
    it('should delegate to telementryGeneratorService', () => {
      // act
      languageSettingsPage.generateLanguageSuccessInteractEvent('en', 'de');

      // assert
      telemetryGeneratorServiceMock.generateInteractTelemetry(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          previousLanguage: 'en',
          currentLanguage: 'de'
        })
      );
    });
  });

  describe('generateClickInteractEvent', () => {
    it('should delegate to telementryGeneratorService', () => {
      // act
      languageSettingsPage.generateClickInteractEvent('en', InteractSubtype.CONTINUE_CLICKED);

      // assert
      telemetryGeneratorServiceMock.generateInteractTelemetry(
        expect.anything(),
        InteractSubtype.CONTINUE_CLICKED,
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          'selectedLanguage': 'en'
        })
      );
    });
  });

  describe('continue', () => {
    it('should publish event: onAfterLanguageChange:update if language selected', () => {
      // arrange
      languageSettingsPage.isLanguageSelected = true;

      // act
      languageSettingsPage.continue();

      // assert
      expect(eventsMock.publish).toHaveBeenCalledWith('onAfterLanguageChange:update', expect.anything());
    });

    it(' if isLanguage selected is true then makes expected calls', () => {
      // arrange
      languageSettingsPage.previousLanguage = '';
      languageSettingsPage.isFromSettings = true;
      languageSettingsPage.isLanguageSelected = true;
      languageSettingsPage.language = 'en';
      languageSettingsPage.languages = [
        {
          'code': 'en',
          'label': 'English',
          'isApplied': false
        },
        {
          'label': 'हिंदी',
          'code': 'hi',
          'isApplied': false
        },
        {
          'label': 'తెలుగు',
          'code': 'te',
          'isApplied': false
        },
        {
          'label': 'தமிழ்',
          'code': 'ta',
          'isApplied': false
        },
        {
          'label': 'मराठी',
          'code': 'mr',
          'isApplied': false
        }
      ];

      // act
      languageSettingsPage.continue();

      // assert
      expect(languageSettingsPage.selectedLanguage).toEqual({
        'code': 'en',
        'label': 'English',
        'isApplied': false
      });
      expect(sharedPreferencesMock.putString).toHaveBeenCalledWith(
        PreferenceKey.SELECTED_LANGUAGE_CODE, 'en');
      expect(sharedPreferencesMock.putString).toHaveBeenCalledWith(
        PreferenceKey.SELECTED_LANGUAGE, 'English');
      expect(translateServiceMock.use).toHaveBeenCalledWith('en');
    });

    it('should pop page if page has come from settings page', () => {
      // arrange
      languageSettingsPage.isLanguageSelected = true;
      languageSettingsPage.isFromSettings = true;

      // act
      languageSettingsPage.continue();

      // assert
      expect(navCtrlMock.pop).toHaveBeenCalled();
    });

    it('should navigate to the user type selection page if DISPLAY_ONBOARDING_PAGE ' +
      'configuration is set to false', () => {
      // arrange
      languageSettingsPage.isLanguageSelected = true;
      languageSettingsPage.isFromSettings = false;
      (appGlobalServiceMock as any).DISPLAY_ONBOARDING_PAGE = false;

      // act
      languageSettingsPage.continue();

      // assert
      expect(navCtrlMock.push).toHaveBeenCalledWith(UserTypeSelectionPage);
    });

    it('should navigate to the onboarding page if DISPLAY_ONBOARDING_PAGE ' +
      'configuration is set to true', () => {
      // arrange
      languageSettingsPage.isLanguageSelected = true;
      languageSettingsPage.isFromSettings = false;
      (appGlobalServiceMock as any).DISPLAY_ONBOARDING_PAGE = true;

      // act
      languageSettingsPage.continue();

      // assert
      expect(navCtrlMock.push).toHaveBeenCalledWith(OnboardingPage);
    });

    it('should show popup if language is not selected', () => {
      // arrange
      languageSettingsPage.isLanguageSelected = false;

      // act
      languageSettingsPage.continue();

      // assert
      expect(commonUtilServiceMock.showToast).toHaveBeenCalledWith('PLEASE_SELECT_A_LANGUAGE', false, 'redErrorToast');
    });
  });

  describe('ionViewWillEnter', () => {
    it('should delegate to init()', () => {
      // arrange
      spyOn(languageSettingsPage, 'init').and.stub();

      // act
      languageSettingsPage.init();

      // assert
      expect(languageSettingsPage.selectedLanguage).toEqual({});
      expect(languageSettingsPage.init).toHaveBeenCalled();
    });
  });

  describe('ionViewWillLeave', () => {
    it('should call registered backButton', () => {
      // arrange
      (languageSettingsPage.unregisterBackButton as any) = jest.fn();
      languageSettingsPage.isLanguageSelected = false;

      // act
      languageSettingsPage.ionViewWillLeave();

      // assert
      expect(languageSettingsPage.unregisterBackButton).toHaveBeenCalled();
    });

    it('should use selected language if selected', () => {
      // arrange
      languageSettingsPage.isLanguageSelected = true;
      languageSettingsPage.selectedLanguage.code = undefined;
      languageSettingsPage.previousLanguage = 'SAMPLE_LANGUAGE_CODE';

      // act
      languageSettingsPage.ionViewWillLeave();

      // assert
      expect(translateServiceMock.use).toHaveBeenCalledWith('SAMPLE_LANGUAGE_CODE');
    });

    it('should use "en" when no previousLanguage and no language selected', () => {
      // arrange
      languageSettingsPage.isLanguageSelected = true;
      languageSettingsPage.selectedLanguage.code = undefined;
      languageSettingsPage.previousLanguage = undefined;

      // act
      languageSettingsPage.ionViewWillLeave();

      // assert
      expect(translateServiceMock.use).toHaveBeenCalledWith('en');
    });
  });
});
