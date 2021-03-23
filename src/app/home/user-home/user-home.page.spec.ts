import {UserHomePage} from './user-home.page';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {PopoverController} from '@ionic/angular';
import {Events} from '@app/util/events';
import {AppGlobalService, PageId} from '@app/services';
import {CommonUtilService} from '../../services/common-util.service';
import {Router} from '@angular/router';
import {AppHeaderService} from '../../services/app-header.service';
import {
    FrameWorkService
} from 'sunbird-sdk';
import {of} from 'rxjs';
import {NavigationService} from '../../services/navigation-handler.service';
import {ContentAggregatorHandler} from '../../services/content/content-aggregator-handler.service';
import {ProfileService, ProfileType} from '@project-sunbird/sunbird-sdk';
import {SunbirdQRScanner} from '@app/services';
import {mockUserHomeData} from '@app/app/home/user-home/user-home-spec.data';
import {EventTopics} from '@app/app/app.constant';

describe('UserHomePage', () => {
    let userHomePage: UserHomePage;
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sunbird'))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({profileType: 'Student'} as any))
    };
    const mockFrameworkService: Partial<FrameWorkService> = {};
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn()
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockRouter: Partial<Router> = {};
    const mockNavService: Partial<NavigationService> = {
        navigateToTrackableCollection: jest.fn(),
        navigateToCollection: jest.fn(),
        navigateToContent: jest.fn()
    };
    const mockContentAggregatorHandler: Partial<ContentAggregatorHandler> = {};
    const mockSunbirdQRScanner: Partial<SunbirdQRScanner> = {};
    const mockPopoverController: Partial<PopoverController> = {};

    beforeAll(() => {
        userHomePage = new UserHomePage(
            mockFrameworkService as FrameWorkService,
            mockProfileService as ProfileService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockAppGlobalService as AppGlobalService,
            mockAppVersion as AppVersion,
            mockContentAggregatorHandler as ContentAggregatorHandler,
            mockNavService as NavigationService,
            mockHeaderService as AppHeaderService,
            mockEvents as Events,
            mockSunbirdQRScanner as SunbirdQRScanner,
            mockPopoverController as PopoverController
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
            userHomePage.showPreferenceInfo = false;
            // act
            userHomePage.viewPreferenceInfo();
            // assert
            expect(userHomePage.showPreferenceInfo).toBeTruthy();
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
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            uid: 'sample_uid',
            handle: 'u1234',
            profileType: ProfileType.TEACHER,
            board: ['CBSE'],
            medium: ['English'],
            grade: ['Class 10']
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
        mockAppGlobalService.getPageIdForTelemetry = jest.fn(() => PageId.HOME);
        mockSunbirdQRScanner.startScanner = jest.fn(() => Promise.resolve('sample_data'));
        mockCommonUtilService.arrayToString = jest.fn(() => 'sample');
        mockContentAggregatorHandler.newAggregate = jest.fn(() => Promise.resolve(mockUserHomeData));
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
        // act
        userHomePage.ngOnInit();
        // assert

        setTimeout(() => {
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(mockAppVersion.getAppName).toHaveBeenCalled();
            expect(mockSunbirdQRScanner.startScanner).toHaveBeenCalled();
            expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
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
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            uid: 'sample_uid',
            handle: 'u1234',
            profileType: ProfileType.TEACHER,
            board: ['CBSE'],
            medium: ['English'],
            grade: ['Class 10']
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
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            uid: 'sample_uid',
            handle: 'u1234',
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
            userHomePage.handlePillSelect(undefined);
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
                        value: 'sample_data'
                    }
                ]
            });
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
            userHomePage.navigateToViewMoreContentsPage({dataSrc: {type: 'TRACKABLE_COLLECTIONS'}}, {contents: ['']});
            // assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });

        it('should check for section.dataSrc.Type if RECENTLY_VIEWED_CONTENTS', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            mockCommonUtilService.getTranslatedValue = jest.fn(() => 'Recently viewed');
            // act
            userHomePage.navigateToViewMoreContentsPage({dataSrc: {type: 'RECENTLY_VIEWED_CONTENTS'}}, {contents: ['']});
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
        mockPopoverController.create = jest.fn(() => (Promise.resolve({
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
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            uid: 'sample_uid',
            handle: 'u1234',
            profileType: ProfileType.TEACHER,
            board: ['CBSE'],
            medium: ['English'],
            grade: ['Class 10']
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
        // act
        userHomePage.tabViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
            done();
        }, 0);
    });
});
