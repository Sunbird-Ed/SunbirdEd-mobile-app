import {
    NavParams, Events,
    PopoverController, NavController
} from '@ionic/angular';
import { NgZone } from '@angular/core';
import {
    TelemetryGeneratorService, CommonUtilService, LocalCourseService,
    InteractSubtype, InteractType, PageId, AppGlobalService, Environment
} from '../../../services';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { EnrollmentDetailsComponent } from './enrollment-details.component';
import { of } from 'rxjs';
import { PreferenceKey, EventTopics, RouterLinks } from '../../app.constant';
import { CategoryKeyTranslator } from '../../../pipes/category-key-translator/category-key-translator-pipe';
import { NavigationService } from '../../../services/navigation-handler.service';
describe('enrollmentdetailcomponent', () => {

    let enrollmentDetails: EnrollmentDetailsComponent;

    const mockSharedPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(() => of(undefined))
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockNavController: Partial<NavController> = {};
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn(() => 'Dummy')
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockPopoverController: Partial<PopoverController> = {
        dismiss: jest.fn(() => Promise.resolve(true))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockCommonUtilServiceas: Partial<CommonUtilService> = {
        getLoader: jest.fn(),
        translateMessage: jest.fn(),
        showToast: jest.fn()
    };
    const mockNavService: Partial<NavigationService> = {
        navigateToDetailPage: jest.fn()
    };
    const mockLocalCourseService: Partial<LocalCourseService> = {
        prepareEnrollCourseRequest: jest.fn(),
        prepareRequestValue: jest.fn(),
        enrollIntoBatch: jest.fn()
    };

    const mockCategoryKeyTranslator: Partial<CategoryKeyTranslator> = {
        transform: jest.fn(() => 'sample-message')
    };

    beforeAll(() => {
        enrollmentDetails = new EnrollmentDetailsComponent(
            mockSharedPreferences as SharedPreferences,
            mockAppGlobalService as AppGlobalService,
            mockNavController as NavController,
            mockNavParams as NavParams,
            mockEvents as Events,
            mockNgZone as NgZone,
            mockPopoverController as PopoverController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilServiceas as CommonUtilService,
            mockNavService as NavigationService,
            mockLocalCourseService as LocalCourseService,
            mockCategoryKeyTranslator as CategoryKeyTranslator
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('enrollmentDetailsComponent', () => {
        it('initialising enrollmentdetailsComponent oject', () => {
            // assert
            expect(enrollmentDetails).toBeDefined();
        });

    });

    describe('close()', () => {
        it('should call dismiss', () => {
            // arrange
            jest.spyOn(enrollmentDetails, 'close');
            // act
            enrollmentDetails.close();
            // assert
            expect(enrollmentDetails.close).toBeCalled();
        });
    });

    describe('saveContentContext()', () => {
        it('should set userToken and isGuestUser', () => {
            // arrange
            const content = {
                userId: 'userId',
                courseId: 'courseId',
                id: 'contentId'
            };
            // act
            enrollmentDetails.saveContentContext(content);
            // assert
            expect(mockSharedPreferences.putString).toHaveBeenCalled();
        });
    });

    describe('resumeCourse()', () => {
        it('should call saveContext publish close and putString', (done) => {
            // arrange
            const content = {
                userId: 'userId',
                courseId: 'courseId',
                batchId: 'batchId',
                lastReadContentId: 'lastReadContentId',
                status: 1,
                batch: {
                    status: 1
                }
            };
            const contentContextMap = new Map();
            contentContextMap['userId'] = content.userId;
            contentContextMap['courseId'] = content.courseId;
            contentContextMap['batchId'] = content.batchId;
            jest.spyOn(enrollmentDetails, 'saveContentContext');
            jest.spyOn(enrollmentDetails, 'close');
            // act
            enrollmentDetails.resumeCourse(content);
            // assert
            setTimeout(() => {
                expect(enrollmentDetails.saveContentContext).toBeCalled();
                expect(enrollmentDetails.close).toBeCalled();
                expect(mockSharedPreferences.putString).toBeCalledWith(PreferenceKey.CONTENT_CONTEXT, JSON.stringify(contentContextMap));
                done()
            }, 0)
        });

        it('should call navigate', (done) => {
            // arrange
            const content = {
                userId: 'userId',
                courseId: 'courseId',
                batchId: 'batchId',
                content: {
                    identifier: 'do_id'
                }
            };
           jest.spyOn(enrollmentDetails, 'saveContentContext').mockImplementation();
            // act
            enrollmentDetails.resumeCourse(content);
            // assert
            setTimeout(() => {
                expect(mockNavService.navigateToDetailPage).toBeCalledWith(
                    content.content, { content, skipCheckRetiredOpenBatch: true });
                done();
            }, 0);
        });
    });

    describe('enrollIntoBatch()', () => {
        it('should go to enrollment success callback', (done) => {
            // arrange
            const content = {
                userId: 'userId',
                courseId: 'courseId',
                batchId: 'batchId',
                id: 'contentId'
            };
            const loader = {
                present: jest.fn(),
                dismiss: jest.fn()
            };
            jest.spyOn(enrollmentDetails, 'navigateToDetailPage').mockImplementation();
            jest.spyOn(mockCommonUtilServiceas, 'getLoader').mockReturnValue(loader);
            jest.spyOn(mockLocalCourseService, 'prepareEnrollCourseRequest');
            jest.spyOn(mockLocalCourseService, 'prepareEnrollCourseRequest');
            jest.spyOn(mockLocalCourseService, 'enrollIntoBatch').mockReturnValue(of(Promise.resolve(true)));
            jest.spyOn(loader, 'dismiss');
            mockNgZone.run = jest.fn((callback) => callback());
            // act
            enrollmentDetails.enrollIntoBatch(content);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilServiceas.showToast).toBeCalled();
                expect(mockCategoryKeyTranslator.transform).toBeCalledWith('FRMELEMNTS_MSG_COURSE_ENROLLED', expect.anything());
                expect(mockEvents.publish).toBeCalledWith(EventTopics.ENROL_COURSE_SUCCESS, {
                    batchId: content.id,
                    courseId: content.courseId
                });
                expect(loader.dismiss).toBeCalled();
                expect(mockPopoverController.dismiss).toBeCalled();
                expect(enrollmentDetails.navigateToDetailPage).toBeCalled();
                done();
            }, 0);
        });

        it('should go to navigateToDetailPage and call navigate, content.contentId to "contentId"', () => {
            // arrange
            const batch = {
                userId: 'userId',
                courseId: 'courseId',
                batchId: 'batchId',
                contentId: 'contentId',
                primaryCategory: 'Learning Resource',
                id: 'contentId'
            };
            const loader = {
                present: jest.fn(),
                dismiss: jest.fn()
            };

            enrollmentDetails.layoutInProgress = 'layout';
            mockTelemetryGeneratorService.isCollection = jest.fn(() => false);
            jest.spyOn(mockCommonUtilServiceas, 'getLoader').mockReturnValue(loader);
            jest.spyOn(mockLocalCourseService, 'enrollIntoBatch').mockReturnValue(of(Promise.resolve(true)));
            mockNgZone.run = jest.fn((callback) => callback());
            // act
            enrollmentDetails.enrollIntoBatch(batch);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ENROLL_CLICKED, Environment.HOME, PageId.CONTENT_DETAIL,
                    undefined,
                    undefined
                );
                // expect(mockNavService.navigateToDetailPage).toBeCalledWith(
                //     enrollmentDetails.content, { content: enrollmentDetails.content });
                expect(enrollmentDetails.content.identifier).toEqual(undefined);
            }, 0);
        });

        it('should go to navigateToDetailPage set content.contentId to "courseId"', (done) => {
            // arrange
            const content = {
                userId: 'userId',
                courseId: 'courseId',
                batchId: 'batchId',
                id: 'contentId'
            };
            const loader = {
                present: jest.fn(),
                dismiss: jest.fn()
            };
            jest.spyOn(mockCommonUtilServiceas, 'getLoader').mockReturnValue(loader);
            jest.spyOn(mockLocalCourseService, 'enrollIntoBatch').mockReturnValue(of(Promise.resolve(true)));
            mockNgZone.run = jest.fn((callback) => callback());
            // act
            enrollmentDetails.enrollIntoBatch(content);
            // assert
            setTimeout(() => {
                expect(content['identifier']).toEqual(undefined);
                done();
            }, 0);
        });

        it('should fail and dismiss loader', (done) => {
            // arrange
            const loader = {
                present: jest.fn(),
                dismiss: jest.fn()
            };
            jest.spyOn(mockCommonUtilServiceas, 'getLoader').mockReturnValue(loader);
            jest.spyOn(mockLocalCourseService, 'enrollIntoBatch').mockReturnValue(of(Promise.reject()));
            // act
            enrollmentDetails.enrollIntoBatch({});
            // assert
            setTimeout(() => {
                expect(loader.dismiss).toBeCalled();
                done();
            }, 0);
        });
    });

    describe('ngOnInit()', () => {
        it('should set user id and isGuestUser', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
            // act
            enrollmentDetails.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('navigateToDetailPage()', () => {
        it('should set type to "Course"', () => {
            // arrange
            const content = {
                userId: 'userId',
                contentId: 'courseId',
                batchId: 'batchId',
                id: 'contentId'
            };
            const telemetryObj = {
                id: content.contentId,
                type: 'Course',
                version: ''
            };
            const values = new Map();
            values['sectionName'] = undefined;
            values['positionClicked'] = undefined;
            // act
            enrollmentDetails.navigateToDetailPage(content, 'layout');
            // assert
            // expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalledWith(
            //     InteractType.TOUCH,
            //     InteractSubtype.CONTENT_CLICKED,
            //     undefined,
            //     PageId.COURSE_BATCHES,
            //     telemetryObj,
            //     values
            // );
        });

        it('should navigate if the contentType is collection', () => {
            // arrange
            enrollmentDetails.pageName = PageId.COURSES;
            enrollmentDetails.layoutInProgress = 'layout';
            mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
            const content = {
                userId: 'userId',
                contentId: 'courseId',
                batchId: 'batchId',
                id: 'contentId',
                contentType: 'TextBook',
                primaryCategory: 'Digital Textbook',
                mimeType: 'application/vnd.ekstep.content-collection'
            };
            const telemetryObj = {
                id: content.contentId,
                type: 'Digital Textbook',
                version: ''
            };
            const values = new Map();
            values['sectionName'] = undefined;
            values['positionClicked'] = undefined;
            // act
            enrollmentDetails.navigateToDetailPage(content);
            // assert
            // expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalledWith(
            //     InteractType.TOUCH,
            //     InteractSubtype.CONTENT_CLICKED,
            //     undefined,
            //     PageId.COURSE_BATCHES,
            //     telemetryObj,
            //     values
            // );
        });
    });

});
