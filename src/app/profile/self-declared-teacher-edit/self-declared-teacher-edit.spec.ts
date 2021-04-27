import { of, throwError } from 'rxjs';
import { SelfDeclaredTeacherEditPage } from './self-declared-teacher-edit.page';
import {
    SharedPreferences,
    ProfileService
} from 'sunbird-sdk';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '@app/util/events';
import {
    AppHeaderService,
    CommonUtilService,
    FormAndFrameworkUtilService,
    TelemetryGeneratorService
} from '@app/services';
import {
    InteractSubtype,
    PageId,
    Environment,
    ID,
    InteractType,
    ImpressionType
} from '@app/services/telemetry-constants';
import { FormValidationAsyncFactory } from '@app/services/form-validation-async-factory/form-validation-async-factory';
import { Location } from '@angular/common';
import { PreferenceKey } from '../../app.constant';
import { mockTenantPersonaInfoForm, mockSelfDeclarationForm } from '../../../services/formandframeworkutil.service.spec.data';
import { FormConstants } from '../../form.constants';
import { FieldConfigValidationType } from 'common-form-elements';
import { ConsentService } from '../../../services/consent-service';

describe('SelfDeclaredTeacherEditPage', () => {
    let selfDeclaredTeacherEditPage: SelfDeclaredTeacherEditPage;

    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of(
            { uid: 'sanple_uid' }
        )),
        getServerProfilesDetails: jest.fn(() => of(
        )),
        isDefaultChannelProfile: jest.fn(() => of(true)),
        updateServerProfileDeclarations: jest.fn(() => of({})),
        updateConsent: jest.fn(() => of({}))
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {

    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getUserLocation: jest.fn(() => {
            return { state: 'tripura', district: 'west_tripura' };
        }),
        getOrgLocation: jest.fn(() => {
            return { state: 'tripura', district: 'west_tripura', block: 'dhaleshwar' };
        }),
        isDeviceLocationAvailable: jest.fn(),
        isIpLocationAvailable: jest.fn(),
        getAppName: jest.fn(() => Promise.resolve('Sunbird')),
        translateMessage: jest.fn(),
        showToast: jest.fn(),
        openLink: jest.fn()
    };
    const dismissFn = jest.fn(() => Promise.resolve());
    const presentFn = jest.fn(() => Promise.resolve());
    mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
    }));
    const mockAppHeaderService: Partial<AppHeaderService> = {
        showHeaderWithBackButton: jest.fn()
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    profile: {},
                }
            }
        } as any)),
        navigate: jest.fn()
    };

    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const mockActivatedRoute: Partial<ActivatedRoute> = {
    };
    mockActivatedRoute.snapshot = {
        params: {
            mode: 'add'
        }
    } as any;
    const mockPopOverController: Partial<PopoverController> = {};
    mockPopOverController.create = jest.fn(() => (Promise.resolve({
      present: jest.fn(() => Promise.resolve({})),
      dismiss: jest.fn(() => Promise.resolve({})),
      onDidDismiss: jest.fn(() => Promise.resolve({})),
    } as any)));
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn(),
        generateAuditTelemetry: jest.fn()
    };
    const mockFormValidationAsyncFactory: Partial<FormValidationAsyncFactory> = {
        mobileVerificationAsyncFactory: jest.fn(),
        emailVerificationAsyncFactory: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getCustodianOrgId: jest.fn(() => Promise.resolve({
            orgId: 'sample_org_id'
        })),
        updateLoggedInUser: jest.fn(() => Promise.resolve({}))
    };
    const mockConsentService: Partial<ConsentService> = {};

    beforeAll(() => {
        selfDeclaredTeacherEditPage = new SelfDeclaredTeacherEditPage(
            mockProfileService as ProfileService,
            mockSharedPreferences as SharedPreferences,
            mockAppHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockLocation as Location,
            mockEvents as Events,
            mockPlatform as Platform,
            mockActivatedRoute as ActivatedRoute,
            mockPopOverController as PopoverController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFormValidationAsyncFactory as FormValidationAsyncFactory,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockConsentService as ConsentService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of SelfDeclaredTeacherEditPage', () => {
        // arrange
        // assert
        expect(selfDeclaredTeacherEditPage).toBeTruthy();
    });

    describe('ionViewWillEnter', () => {

        beforeEach(() => {
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
        });
        it('should show app header with back button', () => {
            // arrange
            // act
            selfDeclaredTeacherEditPage.ionViewWillEnter();
            // assert
            expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        });

        it('should generate INTERACT and IMPRESSION telemetry', (done) => {
            // arrange
            // act
            selfDeclaredTeacherEditPage.ionViewWillEnter().then(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.SUBMISSION_INITIATED,
                    InteractSubtype.NEW,
                    Environment.USER,
                    PageId.TEACHER_SELF_DECLARATION,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    ID.TEACHER_DECLARATION);
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '',
                    PageId.TEACHER_SELF_DECLARATION,
                    Environment.USER);
                done();
            });

        });

        describe('checkLocationAvailability', () => {
            it('should populate available state and district if profile details has userLocation', () => {
                // arrange
                mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
                mockCommonUtilService.isIpLocationAvailable = jest.fn(() => Promise.resolve(false));
                selfDeclaredTeacherEditPage['profile'] = {
                    userLocations: [
                        { type: 'state', name: 'Odisha' },
                        { type: 'district', name: 'Cuttack' },
                        { type: 'block', name: 'CMC' }]
                };

                // act
                selfDeclaredTeacherEditPage.ionViewWillEnter();
                // assert
                expect(selfDeclaredTeacherEditPage['availableLocationState']).toEqual('Odisha');
                expect(selfDeclaredTeacherEditPage['availableLocationDistrict']).toEqual('Cuttack');
            });

            // tslint:disable-next-line:max-line-length
            it('should populate available state and district if profile details doesnt have userLocation but device location is available', () => {
                // arrange
                mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true));
                mockCommonUtilService.isIpLocationAvailable = jest.fn(() => Promise.resolve(false));
                selfDeclaredTeacherEditPage['profile'] = {
                    userLocations: []
                };
                mockSharedPreferences.getString = jest.fn((key) => {
                    switch (key) {
                        case PreferenceKey.DEVICE_LOCATION:
                            return of('{\"state\":\"Odisha\",\"district\":\"Cuttack\"}');
                    }
                });

                // act
                selfDeclaredTeacherEditPage.ionViewWillEnter();
                // assert
                expect(selfDeclaredTeacherEditPage['availableLocationState']).toEqual('Odisha');
                expect(selfDeclaredTeacherEditPage['availableLocationDistrict']).toEqual('Cuttack');
            });

            // tslint:disable-next-line:max-line-length
            it('should populate available state and district if profile details doesnt have userLocation but IP location is available', () => {
                // arrange
                mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
                mockCommonUtilService.isIpLocationAvailable = jest.fn(() => Promise.resolve(true));
                selfDeclaredTeacherEditPage['profile'] = {
                    userLocations: []
                };
                mockSharedPreferences.getString = jest.fn((key) => {
                    switch (key) {
                        case PreferenceKey.IP_LOCATION:
                            return of('{\"state\":\"Odisha\",\"district\":\"Cuttack\"}');
                    }
                });

                // act
                selfDeclaredTeacherEditPage.ionViewWillEnter();
                // assert
                expect(selfDeclaredTeacherEditPage['availableLocationState']).toEqual('Odisha');
                expect(selfDeclaredTeacherEditPage['availableLocationDistrict']).toEqual('Cuttack');
            });

        });

    });


    describe('ionViewDidEnter', () => {

        it('should show app header with back button', () => {
            // arrange
            selfDeclaredTeacherEditPage['profile'] = {
                rootOrg: { rootOrgId: '0123456789' },
                declarations: [
                    {
                        persona: 'teacher',
                        errorType: null,
                        orgId: '01269934121990553633',
                        status: 'SUBMITTED',
                        info: {
                            'declared-email': 'consentuser1@yopmail.com',
                            ' declared-ext-id': 'test 124',
                            ' declared-phone': '123456789'
                        }
                    }
                ]
            };
            mockFormAndFrameworkUtilService.getFormFields = jest.fn((key) => {
                switch (key) {
                    case FormConstants.TENANT_PERSONAINFO:
                        return Promise.resolve(mockTenantPersonaInfoForm);
                    case FormConstants.SELF_DECLARATION:
                        return Promise.resolve(mockSelfDeclarationForm);
                }
            });
            // act
            selfDeclaredTeacherEditPage.ionViewDidEnter();
            // assert
            // expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        });
    });

    describe('submit', () => {

        it('should show NO_NETWORK error if network is not available', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            // act
            selfDeclaredTeacherEditPage.submit();
            // assert
           // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NEED_INTERNET_TO_CHANGE');
        });

        it('should invoke updateServerProfileDeclarations and show success popup if network is available', (done) => {
            // arrange
            selfDeclaredTeacherEditPage['editType'] = 'add';
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            selfDeclaredTeacherEditPage['profile'] = {
                rootOrg: { rootOrgId: '0123456789' },
                declarations: [
                ]
            };
            selfDeclaredTeacherEditPage['declaredLatestFormValue'] = {
                externalIds: '',
                children: {
                    externalIds: {
                        'declared-phone': '123456789',
                        'declared-email': 'consentuser1@yopmail.com',
                        'declared-ext-id': 'test 124',
                        'declared-no': {},
                        'declared-mob': ''
                    }
                }
            };

            selfDeclaredTeacherEditPage['tenantPersonaLatestFormValue'] = {
                persona: 'teacher',
                tenant: '01269934121990553633'
            };
            // act
            selfDeclaredTeacherEditPage.submit().then(() => {
                // assert
                expect(mockProfileService.updateServerProfileDeclarations).toHaveBeenCalled();
              //  expect(mockPopOverController.create).toHaveBeenCalled();
                done();
            });

        });

        it('should invoke updateServerProfileDeclarationspp and show success popup if network is available', (done) => {
            // arrange
            selfDeclaredTeacherEditPage['editType'] = 'add';
            selfDeclaredTeacherEditPage['tenantPersonaLatestFormValue'] = {
                persona: 'teacher',
                tenant: '012699341219905536331'
            };
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            selfDeclaredTeacherEditPage['profile'] = {
                rootOrg: { rootOrgId: '0123456789' },
                declarations:  [
                    {
                        persona: 'teacher',
                        errorType: null,
                        orgId: '01269934121990553633',
                        status: 'SUBMITTED'
                    }
                ]
            };
            selfDeclaredTeacherEditPage['declaredLatestFormValue'] = {
                externalIds: '',
                children: {
                    externalIds: {
                        'declared-phone': '123456789',
                        'declared-email': 'consentuser1@yopmail.com',
                        'declared-ext-id': 'test 124',
                        'declared-no': {},
                        'declared-mob': ''
                    }
                }
            };

            // act
            selfDeclaredTeacherEditPage.submit().then(() => {
                // assert
                expect(mockProfileService.updateServerProfileDeclarations).toHaveBeenCalled();
              //  expect(mockPopOverController.create).toHaveBeenCalled();
                done();
            });

        });

        it('should invoke updateServerProfileDeclarationspp and show success toast if network is available', (done) => {
            // arrange
            selfDeclaredTeacherEditPage['editType'] = 'edit';
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockCommonUtilService.translateMessage = jest.fn(() => 'sample_translation');
            selfDeclaredTeacherEditPage['profile'] = {
                rootOrg: { rootOrgId: '0123456789' },
                declarations: [
                    {
                        persona: 'teacher',
                        errorType: null,
                        orgId: '01269934121990553633',
                        status: 'SUBMITTED',
                        info: {
                            'declared-email': 'consentuser1@yopmail.com',
                            'declared-ext-id': 'test 124',
                            'declared-phone': '123456789'
                        }
                    }
                ]
            };
            selfDeclaredTeacherEditPage['declaredLatestFormValue'] = {
                externalIds: '',
                children: {
                    externalIds: {
                        'declared-phone': '123456789',
                        'declared-email': 'consentuser1@yopmail.com',
                        'declared-ext-id': 'test 124',
                    }
                }
            };

            selfDeclaredTeacherEditPage['tenantPersonaLatestFormValue'] = {
                persona: 'teacher',
                tenant: '01269934121990553633'
            };
            // act
            selfDeclaredTeacherEditPage.submit().then(() => {
                // assert
                expect(mockProfileService.updateServerProfileDeclarations).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('sample_translation');
                done();
            });

        });


        it('should invoke updateServerProfileDeclarationspp and show error toast in case of any error', (done) => {
            // arrange
            selfDeclaredTeacherEditPage['editType'] = 'edit';
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockCommonUtilService.translateMessage = jest.fn(() => 'sample_translation');
            mockProfileService.updateServerProfileDeclarations = jest.fn(() =>  throwError({}));
            selfDeclaredTeacherEditPage['profile'] = {
                rootOrg: { rootOrgId: '0123456789' },
                uid: 'sample_uid',
                declarations: [
                    {
                        persona: 'teacher',
                        errorType: null,
                        orgId: '01269934121990553633',
                        status: 'SUBMITTED',
                        info: {
                            'declared-email': 'consentuser1@yopmail.com',
                            'declared-ext-id': 'test 124',
                            'declared-phone': '123456789'
                        }
                    }
                ]
            };
            selfDeclaredTeacherEditPage['declaredLatestFormValue'] = {
                externalIds: '',
                children: {
                    externalIds: {
                        'declared-phone': '123456789',
                        'declared-email': 'consentuser1@yopmail.com',
                        'declared-ext-id': 'test 124',
                    }
                }
            };

            selfDeclaredTeacherEditPage['tenantPersonaLatestFormValue'] = {
                persona: 'teacher',
                tenant: '01269934121990553633'
            };
            // act
            selfDeclaredTeacherEditPage.submit().then(() => {
                // assert
                expect(mockProfileService.updateServerProfileDeclarations).toHaveBeenCalled();
                done();
            });

        });
    });

    describe('tenantPersonaFormValueChanges', () => {

        it('should invoke initTenantSpecificForm method with the given tenant in the event', () => {
            // arrange
            selfDeclaredTeacherEditPage['selectedTenant'] = undefined;
            const initFormMock =   jest.spyOn(selfDeclaredTeacherEditPage, 'initTenantSpecificForm');
            // act
            selfDeclaredTeacherEditPage.tenantPersonaFormValueChanges({
                tenant: '01234567890',
                persona: 'teacher'
            });
            // assert
            expect(initFormMock).toHaveBeenCalledWith('01234567890', false);
        });

        it('should invoke initTenantSpecificForm method with the given tenant in the event', () => {
            // arrange
            const initFormMock =   jest.spyOn(selfDeclaredTeacherEditPage, 'initTenantSpecificForm');
            selfDeclaredTeacherEditPage['selectedTenant'] = '01234567891';
            // act
            selfDeclaredTeacherEditPage.tenantPersonaFormValueChanges({
                tenant: '01234567890',
                persona: 'teacher'
            });
            // assert
            expect(initFormMock).toHaveBeenCalledWith('01234567890', true);
        });

        it('should not invoke initTenantSpecificForm method with the given tenant in the event', () => {
            // arrange
            const initFormMock =   jest.spyOn(selfDeclaredTeacherEditPage, 'initTenantSpecificForm');
            selfDeclaredTeacherEditPage['selectedTenant'] = '01234567891';
            // act
            selfDeclaredTeacherEditPage.tenantPersonaFormValueChanges(undefined);
            // assert
            expect(initFormMock).not.toHaveBeenCalledWith('01234567890', true);
        });

    });

    describe('declarationFormValueChanges', () => {

        it('should not populate selected state code if the event doent contain declared state', () => {
            // arrange
            // act
            selfDeclaredTeacherEditPage.declarationFormValueChanges({
                children: undefined
            });
            // assert
            expect(selfDeclaredTeacherEditPage['selectedStateCode']).toBeUndefined();
        });

        it('should populate selected state code if the event contains declared state', () => {
            // arrange
            // act
            selfDeclaredTeacherEditPage.declarationFormValueChanges({
                children: {
                    externalIds: {
                        'declared-phone': '123456789',
                        'declared-email': 'consentuser1@yopmail.com',
                        'declared-ext-id': 'test 124',
                        'declared-state' : 'sample_state_code'
                    }
                }
            });
            // assert
            expect(selfDeclaredTeacherEditPage['selectedStateCode']).toEqual('sample_state_code');
        });

        it('should initialize the tenant form is selected state and the declared-state is different', () => {
            // arrange
            selfDeclaredTeacherEditPage['selectedStateCode'] = 'sample_test_code_1';
            selfDeclaredTeacherEditPage['stateList'] = [{
                code: 'sample_state_code',
                id: 'sample_state_id'
            }];
            const initFormMock =   jest.spyOn(selfDeclaredTeacherEditPage, 'initTenantSpecificForm');
            // act
            selfDeclaredTeacherEditPage.declarationFormValueChanges({
                children: {
                    externalIds: {
                        'declared-phone': '123456789',
                        'declared-email': 'consentuser1@yopmail.com',
                        'declared-ext-id': 'test 124',
                        'declared-state' : 'sample_state_code'
                    }
                }
            });
            // assert
            expect(initFormMock).toHaveBeenCalledWith('sample_state_id', true);
        });

        it('should initialize the tenant form is selected state and the declared-state is different', () => {
            // arrange
            selfDeclaredTeacherEditPage['selectedStateCode'] = 'sample_test_code_1';
            selfDeclaredTeacherEditPage['stateList'] = [];
            const initFormMock =   jest.spyOn(selfDeclaredTeacherEditPage, 'initTenantSpecificForm');
            // act
            selfDeclaredTeacherEditPage.declarationFormValueChanges({
                children: {
                    externalIds: {
                        'declared-phone': '123456789',
                        'declared-email': 'consentuser1@yopmail.com',
                        'declared-ext-id': 'test 124',
                        'declared-state' : 'sample_state_code'
                    }
                }
            });
            // assert
            expect(initFormMock).toHaveBeenCalledWith(null, true);
        });
    });

    describe('tenantPersonaFormStatusChanges', () => {
        it('should populate isTenantPersonaFormValid', () => {
            // arrange
            // act
            selfDeclaredTeacherEditPage.tenantPersonaFormStatusChanges({ isValid: true});
            // assert
            expect(selfDeclaredTeacherEditPage['isTenantPersonaFormValid']).toBeTruthy();
        });

        it('should populate isTenantPersonaFormValid', () => {
            // arrange
            // act
            selfDeclaredTeacherEditPage.tenantPersonaFormStatusChanges({ valid: true});
            // assert
            expect(selfDeclaredTeacherEditPage['isTenantPersonaFormValid']).toBeTruthy();
        });
    });

    describe('declarationFormStatusChanges', () => {
        it('should populate isDeclarationFormValid', () => {
            // arrange
            // act
            selfDeclaredTeacherEditPage.declarationFormStatusChanges({ isValid: true});
            // assert
            expect(selfDeclaredTeacherEditPage['isDeclarationFormValid']).toBeTruthy();
        });
    });

    describe('linkClicked', () => {
        it('should invoke openLink method', () => {
            // arrange
            // act
            selfDeclaredTeacherEditPage.linkClicked('sample_link');
            // assert
            expect(mockCommonUtilService.openLink).toHaveBeenCalledWith('sample_link');
        });
    });

    describe('ionViewWillLeave', () => {
        it('should invoke openLink method', () => {
            // arrange
            const unsubscribeFn = jest.fn();
            selfDeclaredTeacherEditPage['backButtonFunc'] = {
                unsubscribe: unsubscribeFn
            } as any;
            // act
            selfDeclaredTeacherEditPage.ionViewWillLeave();
            // assert
            expect(unsubscribeFn).toHaveBeenCalled();
        });
    });


    describe('assignDefaultValue', () => {
        it('should update the default declared phone number ', () => {
            // arrange
            selfDeclaredTeacherEditPage['editType'] = 'add';
            selfDeclaredTeacherEditPage['profile'] = {
                rootOrg: { rootOrgId: '0123456789' },
                maskedEmail: 'sample_masked_email',
                maskedPhone: 1234567,
                declarations: [
                    {
                        persona: 'teacher',
                        errorType: null,
                        orgId: '01269934121990553633',
                        status: 'SUBMITTED',
                        info: {
                            'declared-email': 'consentuser1@yopmail.com',
                            'declared-ext-id': 'test 124',
                            'declared-phone': '123456789'
                        }
                    }
                ]
            };
            selfDeclaredTeacherEditPage['declaredLatestFormValue'] = {
                externalIds: '',
                children: {
                    externalIds: {
                        'declared-phone': '123456789',
                        'declared-email': 'consentuser1@yopmail.com',
                        'declared-ext-id': 'test 124',
                        'declared-no': {},
                        'declared-mob': ''
                    }
                }
            };
            // act
            const childConfig = selfDeclaredTeacherEditPage['assignDefaultValue']({
                code: 'declared-phone',
                fieldName: 'Mobile Number',
                templateOptions: {
                  labelHtml: {
                    contents: '<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>',
                    values: {
                      $0: 'Mobile Number'
                    }
                  },
                  placeHolder: 'Enter Mobile Number',
                  prefix: '+91 -',
                  label: ''
                },
                validations: [
                  {
                    type: FieldConfigValidationType.REQUIRED,
                    value: true,
                    message: 'Mobile number is required'
                  },
                  {
                    type: FieldConfigValidationType.REQUIRED,
                    value: '^[6-9*][0-9*]{9}$',
                    message: 'Enter a valid mobile number'
                  }
                ],
                asyncValidation: {
                  marker: 'MOBILE_OTP_VALIDATION',
                  message: 'Validate your mobile number',
                  trigger: 'validate'
                }
              } as any, false);
            // assert
            expect(childConfig.default).toEqual(1234567);
        });

        it('should update the default declared email ', () => {
            // arrange
            selfDeclaredTeacherEditPage['editType'] = 'add';
            selfDeclaredTeacherEditPage['profile'] = {
                rootOrg: { rootOrgId: '0123456789' },
                maskedEmail: 'sample_masked_email',
                maskedPhone: 1234567,
                declarations: [
                    {
                        persona: 'teacher',
                        errorType: null,
                        orgId: '01269934121990553633',
                        status: 'SUBMITTED',
                        info: {
                            'declared-email': 'consentuser1@yopmail.com',
                            'declared-ext-id': 'test 124',
                            'declared-phone': '123456789'
                        }
                    }
                ]
            };
            selfDeclaredTeacherEditPage['declaredLatestFormValue'] = {
                externalIds: '',
                children: {
                    externalIds: {
                        'declared-phone': '123456789',
                        'declared-email': 'consentuser1@yopmail.com',
                        'declared-ext-id': 'test 124',
                        'declared-no': {},
                        'declared-mob': ''
                    }
                }
            };
            // act
            const childConfig = selfDeclaredTeacherEditPage['assignDefaultValue']({
                code: 'declared-email',
                fieldName: 'Emailid',
                templateOptions: {
                  labelHtml: {
                    contents: '<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>',
                    values: {
                      $0: 'Email'
                    }
                  },
                  placeHolder: 'Enter Email',
                  label: ''
                },
                validations: [
                  {
                    type: FieldConfigValidationType.REQUIRED,
                    value: true,
                    message: 'Mobile number is required'
                  }
                ],
                asyncValidation: {
                  marker: 'MOBILE_OTP_VALIDATION',
                  message: 'Validate your email id',
                  trigger: 'validate'
                }
              } as any, false);
            // assert
            expect(childConfig.default).toEqual('sample_masked_email');
        });

        it('should not update the default declared email ', () => {
            // arrange
            selfDeclaredTeacherEditPage['editType'] = 'add';
            selfDeclaredTeacherEditPage['profile'] = {
                rootOrg: { rootOrgId: '0123456789' },
                maskedEmail: 'sample_masked_email',
                maskedPhone: 1234567,
                declarations: [
                    {
                        persona: 'teacher',
                        errorType: null,
                        orgId: '01269934121990553633',
                        status: 'SUBMITTED',
                        info: {
                            'declared-email': 'consentuser1@yopmail.com',
                            'declared-ext-id': 'test 124',
                            'declared-phone': '123456789'
                        }
                    }
                ]
            };
            selfDeclaredTeacherEditPage['declaredLatestFormValue'] = {
                externalIds: '',
                children: {
                    externalIds: {
                        'declared-phone': '123456789',
                        'declared-email': 'consentuser1@yopmail.com',
                        'declared-ext-id': 'test 124',
                        'declared-no': {},
                        'declared-mob': ''
                    }
                }
            };
            // act
            const childConfig = selfDeclaredTeacherEditPage['assignDefaultValue']({
                code: 'declared-email',
                fieldName: 'Emailid',
                templateOptions: {
                  labelHtml: {
                    contents: '<span>$0&nbsp;<span class=\"required-asterisk\">*</span></span>',
                    values: {
                      $0: 'Email'
                    }
                  },
                  placeHolder: 'Enter Email',
                  label: ''
                },
                validations: [
                  {
                    type: FieldConfigValidationType.REQUIRED,
                    value: true,
                    message: 'Mobile number is required'
                  }
                ],
                asyncValidation: {
                  marker: 'MOBILE_OTP_VALIDATION',
                  message: 'Validate your email id',
                  trigger: 'validate'
                }
              } as any, true);
            // assert
            expect(childConfig.default).not.toEqual('sample_masked_email');
        });
    });

    // describe('showAddedSuccessfullPopup', () => {
    //     it('should open consent popup', (done) => {
    //         mockProfileService.getActiveSessionProfile = jest.fn(() => of({}));
    //         mockPopOverController.create = jest.fn(() => (Promise.resolve({
    //             present: jest.fn(() => Promise.resolve({})),
    //             onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
    //           } as any)));
    //         mockCommonUtilService.translateMessage = jest.fn(() => 'sample-message');
    //         mockConsentService.getConsent = jest.fn(() => Promise.resolve());
    //         // act
    //         selfDeclaredTeacherEditPage.showAddedSuccessfullPopup();
    //         // assert
    //         setTimeout(() => {
    //             expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
    //             expect(mockPopOverController.create).toHaveBeenCalled();
    //             expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1,
    //                 'THANK_YOU_FOR_SUBMITTING_YOUR_DETAILS');
    //             expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2,
    //                 'FRMELEMNTS_MSG_SELFDECLARATION_SUCCESS_INFO');
    //             expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3,
    //                 'OK');
    //             expect(mockConsentService.getConsent).toHaveBeenCalled();
    //             done();
    //         }, 0);
    //     });

    //     it('should not open consent popup', (done) => {
    //         mockProfileService.getActiveSessionProfile = jest.fn(() => of({}));
    //         mockPopOverController.create = jest.fn(() => (Promise.resolve({
    //             present: jest.fn(() => Promise.resolve({})),
    //             onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: false } }))
    //           } as any)));
    //         mockCommonUtilService.translateMessage = jest.fn(() => 'sample-message');
    //         // act
    //         selfDeclaredTeacherEditPage.showAddedSuccessfullPopup();
    //         // assert
    //         setTimeout(() => {
    //             expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
    //             expect(mockPopOverController.create).toHaveBeenCalled();
    //             expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1,
    //                 'THANK_YOU_FOR_SUBMITTING_YOUR_DETAILS');
    //             expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2,
    //                 'FRMELEMNTS_MSG_SELFDECLARATION_SUCCESS_INFO');
    //             expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3,
    //                 'OK');
    //             done();
    //         }, 0);
    //     });
    // });

});
