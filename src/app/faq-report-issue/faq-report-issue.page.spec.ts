import { FaqReportIssuePage } from './faq-report-issue.page';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import {
    SharedPreferences,
    ProfileService,
    ContentService,
    DeviceInfo,
    FrameworkService,
    FrameworkUtilService,
    TelemetryService,
    TelemetryGeneratorService
 } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from '../../services/app-global-service.service';
import { CommonUtilService } from '../../services/common-util.service';
import { AppHeaderService, FormAndFrameworkUtilService } from '../../services';
import { Location } from '@angular/common';
import {
    mockNavigationResp,
    mockFormConfig,
    mockProfile,
    mockUserProfile,
    mockFormValue,
    mockStateList,
    mockFrameworkList
} from './faq-report-issue.page.spec.data';
import { of } from 'rxjs';
import { FrameworkCommonFormConfigBuilder } from '../../services/common-form-config-builders/framework-common-form-config-builder';
import {AliasBoardName} from '../../pipes/alias-board-name/alias-board-name';

window['sbutility'] = {
    shareSunbirdConfigurations: jest.fn((_, __, fn) => fn())
};

describe('FaqReportIssuePage', () => {
    let faqReportIssuePage: FaqReportIssuePage;
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockNavigationResp) as any
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(() => of()),
        getString: jest.fn(() => of('keypath'))
    };
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of(mockProfile)),
        getAllProfiles: jest.fn(() => of([mockUserProfile]))
    };
    const mockContentService: Partial<ContentService> = {
        getContents: jest.fn(() => of([]))
    };
    const mockDeviceInfo: Partial<DeviceInfo> = {
        getDeviceID: jest.fn(() => '23123124')
    };
    const mockFrameworkService: Partial<FrameworkService> = {
        getFrameworkDetails: jest.fn(() => of(mockFrameworkList)),
        getFrameworkCategoryTerms: jest.fn(() => of(mockFrameworkList))
    };
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {
        getActiveChannelSuggestedFrameworkList: jest.fn(),
        getFrameworkCategoryTerms: jest.fn(() => of(mockFrameworkList))
    };
    const mockTelemetryService: Partial<TelemetryService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn(),
        generateLogEvent: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getCurrentUser: jest.fn(() => mockUserProfile),
        getSelectedBoardMediumGrade: jest.fn(() => 'Karnataka, English, Class 7')
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(),
        translateMessage: jest.fn(),
        currentLang: 'en'
    };
    const mockAppHeaderService: Partial<AppHeaderService> = {
        showHeaderWithBackButton: jest.fn(),
        headerEventEmitted$: {
            subscribe: jest.fn((fn) => fn({name: 'back'}))
        }
    };
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockSocialSharing: Partial<SocialSharing> = {
        shareViaEmail: jest.fn(() => Promise.resolve())
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('AppName'))
    };
    const mockTranslateService: Partial<TranslateService> = {};
    const loader = {
        present: jest.fn(),
        dismiss: jest.fn()
    };
    const mockModalController: Partial<ModalController> = {
        create: jest.fn(() => loader) as any
    };
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn(fn => fn())
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getStateContactList: jest.fn(() => Promise.resolve(mockStateList))
    };
    const mockFrameworkCommonFormConfigBuilder: Partial<FrameworkCommonFormConfigBuilder> = {
        getBoardConfigOptionsBuilder: jest.fn(),
        getMediumConfigOptionsBuilder: jest.fn(),
        getGradeConfigOptionsBuilder: jest.fn(),
        getSubjectConfigOptionsBuilder: jest.fn(),
    };
    const mockAliasBoardName: Partia<AliasBoardName> = {
        transform: jest.fn()
    };

    beforeAll(() => {
        faqReportIssuePage = new FaqReportIssuePage(
            mockRouter as Router,
            mockSharedPreferences as SharedPreferences,
            mockProfileService as ProfileService,
            mockContentService as ContentService,
            mockDeviceInfo as DeviceInfo,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockTelemetryService as TelemetryService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockCommonUtilService as CommonUtilService,
            mockAppHeaderService as AppHeaderService,
            mockLocation as Location,
            mockSocialSharing as SocialSharing,
            mockAppVersion as AppVersion,
            mockTranslateService as TranslateService,
            mockModalController as ModalController,
            mockNgZone as NgZone,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockFrameworkCommonFormConfigBuilder as FrameworkCommonFormConfigBuilder,
            mockAliasBoardName as AliasBoardName
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('intialise', () => {
        mockAppGlobalService.formConfig = mockFormConfig;
        it('should call constructor and interpret formConfig', () => {
            // arrange
           jest.spyOn(faqReportIssuePage, 'arrayListHandling');
            // assert
            expect(faqReportIssuePage).toBeTruthy();
            expect(faqReportIssuePage.formContext).toBeDefined();
            expect(faqReportIssuePage.data).toBeDefined();
            expect(faqReportIssuePage.profile).toEqual(mockProfile);
        });
    });

    describe('User clicks on back button', () => {
        it('Back button event trigered', (done) => {
            // assert
            setTimeout(() => {
                expect(mockLocation.back).toBeCalled();
                done();
            }, 200);
        });
    });

    describe('getBoardDetails()', () => {
        it('No board list available', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([]));
            // act
            faqReportIssuePage.getBoardDetails();
            // assert
            setTimeout(() => {
                expect(presentFn).toBeCalled();
                expect(dismissFn).toBeCalled();
                expect(mockCommonUtilService.showToast).toBeCalledWith('NO_DATA_FOUND');
                done()
            }, 10);
        });

        it('Board list is available', async () => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([1,2,3]));
            // act
            await faqReportIssuePage.getBoardDetails();
            // assert
            expect(presentFn).toBeCalled();
            expect(dismissFn).toBeCalled();
            expect(faqReportIssuePage.syllabusList.length).toBeDefined();
        });
    });

    describe('ngOnInit', () => {
        it('', (done) => {
            window.addEventListener = jest.fn((as, listener, sd) => listener({
                isTrusted:true,
                data: {
                    action: "initiate-email-clicked",
                    initiateEmailBody: ""
                }
            })) as any;
            // act
            faqReportIssuePage.ngOnInit();
            // assert,
            setTimeout(() => {
                expect(faqReportIssuePage.appName).toEqual('AppName');
                done();
            }, 0);
            expect(window.addEventListener).toBeCalled();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toBeCalled();
        });
    });

    describe('submit', () => {
        it('should initiate email', () => {
            // arrange
            faqReportIssuePage.isFormValid = true;
            faqReportIssuePage.formValues = mockFormValue;
            jest.spyOn(faqReportIssuePage, 'initiateEmailAction');
            const syncStat = {
                syncedEventCount: 0
            };
            mockTelemetryService.sync = jest.fn(() => of(syncStat));
            // act
            faqReportIssuePage.submit();
            // assert
            expect(faqReportIssuePage.callToAction).toBeDefined();
            expect(faqReportIssuePage.initiateEmailAction).toBeCalled();
        });

        it('should showcontact popup', () => {
            // arrange
            mockFormValue.category = 'loginRegistration';
            mockFormValue.subcategory = 'certificate';
            faqReportIssuePage.isFormValid = true;
            faqReportIssuePage.formValues = mockFormValue;
            const syncStat = {
                error: 'Error'
            };
            mockTelemetryService.sync = jest.fn(() => of(syncStat));
            jest.spyOn(faqReportIssuePage, 'showContactBoard');
            // act
            faqReportIssuePage.submit();
            // assert
            expect(faqReportIssuePage.callToAction).toBeDefined();
            expect(faqReportIssuePage.showContactBoard).toBeCalled();
        });

        it('should show ackknowledge user response popup', () => {
            // arrange
            mockFormValue.category = 'content';
            mockFormValue.subcategory = 'contentquality';
            faqReportIssuePage.isFormValid = true;
            faqReportIssuePage.formValues = mockFormValue;
            const syncStat = {
                syncedEventCount: 1
            };
            mockTelemetryService.sync = jest.fn(() => of(syncStat));
            jest.spyOn(faqReportIssuePage, 'ackknowledgeResponse');
            // act
            faqReportIssuePage.submit();
            // assert
            expect(faqReportIssuePage.callToAction).toBeDefined();
            expect(faqReportIssuePage.ackknowledgeResponse).toBeCalled();
        });

        it('should open Explore component', () => {
            // arrange
            mockFormValue.category = 'content';
            faqReportIssuePage.formContext = 'contentavailability';
            faqReportIssuePage.isFormValid = true;
            faqReportIssuePage.formValues = mockFormValue;
            jest.spyOn(faqReportIssuePage, 'openExploreBooksComponent');
            // act
            faqReportIssuePage.submit();
            // assert
            expect(faqReportIssuePage.callToAction).toBeDefined();
            expect(faqReportIssuePage.openExploreBooksComponent).toBeCalled();
        });

        it('should generate telemetry for notify selected', () => {
            // arrange
            mockFormValue.category = 'content';
            mockFormValue.subcategory = 'contentavailability';
            mockFormValue.children.subcategory['notify'] = true;
            faqReportIssuePage.isFormValid = true;
            faqReportIssuePage.formValues = mockFormValue;
           jest.spyOn(faqReportIssuePage, 'syncTelemetry').mockImplementation();
           jest.spyOn(faqReportIssuePage, 'takeAction').mockImplementation();
            // act
            faqReportIssuePage.submit();
            // assert
            setTimeout(() => {
                expect(faqReportIssuePage.callToAction).toBeDefined();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalled();
            }, 0);
        });

        it('should generate telemetry for notify selected', () => {
            // arrange
            mockFormValue.category = 'otherissues';
            faqReportIssuePage.isFormValid = true;
            faqReportIssuePage.formValues = mockFormValue;
           jest.spyOn(faqReportIssuePage, 'syncTelemetry').mockImplementation();
           jest.spyOn(faqReportIssuePage, 'takeAction').mockImplementation();
            // act
            faqReportIssuePage.submit();
            // assert
            expect(faqReportIssuePage.callToAction).toBeDefined();
            expect(faqReportIssuePage.takeAction).toHaveBeenCalledWith('initiateEmail');
        });

        it('should other issue selected', () => {
            // arrange
            mockFormValue.category = 'otherissues';
            mockFormValue.subcategory = undefined;
            mockFormValue.children['category'] = mockFormValue.children.subcategory;
            delete mockFormValue.children.subcategory
            faqReportIssuePage.isFormValid = true;
            faqReportIssuePage.formValues = mockFormValue;
            faqReportIssuePage.showSupportContact = false;
           jest.spyOn(faqReportIssuePage, 'syncTelemetry').mockImplementation();
            // act
            faqReportIssuePage.submit();
            // assert
            expect(mockFormValue.subcategory).toBeUndefined();
        });
    });

    describe('ngOnDestroy', () => {
        it('should unsubscribe headerObservable and reset formConfig', () => {
            // arrange
            faqReportIssuePage.headerObservable = {
                unsubscribe: jest.fn()
            }
            // act
            faqReportIssuePage.ngOnDestroy();
            // assert
            expect(faqReportIssuePage.headerObservable.unsubscribe).toBeCalled();
            expect(mockAppGlobalService.formConfig).toBeUndefined();
        });
    });

    describe('valueChanged', () => {
        it('category should be hidden', () => {
            // arrange
            faqReportIssuePage.formContext = undefined;
            mockFormValue.category = 'otherissues';
            // act
            faqReportIssuePage.valueChanged(mockFormValue);
            // assert
            expect(faqReportIssuePage.formValues).toEqual(mockFormValue);
            expect(faqReportIssuePage.formConfig[1].templateOptions.hidden).toBeTruthy();
        });

        it('category should be shown', () => {
            // arrange
            faqReportIssuePage.formContext = undefined;
            mockFormValue.category = 'loginRegistration';
            // act
            faqReportIssuePage.valueChanged(mockFormValue);
            // assert
            expect(faqReportIssuePage.formValues).toEqual(mockFormValue);
            expect(faqReportIssuePage.formConfig[1].templateOptions.hidden).toBeFalsy();
        });
    });

    describe('statusChanged', () => {
        it('should enable submit button',() => {
            // act
            faqReportIssuePage.statusChanged({ isValid: true });
            // assert
            expect(faqReportIssuePage.btnColor).toEqual('#006DE5');
        });

        it('should disable submit button',() => {
            // act
            faqReportIssuePage.statusChanged({ isValid: false });
            // assert
            expect(faqReportIssuePage.btnColor).toEqual('#8FC4FF');
        });
    });

    describe('dataLoadStatus', () => {
        it('should present loader', async () => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            // act
            await faqReportIssuePage.dataLoadStatus('LOADING');
            // assert
            expect(faqReportIssuePage.loader.present).toBeCalled();
        });

        it('should dismiss loader', async () => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            // act
            await faqReportIssuePage.dataLoadStatus('');
            // assert
            expect(faqReportIssuePage.loader.dismiss).toBeCalled();
        });
    });

    describe('responseSubmitted', () => {
        it('should navigate back', () => {
            // act
            faqReportIssuePage.responseSubmitted();
            // assert
            expect(mockLocation.back).toBeCalled();
        });
    });

});
