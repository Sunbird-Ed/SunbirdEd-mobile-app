import { ViewMoreCardComponent } from './view-more-card.component';
import { Events, PopoverController } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { CourseUtilService, CommonUtilService, TelemetryGeneratorService, AppGlobalService } from '../../../services';
import { Router } from '@angular/router';
import { CourseService, SharedPreferences } from 'sunbird-sdk';
import { of, throwError } from 'rxjs';
import { mockEnrolledCourses } from '../../enrolled-course-details-page/enrolled-course-details-page.spec.data';
import { RouterLinks } from '../../app.constant';
describe('ViewMoreCardComponent', () => {
    let viewMoreCardComponent: ViewMoreCardComponent;

    const mockCourseService: Partial<CourseService> = {
        getCourseBatches: jest.fn(() => of([])),
        getEnrolledCourses: jest.fn(() => of(mockEnrolledCourses)),
        getContentState: jest.fn(() => of([]))
    };

    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('sample_lastreadcontent_id'))
    };

    const mockZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };
    const mockCourseUtilService: Partial<CourseUtilService> = {
        getCourseProgress: jest.fn(() => 100)
    };

    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };

    const presentFn = jest.fn(() => Promise.resolve());
    const dismissFn = jest.fn(() => Promise.resolve());
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(),
        convertFileSrc: jest.fn(),
        getLoader : jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        })) as any
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    const mockAppGlobalService: Partial<AppGlobalService> = {
        setEnrolledCourseList: jest.fn()
    };

    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };

    const mockPopOverController: Partial<PopoverController> = {
    };

    const mockContent = {
        leafNodesCount: 10,
        progress: 100
    } as any;


    beforeAll(() => {
        viewMoreCardComponent = new ViewMoreCardComponent(
            mockCourseService as CourseService,
            mockSharedPreferences as SharedPreferences,
            mockZone as NgZone,
            mockCourseUtilService as CourseUtilService,
            mockEvents as Events,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockRouter as Router,
            mockPopOverController as PopoverController
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of ViewMoreCardComponent', () => {
        expect(viewMoreCardComponent).toBeTruthy();
    });

    describe('ngOninit', () => {

        it('should initialize batchExpStatus to true on ngOnint', () => {
            // arrange
            mockContent['batch'] = {
                status: 2
            };
            viewMoreCardComponent.content = mockContent;
            // act
            viewMoreCardComponent.ngOnInit();
            // assert
            expect(viewMoreCardComponent.batchExp).toBeTruthy();
        });

        it('should initialize batchExpStatus to false on ngOnint', () => {
            // arrange
            mockContent['batch'] = {
                status: 1
            };
            viewMoreCardComponent.content = mockContent;
            // act
            viewMoreCardComponent.ngOnInit();
            // assert
            expect(viewMoreCardComponent.batchExp).toBeFalsy();
        });

        it('should populate the course progress if type is enrolledCourse', () => {
            // arrange
            viewMoreCardComponent.type = 'enrolledCourse';
            mockContent['batch'] = {
                status: 1
            };
            viewMoreCardComponent.content = mockContent;
            // act
            viewMoreCardComponent.ngOnInit();
            // assert
            expect(viewMoreCardComponent.content.cProgress).toBe(100);
        });
    });

    describe('getEnrolledCourses', () => {
        it('should store the courses in app in memory cache', (done) => {
            // arrange
            // act
            viewMoreCardComponent.getEnrolledCourses(true, true);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.setEnrolledCourseList).toHaveBeenCalledWith(mockEnrolledCourses);
                expect(viewMoreCardComponent.showLoader).toBeFalsy();
                done();
            }, 0);
        });

        it('should dismiss the popup if getEnrolledCourses API failed', (done) => {
            // arrange
            mockCourseService.getEnrolledCourses = jest.fn(() => throwError({}));
            // act
            viewMoreCardComponent.getEnrolledCourses(true, true);
            // assert
            setTimeout(() => {
                expect(viewMoreCardComponent.showLoader).toBeFalsy();
                done();
            }, 0);
        });

        it('shouldn\'t store the courses in app in memory cache if getEnrolledCourses is being called without any params', (done) => {
            // arrange
            mockCourseService.getEnrolledCourses = jest.fn(() => of([]));
            // act
            viewMoreCardComponent.getEnrolledCourses();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.setEnrolledCourseList).not.toHaveBeenCalledWith([]);
                expect(viewMoreCardComponent.showLoader).toBeFalsy();
                done();
            }, 0);
        });

        it('shouldn\'t store the courses in app in memory cache if getEnrolledCourses returns undefined', (done) => {
            // arrange
            mockCourseService.getEnrolledCourses = jest.fn(() => of(undefined));
            // act
            viewMoreCardComponent.getEnrolledCourses();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.setEnrolledCourseList).not.toHaveBeenCalledWith([]);
                expect(viewMoreCardComponent.showLoader).toBeFalsy();
                done();
            }, 0);
        });
    });

    describe('resumeCourse', () => {

        beforeEach(() => {
            mockContent['contentId'] = 'do_12345';
            mockContent['userId'] = '0123456789';
            mockContent['batchId'] = 'sample_batch_id';
        });

        it('should invoke getContentState API', (done) => {
            // arrange
            // act
            viewMoreCardComponent.resumeCourse(mockContent);
            // assert
            setTimeout(() => {
                expect(mockCourseService.getContentState).toHaveBeenCalledWith({
                    userId: '0123456789',
                    courseIds: ['do_12345'],
                    returnRefreshedContentStates: true,
                    batchId: 'sample_batch_id'
                });
                done();
            }, 0);
        });

        it('should publish course resume event if lastread contentid is available', (done) => {
            // arrange
            // act
            viewMoreCardComponent.resumeCourse(mockContent);
            // assert
            setTimeout(() => {
                expect(mockEvents.publish).toHaveBeenCalledWith('course:resume', { content: mockContent });
                done();
            }, 0);
        });

        it('should navigate to EnrolledCourseDetails page course resume event if lastread contentid is n\'t available', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn(() => of(undefined));
            // act
            viewMoreCardComponent.resumeCourse(mockContent);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.ENROLLED_COURSE_DETAILS],
                    { state: { content: mockContent } });
                done();
            }, 0);
        });

        it('should navigate to EnrolledCourseDetails page course resume event if lastread contentid is n\'t available', (done) => {
            // arrange
            mockContent['contentId'] = undefined;
            mockContent['identifier'] = 'do_12345';
            // act
            viewMoreCardComponent.resumeCourse(mockContent);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.ENROLLED_COURSE_DETAILS],
                    { state: { content: mockContent } });
                done();
            }, 0);
        });
    });

    describe('navigateToDetailsPage', () => {
        it('should navigate to EnrolledCoursedDetails page  if contentType is course', () => {
            // arrange
            mockContent['contentType'] = 'Course';
            // act
            viewMoreCardComponent.navigateToDetailsPage(mockContent, 'enrolledCourse');
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.ENROLLED_COURSE_DETAILS], {
                state: { content: mockContent }
            });
        });

        it('should navigate to CollectionDetails page  if mimetype is collection', () => {
            // arrange
            mockContent['contentType'] = 'TextBook';
            mockContent['mimeType'] = 'application/vnd.ekstep.content-collection';
            // act
            viewMoreCardComponent.navigateToDetailsPage(mockContent, 'viewmorecard');
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.COLLECTION_DETAIL_ETB], {
                state: { content: mockContent }
            });
        });

        it('should navigate to ContentDetails page  for anything else', () => {
            // arrange
            mockContent['contentType'] = 'Resource';
            mockContent['mimeType'] = 'video/webm';
            // act
            viewMoreCardComponent.navigateToDetailsPage(mockContent, 'viewmorecard');
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.CONTENT_DETAILS], {
                state: { content: mockContent }
            });
        });
    });


    describe('navigateToBatchListPopup', () => {
        const mockBatchListResponse = [{
            identifier: 'sample_batch_id_1',
            name: 'sample_batch_1',
            status: 1
        },
        {
            identifier: 'sample_batch_id_2',
            name: 'sample_batch_2',
            status: 2
        }];
        beforeEach(() => {
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({}))
            } as any)));
        });

        it('should show Network Error toast if internet is not available', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            mockCourseService.getCourseBatches = jest.fn(() => of(mockBatchListResponse));
            // act
            viewMoreCardComponent.navigateToBatchListPopup(mockContent, 'viewmorecard', false);
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
        });

        it('should show Ongoing Batch popup if batch list is not empty ', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockCourseService.getCourseBatches = jest.fn(() => of(mockBatchListResponse));
            // act
            viewMoreCardComponent.navigateToBatchListPopup(mockContent, 'viewmorecard', false);
            // assert
            setTimeout(()  => {
                expect(mockPopOverController.create).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not show Ongoing Batch popup incase of CourseBatch API failure', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockCourseService.getCourseBatches = jest.fn(() => throwError({}));
            // act
            viewMoreCardComponent.navigateToBatchListPopup(mockContent, 'viewmorecard', false);
            // assert
            setTimeout(()  => {
                expect(mockPopOverController.create).not.toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should navigate to deatils page if batch list is empty ', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockCourseService.getCourseBatches = jest.fn(() => of([]));
            jest.spyOn(viewMoreCardComponent, 'navigateToDetailsPage');
            // act
            viewMoreCardComponent.navigateToBatchListPopup(mockContent, 'viewmorecard', false);
            // assert
            setTimeout(()  => {
                expect(viewMoreCardComponent.navigateToDetailsPage).toHaveBeenCalledWith(mockContent, 'viewmorecard');
                done();
            }, 0);
        });

        it('should invoke getEnrolled courses if enroll is clicked ', (done) => {
            // arrange
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { isEnrolled: true } }))
            } as any)));
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockCourseService.getCourseBatches = jest.fn(() => of(mockBatchListResponse));
            jest.spyOn(viewMoreCardComponent, 'getEnrolledCourses');
            // act
            viewMoreCardComponent.navigateToBatchListPopup(mockContent, 'viewmorecard', false);
            // assert
            setTimeout(()  => {
                expect(mockPopOverController.create).toHaveBeenCalled();
                expect(viewMoreCardComponent.getEnrolledCourses).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should navigate to CourseBatches for guest user', () => {
            // arrange
            viewMoreCardComponent.guestUser = true;
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockCourseService.getCourseBatches = jest.fn(() => of(mockBatchListResponse));
            // act
            viewMoreCardComponent.navigateToBatchListPopup(mockContent, 'viewmorecard', false);
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.COURSE_BATCHES]);
        });

        it('should navigate to CourseBatches for guest user if Layout name is in progress', () => {
            // arrange
            mockContent['contentId'] = '';
            mockContent['identifier'] = 'do_12345';
            viewMoreCardComponent.guestUser = true;
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockCourseService.getCourseBatches = jest.fn(() => of(mockBatchListResponse));
            // act
            viewMoreCardComponent.navigateToBatchListPopup(mockContent, 'InProgress', false);
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.COURSE_BATCHES]);
        });
    });

    describe('checkRetiredOpenBatch', () => {
        it('should navigate to details page if there are no retired batches', (done) => {
            // arrange
            viewMoreCardComponent.enrolledCourses = undefined;
            jest.spyOn(viewMoreCardComponent, 'navigateToDetailsPage');
            // act
            viewMoreCardComponent.checkRetiredOpenBatch(mockContent, 'InProgress');
            // assert
            setTimeout(() => {
                expect(viewMoreCardComponent.navigateToDetailsPage).toHaveBeenCalledWith(mockContent, 'InProgress');
                done();
            }, 0);
        });

        it('should navigate to details page if there are any open batches', (done) => {
            // arrange
            viewMoreCardComponent.enrolledCourses = mockEnrolledCourses;
            mockContent['identifier'] = 'do_2127509908237926401406';
            mockEnrolledCourses[0]['batch']['status'] = 1;
            mockEnrolledCourses[0]['cProgress'] = 20;
            jest.spyOn(viewMoreCardComponent, 'navigateToDetailsPage');
            // act
            viewMoreCardComponent.checkRetiredOpenBatch(mockContent, 'ViewMoreSection');
            // assert
            setTimeout(() => {
                expect(viewMoreCardComponent.navigateToDetailsPage).toHaveBeenCalledWith(mockContent, 'ViewMoreSection');
                done();
            }, 0);
        });

        it('should show batch list popup if batch is retired', (done) => {
            // arrange
            viewMoreCardComponent.enrolledCourses = mockEnrolledCourses;
            mockContent['identifier'] = 'do_2127509908237926401406';
            mockEnrolledCourses[0]['batch']['status'] = 2;
            mockEnrolledCourses[0]['cProgress'] = 20;
            jest.spyOn(viewMoreCardComponent, 'navigateToBatchListPopup');
            // act
            viewMoreCardComponent.checkRetiredOpenBatch(mockContent, 'ViewMoreSection');
            // assert
            setTimeout(() => {
                expect(viewMoreCardComponent.navigateToBatchListPopup).toHaveBeenCalled();
                done();
            }, 0);
        });

    });

});
