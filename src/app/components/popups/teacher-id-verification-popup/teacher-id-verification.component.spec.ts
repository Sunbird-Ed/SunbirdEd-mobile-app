import { TeacherIdVerificationComponent } from './teacher-id-verification-popup.component';
import { PopoverController, NavParams } from '@ionic/angular';
import { Events } from '../../../../util/events';
import { TelemetryGeneratorService, CommonUtilService } from '../../../../services';
import { of, throwError } from 'rxjs';
import { ProfileService, HttpClientError, Response, HttpServerError } from '@project-sunbird/sunbird-sdk';
import { featureIdMap } from '../../../../feature-id-map';
import {
    Environment,
    ImpressionType,
    InteractSubtype,
    InteractType,
    PageId,
    ID
} from '../../../../services/telemetry-constants';

describe('TeacherIdVerificationComponent', () => {
    let teacherIdVerificationComponent: TeacherIdVerificationComponent;

    const userMigrationResponse = { responseCode: 'ok' } as any;
    const mockProfileService: Partial<ProfileService> = {
        userMigrate: jest.fn(() => of(userMigrationResponse))
    };
    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockNavParams: Partial<NavParams> = {
        data: {
            userFeed: { id: '0123456789', userId: '0123456789', data: { prospectChannels: ['tn'] } },
            tenantMessages: {}
        }
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn()
    };
    const mockEvents: Partial<Events> = {};


    beforeAll(() => {
        teacherIdVerificationComponent = new TeacherIdVerificationComponent(
            mockProfileService as ProfileService,
            mockPopOverController as PopoverController,
            mockNavParams as NavParams,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockEvents as Events
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of TeacherIdVerificationComponent', () => {
        expect(teacherIdVerificationComponent).toBeTruthy();
    });

    it('should generate IMPRESSION telemetry on ngOnit', () => {
        // arrange
        // act
        teacherIdVerificationComponent.ngOnInit();
        // assert
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.VIEW,
            '',
            PageId.EXTERNAL_USER_VERIFICATION_POPUP,
            Environment.HOME, '', '', '', undefined, featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION);
    });

    it('should close popover  and generate INTERACT telemetry', () => {
        // arrange
        // act
        teacherIdVerificationComponent.cancelPopup('SAMPLE_MESSAGE');
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalled();
        const reason = new Map();
        reason['popup_close'] = 'SAMPLE_MESSAGE';
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith( InteractType.TOUCH,
            InteractSubtype.POPUP_DISMISSED,
            Environment.HOME,
            PageId.EXTERNAL_USER_VERIFICATION_POPUP,
            undefined,
            reason,
            undefined,
            featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION);
    });

    it('should close popover  and generate INTERACT telemetry', () => {
        // arrange
        // act
        teacherIdVerificationComponent.selectState('SAMPLE_STATE');
        // assert
        expect(teacherIdVerificationComponent.stateName).toEqual('SAMPLE_STATE');
        expect(teacherIdVerificationComponent.showStates).toBeFalsy();
    });

    it('should close the popOver  on closePopup', () => {
        // arrange
        // act
        teacherIdVerificationComponent.closePopup();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
            InteractSubtype.POPUP_DISMISSED,
            Environment.HOME,
            PageId.EXTERNAL_USER_VERIFICATION_POPUP,
            undefined,
            undefined,
            undefined,
            featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION);
    });

    describe('teacherConfirmation()', () => {
        it('should generate INTERACT telemetry if user confirms  verification', () => {
            // arrange
            jest.spyOn(teacherIdVerificationComponent, 'initializeFormFields');
            // act
            teacherIdVerificationComponent.teacherConfirmation(true);
            // assert
            expect(teacherIdVerificationComponent.initializeFormFields).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                '',
                Environment.HOME,
                PageId.EXTERNAL_USER_VERIFICATION_POPUP,
                undefined,
                undefined,
                undefined,
                featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
                ID.USER_VERIFICATION_CONFIRMED);
        });

        it('should generate INTERACT telemetry if user rejects  verification', () => {
            // arrange
            // act
            teacherIdVerificationComponent.teacherConfirmation(false);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                '',
                Environment.HOME,
                PageId.EXTERNAL_USER_VERIFICATION_POPUP,
                undefined,
                undefined,
                undefined,
                featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
                ID.USER_VERIFICATION_REJECTED);
        });

        it('should invoke userMigrate API with reject status if user rejects  verification', (done) => {
            // arrange
            jest.spyOn(teacherIdVerificationComponent, 'closePopup');
            teacherIdVerificationComponent.stateName = '';
            // act
            teacherIdVerificationComponent.teacherConfirmation(false);
            // assert
            expect(mockProfileService.userMigrate).toHaveBeenCalledWith({
                userId: '0123456789',
                action: 'reject',
                channel: 'tn',
                feedId: '0123456789'
            });

            setTimeout(() => {
                expect(teacherIdVerificationComponent.closePopup).toHaveBeenCalled();
                expect(teacherIdVerificationComponent.count).toEqual(0);
                expect(teacherIdVerificationComponent.teacherIdFlag).toEqual('verifiedStateId');
                done();
            }, 0);
        });

        it('should close the popup in vase of  API failure', (done) => {
            // arrange
            jest.spyOn(teacherIdVerificationComponent, 'closePopup');
            mockProfileService.userMigrate = jest.fn(() => throwError({ error: 'API_ERROR' }));
            // act
            teacherIdVerificationComponent.teacherConfirmation(false);
            // assert
            setTimeout(() => {
                expect(teacherIdVerificationComponent.closePopup).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not close the popup in value is expected', (done) => {
            // arrange
            jest.spyOn(teacherIdVerificationComponent, 'closePopup');
            mockProfileService.userMigrate = jest.fn(() => of({ responseCode: 'ok1' }));
            // act
            teacherIdVerificationComponent.teacherConfirmation(false);
            // assert
            setTimeout(() => {
                expect(teacherIdVerificationComponent.closePopup).not.toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('submitTeacherId()', () => {
        it('should generate INTERACT telemetry if user confirms  verification', () => {
            // arrange
            teacherIdVerificationComponent.teacherIdForm = { value: { teacherId: 'SAMPLE_TEACHERID' } } as any;
            teacherIdVerificationComponent.stateName = '';
            jest.spyOn(teacherIdVerificationComponent, 'externalUserVerfication');
            // act
            teacherIdVerificationComponent.submitTeacherId();
            // assert
            expect(teacherIdVerificationComponent.count).toEqual(1);
            expect(teacherIdVerificationComponent.externalUserVerfication).toHaveBeenCalledWith({
                userId: '0123456789',
                userExtId: 'SAMPLE_TEACHERID',
                channel: 'tn',
                action: 'accept',
                feedId: '0123456789'
            });
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                '',
                Environment.HOME,
                PageId.EXTERNAL_USER_VERIFICATION_POPUP,
                undefined,
                undefined,
                undefined,
                featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
                ID.USER_VERIFICATION_SUBMITED);
        });

        it('should invoke the userMigrate API with channel as stateName', () => {
            // arrange
            teacherIdVerificationComponent.teacherIdForm = { value: { teacherId: 'SAMPLE_TEACHERID' } } as any;
            teacherIdVerificationComponent.stateName = 'TN';
            jest.spyOn(teacherIdVerificationComponent, 'externalUserVerfication');
            // act
            teacherIdVerificationComponent.submitTeacherId();
            // assert
            expect(teacherIdVerificationComponent.count).toEqual(1);
            expect(teacherIdVerificationComponent.externalUserVerfication).toHaveBeenCalledWith({
                userId: '0123456789',
                userExtId: 'SAMPLE_TEACHERID',
                channel: 'TN',
                action: 'accept',
                feedId: '0123456789'
            });
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                '',
                Environment.HOME,
                PageId.EXTERNAL_USER_VERIFICATION_POPUP,
                undefined,
                undefined,
                undefined,
                featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
                ID.USER_VERIFICATION_SUBMITED);
        });

        it('should not inovoke the userMigrate api is teacherId is empty ', () => {
            // arrange
            teacherIdVerificationComponent.teacherIdForm = { value: { teacherId: undefined } } as any;
            teacherIdVerificationComponent.stateName = '';
            jest.spyOn(teacherIdVerificationComponent, 'externalUserVerfication');
            // act
            teacherIdVerificationComponent.submitTeacherId();
            // assert
            expect(teacherIdVerificationComponent.count).toEqual(1);
            expect(teacherIdVerificationComponent.externalUserVerfication).not.toHaveBeenCalledWith({
                userId: '0123456789',
                userExtId: 'SAMPLE_TEACHERID',
                channel: 'tn',
                action: 'accept',
                feedId: '0123456789'
            });
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                '',
                Environment.HOME,
                PageId.EXTERNAL_USER_VERIFICATION_POPUP,
                undefined,
                undefined,
                undefined,
                featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
                ID.USER_VERIFICATION_SUBMITED);
        });
    });

    describe('externalUserVerfication()', () => {
        it('should generate INTERACT telemetry for successsfull validation', (done) => {
            // arrange
            mockProfileService.userMigrate = jest.fn(() => of(userMigrationResponse));
            mockEvents.publish = jest.fn(() => []);
            // act
            teacherIdVerificationComponent.externalUserVerfication({
                userId: '0123456789',
                userExtId: 'SAMPLE_TEACHERID',
                channel: 'tn',
                action: 'accept',
                feedId: '0123456789'
            });
            // assert
            setTimeout(() => {
                expect(teacherIdVerificationComponent.teacherIdFlag).toEqual('verifiedStateId');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
                    '',
                    Environment.USER,
                    PageId.EXTERNAL_USER_VERIFICATION_POPUP,
                    undefined,
                    undefined,
                    undefined,
                    featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
                    ID.USER_VERIFICATION_SUCCESS);
                done();
                expect(mockEvents.publish).toHaveBeenCalled();
            }, 0);
        });

        it('should set the error flag in case of invalid id', (done) => {
            // arrange
            const userMigrationInvalidIdResponse = { responseCode: 'invaliduserexternalid' } as any;
            mockProfileService.userMigrate = jest.fn(() => of(userMigrationInvalidIdResponse));
            // act
            teacherIdVerificationComponent.externalUserVerfication({
                userId: '0123456789',
                userExtId: 'SAMPLE_TEACHERID',
                channel: 'tn',
                action: 'accept',
                feedId: '0123456789'
            });
            // assert
            setTimeout(() => {
                expect(teacherIdVerificationComponent.teacherModelId).toEqual('');
                expect(teacherIdVerificationComponent.showTeacherIdIncorrectErr).toBeTruthy();
                done();
            }, 0);
        });

        it('should generate failed verification INTERACT telemetry and set teacherIdFlag for 400 error code', (done) => {
            // arrange
            const sunbirdResponse = new Response<any>();
            sunbirdResponse.responseCode = 400;
            sunbirdResponse.body = {};
            mockProfileService.userMigrate = jest.fn(() => throwError(new HttpClientError('', sunbirdResponse)));
            // act
            teacherIdVerificationComponent.externalUserVerfication({});
            // assert
            setTimeout(() => {
                expect(teacherIdVerificationComponent.teacherIdFlag).toEqual('failedStateId');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
                    '',
                    Environment.HOME,
                    PageId.EXTERNAL_USER_VERIFICATION_POPUP,
                    undefined,
                    undefined,
                    undefined,
                    featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
                    ID.USER_VERIFICATION_FAILED);
                done();
            }, 0);
        });

        it('should generate failed verification INTERACT telemetry and set teacherIdFlag for 404 error code', (done) => {
            // arrange
            const sunbirdResponse = new Response<any>();
            sunbirdResponse.responseCode = 404;
            sunbirdResponse.body = {};
            mockProfileService.userMigrate = jest.fn(() => throwError(new HttpClientError('', sunbirdResponse)));
            // act
            teacherIdVerificationComponent.externalUserVerfication({});
            // assert
            setTimeout(() => {
                expect(teacherIdVerificationComponent.teacherIdFlag).toEqual('failedStateId');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
                    '',
                    Environment.HOME,
                    PageId.EXTERNAL_USER_VERIFICATION_POPUP,
                    undefined,
                    undefined,
                    undefined,
                    featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
                    ID.USER_VERIFICATION_FAILED);
                done();
            }, 0);
        });

        it('should cloe popup and show USER_IS_NOT_VERIFIED toast for 429 error code', (done) => {
            // arrange
            const sunbirdResponse = new Response<any>();
            sunbirdResponse.responseCode = 429;
            sunbirdResponse.body = {};
            mockProfileService.userMigrate = jest.fn(() => throwError(new HttpClientError('', sunbirdResponse)));
            jest.spyOn(teacherIdVerificationComponent, 'closePopup');
            // act
            teacherIdVerificationComponent.externalUserVerfication({});
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('USER_IS_NOT_VERIFIED');
                expect(teacherIdVerificationComponent.closePopup).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should cloe popup and show USER_IS_NOT_VERIFIED toast for 401 error code', (done) => {
            // arrange
            const sunbirdResponse = new Response<any>();
            sunbirdResponse.responseCode = 401;
            sunbirdResponse.body = {};
            mockProfileService.userMigrate = jest.fn(() => throwError(new HttpClientError('', sunbirdResponse)));
            jest.spyOn(teacherIdVerificationComponent, 'closePopup');
            // act
            teacherIdVerificationComponent.externalUserVerfication({});
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('USER_IS_NOT_VERIFIED');
                expect(teacherIdVerificationComponent.closePopup).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should cloe popup and show USER_IS_NOT_VERIFIED toast for othe error code', (done) => {
            // arrange
            const sunbirdResponse = new Response<any>();
            sunbirdResponse.responseCode = 500;
            sunbirdResponse.body = {};
            mockProfileService.userMigrate = jest.fn(() => throwError(new HttpClientError('', sunbirdResponse)));
            jest.spyOn(teacherIdVerificationComponent, 'closePopup');
            // act
            teacherIdVerificationComponent.externalUserVerfication({});
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('USER_IS_NOT_VERIFIED');
                expect(teacherIdVerificationComponent.closePopup).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not show any TOAST if its not a client error', (done) => {
            // arrange
            const sunbirdResponse = new Response<any>();
            sunbirdResponse.responseCode = 500;
            sunbirdResponse.body = {};
            mockProfileService.userMigrate = jest.fn(() => throwError(new HttpServerError('', sunbirdResponse)));
            jest.spyOn(teacherIdVerificationComponent, 'closePopup');
            // act
            teacherIdVerificationComponent.externalUserVerfication({});
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).not.toHaveBeenCalledWith('USER_IS_NOT_VERIFIED');
                expect(teacherIdVerificationComponent.closePopup).not.toHaveBeenCalled();
                done();
            }, 0);
        });
    });
});

describe('TeacherIdVerificationComponent', () => {
    let teacherIdVerificationComponent: TeacherIdVerificationComponent;

    const userMigrationResponse = { responseCode: 'ok' } as any;
    const mockProfileService: Partial<ProfileService> = {
        userMigrate: jest.fn(() => of(userMigrationResponse))
    };
    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockNavParams: Partial<NavParams> = {
        data: undefined
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn()
    };
    const mockEvents: Partial<Events> = {};


    beforeAll(() => {
        teacherIdVerificationComponent = new TeacherIdVerificationComponent(
            mockProfileService as ProfileService,
            mockPopOverController as PopoverController,
            mockNavParams as NavParams,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockEvents as Events
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not populate the attributes ', () => {
        expect(teacherIdVerificationComponent.userFeed).toBeFalsy();
        expect(teacherIdVerificationComponent.stateList).toBeFalsy();
        expect(teacherIdVerificationComponent.tenantMessages).toBeFalsy();
    });
});
