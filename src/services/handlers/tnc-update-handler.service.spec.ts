import { TncUpdateHandlerService } from "./tnc-update-handler.service";
import { ProfileService, AuthService, CachedItemRequestSourceFrom,OAuthSession, ServerProfileDetailsRequest, ServerProfile, RootOrg, Profile, ProfileType, ProfileSource } from "sunbird-sdk";
import { of, throwError } from "rxjs";
import { CommonUtilService } from "../common-util.service";
import { FormAndFrameworkUtilService } from "../formandframeworkutil.service";
import { ModalController } from "@ionic/angular";
import { Router } from "@angular/router";
import { ExternalIdVerificationService } from "../externalid-verification.service";
import { AppGlobalService } from "../app-global-service.service";
import { ConsentService } from "../consent-service";
import { ProfileConstants, RouterLinks } from "../../app/app.constant";
import { FormConstants } from '../../app/form.constants';
import { FieldConfig } from "../../app/components/common-forms/field-config";
import { InteractType, SharedPreferences } from "@project-sunbird/sunbird-sdk";
import { FrameworkDetailsService } from "../framework-details.service";
import { Events } from '../../util/events';
import onboarding from '../../assets/configurations/config.json';
import { SplashScreenService } from "../splash-screen.service";
import { TelemetryGeneratorService } from "../telemetry-generator.service";
import { LogoutHandlerService } from "./logout-handler.service";
import { Environment, InteractSubtype, PageId } from "../telemetry-constants";


describe('TncUpdateHandlerService', () => {
  let tncUpdateHandlerService: TncUpdateHandlerService;

  const mockProfileService: Partial<ProfileService> = {
    getServerProfilesDetails: jest.fn(() => of()),
    getActiveSessionProfile: jest.fn(() => of())
  };
  const mockAuthService: Partial<AuthService> = {
    getSession: jest.fn(() => of())
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
    isUserLocationAvalable: jest.fn(),
    getLoader: jest.fn(() => Promise.resolve({
      present: jest.fn(() => Promise.resolve()),
      dismiss: jest.fn(() => Promise.resolve())
    })),
    getGuestUserConfig: jest.fn(() => Promise.resolve({board: []}))
  };
  const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
    getFormFields: jest.fn(),
    updateLoggedInUser: jest.fn(() => Promise.resolve('resolve')),
    getCustodianOrgId: jest.fn()
  };
  const mockModalController: Partial<ModalController> = {};
  mockModalController.create = jest.fn(() => (Promise.resolve({
    present: jest.fn(() => Promise.resolve({})),
    dismiss: jest.fn(() => Promise.resolve({})),
    onDidDismiss: jest.fn(() => Promise.resolve({})),
  } as any)));
  const mockRouter: Partial<Router> = {
    navigate: jest.fn()
  };
  const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {
    showExternalIdVerificationPopup: jest.fn()
  };
  const mockAppGlobalService: Partial<AppGlobalService> = {
    closeSigninOnboardingLoader: jest.fn(),
    showYearOfBirthPopup: jest.fn()
  };
  const mockConsentService: Partial<ConsentService> = {
    getConsent: jest.fn()
  };
  const mockPreference: Partial<SharedPreferences> = {
    putString: jest.fn(() => of()) as any
  }
  
  const mockFrameworkDetailsService: Partial<FrameworkDetailsService> = {
    getFrameworkDetails: jest.fn(() => Promise.resolve({}) as any),
  };

  const mockEvents: Partial<Events> = {
    publish: jest.fn()
  };

  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateInteractTelemetry: jest.fn(),
    generateBackClickedTelemetry: jest.fn()    
  };
  const mockSplashScreenService: Partial<SplashScreenService> = {};
  const mockLogoutHandlerService: Partial<LogoutHandlerService> = {
    onLogout: jest.fn()
  };

  const sessionData: OAuthSession = {
    access_token: 'sample_access_token',
    refresh_token: 'sample_refresh_token',
    userToken: 'sample_userToken'
  };

  const profileReq: ServerProfileDetailsRequest = {
    userId: 'some_id',
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
    userType: "OTHER",
    tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
    id: 'sample_id',
    avatar: 'sample_avatar',
    declarations: [{name: 'sample-name'}],
    profileUserType:{
      subType: null,
      type: "OTHER"
    },
  };

  const ProfileData: Profile = {
    uid: 'sample_uid',
    handle: 'sample_handle',
    createdAt: 0,
    medium: ['sample_medium1'],
    board: ['sample_board'],
    subject: ['sample_subject1', 'sample_subject2'],
    profileType: ProfileType.STUDENT,
    grade: ['sample_grade1', 'sample_grade2'],
    syllabus: ['sample_syllabus'],
    source: ProfileSource.LOCAL,
    serverProfile: serverProfileData
  };

  const locationMappingConfig: FieldConfig<any> = [
    {
      "code": "name",
      "type": "input",
      "templateOptions": {
        "labelHtml": {
          "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
          "values": { "$0": "Name" }
        },
        "hidden": true,
        "placeHolder": "Enter Name",
        "multiple": false
      },
      "validations": [{ "type": "required" }]
    },
    {
      "code": "persona",
      "type": "nested_select",
      "templateOptions": {
        "hidden": true,
        "labelHtml": {
          "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
          "values": { "$0": "Role" }
        },
        "placeHolder": "Select Role",
        "multiple": false,
        "dataSrc": { "marker": "SUPPORTED_PERSONA_LIST" }
      },
      "validations": [{ "type": "required" }],
      "children": {
        "administrator": [
          {
            "code": "state",
            "type": "select",
            "templateOptions": {
              "labelHtml": {
                "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                "values": { "$0": "State" }
              },
              "placeHolder": "Select State",
              "multiple": false,
              "dataSrc": {
                "marker": "STATE_LOCATION_LIST",
                "params": { "useCase": "SIGNEDIN_GUEST" }
              }
            },
            "validations": [{ "type": "required" }]
          },
          {
            "code": "district",
            "type": "select",
            "context": "state",
            "default": null,
            "templateOptions": {
              "labelHtml": {
                "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                "values": { "$0": "District" }
              },
              "placeHolder": "Select District",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "district", "useCase": "SIGNEDIN_GUEST" }
              }
            },
            "validations": [{ "type": "required" }]
          },
          {
            "code": "block",
            "type": "select",
            "context": "district",
            "default": null,
            "templateOptions": {
              "label": "Block",
              "placeHolder": "Select Block",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "block", "useCase": "SIGNEDIN" }
              }
            },
            "validations": []
          },
          {
            "code": "cluster",
            "type": "select",
            "context": "block",
            "default": null,
            "templateOptions": {
              "label": "Cluster",
              "placeHolder": "Select Cluster",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "cluster", "useCase": "SIGNEDIN" }
              }
            }
          },
          {
            "code": "school",
            "type": "select",
            "context": "cluster",
            "default": null,
            "templateOptions": {
              "label": "School",
              "placeHolder": "Select School",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "school", "useCase": "SIGNEDIN" }
              }
            }
          }
        ],
        "teacher": [
          {
            "code": "state",
            "type": "select",
            "templateOptions": {
              "labelHtml": {
                "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                "values": { "$0": "State" }
              },
              "placeHolder": "Select State",
              "multiple": false,
              "dataSrc": {
                "marker": "STATE_LOCATION_LIST",
                "params": { "useCase": "SIGNEDIN_GUEST" }
              }
            },
            "validations": [{ "type": "required" }]
          },
          {
            "code": "district",
            "type": "select",
            "context": "state",
            "default": null,
            "templateOptions": {
              "labelHtml": {
                "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                "values": { "$0": "District" }
              },
              "placeHolder": "Select District",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "district", "useCase": "SIGNEDIN_GUEST" }
              }
            },
            "validations": [{ "type": "required" }]
          },
          {
            "code": "block",
            "type": "select",
            "context": "district",
            "default": null,
            "templateOptions": {
              "label": "Block",
              "placeHolder": "Select Block",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "block", "useCase": "SIGNEDIN" }
              }
            },
            "validations": []
          },
          {
            "code": "cluster",
            "type": "select",
            "context": "block",
            "default": null,
            "templateOptions": {
              "label": "Cluster",
              "placeHolder": "Select Cluster",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "cluster", "useCase": "SIGNEDIN" }
              }
            }
          },
          {
            "code": "school",
            "type": "select",
            "context": "cluster",
            "default": null,
            "templateOptions": {
              "label": "School",
              "placeHolder": "Select School",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "school", "useCase": "SIGNEDIN" }
              }
            }
          }
        ],
        "student": [
          {
            "code": "state",
            "type": "select",
            "templateOptions": {
              "labelHtml": {
                "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                "values": { "$0": "State" }
              },
              "placeHolder": "Select State",
              "multiple": false,
              "dataSrc": {
                "marker": "STATE_LOCATION_LIST",
                "params": { "useCase": "SIGNEDIN_GUEST" }
              }
            },
            "validations": [{ "type": "required" }]
          },
          {
            "code": "district",
            "type": "select",
            "context": "state",
            "default": null,
            "templateOptions": {
              "labelHtml": {
                "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                "values": { "$0": "District" }
              },
              "placeHolder": "Select District",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "district", "useCase": "SIGNEDIN_GUEST" }
              }
            },
            "validations": [{ "type": "required" }]
          },
          {
            "code": "block",
            "type": "select",
            "context": "district",
            "default": null,
            "templateOptions": {
              "label": "Block",
              "placeHolder": "Select Block",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "block", "useCase": "SIGNEDIN" }
              }
            },
            "validations": []
          },
          {
            "code": "cluster",
            "type": "select",
            "context": "block",
            "default": null,
            "templateOptions": {
              "label": "Cluster",
              "placeHolder": "Select Cluster",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "cluster", "useCase": "SIGNEDIN" }
              }
            }
          },
          {
            "code": "school",
            "type": "select",
            "context": "cluster",
            "default": null,
            "templateOptions": {
              "label": "School",
              "placeHolder": "Select School",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "school", "useCase": "SIGNEDIN" }
              }
            }
          }
        ],
        "other": [
          {
            "code": "state",
            "type": "select",
            "templateOptions": {
              "placeHolder": "Select State",
              "multiple": false,
              "dataSrc": {
                "marker": "STATE_LOCATION_LIST",
                "params": { "useCase": "SIGNEDIN_GUEST" }
              }
            },
            "validations": [{ "type": "required" }]
          },
          {
            "code": "district",
            "type": "select",
            "context": "state",
            "default": null,
            "templateOptions": {
              "labelHtml": {
                "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                "values": { "$0": "District" }
              },
              "placeHolder": "Select District",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "district", "useCase": "SIGNEDIN_GUEST" }
              }
            },
            "validations": [{ "type": "required" }]
          },
          {
            "code": "block",
            "type": "select",
            "context": "district",
            "default": null,
            "templateOptions": {
              "label": "Block",
              "placeHolder": "Select Block",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "block", "useCase": "SIGNEDIN" }
              }
            },
            "validations": []
          },
          {
            "code": "cluster",
            "type": "select",
            "context": "block",
            "default": null,
            "templateOptions": {
              "label": "Cluster",
              "placeHolder": "Select Cluster",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "cluster", "useCase": "SIGNEDIN" }
              }
            }
          },
          {
            "code": "school",
            "type": "select",
            "context": "cluster",
            "default": null,
            "templateOptions": {
              "label": "School",
              "placeHolder": "Select School",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "school", "useCase": "SIGNEDIN" }
              }
            }
          }
        ],
        "parent": [
          {
            "code": "state",
            "type": "select",
            "templateOptions": {
              "labelHtml": {
                "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                "values": { "$0": "State" }
              },
              "placeHolder": "Select State",
              "multiple": false,
              "dataSrc": {
                "marker": "STATE_LOCATION_LIST",
                "params": { "useCase": "SIGNEDIN_GUEST" }
              }
            },
            "validations": [{ "type": "required" }]
          },
          {
            "code": "district",
            "type": "select",
            "context": "state",
            "default": null,
            "templateOptions": {
              "labelHtml": {
                "contents": "<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>",
                "values": { "$0": "District" }
              },
              "placeHolder": "Select District",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "district", "useCase": "SIGNEDIN_GUEST" }
              }
            },
            "validations": [{ "type": "required" }]
          },
          {
            "code": "block",
            "type": "select",
            "context": "district",
            "default": null,
            "templateOptions": {
              "label": "Block",
              "placeHolder": "Select Block",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "block", "useCase": "SIGNEDIN" }
              }
            },
            "validations": []
          },
          {
            "code": "cluster",
            "type": "select",
            "context": "block",
            "default": null,
            "templateOptions": {
              "label": "Cluster",
              "placeHolder": "Select Cluster",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "cluster", "useCase": "SIGNEDIN" }
              }
            }
          },
          {
            "code": "school",
            "type": "select",
            "context": "cluster",
            "default": null,
            "templateOptions": {
              "label": "School",
              "placeHolder": "Select School",
              "multiple": false,
              "dataSrc": {
                "marker": "LOCATION_LIST",
                "params": { "id": "school", "useCase": "SIGNEDIN" }
              }
            }
          }
        ]
      }
    }
  ]
  
  const custodianOrgId = 'sample_rootOrgId';

  beforeAll(() => {
    tncUpdateHandlerService = new TncUpdateHandlerService(
      mockProfileService as ProfileService,
      mockAuthService as AuthService,
      mockPreference as SharedPreferences,
      mockCommonUtilService as CommonUtilService,
      mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
      mockModalController as ModalController,
      mockRouter as Router,
      mockExternalIdVerificationService as ExternalIdVerificationService,
      mockAppGlobalService as AppGlobalService,
      mockConsentService as ConsentService,
      mockFrameworkDetailsService as FrameworkDetailsService,
      mockEvents as Events,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockSplashScreenService as SplashScreenService,
      mockLogoutHandlerService as LogoutHandlerService
    )
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of TncUpdateHandlerService', () => {
    expect(tncUpdateHandlerService).toBeTruthy();
  });

  describe('checkForTncUpdate', () => {
    it('should stop execution if session data is null ', () => {
      // arrange
      mockAuthService.getSession = jest.fn(() => of(undefined));
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      expect(mockAuthService.getSession).toHaveBeenCalled();
    });

    it('should close signing in onboardng if no profile details', () => {
      // arrange
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(undefined));
      mockAppGlobalService.closeSigninOnboardingLoader = jest.fn();
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.closeSigninOnboardingLoader).toHaveBeenCalled();
      }, 0);
    });

    it('should get a seesion data', () => {
      // arrange
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
      }, 0)
    });

    it('should present terms and condition page if profile already present and updated', () => {
      // arrange
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
        avatar: 'sample_avatar',
        profileUserType:{
          subType: null,
          type: 'OTHER'
        }    
      };
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq)
      }, 0)
    });

    it('should get consent for SSO users', () => {
      // arrange
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData))
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootOrgId'));
      mockRouter.navigate = jest.fn()
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
      }, 0);
    });

    // check bmc and update guest user
    it('should check for BMC profile if user is present skip onboarding for login user', () => {
      // arrange
      const present = jest.fn(() => Promise.resolve())
      const dismiss = jest.fn(() => Promise.resolve())
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig))
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData))
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootOrgId_other'));
      mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
        present,
        dismiss}
      ));
      mockFrameworkDetailsService.getFrameworkDetails = jest.fn(() => Promise.resolve({
        name: 'sample_name',
        identifier: '12345',
        categories: [
            {
                identifier: '097',
                code: 'sample_code',
                name: 'sample_category_name',
                description: 'sample_category_descrption',
                index: 1,
                status: 'Live'
            }
        ],
        profileUserTypes: [{
          type: 'sample_type'
        }]
      })) as any;
      mockAppGlobalService.getCurrentUser = jest.fn(() => Promise.resolve({uid: "some_id"}))
      mockProfileService.updateServerProfile = jest.fn(() => of({}))
      mockCommonUtilService.showToast = jest.fn();
      mockCommonUtilService.translateMessage = jest.fn();
      mockEvents.publish = jest.fn();
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith(FormConstants.LOCATION_MAPPING)
        expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      }, 0)
    });
    // error on update guest user
    it('should check for BMC profile if user is present skip onboarding for login user and error on update guest', () => {
      // arrange
      const present = jest.fn(() => Promise.resolve())
      const dismiss = jest.fn(() => Promise.resolve())
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig))
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData))
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootOrgId_other'));
      mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
        present,
        dismiss}
      ));
      mockFrameworkDetailsService.getFrameworkDetails = jest.fn(() => Promise.resolve({
        name: 'sample_name',
        identifier: '12345',
        categories: [
            {
                identifier: '097',
                code: 'sample_code',
                name: 'sample_category_name',
                description: 'sample_category_descrption',
                index: 1,
                status: 'Live'
            }
        ],
        profileUserTypes: [{
          type: 'sample_type'
        }]
      })) as any;
      mockAppGlobalService.getCurrentUser = jest.fn(() => Promise.resolve({uid: "some_id"}))
      mockProfileService.updateServerProfile = jest.fn(() => throwError({}))
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith(FormConstants.LOCATION_MAPPING)
        expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      }, 0)
    });

    it('should navigate to user type selection if BMC is present', () => {
      // arrange
      const profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: ['sample_medium1', 'sample_medium2'],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.OTHER,
        grade: ['sample_grade1', 'sample_grade2'],
        syllabus: ['sample_syllabus'],
        source: ProfileSource.LOCAL,
        serverProfile: {profileUserType:{
          subType: null,
          type: "NONE"
        }}
      }
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig))
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(profile))
      onboarding.skipOnboardingForLoginUser = false
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootOrgId'));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false)
      mockRouter.navigate = jest.fn()
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith(FormConstants.LOCATION_MAPPING)
        expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      }, 0)
    });
    // else case after guest user
    it('should check for BMC profile if user is present skip onboarding false and bmc navigate', () => {
      // arrange
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig))
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData))
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootOrgId_other'));
      onboarding.skipOnboardingForLoginUser = false;
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
      mockRouter.navigate = jest.fn()
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith(FormConstants.LOCATION_MAPPING)
        expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      }, 0)
    });

    it('should check for BMC profile if user is present skip onboarding false and bmc navigate to user type selection', () => {
      // arrange
      const profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: ['sample_medium1', 'sample_medium2'],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.OTHER,
        grade: ['sample_grade1', 'sample_grade2'],
        syllabus: ['sample_syllabus'],
        source: ProfileSource.LOCAL,
        serverProfile: {
          profileUserType:{
            subType: null,
            type: "NONE"
          },
          rootOrg: {
            rootOrgId: "sample_rootOrgId_other"
          }
        }
      }
      const serverProfile =  {
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
        declarations: [{name: 'sample-name'}],
        profileUserType:{
          subType: null,
          type: "OTHER"
        },
      }
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfile));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig))
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(profile))
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootOrgId_other'));
      onboarding.skipOnboardingForLoginUser = false;
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      }, 0)
    });
    // catch error on get custodian id
    it('should navigate to user type selection if BMC is present', () => {
      // arrange
      const profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: ['sample_medium1', 'sample_medium2'],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.OTHER,
        grade: ['sample_grade1', 'sample_grade2'],
        syllabus: ['sample_syllabus'],
        source: ProfileSource.LOCAL,
        serverProfile: {
          profileUserType:{
            subType: null,
            type: "NONE"
          },
          rootOrg: {
            rootOrgId: "sample_rootOrgId_other"
          }
        }
      }
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig))
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(profile))
      onboarding.skipOnboardingForLoginUser = false
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve())
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith(FormConstants.LOCATION_MAPPING)
        expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      }, 0)
    });

    it('should navigate to user type selection if BMC is present and profile type is none or other', () => {
      // arrange
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
        declarations: [{name: 'sample-name'}],
        userType: 'OTHER',
        profileUserType:{
          subType: null,
          type: 'OTHER'
        }    
      };
      const ProfileData: Profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: [],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.NONE,
        grade: [],
        syllabus: [],
        source: ProfileSource.LOCAL,
        serverProfile: {
          profileUserType: {type: "OTHER"}
        }
      };
      onboarding.skipOnboardingForLoginUser = false;
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig));
      mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({profile: "other"}));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false);
      mockRouter.navigate = jest.fn();
      const categoriesProfileData = {
        hasFilledLocation: false,
        showOnlyMandatoryFields: true,
        profile: "Other",
        isRootPage: true,
        noOfStepsToCourseToc: 1,
        status: true,
        isUserLocationAvalable: false
      };
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({ requiredFields: ProfileConstants.REQUIRED_FIELDS });
      }, 0)
    });

    it('should navigate to profile or categories edit page if BMC is present', () => {
      // arrange
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
        declarations: [{name: 'sample-name'}],
        userType: 'NONE',
        profileUserType:{
          subType: null,
          type: 'NONE'
        }    
      };
      const ProfileData: Profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: ['sample_medium'],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.STUDENT,
        grade: ['sample_grade'],
        syllabus: ['sample_syllabus'],
        source: ProfileSource.LOCAL,
        serverProfile: {
          profileUserType: {type: "OTHER"}
        }
      };
      onboarding.skipOnboardingForLoginUser = false;
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig));
      mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({profile: ProfileData}));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false);
      mockRouter.navigate = jest.fn();
      const categoriesProfileData = {
        hasFilledLocation: false,
        showOnlyMandatoryFields: true,
        profile: ProfileData,
        isRootPage: true,
        noOfStepsToCourseToc: 1
      };
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
      }, 0)
    });

    it('should navigate to profile or categories edit page', () => {
      // arrange
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
        declarations: [{name: 'sample-name'}],
        userType: 'NONE',
        profileUserType:{
          subType: null,
          type: 'NONE'
        }    
      };
      const ProfileData: Profile = {
        uid: 'sample_uid',
        handle: 'sample_handle',
        createdAt: 0,
        medium: ['sample_medium'],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.STUDENT,
        grade: ['sample_grade'],
        syllabus: ['sample_syllabus'],
        source: ProfileSource.LOCAL,
        serverProfile: {
          profileUserType: {type: "OTHER"}
        }
      };
      onboarding.skipOnboardingForLoginUser = false;
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig));
      const value = mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({profile: ProfileData}));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false);
      mockRouter.navigate = jest.fn();
      const categoriesProfileData = {
        hasFilledLocation: false,
        showOnlyMandatoryFields: true,
        profile: ProfileData,
        isRootPage: true,
        noOfStepsToCourseToc: 1
      };
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
      }, 0)
    });

    it('should close siginging on error while getting custodian id', () => {
      // arrange
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
        declarations: [{name: 'sample-name'}],
        userType: 'NONE',
        profileUserType:{
          subType: null,
          type: 'NONE'
        }    
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
      onboarding.skipOnboardingForLoginUser = false;
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(ProfileData));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve(undefined));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => (false));
      mockAppGlobalService.closeSigninOnboardingLoader = jest.fn();
      mockExternalIdVerificationService.showExternalIdVerificationPopup = jest.fn();
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockExternalIdVerificationService.showExternalIdVerificationPopup).toHaveBeenCalled();
      }, 0);
    });

    it('should close siginging on error while getting custodian id', () => {
      // arrange
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
        declarations: [{name: 'sample-name'}],
        userType: 'NONE',
        profileUserType:{
          subType: null,
          type: 'NONE'
        }    
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
      onboarding.skipOnboardingForLoginUser = true;
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(ProfileData));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve(undefined));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => (false));
      mockAppGlobalService.closeSigninOnboardingLoader = jest.fn();
      mockExternalIdVerificationService.showExternalIdVerificationPopup = jest.fn();
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockExternalIdVerificationService.showExternalIdVerificationPopup).toHaveBeenCalled();
      }, 0);
    });

  });

  describe('dismissTncPage', () => {
    it('should dismiss a modal terms and condition page, if open', () => {
      // arrange
      tncUpdateHandlerService.modal = {dismiss: jest.fn()};
      const dismiss = jest.fn();
      mockModalController.create = jest.fn(() => Promise.resolve({
        dismiss
      })) as any;
      // act
      tncUpdateHandlerService.dismissTncPage();
      // assert
      setTimeout(() => {
      }, 0)
    });

    it('should do nothing if tnc view is not open', () => {
      // arrange
      tncUpdateHandlerService.modal = false;
      const dismiss = jest.fn();
      mockModalController.create = jest.fn(() => Promise.resolve({
        dismiss
      })) as any;
      // act
      tncUpdateHandlerService.dismissTncPage();
      // assert
    });
  });

  describe('isSSOUser', () => {
    it('should return true for different org id', (done) => {
      // arrange
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootOrgId_other'))
      // act
      tncUpdateHandlerService.isSSOUser(ProfileData).then(res => {
        // assert
        setTimeout(() => {
        }, 0);
        done();
      });
    });

    it('should return false for same org id', (done) => {
      // arrange
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootOrgId'));
      // act
      tncUpdateHandlerService.isSSOUser(ProfileData).then(res => {
        // assert
        setTimeout(() => {
          // expect(mockFormAndFrameworkUtilService.getCustodianOrgId).toHaveBeenCalled();
        }, 0);
        done();
      }) 
    })
  });

  describe('presentTncPage', () => {
    it('should open terms and condition page', (done) => {
      // arrange
      const present = jest.fn(() => Promise.resolve())
      const presentld = jest.fn(() => Promise.resolve())
      const dismiss = jest.fn(() => Promise.resolve())
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockModalController.create = jest.fn(() => Promise.resolve({
        present: present,
        dismiss: dismiss,
        onDidDismiss: jest.fn(() => Promise.resolve({data:{profileDetails: {
          managedBy: "manager", userId: 'some_id',
          tncLatestVersion: 'sample_tnc_url',
          declarations: [{ name: 'sample-name' }],
          dob: 'sample_dob'}}}))
      })) as any;
      mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
        present: presentld,
        dismiss: dismiss
      }));
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile: {
                tncLatestVersion: 'sample_tnc_url',
                declarations: [{ name: 'sample-name' }],
                dob: 'sample_dob'
            },
            profileType: 'none'
        }));
        let onboardingTrue = onboarding;
        onboardingTrue.skipOnboardingForLoginUser = true;
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
        mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
        tncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(true));
        mockConsentService.getConsent = jest.fn(() => Promise.resolve())
        tncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
        mockFrameworkDetailsService.getFrameworkDetails = jest.fn(() => Promise.resolve({
            profileUserTypes: [{
                type: "teacher",
            }],
            id: 'cbse',
            board: ['cbse'],
            medium: ['english'],
            grade: ['class1'],
            profileLocation: [{type: 'ka', code:'ka34'}]
        })) as any;

        const mockCurrentProfile = {
            uid: 'some_type'
        } as any;
        mockAppGlobalService.getCurrentUser = jest.fn(() => mockCurrentProfile);
        mockProfileService.updateServerProfile = jest.fn(() => throwError(
            { response: { body: { params: { err: 'UOS_USRUPD0062' } } } }));
        // act

        tncUpdateHandlerService.presentTncPage(ProfileData);
        // assert
        setTimeout(() => {
          expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
          // expect(mockModalController.create.prototype.present).toHaveBeenCalled();
          expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
          expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH, InteractSubtype.CONTINUE_CLICKED, Environment.HOME, PageId.TERMS_N_CONDITIONS)
          done();
        }, 0)
    });
    it('should dismiss tnc and navigate to USER_TYPE_SELECTION_LOGGEDIN if logged in user', (done) => {
        // arrange
        mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
        mockModalController.create = jest.fn(() => Promise.resolve({
          present: jest.fn(),
          dismiss: jest.fn(),
          onDidDismiss: jest.fn(() => Promise.resolve({data:{profileDetails: {tncLatestVersion: 'sample_tnc_url',
              declarations: [{ name: 'sample-name' }],
              managedBy: "", userId: 'some_id',
              dob: 'sample_dob'}}}))
        })) as any;
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile: {
                tncLatestVersionUrl: 'sample_tnc_url',
                declarations: [{ name: 'sample-name' }],
                dob: 'sample_dob'
            },
            profileType: 'none'
        }));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        let onboardingTrue = onboarding;
        onboardingTrue.skipOnboardingForLoginUser = false;
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
        mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
        tncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(true));
        mockConsentService.getConsent = jest.fn(() => Promise.resolve())
        mockRouter.navigate = jest.fn()
        tncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
        // act
        tncUpdateHandlerService.presentTncPage(ProfileData);
        // assert
        setTimeout(() => {
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
                state: {categoriesProfileData: {
                    hasFilledLocation: true,
                    showOnlyMandatoryFields: true,
                    profile: 'teacher',
                    isRootPage: true,
                    noOfStepsToCourseToc: 1,
                    status: true,
                    isUserLocationAvalable: true
                  }}
            })
            done();
        }, 0);
    });
    it('should dismiss tnc and navigate to tabs if profile type is not none or other if logged in user', (done) => {
        // arrange
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile: {
                tncLatestVersion: 'sample_tnc_url',
                userId: 'some_userid',
                declarations: [{ name: 'sample-name' }],
                managedBy: 'manager',
                dob: 'sample_dob'
            },
            profileType: 'teacher'
        }));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        let onboardingTrue = onboarding;
        onboardingTrue.skipOnboardingForLoginUser = true;
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
        mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
        tncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(true));
        mockConsentService.getConsent = jest.fn(() => Promise.resolve())
        mockRouter.navigate = jest.fn()
        // act
        tncUpdateHandlerService.presentTncPage(ProfileData);
        // assert
        setTimeout(() => {
            // expect(mockRouter.navigate).toHaveBeenCalledWith(['/', RouterLinks.TABS])
            done();
        }, 0);
    });

    it('should update guest user if no issouser and location and onboading cndtn', (done) => {
        // arrange
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile: {
                tncLatestVersionUrl: 'sample_tnc_url',
                declarations: [{ name: 'sample-name' }],
                managedBy: 'manager',
                dob: 'sample_dob'
            },
            profileType: 'none'
        }));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        let onboardingTrue = onboarding;
        onboardingTrue.skipOnboardingForLoginUser = true;
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
        mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false)
        tncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
        mockConsentService.getConsent = jest.fn(() => Promise.resolve())
        // act
        tncUpdateHandlerService.presentTncPage(ProfileData);
        // assert
        setTimeout(() => {
            done();
        }, 0);
    });
    it('should navigate to profile or category edit if no issouser and location', (done) => {
        // arrange
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile: {
                tncLatestVersionUrl: 'sample_tnc_url',
                declarations: [{ name: 'sample-name' }],
                managedBy: 'manager',
                dob: 'sample_dob'
            },
            profileType: 'Student'
        }));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        let onboardingTrue = onboarding;
        onboardingTrue.skipOnboardingForLoginUser = false;
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
        mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false)
        tncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
        mockConsentService.getConsent = jest.fn(() => Promise.resolve())
        mockRouter.navigate = jest.fn()
        // act
        tncUpdateHandlerService.presentTncPage(ProfileData);
        // assert
        setTimeout(() => {
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
                state: {
                  hasFilledLocation: false,
                  isRootPage: true,
                  noOfStepsToCourseToc: 1,
                  profile: 'teacher',
                  showOnlyMandatoryFields: true
                }
            })
            done();
        }, 0);
    });
    it('should dismiss tnc and navigate to USER_TYPE_SELECTION_LOGGEDIN if no issouser and location', (done) => {
        // arrange
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile: {
                tncLatestVersionUrl: 'sample_tnc_url',
                declarations: [{ name: 'sample-name' }],
                dob: 'sample_dob'
            },
            profileType: 'none'
        }));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        let onboardingTrue = onboarding;
        onboardingTrue.skipOnboardingForLoginUser = false;
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
        mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false)
        tncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
        mockConsentService.getConsent = jest.fn(() => Promise.resolve())
        mockRouter.navigate = jest.fn()
         // act
         tncUpdateHandlerService.presentTncPage(ProfileData);
         // assert
        setTimeout(() => {
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
                state: { 
                  categoriesProfileData: {
                    hasFilledLocation: false,
                    showOnlyMandatoryFields: true,
                    profile: 'teacher',
                    isRootPage: true,
                    noOfStepsToCourseToc: 1,
                    isUserLocationAvalable: false,
                    status: true
                  }
                }
            })
            done();
        }, 0);
    });

    it('should dismiss tnc and navigate on update logged in user ', (done) => {
        // arrange
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile: {
                tncLatestVersionUrl: 'sample_tnc_url',
                declarations: [{ name: 'sample-name' }],
                dob: 'sample_dob'
            },
            profileType: 'none'
        }));
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: false}))
        mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
        tncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockConsentService.getConsent = jest.fn(() => Promise.resolve())
        let onboardingTrue = onboarding;
        onboardingTrue.skipOnboardingForLoginUser = true;
        // update user as guest flow 
        mockFrameworkDetailsService.getFrameworkDetails = jest.fn(() => Promise.resolve({
            profileUserTypes: [{
                type: "teacher",
            }],
            id: 'cbse',
            board: ['cbse'],
            medium: ['english'],
            grade: ['class1'],
            profileLocation: [{type: 'ka', code:'ka34'}]
        })) as any;
        const mockCurrentProfile = {
            uid: 'some_type'
        } as any;
        mockAppGlobalService.getCurrentUser = jest.fn(() => mockCurrentProfile);
        mockProfileService.updateServerProfile = jest.fn(() => of({
            uid: '12345',
            handle: 'sample_profile',
            source: 'server',
            profileType: 'teacher'
        }))
        mockEvents.publish = jest.fn()
         // act
         tncUpdateHandlerService.presentTncPage(ProfileData);
         // assert
        setTimeout(() => {
            // expect(mockAppGlobalService.getCurrentUser ).toHaveBeenCalled();
            expect(mockEvents.publish).toHaveBeenCalledWith('refresh:loggedInProfile')
            done();
        }, 0);
    });
    it('should dismiss tnc and navigate to USER_TYPE_SELECTION_LOGGEDIN page if profile type is not none or other ', (done) => {
        // arrange
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile: {
                tncLatestVersionUrl: 'sample_tnc_url',
                declarations: [{ name: 'sample-name' }],
                dob: 'sample_dob'
            },
            profileType: 'none'
        }));
        let onboardingfalse = onboarding;
        onboardingfalse.skipOnboardingForLoginUser = false;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: false, profile: 'teacher'}))
        mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
        tncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
        mockConsentService.getConsent = jest.fn(() => Promise.resolve())
        mockRouter.navigate = jest.fn();
         // act
         tncUpdateHandlerService.presentTncPage(ProfileData);
         // assert
        setTimeout(() => {
            // expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
            //     state: { categoriesProfileData: {
            //         hasFilledLocation: true,
            //         showOnlyMandatoryFields: true,
            //         profile: 'teacher',
            //         isRootPage: true,
            //         noOfStepsToCourseToc: 1
            //       }}
            // })
            done();
        }, 0);
    });
    it('should dismiss tnc and navigate to profile or category edit if profile type is not none or other ', (done) => {
        // arrange
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile: {
                tncLatestVersionUrl: 'sample_tnc_url',
                declarations: [{ name: 'sample-name' }],
                managedBy: 'manager',
                dob: 'sample_dob'
            },
            profileType: 'teacher'
        }));
        let onboardingTrue = onboarding;
        onboardingTrue.skipOnboardingForLoginUser = false;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: false, profile: 'teacher'}))
        mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
        tncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
        mockRouter.navigate = jest.fn()
         // act
         tncUpdateHandlerService.presentTncPage(ProfileData);
         // assert
        setTimeout(() => {
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
                state: {
                    hasFilledLocation: true,
                    showOnlyMandatoryFields: true,
                    profile: 'teacher',
                    isRootPage: true,
                    noOfStepsToCourseToc: 1
                  }
            })
            done();
        }, 0);
    });

    it('should dismiss tnc and navigate to basic sign up flow if no DOB', (done) => {
        // arrange
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile: {
                tncLatestVersionUrl: 'sample_tnc_url',
                declarations: [{ name: 'sample-name' }],
            },
            profileType: 'none'
        }));
        let onboardingTrue = onboarding;
        onboardingTrue.skipOnboardingForLoginUser = true;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
        mockRouter.navigate = jest.fn()
         // act
         tncUpdateHandlerService.presentTncPage(ProfileData);
         // assert
        setTimeout(() => {
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGNUP_BASIC])
            done();
        }, 0);
    });

    it('should logout to second back navigation and dismiss tnc ', (done) => {
        // arrange
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(false));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.reject({ status: false }));
         // act
         tncUpdateHandlerService.presentTncPage(ProfileData);
         // assert
         setTimeout(() => {
          done()
         }, 0);
    });
    it('should dismiss the loader  and logout if result is false', () => {
        // arrange
        mockProfileService.acceptTermsAndConditions = jest.fn(() => of(false));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
        mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.reject({ status: false }));
         // act
         tncUpdateHandlerService.presentTncPage(ProfileData);
         // assert
        // expect(mockLogoutHandlerService.onLogout).toHaveBeenCalled();
        // done();
    });

    it('should handle throw error on accept terms and condition', () => {
      // arrange
      mockProfileService.acceptTermsAndConditions = jest.fn(() => throwError({Error: ''}));
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
      mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.reject({ status: false }));
       // act
       tncUpdateHandlerService.presentTncPage(ProfileData);
       // assert
    });
  })
})