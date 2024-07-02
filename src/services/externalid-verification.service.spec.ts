import {Router} from '@angular/router';
import {ExternalIdVerificationService} from './externalid-verification.service';
import {ProfileService, AuthService, SharedPreferences} from '@project-sunbird/sunbird-sdk';
import {
    LocalCourseService,
    CommonUtilService,
    FormAndFrameworkUtilService,
    AppGlobalService
} from '../services';
import {} from './common-util.service';
import {PopoverController} from '@ionic/angular';
import {SplaschreenDeeplinkActionHandlerDelegate} from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import {of} from 'rxjs';

describe('ExternalIdVerificationService', () => {
    let externalIdVerificationService: ExternalIdVerificationService;

    const mockProfileService: Partial<ProfileService> = {
        isDefaultChannelProfile: jest.fn(() => of(false)),
        getServerProfilesDetails: jest.fn(() => of({rootOrg: {rootOrgId: '1234567890'}} as any)),
        getUserFeed: jest.fn(() => of([])),
    };
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of({} as any))
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        closeSigninOnboardingLoader: jest.fn(),
        authService: mockAuthService as any
    };
    const mockPopOverController: Partial<PopoverController> = {};
    mockPopOverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        dismiss: jest.fn(() => Promise.resolve({})),
    } as any)));
    const mockFormnFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getTenantSpecificMessages: jest.fn()
    };
    const mockSplaschreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {
        navigateContent: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};

    const mockLocalCourseService: Partial<LocalCourseService> = {
        checkCourseRedirect: jest.fn()
    };
    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    beforeAll(() => {
        externalIdVerificationService = new ExternalIdVerificationService(
            mockProfileService as ProfileService,
            mockSharedPreferences as SharedPreferences,
            mockAppGlobalService as AppGlobalService,
            mockPopOverController as PopoverController,
            mockFormnFrameworkUtilService as FormAndFrameworkUtilService,
            mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate,
            mockCommonUtilService as CommonUtilService,
            mockLocalCourseService as LocalCourseService,
            mockRouter as Router
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create an instance of ExternalIdVerificationService', () => {
        expect(externalIdVerificationService).toBeTruthy();
    });

    describe('checkQuizContent()', () => {

        it('should navigate to contentdetails page if its a Quiztype content', () => {
            // arrange
            mockAppGlobalService.limitedShareQuizContent = 'do_12345';
            // act
            externalIdVerificationService.checkQuizContent();
            // assert
            expect(mockAppGlobalService.limitedShareQuizContent).toBeNull();
            expect(mockSplaschreenDeeplinkActionHandlerDelegate.navigateContent).toHaveBeenCalledWith('do_12345');
        });

        it('should navigate to contentdetails page if its a Quiztype content', (done) => {
            // arrange
            mockAppGlobalService.limitedShareQuizContent = null;
            // act

            // assert
            externalIdVerificationService.checkQuizContent().then((response) => {
                expect(response).toBeFalsy();
                done();
            });
        });
    });

    describe('checkJoinTraining()', () => {

        it('should follow course Redirect flow', () => {
            // arrange
            mockAppGlobalService.isJoinTraningOnboardingFlow = true;
            // act
            // assert
            externalIdVerificationService.checkJoinTraining().then(() => {
                expect(mockLocalCourseService.checkCourseRedirect).toHaveBeenCalled();
                expect(mockAppGlobalService.isJoinTraningOnboardingFlow).toBeFalsy();
            });
        });
    });

    describe('showExternalIdVerificationPopup()', () => {

        it('should show Ext Verification popup if user feed category  orgmigrationaction for multiple value of prospectChannelsIds', (done) => {
            // arrange
            externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(false));
            externalIdVerificationService.checkJoinTraining = jest.fn(() => Promise.resolve(true));
            externalIdVerificationService.isCustodianUser$ = of(true);
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockAppGlobalService.closeSigninOnboardingLoader = jest.fn();
            externalIdVerificationService.isCustodianUser$ = of(true);
            mockProfileService.getUserFeed = jest.fn(() => of([{
                data: {
                    prospectChannels: ['DB_org'],
                    prospectChannelsIds: [
                        { name: 'DB_org', id: '01300580670386995217' },
                        { name: 'DB_org_1', id: '013005806703869952178' }
                    ]
                },
                category: 'OrgMigrationAction'
            }] as any));
            const mockCreate = jest.spyOn(mockPopOverController, 'create');
            mockFormnFrameworkUtilService.getTenantSpecificMessages = jest.fn(() => Promise.resolve([{ range: [{}] }]));
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                managedSession: undefined
            })) as any;
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            externalIdVerificationService.showExternalIdVerificationPopup();
            // assert
            setTimeout(() => {
                expect(externalIdVerificationService.isCustodianUser$).toBeTruthy();
                expect(mockAppGlobalService.closeSigninOnboardingLoader).toHaveBeenCalled();
                expect(mockProfileService.getUserFeed).toHaveBeenCalled();
                expect(mockFormnFrameworkUtilService.getTenantSpecificMessages).toHaveBeenCalled();
                expect(mockPopOverController.create).toHaveBeenCalled();
                expect(mockCreate.mock.calls[0][0]['componentProps']['userFeed']).toEqual({
                    data: {
                        prospectChannels: ['DB_org'],
                        prospectChannelsIds: [
                            { name: 'DB_org', id: '01300580670386995217' },
                            { name: 'DB_org_1', id: '013005806703869952178' }
                        ]
                    },
                    category: 'OrgMigrationAction'
                });
                expect(mockCreate.mock.calls[0][0]['componentProps']['tenantMessages']).toEqual({});
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                expect(mockSharedPreferences.putString).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show Ext Verification popup if user feed category  orgmigrationaction', (done) => {
            // arrange
            externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(false));
            externalIdVerificationService.checkJoinTraining = jest.fn(() => Promise.resolve(true));
            externalIdVerificationService.isCustodianUser$ = of(true);
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockAppGlobalService.closeSigninOnboardingLoader = jest.fn();
            externalIdVerificationService.isCustodianUser$ = of(true);
            mockProfileService.getUserFeed = jest.fn(() => of([{
                data: {
                    prospectChannels: ['DB_org'],
                    prospectChannelsIds: [{ name: 'DB_org', id: '01300580670386995217' }]
                },
                category: 'OrgMigrationAction'
            }] as any));
            const mockCreate = jest.spyOn(mockPopOverController, 'create');
            mockFormnFrameworkUtilService.getTenantSpecificMessages = jest.fn(() => Promise.resolve([{ range: [{}] }]));
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                managedSession: undefined
            })) as any;
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            externalIdVerificationService.showExternalIdVerificationPopup();
            // assert
            setTimeout(() => {
                expect(externalIdVerificationService.isCustodianUser$).toBeTruthy();
                expect(mockAppGlobalService.closeSigninOnboardingLoader).toHaveBeenCalled();
                expect(mockProfileService.getUserFeed).toHaveBeenCalled();
                expect(mockFormnFrameworkUtilService.getTenantSpecificMessages).toHaveBeenCalled();
                expect(mockPopOverController.create).toHaveBeenCalled();
                expect(mockCreate.mock.calls[0][0]['componentProps']['userFeed']).toEqual({
                    data: {
                        prospectChannels: ['DB_org'],
                        prospectChannelsIds: [{ name: 'DB_org', id: '01300580670386995217' }]
                    },
                    category: 'OrgMigrationAction'
                });
                expect(mockCreate.mock.calls[0][0]['componentProps']['tenantMessages']).toEqual({});
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('shouldn\'t show Ext Verification popup if its Quiz content redirection flow', (done) => {
            // arrange
            mockAppGlobalService.redirectUrlAfterLogin = 'url';
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(false));
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                managedSession: {}
            })) as any;
            // act
            externalIdVerificationService.showExternalIdVerificationPopup();
            // assert
            setTimeout(() => {
                expect(mockPopOverController.create).not.toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith(
                    ['url'],
                    expect.anything()
                );
                done()
            }, 0);
        });

        it('shouldn\'t show Ext Verification popup if network is not available', (done) => {
            // arrange
            externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(true));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            // act
            externalIdVerificationService.showExternalIdVerificationPopup();
            // assert
            expect(mockPopOverController.create).not.toHaveBeenCalled();
            done()
        });

        it('shouldn\'t show Ext Verification popup if user is not a custodian user', (done) => {
            // arrange
            externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(false));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            // act
            externalIdVerificationService.showExternalIdVerificationPopup();
            // assert
            expect(mockPopOverController.create).not.toHaveBeenCalled();
            done()
        });

        it('shouldn\'t show Ext Verification popup if user feed is not available', (done) => {
            // arrange
            externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(false));
            externalIdVerificationService.isCustodianUser$ = of(true);
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            // act
            externalIdVerificationService.showExternalIdVerificationPopup();
            // assert
            expect(mockPopOverController.create).not.toHaveBeenCalled();
            done()
        });

        it('shouldn\'t show Ext Verification popup if user feed category is not orgmigrationaction', (done) => {
            // arrange
            externalIdVerificationService.checkQuizContent = jest.fn(() => Promise.resolve(false));
            externalIdVerificationService.isCustodianUser$ = of(true);
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockProfileService.getUserFeed = jest.fn(() => of([{category: 'otherthanusermigration'} as any]));
            // act
            externalIdVerificationService.showExternalIdVerificationPopup();
            // assert
            expect(mockPopOverController.create).not.toHaveBeenCalled();
            done()
        });
    });
});
