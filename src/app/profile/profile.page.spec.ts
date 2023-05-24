import { ProfilePage } from './profile.page';
import {
    ProfileService,
    AuthService,
    ContentService,
    CourseService,
    FormService,
    NetworkError,
    FrameworkService
} from '@project-sunbird/sunbird-sdk';
import { NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController, ToastController, Platform } from '@ionic/angular';
import { Events } from '../../util/events';
import {
    AndroidPermissionsService,
    AppGlobalService,
    AppHeaderService,
    CommonUtilService, Environment,
    FormAndFrameworkUtilService, InteractSubtype, InteractType, PageId,
    TelemetryGeneratorService
} from '../../services';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { TranslateService } from '@ngx-translate/core';
import { CertificateDownloadAsPdfService } from 'sb-svg2pdf';
import { of, throwError } from 'rxjs';
import { mockFormData, mockProfileData } from './profile.page.spec.data';
import { ContentFilterConfig, RouterLinks } from '../../app/app.constant';
import { NavigationService } from '../../services/navigation-handler.service';
import { ProfileHandler } from '../../services/profile-handler';
import { SegmentationTagService } from '../../services/segmentation-tag/segmentation-tag.service';
import { CertificateService } from '@project-sunbird/sunbird-sdk';
import { LocationHandler } from '../../services/location-handler';
import { UnnatiDataService } from '../manage-learn/core/services/unnati-data.service';

describe('Profile.page', () => {
    let profilePage: ProfilePage;

    const upgradeData = { upgradeText: '' };
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of(
            mockProfileData
        )),
        getServerProfilesDetails: jest.fn(() => of(
            mockProfileData
        )),
        isDefaultChannelProfile: jest.fn(() => of(true)),
        generateOTP: jest.fn(() => true)
    };
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of({
            access_token: '',
            refresh_token: '',
            userToken: 'sample_user_token'
        }))
    };
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'ios')
    };
    const mockContentService: Partial<ContentService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockFormService: Partial<FormService> = {};
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };
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
        openPopover: jest.fn(() => Promise.resolve()),
        setNativePopupVisible: jest.fn()
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
            return { state: 'tripura', district: 'west_tripura' };
        }),
        getOrgLocation: jest.fn(() => {
            return { state: 'tripura', district: 'west_tripura', block: 'dhaleshwar' };
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
    const mockFrameworkService: Partial<FrameworkService> = {
        setActiveChannelId: jest.fn(() => of(undefined))
    };
    const mockNavService: Partial<NavigationService> = {
        navigateToDetailPage: jest.fn(),
        navigateToTrackableCollection: jest.fn(),
        navigateToEditPersonalDetails: jest.fn()
    };

    const mockProfileHandler: Partial<ProfileHandler> = {
        getPersonaConfig: jest.fn(),
        getSubPersona: jest.fn()
    };

    const mockCertificateService: Partial<CertificateService> = {
        getCertificates: jest.fn()
    };

    global.window.segmentation = {
        init: jest.fn(),
        SBTagService: {
            pushTag: jest.fn(),
            removeAllTags: jest.fn(),
            restoreTags: jest.fn()
        }
    };
    const mockSegmentationTagService: Partial<SegmentationTagService> = {
        evalCriteria: jest.fn()
    };
    const mockLocationHandler: Partial<LocationHandler> = {};
    const mockUnnatiDataService: Partial<UnnatiDataService> = {
        get: jest.fn(() => of()) 
    }as any
    beforeAll(() => {
        profilePage = new ProfilePage(
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockContentService as ContentService,
            mockCourseService as CourseService,
            mockFormService as FormService,
            mockFrameworkService as FrameworkService,
            mockCertificateService as CertificateService,
            mockNgZone as NgZone,
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
            mockNavService as NavigationService,
            mockSbProgressLoader as SbProgressLoader,
            mockFileOpener as FileOpener,
            mockToastController as ToastController,
            mockTranslateService as TranslateService,
            mockCertificateDownloadPdfService as CertificateDownloadAsPdfService,
            mockProfileHandler as ProfileHandler,
            mockSegmentationTagService as SegmentationTagService,
            mockPlatform as Platform,
            mockLocationHandler as LocationHandler,
            mockUnnatiDataService as UnnatiDataService
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

    it('should generate telemetry and navigate to download', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockRouter.navigate = jest.fn();
        // act
        profilePage.handleHeaderEvents({ name: 'download' });
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
            Environment.HOME,
            PageId.PROFILE
        );
        expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.ACTIVE_DOWNLOADS]);
    });

    it('should subscribe events with update_header and call headerService and also call defaultChannelProfile', () => {
        // arrange
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === 'update_header') {
                return fn();
            }
        });
        mockFormAndFrameworkUtilService.getFrameworkCategoryList = jest.fn(() => Promise.resolve({
            supportedFrameworkConfig: [
                {
                  "code": "category1",
                  "label": "{\"en\":\"Board\"}",
                  "placeHolder": "{\"en\":\"Selected Board\"}",
                  "frameworkCode": "board",
                  "supportedUserTypes": [
                      "teacher",
                      "student",
                      "administrator",
                      "parent",
                      "other"
                  ]
              },
              {
                  "code": "category2",
                  "label": "{\"en\":\"Medium\"}",
                  "placeHolder": "{\"en\":\"Selected Medium\"}",
                  "frameworkCode": "medium",
                  "supportedUserTypes": [
                      "teacher",
                      "student",
                      "parent",
                      "other"
                  ]
              }
              ],
              supportedAttributes: {board: 'board', medium: 'medium',
              gradeLevel: 'gradeLevel'},
              userType: 'teacher'
        }));
        const headerData = jest.fn((fn => fn()));
        mockAppHeaderService.headerEventEmitted$ = {
            subscribe: headerData
        } as any;
        jest.spyOn(profilePage, 'handleHeaderEvents').mockImplementation();
        mockAppHeaderService.showHeaderWithHomeButton = jest.fn();
        // act
        profilePage.ionViewWillEnter();
        // assert
        expect(mockEvents.subscribe).toHaveBeenCalled();
        expect(mockAppHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
        expect(mockFormAndFrameworkUtilService.getFrameworkCategoryList).toHaveBeenCalled();
    });

    it('should unsubscribe headerObservable, events, and refresher set to true', () => {
        // arrange
        const unsubscribe = jest.fn();
        profilePage.headerObservable = { unsubscribe };
        mockEvents.unsubscribe = jest.fn();
        profilePage.refresher = { disabled: true };
        // act
        profilePage.ionViewWillLeave();
        // assert
        expect(unsubscribe).toHaveBeenCalled();
        expect(mockEvents.unsubscribe).toHaveBeenCalledWith('update_header');
        expect(profilePage.refresher.disabled).toBeTruthy();
    });

    it('should should set disabled property of refresher to be false', () => {
        // arrange
        profilePage.refresher = { disabled: false };
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
            mockAuthService.getSession = jest.fn(() => of({ userToken: 'sample_user_token' }));
            profilePage.userId = 'sample_user_token';
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(mockProfileData));
            mockNgZone.run = jest.fn((fn) => fn());
            jest.spyOn(profilePage, 'resetProfile').mockImplementation();
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData));
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({ status: undefined }));
            mockRouter.navigate = jest.fn();
            mockCommonUtilService.getOrgLocation = jest.fn(() => {
                return { state: 'tripura', district: 'west_tripura', block: 'dhaleshwar' };
            });
            mockFrameworkService.setActiveChannelId = jest.fn(() => of(undefined));
            mockProfileService.isDefaultChannelProfile = jest.fn(() => of(true));
            const subPersonaCodes = [
                {
                    type:'administrator',
                    subType: 'hm'
                }
            ]
            subPersonaCodes.push({ type: 'some_sample', subType: 'meo' });
            // act
            profilePage.refreshProfileData();
            setTimeout(() => {
                expect(mockAuthService.getSession).toHaveBeenCalled();
                expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalled();
                expect(profilePage.resetProfile).toHaveBeenCalled();
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                expect(mockFormAndFrameworkUtilService.updateLoggedInUser).toHaveBeenCalled();
                expect(mockFrameworkService.setActiveChannelId).toHaveBeenCalledWith(mockProfileData.rootOrg.hashTagId);
                expect(subPersonaCodes).toEqual(
                    expect.arrayContaining([
                    expect.objectContaining({subType: 'meo'})
                    ])
                );
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
            mockAuthService.getSession = jest.fn(() => of({ userToken: 'sample_user_token' }));
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
                certificates: [{ certName: 'sampleCert' }, { certName: 'sampleCert2' }],
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
                certificate: [{ certName: 'sampleCert' }, { certName: 'sampleCert2' }],
                status: 2
            }]));
            profilePage.getEnrolledCourses(true, false);
            // assert
            setTimeout(() => {
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should throw error and get to catch part', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                dismiss: dismissFn,
            }));
            mockCourseService.getEnrolledCourses = jest.fn(() => throwError('error'));
            jest.spyOn(console, 'error').mockImplementation();
            // act
            profilePage.getEnrolledCourses(true, false);

            setTimeout(() => {
                // assert
                expect(console.error).toHaveBeenCalledWith('error while loading enrolled courses', 'error');
                done();
            }, 0);
        });
    });

    describe('searchContent test-suites', () => {
        it('should call for search Content and set the result data', (done) => {
            // arrange
            mockFormAndFrameworkUtilService.getSupportedContentFilterConfig = jest.fn(() =>
                Promise.resolve(['sample_1', 'sample_2']));
            mockContentService.searchContent = jest.fn(() => of({
                result:
                {
                    contentDataList: ['sample_content_data_list']
                }
            }
            )
            );
            profilePage.userId = 'sample_user_id';
            // act
            profilePage.searchContent();
            // assert
            setTimeout(() => {
                expect(mockFormAndFrameworkUtilService.getSupportedContentFilterConfig)
                    .toHaveBeenCalledWith(ContentFilterConfig.NAME_DOWNLOADS);
                expect(mockContentService.searchContent).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should call for search Content and throw error and go to catch block', (done) => {
            // arrange
            mockFormAndFrameworkUtilService.getSupportedContentFilterConfig = jest.fn(() =>
                Promise.resolve(['sample_1', 'sample_2']));
            mockContentService.searchContent = jest.fn(() => throwError('sample_search_error'));
            profilePage.userId = undefined;
            profilePage.loggedInUserId = 'sample_logged_in_user_id';
            jest.spyOn(console, 'error').mockImplementation();
            // act
            profilePage.searchContent();
            // assert
            setTimeout(() => {
                expect(mockFormAndFrameworkUtilService.getSupportedContentFilterConfig)
                    .toHaveBeenCalledWith(ContentFilterConfig.NAME_DOWNLOADS);
                expect(mockContentService.searchContent).toHaveBeenCalled();
                expect(console.error).toHaveBeenCalledWith('Error', 'sample_search_error');
                done();
            }, 0);
        });

    });

    describe('getSelfDeclaredDetails test-cases', () => {
        it('checks if isCustodianOrgId is true and look for declarations and fetch form data from api', (done) => {
            // arrange
            profilePage.isCustodianOrgId = true;
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(mockFormData));
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockFrameworkService.searchOrganization = jest.fn(() => of({
                content: [
                    {
                        rootOrgId :'orgId_1',
                        orgName : 'sample_orgName_1'
                    },
                    {
                        rootOrgId :'orgId_2',
                        orgName : 'sample_orgName_2'
                    }
                ]
            }))as any;
            // act
            profilePage.getSelfDeclaredDetails();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('FRMELEMNTS_LBL_SHARE_DATA_WITH', {
                    '%tenant': ""
                });
                expect(mockFrameworkService.searchOrganization).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('doRefresh()', () => {
        it('should call loader and refresher to false', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                dismiss: dismissFn
            }));
            mockUnnatiDataService.get = jest.fn(() => of({
                subscribe: jest.fn(() => ({data:{}}))
            })) as any
            mockTelemetryGeneratorService.generatePullToRefreshTelemetry = jest.fn();
            const refresher = { target: { complete: jest.fn() } };
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
                    expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });
                }, 500);
            });
        });
        it('should call and present loader and go to catch block if refreshProfile data return some error', () => {
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
            }, 0);
        });
    });

    it('should refresh the data and update the profile', (done) => {
        // arrange
        jest.spyOn(profilePage, 'doRefresh').mockImplementation();
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sample_app_name'));
        mockFormAndFrameworkUtilService.getFrameworkCategoryList = jest.fn(() => Promise.resolve({
            supportedFrameworkConfig: [
                {
                  "code": "category1",
                  "label": "{\"en\":\"Board\"}",
                  "placeHolder": "{\"en\":\"Selected Board\"}",
                  "frameworkCode": "board",
                  "supportedUserTypes": [
                      "teacher",
                      "student",
                      "administrator",
                      "parent",
                      "other"
                  ]
              },
              {
                  "code": "category2",
                  "label": "{\"en\":\"Medium\"}",
                  "placeHolder": "{\"en\":\"Selected Medium\"}",
                  "frameworkCode": "medium",
                  "supportedUserTypes": [
                      "teacher",
                      "student",
                      "parent",
                      "other"
                  ]
              }
              ],
              supportedAttributes: {board: 'board', medium: 'medium',
              gradeLevel: 'gradeLevel'},
              userType: 'teacher'
        }));
        // act
        profilePage.ngOnInit().then(() => {
            expect(mockFormAndFrameworkUtilService.getFrameworkCategoryList).toHaveBeenCalled();
            expect(mockAppVersion.getAppName).toHaveBeenCalled();
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
            PageId.PROFILE, null
        );
    });

    it('should set roleLimit when called upon', () => {
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
            PageId.PROFILE, null
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
        profilePage.showMoreTrainings('myLearning');
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.VIEW_MORE_CLICKED,
            Environment.HOME,
            PageId.PROFILE, null
        );
    });

    it('should set trainings limit and generate interact telemetry', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        profilePage.showMoreTrainings('learnerPassbook');
        // assert
    });

    it('should set default trainings limit when called upon', () => {
        // act
        profilePage.showLessTrainings('myLearning');
        // assert
        expect(profilePage.myLearningLimit).toBe(3);
    });

    it('should set default trainings limit when called upon', () => {
        // act
        profilePage.showLessTrainings('learnerPassbook');
        // assert
        expect(profilePage.myLearningLimit).toBe(3);
    });

    it('should go to catch part and called showToast message', () => {
        // arrange
        mockUnnatiDataService.get = jest.fn(() => of({
            subscribe: jest.fn(() => ({data: {}}))
        }))
        mockFileOpener.open = jest.fn(() => Promise.reject('error'));
        mockCommonUtilService.showToast = jest.fn();
        jest.spyOn(console, 'log').mockImplementation();
        // act
        profilePage.openpdf('file:///emulated/0/android/download/sample_file.pdf');
        // assert
        setTimeout(() => {
            expect(console.log).toHaveBeenCalledWith('Error opening file', 'error');
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CERTIFICATE_ALREADY_DOWNLOADED');
        }, 0);
    });

    it('should open file when path given as parameter', () => {
        // arrange
        mockFileOpener.open = jest.fn(() => Promise.resolve());
        jest.spyOn(console, 'log').mockImplementation();
        // act
        profilePage.openpdf('file:///emulated/0/android/download/sample_file.pdf');
        // assert
        setTimeout(() => {
            expect(console.log).toHaveBeenCalledWith('File is opened');
        }, 0);
    });

    describe('downloadTrainingCertificate()', () => {

        it('should generate interact telemetry when permission requested and isAlwaysDenied set to false', () => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({ hasPermission: false, isPermissionAlwaysDenied: false }));
            mockPopoverController.dismiss = jest.fn();
            mockAndroidPermissionService.requestPermission = jest.fn(() => of({
                hasPermission: false,
                isPermissionAlwaysDenied: false
            }));
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('NOT_NOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCourseService.downloadCurrentProfileCourseCertificate = jest.fn(() => of({ path: 'sample_url' }));
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            }) as any;
            const values = new Map();
            values['courseId'] = 'do_1234';

            profilePage.appName = 'sample_app_name';
            // act
            profilePage.downloadTrainingCertificate({
                courseId: 'do_1234',
                certificate: {
                    id: 'sample_cert_id',
                    url: 'https://sampleCertUrl.com',
                    token: 'AXOBC'
                },
                courseName: 'sample_course',
                dateTime: '1333065600000',
                status: 0
            });
            // assert
            setTimeout(() => {
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
            }, 0);
        });

        it('should generate interact telemetry when request permission has been set to false', () => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({ hasPermission: false, isPermissionAlwaysDenied: false }));
            mockPopoverController.dismiss = jest.fn();
            mockAndroidPermissionService.requestPermission = jest.fn(() => of({
                hasPermission: false,
                isPermissionAlwaysDenied: false
            }));
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCourseService.downloadCurrentProfileCourseCertificate = jest.fn(() => of({ path: 'sample_url' }));
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            }) as any;
            const values = new Map();
            values['courseId'] = 'do_1234';

            profilePage.appName = 'sample_app_name';
            // act
            profilePage.downloadTrainingCertificate({
                courseId: 'do_1234',
                certificate: {
                    id: 'sample_cert_id',
                    url: 'https://sampleCertUrl.com',
                    token: 'AXOBC'
                },
                courseName: 'sample_course',
                dateTime: '1333065600000',
                status: 0
            });
            // assert
            setTimeout(() => {
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
            }, 0);
        });


        it('should generate interact telemetry when permission popup for storage and ALLOW clicked and ', () => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({ hasPermission: false, isPermissionAlwaysDenied: false }));
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
            mockCourseService.downloadCurrentProfileCourseCertificate = jest.fn(() => of({ path: 'sample_url' }));
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            mockAndroidPermissionService.requestPermission = jest.fn(() => of({
                hasPermission: false,
                isPermissionAlwaysDenied: true
            }));
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            }) as any;
            const values = new Map();
            values['courseId'] = 'do_1234';

            profilePage.appName = 'sample_app_name';
            // act
            profilePage.downloadTrainingCertificate({ courseId: 'do_1234' }, {
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
            }, 0);
        });

        it('check for permission and returns isPermissionAlwaysDenied true', () => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({ hasPermission: false, isPermissionAlwaysDenied: true }));
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            }) as any;
            profilePage.appName = 'sample_app_name';
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            profilePage.downloadTrainingCertificate({
                courseId: 'do_1234',
                certificate: {
                    id: 'sample_cert_id',
                    url: 'https://sampleCertUrl.com',
                    token: 'AXOBC'
                },
                courseName: 'sample_course',
                dateTime: '1333065600000',
                status: 0
            });
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'sample_app_name',
                    PageId.PROFILE,
                    true
                );
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
            }, 0);
        });


        it('check for permission whether available or not', () => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({ hasPermission: true }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const values = new Map();
            values['courseId'] = 'sample_cert_id';
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            }) as any;
            mockCourseService.downloadCurrentProfileCourseCertificate = jest.fn(() => of({ path: 'sample_url' }));
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            // act
            profilePage.downloadTrainingCertificate({ courseId: 'sample_cert_id' }, {
                id: 'sample_cert_id', url:
                    'https://sampleCertUrl.com', identifier: 'sample_id', token: 'AXOBC'
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
                    { id: 'sample_cert_id', type: 'Certificate', version: undefined },
                    values
                );
                expect(mockToastController.create).toHaveBeenCalledWith({ message: 'Certificate is getting downloaded' });
                expect(mockCourseService.downloadCurrentProfileCourseCertificate).toHaveBeenCalled();
                expect(profilePage.openpdf).toHaveBeenCalledWith('sample_url');
            }, 0);
        });

        it('check for permission and calls for download certificate goes to catch block for networkError', () => {
            // arrange
            mockTranslateService.get = jest.fn(() => of('Certificate is getting downloaded'));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({ hasPermission: true }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const values = new Map();
            values['courseId'] = 'do_1234';
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(),
                    dismiss: jest.fn()
                });
            }) as any;
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            const networkError = new NetworkError('no_internet');
            mockCourseService.downloadCurrentProfileCourseCertificate = jest.fn(() => throwError(networkError));
            mockCommonUtilService.showToast = jest.fn();
            // act
            profilePage.downloadTrainingCertificate({ courseId: 'sample_cert_id' }, {
                id: 'sample_cert_id', url:
                    'https://sampleCertUrl.com', identifier: 'sample_id', token: 'AXOBC'
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
                    { id: 'sample_cert_id', type: 'Certificate', version: undefined },
                    values
                );
                expect(mockToastController.create).toHaveBeenCalledWith({ message: 'Certificate is getting downloaded' });
                expect(mockCourseService.downloadCurrentProfileCourseCertificate).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('OFFLINE_CERTIFICATE_MESSAGE', false, '', 3000, 'top');
            }, 0);
        });

        it('should call for download legacyCertifcate if certificate has no identifeir', () => {
            // arrange
            mockTranslateService.get = jest.fn(() => of(undefined));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({ hasPermission: true }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const values = new Map();
            values['courseId'] = 'do_1234';
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            mockCertificateDownloadPdfService.download = jest.fn(() => Promise.resolve());
            jest.spyOn(profilePage, 'openpdf').mockImplementation();
            mockCertificateDownloadPdfService.download = jest.fn(() => Promise.resolve());
            mockCourseService.certificateManager = {
                isCertificateCached: jest.fn(() => of(true))
            };
            // act
            profilePage.downloadTrainingCertificate(
                {
                    courseId: 'sample_cert_id',
                    issuedCertificate: {
                        id: 'sample_cert_id',
                        name: 'sample_cert_name',
                        token: 'ABSCD'
                    },
                    courseName: 'sample_course',
                    dateTime: '1333065600000',
                    status: 0
                });
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CERTIFICATE_CLICKED,
                    Environment.USER, // env
                    PageId.PROFILE, // page name
                    { id: 'sample_cert_id', type: 'Certificate', version: undefined },
                    values
                );
            }, 0);
        });
    });

    describe('navigateToDetailPage test-suites', () => {
        it('should navigate to course-details page based on the contentType', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            const values = new Map();
            values['sectionName'] = 'Contributions';
            values['positionClicked'] = 2;
            // act
            profilePage.navigateToDetailPage({
                contentId: 'do_1234',
                identifier: 'do_123',
                contentType: 'Course',
                primaryCategory: 'Course'
            }, 'completed', 2);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                Environment.USER,
                PageId.PROFILE,
                { id: 'do_123', type: 'Course', version: '' },
                values
            );
            expect(mockNavService.navigateToDetailPage).toBeCalled();
        });
    });

    describe('navigateToCategoriesEditPage test-suites', () => {
        it('should navigate to categories edit page if network is available', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            profilePage.navigateToCategoriesEditPage();
            // assert
            expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.EDIT_CLICKED,
                Environment.HOME,
                PageId.PROFILE, null
            );
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`]);
        });

        it('should show toast of no internet if network is not available', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            mockCommonUtilService.showToast = jest.fn();
            // act
            profilePage.navigateToCategoriesEditPage();
            // assert
            expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NEED_INTERNET_TO_CHANGE');
        });
    });

    describe('onEditProfileClicked  test-suites', () => {
        it('should generate telemetry and navigate to district mapping if network is available', () => {
            // arrange
            // act
            profilePage.onEditProfileClicked();
            // assert
            expect(mockNavService.navigateToEditPersonalDetails).toHaveBeenCalledWith(
                mockProfileData,
                PageId.PROFILE
            );
        });
    });

    describe('update phone and email test-suites', () => {
        it('should translate message and call editContactPop with ' +
            'current user phone number and user Id if phone number available', () => {
                // arrange
                mockCommonUtilService.translateMessage = jest.fn(v => v);
                mockPopoverController.create = jest.fn(() => (Promise.resolve({
                    present: jest.fn(() => Promise.resolve({})),
                    onDidDismiss: jest.fn(() => Promise.resolve({
                        data: {
                            isEdited: true,
                            OTPSuccess: true,
                            value: '123456'
                        }
                    }))
                } as any)));
                const dismissFn = jest.fn(() => Promise.resolve());
                const presentFn = jest.fn(() => Promise.resolve());
                mockCommonUtilService.getLoader = jest.fn(() => ({
                    present: presentFn,
                    dismiss: dismissFn,
                }));
                mockProfileService.updateServerProfile = jest.fn(() => of(mockProfileData));
                jest.spyOn(profilePage, 'doRefresh').mockImplementation();
                mockCommonUtilService.showToast = jest.fn();
                mockProfileService.generateOTP = jest.fn(() => of(true));
                // act
                profilePage.editMobileNumber();
                setTimeout(() => {
                    // assert
                    expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
                    expect(dismissFn).toHaveBeenCalled();
                    expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('PHONE_UPDATE_SUCCESS');
                }, 0);
            });

        it('should update emailId when is any emailId is available', () => {
            // arrange
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        isEdited: true,
                        OTPSuccess: true,
                        value: '123456'
                    }
                }))
            } as any)));
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockProfileService.updateServerProfile = jest.fn(() => throwError('sample_error'));
            jest.spyOn(profilePage, 'doRefresh').mockImplementation();
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.showToast = jest.fn();
            mockProfileService.generateOTP = jest.fn(() => of(true));
            // act
            profilePage.editEmail();
            setTimeout(() => {
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG');
            }, 0);
        });
    });

    it('should generate telemetry and generate popover and if edited set true and then update profile', () => {
        // arrange
        mockPopoverController.create = jest.fn(() => (Promise.resolve({
            present: jest.fn(() => Promise.resolve({})),
            onDidDismiss: jest.fn(() => Promise.resolve({ data: { isEdited: true, value: '123456', OTPSuccess: true } }))
        } as any)));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockProfileService.updateServerProfile = jest.fn(() => of(mockProfileData));
        const dismissFn = jest.fn(() => Promise.resolve());
        const presentFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
        mockCommonUtilService.translateMessage = jest.fn(v => v);
        mockCommonUtilService.showToast = jest.fn();
        profilePage.profile.email = 'sunbird.demo@sunbird.com';
        mockProfileService.generateOTP = jest.fn(() => of(true));
        // act
        profilePage.editRecoveryId();
        // assert
        setTimeout(() => {
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.RECOVERY_ACCOUNT_ID_CLICKED,
                Environment.USER,
                PageId.PROFILE
            );
            expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
        }, 0);
    });

    it('should go to else part if organisations list is equal to 1', () => {
        // arrange
        profilePage.profile.organisations = [{
            organisationId: 'xyz',
            roles: ['teacher', 'state_teacher'],
            locations: {
                state: 'tripura',
                district: 'west_tripura',
                block: 'dhaleshwar'
            }
        }];
        mockCommonUtilService.getOrgLocation = jest.fn(() => {
            return { state: 'tripura', district: 'west_tripura', block: 'dhaleshwar' };
        });
        // act
        profilePage.getOrgDetails();
        // assert
        expect(mockCommonUtilService.getOrgLocation).toHaveBeenCalled();
    });

    describe('openEnrolledCourse test-suites', () => {
        it('should get contentDetails and navigate to course-details page', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            profilePage.enrolledCourseList = [{
                courseId: 'do_123',
                batch: { batchId: 123 }
            }, {
                courseId: 'do_345',
                batch: { batchId: 456 }
            }];
            // act
            profilePage.openEnrolledCourse({ courseId: 'do_123', batch: { batchId: '123' } });
            setTimeout(() => {
                // assert
                // expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(mockNavService.navigateToTrackableCollection).toHaveBeenCalledWith(
                    {
                        content: undefined
                    }
                );
            });
        });

        it('should get contentDetails and throw console error', () => {
            // arrange
            mockNavService.navigateToTrackableCollection = jest.fn();
            // act
            profilePage.openEnrolledCourse({ batch: { batchId: '0998' } });
            setTimeout(() => {
                // assert
                expect(mockNavService.navigateToTrackableCollection).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('openSelfDeclareTeacherForm test-suites', () => {
        it('should check of networkAvailability and if true then generate telemetry and navigate to teacher edit', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            const type = 'add';
            // act
            profilePage.openSelfDeclareTeacherForm(type);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                '',
                Environment.USER,
                PageId.PROFILE,
                undefined,
                undefined,
                undefined,
                undefined,
                'btn-i-am-a-teacher'
            );
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.SELF_DECLARED_TEACHER_EDIT}/${type}`],
                {
                    state: {
                        profile: profilePage.profile
                    }
                });
        });

        it('should show toast if network is unavailable', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            const type = 'update';
            // act
            profilePage.openSelfDeclareTeacherForm(type);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                '',
                Environment.USER,
                PageId.PROFILE,
                undefined,
                undefined,
                undefined,
                undefined,
                'btn-update'
            );
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NEED_INTERNET_TO_CHANGE');
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.SELF_DECLARED_TEACHER_EDIT}/${type}`],
                {
                    state: {
                        profile: profilePage.profile
                    }
                });
        });
    });

    describe('toggleTooltips test-cases', () => {
        it('should go inside field has name in it and go inside dismiss message', () => {
            // arrange
            jest.useFakeTimers();
            profilePage.informationProfileName = false;
            const event = { stopPropagation: jest.fn() };
            // act
            profilePage.toggleTooltips(event, 'name');
            jest.advanceTimersByTime(3001);
            // assert
            expect(profilePage.informationProfileName).toBe(false);
            expect(profilePage.informationOrgName).toBe(false);
            expect(event.stopPropagation).toHaveBeenCalled();
            jest.useRealTimers();
        });

        it('should go inside field  name is org and set data and dismiss message called', () => {
            // arrange
            jest.useFakeTimers();
            profilePage.informationProfileName = false;
            const event = { stopPropagation: jest.fn() };
            // act
            profilePage.toggleTooltips(event, 'org');
            jest.advanceTimersByTime(3001);
            // assert
            expect(profilePage.informationProfileName).toBe(false);
            expect(profilePage.informationOrgName).toBe(false);
            expect(event.stopPropagation).toHaveBeenCalled();
            jest.useRealTimers();
        });

        it('should go to else part if field name is not org nor field', () => {
            jest.useFakeTimers();
            profilePage.informationProfileName = false;
            const event = { stopPropagation: jest.fn() };
            // act
            profilePage.toggleTooltips(event, 'sample');
            // assert
            expect(profilePage.informationProfileName).toBe(false);
            expect(profilePage.informationOrgName).toBe(false);
            jest.useRealTimers();
        });
    });

    it('shareUsername', () => {
        // arrange
        profilePage.profile = {
            userName: 'some_username',
            firstName: 'First',
            lastName: 'Last'
        };
        mockCommonUtilService.translateMessage = jest.fn((key, fields) => {
            switch (key) {
                case 'SHARE_USERNAME':
                    return 'SHARE_USERNAME';
            }
        });
        mockSocialSharing.share = jest.fn();

        // act
        profilePage.shareUsername();

        // assert
        expect(mockSocialSharing.share).toHaveBeenCalledWith('SHARE_USERNAME');
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SHARE_USERNAME', {
            app_name: profilePage.appName,
            user_name: profilePage.profile.firstName + ' ' + profilePage.profile.lastName,
            sunbird_id: profilePage.profile.userName
        });
    });
});
