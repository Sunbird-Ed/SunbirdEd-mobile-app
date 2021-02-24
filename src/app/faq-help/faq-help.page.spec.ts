import { FaqHelpPage } from './faq-help.page';
import { DomSanitizer } from '@angular/platform-browser';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Router, ResolveEnd } from '@angular/router';
import { NgZone } from '@angular/core';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import {
    SharedPreferences,
    SystemSettingsService,
    FaqService    
} from 'sunbird-sdk';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import {mockFaqData} from "@app/app/faq-help/faq-help.page.spec.data";
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

    window['supportfile'] = {
        removeFile: jest.fn()
    }

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
            mockNgZone as any
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
                expect(faqHelpPage.faqs).toEqual(expectedFaqs);
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
        it('show group', () => {
            // arrange
            faqHelpPage.shownGroup = 'group';
            // act
            faqHelpPage.toggleGroup('group');
            // assert
            expect(faqHelpPage.shownGroup).toEqual(null);
        });

        it('hide group', () => {
            // arrange
            // act
            faqHelpPage.toggleGroup('group');
            // assert
            expect(faqHelpPage.shownGroup).toEqual('group');
        });
    });

    describe('noClicked', () => {
        it('postMessage should be called', () => {
            // arrange
            const postMessage = jest.fn((_, __) => false);
            parent.postMessage = postMessage;
            // act
            faqHelpPage.noClicked(0);
            // assert
            expect(postMessage).toBeCalled();
        });

        it('isNoclicked should be true', () => {
            // arrange
            const postMessage = jest.fn((_, __) => false);
            parent.postMessage = postMessage;
            // act
            faqHelpPage.noClicked(0);
            // assert
            expect(faqHelpPage.isNoClicked).toBeTruthy();
        });
    });

    describe('yesClicked', () => {
        it('postMessage should be called', () => {
            // arrange
            const postMessage = jest.fn((_, __) => false);
            parent.postMessage = postMessage;
            // act
            faqHelpPage.yesClicked(0);
            // assert
            expect(postMessage).toBeCalled();
        });
    });
    
    it('isNoclicked should be true', () => {
        // arrange
        const postMessage = jest.fn((_, __) => false);
        parent.postMessage = postMessage;
        // act
        faqHelpPage.yesClicked(0);
        // assert
        expect(faqHelpPage.isYesClicked).toBeTruthy();
    });

    describe('submitClicked', () => {
        it('', () => {
            // arrange
            const postMessage = jest.fn((_, __) => false);
            parent.postMessage = postMessage;
            // act
            faqHelpPage.submitClicked('value', 0);
            // assert
            expect(postMessage).toBeCalled();
            expect(faqHelpPage.value.action).toEqual('no-clicked');
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
                        data: faqHelpPage.data,
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
                expect(window.supportfile.removeFile).toBeCalled();
                expect(window.removeEventListener).toBeCalled();
                expect(faqHelpPage.loading).toBeUndefined();
                done();
            }, 10);
        });
    });
});
