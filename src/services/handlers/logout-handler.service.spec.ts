import { LogoutHandlerService } from './logout-handler.service';
import {
    AuthService, ProfileService, SharedPreferences
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { Events } from '@ionic/angular';
import { ContainerService } from '../container.services';
import { Router } from '@angular/router';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { of } from 'rxjs';

describe('LogoutHandlerService', () => {
    let logoutHandlerService: LogoutHandlerService;
    const mockProfileService: Partial<ProfileService> = {
        setActiveSessionForProfile: jest.fn(() => of(true))
    };
    const mockAuthService: Partial<AuthService> = {
        resignSession: jest.fn(() => of())
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockContainerService: Partial<ContainerService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockRoute: Partial<Router> = {};

    beforeAll(() => {
        logoutHandlerService = new LogoutHandlerService(
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockSharedPreferences as SharedPreferences,
            mockCommonUtilService as CommonUtilService,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockContainerService as ContainerService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockRoute as Router
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('constructor', () => {
        it('initialise', () => {
            // assert
            expect(logoutHandlerService).toBeDefined();
        });
    });

    describe('', () => {
        it('', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            jest.spyOn(mockSharedPreferences, 'getString').mockReturnValue(of('userId'));
            // act
            logoutHandlerService.onLogout();
            // assert
        });
    });
});