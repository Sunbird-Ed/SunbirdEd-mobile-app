import { AppGlobalService, CommonUtilService, ContainerService, OnboardingConfigurationService } from '../../services';
import { TabsPage } from './tabs.page';
import { Events } from '../../util/events';
import { IonRouterOutlet, IonTabs, ToastController } from '@ionic/angular';
import { ProfileService, ProfileSource, ProfileType, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { plugins } from 'chart.js';
import { EventTopics, ProfileConstants, RouterLinks } from '../app.constant';

export const mockProfileData = {
    uid: '123',
    firstName: 'user_name',
    userId: 'sample_user_id',
    handle: 'sample_name',
    medium: ['English', 'Bengali'],
    board: ['CBSE'],
    profileType: ProfileType.TEACHER,
    source: ProfileSource.SERVER,
    rootOrgId: 'sample_1',
    rootOrg: {
        rootOrgId: 'sample_org_id',
        hashTagId: 'sample_hashTagId'
    },
    roleList: [{id: 'teacher', name: 'private'}, {id: 'state_teacher', name: 'public'}],
    organisations: [{
        organisationId: 'xyz',
        roles: ['teacher', 'state_teacher'],
        locations: {
            state: 'tripura',
            district: 'west_tripura',
            block: 'dhaleshwar'
        }
    },
        {
            organisationId: 'abc',
            roles: ['teacher', 'state_teacher'],
            locations: {
                state: 'west-bengal',
                district: 'kolkata',
                block: 'howrah'
            }
        }],
    badgeAssertions: [
        'sample_badge1', 'sampleBadge 2'
    ],
    mappedTrainingCertificates: [1, 2, 3],
    phone: '99999999',
    email: 'xyz@gmail.com',
    recoveryEmail: 'abc@gmail.com',
    recoveryPhone: '987654',
    profileUserType: {
        type: 'teacher'
    },
    profileUserTypes: [{type: 'teacher'}, {type: 'student'}],
    declarations: [{
        orgId: 'sample_org_id',
        persona: 'sample_persona',
        status: 'sample_status',
        info: [{
            data: 'sample_data'
        }],
        errorType: 'sample_,error_type',
    }, {
        orgId: 'sample_org_id2'
    }],
    userLocations: [ 'State', 'District', 'Block', 'Cluster' ],
    framework: {
        medium: ['English', 'Bengali'],
        board: ['CBSE'],
    },
    serverProfile: {
        roles: [
            'teacher',
        'headmaster'
        ]
    }
};

describe('TabsPage', () => {
    let tabsPage: TabsPage;
    const mockContainerService: Partial<ContainerService> = {
        getAllTabs: jest.fn(),
        removeAllTabs: jest.fn()
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
        getString: jest.fn(() => of('')),
        putString: jest.fn(),
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
        it('should check session and return if undefined', () => {
            // arrange
            mockAppGlobalService.authService = {
                getSession: jest.fn(() => of(undefined))
            }
            mockAppGlobalService.guestProfileType = 'teacher'
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => true)
            mockContainerService.getAllTabs = jest.fn(() => [{name:'qrscanner', root: ''}]);
            // act
            tabsPage.ngOnInit();
            // assert
            expect(mockAppGlobalService.authService.getSession).toHaveBeenCalled();
        });

        it('should check session and return if undefined and guest profile is not admin', () => {
            // arrange
            mockAppGlobalService.authService = {
                getSession: jest.fn(() => of(undefined))
            }
            mockAppGlobalService.guestProfileType = 'student'
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => false)
            mockContainerService.getAllTabs = jest.fn(() => [{name:'qrscanner', root: ''}]);
            // act
            tabsPage.ngOnInit();
            // assert
            expect(mockAppGlobalService.authService.getSession).toHaveBeenCalled();
        });

        it('should check session and return if welcoem toast prefernce is false', () => {
            // arrange
            mockAppGlobalService.authService = {
                getSession: jest.fn(() => of(true))
            }
            mockAppGlobalService.guestProfileType = 'administrator'
            mockSharedPreferences.getString = jest.fn(() => of('administrator'))
            mockContainerService.getAllTabs = jest.fn(() => [{name:'qrscanner', root: ''}]);
            // act
            tabsPage.ngOnInit();
            // assert
            expect(mockAppGlobalService.authService.getSession).toHaveBeenCalled();
        });

        it('should check session and get profile deatils', () => {
            // arrange
            mockAppGlobalService.authService = {
                getSession: jest.fn(() => of({usertoken: 'some_token'}))
            }
            mockAppGlobalService.guestProfileType = 'administrator'
            const req = {
                userId: 'some_token',
                requiredFields: ProfileConstants.REQUIRED_FIELDS,
              }
            mockSharedPreferences.getString = jest.fn(() => of('true'));
            mockSharedPreferences.putString = jest.fn(() => of());
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(mockProfileData)) as any;
            mockContainerService.getAllTabs = jest.fn(() => [{name:'qrscanner', root: ''}]);
            mockCommonUtilService.showToast = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn();
            mockEvents.subscribe = jest.fn(() => of({navigateToCourse: "true"}));
            mockContainerService.removeAllTabs = jest.fn();
            // act
            tabsPage.ngOnInit()
            // assert
            expect(mockAppGlobalService.authService.getSession).toHaveBeenCalled()
        })
    })

    describe('ngAfterViewInit', () => {
        it('should', () => {
            // arrange
            mockContainerService.getAllTabs = jest.fn(() => Promise.resolve([{name: 'qrscanner', root: ''}])) as any;
            tabsPage.tabRef = {
                getSelected: jest.fn(() => 'qrscanner')
            } as any
            // act
            tabsPage.ngAfterViewInit()
            // assert
        })
    })

    describe('setQRStyles', () => {
        it('should setQRStyles', (done) => {
            // arrange
            window.document = {
                getElementById: {
                    qrScannerIcon: {
                        getBoundingClientRect: jest.fn(() => ({left: 324, width: 234}))
                    },
                },
                setAttribute: jest.fn(() => ({"style": "", "background-image": ""}))
            } as any;
            window.document = {
                getElementById: {
                    backdrop: {
                        getBoundingClientRect: jest.fn(() => ({left: 324, width: 234})),
                        getElementsByClassName: {
                            bg: [{}]
                        }
                    }
                },
                setAttribute: jest.fn(() => ({"style": "", "background-image": ""}))
            } as any
            // act
            tabsPage.setQRStyles();
            // assert
            setTimeout(() => {

                done();
            }, 2000);
        })
    })

    describe('checkAndroidWebViewVersion', () => {
        it('should getCurrentWebViewPackageInfo', () => {
            // arrange
            window.cordova.plugins = {webViewChecker: {getCurrentWebViewPackageInfo: jest.fn(() => Promise.resolve({versionName:''}))}}
            // act
            tabsPage.checkAndroidWebViewVersion();
            // assert
        })

        it('should getCurrentWebViewPackageInfo else case on version name', () => {
            // arrange
            window.cordova.plugins = {webViewChecker: {getCurrentWebViewPackageInfo: jest.fn(() => Promise.resolve({}))}}
            // act
            tabsPage.checkAndroidWebViewVersion();
            // assert
        })

        it('should catch error getCurrentWebViewPackageInfo', () => {
            // arrange
            window.cordova.plugins = {webViewChecker: {getCurrentWebViewPackageInfo: jest.fn(() => Promise.reject({error:''}))}}
            // act
            tabsPage.checkAndroidWebViewVersion();
            // assert
        })
    })

    describe('ionViewWillEnter', () => {
        it('should get all tabs and publish and subscribe', () => {
            // arrange
            tabsPage.tabRef = {
                outlet: {component: {
                    tabViewWillEnter: jest.fn(() => true)}
                }
            } as any
            mockContainerService.getAllTabs = jest.fn(() => [{name: 'qrscanner', root: ''}]);
            mockEvents.publish = jest.fn();
            mockEvents.subscribe = jest.fn(() => ({}));
            // act
            tabsPage.ionViewWillEnter()
            // assert
            expect(mockContainerService.getAllTabs).toHaveBeenCalled();
            expect(mockEvents.publish).toHaveBeenCalledWith('update_header');
            expect(mockEvents.subscribe).toHaveBeenCalledTimes(2);
        })

        it('should get all tabs and publish and subscribe and tabViewWillEnter is false', () => {
            // arrange
            tabsPage.tabRef = {
                outlet: {component: {
                    tabViewWillEnter: jest.fn(() => false)}
                }
            } as any
            mockContainerService.getAllTabs = jest.fn(() => [{name: 'qrscanner', root: ''}]);
            mockEvents.publish = jest.fn();
            mockEvents.subscribe = jest.fn(() => {});
            // act
            tabsPage.ionViewWillEnter()
            // assert
            expect(mockContainerService.getAllTabs).toHaveBeenCalled();
            expect(mockEvents.publish).toHaveBeenCalledWith('update_header');
            expect(mockEvents.subscribe).toHaveBeenCalledTimes(2);
        })
    })

    describe('openScanner', () => {
        it('should open scanner', () => {
            // arrange
            mockEvents.public = jest.fn()
            // act
            tabsPage.openScanner({label: 'label'})
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.TAB_CHANGE, 'label')
        })
    });

    describe('ionTabsDidChange', () => {
        it('should publish tab change if not resource', () => {
            // arrange
            let event = {tab: ""}
            mockEvents.publish = jest.fn()
            tabsPage.tabRef = {
                getSelected: jest.fn(() => 'name')
            } as any
            // act
            tabsPage.ionTabsDidChange(event);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.TAB_CHANGE, event.tab)
            expect(tabsPage.tabRef.getSelected).toHaveBeenCalled();
        })

        it('should publish tab change if resource', () => {
            // arrange
            let event = {tab: "resources"}
            mockEvents.publish = jest.fn()
            tabsPage.tabRef = {
                getSelected: jest.fn(() => 'name')
            } as any;
            // act
            tabsPage.ionTabsDidChange(event);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.TAB_CHANGE, event.tab)
        })
    });

    describe('onTabClick', () => {
        it('should show toast available teachers for diabled true', () => {
            // arrange
            const event = {
                disabled: true
            }
            mockCommonUtilService.showToast = jest.fn()
            // act
            tabsPage.onTabClick(event)
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('AVAILABLE_FOR_TEACHERS', false, 'sb-toast available-later')
        })

        it('should show toast Will be available in later release for diabled and availableLater true', () => {
            // arrange
            const event = {
                disabled: true,
                availableLater: true
            }
            mockCommonUtilService.showToast = jest.fn()
            // act
            tabsPage.onTabClick(event)
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('Will be available in later release', false, 'sb-toast available-later')
        })

        it('should return for disabled false', () => {
            // arrange
            const event = {
                disabled: false
            }
            // act
            tabsPage.onTabClick(event)
            // assert
        })
    })
    
    describe('checkOnboardingProfileDetails', () => {
        it('should return for isOnBoardingCompleted and isUserLoggedIn', () => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true)
            mockAppGlobalService.isOnBoardingCompleted = true
            // act
            tabsPage.checkOnboardingProfileDetails();
            // assert
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled()
            expect(mockAppGlobalService.isOnBoardingCompleted).toBeTruthy()
        })

        it('should navigate to profile settings page for isOnBoardingCompleted and isUserLoggedIn is false', () => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false)
            mockAppGlobalService.isOnBoardingCompleted = false
            mockRouter.navigate = jest.fn()
            // act
            tabsPage.checkOnboardingProfileDetails();
            // assert
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled()
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE_SETTINGS}`], {
                state: {
                  hideBackButton: true
                }
              })
        })
    })
})