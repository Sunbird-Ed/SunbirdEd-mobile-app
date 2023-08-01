import { FormAndFrameworkUtilService } from './../../../services/formandframeworkutil.service';
import {UserHomePage} from './user-home.page';
import {AppVersion} from '@awesome-cordova-plugins/app-version/ngx';
import {ModalController, PopoverController} from '@ionic/angular';
import {Events} from '../../../util/events';
import {AppGlobalService, PageId, TelemetryGeneratorService} from '../../../services';
import {CommonUtilService} from '../../../services/common-util.service';
import {Router} from '@angular/router';
import {AppHeaderService} from '../../../services/app-header.service';
import {
    FrameworkService,
} from '@project-sunbird/sunbird-sdk';
import {of} from 'rxjs';
import {NavigationService} from '../../../services/navigation-handler.service';
import {ContentAggregatorHandler} from '../../../services/content/content-aggregator-handler.service';
import {ContentService, FrameworkUtilService, Profile, ProfileService, ProfileSource, ProfileType, ServerProfile} from '@project-sunbird/sunbird-sdk';
import {SunbirdQRScanner} from '../../../services';
import {mockUserHomeData} from '../../../app/home/user-home/user-home-spec.data';
import {EventTopics, RouterLinks} from '../../../app/app.constant';
import { FrameworkSelectionDelegateService } from '../../profile/framework-selection/framework-selection.page';
import { TranslateService } from '@ngx-translate/core';
import {
    SplaschreenDeeplinkActionHandlerDelegate
} from '../../../services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { SegmentationTagService } from '../../../services/segmentation-tag/segmentation-tag.service';
import { OnboardingConfigurationService } from '../../../services';
import { mockOnboardingConfigData } from '../../components/discover/discover.page.spec.data';

describe('UserHomePage', () => {
    let userHomePage: UserHomePage;
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sunbird'))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn()
    };
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({profileType: 'Student'} as any))
    };
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn(),
        publish:jest.fn()
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };
    const mockNavService: Partial<NavigationService> = {
        navigateToTrackableCollection: jest.fn(),
        navigateToCollection: jest.fn(),
        navigateToContent: jest.fn()
    };
    const mockContentAggregatorHandler: Partial<ContentAggregatorHandler> = {};
    const mockSunbirdQRScanner: Partial<SunbirdQRScanner> = {};
    const mockModalController: Partial<ModalController> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockFrameworkSelectionDelegateService: Partial<FrameworkSelectionDelegateService> = {};
    const mockTranslateService: Partial<TranslateService> = {};
    const mockSplaschreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {};
    const mockSegmentationTagService: Partial<SegmentationTagService> = {};
    const mockPopoverController: Partial<PopoverController> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockOnboardingConfigurationService: Partial<OnboardingConfigurationService> = {
        initialOnboardingScreenName: '',
        getAppConfig: jest.fn(() => mockOnboardingConfigData)
    }

    beforeAll(() => {
        userHomePage = new UserHomePage(
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockProfileService as ProfileService,
            mockContentService as ContentService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockAppGlobalService as AppGlobalService,
            mockAppVersion as AppVersion,
            mockContentAggregatorHandler as ContentAggregatorHandler,
            mockNavService as NavigationService,
            mockHeaderService as AppHeaderService,
            mockEvents as Events,
            mockSunbirdQRScanner as SunbirdQRScanner,
            mockModalController as ModalController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockFrameworkSelectionDelegateService as FrameworkSelectionDelegateService,
            mockTranslateService as TranslateService,
            mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate,
            mockSegmentationTagService as SegmentationTagService,
            mockPopoverController as PopoverController,
            mockOnboardingConfigurationService as OnboardingConfigurationService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create an instance of HomePage', () => {
        expect(userHomePage).toBeTruthy();
    });

    describe('viewPreferenceInfo()', () => {
        it('should enable and disable the user prefrence information', () => {
            // arrange
            mockCommonUtilService.translateMessage = jest.fn();
            mockModalController.create = jest.fn(() => (Promise.resolve({
              present: jest.fn(() => Promise.resolve({})),
              onDidDismiss: jest.fn(() => Promise.resolve({})),
          } as any)));
            // act
            userHomePage.viewPreferenceInfo();
            // assert
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
        });
    });

    it('should subscribe events and when called upon', (done) => {
        // arrange
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === AppGlobalService.PROFILE_OBJ_CHANGED) {
                fn();
            } else if (topic === 'refresh:loggedInProfile') {
                fn();
            } else if (topic === EventTopics.TAB_CHANGE) {
                fn('');
            }
        });
        mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({syllabus: ['syllabus1']}));
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            uid: 'sample_uid',
            handle: 'u1234',
            profileType: ProfileType.STUDENT,
            board: ['CBSE'],
            medium: ['English'],
            grade: ['Class 10'],
            subject: ['hindi']
        })) as any;
        mockFrameworkService.getFrameworkDetails = jest.fn(() => of({
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
            ]
        }));
        mockAppGlobalService.getPageIdForTelemetry = jest.fn(() => PageId.HOME) as any;
        mockSunbirdQRScanner.startScanner = jest.fn(() => Promise.resolve('sample_data'));
        mockCommonUtilService.arrayToString = jest.fn(() => 'sample');
        mockContentAggregatorHandler.newAggregate = jest.fn(() => Promise.resolve(mockUserHomeData));
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockSegmentationTagService.exeCommands = [{
            controlFunction: 'BANNER_CONFIG',
            controlFunctionPayload: {
                values: [{expiry: 111111}]
            }
        }] as any;
        mockContentAggregatorHandler.populateIcons = jest.fn(() => mockUserHomeData);
        // act
        userHomePage.ngOnInit();
        // assert

        setTimeout(() => {
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(mockAppVersion.getAppName).toHaveBeenCalled();
            expect(mockSunbirdQRScanner.startScanner).toHaveBeenCalled();
            expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
            expect(mockContentAggregatorHandler.populateIcons).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should subscribe events and when called upon, handle else case on tabchange event', (done) => {
        // arrange
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === AppGlobalService.PROFILE_OBJ_CHANGED) {
                fn();
            } else if (topic === 'refresh:loggedInProfile') {
                fn();
            } else if (topic === EventTopics.TAB_CHANGE) {
                fn('data');
            }
        });
        mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({}));
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            uid: 'sample_uid',
            handle: 'u1234',
            profileType: ProfileType.STUDENT,
            board: ['CBSE'],
            medium: ['English'],
            grade: ['Class 10'],
            syllabus: ['syllabus1'],
            subject: ['hindi']
        })) as any;
        mockFrameworkService.getFrameworkDetails = jest.fn(() => of({
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
            ]
        }));
        mockAppGlobalService.getPageIdForTelemetry = jest.fn(() => PageId.HOME);
        mockSunbirdQRScanner.startScanner = jest.fn(() => Promise.resolve('sample_data'));
        mockCommonUtilService.arrayToString = jest.fn(() => 'sample');
        mockContentAggregatorHandler.newAggregate = jest.fn(() => Promise.resolve(mockUserHomeData));
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockSegmentationTagService.exeCommands = [{
            controlFunction: 'BANNER_CONFIG',
            controlFunctionPayload: {
                values: [{expiry: 111111}]
            }
        }];
        mockContentAggregatorHandler.populateIcons = jest.fn(() => mockUserHomeData);
        // act
        userHomePage.ngOnInit();
        // assert

        setTimeout(() => {
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(mockAppVersion.getAppName).toHaveBeenCalled();
            expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
            expect(mockContentAggregatorHandler.populateIcons).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should subscribe events, update header and getUserProfileDetails', (done) => {
        // arrange
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === 'update_header') {
                fn();
            }
        });
        mockRouter.navigate = jest.fn();
        const data = jest.fn((fn => fn({name: 'download'})));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockHeaderService.showHeaderWithHomeButton = jest.fn();
        mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve());
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            uid: 'sample_uid',
            handle: 'u1234',
            profileType: ProfileType.TEACHER,
            board: ['CBSE'],
            medium: ['English'],
            grade: ['Class 10'],
            subject: ['hindi']
        }));
        mockFrameworkService.getFrameworkDetails = jest.fn(() => of({
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
            ]
        }));
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        mockCommonUtilService.arrayToString = jest.fn(() => 'sample');
        mockContentAggregatorHandler.newAggregate = jest.fn(() => Promise.resolve(mockUserHomeData));
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockSegmentationTagService.exeCommands = [{
            controlFunction: 'BANNER_CONFIG',
            controlFunctionPayload: {
                showBanner: true
            }
        }];
        mockSegmentationTagService.exeCommands = [{
            controlFunction: 'BANNER_CONFIG',
            controlFunctionPayload: {
                values: [{expiry: 111111}]
            }
        }];
        // act
        userHomePage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
            expect(mockAppVersion.getAppName).toHaveBeenCalled();
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should redirect to notifications and check if profileType is student', (done) => {
        // arrange
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === 'update_header') {
                fn();
            }
        });
        mockRouter.navigate = jest.fn();
        const data = jest.fn((fn => fn({name: 'notification'})));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockHeaderService.showHeaderWithHomeButton = jest.fn();
        mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve());
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            uid: 'sample_uid',
            handle: 'u1234',
            board: ['cbse'],
            medium: ['english'],
            subject: ['english'],
            grade: ['class1'],
            profileType: ProfileType.STUDENT,
        }));
        mockFrameworkService.getFrameworkDetails = jest.fn(() => of({
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
            ]
        }));
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        mockCommonUtilService.arrayToString = jest.fn(() => 'sample');
        mockContentAggregatorHandler.newAggregate = jest.fn(() => Promise.resolve(mockUserHomeData));
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        userHomePage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalled();
            expect(mockAppVersion.getAppName).toHaveBeenCalled();
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('edit profile details', () => {
        it('should allow user to change categories edit ', () => {
            // arrange
            userHomePage.guestUser = false;
            mockRouter.navigate = jest.fn();
            // act
            userHomePage.editProfileDetails();
            // assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });

        it('should navigate to guest edit ', () => {
            // arrange
            userHomePage.guestUser = true;
            // act
            userHomePage.editProfileDetails();
            // assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
    });

    describe('handle pill select', () => {
        it('should return if event or event.data is not available', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            userHomePage.handlePillSelect({}, {});
            // assert
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });

        it('should navigate to categoryList page', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            userHomePage.handlePillSelect({
                data: [
                    {
                        value: {primaryFacetFilters: ''}
                    }
                ]
            }, {code: 'code', dataSrc: {params: {config: [{type: 'filter', code: 'code'}, {type: 'filterConfigIdentifier', code: 'code', values: [{code: 'code', data:[{name: 'code'}]}]}]}}}, true);
            // assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
    });

    describe('navigate to viewMore contents page', () => {
        it('should check for section.dataSrc.Type if TRACKABLE_COLLECTIONS', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            mockCommonUtilService.getTranslatedValue = jest.fn(() => 'Learning Resources');
            mockAppGlobalService.getUserId = jest.fn(() => '0987');
            // act
            userHomePage.navigateToViewMoreContentsPage({title: '{\"en\":\"My Learning\"}', dataSrc: {type: 'TRACKABLE_COLLECTIONS'}}, {contents: ['']});
            // assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });

        it('should check for section.dataSrc.Type if RECENTLY_VIEWED_CONTENTS', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            mockCommonUtilService.getTranslatedValue = jest.fn(() => 'Recently viewed');
            // act
            userHomePage.navigateToViewMoreContentsPage({title: '{\"en\":\"My Learning\"}', dataSrc: {type: 'RECENTLY_VIEWED_CONTENTS'}}, {contents: ['']});
            // assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
    });

    describe('navigateToDetailsPage', () => {
        it('navigate to navService with item if network of locally Available', () => {
            // arrange
            const mockEvent = {
                index: '0',
                data: {
                    identifier: 'do123',
                    content: {},
                    isAvailableLocally: true
                }
            };
            mockNavService.navigateToDetailPage = jest.fn();
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            // act
            userHomePage.navigateToDetailPage(mockEvent, 'Mathematics');
            // assert
            expect(mockNavService.navigateToDetailPage).toHaveBeenCalled();
        });

        it('should show toast if offline ', () => {
            // arrange
            const mockEvent = {
                index: '0',
                data: {
                    identifier: 'do123',
                    content: {},
                    isAvailableLocally: false
                }
            };
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            mockCommonUtilService.presentToastForOffline = jest.fn();
            // act
            userHomePage.navigateToDetailPage(mockEvent, 'Mathematics');
            // assert
            expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalled();
        });
    });

    it('should get data and open popover', () => {
        // arrange
        mockModalController.create = jest.fn(() => (Promise.resolve({
            present: jest.fn(() => Promise.resolve({})),
            onDidDismiss: jest.fn(() => Promise.resolve({})),
        } as any)));
        mockRouter.navigate = jest.fn();
        // act
        userHomePage.onViewMorePillList({data: 'sample'}, 'Mathematics');
        // assert
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should show headerWithHomeButton and call UserProfileDetails', (done) => {
        // arrange
        mockHeaderService.showHeaderWithHomeButton = jest.fn();
        mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve());
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            uid: 'sample_uid',
            handle: 'u1234',
            profileType: ProfileType.TEACHER,
            board: ['CBSE'],
            medium: ['English'],
            grade: ['Class 10'],
            subject: ['hindi']
        }));
        mockFrameworkService.getFrameworkDetails = jest.fn(() => of({
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
            ]
        }));
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        mockCommonUtilService.arrayToString = jest.fn(() => 'sample');
        mockContentAggregatorHandler.newAggregate = jest.fn(() => Promise.resolve(mockUserHomeData));
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockSegmentationTagService.exeCommands = [{
            controlFunction: 'BANNER_CONFIG',
            controlFunctionPayload: {
                showBanner: true,
                values: [{expiry: 111111}]
            }
        }];
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        // act
        userHomePage.tabViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
            expect(mockSegmentationTagService.exeCommands).toBeTruthy();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('doRefresh', () => {
        it('should call doRefresh method set refresh to true fetchDisplayElements', () => {
            // arrange
            const refresher = {
                target: {
                    complete: jest.fn()
                }
            };
            // act
            userHomePage.doRefresh(refresher);
            // assert
            expect(userHomePage.refresh).toBe(true);
        });
    });

    describe('getOtherMLCategories', () => {
        it('should get other categories', () => {
            // arrange
            let data = {
                'ekstep_ncert_k-12': {
                    teacher: [
                        {
                            name: 'observation',
                            icon: {
                                web: 'assets/images/mask-image/observation_category.png',
                                app: 'assets/imgs/observation_category.png',
                            },
                        },
                    ],
                },
            };
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(data))
            // act
            userHomePage.getOtherMLCategories().then(() => {
                // assert
                expect(userHomePage.otherCategories).toHaveLength(0);
            })
        });
        it('should get other categories', () => {
            // arrange
            let board = [];
            board.push(userHomePage.profile?.syllabus?.length  ?  userHomePage.profile?.syllabus[0]: null)
            board.push(userHomePage.profile?.board?.length  ?  userHomePage.profile?.board[0]: null);
            let role = userHomePage.profile.profileType.toLowerCase();
            const otherCategories = {
                'CBSE': {
                    teacher: [
                        {
                            name: 'observation',
                            icon: {
                                web: 'assets/images/mask-image/observation_category.png',
                                app: 'assets/imgs/observation_category.png',
                            },
                        },
                    ],
                },
            };
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(otherCategories));
            board.forEach(element => {
                if(otherCategories[element] && otherCategories[element][role]){
                    userHomePage.otherCategories = otherCategories[element][role]; 
                    return;
                }
            });
            // act
            userHomePage.getOtherMLCategories().then(() => {
                // assert
                expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith({
                    type: 'category',
                    subType: 'targetedCategory',
                    action: 'homeListing'
                });
            })
        });
        it('should get other categories', () => {
            // arrange
            let board = [];
            const serverProfileData: ServerProfile = {
                userId: 'sample_userId',
                firstName: 'sample_firstName',
                lastName: 'sample_lastName',
                tncAcceptedVersion: 'sample_tncAcceptedVersion',
                tncAcceptedOn: 'sample_tncAcceptedOn',
                tncLatestVersion: 'sample_tncLatestVersion',
                promptTnC: false,
                tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
                id: 'sample_id',
                avatar: 'sample_avatar',
                profileUserType: {
                    type: ProfileType.TEACHER
                },
                rootOrg: {
                    rootOrgId: '',
                    orgName: '',
                    slug: '',
                    hashTagId: ''
                },
                managedBy: '',
                locationIds: '',
                framework: undefined
            };
            const profile: Profile = {
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
            }
            board.push(profile?.syllabus?.length  ?  profile?.syllabus[0]: null)
            board.push(profile?.board?.length  ?  profile?.board[0]: null);
            let role = profile.profileType.toLowerCase();
            const otherCategories = {
                'CBSE': {
                    teacher: [
                        {
                            name: 'observation',
                            icon: {
                                web: 'assets/images/mask-image/observation_category.png',
                                app: 'assets/imgs/observation_category.png',
                            },
                        },
                    ],
                },
            };
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(profile))
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(otherCategories));
            board.forEach(element => {
                if(otherCategories[element] && otherCategories[element][role]){
                    userHomePage.otherCategories = otherCategories[element][role]; 
                    return;
                }
            });
            // act
            userHomePage.getOtherMLCategories().then(() => {
                // assert
                expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith({
                    type: 'category',
                    subType: 'targetedCategory',
                    action: 'homeListing'
                });
            })
        });
    });

      describe('should handle click action of otherCategories', () => {
        it('should return if no event', () => {
            // arrange
            const event = {data: ''}
            // act
            userHomePage.handleOtherCategories(event)
            // assert
               
        })
        it('should show login prompt', (done) => {
            userHomePage.guestUser = true;
            let event = { data: [{ value: {name:'observation'} }] };
            const dismiss = jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {isInternetNeededMessage: 'inernet'} } }))
            const present = jest.fn(() => Promise.resolve({}))
            mockCommonUtilService.translateMessage = jest.fn()
            mockPopoverController.create = jest.fn(() =>
              Promise.resolve({
                present: present,
                onDidDismiss: dismiss,
              })
            ) as any;
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            // act
            userHomePage.handleOtherCategories(event).then(() => {
            // assert
                expect(mockPopoverController.create).toHaveBeenCalled();
                // expect(mockRouter.navigate).not.toHaveBeenCalled()
                done()
            })
        })

        it('should show login prompt, if no btn value, then navigate to sign in page', (done) => {
            userHomePage.guestUser = true;
            let event = { data: [{ value: {name:'project'} }] };
            const dismiss = jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {isInternetNeededMessage: ''} } }))
            const present = jest.fn(() => Promise.resolve({}))
            mockCommonUtilService.translateMessage = jest.fn()
            mockPopoverController.create = jest.fn(() =>
              Promise.resolve({
                present: present,
                onDidDismiss: dismiss,
              })
            ) as any;
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            mockRouter.navigate = jest.fn();
            // act
            userHomePage.handleOtherCategories(event).then(() => {
            // assert
                expect(mockPopoverController.create).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalled()
                done()
            })
        })

        it('should show login prompt, if no btn object, then navigate to sign in page', (done) => {
            userHomePage.guestUser = true;
            let event = { data: [{ value: {name:'observation'} }] };
            const dismiss = jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: '' } }))
            const present = jest.fn(() => Promise.resolve({}))
            mockCommonUtilService.translateMessage = jest.fn()
            mockPopoverController.create = jest.fn(() =>
              Promise.resolve({
                present: present,
                onDidDismiss: dismiss,
              })
            ) as any;
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            mockRouter.navigate = jest.fn();
            // act
            userHomePage.handleOtherCategories(event).then(() => {
            // assert
                expect(mockPopoverController.create).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalled()
                done()
            })
        })

        it('should show login prompt, else case canDelete is false, then navigate to sign in page', (done) => {
            userHomePage.guestUser = true;
            let event = { data: [{ value: {name:'observation'} }] };
            const dismiss = jest.fn(() => Promise.resolve({ data: { canDelete: false, btn: '' } }))
            const present = jest.fn(() => Promise.resolve({}))
            mockCommonUtilService.translateMessage = jest.fn()
            mockPopoverController.create = jest.fn(() =>
              Promise.resolve({
                present: present,
                onDidDismiss: dismiss,
              })
            ) as any;
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            mockRouter.navigate = jest.fn();
            // act
            userHomePage.handleOtherCategories(event).then(() => {
            // assert
                expect(mockPopoverController.create).toHaveBeenCalled();
                expect(mockRouter.navigate).not.toHaveBeenCalled()
                done()
            })
        })
          
        it('should navigate to project listing page', (done) => {
        userHomePage.guestUser = false;
        let event = { data: [{name:'Project', value: {name:'projects'}}] };
        mockPopoverController.create = jest.fn(() =>
            Promise.resolve({
            present: jest.fn(() => Promise.resolve({})),
            onDidDismiss: jest.fn(() => Promise.resolve({canDelete: true, btn: {isInternetNeededMessage: ''}})),
            } as any)
        );
        mockRouter.navigate = jest.fn()
        // act
        userHomePage.handleOtherCategories(event).then(() => {
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.PROJECT], {})
                done()
            })
        })

        it('should navigate to Observatoin page, if event value is observation', (done) => {
            userHomePage.guestUser = false;
            let event = { data: [{name:'Project', value: {name:'observations'}}] };
            mockPopoverController.create = jest.fn(() =>
                Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({canDelete: true, btn: {isInternetNeededMessage: ''}})),
                } as any)
            );
            mockRouter.navigate = jest.fn()
            // act
            userHomePage.handleOtherCategories(event).then(() => {
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.OBSERVATION], {})
                done()
            })
        })

        it('should handle if no event value, default case', (done) => {
            userHomePage.guestUser = false;
            let event = { data: [{name:'Project', value: {name:''}}] };
            mockPopoverController.create = jest.fn(() =>
                Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({canDelete: true, btn: {isInternetNeededMessage: ''}})),
                } as any)
            );
            // act
            userHomePage.handleOtherCategories(event).then(() => {
            // assert
                done()
            })
        })
    })

    describe('should requestMoreContent', ()=> {
        it('should requestMoreContent', ()=> {
            //arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockFormAndFrameworkUtilService.getContentRequestFormConfig = jest.fn();
            //act
            userHomePage.requestMoreContent();
            //assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mockFormAndFrameworkUtilService.getContentRequestFormConfig).toHaveBeenCalled();
        })
    })

    describe('ngOnDestroy', ()=>{
        it('should unsubscribe', ()=>{
            // arrange
            userHomePage.headerObservable = {
                unsubscribe: jest.fn(() => true)
            } as any;
            // act
            userHomePage.ngOnDestroy();
            // assert
            expect(userHomePage.headerObservable.unsubscribe).toHaveBeenCalled();
        })
    })

    describe('ionViewWillLeave', ()=>{
        it('should unsubscribe', ()=>{
            // arrange
            userHomePage.refresher = { disabled: true };
            mockEvents.unsubscribe = jest.fn(() => []);
            // act
            userHomePage.ionViewWillLeave();
            //assert
            expect(mockEvents.unsubscribe).toHaveBeenCalledWith('update_header');
        })
    })

    describe('onFrameworkSelectionSubmit()', () => {
        it('should prepare the delegate navigation method for Frameworkdetails page when internet is available', (done) => {
            // act
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const formOutput = {
                board: {
                    name: 'State (Karnataka)',
                    code: 'ka_k-12_1'
                },
                medium: {
                    name: 'English',
                    code: 'english',
                    frameworkCode: 'ka_k-12_1'
                },
                grade: {
                    name: 'Class 9',
                    code: 'class9',
                    frameworkCode: 'ka_k-12_1'
                },
                subject: 'other',
                contenttype: 'digitextbbok',
                children: {
                    subject: {
                        other: 'Cdc'
                    }
                }
            };
            mockRouter.navigate = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            userHomePage.onFrameworkSelectionSubmit({}, formOutput, mockRouter, mockCommonUtilService,
                mockTelemetryGeneratorService, []).then(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            });
        });

        it('should show the offline toast when internet is now available', (done) => {
            // act
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            userHomePage.onFrameworkSelectionSubmit({}, {}, mockRouter, mockCommonUtilService, mockTelemetryGeneratorService, []).then(() => {
                // assert
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('OFFLINE_WARNING_ETBUI');
                done();
            });
        });
    });  
});