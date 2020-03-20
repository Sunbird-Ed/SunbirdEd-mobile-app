import { ProfileSettingsPage } from './profile-settings.page';
import {
    FrameworkService,
    FrameworkUtilService,
    ProfileService,
    SharedPreferences,
    DeviceRegisterService
} from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Events, Platform, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    SunbirdQRScanner,
    ContainerService,
    AppHeaderService, FormAndFrameworkUtilService
} from 'services';
import { SplashScreenService } from '@app/services/splash-screen.service';
import { Location } from '@angular/common';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType } from '@app/services/telemetry-constants';
import { of, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

describe('ProfileSettingsPage', () => {
    let profileSettingsPage: ProfileSettingsPage;
    const mockAlertCtrl: Partial<AlertController> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'select-box')
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockEvents: Partial<Events> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockRouter: Partial<Router> = {};
    const mockScanner: Partial<SunbirdQRScanner> = {};
    const mockSplashScreenService: Partial<SplashScreenService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockActivatedRoute: Partial<ActivatedRoute> = {};
    mockActivatedRoute.snapshot = {
        queryParams: {
            reOnBoard: {}
        }
    } as any;

    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};

    beforeAll(() => {
        profileSettingsPage = new ProfileSettingsPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTranslate as TranslateService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockScanner as SunbirdQRScanner,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockContainer as ContainerService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockAppVersion as AppVersion,
            mockAlertCtrl as AlertController,
            mockLocation as Location,
            mockSplashScreenService as SplashScreenService,
            mockActivatedRoute as ActivatedRoute
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of profileSettingsPage', () => {
        expect(profileSettingsPage).toBeTruthy();
    });

    it('should fetch active profile by invoked ngOnInit()', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleActiveScanner').mockImplementation(() => {
            return;
        });
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({} as any));
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        jest.spyOn(profileSettingsPage, 'fetchSyllabusList').mockImplementation(() => {
            return Promise.resolve();
        });
        // act
        profileSettingsPage.ngOnInit().then(() => {
            // assert
           setTimeout(() => {
               expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                   ImpressionType.VIEW, '',
                   PageId.ONBOARDING_PROFILE_PREFERENCES,
                   Environment.ONBOARDING
               );
               expect(mockAppVersion.getAppName).toHaveBeenCalled();
               expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
               done();
           }, 0);
        });
    });

    it('should fetch active profile by invoked ngOnInit()', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleActiveScanner').mockImplementation(() => {
            return;
        });
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({} as any));
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        jest.spyOn(profileSettingsPage, 'fetchSyllabusList').mockImplementation(() => {
            return Promise.resolve();
        });
        // act
        profileSettingsPage.ngOnInit().then(() => {
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW, '',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                Environment.ONBOARDING
            );
            expect(mockAppVersion.getAppName).toHaveBeenCalled();
            expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
            done();
        });
    });

    xit('should subscribe formControl to call ngOnDestroy()', (done) => {
        // arrange
        const data = jest.fn();
        const mockFormControlSubscriptions = {
            unsubscribe: data
        } as Partial<Subscription>;
        // act
        profileSettingsPage.ngOnDestroy();
        // assert
        setTimeout(() => {
            expect(data).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('onSubmitAttempt()', () => {
        it('should generate submit clicked telemetry  if board is empty onSubmitAttempt()', () => {
            // arrange
            const values = new Map();
            values['board'] = 'na';
            profileSettingsPage.profileSettingsForm = {
                get: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'syllabus':
                            value = { value: { board: []}};
                            break;
                        case 'medium':
                            value = { value: { medium: []}};
                            break;
                        case 'grade':
                            value = [];
                            break;
                    }
                    return value;
                }),
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    },
                    board: {
                        validator: jest.fn()
                    },
                    medium: {
                        validator: jest.fn()
                    },
                    grade: {
                        validator: jest.fn()
                    }
                },
                value: {
                    syllabus: [], board: [], medium: [], grade: []
                }
            } as any;
            profileSettingsPage.boardSelect = {open: jest.fn()};
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                expect.anything(),
                'failed',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                InteractSubtype.FINISH_CLICKED
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                'submit-clicked',
                Environment.HOME,
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                undefined,
                values
            );
        });

        it('should generate submit clicked telemetry  if medium is empty onSubmitAttempt()', () => {
            // arrange
            const values = new Map();
            values['board'] = 'na';
            profileSettingsPage.profileSettingsForm = {
                get: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'syllabus':
                            value = { value: { board: ['AP']}};
                            break;
                        case 'medium':
                            value = { value: { medium: []}};
                            break;
                        case 'grade':
                            value = [];
                            break;
                    }
                    return value;
                }),
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    },
                    board: {
                        validator: jest.fn()
                    },
                    medium: {
                        validator: jest.fn()
                    },
                    grade: {
                        validator: jest.fn()
                    }
                },
                value: {
                    syllabus: [], board: ['AP'], medium: [], grade: []
                }
            } as any;
            profileSettingsPage.boardSelect = {open: jest.fn()};
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                expect.anything(),
                'failed',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                InteractSubtype.FINISH_CLICKED
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                'submit-clicked',
                Environment.HOME,
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                undefined,
                values
            );
        });

        it('should generate submit clicked telemetry  if grades is empty onSubmitAttempt()', () => {
            // arrange
            const values = new Map();
            values['board'] = 'na';
            profileSettingsPage.profileSettingsForm = {
                get: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'syllabus':
                            value = { value: { board: ['AP']}};
                            break;
                        case 'medium':
                            value = { value: { medium: ['English']}};
                            break;
                        case 'grade':
                            value = { value: { medium: []}};
                            break;
                    }
                    return value;
                }),
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    },
                    board: {
                        validator: jest.fn()
                    },
                    medium: {
                        validator: jest.fn()
                    },
                    grade: {
                        validator: jest.fn()
                    }
                },
                value: {
                    syllabus: [], board: ['AP'], medium: ['English'], grade: []
                }
            } as any;
            profileSettingsPage.boardSelect = {open: jest.fn()};
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                expect.anything(),
                'failed',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                InteractSubtype.FINISH_CLICKED
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                'submit-clicked',
                Environment.HOME,
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                undefined,
                values
            );
        });
      });

    it('should control Scanner to called handleActiveScanner()', (done) => {
        // arrange
        mockRouter.getCurrentNavigation = jest.fn(() => ({
            extras: {
                state: {
                    stopScanner: true
                }
            }
        }as any));
        profileSettingsPage = new ProfileSettingsPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTranslate as TranslateService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockScanner as SunbirdQRScanner,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockContainer as ContainerService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockAppVersion as AppVersion,
            mockAlertCtrl as AlertController,
            mockLocation as Location,
            mockSplashScreenService as SplashScreenService,
            mockActivatedRoute as ActivatedRoute
        );
        mockScanner.stopScanner = jest.fn();
        // act
        profileSettingsPage.handleActiveScanner();
        // assert
        setTimeout(() => {
            expect(mockRouter.getCurrentNavigation).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should handle all header events by invoked ionViewWillEnter()', (done) => {
        // arrange
        const data = jest.fn((fn => fn()));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockHeaderService.hideHeader = jest.fn();
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation();
        jest.spyOn(profileSettingsPage, 'handleHeaderEvents').mockImplementation(() => {
            return;
        });
        mockActivatedRoute.snapshot.queryParams = { reOnboard: true };
        profileSettingsPage.hideBackButton = true;
        // act
        profileSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockHeaderService.hideHeader).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should not reload the onboarding screens id reOnboard is null ionViewWillEnter()', (done) => {
        // arrange
        const data = jest.fn((fn => fn()));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockHeaderService.hideHeader = jest.fn();
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleHeaderEvents').mockImplementation(() => {
            return;
        });
        mockActivatedRoute.snapshot.queryParams = null;
        profileSettingsPage.hideBackButton = false;
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation();
        // act
        profileSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockHeaderService.hideHeader).toHaveBeenCalled();
            done();
        }, 0);

    });

    it('should handle hideHeader events by invoked ionViewWillEnter()', (done) => {
        // arrange
        const data = jest.fn((fn => fn()));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockRouter.getCurrentNavigation = jest.fn(() => ({
            extras: {
                state: {
                    hideBackButton: true
                }
            }
        } as any));
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleHeaderEvents').mockImplementation(() => {
            return;
        });
        mockHeaderService.hideHeader = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation();
        // act
        profileSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(data).toHaveBeenCalled();
            expect(mockHeaderService.hideHeader).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should submit form details for board blanked to call onSubmitAttempt()', () => {
        // arrange
        const syllabusData = new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' });
        mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const values = new Map();
        values['medium'] = 'na';
        profileSettingsPage.boardSelect = {open: jest.fn()};
        profileSettingsPage.mediumSelect = ['hindi'];
        profileSettingsPage.gradeSelect = ['class1'];

        // act
        profileSettingsPage.onSubmitAttempt();
        // assert
        expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
            expect.anything(),
            'failed',
            PageId.ONBOARDING_PROFILE_PREFERENCES,
            InteractSubtype.FINISH_CLICKED
        );
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            'submit-clicked',
            Environment.HOME,
            PageId.ONBOARDING_PROFILE_PREFERENCES,
            undefined,
            values
        );
    });

    it('should submit form details for medium blank to call onSubmitAttempt()', () => {
        // arrange
        mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const values = new Map();
        values['board'] = 'na';
        profileSettingsPage.profileSettingsForm = {
            controls: {
                syllabus: {
                    validator: jest.fn()
                }
            },
            value: {
                syllabus: [], board: ['odisha'], medium: [], grade: []
            }
        } as any;
        profileSettingsPage = new ProfileSettingsPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTranslate as TranslateService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockScanner as SunbirdQRScanner,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockContainer as ContainerService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockAppVersion as AppVersion,
            mockAlertCtrl as AlertController,
            mockLocation as Location,
            mockSplashScreenService as SplashScreenService,
            mockActivatedRoute as ActivatedRoute
        );
        profileSettingsPage.boardSelect = {open: jest.fn()};
        profileSettingsPage.mediumSelect = ['hindi'];
        profileSettingsPage.gradeSelect = ['class1'];

        // act
        profileSettingsPage.onSubmitAttempt();
        // assert
        expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
            expect.anything(),
            'failed',
            PageId.ONBOARDING_PROFILE_PREFERENCES,
            InteractSubtype.FINISH_CLICKED
        );
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            'submit-clicked',
            Environment.HOME,
            PageId.ONBOARDING_PROFILE_PREFERENCES,
            undefined,
            values
        );

    });
});
