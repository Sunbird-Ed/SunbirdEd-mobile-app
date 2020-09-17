import { SignInCardComponent } from './sign-in-card.component';
import { ProfileService, AuthService, SharedPreferences } from 'sunbird-sdk';
import {
    CommonUtilService, AppGlobalService, TelemetryGeneratorService,
    ContainerService, FormAndFrameworkUtilService
} from '../../../services';
import { NavController, Events } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { of } from 'rxjs';
import { SbProgressLoader } from '../../../services/sb-progress-loader.service';
import { Router } from '@angular/router';

describe('SignInCardComponent', () => {
    let signInCardComponent: SignInCardComponent;
    const mockProfileService: Partial<ProfileService> = {
    };
    const mockAuthService: Partial<AuthService> = {
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(() => of(undefined))
    };
    const mockNavController: Partial<NavController> = {
    };
    const mockContainerService: Partial<ContainerService> = {
    };
    const mockNgZone: Partial<NgZone> = {
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(() => { }),
        getLoader: jest.fn(() => { })
    };
    const mockFormnFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(() => { }),
        generateInteractTelemetry: jest.fn(() => { })
    };
    const mockEvents: Partial<Events> = {
    };

    const mockAppGlobalService: Partial<AppGlobalService> = {
        resetSavedQuizContent: jest.fn()
    };
    const mockrouter: Partial<Router> = {
        // getCurrentNavigation: jest.fn(() => mockcollectionData as any),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};

    beforeAll(() => {
        signInCardComponent = new SignInCardComponent(
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockSharedPreferences as SharedPreferences,
            mockNavController as NavController,
            mockContainerService as ContainerService,
            mockNgZone as NgZone,
            mockAppVersion as AppVersion,
            mockCommonUtilService as CommonUtilService,
            mockFormnFrameworkUtilService as FormAndFrameworkUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockrouter as Router,
            mockSbProgressLoader as SbProgressLoader
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of SignInCardComponent', () => {
        expect(signInCardComponent).toBeTruthy();
    });

    it('should reset SavedContentQuiz Context', () => {
        // arrange
        mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
        // act
        signInCardComponent.signIn();
        // assert
        expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
    });

});
