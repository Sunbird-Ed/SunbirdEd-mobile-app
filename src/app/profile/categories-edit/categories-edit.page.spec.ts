import { CategoriesEditPage } from './categories-edit.page';
import {
    FrameworkService,
    FrameworkUtilService,
    ProfileService} from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Events, Platform } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import {
    AppGlobalService,
    CommonUtilService,
    ContainerService,
    AppHeaderService,
    ActivePageService,
    FormAndFrameworkUtilService
} from '../../../services';
import { Location } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { ProfileHandler } from '@app/services/profile-handler';
import { SbProgressLoader } from '../../../services/sb-progress-loader.service';
import { ExternalIdVerificationService } from '@app/services/externalid-verification.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { of } from 'rxjs';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { PreferenceKey } from '../../app.constant';

describe('CategoryEditPage', () => {
    let categoryEditPage: CategoriesEditPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn(),
        closeSigninOnboardingLoader: jest.fn(),
        getCurrentUser: jest.fn(() => ({ board: ['AP']}))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'select-box'),
        showToast: jest.fn()
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockEvents: Partial<Events> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockRoterExtras = {
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
        getCurrentNavigation: jest.fn(() => mockRoterExtras as any),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockActivatedRoute: Partial<ActivatedRoute> = {};
    mockActivatedRoute.snapshot = {
        queryParams: {
            reOnBoard: {}
        }
    } as any;

    const mockProgressLoader: Partial<SbProgressLoader> = {};
    const mockTncUpdateHandler: Partial<TncUpdateHandlerService> = {};
    const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockActivePageService: Partial<ActivePageService> = {};
    const mockFb: Partial<FormBuilder> = {
        group: jest.fn(() => ({})) as any,
        control: jest.fn()
    };

    const mockProfileHandler: Partial<ProfileHandler> = {
        getSupportedProfileAttributes: jest.fn(() => Promise.resolve({ borad: 'board', medium: 'medium', gradeLevel: 'gradeLevel' }))
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        categoryEditPage = new CategoriesEditPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockSharedPreferences as SharedPreferences,
            mockCommonUtilService as CommonUtilService,
            mockFb as FormBuilder,
            mockTranslate as TranslateService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockContainer as ContainerService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockLocation as Location,
            mockPlatform as Platform,
            mockActivePageService as ActivePageService,
            mockExternalIdVerificationService as ExternalIdVerificationService,
            mockTncUpdateHandler as TncUpdateHandlerService,
            mockProgressLoader as SbProgressLoader,

            mockProfileHandler as ProfileHandler
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of CategoryEditPage', () => {
        expect(categoryEditPage).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should populate the supported attributes', (done) => {
            // arrange
            mockProfileHandler.getSupportedProfileAttributes = jest.fn(() => Promise.resolve(
                {
                    board: 'board',
                    medium: 'medium',
                    gradeLevel: 'gradeLevel'
                }));
            categoryEditPage['onSyllabusChange'] = jest.fn(() => of({} as any));
            categoryEditPage['onMediumChange'] = jest.fn(() => of({} as any));
            categoryEditPage['onGradeChange'] = jest.fn(() => of({} as any));
            mockSharedPreferences.getString = jest.fn(() => of('userType'));
            // act
            categoryEditPage.ngOnInit().then(() => {
                // assert
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
                expect(categoryEditPage.supportedProfileAttributes).toEqual({
                    board: 'board',
                    medium: 'medium',
                    gradeLevel: 'gradeLevel'
                });
                done();
            });
        });

    });
});
