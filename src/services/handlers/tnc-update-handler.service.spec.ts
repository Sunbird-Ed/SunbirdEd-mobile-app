import { TncUpdateHandlerService } from './tnc-update-handler.service';
import {
  ProfileService, AuthService, OAuthSession, ServerProfileDetailsRequest,
  CachedItemRequestSourceFrom, ServerProfile, RootOrg, Profile, ProfileType, ProfileSource
} from 'sunbird-sdk';
import { CommonUtilService } from '../common-util.service';
import { FormAndFrameworkUtilService } from '../formandframeworkutil.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ExternalIdVerificationService } from '../externalid-verification.service';
import { AppGlobalService } from '../app-global-service.service';
import { of, throwError } from 'rxjs';
import { ProfileConstants } from '../../app/app.constant';
import { ConsentStatus } from '@project-sunbird/client-services/models';
import { ConsentService } from '../consent-service';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { SbProgressLoader } from '../sb-progress-loader.service';

describe('TncUpdateHandlerService', () => {
  let tncUpdateHandlerService: TncUpdateHandlerService;

  const mockProfileService: Partial<ProfileService> = {};
  const mockAuthService: Partial<AuthService> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
  const mockModalCtrl: Partial<ModalController> = {};
  mockModalCtrl.create = jest.fn(() => (Promise.resolve({
    present: jest.fn(() => Promise.resolve({})),
    dismiss: jest.fn(() => Promise.resolve({})),
  } as any)));
  const mockRouter: Partial<Router> = {
    navigate: jest.fn()
  };
  const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {
    showExternalIdVerificationPopup: jest.fn()
  };
  const mockAppGlobalService: Partial<AppGlobalService> = {
    closeSigninOnboardingLoader: jest.fn()
  };

  const mockConsentService: Partial<ConsentService> = {};
  const mockSharedPreferences: Partial<SharedPreferences> = {};
  const mockSbProgressLoader: Partial<SbProgressLoader> = {
    hide: jest.fn()
};

  beforeAll(() => {
    tncUpdateHandlerService = new TncUpdateHandlerService(
      mockProfileService as ProfileService,
      mockAuthService as AuthService,
      mockSharedPreferences as SharedPreferences,
      mockCommonUtilService as CommonUtilService,
      mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
      mockModalCtrl as ModalController,
      mockRouter as Router,
      mockExternalIdVerificationService as ExternalIdVerificationService,
      mockAppGlobalService as AppGlobalService,
      mockConsentService as ConsentService,
      mockSbProgressLoader as SbProgressLoader,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of TncUpdateHandlerService', () => {
    expect(tncUpdateHandlerService).toBeTruthy();
  });

  describe('checkForTncUpdate', () => {
    it('should stop the execution if session ID is null', () => {
      // arrange
      mockAuthService.getSession = jest.fn(() => of(undefined));
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      expect(mockAuthService.getSession).toHaveBeenCalled();
    });

    it('should navigate to district-mapping page if BMC is already filled', () => {
      // arrange
      const sessionData: OAuthSession = {
        access_token: 'sample_access_token',
        refresh_token: 'sample_refresh_token',
        userToken: 'sample_userToken'
      };

      const profileReq: ServerProfileDetailsRequest = {
        userId: 'sample_userId',
        requiredFields: ProfileConstants.REQUIRED_FIELDS,
        from: CachedItemRequestSourceFrom.SERVER
      };

      const rootOrgData: RootOrg = {
        rootOrgId: 'sample_rootOrgId',
        orgName: 'sample_orgName',
        slug: 'sample_slug',
        hashTagId: 'sample_hashTagId'
      };

      const serverProfileData: ServerProfile = {
        userId: 'sample_userId',
        identifier: 'sample_identifier',
        firstName: 'sample_firstName',
        lastName: 'sample_lastName',
        rootOrg: rootOrgData,
        tncAcceptedVersion: 'sample_tncAcceptedVersion',
        tncAcceptedOn: 'sample_tncAcceptedOn',
        tncLatestVersion: 'sample_tncLatestVersion',
        promptTnC: false,
        tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
        id: 'sample_id',
        avatar: 'sample_avatar',
        declarations: [{name: 'sample-name'}]
      };
      const ProfileData: Profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: ['sample_medium1', 'sample_medium2'],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.STUDENT,
        grade: ['sample_grade1', 'sample_grade2'],
        syllabus: ['sample_syllabus'],
        source: ProfileSource.LOCAL,
        serverProfile: serverProfileData
      };
      const custodianOrgId = 'sample_rootOrgId';

      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockAppGlobalService.getCurrentUser = jest.fn(() => ProfileData);
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve(custodianOrgId));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false);
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
      }, 0);

    });

    it('should check for tearcherId verification if BMC and location details are already filled ', () => {
      // arrange
      const sessionData: OAuthSession = {
        access_token: 'sample_access_token',
        refresh_token: 'sample_refresh_token',
        userToken: 'sample_userToken'
      };

      const profileReq: ServerProfileDetailsRequest = {
        userId: 'sample_userId',
        requiredFields: ProfileConstants.REQUIRED_FIELDS,
        from: CachedItemRequestSourceFrom.SERVER
      };

      const rootOrgData: RootOrg = {
        rootOrgId: 'sample_rootOrgId',
        orgName: 'sample_orgName',
        slug: 'sample_slug',
        hashTagId: 'sample_hashTagId'
      };

      const serverProfileData: ServerProfile = {
        userId: 'sample_userId',
        identifier: 'sample_identifier',
        firstName: 'sample_firstName',
        lastName: 'sample_lastName',
        rootOrg: rootOrgData,
        tncAcceptedVersion: 'sample_tncAcceptedVersion',
        tncAcceptedOn: 'sample_tncAcceptedOn',
        tncLatestVersion: 'sample_tncLatestVersion',
        promptTnC: false,
        tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
        id: 'sample_id',
        avatar: 'sample_avatar',
        declarations: [{name: 'sample-name'}]
      };
      const ProfileData: Profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: ['sample_medium1', 'sample_medium2'],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.STUDENT,
        grade: ['sample_grade1', 'sample_grade2'],
        syllabus: ['sample_syllabus'],
        source: ProfileSource.LOCAL,
        serverProfile: serverProfileData
      };
      const custodianOrgId = 'sample_rootOrgId';

      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockAppGlobalService.getCurrentUser = jest.fn(() => ProfileData);
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve(custodianOrgId));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockExternalIdVerificationService.showExternalIdVerificationPopup).toHaveBeenCalled();
      }, 0);

    });

    it('should navigate to BMC page if BMC details are not filled ', () => {
      // arrange
      const sessionData: OAuthSession = {
        access_token: 'sample_access_token',
        refresh_token: 'sample_refresh_token',
        userToken: 'sample_userToken'
      };

      const profileReq: ServerProfileDetailsRequest = {
        userId: 'sample_userId',
        requiredFields: ProfileConstants.REQUIRED_FIELDS,
        from: CachedItemRequestSourceFrom.SERVER
      };

      const rootOrgData: RootOrg = {
        rootOrgId: 'sample_rootOrgId',
        orgName: 'sample_orgName',
        slug: 'sample_slug',
        hashTagId: 'sample_hashTagId'
      };

      const serverProfileData: ServerProfile = {
        userId: 'sample_userId',
        identifier: 'sample_identifier',
        firstName: 'sample_firstName',
        lastName: 'sample_lastName',
        rootOrg: rootOrgData,
        tncAcceptedVersion: 'sample_tncAcceptedVersion',
        tncAcceptedOn: 'sample_tncAcceptedOn',
        tncLatestVersion: 'sample_tncLatestVersion',
        promptTnC: false,
        tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
        id: 'sample_id',
        avatar: 'sample_avatar'
      };
      const profileData: Profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: [],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.STUDENT,
        grade: [],
        syllabus: [],
        source: ProfileSource.LOCAL,
        serverProfile: serverProfileData
      };

      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockAppGlobalService.getCurrentUser = jest.fn(() => profileData);
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(profileData));
      mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({ value: { profile: {} } }));
      jest.spyOn(tncUpdateHandlerService, 'isSSOUser').mockImplementation(() => {
        return Promise.resolve(false);
      });
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockConsentService.getConsent = jest.fn(() => Promise.resolve());
      mockProfileService.getConsent = jest.fn(() => of({ status: ConsentStatus.ACTIVE }));
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockFormAndFrameworkUtilService.updateLoggedInUser).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(dismissFn).toHaveBeenCalled();
        expect(mockConsentService.getConsent).toHaveBeenCalled();
      }, 0);
    });

    it('should navigate to BMC page if BMC details are not filled and open global consent popup', () => {
      // arrange
      const sessionData: OAuthSession = {
        access_token: 'sample_access_token',
        refresh_token: 'sample_refresh_token',
        userToken: 'sample_userToken'
      };

      const profileReq: ServerProfileDetailsRequest = {
        userId: 'sample_userId',
        requiredFields: ProfileConstants.REQUIRED_FIELDS,
        from: CachedItemRequestSourceFrom.SERVER
      };

      const rootOrgData: RootOrg = {
        rootOrgId: 'sample_rootOrgId',
        orgName: 'sample_orgName',
        slug: 'sample_slug',
        hashTagId: 'sample_hashTagId'
      };

      const serverProfileData: ServerProfile = {
        userId: 'sample_userId',
        identifier: 'sample_identifier',
        firstName: 'sample_firstName',
        lastName: 'sample_lastName',
        rootOrg: rootOrgData,
        tncAcceptedVersion: 'sample_tncAcceptedVersion',
        tncAcceptedOn: 'sample_tncAcceptedOn',
        tncLatestVersion: 'sample_tncLatestVersion',
        promptTnC: false,
        tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
        id: 'sample_id',
        avatar: 'sample_avatar'
      };
      const profileData: Profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: [],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.STUDENT,
        grade: [],
        syllabus: [],
        source: ProfileSource.LOCAL,
        serverProfile: serverProfileData
      };

      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockAppGlobalService.getCurrentUser = jest.fn(() => profileData);
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(profileData));
      mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({ value: { profile: {} } }));
      jest.spyOn(tncUpdateHandlerService, 'isSSOUser').mockImplementation(() => {
        return Promise.resolve(true);
      });
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockConsentService.getConsent = jest.fn(() => Promise.resolve());

      mockProfileService.getConsent = jest.fn(() => throwError({
        response: {
          responseCode: 404
        }
      }));
      mockProfileService.updateConsent = jest.fn(() => of({}));
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockFormAndFrameworkUtilService.updateLoggedInUser).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(dismissFn).toHaveBeenCalled();
        expect(mockConsentService.getConsent).toHaveBeenCalled();
      }, 0);
    });

    it('should navigate to BMC page if BMC details are not filled and open global consent popup for network error', () => {
      // arrange
      const sessionData: OAuthSession = {
        access_token: 'sample_access_token',
        refresh_token: 'sample_refresh_token',
        userToken: 'sample_userToken'
      };

      const profileReq: ServerProfileDetailsRequest = {
        userId: 'sample_userId',
        requiredFields: ProfileConstants.REQUIRED_FIELDS,
        from: CachedItemRequestSourceFrom.SERVER
      };

      const rootOrgData: RootOrg = {
        rootOrgId: 'sample_rootOrgId',
        orgName: 'sample_orgName',
        slug: 'sample_slug',
        hashTagId: 'sample_hashTagId'
      };

      const serverProfileData: ServerProfile = {
        userId: 'sample_userId',
        identifier: 'sample_identifier',
        firstName: 'sample_firstName',
        lastName: 'sample_lastName',
        rootOrg: rootOrgData,
        tncAcceptedVersion: 'sample_tncAcceptedVersion',
        tncAcceptedOn: 'sample_tncAcceptedOn',
        tncLatestVersion: 'sample_tncLatestVersion',
        promptTnC: false,
        tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
        id: 'sample_id',
        avatar: 'sample_avatar'
      };
      const profileData: Profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: [],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.STUDENT,
        grade: [],
        syllabus: [],
        source: ProfileSource.LOCAL,
        serverProfile: serverProfileData
      };

      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockAppGlobalService.getCurrentUser = jest.fn(() => profileData);
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(profileData));
      mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({ value: { profile: {} } }));
      jest.spyOn(tncUpdateHandlerService, 'isSSOUser').mockImplementation(() => {
        return Promise.resolve(true);
      });
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockConsentService.getConsent = jest.fn(() => Promise.resolve());

      mockProfileService.getConsent = jest.fn(() => throwError({
        response: {
          responseCode: 404
        }
      }));
      mockProfileService.updateConsent = jest.fn(() => throwError({code: 'NETWORK_ERROR'}));
      mockCommonUtilService.showToast = jest.fn();
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockFormAndFrameworkUtilService.updateLoggedInUser).toHaveBeenCalled();
        expect(mockConsentService.getConsent).toHaveBeenCalled();
      }, 0);
    });

    it('should display terms&conditions page if an update is available', () => {
      // arrange
      const sessionData: OAuthSession = {
        access_token: 'sample_access_token',
        refresh_token: 'sample_refresh_token',
        userToken: 'sample_userToken'
      };

      const profileReq: ServerProfileDetailsRequest = {
        userId: 'sample_userId',
        requiredFields: ProfileConstants.REQUIRED_FIELDS,
        from: CachedItemRequestSourceFrom.SERVER
      };

      const rootOrgData: RootOrg = {
        rootOrgId: 'sample_rootOrgId',
        orgName: 'sample_orgName',
        slug: 'sample_slug',
        hashTagId: 'sample_hashTagId'
      };

      const serverProfileData: ServerProfile = {
        userId: 'sample_userId',
        identifier: 'sample_identifier',
        firstName: 'sample_firstName',
        lastName: 'sample_lastName',
        rootOrg: rootOrgData,
        tncAcceptedVersion: 'sample_tncAcceptedVersion',
        tncAcceptedOn: 'sample_tncAcceptedOn',
        tncLatestVersion: 'sample_tncLatestVersion',
        promptTnC: true,
        tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
        id: 'sample_id',
        avatar: 'sample_avatar'
      };

      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
      }, 0);

    });
  });

  describe('presentTncPage', () => {
    it('should open the terms&condition page if TNC not accepted', () => {
      // arrange
      const rootOrgData: RootOrg = {
        rootOrgId: 'sample_rootOrgId',
        orgName: 'sample_orgName',
        slug: 'sample_slug',
        hashTagId: 'sample_hashTagId'
      };

      const serverProfileData: ServerProfile = {
        userId: 'sample_userId',
        identifier: 'sample_identifier',
        firstName: 'sample_firstName',
        lastName: 'sample_lastName',
        rootOrg: rootOrgData,
        tncAcceptedVersion: 'sample_tncAcceptedVersion',
        tncAcceptedOn: 'sample_tncAcceptedOn',
        tncLatestVersion: 'sample_tncLatestVersion',
        promptTnC: true,
        tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
        id: 'sample_id',
        avatar: 'sample_avatar'
      };

      const present = jest.fn();
      mockModalCtrl.create = jest.fn(() => Promise.resolve({
        present
      })) as any;

      // act
      tncUpdateHandlerService.presentTncPage(serverProfileData);

      // assert
      setTimeout(() => {
        expect(present).toHaveBeenCalled();
      }, 0);
    });
  });

  describe('dismissTncPage', () => {
    it('should close the tnc view, if it is open', () => {
      // arrange
      tncUpdateHandlerService.modal = true;
      const dismiss = jest.fn();
      mockModalCtrl.create = jest.fn(() => Promise.resolve({
        dismiss
      })) as any;

      // act
      tncUpdateHandlerService.dismissTncPage();

      // assert
      setTimeout(() => {
        expect(dismiss).toHaveBeenCalled();
      }, 0);
    });

    it('should do nothing if tnc view is not open', () => {
      // arrange
      tncUpdateHandlerService.modal = false;
      const dismiss = jest.fn();
      mockModalCtrl.create = jest.fn(() => Promise.resolve({
        dismiss
      })) as any;

      // act
      tncUpdateHandlerService.dismissTncPage();

      // assert
    });
  });

  describe('isSSOUser', () => {
    it('should return true for different org Id', (done) => {
      // arrange
      const rootOrgData: RootOrg = {
        rootOrgId: 'sample_rootOrgId',
        orgName: 'sample_orgName',
        slug: 'sample_slug',
        hashTagId: 'sample_hashTagId'
      };
      const serverProfileData: ServerProfile = {
        userId: 'sample_userId',
        identifier: 'sample_identifier',
        firstName: 'sample_firstName',
        lastName: 'sample_lastName',
        rootOrg: rootOrgData,
        tncAcceptedVersion: 'sample_tncAcceptedVersion',
        tncAcceptedOn: 'sample_tncAcceptedOn',
        tncLatestVersion: 'sample_tncLatestVersion',
        promptTnC: true,
        tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
        id: 'sample_id',
        avatar: 'sample_avatar'
      };
      const ProfileData: Profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: ['sample_medium1', 'sample_medium2'],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.STUDENT,
        grade: ['sample_grade1', 'sample_grade2'],
        syllabus: ['sample_syllabus'],
        source: ProfileSource.LOCAL,
        serverProfile: serverProfileData
      };
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootOrgId_other'));
      // act
      tncUpdateHandlerService.isSSOUser(ProfileData).then(res => {
        // assert
        setTimeout(() => {
          expect(mockFormAndFrameworkUtilService.getCustodianOrgId).toHaveBeenCalled();
        }, 0);
        done();
      });
    });

    it('should return flase for same org Id', (done) => {
      // arrange
      const rootOrgData: RootOrg = {
        rootOrgId: 'sample_rootOrgId',
        orgName: 'sample_orgName',
        slug: 'sample_slug',
        hashTagId: 'sample_hashTagId'
      };
      const serverProfileData: ServerProfile = {
        userId: 'sample_userId',
        identifier: 'sample_identifier',
        firstName: 'sample_firstName',
        lastName: 'sample_lastName',
        rootOrg: rootOrgData,
        tncAcceptedVersion: 'sample_tncAcceptedVersion',
        tncAcceptedOn: 'sample_tncAcceptedOn',
        tncLatestVersion: 'sample_tncLatestVersion',
        promptTnC: true,
        tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
        id: 'sample_id',
        avatar: 'sample_avatar'
      };
      const ProfileData: Profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: ['sample_medium1', 'sample_medium2'],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.STUDENT,
        grade: ['sample_grade1', 'sample_grade2'],
        syllabus: ['sample_syllabus'],
        source: ProfileSource.LOCAL,
        serverProfile: serverProfileData
      };
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootOrgId'));
      // act
      tncUpdateHandlerService.isSSOUser(ProfileData).then(res => {
        // assert
        setTimeout(() => {
          expect(mockFormAndFrameworkUtilService.getCustodianOrgId).toHaveBeenCalled();
        }, 0);
        done();
      });
    });
  });

});
