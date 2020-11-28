import { UserTypeSelectionPage } from './user-type-selection';
import {
    ProfileService,
    SharedPreferences
} from 'sunbird-sdk';
import { Events, Platform } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    ContainerService,
    AppHeaderService
} from '../../../services';
import { of } from 'rxjs';
import { NgZone } from '@angular/core';
import { HasNotSelectedFrameworkGuard } from '@app/guards/has-not-selected-framework.guard';
import { NativePageTransitions } from '@ionic-native/native-page-transitions/ngx';
import { CorReleationDataType, Environment, InteractSubtype, InteractType, PageId, SplashScreenService } from '../../services';
import { ProfileType } from '@project-sunbird/sunbird-sdk';
import { PreferenceKey } from '../app.constant';

describe('UserTypeSelectionPage', () => {
    let userTypeSelectionPage: UserTypeSelectionPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn(),
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'sample_translated_message'),
        showToast: jest.fn()
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockEvents: Partial<Events> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockProfileService: Partial<ProfileService> = {
        updateProfile: jest.fn(() => of({}))
    };
    const mockRouterExtras = {
        extras: {
            state: {
                contentType: 'contentType',
                corRelationList: 'corRelationList',
                source: 'source',
                enrolledCourses: 'enrolledCourses' as any,
                userId: 'userId',
                shouldGenerateEndTelemetry: false,
                isNewUser: true,
                lastCreatedProfile: { id: 'sample-id' }
            }
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRouterExtras as any),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn()
    };
    const mockActivatedRoute: Partial<ActivatedRoute> = {};
    mockActivatedRoute.snapshot = {
        queryParams: {
            reOnBoard: {}
        }
    } as any;
    const mockSharedPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(() => of(undefined)),
        getString: jest.fn(() => of('ka' as any))
    };

    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };

    const mockPlatform: Partial<Platform> = {
    };

    const mockHasNotSelectedFrameworkGuard: Partial<HasNotSelectedFrameworkGuard> = {
    };

    const mockSplashScreenService: Partial<SplashScreenService> = {
    };

    const mockNativePageTransitions: Partial<NativePageTransitions> = {
    };


    beforeAll(() => {
        userTypeSelectionPage = new UserTypeSelectionPage(
            mockProfileService as ProfileService,
            mockSharedPreferences as SharedPreferences,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockContainer as ContainerService,
            mockNgZone as NgZone,
            mockEvents as Events,
            mockCommonUtilService as CommonUtilService,
            mockAppGlobalService as AppGlobalService,
            mockPlatform as Platform,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockHasNotSelectedFrameworkGuard as HasNotSelectedFrameworkGuard,
            mockSplashScreenService as SplashScreenService,
            mockNativePageTransitions as NativePageTransitions
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of UserTypeSelectionPage', () => {
        expect(userTypeSelectionPage).toBeTruthy();
    });

    describe('selectUserTypeCard', () => {
        it('should update the selectedUserType , continueAs Message and save the userType in preference', () => {
            // arrange
            // act
            userTypeSelectionPage['profile'] = {uid: 'sample_uid'};
            jest.useFakeTimers();
            userTypeSelectionPage.selectUserTypeCard('USER_TYPE_1', ProfileType.TEACHER);
            jest.advanceTimersByTime(200);
            // assert
            expect(userTypeSelectionPage.selectedUserType).toEqual(ProfileType.TEACHER);
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('CONTINUE_AS_ROLE', 'sample_translated_message');
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER);
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                InteractType.TOUCH,
                InteractSubtype.USER_TYPE_SELECTED,
                Environment.ONBOARDING,
                PageId.USER_TYPE_SELECTION,
                undefined,
                { userType: 'TEACHER' }
            );

            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                InteractType.SELECT_USERTYPE, '',
                Environment.ONBOARDING,
                PageId.USER_TYPE,
                undefined,
                undefined,
                undefined,
                [{ id: 'teacher', type: CorReleationDataType.USERTYPE }]
            );
            jest.useRealTimers();
            jest.clearAllTimers();
        });

    });

});
