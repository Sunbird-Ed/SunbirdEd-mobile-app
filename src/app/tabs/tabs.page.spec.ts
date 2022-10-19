import { AppGlobalService, CommonUtilService, ContainerService, OnboardingConfigurationService } from '../../services';
import { TabsPage } from './tabs.page';
import { Events } from '@app/util/events';
import { IonRouterOutlet, IonTabs, ToastController } from '@ionic/angular';
import { ProfileService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { plugins } from 'chart.js';
import { StackEvent } from '@ionic/angular/directives/navigation/stack-utils';

describe('TabsPage', () => {
    let tabsPage: TabsPage;
    let tabRef: Partial<IonTabs> = {
        outlet: {component: {tabViewWillEnter: ''}} as IonRouterOutlet,
        tabBar: undefined,
        ionTabsWillChange: undefined,
        ionTabsDidChange: undefined,
        getSelected: jest.fn(),
    };
    const mockContainerService: Partial<ContainerService> = {
        getAllTabs: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn(),
        subscribe: jest.fn()
    };
    const mockToastController: Partial<ToastController> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        guestProfileType: '',
        isUserLoggedIn: jest.fn(),
        isOnBoardingCompleted: false,
        authService: {
            getSession: jest.fn()
        }
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of(''))
    };
    const mockProfileService: Partial<ProfileService> = {
        getServerProfilesDetails: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        isAccessibleForNonStudentRole: jest.fn(),
        showToast: jest.fn(),
        translateMessage: jest.fn()
    };
    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };
    const mockOnboardingConfigurationService: Partial<OnboardingConfigurationService> = {
        initializedTabs: jest.fn()
    };
    
    beforeAll(() => {
        tabsPage = new TabsPage(
            mockContainerService as ContainerService,
            mockEvents as Events,
            mockToastController as ToastController,
            mockAppGlobalService as AppGlobalService,
            mockSharedPreferences as SharedPreferences,
            mockProfileService as ProfileService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockOnboardingConfigurationService as OnboardingConfigurationService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of tabs page', () => {
        expect(tabsPage).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should', () => {
            // arrange
            // act
            tabsPage.ngOnInit()
            // assert
        })
    })

    describe('ngAfterViewInit', () => {
        it('should', () => {
            // arrange
            tabRef.getSelected = jest.fn()
            // act
            tabsPage.ngAfterViewInit()
            // assert
        })
    })

    describe('setQRStyles', () => {
        it('should', () => {
            // arrange
            // act
            tabsPage.setQRStyles()
            // assert
        })
    })

    describe('checkAndroidWebViewVersion', () => {
        it('should getCurrentWebViewPackageInfo', () => {
            // arrange
            plugins['webViewChecker'].getCurrentWebViewPackageInfo = jest.fn(() => Promise.resolve({versionName:''}))
            // act
            tabsPage.checkAndroidWebViewVersion();
            // assert
        })

        it('should catch error getCurrentWebViewPackageInfo', () => {
            // arrange
            plugins['webViewChecker'].getCurrentWebViewPackageInfo = jest.fn(() => Promise.reject({error:''}))
            // act
            tabsPage.checkAndroidWebViewVersion();
            // assert
        })
    })

    describe('ionViewWillEnter', () => {
        it('should', () => {
            // arrange
            tabRef = {outlet: {
                component: {tabViewWillEnter: ''}
            }} as IonTabs
            // act
            tabsPage.ionViewWillEnter()
            // assert
        })
    })

    describe('openScanner', () => {
        it('should', () => {
            // arrange
            // act
            tabsPage.openScanner('label')
            // assert
        })
    })
    describe('ionTabsDidChange', () => {
        it('should', () => {
            // arrange
            let event = {tab: ""}
            tabRef.getSelected = jest.fn()
            // act
            tabsPage.ionTabsDidChange(event);
            // assert
        })
    })
    describe('onTabClick', () => {
        it('should', () => {
            // arrange
            // act
            tabsPage.onTabClick({disabled: true})
            // assert
        })
    })
    describe('checkOnboardingProfileDetails', () => {
        it('should', () => {
            // arrange
            // act
            tabsPage.checkOnboardingProfileDetails();
            // assert
        })
    })
})