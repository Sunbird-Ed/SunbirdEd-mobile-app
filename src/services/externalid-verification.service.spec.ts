import { ExternalIdVerificationService } from './externalid-verification.service';
import { ProfileService, AuthService } from '@project-sunbird/sunbird-sdk';
import {
  LocalCourseService,
  CommonUtilService,
  FormAndFrameworkUtilService,
  AppGlobalService
} from '../services';
import { } from './common-util.service';
import { PopoverController } from '@ionic/angular';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { of } from 'rxjs';

describe('ExternalIdVerificationService', () => {
  let externalIdVerificationService: ExternalIdVerificationService;

  const mockProfileService: Partial<ProfileService> = {
    isDefaultChannelProfile: jest.fn(() => of(false)),
    getServerProfilesDetails: jest.fn(() => of({ rootOrg: { rootOrgId: '1234567890' } } as any)),
    getUserFeed: jest.fn(() => of([])),
  };
  const mockAuthService: Partial<AuthService> = {
    getSession: jest.fn(() => of({} as any))
  };
  const mockAppGlobalService: Partial<AppGlobalService> = {
    closeSigninOnboardingLoader: jest.fn(),
    authService: mockAuthService as any
  };
  const mockPopOverController: Partial<PopoverController> = {};
  mockPopOverController.create = jest.fn(() => (Promise.resolve({
    present: jest.fn(() => Promise.resolve({})),
    dismiss: jest.fn(() => Promise.resolve({})),
  } as any)));
  const mockFormnFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
    getTenantSpecificMessages: jest.fn()
  };
  const mockSplaschreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {
    navigateContent: jest.fn()
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
  };

  const mockLocalCourseService: Partial<LocalCourseService> = {
    checkCourseRedirect: jest.fn()
  };
  beforeAll(() => {
    externalIdVerificationService = new ExternalIdVerificationService(
      mockProfileService as ProfileService,
      mockAppGlobalService as AppGlobalService,
      mockPopOverController as PopoverController,
      mockFormnFrameworkUtilService as FormAndFrameworkUtilService,
      mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate,
      mockCommonUtilService as CommonUtilService,
      mockLocalCourseService as LocalCourseService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of ExternalIdVerificationService', () => {
    expect(externalIdVerificationService).toBeTruthy();
  });

  describe('checkQuizContent()', () => {

    it('should navigate to contentdetails page if its a Quiztype content', () => {
      // arrange
      mockAppGlobalService.limitedShareQuizContent = 'do_12345';
      // act
      externalIdVerificationService.checkQuizContent();
      // assert
      expect(mockAppGlobalService.limitedShareQuizContent).toBeNull();
      expect(mockSplaschreenDeeplinkActionHandlerDelegate.navigateContent).toHaveBeenCalledWith('do_12345');
    });

    it('should navigate to contentdetails page if its a Quiztype content', (done) => {
      // arrange
      mockAppGlobalService.limitedShareQuizContent = null;
      // act

      // assert
      externalIdVerificationService.checkQuizContent().then((response) => {
        expect(response).toBeFalsy();
        done();
      });
    });
  });

  describe('checkJoinTraining()', () => {

    it('should follow course Redirect flow', (done) => {
      // arrange
      mockAppGlobalService.isJoinTraningOnboardingFlow = true;
      // act
      // assert
      externalIdVerificationService.checkJoinTraining().then(() => {
        expect(mockLocalCourseService.checkCourseRedirect).toHaveBeenCalled();
        expect(mockAppGlobalService.isJoinTraningOnboardingFlow).toBeFalsy();
        done();
      });
    });
  });

  describe('showExternalIdVerificationPopup()', () => {

    it('shouldn\'t show Ext Verification popup if its Quiz content redirection flow', () => {
      // arrange
      mockCommonUtilService.networkInfo = {
        isNetworkAvailable: false
      };
      externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(false));
      // act
      externalIdVerificationService.showExternalIdVerificationPopup();
      // assert
      expect(mockPopOverController.create).not.toHaveBeenCalled();
    });

    it('shouldn\'t show Ext Verification popup if network is not available', () => {
      // arrange
      externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.networkInfo = {
        isNetworkAvailable: false
      };
      // act
      externalIdVerificationService.showExternalIdVerificationPopup();
      // assert
      expect(mockPopOverController.create).not.toHaveBeenCalled();
    });

    it('shouldn\'t show Ext Verification popup if user is not a custodian user', () => {
      // arrange
      externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(false));
      mockCommonUtilService.networkInfo = {
        isNetworkAvailable: true
      };
      // act
      externalIdVerificationService.showExternalIdVerificationPopup();
      // assert
      expect(mockPopOverController.create).not.toHaveBeenCalled();
    });

    it('shouldn\'t show Ext Verification popup if user feed is not available', () => {
      // arrange
      externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(false));
      externalIdVerificationService.isCustodianUser$ = of(true);
      mockCommonUtilService.networkInfo = {
        isNetworkAvailable: true
      };
      // act
      externalIdVerificationService.showExternalIdVerificationPopup();
      // assert
      expect(mockPopOverController.create).not.toHaveBeenCalled();
    });

    it('shouldn\'t show Ext Verification popup if user feed category is not orgmigrationaction', () => {
      // arrange
      externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(false));
      externalIdVerificationService.isCustodianUser$ = of(true);
      mockCommonUtilService.networkInfo = {
        isNetworkAvailable: true
      };
      mockProfileService.getUserFeed = jest.fn(() => of([{ category: 'otherthanusermigration' } as any]));
      // act
      externalIdVerificationService.showExternalIdVerificationPopup();
      // assert
      expect(mockPopOverController.create).not.toHaveBeenCalled();
    });

    it('should show Ext Verification popup if user feed category  orgmigrationaction', (done) => {
      // arrange
      externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(false));
      externalIdVerificationService.checkJoinTraining =  jest.fn(() => Promise.resolve(true));
      externalIdVerificationService.isCustodianUser$ = of(true);
      mockCommonUtilService.networkInfo = {
        isNetworkAvailable: true
      };
      mockProfileService.getUserFeed = jest.fn(() => of([{ category: 'orgmigrationaction' } as any]));
      mockFormnFrameworkUtilService.getTenantSpecificMessages = jest.fn(() => Promise.resolve([{ range: [{}]}]));
      const mockCreate = jest.spyOn(mockPopOverController, 'create');
      // act
      externalIdVerificationService.showExternalIdVerificationPopup();
      // assert
      setTimeout(() => {
        expect(mockPopOverController.create).toHaveBeenCalled();
        expect(mockCreate.mock.calls[0][0]['componentProps']['userFeed']).toEqual({ category: 'orgmigrationaction' });
        expect(mockCreate.mock.calls[0][0]['componentProps']['tenantMessages']).toEqual({});
        done();
      }, 0);

    });
  });

});
