import {CategoryListPage} from './category-list-page';
import {CommonUtilService} from '../../services/common-util.service';
import {Router} from '@angular/router';
import {AppHeaderService} from '../../services/app-header.service';
import {of} from 'rxjs';
import {NavigationService} from '../../services/navigation-handler.service';
import {ContentService, CourseService, FormService, ProfileService} from '@project-sunbird/sunbird-sdk';
import {ScrollToService} from '../../services/scroll-to.service';
import {FormAndFrameworkUtilService, TelemetryGeneratorService} from '../../services';

describe('CategoryListPage', () => {
    let categoryListPage: CategoryListPage;
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn()
    };
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({profileType: 'Student'} as any))
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockRouterExtras = {
        extras: {
            state: undefined
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRouterExtras),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockNavService: Partial<NavigationService> = {
        navigateToTrackableCollection: jest.fn(),
        navigateToCollection: jest.fn(),
        navigateToContent: jest.fn()
    };
    const mockContentService: Partial<ContentService> = {};
    const mockFormService: Partial<FormService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const moockScrollToService: Partial<ScrollToService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};

    beforeAll(() => {
        categoryListPage = new CategoryListPage(
            mockContentService as ContentService,
            mockFormService as FormService,
            mockCourseService as CourseService,
            mockProfileService as ProfileService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockHeaderService as AppHeaderService,
            mockNavService as NavigationService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            moockScrollToService as ScrollToService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService
        );
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should be create an instance of CategoryListPage', () => {
        expect(categoryListPage).toBeTruthy();
    });
});
