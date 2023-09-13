import { DistrictMappingPage } from '../district-mapping/district-mapping.page';
import {
    AppGlobalService, AppHeaderService, CommonUtilService,
    FormAndFrameworkUtilService, TelemetryGeneratorService, AuditType, InteractType, CorReleationDataType, InteractSubtype
} from '../../services';
import { featureIdMap } from '../../feature-id-map';
import { PageId, Environment, ImpressionType } from '../../services/telemetry-constants';
import { DeviceInfo } from '../../../../sunbird-mobile-sdk/src/util/device';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { Events } from '../../util/events';
import { of, throwError } from 'rxjs';
import {
    ProfileService, Profile, SharedPreferences, ProfileType, ProfileSource, DeviceRegisterResponse,
    DeviceRegisterService
} from '@project-sunbird/sunbird-sdk';
import { PreferenceKey } from '../../app/app.constant';
import { FormLocationFactory } from '../../services/form-location-factory/form-location-factory';
import { LocationHandler } from '../../services/location-handler';
import { ProfileHandler } from '../../services/profile-handler';
import { AuditState, CorrelationData } from '@project-sunbird/sunbird-sdk';
import { TncUpdateHandlerService } from '../../services/handlers/tnc-update-handler.service';
import { ExternalIdVerificationService } from '../../services/externalid-verification.service';
import { RouterLinks } from '../app.constant';

describe('DistrictMappingPage', () => {
    let districtMappingPage: DistrictMappingPage;
    const mockHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn()
    };
    const presentFn = jest.fn(() => Promise.resolve());
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => ''),
        showToast: jest.fn(),
        isDeviceLocationAvailable: jest.fn(() => undefined)
    };
    const profile: Profile = {
        uid: '12345',
        handle: 'sample_profile',
        source: ProfileSource.SERVER,
        profileType: ProfileType.TEACHER
    };
    const mockProfileService: Partial<ProfileService> = {
        searchLocation: jest.fn(() => of([])),
        updateServerProfile: jest.fn(() => of(profile))
    };
    const mockPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(() => of(undefined))
    };
    const mockDeviceRegisterService: Partial<DeviceRegisterService> = {
        registerDevice: jest.fn(() => of({} as DeviceRegisterResponse))
    };
    const mockDeviceInfo: Partial<DeviceInfo> = {
        isKeyboardShown: jest.fn(() => of(true))
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockRouter: Partial<Router> = {
        navigate: jest.fn(),
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    noOfStepsToCourseToc : '2',
                    isGoogleSignIn : true,
                    userData : {
                        isMinor : false
                    }
                }
            }
        })) as any
    };
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        isUserLoggedIn: jest.fn(() => true),
        getCurrentUser: jest.fn(() => profile),
        closeSigninOnboardingLoader: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn()
    };
    const mockFormLocationFactory: Partial<FormLocationFactory> = {};
    const mockLocationHandler: Partial<LocationHandler> = {
    };
    const mockProfileHandler: Partial<ProfileHandler> = {
    };
    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {};
    const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {}

    beforeAll(() => {
        //  window.history.state.source({query: 'google'}, 'MOCK');
        districtMappingPage = new DistrictMappingPage(
            mockProfileService as ProfileService,
            mockPreferences as SharedPreferences,
            mockDeviceRegisterService as DeviceRegisterService,
            mockDeviceInfo as DeviceInfo,
            mockHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockRouter as Router,
            mockLocation as Location,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockPlatform as Platform,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFormLocationFactory as FormLocationFactory,
            mockLocationHandler as LocationHandler,
            mockProfileHandler as ProfileHandler,
            mockTncUpdateHandlerService as TncUpdateHandlerService,
            mockExternalIdVerificationService as ExternalIdVerificationService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of DistrictMappingPage', () => {
        expect(districtMappingPage).toBeTruthy();
    });

    describe('goBack', () => {
        beforeEach(() => {
            window.history.pushState({ sourc: 'sample-source' }, '', '');
        });

        it('should generate back clicked telemetry', () => {
            // arrange
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            // act
            districtMappingPage.goBack(false);
            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                true,
                Environment.ONBOARDING,
                PageId.LOCATION
            );
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.DISTRICT_MAPPING,
                Environment.ONBOARDING,
                false);
        });
    });

    describe('handleDeviceBackButton', () => {
        beforeEach(() => {
            window.history.pushState({ isShowBackButton: true }, '', '');
        });
        it('should handle devices back button', () => {
            // arrange
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            jest.spyOn(districtMappingPage, 'goBack').mockImplementation();
            // act
            districtMappingPage.handleDeviceBackButton();
            // arrange
            expect(subscribeWithPriorityData).toHaveBeenCalledWith(10, expect.any(Function));
        });
    });

    describe('ionViewWillEnter', () => {
        beforeEach(() => {
            window.history.pushState({ isShowBackButton: true }, '', '');
        });
        it('should unsubscribe backButton', () => {
            districtMappingPage.ionViewWillLeave();
        });
    })

    it('should generate location capture telemetry', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const isEdited = true;
        // act
        districtMappingPage.generateLocationCaptured(true);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.LOCATION_CAPTURED,
            Environment.ONBOARDING,
            PageId.DISTRICT_MAPPING,
            undefined,
            {
              isEdited
            }, undefined,
            [{id: 'user:location_capture', type: 'Feature'}, {id: 'SB-14682', type: 'Task'}]
        );
    });

    describe('isStateorDistrictChanged', () => {
        it('should return changeStatue for state change', () => {
            // arrange
            const locationCodes = [{
                type: 'state',
                code: 'new-code'
            }];
            // act
            const data = districtMappingPage.isStateorDistrictChanged(locationCodes);
            // assert
            expect(data).toBeUndefined();
        });
    });

    describe('submit', () => {
        beforeEach(() => {
            window.history.pushState({ isShowBackButton: true }, '', '');
        });

        it('should generate generateSubmitInteractEvent', () => {
            // arrange
            mockRouter.getCurrentNavigation = jest.fn(() => ({
                extras: {
                    state: {
                        noOfStepsToCourseToc : '2',
                        isGoogleSignIn : true,
                        userData : {
                            isMinor : false
                        }
                    }
                }
            })) as any
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const correlationList: Array<CorrelationData> = [];
            correlationList.push({ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI });
            // act
            districtMappingPage.generateSubmitInteractEvent(correlationList);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.SELECT_SUBMIT, '',
                Environment.ONBOARDING,
                PageId.LOCATION,
                undefined,
                undefined,
                undefined,
                correlationList
            );
        });

        it('should not submit form details for offline', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            districtMappingPage.formGroup = {
                value: {
                    children: {
                        persona: {
                            type: { type: 'sample-type' },
                            code: 'sample-code',
                            subPersona: 'sample-subpersona'
                        }
                    },
                    name: 'sample name',
                    persona: {
                        type: { type: 'sample-type' },
                        code: 'sample-code',
                        subPersona: [{}]
                    }
                }
            } as any;
            mockRouter.getCurrentNavigation = jest.fn(() => ({
                extras: {
                    state: {
                        noOfStepsToCourseToc : '2',
                        isGoogleSignIn : true,
                        userData : {
                            isMinor : false
                        }
                    }
                }
            })) as any
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockDeviceRegisterService.registerDevice = jest.fn(() => of({}));
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            jest.spyOn(districtMappingPage, 'generateSubmitInteractEvent').mockImplementation();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(districtMappingPage, 'isStateorDistrictChanged').mockImplementation(() => {
                return {};
            });
            mockCommonUtilService.showToast = jest.fn();
            // act
            districtMappingPage.submit();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toBeTruthy();
                expect(presentFn).toHaveBeenCalledWith();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                expect(mockDeviceRegisterService.registerDevice).toHaveBeenCalled();
                expect(mockCommonUtilService.handleToTopicBasedNotification).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('INTERNET_CONNECTIVITY_NEEDED');
                expect(dismissFn).toHaveBeenCalledWith();
                done();
            }, 0);
        });

        it('should submit form details', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(true));
            districtMappingPage.formGroup = {
                value: {
                    children: {
                        persona: {
                            type: { type: 'sample-type' },
                            code: 'sample-code',
                            subPersona: [{}]
                        }
                    },
                    name: 'sample name',
                    persona: {
                        type: { type: 'sample-type' },
                        code: 'sample-code',
                        subPersona: [{}]
                    }
                }
            } as any;
            mockRouter.getCurrentNavigation = jest.fn(() => ({
                extras: {
                    state: {
                        noOfStepsToCourseToc : '2',
                        isGoogleSignIn : true,
                        userData : {
                            isMinor : false
                        }
                    }
                }
            })) as any
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockDeviceRegisterService.registerDevice = jest.fn(() => of({}));
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            jest.spyOn(districtMappingPage, 'generateSubmitInteractEvent').mockImplementation();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(districtMappingPage, 'isStateorDistrictChanged').mockImplementation(() => {
                return {};
            });
            districtMappingPage.profile = {
                uid: 'sample-uid'
            };
            mockProfileService.updateServerProfile = jest.fn(() => of({}));
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            jest.spyOn(districtMappingPage, 'generateLocationCaptured').mockImplementation();
            mockCommonUtilService.showToast = jest.fn();
            // act
            districtMappingPage.submit();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toBeTruthy();
                expect(presentFn).toHaveBeenCalledWith();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(mockDeviceRegisterService.registerDevice).toHaveBeenCalled();
                expect(mockCommonUtilService.handleToTopicBasedNotification).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should submit form details and goback previous page', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockRouter.getCurrentNavigation = jest.fn(() => ({
                extras: {
                    state: {
                        noOfStepsToCourseToc : '2',
                        isGoogleSignIn : true,
                        userData : {
                            isMinor : false
                        }
                    }
                }
            })) as any
            districtMappingPage.formGroup = {
                value: {
                    children: {
                        persona: {
                            type: { type: 'sample-type' },
                            code: 'sample-code',
                            subPersona: [{}]
                        }
                    },
                    name: 'sample name',
                    persona: {
                        type: { type: 'sample-type' },
                        code: 'sample-code',
                        subPersona: [{}]
                    }
                }
            } as any;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockDeviceRegisterService.registerDevice = jest.fn(() => of({}));
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            jest.spyOn(districtMappingPage, 'generateSubmitInteractEvent').mockImplementation();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(districtMappingPage, 'isStateorDistrictChanged').mockImplementation(() => {
                return {};
            });
            districtMappingPage.profile = {
                uid: 'sample-uid'
            };
            mockProfileService.updateServerProfile = jest.fn(() => of({}));
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            jest.spyOn(districtMappingPage, 'generateLocationCaptured').mockImplementation();
            mockCommonUtilService.showToast = jest.fn();
            mockAppGlobalService.isJoinTraningOnboardingFlow = true;
            // act
            districtMappingPage.submit();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toBeTruthy();
                expect(presentFn).toHaveBeenCalledWith();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(mockDeviceRegisterService.registerDevice).toHaveBeenCalled();
                expect(mockCommonUtilService.handleToTopicBasedNotification).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                // expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                // expect(mockCommonUtilService.isDeviceLocationAvailable).toHaveBeenCalled();
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('PROFILE_UPDATE_SUCCESS');
                done();
            }, 0);
        });

        it('should not submit form details for update profile catch part', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            districtMappingPage.formGroup = {
                value: {
                    children: {
                        persona: {
                            type: { type: 'sample-type' },
                            code: 'sample-code'
                        }
                    },
                    name: 'sample name'
                }
            } as any;
            mockRouter.getCurrentNavigation = jest.fn(() => ({
                extras: {
                    state: {
                        noOfStepsToCourseToc : '2',
                        isGoogleSignIn : true,
                        userData : {
                            isMinor : false
                        }
                    }
                }
            })) as any
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockDeviceRegisterService.registerDevice = jest.fn(() => of({}));
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            jest.spyOn(districtMappingPage, 'generateSubmitInteractEvent').mockImplementation();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(districtMappingPage, 'isStateorDistrictChanged').mockImplementation(() => {
                return {};
            });
            districtMappingPage.profile = {
                uid: 'sample-uid'
            };
            mockProfileService.updateServerProfile = jest.fn(() => throwError({}));
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            jest.spyOn(districtMappingPage, 'generateLocationCaptured').mockImplementation();
            mockCommonUtilService.showToast = jest.fn();
            mockAppGlobalService.isJoinTraningOnboardingFlow = true;
            mockLocation.back = jest.fn();
            // act
            districtMappingPage.submit();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toBeTruthy();
                expect(presentFn).toHaveBeenCalledWith();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(mockDeviceRegisterService.registerDevice).toHaveBeenCalled();
                expect(mockCommonUtilService.handleToTopicBasedNotification).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should submit form details for guest user', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockRouter.getCurrentNavigation = jest.fn(() => ({
                extras: {
                    state: {
                        noOfStepsToCourseToc : '2',
                        isGoogleSignIn : true,
                        userData : {
                            isMinor : false
                        }
                    }
                }
            })) as any
            districtMappingPage.formGroup = {
                value: {
                    children: {
                        persona: {
                            type: { type: 'sample-type' },
                            code: 'sample-code'
                        }
                    },
                    name: 'sample name'
                }
            } as any;
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockDeviceRegisterService.registerDevice = jest.fn(() => of({}));
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            mockAppGlobalService.setOnBoardingCompleted = jest.fn(() => Promise.resolve());
            mockTelemetryGeneratorService.generateAuditTelemetry = jest.fn();
            // act
            districtMappingPage.submit();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toBeTruthy();
                expect(presentFn).toHaveBeenCalledWith();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(mockDeviceRegisterService.registerDevice).toHaveBeenCalled();
                expect(mockCommonUtilService.handleToTopicBasedNotification).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateAuditTelemetry).toHaveBeenCalledWith(
                    Environment.ONBOARDING,
                    AuditState.AUDIT_UPDATED,
                    undefined,
                    AuditType.SET_PROFILE,
                    undefined,
                    undefined,
                    undefined,
                    [{ id: '', type: 'sample-type' }]
                );
                expect(mockAppGlobalService.setOnBoardingCompleted).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('ionViewWillEnter', () => {
        beforeEach(() => {
            window.history.pushState({ isShowBackButton: true }, '', '');
        });
        it('should initialized form data', (done) => {
            // arrange
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                serveProfile: {
                    firstName: 'sample-name',
                    userType: ProfileType.TEACHER
                },
                profileType: ProfileType.TEACHER,
                handle: 'sample-name'
            }));
            mockLocationHandler.getAvailableLocation = jest.fn(() => Promise.resolve([{
                state: {code: 'sample-code', name: 'sample-name'},
                district: {code: 'sample-code', name: 'sample-name'},
            }])) as any;
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
                code: 'name',
                default: 'default',
                templateOptions: {
                    hidden: false
                }
            }, {
                code: 'persona',
                templateOptions: {
                    dataSrc: {
                        marker: 'SUPPORTED_PERSONA_LIST',
                        params: {
                            useCase: 'sample-useCase'
                        }
                    },
                    options: {}
                },
                children: {
                    administrator: [
                        {
                            code: 'state',
                            type: 'select',
                            templateOptions: {
                                labelHtml: {
                                    contents: '<span>$0&nbsp;<span class=\'required-asterisk\'>*</span></span>',
                                    values: {
                                        $0: 'State'
                                    }
                                },
                                placeHolder: 'Select State',
                                multiple: false,
                                dataSrc: {
                                    marker: 'STATE_LOCATION_LIST',
                                    params: {
                                        useCase: 'SIGNEDIN_GUEST'
                                    }
                                }
                            },
                            validations: [
                                {
                                    type: 'required'
                                }
                            ]
                        }, {
                            code: 'subPersona',
                            type: 'select',
                            templateOptions: {
                                labelHtml: {
                                    contents: '<span>$0&nbsp;<span class=\'required-asterisk\'>*</span></span>',
                                    values: {
                                        $0: 'State'
                                    }
                                },
                                placeHolder: 'Select State',
                                multiple: false,
                                dataSrc: {
                                    marker: 'SUBPERSONA_LIST',
                                    params: {
                                        useCase: 'SIGNEDIN_GUEST'
                                    }
                                },
                                options: { value: 'hm', label: 'HM' }
                            }
                        }, {
                            code: 'district',
                            type: 'select',
                            templateOptions: {
                                labelHtml: {
                                    contents: '<span>$0&nbsp;<span class=\'required-asterisk\'>*</span></span>',
                                    values: {
                                        $0: 'State'
                                    }
                                },
                                placeHolder: 'Select State',
                                multiple: false,
                                dataSrc: {
                                    marker: 'LOCATION_LIST',
                                    params: {
                                        useCase: 'SIGNEDIN_GUEST'
                                    }
                                },
                                options: { value: 'hm', label: 'HM' }
                            }
                        }]
                }
            }]));
            districtMappingPage.profile = {
                serveProfile: {
                    firstName: 'sample-name',
                    userType: ProfileType.TEACHER
                }
            };
            mockPreferences.getString = jest.fn(() => of(ProfileType.TEACHER));
            jest.spyOn(districtMappingPage, 'handleDeviceBackButton').mockImplementation(() => {
                return;
            });
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockFormAndFrameworkUtilService.getLocationConfig = jest.fn(() => Promise.resolve([]));
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockHeaderService.hideHeader = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockCommonUtilService.getLoader = jest.fn();
            mockProfileHandler.getSupportedUserTypes = jest.fn(() => Promise.resolve([{
                name: 'sample-name',
                code: 'sample-code'
            }])) as any;
            mockFormLocationFactory.buildStateListClosure = jest.fn();
            mockFormLocationFactory.buildLocationListClosure = jest.fn();
            // act
            districtMappingPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                expect(mockLocationHandler.getAvailableLocation).toHaveBeenCalled();
                expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenNthCalledWith(1,
                    ImpressionType.PAGE_REQUEST, '',
                    PageId.LOCATION,
                    Environment.ONBOARDING);
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenNthCalledWith(2,
                    ImpressionType.VIEW,
                    '',
                    PageId.DISTRICT_MAPPING,
                    Environment.ONBOARDING, '', '', '', undefined,
                    featureIdMap.location.LOCATION_CAPTURE);
                expect(mockHeaderService.hideHeader).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).toHaveBeenCalledWith(
                    PageId.LOCATION,
                    Environment.ONBOARDING,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    []
                );
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockProfileHandler.getSupportedUserTypes).toHaveBeenCalled();
                expect(mockFormLocationFactory.buildStateListClosure).toHaveBeenCalled();
                expect(mockFormLocationFactory.buildLocationListClosure).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    it('should generate telemetry for cancel event', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const correlationList: Array<CorrelationData> = [];
        correlationList.push({ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI });
        // act
        districtMappingPage.cancelEvent('');
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.SELECT_CANCEL, '',
            Environment.ONBOARDING,
            PageId.LOCATION,
            undefined,
            undefined,
            undefined,
            correlationList
        );
    });

    describe('isChangedLocation', () => {
        it('should change new location', () => {
            // arrange
            const curr = {
                children: {
                    persona: {
                        state: { name: 'sample-state', id: 'state-id', code: 'new-code' }
                    }
                },
                name: 'sample-user',
                persona: 'teacher'
            };
            const prev = {
                children: {
                    persona: {
                        state: { name: 'sample-state', id: 'state-id', code: 'old-code' },
                    }
                },
                name: 'sample-user',
                persona: 'teacher'
            };
            // act
            const data = districtMappingPage.isChangedLocation(prev, curr);
            // assert
            expect(data).toStrictEqual({ name: 'sample-state', id: 'state-id', code: 'new-code' });
        });

        it('should not change location', () => {
            // arrange
            const curr = {
                children: {
                    persona: {
                        state: { name: 'sample-state', id: 'state-id', code: 'old-code' }
                    }
                },
                name: 'sample-user',
                persona: 'teacher'
            };
            const prev = {
                children: {
                    persona: {
                        state: { name: 'sample-state', id: 'state-id', code: 'old-code' },
                    }
                },
                name: 'sample-user',
                persona: 'teacher'
            };
            // act
            const data = districtMappingPage.isChangedLocation(prev, curr);
            // assert
            expect(data).toBeUndefined();
        });
    });

    it('should invoked generateTelemetryForCategoryClicked', () => {
        // arrange
        const location = { code: '33', name: 'Tamil Nadu', id: '91d9baae-14f1-477a-955c-f91bd9037f0b', type: 'state' }
        const correlationList: Array<CorrelationData> = [];
        correlationList.push({
            id: location.name,
            type: location.type.charAt(0).toUpperCase() + location.type.slice(1)
        });
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        districtMappingPage.generateTelemetryForCategoryClicked(location);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.SELECT_CATEGORY, '',
            Environment.ONBOARDING,
            PageId.LOCATION,
            undefined,
            undefined,
            undefined,
            correlationList
        );
    });

    describe('onFormInitialize', () => {
        it('should be generate event for category clicked', (done) => {
            // arrange
            const formGroup = {
                valueChanges: of({
                    children: {
                        persona: {
                            state: { name: 'sample-state', id: 'state-id' },
                            district: { name: 'sample-dist', id: 'dist-id' },
                            block: { name: 'sample-block', id: 'block-id' }
                        }
                    },
                    name: 'sample-user',
                    persona: 'teacher'
                })
            } as any;
            jest.spyOn(districtMappingPage, 'isChangedLocation').mockImplementation(() => {
                return ({});
            });
            // act
            districtMappingPage.onFormInitialize(formGroup);
            // assert
            setTimeout(() => {
                expect(districtMappingPage.formGroup.valueChanges).toBeTruthy();
                done();
            }, 0);
        });
    });

    describe('onDataLoadStatusChange', () => {
        it('should initialized loader', (done) => {
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn
            }));
            districtMappingPage.initializeLoader();
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toBeTruthy();
                done();
            }, 0);
        });

        it('should be present loader if status is loading', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
            }));
            // act
            districtMappingPage.onDataLoadStatusChange('LOADING');
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toBeTruthy();
                done();
            }, 0);
        });

        it('should initialized formData', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                dismiss: dismissFn,
            }));
            districtMappingPage.formGroup = {
                value: 'sample-value', get: jest.fn(() => ({
                    value: 'sample-value',
                    valueChanges: of({
                        children: {
                            persona: {
                                state: { name: 'sample-state', id: 'state-id', code: 'old-code' },
                                district: { name: 'sample-dist', id: 'dist-id' },
                                block: { name: 'sample-block', id: 'block-id' }
                            }
                        },
                        name: 'sample-user',
                        persona: 'teacher'
                    }),
                    patchValue: jest.fn()
                }))
            } as any;
            districtMappingPage.profile = {
                serverProfile: {
                    userSubType: undefined
                }
            };
            // act
            districtMappingPage.onDataLoadStatusChange('');
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toBeTruthy();
                done();
            }, 0);
        });
    });

    it('should generate telemetry for calegory select', () => {
        // arrange
        const corRelationList: CorrelationData[] = [{ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI }];
        corRelationList.push({
            id: 'sample-id',
            type: CorReleationDataType.STATE
        });
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        districtMappingPage.generateTelemetryForCategorySelect('sample-id', true);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.SELECT_SUBMIT, '',
            Environment.ONBOARDING,
            PageId.LOCATION,
            undefined,
            undefined,
            undefined,
            corRelationList
        );
    });

    it('should generate telemetry for clearUserLocationSelections', () => {
        // arrange
        const correlationList: Array<CorrelationData> = [];
        correlationList.push({ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI });
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        districtMappingPage.formGroup = {
            get: jest.fn(() => ({
                patchValue: jest.fn()
            })) as any
        } as any;
        // act
        districtMappingPage.clearUserLocationSelections();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.SELECT_CANCEL, '',
            Environment.ONBOARDING,
            PageId.LOCATION,
            undefined,
            undefined,
            undefined,
            correlationList
        );
    });

    it('should invoked ngOnDestroy for unsubscribe', () => {
        districtMappingPage.ngOnDestroy();
    });

    describe('initialiseFormData', () => {
        it('should store to subPersonaCodes array', () => {
            const subPersonaCodes = [
                {
                    type:'sample_1',
                    subType: 'sample1'
                }
            ]
            subPersonaCodes.push({ type: 'sample_2', subType: 'sample2' });
            districtMappingPage.ionViewWillEnter();
            expect(subPersonaCodes).toEqual(
                expect.arrayContaining([
                expect.objectContaining({subType: 'sample2'})
                ])
            );

        })
    })
    describe('redirectToLogin', () => {
        it('should redirect to signin page', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            districtMappingPage.redirectToLogin();
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN])
        })
    })

    describe('fieldConfig', () => {
        it('should disable and hide fields that do not match the code in params', () => {
            //arrange
            const locationFormConfig = [      { code: 'sample', templateOptions: { hidden: false, disabled: false }, children: {} },      { code: 'sample1', templateOptions: { hidden: false, disabled: false }, children: {} },    ];
            const params = { code: 'sample', children: null };
        
            districtMappingPage.locationFormConfig = locationFormConfig;
            districtMappingPage.params = params;
            //act
            districtMappingPage.fieldConfig();
        
            //assert
            expect(locationFormConfig[0].templateOptions.hidden).toBe(false);
            expect(locationFormConfig[0].templateOptions.disabled).toBe(false);
            expect(locationFormConfig[1].templateOptions.hidden).toBe(true);
            expect(locationFormConfig[1].templateOptions.disabled).toBe(true);
          });
        
          it('should disable and hide child fields when there are children and the parent field is disabled', () => {
            //arrange
            const locationFormConfig = [      {        code: 'sample',        templateOptions: { hidden: false, disabled: true },        children: {          'child1': [            { templateOptions: { hidden: false, disabled: false } },            { templateOptions: { hidden: false, disabled: false } }          ],
                  'child2': [
                    { templateOptions: { hidden: false, disabled: false } },
                    { templateOptions: { hidden: false, disabled: false } }
                  ]
                }
              },
              {
                code: 'sample1',
                templateOptions: { hidden: false, disabled: false },
                children: {}
              },
            ];
            const params = { code: 'sample1', children: true };
            districtMappingPage.locationFormConfig = locationFormConfig;
            districtMappingPage.params = params;

            //act
            districtMappingPage.fieldConfig();
        
            //assert
            expect(locationFormConfig[0].templateOptions.hidden).toBe(true);
            expect(locationFormConfig[0].templateOptions.disabled).toBe(true);
            expect(locationFormConfig[1].templateOptions.hidden).toBe(false);
            expect(locationFormConfig[1].templateOptions.disabled).toBe(false);
    })
});
});
