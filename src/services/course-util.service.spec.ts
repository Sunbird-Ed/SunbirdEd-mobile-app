import { CourseUtilService  } from './course-util.service';
import { Platform, PopoverController } from '@ionic/angular';

describe('courseUtilService', () => {
  let courseUtilService: CourseUtilService;
  const mockPopoverController: Partial<PopoverController> = {};
  const mockPlatform: Partial<Platform> = {};

  beforeAll(() => {
    courseUtilService = new CourseUtilService(
        mockPopoverController as PopoverController,
        mockPlatform as Platform
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of courseUtilService', () => {
    expect(courseUtilService).toBeTruthy();
  });

  describe('showCredits', () => {
      it('should show credits', () => {
          //arrange
          mockPopoverController.create = jest.fn(() => {
            return Promise.resolve({
                present: jest.fn(() => Promise.resolve({}))
            });
        }) as any;
        const content = 'content', 
        pageId = 'pageId',
        rollUp = 'rollUp',
        correlation = 'correlation';
          //act
          courseUtilService.showCredits(content, pageId, rollUp, correlation);
  });
});
describe('getCourseProgress', () => {
    it('should return course progress as 100', () => {
      // arrange
        const leafNodeCount=  0,
        progress=  0
        // act
        const output = courseUtilService.getCourseProgress(leafNodeCount, progress);
        // assert
        expect(output).toEqual(0);
    });
    it('should return course progress as zero', () => {
      // arrange
        const leafNodeCount=  2,
        progress = 10
        // act
        const output = courseUtilService.getCourseProgress(leafNodeCount, progress);
        // assert
        expect(output).toEqual(100);
    });
    it('should return course progress as zero if not a number', () => {
      // arrange
        const leafNodeCount=  'count',
        progress = 10
        // act
        const output = courseUtilService.getCourseProgress(leafNodeCount, progress);
        // assert
        expect(output).toEqual(0);
    });
    it('should return course progress as zero', () => {
      // arrange
      const leafNodeCount=  2,
      progress = 0.001
      // act
      const output = courseUtilService.getCourseProgress(leafNodeCount, progress);
      // assert
      expect(String(output)).toBeTruthy();
  });
  });

describe('getImportContentRequestBody', () => {
  it('should check array', () => {
      // arrange
      const identifiers = ['do-123', 'do-234'];
      const isChild = true;
      mockPlatform.is = jest.fn(() => true);
      // act
      courseUtilService.getImportContentRequestBody(identifiers, isChild);
      // assert
      expect(mockPlatform.is).toHaveBeenCalled();
  });
});

  describe('getImportContentRequestBody()', () => {
    it('should get import content body by invoked getImportContentRequestBody()', () => {
        // arrange
        const identifiers = ['do_101', 'do_102', 'do_103'];
        // act
        courseUtilService.getImportContentRequestBody(identifiers, true);
        // asert
        expect(identifiers.length).toBeGreaterThan(0);
    });
});
});