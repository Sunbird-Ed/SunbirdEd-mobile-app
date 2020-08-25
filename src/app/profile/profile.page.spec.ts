import {ProfilePage} from '@app/app/profile/profile.page';
import {
    ProfileService,
    AuthService,
    ContentService,
    CourseService,
    SharedPreferences,
    FormService,
    NetworkError,
    CertificateAlreadyDownloaded
} from 'sunbird-sdk';
import {NgZone} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Events, PopoverController, ToastController} from '@ionic/angular';
import {
    AndroidPermissionsService,
    AppGlobalService,
    AppHeaderService,
    CommonUtilService, Environment,
    FormAndFrameworkUtilService, InteractSubtype, InteractType, PageId,
    TelemetryGeneratorService
} from '@app/services';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {SbProgressLoader} from '@app/services/sb-progress-loader.service';
import {FileOpener} from '@ionic-native/file-opener/ngx';
import {TranslateService} from '@ngx-translate/core';
import {CertificateDownloadAsPdfService} from 'sb-svg2pdf';
import {of, throwError} from 'rxjs';
import {mockProfileData} from './profile.page.spec.data';

describe('Profile.page', () => {
    let profilePage: ProfilePage;
    const upgradeData = {upgradeText: ''};
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of(
            mockProfileData
        )),
        getServerProfilesDetails: jest.fn(() => of(
            mockProfileData
        ))
    };
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of({
            access_token: '',
            refresh_token: '',
            userToken: 'sample_user_token'
        }))
    };
    const mockContentService: Partial<ContentService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockSharePreferences: Partial<SharedPreferences> = {};
    const mockFormService: Partial<FormService> = {};
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };
    const mockRoute: Partial<ActivatedRoute> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    userId: 'sample_user_token',
                    returnRefreshedUserProfileDetails: true
                }
            }
        })),
        navigate: jest.fn()
    };
    const mockPopoverController: Partial<PopoverController> = {};
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn((topic, fn) => {
            switch (topic) {
                case 'force_optional_upgrade':
                    return fn(upgradeData);
                case 'loggedInProfile:update':
                    return fn(upgradeData);
            }
        })
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        openPopover: jest.fn(() => Promise.resolve())
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getCustodianOrgId: jest.fn(() => Promise.resolve({
            orgId: 'sample_org_id'
        })),
        updateLoggedInUser: jest.fn(() => Promise.resolve({}))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getUserLocation: jest.fn(() => {
            return {state: 'tripura', district: 'west_tripura'};
        }),
        getOrgLocation: jest.fn(() => {
            return {state: 'tripura', district: 'west_tripura', block: 'dhaleshwar'};
        })
    };
    const mockSocialSharing: Partial<SocialSharing> = {};
    const mockAppHeaderService: Partial<AppHeaderService> = {};
    const mockAndroidPermissionService: Partial<AndroidPermissionsService> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockFileOpener: Partial<FileOpener> = {};
    const mockToastController: Partial<ToastController> = {};
    const mockTranslateService: Partial<TranslateService> = {};
    const mockCertificateDownloadPdfService: Partial<CertificateDownloadAsPdfService> = {};

    beforeAll(() => {
        profilePage = new ProfilePage(
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockContentService as ContentService,
            mockCourseService as CourseService,
            mockSharePreferences as SharedPreferences,
            mockFormService as FormService,
            mockNgZone as NgZone,
            mockRoute as ActivatedRoute,
            mockRouter as Router,
            mockPopoverController as PopoverController,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockCommonUtilService as CommonUtilService,
            mockSocialSharing as SocialSharing,
            mockAppHeaderService as AppHeaderService,
            mockAndroidPermissionService as AndroidPermissionsService,
            mockAppVersion as AppVersion,
            mockSbProgressLoader as SbProgressLoader,
            mockFileOpener as FileOpener,
            mockToastController as ToastController,
            mockTranslateService as TranslateService,
            mockCertificateDownloadPdfService as CertificateDownloadAsPdfService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of profilePage', () => {
        // assert
        expect(profilePage).toBeTruthy();
    });

    it('should subscribe events with update_header and call headerService and also call defaultChannelProfile', () => {
        // arrange
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === 'update_header') {
                return fn();
            }
        });
        const headerData = jest.fn((fn => fn()));
        mockAppHeaderService.headerEventEmitted$ = {
            subscribe: headerData
        } as any;
        jest.spyOn(profilePage, 'handleHeaderEvents').mockImplementation();
        mockAppHeaderService.showHeaderWithHomeButton = jest.fn();
        mockProfileService.isDefaultChannelProfile = jest.fn(() => of(true));
        // act
        profilePage.ionViewWillEnter();
        // assert
        expect(mockEvents.subscribe).toHaveBeenCalled();
        expect(mockAppHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
        expect(profilePage.isDefaultChannelProfile$).toBeTruthy();
    });

    it('should unsubscribe headerObservable, events, and refresher set to true', () => {
        // arrange
        const unsubscribe = jest.fn();
        profilePage.headerObservable = {unsubscribe};
        mockEvents.unsubscribe = jest.fn();
        profilePage.refresher = {disabled: true};
        // act
        profilePage.ionViewWillLeave();
        // assert
        expect(unsubscribe).toHaveBeenCalled();
        expect(mockEvents.unsubscribe).toHaveBeenCalledWith('update_header');
        expect(profilePage.refresher.disabled).toBeTruthy();
    });

    it('should should set disabled property of refresher to be false', () => {
        // arrange
        profilePage.refresher = {disabled: false};
        // act
        profilePage.ionViewDidEnter();
        // assert
        expect(profilePage.refresher.disabled).toBeFalsy();
    });

    it('should resetProfile to empty object when called', () => {
        // act
        profilePage.resetProfile();
        // assert
        expect(profilePage.profile).toStrictEqual({});
    });

    describe('refreshProfileData', () => {
        it('should call getServerProfileDetails if userId matches userToken', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of({userToken: 'sample_user_token'}));
            profilePage.userId = 'sample_user_token';
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(mockProfileData));
            mockNgZone.run = jest.fn((fn) => fn());
            jest.spyOn(profilePage, 'resetProfile').mockImplementation();
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData));
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: undefined}));
            mockRouter.navigate = jest.fn();
            mockCommonUtilService.getOrgLocation = jest.fn(() => {
                return {state: 'tripura', district: 'west_tripura', block: 'dhaleshwar'};
            });
            // act
            profilePage.refreshProfileData();
            setTimeout(() => {
                expect(mockAuthService.getSession).toHaveBeenCalled();
                expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalled();
                expect(profilePage.resetProfile).toHaveBeenCalled();
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                expect(mockFormAndFrameworkUtilService.updateLoggedInUser).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should go to reject part if session is null', () => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(null));
            // act
            profilePage.refreshProfileData().catch((result) => {
                expect(result).toBe('session is null');
            });
        });

        it('should handle catch part if getServerProfileDetails handles and error', () => {
            // arrange
            // const refresher = {target: {complete: jest.fn()}};
            mockAuthService.getSession = jest.fn(() => of({userToken: 'sample_user_token'}));
            profilePage.userId = 'another_user_id';
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(undefined));
            profilePage.isLoggedInUser = false;
            // act
            profilePage.refreshProfileData(true);
            expect(profilePage.isLoggedInUser).toBeFalsy();
        });

    });

    describe('getEnrolledCourses', () => {
        it('should fetch current user\s enrolled course and set into mappedTraining certificates', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCourseService.getEnrolledCourses = jest.fn(() => of([{
                courseName: 'sample_course',
                dateTime: '12/08/2020',
                courseId: 'do_1234',
                certificates: [{certName: 'sampleCert'}, {certName: 'sampleCert2'}],
                status: 2
            }]));
            // act
            profilePage.getEnrolledCourses(true, true);
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.REFRESH_CLICKED,
                    Environment.USER,
                    PageId.PROFILE);
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should handle else cases if certificates dont have length', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                dismiss: dismissFn,
            }));
            mockCourseService.getEnrolledCourses = jest.fn(() => of([{
                courseName: 'sample_course',
                dateTime: '12/08/2020',
                courseId: 'do_1234',
                certificate: [{certName: 'sampleCert'}, {certName: 'sampleCert2'}],
                status: 2
            }]));
            profilePage.getEnrolledCourses(true, false);
            // assert
            setTimeout(() => {
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
    describe('doRefresh()', () => {
        it('should call loader and refresher to false', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                dismiss: dismissFn
            }));
            mockTelemetryGeneratorService.generatePullToRefreshTelemetry = jest.fn();
            const refresher = {target: {complete: jest.fn()}};
            mockEvents.publish = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            jest.spyOn(profilePage, 'getEnrolledCourses').mockImplementation();
            jest.spyOn(profilePage, 'searchContent').mockImplementation();
            jest.spyOn(profilePage, 'getSelfDeclaredDetails').mockImplementation();
            jest.spyOn(profilePage, 'refreshProfileData').mockImplementation(() => Promise.resolve({}));
            // act
            profilePage.doRefresh(refresher).then(() => {
                setTimeout(() => {
                    // assert
                    expect(mockTelemetryGeneratorService.generatePullToRefreshTelemetry)
                        .toHaveBeenCalledWith(PageId.PROFILE, Environment.HOME);
                    expect(refresher.target.complete).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalled();
                    expect(mockEvents.publish).toHaveBeenCalledWith('refresh:profile');
                    expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({id: 'login'});
                    done();
                }, 500);
            });
        });
        it('should call and present loader and go to catch block if refreshProfile data return some error', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn
            }));
            jest.spyOn(profilePage, 'refreshProfileData').mockImplementation(() => Promise.reject({}));
            // act
            profilePage.doRefresh(false);
            setTimeout(() => {
                // assert
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    it('should refresh the data and update the profile', (done) => {
        // arrange
        jest.spyOn(profilePage, 'doRefresh').mockImplementation();
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sample_app_name'));
        mockCommonUtilService.getStateList = jest.fn(() => Promise.resolve(['assam', 'tripura', 'sikkim']));
        // act
        profilePage.ngOnInit().then(() => {

            expect(mockAppVersion.getAppName).toHaveBeenCalled();
            expect(mockCommonUtilService.getStateList).toHaveBeenCalled();
            // assert
            done();
        });
    });

    it('should call interact telemetry and set rolelimit', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        profilePage.showMoreItems();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.VIEW_MORE_CLICKED,
            Environment.HOME,
            PageId.PROFILE, null,
            undefined,
            undefined
        );
    });

    it('should set roleLimint when called upon', () => {
        // arrange
        // act
        profilePage.showLessItems();
        // assert
        expect(profilePage.rolesLimit).toBe(3);
    });

    it('should set badge limit and generate interact telemetry', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        profilePage.showMoreBadges();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.VIEW_MORE_CLICKED,
            Environment.HOME,
            PageId.PROFILE, null,
            undefined,
            undefined
        );
    });

    it('should set badge limit', () => {
        // act
        profilePage.showLessBadges();
        // assert
        expect(profilePage.badgesLimit).toBe(3);
    });

    it('should set trainings limit and generate interact telemetry', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        profilePage.showMoreTrainings();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.VIEW_MORE_CLICKED,
            Environment.HOME,
            PageId.PROFILE, null,
            undefined,
            undefined
        );
    });

    it('should set default trainings limit when called upon', () => {
        // act
        profilePage.showLessTrainings();
        // assert
        expect(profilePage.trainingsLimit).toBe(3);
    });

    describe('downloadCertificate', () => {

        it('should generate interact telemetry when permission requested and isAlwaysDenied set to false', (done) => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: false}));
            mockPopoverController.dismiss = jest.fn();
            mockAndroidPermissionService.requestPermission = jest.fn(() => of({hasPermission: false, isPermissionAlwaysDenied: false}));
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('NOT_NOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCourseService.downloadCurrentProfileCourseCertificate = jest.fn(() => of({path: 'sample_url'}));
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            });
            const values = new Map();
            values['courseId'] = 'do_1234';

            profilePage.appName = 'sample_app_name';
            // act
            profilePage.downloadTrainingCertificate({courseId: 'do_1234'}, {
                id: 'sample_cert_id', url:
                    'https://sampleCertUrl.com', token: 'AXOBC'
            });
            // assert
            setTimeout(() => {
                expect(mockTranslateService.get).toHaveBeenCalledWith('CERTIFICATE_DOWNLOAD_INFO');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.NOT_NOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.PERMISSION_POPUP
                );
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'sample_app_name',
                    PageId.PROFILE,
                    true
                );
                done();
            }, 0);
        });

        it('should generate interact telemetry when request permission has been set to false', (done) => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: false}));
            mockPopoverController.dismiss = jest.fn();
            mockAndroidPermissionService.requestPermission = jest.fn(() => of({hasPermission: false, isPermissionAlwaysDenied: false}));
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCourseService.downloadCurrentProfileCourseCertificate = jest.fn(() => of({path: 'sample_url'}));
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            });
            const values = new Map();
            values['courseId'] = 'do_1234';

            profilePage.appName = 'sample_app_name';
            // act
            profilePage.downloadTrainingCertificate({courseId: 'do_1234'}, {
                id: 'sample_cert_id', url:
                    'https://sampleCertUrl.com', token: 'AXOBC'
            });
            // assert
            setTimeout(() => {
                expect(mockTranslateService.get).toHaveBeenCalledWith('CERTIFICATE_DOWNLOAD_INFO');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.DENY_CLICKED,
                    Environment.SETTINGS,
                    PageId.APP_PERMISSION_POPUP
                );
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'sample_app_name',
                    PageId.PROFILE,
                    true
                );
                done();
            }, 0);
        });


        it('should generate interact telemetry when permission popup for storage and ALLOW clicked and ', (done) => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: false}));
            mockPopoverController.dismiss = jest.fn();
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCourseService.downloadCurrentProfileCourseCertificate = jest.fn(() => of({path: 'sample_url'}));
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            mockAndroidPermissionService.requestPermission = jest.fn(() => of({hasPermission: false, isPermissionAlwaysDenied: true}));
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            });
            const values = new Map();
            values['courseId'] = 'do_1234';

            profilePage.appName = 'sample_app_name';
            // act
            profilePage.downloadTrainingCertificate({courseId: 'do_1234'}, {
                id: 'sample_cert_id', url:
                    'https://sampleCertUrl.com', token: 'AXOBC'
            });
            // assert
            setTimeout(() => {
                expect(mockTranslateService.get).toHaveBeenCalledWith('CERTIFICATE_DOWNLOAD_INFO');
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'sample_app_name',
                    PageId.PROFILE,
                    true
                );
                done();
            }, 0);
        });

        it('check for permission and returns isPermissionAlwaysDenied true', (done) => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: true}));
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            });
            profilePage.appName = 'sample_app_name';
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            profilePage.downloadTrainingCertificate({courseId: 'do_1234'}, {
                id: 'sample_cert_id', url:
                    'https://sampleCertUrl.com', token: 'AXOBC'
            });
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'sample_app_name',
                    PageId.PROFILE,
                    true
                );
                expect(mockTranslateService.get).toHaveBeenCalledWith('CERTIFICATE_DOWNLOAD_INFO');
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
                done();
            }, 0);
        });


        it('check for permission whether available or not', (done) => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: true}));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const values = new Map();
            values['courseId'] = 'do_1234';
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            });
            mockCourseService.downloadCurrentProfileCourseCertificate = jest.fn(() => of({path: 'sample_url'}));
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            // act
            profilePage.downloadTrainingCertificate({courseId: 'do_1234'}, {
                id: 'sample_cert_id', url:
                    'https://sampleCertUrl.com', token: 'AXOBC'
            });
            // assert
            setTimeout(() => {
                expect(mockTranslateService.get).toHaveBeenCalledWith('CERTIFICATE_DOWNLOAD_INFO');
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CERTIFICATE_CLICKED,
                    Environment.USER, // env
                    PageId.PROFILE, // page name
                    {id: 'sample_cert_id', type: 'Certificate', version: undefined},
                    values
                );
                expect(mockToastController.create).toHaveBeenCalledWith({message: 'Certificate is getting downloaded'});
                expect(mockCourseService.downloadCurrentProfileCourseCertificate).toHaveBeenCalled();
                expect(profilePage.openpdf).toHaveBeenCalledWith('sample_url');
                done();
            }, 0);
        });

        it('check for permission and calls for download certificate goes to catch block for networkError', (done) => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: true}));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const values = new Map();
            values['courseId'] = 'do_1234';
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            });
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            const networkError = new NetworkError('no_internet');
            mockCourseService.downloadCurrentProfileCourseCertificate = jest.fn(() => throwError(networkError));
            mockCommonUtilService.showToast = jest.fn();
            // act
            profilePage.downloadTrainingCertificate({courseId: 'do_1234'}, {
                id: 'sample_cert_id', url:
                    'https://sampleCertUrl.com', token: 'AXOBC'
            });
            // assert
            setTimeout(() => {
                expect(mockTranslateService.get).toHaveBeenCalledWith('CERTIFICATE_DOWNLOAD_INFO');
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CERTIFICATE_CLICKED,
                    Environment.USER, // env
                    PageId.PROFILE, // page name
                    {id: 'sample_cert_id', type: 'Certificate', version: undefined},
                    values
                );
                expect(mockToastController.create).toHaveBeenCalledWith({message: 'Certificate is getting downloaded'});
                expect(mockCourseService.downloadCurrentProfileCourseCertificate).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_INTERNET_TITLE', false, '', 3000, 'top');
                done();
            }, 0);
        });

        it('check for permission and calls for download certificateV2 goes to catch block for networkError', (done) => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: true}));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const values = new Map();
            values['courseId'] = 'do_1234';
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            });
            const networkError = new NetworkError('no_internet');
            mockCourseService.downloadCurrentProfileCourseCertificateV2 = jest.fn(() => throwError(networkError));
            mockCommonUtilService.showToast = jest.fn();
            // act
            profilePage.downloadTrainingCertificate({courseId: 'do_1234'}, {
                id: 'sample_cert_id', token: 'AXOBC'
            });
            // assert
            setTimeout(() => {
                expect(mockTranslateService.get).toHaveBeenCalledWith('CERTIFICATE_DOWNLOAD_INFO');
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CERTIFICATE_CLICKED,
                    Environment.USER, // env
                    PageId.PROFILE, // page name
                    {id: 'sample_cert_id', type: 'Certificate', version: undefined},
                    values
                );
                expect(mockToastController.create).toHaveBeenCalledWith({message: 'Certificate is getting downloaded'});
                expect(mockCourseService.downloadCurrentProfileCourseCertificateV2).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_INTERNET_TITLE', false, '', 3000, 'top');
                done();
            }, 0);
        });

        it('check for permission and calls for download certificate goes to catch block for certificate alreadyDownloaded', (done) => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: true}));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const values = new Map();
            values['courseId'] = 'do_1234';
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            });
            const networkError = new CertificateAlreadyDownloaded('');
            mockCourseService.downloadCurrentProfileCourseCertificate = jest.fn(() => throwError(networkError));
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            // act
            profilePage.downloadTrainingCertificate({courseId: 'do_1234'}, {
                id: 'sample_cert_id', token: 'AXOBC', name: 'sample_course-certificate_name',  url:
                    'https://sampleCertUrl.com'
            });
            // assert
            setTimeout(() => {
                expect(mockTranslateService.get).toHaveBeenCalledWith('CERTIFICATE_DOWNLOAD_INFO');
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CERTIFICATE_CLICKED,
                    Environment.USER, // env
                    PageId.PROFILE, // page name
                    {id: 'sample_cert_id', type: 'Certificate', version: undefined},
                    values
                );
                expect(mockToastController.create).toHaveBeenCalledWith({message: 'Certificate is getting downloaded'});
                expect(mockCourseService.downloadCurrentProfileCourseCertificate).toHaveBeenCalled();
                expect(profilePage.openpdf).toHaveBeenCalled();
                done();
            }, 0);
        });




        it('should go to else part if certificate doesnt have url and doesnt have permission which leads to open popup', () => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: false}));
            mockPopoverController.dismiss = jest.fn();
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            const values = new Map();
            values['courseId'] = 'do_1234';

            profilePage.appName = 'sample_app_name';
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockAndroidPermissionService.requestPermission = jest.fn(() => of({hasPermission: true}));
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            });
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            mockCourseService.downloadCurrentProfileCourseCertificateV2 = jest.fn(() => of({path: 'sample_path'}));
            mockCertificateDownloadPdfService.download = jest.fn(() => Promise.resolve());
            // act
            profilePage.downloadTrainingCertificate({courseId: 'do_1234'}, {
                id: 'sample_cert_id', token: 'AXOBC'
            });
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CERTIFICATE_CLICKED,
                    Environment.USER, // env
                    PageId.PROFILE, // page name
                    {id: 'sample_cert_id', type: 'Certificate', version: undefined},
                    values
                );
                expect(mockCourseService.downloadCurrentProfileCourseCertificateV2).toHaveBeenCalled();
                expect(mockToastController.create).toHaveBeenCalledWith({message: 'Certificate is getting downloaded'});
                expect(profilePage.openpdf).toHaveBeenCalledWith('sample_url');
            }, 0);
        });
    });
});
