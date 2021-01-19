import {
    CourseService, FormService, ProfileService, ContentService, ContentAggregatorRequest,
    ContentSearchCriteria, FormRequest
} from '@project-sunbird/sunbird-sdk';
import { of, throwError } from 'rxjs';
import { AppGlobalService } from '../app-global-service.service';
import { CommonUtilService } from '../common-util.service';
import { ContentAggregatorHandler } from './content-aggregator-handler.service';
import { AggregatorPageType } from './content-aggregator-namespaces';

describe('ContentAggregatorHandler', () => {
    let contentAggregatorHandler: ContentAggregatorHandler;
    const mockappGlobalService: Partial<AppGlobalService> = {};
    const mockcommonUtilService: Partial<CommonUtilService> = {};
    const mockcontentService: Partial<ContentService> = {};
    const mockcourseService: Partial<CourseService> = {};
    const mockformService: Partial<FormService> = {};
    const mockprofileService: Partial<ProfileService> = {};

    beforeAll(() => {
        contentAggregatorHandler = new ContentAggregatorHandler(
            mockcourseService as CourseService,
            mockformService as FormService,
            mockprofileService as ProfileService,
            mockcontentService as ContentService,
            mockcommonUtilService as CommonUtilService,
            mockappGlobalService as AppGlobalService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create a instane of contentAggregatorHandler', () => {
        expect(contentAggregatorHandler).toBeTruthy();
    });

    it('should return my course for loggedIn user', (done) => {
        // arrange
        const request: ContentAggregatorRequest = {
            applyFirstAvailableCombination: {
            },
            interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => {
                return contentSearchCriteria;
            }
        };
        const pageName = AggregatorPageType.COURSE;
        const dataSrc = ['CONTENTS', 'TRACKABLE_COURSE_CONTENTS'];
        const formRequest: FormRequest = {
            type: 'config',
            subType: AggregatorPageType.COURSE,
            action: 'get',
            component: 'app',
        };
        mockappGlobalService.isUserLoggedIn = jest.fn(() => true);
        const data = jest.fn(() => of({
            result: [{
                orientation: 'horizontal',
                title: JSON.stringify({ en: 'sample-enrolled-course' }),
                section: {
                    sections: [{
                        contents: [{
                            appIcon: 'sample-icon',
                            name: 'sample-name'
                        }]
                    }]
                }
            }, {
                orientation: 'vertical',
                title: JSON.stringify({ en: 'sample-course' }),
                section: {
                    sections: [{
                        contents: {
                            appIcon: 'sample-icon',
                            name: 'sample-name'
                        }
                    }]
                }
            }]
        }));
        mockcontentService.buildContentAggregator = jest.fn(() => ({
            aggregate: data
        })) as any;
        mockcommonUtilService.getTranslatedValue = jest.fn(() => 'sample-course');
        mockcommonUtilService.getContentImg = jest.fn(() => 'sample-image');
        // act
        contentAggregatorHandler.aggregate(request, pageName);
        // assert
        setTimeout(() => {
            expect(mockappGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockcontentService.buildContentAggregator).toHaveBeenCalledWith(mockformService, mockcourseService, mockprofileService);
            expect(mockcommonUtilService.getTranslatedValue).toHaveBeenNthCalledWith(1,
                JSON.stringify({ en: 'sample-enrolled-course' }), 'sample-enrolled-course');
            expect(mockcommonUtilService.getTranslatedValue).toHaveBeenNthCalledWith(2,
                JSON.stringify({ en: 'sample-course' }), 'sample-course');
            expect(data).toHaveBeenCalled();
            expect(mockcommonUtilService.getContentImg).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should return only vertical section for guest user', (done) => {
        // arrange
        const request: ContentAggregatorRequest = {
            applyFirstAvailableCombination: {
            },
            interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => {
                return contentSearchCriteria;
            }
        };
        const pageName = AggregatorPageType.COURSE;
        const dataSrc = ['CONTENTS'];
        const formRequest: FormRequest = {
            type: 'config',
            subType: AggregatorPageType.COURSE,
            action: 'get',
            component: 'app',
        };
        mockappGlobalService.isUserLoggedIn = jest.fn(() => false);
        const data = jest.fn(() => of({
            result: [{
                orientation: 'vertical',
                title: JSON.stringify({ en: 'sample-course' }),
                section: {
                    sections: [{
                        contents: [{
                            appIcon: 'sample-icon',
                            name: 'sample-name'
                        }]
                    }]
                }
            }]
        }));
        mockcontentService.buildContentAggregator = jest.fn(() => ({
            aggregate: data
        })) as any;
        mockcommonUtilService.getTranslatedValue = jest.fn(() => 'sample-course');
        mockcommonUtilService.getContentImg = jest.fn(() => 'sample-image');
        // act
        contentAggregatorHandler.aggregate(request, pageName);
        // assert
        setTimeout(() => {
            expect(mockappGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockcontentService.buildContentAggregator).toHaveBeenCalledWith(mockformService, mockcourseService, mockprofileService);
            expect(mockcommonUtilService.getTranslatedValue).toHaveBeenNthCalledWith(1,
                JSON.stringify({ en: 'sample-course' }), 'sample-course');
            expect(data).toHaveBeenCalled();
            expect(mockcommonUtilService.getContentImg).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should return my Learning section for loggedIn user', (done) => {
        // arrange
        const request: ContentAggregatorRequest = {
            applyFirstAvailableCombination: {
            },
            interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => {
                return contentSearchCriteria;
            }
        };
        const pageName = AggregatorPageType.LIBRARY;
        const dataSrc = ['CONTENTS', 'TRACKABLE_CONTENTS'];
        const formRequest: FormRequest = {
            type: 'config',
            subType: AggregatorPageType.LIBRARY,
            action: 'get',
            component: 'app',
        };
        mockappGlobalService.isUserLoggedIn = jest.fn(() => true);
        const data = jest.fn(() => of({
            result: [{
                orientation: 'horizontal',
                title: JSON.stringify({ en: 'sample-learning-course' }),
                section: {
                    sections: [{
                        contents: [{
                            appIcon: 'sample-icon',
                            name: 'sample-name'
                        }]
                    }]
                }
            }, {
                orientation: 'vertical',
                title: JSON.stringify({ en: 'sample-textbook' }),
                section: {
                    sections: [{
                        contents: {
                            appIcon: 'sample-icon',
                            name: 'sample-name'
                        }
                    }]
                }
            }]
        }));
        mockcontentService.buildContentAggregator = jest.fn(() => ({
            aggregate: data
        })) as any;
        mockcommonUtilService.getTranslatedValue = jest.fn(() => 'sample-course');
        mockcommonUtilService.getContentImg = jest.fn(() => 'sample-image');
        // act
        contentAggregatorHandler.aggregate(request, pageName);
        // assert
        setTimeout(() => {
            expect(mockappGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockcontentService.buildContentAggregator).toHaveBeenCalledWith(mockformService, mockcourseService, mockprofileService);
            expect(mockcommonUtilService.getTranslatedValue).toHaveBeenNthCalledWith(1,
                JSON.stringify({ en: 'sample-learning-course' }), 'sample-learning-course');
            expect(mockcommonUtilService.getTranslatedValue).toHaveBeenNthCalledWith(2,
                JSON.stringify({ en: 'sample-textbook' }), 'sample-textbook');
            expect(data).toHaveBeenCalled();
            expect(mockcommonUtilService.getContentImg).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should not return my Learning section for guest user', (done) => {
        // arrange
        const request: ContentAggregatorRequest = {
            applyFirstAvailableCombination: {
            },
            interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => {
                return contentSearchCriteria;
            }
        };
        const pageName = AggregatorPageType.LIBRARY;
        const dataSrc = ['CONTENTS'];
        const formRequest: FormRequest = {
            type: 'config',
            subType: AggregatorPageType.LIBRARY,
            action: 'get',
            component: 'app',
        };
        mockappGlobalService.isUserLoggedIn = jest.fn(() => false);
        const data = jest.fn(() => of({
            result: [{
                orientation: 'horizontal',
                title: JSON.stringify({ en: 'sample-learning-course' }),
                section: {
                    sections: [{
                        contents: [{
                            appIcon: 'sample-icon',
                            name: 'sample-name'
                        }]
                    }]
                }
            }, {
                orientation: 'vertical',
                title: JSON.stringify({ en: 'sample-textbook' }),
                section: {
                    sections: [{
                        contents: {
                            appIcon: 'sample-icon',
                            name: 'sample-name'
                        }
                    }]
                }
            }]
        }));
        mockcontentService.buildContentAggregator = jest.fn(() => ({
            aggregate: data
        })) as any;
        mockcommonUtilService.getTranslatedValue = jest.fn(() => 'sample-course');
        mockcommonUtilService.getContentImg = jest.fn(() => 'sample-image');
        // act
        contentAggregatorHandler.aggregate(request, pageName);
        // assert
        setTimeout(() => {
            expect(mockappGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockcontentService.buildContentAggregator).toHaveBeenCalledWith(mockformService, mockcourseService, mockprofileService);
            expect(mockcommonUtilService.getTranslatedValue).toHaveBeenNthCalledWith(1,
                JSON.stringify({ en: 'sample-learning-course' }), 'sample-learning-course');
            expect(mockcommonUtilService.getTranslatedValue).toHaveBeenNthCalledWith(2,
                JSON.stringify({ en: 'sample-textbook' }), 'sample-textbook');
            expect(data).toHaveBeenCalled();
            expect(mockcommonUtilService.getContentImg).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should return null if orientation is undefined', (done) => {
        // arrange
        const request: ContentAggregatorRequest = {
            applyFirstAvailableCombination: {
            },
            interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => {
                return contentSearchCriteria;
            }
        };
        const pageName = AggregatorPageType.LIBRARY;
        const dataSrc = ['CONTENTS'];
        const formRequest: FormRequest = {
            type: 'config',
            subType: AggregatorPageType.LIBRARY,
            action: 'get',
            component: 'app',
        };
        mockappGlobalService.isUserLoggedIn = jest.fn(() => false);
        const data = jest.fn(() => of({
            result: [{
                orientation: undefined,
                title: JSON.stringify({ en: 'sample-textbook' }),
                section: {
                    sections: [{
                        contents: {
                            appIcon: 'sample-icon',
                            name: 'sample-name'
                        }
                    }]
                }
            }]
        }));
        mockcontentService.buildContentAggregator = jest.fn(() => ({
            aggregate: data
        })) as any;
        // act
        contentAggregatorHandler.aggregate(request, pageName);
        // assert
        setTimeout(() => {
            expect(mockappGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockcontentService.buildContentAggregator).toHaveBeenCalledWith(mockformService, mockcourseService, mockprofileService);
            expect(data).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should return nill if list is empty', (done) => {
        // arrange
        const request: ContentAggregatorRequest = {
            applyFirstAvailableCombination: {
            },
            interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => {
                return contentSearchCriteria;
            }
        };
        const pageName = AggregatorPageType.LIBRARY;
        const dataSrc = ['CONTENTS'];
        const formRequest: FormRequest = {
            type: 'config',
            subType: AggregatorPageType.LIBRARY,
            action: 'get',
            component: 'app',
        };
        mockappGlobalService.isUserLoggedIn = jest.fn(() => false);
        const data = jest.fn(() => of({}));
        mockcontentService.buildContentAggregator = jest.fn(() => ({
            aggregate: data
        })) as any;
        // act
        contentAggregatorHandler.aggregate(request, pageName);
        // assert
        setTimeout(() => {
            expect(mockappGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockcontentService.buildContentAggregator).toHaveBeenCalledWith(mockformService, mockcourseService, mockprofileService);
            expect(data).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should return error for cath part', (done) => {
        // arrange
        const request: ContentAggregatorRequest = {
            applyFirstAvailableCombination: {
            },
            interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => {
                return contentSearchCriteria;
            }
        };
        const pageName = AggregatorPageType.LIBRARY;
        const dataSrc = ['CONTENTS'];
        const formRequest: FormRequest = {
            type: 'config',
            subType: AggregatorPageType.LIBRARY,
            action: 'get',
            component: 'app',
        };
        mockappGlobalService.isUserLoggedIn = jest.fn(() => false);
        const data = jest.fn(() => throwError({
            result: []
        }));
        mockcontentService.buildContentAggregator = jest.fn(() => ({
            aggregate: data
        })) as any;
        // act
        contentAggregatorHandler.aggregate(request, pageName).catch(() => {
            expect(mockappGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockcontentService.buildContentAggregator).toHaveBeenCalledWith(mockformService, mockcourseService, mockprofileService);
            expect(data).toHaveBeenCalled();
            done();
        });
    });
});
