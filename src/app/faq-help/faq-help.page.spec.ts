import { FaqHelpPage } from './faq-help.page'
import { DomSanitizer } from '@angular/platform-browser';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';
import {
    SharedPreferences,
    SystemSettingsService,
    FaqService
} from 'sunbird-sdk';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService, } from '@app/services/app-global-service.service';
import { AppHeaderService, } from '@app/services/app-header.service';
import { FormAndFrameworkUtilService, } from '@app/services/formandframeworkutil.service';
import { Location } from '@angular/common';
import { InteractType, InteractSubtype, Environment, PageId } from '../../services/telemetry-constants';

describe('FaqHelpPage', () => {
    let faqHelpPage: FaqHelpPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockDomSanitizer: Partial<DomSanitizer> = {};
    const mockFaqService: Partial<FaqService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockHttp: Partial<HttpClient> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockRouter: Partial<Router> = {};
    const mockSystemSettingsService: Partial<SystemSettingsService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockTranslate: Partial<TranslateService> = {};
    const mockZone: Partial<NgZone> = {};

    beforeAll(() => {
        faqHelpPage = new FaqHelpPage(
            mockPreferences as SharedPreferences,
            mockSystemSettingsService as SystemSettingsService,
            mockFaqService as FaqService,
            mockDomSanitizer as DomSanitizer,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockAppGlobalService as AppGlobalService,
            mockHeaderService as AppHeaderService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockLocation as Location,
            mockAppVersion as AppVersion,
            mockPlatform as Platform,
            mockTranslate as TranslateService,
            mockHttp as HttpClient,
            mockRouter as Router,
            mockZone as NgZone
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of faqHelpPage', () => {
        expect(faqHelpPage).toBeTruthy();
    });

    it('should generate a interact telemetry for click event', () => {
        const value = {
            values: {
                value: {
                    description: '<li>Update the Sunbird mobile app to the latest version</li>'
                }
            }
        };
        const interactSubtype = InteractSubtype.NO_CLICKED;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        faqHelpPage.generateInteractTelemetry(interactSubtype, value);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH, interactSubtype,
            Environment.USER,
            PageId.FAQ, undefined,
            value
        );
    });
});
