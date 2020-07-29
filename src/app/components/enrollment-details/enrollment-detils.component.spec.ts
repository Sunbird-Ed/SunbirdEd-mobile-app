import { NavParams, Events, PopoverController, NavController } from '@ionic/angular';
import { NgZone } from '@angular/core';
import {
    TelemetryGeneratorService, CommonUtilService, LocalCourseService,
    InteractSubtype, InteractType, PageId
} from '../../../services';
import { AuthService, SharedPreferences } from 'sunbird-sdk';
import { Router } from '@angular/router';
import { EnrollmentDetailsComponent } from './enrollment-details.component';
import { of } from 'rxjs';
import { PreferenceKey, EventTopics, RouterLinks } from '../../app.constant';

describe('enrollmentdetailcomponent', () => {

    let enrollmentDetails: EnrollmentDetailsComponent;

    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of())
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(() => of(undefined))
    };
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
    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };
    const mockLocalCourseService: Partial<LocalCourseService> = {
        prepareEnrollCourseRequest: jest.fn(),
        prepareRequestValue: jest.fn(),
        enrollIntoBatch: jest.fn()
    };

    beforeAll(() => {
        enrollmentDetails = new EnrollmentDetailsComponent(
            mockAuthService as AuthService,
            mockSharedPreferences as SharedPreferences,
            mockNavController as NavController,
            mockNavParams as NavParams,
            mockEvents as Events,
            mockNgZone as NgZone,
            mockPopoverController as PopoverController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilServiceas as CommonUtilService,
            mockRouter as Router,
            mockLocalCourseService as LocalCourseService
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
        it('should call saveContext publish close and putString', () => {
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
            expect(enrollmentDetails.saveContentContext).toBeCalled();
            expect(mockEvents.publish).toBeCalledWith('course:resume', { content });
            expect(enrollmentDetails.close).toBeCalled();
            expect(mockSharedPreferences.putString).toBeCalledWith(PreferenceKey.CONTENT_CONTEXT, JSON.stringify(contentContextMap));
        });

        it('should call navigate', (done) => {
            // arrange
            const content = {
                userId: 'userId',
                courseId: 'courseId',
                batchId: 'batchId',
            };
            spyOn(enrollmentDetails, 'saveContentContext').and.stub();
            // act
            enrollmentDetails.resumeCourse(content);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toBeCalled();
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
            spyOn(enrollmentDetails, 'navigateToDetailPage').and.stub();
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
                expect(mockCommonUtilServiceas.translateMessage).toBeCalledWith('COURSE_ENROLLED');
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

        it('should go to navigateToDetailPage and call navigate, content.contentId to "contentId"', (done) => {
            // arrange
            const content = {
                userId: 'userId',
                courseId: 'courseId',
                batchId: 'batchId',
                contentId: 'contentId',
                id: 'contentId'
            };
            const loader = {
                present: jest.fn(),
                dismiss: jest.fn()
            };
            const telemetryObj = {
                id: content.contentId,
                type: 'Resource',
                version: ''
            };
            const values = new Map();
            values['sectionName'] = undefined;
            values['positionClicked'] = undefined;
            enrollmentDetails.layoutInProgress = 'layout';
            mockTelemetryGeneratorService.isCollection = jest.fn(() => false);
            jest.spyOn(mockCommonUtilServiceas, 'getLoader').mockReturnValue(loader);
            jest.spyOn(mockLocalCourseService, 'enrollIntoBatch').mockReturnValue(of(Promise.resolve(true)));
            mockNgZone.run = jest.fn((callback) => callback());
            // act
            enrollmentDetails.enrollIntoBatch(content);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.CONTENT_CLICKED,
                    undefined,
                    undefined,
                    telemetryObj,
                    values
                );
                expect(mockRouter.navigate).toBeCalledWith([`/${RouterLinks.ENROLLED_COURSE_DETAILS}`], { state: { content } });
                expect(content.contentId).toEqual('contentId');
                done();
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
                expect(content['contentId']).toEqual('courseId');
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

    describe('getUserid()', () => {
        it('should set userToken and isGuestUser', (done) => {
            // arrange
            jest.spyOn(mockAuthService, 'getSession').mockReturnValue(of({ userToken: 'userToken' }));
            mockNgZone.run = jest.fn((callback) => callback());
            // act
            enrollmentDetails.getUserId();
            // assert
            setTimeout(() => {
                expect(enrollmentDetails.isGuestUser).toEqual(false);
                expect(enrollmentDetails.userId).toEqual('userToken');
                done();
            }, 0);
        });

        it('should mark guest user to true if session is empty', (done) => {
            // arrange
            jest.spyOn(mockAuthService, 'getSession').mockReturnValue(of(undefined));
            mockNgZone.run = jest.fn((callback) => callback());
            // act
            enrollmentDetails.getUserId();
            // assert
            setTimeout(() => {
                expect(enrollmentDetails.isGuestUser).toEqual(true);
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
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                undefined,
                undefined,
                telemetryObj,
                values
            );
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
                mimeType: 'application/vnd.ekstep.content-collection'
            };
            const telemetryObj = {
                id: content.contentId,
                type: 'TextBook',
                version: ''
            };
            const values = new Map();
            values['sectionName'] = undefined;
            values['positionClicked'] = undefined;
            // act
            enrollmentDetails.navigateToDetailPage(content);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                undefined,
                PageId.COURSES,
                telemetryObj,
                values
            );
        });
    });

});
