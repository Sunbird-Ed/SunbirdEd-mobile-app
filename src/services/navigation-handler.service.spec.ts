import { NavigationService } from './navigation-handler.service';
import { RouterLinks } from '../app/app.constant';
import { Router } from '@angular/router';
import { CommonUtilService, TelemetryGeneratorService } from '../services';
import { Environment, InteractSubtype, InteractType, PageId } from './telemetry-constants';
import { mockProfileData } from '../app/profile/profile.page.spec.data';

describe('NavigationService', () => {
  let navigationService: NavigationService;

  const mockRouter: Partial<Router> = {
    navigate: jest.fn()
  };

  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {};

  beforeAll(() => {
    navigationService = new NavigationService(
      mockRouter as Router,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockCommonUtilService as CommonUtilService,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of NavigationService', () => {
    expect(navigationService).toBeTruthy();
  });

  describe('navigateToDetailPage', () => {

    it('should navigate to enrolled course detail page', () => {
      // arrange
      const content = {
        trackable: {
          enabled: 'Yes'
        },
        primaryCategory: 'Course'
      };
      // act
      navigationService.navigateToDetailPage(content, {});
      // assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.ENROLLED_COURSE_DETAILS], {
        state: {}
      });
    });

    it('should navigate to collection detail page', () => {
      // arrange
      const content = {
        trackable: {
          enabled: 'No'
        },
        primaryCategory: 'Course',
        mimeType: 'application/vnd.ekstep.content-collection'
      };
      // act
      navigationService.navigateToDetailPage(content, {});
      // assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.COLLECTION_DETAIL_ETB], {
        state: {}
      });
    });

    it('should navigate to content detail page', () => {
      // arrange
      const content = {
        contentData: {
          trackable: {
            enabled: 'No'
          },
          primaryCategory: 'Resource',
          mimeType: 'application/pdf'
        }
      };
      // act
      navigationService.navigateToDetailPage(content, {});
      // assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.CONTENT_DETAILS], {
        state: {}
      });
    });

    it('should navigate to enrolled course detail page if trackable object is not available', () => {
      // arrange
      const content = {
        content: {
          contentType: 'Course'
        }
      };
      // act
      navigationService.navigateToDetailPage(content, {});
      // assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.ENROLLED_COURSE_DETAILS], {
        state: {}
      });
    });

    it('should navigate to collection detail page if trackable object is not available', () => {
      // arrange
      const content = {
        content: {
          contentType: 'Collection'
        },
        contentType: 'Collection',
        mimeType: 'application/vnd.ekstep.content-collection'
      };
      // act
      navigationService.navigateToDetailPage(content, {});
      // assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.COLLECTION_DETAIL_ETB], {
        state: {}
      });
    });

    it('should navigate to content detail page if trackable object is not available', () => {
      // arrange
      const content = {
        content: {
          contentType: 'Resource'
        },
        contentType: 'Resource'
      };
      // act
      navigationService.navigateToDetailPage(content, {});
      // assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.CONTENT_DETAILS], {
        state: {}
      });
    });

    it('should navigate directly to content detail page if trackable object is not available', (done) => {
      // arrange
      // act
      navigationService.navigateTo([RouterLinks.CONTENT_DETAILS], {});
      // assert
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.CONTENT_DETAILS], {
          state: {}
        });
        done();
      }, 0);
    });
  });

  describe('navigateToEditPersonalDetails  test-suites', () => {
    it('should generate telemetry and navigate to district mapping if network is available', () => {
        // arrange
        mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockRouter.navigate = jest.fn();
        // act
        navigationService.navigateToEditPersonalDetails(mockProfileData, 'some-page-id');
        // assert
        expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.EDIT_CLICKED,
            Environment.HOME,
            'some-page-id', null
        );
        expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.DISTRICT_MAPPING],
            {
                state: {
                    profile: mockProfileData,
                    isShowBackButton: true,
                    source: 'some-page-id'
                }
            });
    });

    it('should call showToast when network is not available', () => {
        // arrange
        mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
        mockCommonUtilService.showToast = jest.fn();
        // act
        navigationService.navigateToEditPersonalDetails(undefined, 'some-page-id');
        // assert
        expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NEED_INTERNET_TO_CHANGE');
    });
  });

});
