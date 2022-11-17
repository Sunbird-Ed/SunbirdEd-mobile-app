import { TncUpdateHandlerService } from "./tnc-update-handler.service";
import { ProfileService, AuthService, CachedItemRequestSourceFrom,OAuthSession, ServerProfileDetailsRequest, ServerProfile, RootOrg, Profile, ProfileType, ProfileSource } from "sunbird-sdk";
import { of } from "rxjs";
import { CommonUtilService } from "../common-util.service";
import { FormAndFrameworkUtilService } from "../formandframeworkutil.service";
import { ModalController } from "@ionic/angular";
import { Router, RouterLink } from "@angular/router";
import { ExternalIdVerificationService } from "../externalid-verification.service";
import { AppGlobalService } from "../app-global-service.service";
import { ConsentService } from "../consent-service";
import { ProfileConstants, RouterLinks } from "../../app/app.constant";
import { FormConstants } from '../../app/form.constants';
import { FieldConfig } from "../../app/components/common-forms/field-config";
import { SharedPreferences } from "@project-sunbird/sunbird-sdk";
import { FrameworkDetailsService } from "../framework-details.service";
import { Events } from '@app/util/events';

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
    isUserLocationAvalable: jest.fn()
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
  const mockFrameworkDetailsService: Partial<FrameworkDetailsService> = {}
  const mockEvents: Partial<Events> = {}

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
    medium: ['sample_medium1', 'sample_medium2'],
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
      mockEvents as Events
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

    it('should get a seesion data', () => {
      // arrange
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
      }, 0)
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
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq)
      }, 0)
    });

    it('should check for BMC profile if user is present', () => {
      // arrange
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig))
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData))
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith(FormConstants.LOCATION_MAPPING)
        expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      }, 0)
    });

    it('should get consent for SSO users', () => {
      // arrange
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve())
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData))
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootorg_other'));
      mockConsentService.getConsent = jest.fn(() => Promise.resolve());
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockConsentService.getConsent).toHaveBeenCalledWith(ProfileData, true);
      }, 0);
    });

    it('should navigate to user type selection if BMC is present', () => {
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
        profileType: ProfileType.OTHER,
        grade: [],
        syllabus: [],
        source: ProfileSource.LOCAL,
        serverProfile: serverProfileData
      };

      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData))
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve(custodianOrgId));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false);
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig));
      const value = mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve());
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false);
      mockRouter.navigate = jest.fn();
      const categoriesProfileData = {
        hasFilledLocation: false,
        showOnlyMandatoryFields: true,
        profile: value['profile'],
        isRootPage: true,
        noOfStepsToCourseToc: 1
      };
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({ requiredFields: ProfileConstants.REQUIRED_FIELDS });
        expect(mockCommonUtilService.isUserLocationAvalable).toHaveBeenCalledWith(ProfileData, locationMappingConfig);
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.USER_TYPE_SELECTION_LOGGEDIN}`]+`, {state: {${categoriesProfileData}}}`)
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
        medium: ['sample_medium'],
        board: ['sample_board'],
        subject: ['sample_subject1', 'sample_subject2'],
        profileType: ProfileType.NONE,
        grade: ['sample_grade'],
        syllabus: ['sample_syllabus'],
        source: ProfileSource.LOCAL,
        serverProfile: serverProfileData
      };
      
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig));
      const value = mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve());
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false);
      mockRouter.navigate = jest.fn();
      const categoriesProfileData = {
        hasFilledLocation: false,
        showOnlyMandatoryFields: true,
        profile: value['profile'],
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
        expect(mockCommonUtilService.isUserLocationAvalable).toHaveBeenCalledWith(ProfileData, locationMappingConfig);
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.USER_TYPE_SELECTION_LOGGEDIN}`]+`, {state: {${categoriesProfileData}}}`)
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
        serverProfile: serverProfileData
      };
      
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig));
      const value = mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve());
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false);
      mockRouter.navigate = jest.fn();
      const categoriesProfileData = {
        hasFilledLocation: false,
        showOnlyMandatoryFields: true,
        profile: value['profile'],
        isRootPage: true,
        noOfStepsToCourseToc: 1
      };
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`]+`, {state: {${categoriesProfileData}}}`)
      }, 0)
    });

    it('should navigate district mapping for other profile type if user location is not available', () => {
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
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve(custodianOrgId));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => (false));
      mockRouter.navigate = jest.fn();
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.isUserLocationAvalable).toHaveBeenCalledWith(ProfileData, locationMappingConfig);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'district-mapping'], {
          state: {
            isShowBackButton: false,
            noOfStepsToCourseToc: 1
          }
      });
      }, 0);
    });

    it('should show year of birth popup for other profile type if user location is available and not SSO user', () => {
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
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve(custodianOrgId));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => (true));
      mockAppGlobalService.showYearOfBirthPopup = jest.fn();
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.isUserLocationAvalable).toHaveBeenCalledWith(ProfileData, locationMappingConfig);
        expect(mockAppGlobalService.showYearOfBirthPopup).toHaveBeenCalledWith(ProfileData.serverProfile)
      }, 0);
    });

    it('should show external id verification for other profile type if user location is available and SSO user', () => {
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
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(locationMappingConfig));
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve('sample_rootorg_other'));
      mockCommonUtilService.isUserLocationAvalable = jest.fn(() => (true));
      mockExternalIdVerificationService.showExternalIdVerificationPopup = jest.fn();
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.isUserLocationAvalable).toHaveBeenCalledWith(ProfileData, locationMappingConfig);
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
      mockAuthService.getSession = jest.fn(() => of(sessionData));
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(ProfileData));
      // mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve())
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
      mockFormAndFrameworkUtilService.getCustodianOrgId = jest.fn(() => Promise.resolve(undefined));
      mockAppGlobalService.closeSigninOnboardingLoader = jest.fn();
      mockExternalIdVerificationService.showExternalIdVerificationPopup = jest.fn();
      // act
      tncUpdateHandlerService.checkForTncUpdate();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.closeSigninOnboardingLoader).toHaveBeenCalled();
        expect(mockExternalIdVerificationService.showExternalIdVerificationPopup).toHaveBeenCalled();
      }, 0);
    });

  });

  describe('presentTncPage', () => {
    it('should open terms and condition page', () => {
      // arrange
      mockProfileService.getServerProfilesDetails = jest.fn(() => of(serverProfileData));
      mockModalController.create = jest.fn(() => Promise.resolve({
        present: jest.fn()
      })) as any;
      // act
      tncUpdateHandlerService.presentTncPage(ProfileData);
      // assert
      setTimeout(() => {
        expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(profileReq);
        expect(mockModalController.create.prototype.present).toHaveBeenCalled();
      }, 0)
    })
  });

  describe('dismissTncPage', () => {
    it('should dismiss a modal terms and condition page, if open', () => {
      // arrange
      tncUpdateHandlerService.modal = true;
      const dismiss = jest.fn();
      mockModalController.create = jest.fn(() => Promise.resolve({
        dismiss
      })) as any;
      // act
      tncUpdateHandlerService.dismissTncPage();
      // assert
      setTimeout(() => {
        expect(dismiss).toHaveBeenCalled();
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
          expect(mockFormAndFrameworkUtilService.getCustodianOrgId).toHaveBeenCalled();
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
          expect(mockFormAndFrameworkUtilService.getCustodianOrgId).toHaveBeenCalled();
        }, 0);
        done();
      }) 
    })
  });
})