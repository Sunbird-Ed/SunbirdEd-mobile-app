import { ContentRatingAlertComponent } from './content-rating-alert.component';
import { ContentFeedbackService, TelemetryService, Content, ContentFeedback } from 'sunbird-sdk';
import { CommonUtilService, AppGlobalService, TelemetryGeneratorService } from '../../../services';
import { PopoverController, Platform, NavParams } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import {
    Environment,
    ImpressionType,
    InteractSubtype,
    InteractType,
    Mode,
    PageId,
    ImpressionSubtype
} from '@app/services/telemetry-constants';
describe('ContentRatingAlertComponent', () => {
    let contentRatingAlertComponent: ContentRatingAlertComponent;
    const mockContentFeedbackService: Partial<ContentFeedbackService> = {
        sendFeedback: jest.fn(() => of(undefined))
    };
    const mockTelemetryService: Partial<TelemetryService> = {
        log: jest.fn(() => of(undefined))
    };
    const mockPopoverCtrl: Partial<PopoverController> = {
        dismiss: Promise.resolve(true) as any
    };
    const mockContent: Partial<Content> = {
        identifier: 'do_12345',
        contentData: {
            contentType: 'Resource',
            pkgVersion: '1'
        },
        versionKey: '1234'
    };
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'content':
                    value = mockContent;
                    break;
                case 'rating':
                    value = 5;
                    break;
                case 'comment':
                    value = 'Sample comment';
                    break;
                case 'popupType':
                    value = 'manual';
                    break;
                case 'pageId':
                    value = 'content-detail';
                    break;
            }
            return value;
        })
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(() => { }),
        generateInteractTelemetry: jest.fn(() => { })
    };
    const mockPlatform: Partial<Platform> = {
    };
    const subscribeWithPriorityData = jest.fn();
    mockPlatform.backButton = {
        subscribeWithPriority: subscribeWithPriorityData,
    } as any;

    const session = { userToken: '01234567abcdef' };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getSessionData: jest.fn(() => session),
        isUserLoggedIn: jest.fn(() => false)
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(() => { })
    };


    beforeAll(() => {
        contentRatingAlertComponent = new ContentRatingAlertComponent(
            mockContentFeedbackService as ContentFeedbackService,
            mockTelemetryService as TelemetryService,
            mockPopoverCtrl as PopoverController,
            mockPlatform as Platform,
            mockNavParams as NavParams,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of ContentRatingAlertComponent', () => {
        expect(contentRatingAlertComponent).toBeTruthy();
    });

    it('should generate IMPRESSION telemetry in ionViewWillEnter()', () => {
        // arrange

        // act
        contentRatingAlertComponent.ionViewWillEnter();
        // assert
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW,
            ImpressionSubtype.RATING_POPUP,
            'content-detail',
            Environment.HOME, 'do_12345',
            'Resource',
            '1');
    });

    it('should submit rating and generate INTERACT telemetry successfully', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        const feebackRequest: ContentFeedback = {
            contentId: 'do_12345',
            rating: 5,
            comments: 'Sample comment',
            contentVersion: '1234'
        };
        const viewDissMissData = {
            message: 'rating.success',
            rating: 5,
            comment: 'Sample comment'
        };
        const paramsMap = new Map();
        paramsMap['Ratings'] = 5;
        paramsMap['Comment'] = 'Sample comment';
        // act
        contentRatingAlertComponent.submit();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.RATING_SUBMITTED,
            Environment.HOME,
            'content-detail',
            {id: 'do_12345', version: '1', type: 'Resource'},
            paramsMap);
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith(viewDissMissData);
        expect(mockContentFeedbackService.sendFeedback).toHaveBeenCalledWith(feebackRequest);
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('THANK_FOR_RATING');
    });

    it('should generate IMPRESSION telemetry in ionViewWillEnter()', () => {
        // arrange

        // act
        contentRatingAlertComponent.ionViewWillEnter();
        // assert
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW,
            ImpressionSubtype.RATING_POPUP,
            'content-detail',
            Environment.HOME, 'do_12345',
            'Resource',
            '1');
    });

    it('should dismiss the popup if sendFeedBack API fails', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        const viewDissMissData = {
            message: ' rating.error',
        };
        mockContentFeedbackService.sendFeedback = jest.fn(() => throwError({ error: 'API_ERROR' }));

        // act
        contentRatingAlertComponent.submit();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });


});
