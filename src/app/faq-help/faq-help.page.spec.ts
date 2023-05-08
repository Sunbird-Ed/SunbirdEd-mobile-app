import { FaqHelpPage } from './faq-help.page';
import { DomSanitizer } from '@angular/platform-browser';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Platform, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Router, ResolveEnd } from '@angular/router';
import { NgZone } from '@angular/core';
import { FormAndFrameworkUtilService } from '../../services/formandframeworkutil.service';
import {
    SharedPreferences,
    SystemSettingsService,
    FaqService    
} from '@project-sunbird/sunbird-sdk';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { CommonUtilService } from '../../services/common-util.service';
import { AppGlobalService } from '../../services/app-global-service.service';
import { AppHeaderService } from '../../services/app-header.service';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import {mockFaqData} from "../../app/faq-help/faq-help.page.spec.data";
import { expectedFaqs } from './faq-help.page.spec.data';
import { throws } from 'assert';
import { RouterLinks } from '../app.constant';

describe('FaqHelpPage', () => {
    let faqHelpPage: FaqHelpPage;
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('English'))
    };
    const mockSystemSettingsService: Partial<SystemSettingsService> = {
        getSystemSettings: jest.fn(() => of({value: 'url'}))
    };
    const mockFaqService: Partial<FaqService> = {
        getFaqDetails: jest.fn(() => of(mockFaqData))
    };
    const mockDomSanitizer: Partial<DomSanitizer> = {
        bypassSecurityTrustResourceUrl: jest.fn(() => 'url') as any
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAppHeaderService: Partial<AppHeaderService> = {
        showHeaderWithBackButton: jest.fn(),
        headerEventEmitted$: {
            subscribe: jest.fn((fn) => fn({name: 'back'}))
        }
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getConsumptionFaqsUrl: jest.fn(() => Promise.resolve({})),
        getFormConfig: jest.fn(() => [])
    };
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('AppName'))
    };
    const mockPlatform: Partial<Platform> = {};
    const mockTranslateService: Partial<TranslateService> = {
        use: jest.fn(() => of('en'))
    };
    const mockHttpClient: Partial<HttpClient> = {};
    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn(fn => fn())
    };
    const modalCtrl: Partial<ModalController> = {};

    window['sbutility'] = {
        removeFile: jest.fn()
    };

    beforeAll(() => {
        mockRouter.getCurrentNavigation = jest.fn(() => {
            return {
                extras: {}
            };
        });
        faqHelpPage = new FaqHelpPage(
            mockSharedPreferences as any,
            mockSystemSettingsService as any,
            mockFaqService as any,
            mockDomSanitizer as any,
            mockTelemetryGeneratorService as any,
            mockCommonUtilService as any,
            mockAppGlobalService as any,
            mockAppHeaderService as any,
            mockFormAndFrameworkUtilService as any,
            mockLocation as any,
            mockAppVersion as any,
            mockPlatform as any,
            mockTranslateService as any,
            mockHttpClient as any,
            mockRouter as any,
            mockNgZone as any,
            modalCtrl as any
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('intialise', () => {
        it('init constructor', () => {
            // assert
            expect(faqHelpPage).toBeTruthy();
        });
    });

    describe('ngOnInit', () => {
        it('intialise view setting cureLang', (done) => {
            // arrange
            window.addEventListener = jest.fn((as, listener, sd) => listener({
                isTrusted:true,
                data: {
                    action: "action-type",
                    value: {
                        description: 'Some Description'
                    }
                }
            })) as any;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            faqHelpPage.selectedLanguage = 'en';
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            jest.spyOn(faqHelpPage, 'generateInteractTelemetry');
            // act
            faqHelpPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(faqHelpPage.appName).toEqual("AppName");
                expect(mockTranslateService.use).toBeCalled();
                expect(faqHelpPage.generateInteractTelemetry).toBeCalled();
                done();
            }, 50);
        });
    });

    describe('ionViewWillEnter', () => {
        it('display header and set consumptionurl else condition', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false 
            };
            const subscribeWithPriority = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriority
            } as any;
            // act
            faqHelpPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toBeCalled();
                expect(faqHelpPage.consumptionFaqUrl).toEqual('url');
                done();
            }, 20);
        });

        it('display header and set consumptionurl', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const subscribeWithPriority = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriority
            } as any;
            // act
            faqHelpPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toBeCalled();
                expect(faqHelpPage.consumptionFaqUrl).toEqual('url');
                done();
            }, 20);
        });
    });

    describe('ionViewWillEnter', () => {
        it('unsubscribe all observables', () => {
            // arrange
            const unsubscribe = jest.fn();
            faqHelpPage.backButtonFunc = {
                unsubscribe: unsubscribe
            };
            faqHelpPage.headerObservable = {
                unsubscribe: unsubscribe
            };
            // act
            faqHelpPage.ionViewWillLeave();
            // assert
            expect(unsubscribe).toBeCalled();
        });
    });

    describe('toggleGroup', () => {
        it('should trigger an telemetry event if the toggle is clicked', () => {
            // arrange
            const toggleData = {
                data: {
                    position: 1,
                    action: 'open-toggle'
                }
            }
            // act
            faqHelpPage.toggleGroup(toggleData);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        });

        it('should not trigger any telemetry event if there is no data', () => {
            // arrange
            const toggleData = {};
            // act
            faqHelpPage.toggleGroup(toggleData);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).not.toHaveBeenCalled();
        });
    });

    describe('logInteractEvent', () => {
        it('should not generate any interact event when there is no data', () => {
            // arrange
            const postMessage = jest.fn((_, __) => false);
            parent.postMessage = postMessage;
            const onCLickEvent = {
            }
            // act
            faqHelpPage.logInteractEvent(onCLickEvent);
            // assert
            expect(postMessage).not.toBeCalled();
        });

        it('should generate an interact event when faq, response is collected', () => {
            // arrange
            const postMessage = jest.fn((_, __) => false);
            parent.postMessage = postMessage;
            const onCLickEvent = {
                data: {
                    action: 'yes-clicked',
                    position: 1,
                    value: {}
                }
            }
            // act
            faqHelpPage.logInteractEvent(onCLickEvent);
            // assert
            expect(postMessage).toBeCalled();
            expect(faqHelpPage.value.action).toEqual('yes-clicked');
        });
    });

    describe('navigateToReportIssue', () => {
        it('navigate to report issue page', async () => {
            // arrange
            faqHelpPage.corRelation = [];
            // act
            await faqHelpPage.navigateToReportIssue();
            // assert
            expect(mockRouter.navigate).toBeCalledWith(
                [RouterLinks.FAQ_REPORT_ISSUE], {
                    state: {
                        data: faqHelpPage.faqData,
                        corRelation: faqHelpPage.corRelation
                    }
                }
            );
        });
    });

    describe('ionViewDidLeave', () => {
        it('should remove listeners and reset loading', (done) => {
            // arrange
            jest.spyOn(window, 'removeEventListener');
            // act
            faqHelpPage.ionViewDidLeave();
            // assert
            setTimeout(() => {
                expect(window.sbutility.removeFile).toBeCalled();
                expect(window.removeEventListener).toBeCalled();
                expect(faqHelpPage.loading).toBeUndefined();
                done();
            }, 10);
        });
    });

    describe('handleBackButton', () => {
        it('should navigate to previous history screen', () => {
            // arrange
            faqHelpPage.selectedFaqCategory = null;
            // act
            faqHelpPage.handleBackButton();
            // assert
            expect(mockLocation.back).toHaveBeenCalled()
        });

        it('should not navigate to previous history screen', () => {
            // arrange
            faqHelpPage.selectedFaqCategory = {} as any;
            // act
            faqHelpPage.handleBackButton();
            // assert
            expect(mockLocation.back).not.toHaveBeenCalled()
        });
    });

    describe('replaceFaqText', () => {
        it('should seggregate the faq data for APP_NAME based on selected faq category', () => {
            // arrange
            const selectedFaqCategoryData = {
                faqs: [
                    {
                        topic: 'some_topic',
                        description: 'some_description'
                    },
                    {
                        topic: 'some_topic {{APP_NAME}}',
                        description: 'some_description {{APP_NAME}}'
                    }
                ]
            }
            const resultFaqCategoryData = {
                faqs: [
                    {
                        topic: 'some_topic',
                        description: 'some_description'
                    },
                    {
                        topic: 'some_topic appName',
                        description: 'some_description appName'
                    }
                ],
                constants: {}
            }
            faqHelpPage.appName = 'appName';
            faqHelpPage.constants = {};
            // act
            faqHelpPage.replaceFaqText(selectedFaqCategoryData);
            // assert
            expect(faqHelpPage.selectedFaqCategory).toEqual(resultFaqCategoryData);
        });
    });

    describe('onCategorySelect', () => {
        it('should terminate the flow if the category data is empty', () => {
            // arrange
            const faqCategoryEvent = {}
            faqHelpPage.replaceFaqText = jest.fn();
            // act
            faqHelpPage.onCategorySelect(faqCategoryEvent);
            // assert
            expect(faqHelpPage.replaceFaqText).not.toHaveBeenCalled()
        });

        it('should filter the faq data and show up the corresponding videos and faqs', (done) => {
            // arrange
            const faqCategoryEvent = {
                data: {}
            };
            faqHelpPage.replaceFaqText = jest.fn();
            // act
            faqHelpPage.onCategorySelect(faqCategoryEvent);
            // assert
            setTimeout(() => {
                expect(faqHelpPage.replaceFaqText).toHaveBeenCalled()
                done();
            }, 0);
        });
    });

    describe('enableFaqReport', () => {
        it('should navigate to faq report page', () => {
            // arrange
            faqHelpPage.navigateToReportIssue = jest.fn();
            // act
            faqHelpPage.enableFaqReport({});
            // assert
            expect(faqHelpPage.navigateToReportIssue).toHaveBeenCalled()
        });
    });
});
