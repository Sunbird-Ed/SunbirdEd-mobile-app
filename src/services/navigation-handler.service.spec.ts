import { NavigationService } from './navigation-handler.service';
import { RouterLinks, MimeType } from '@app/app/app.constant';
import { Router } from '@angular/router';

describe('NavigationService', () => {
  let navigationService: NavigationService;

  const mockRouter: Partial<Router> = {
    navigate: jest.fn()
  };

  beforeAll(() => {
    navigationService = new NavigationService(
      mockRouter as Router
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
        contentType: 'Course'
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
        contentData: {
          trackable: {
          },
          contentType: 'Resource',
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

    it('should navigate to content detail page if trackable object is not available', () => {
      // arrange
      // act
      navigationService.navigateTo([RouterLinks.CONTENT_DETAILS], {});
      // assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.CONTENT_DETAILS], {
        state: {}
      });
    });
  });

});
