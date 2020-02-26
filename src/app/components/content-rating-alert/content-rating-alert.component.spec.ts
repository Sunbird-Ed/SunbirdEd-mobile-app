import { ContentRatingAlertComponent } from './content-rating-alert.component';
import { ContentFeedbackService,
    TelemetryService,
    Content,
    ContentFeedback,
    FormService,
    SharedPreferences
} from 'sunbird-sdk';
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
import { declaredViewContainer } from '@angular/core/src/view/util';
import { Location } from '@angular/common';
describe('ContentRatingAlertComponent', () => {
    let contentRatingAlertComponent: ContentRatingAlertComponent;
    const mockContentFeedbackService: Partial<ContentFeedbackService> = {
        sendFeedback: jest.fn(() => of(undefined))
    };
    const mockTelemetryService: Partial<TelemetryService> = {
        log: jest.fn(() => of(undefined)),
        feedback: jest.fn(() => of(undefined))
    };
    const mockPopoverCtrl: Partial<PopoverController> = {
        dismiss: jest.fn(() => Promise.resolve(true) as any)
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
                    value = 'Sample comment other-';
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
    const mockFormService: Partial<FormService> = {
        getForm: jest.fn(() => of('form' as any))
    };
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('en' as any))
    };
    const mockPlatform: Partial<Platform> = {
    };
    let subscribeWithPriorityCallback;
    const mockBackBtnFunc = { unsubscribe: jest.fn() }
    const subscribeWithPriorityData = jest.fn((val, callback) => { 
        subscribeWithPriorityCallback = callback;
        return mockBackBtnFunc
    });
    mockPlatform.backButton = {
        subscribeWithPriority: subscribeWithPriorityData,
    } as any;

    const session = { userToken: '01234567abcdef' };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getSessionData: jest.fn(() => session),
        isUserLoggedIn: jest.fn(() => false)
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(() => { }),
        translateMessage: jest.fn(() => 'Message To Display')
    };
    const mockLocation: Partial<Location> = {};


    beforeAll(() => {
        contentRatingAlertComponent = new ContentRatingAlertComponent(
            mockContentFeedbackService as ContentFeedbackService,
            mockTelemetryService as TelemetryService,
            mockFormService as FormService,
            mockPreferences as SharedPreferences,
            mockPopoverCtrl as PopoverController,
            mockPlatform as Platform,
            mockNavParams as NavParams,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockCommonUtilService as CommonUtilService,
            mockLocation as Location
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of ContentRatingAlertComponent', () => {
        expect(contentRatingAlertComponent).toBeTruthy();
    });

    // it('should generate IMPRESSION telemetry in ionViewWillEnter()', () => {
    //     // arrange

    //     // act
    //     contentRatingAlertComponent.ionViewWillEnter();
    //     // assert
    //     expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
    //         ImpressionType.VIEW,
    //         ImpressionSubtype.RATING_POPUP,
    //         'content-detail',
    //         Environment.HOME, 'do_12345',
    //         'Resource',
    //         '1');
    // });

    it('should submit rating and generate INTERACT telemetry successfully', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        contentRatingAlertComponent.ratingOptions = [{
            key: 'key',
            value: 'val',
            isChecked: true
        }];
        contentRatingAlertComponent.commentText = '';
        const feebackRequest: ContentFeedback = {
            contentId: 'do_12345',
            rating: 5,
            comments: 'key',
            contentVersion: '1'
        };
        const viewDissMissData = {
            message: 'rating.success',
            rating: 5,
            comment: 'key'
        };
        const paramsMap = new Map();
        paramsMap['Ratings'] = 5;
        paramsMap['Comment'] = 'key';
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
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(
            'THANK_FOR_RATING',
            false,
            'green-toast'
        );
    });

    it('should generate IMPRESSION telemetry in ionViewWillEnter()', () => {
        // arrange
        // jest.spyOn(contentRatingAlertComponent, 'invokeContentRatingFormApi').mockImplementation();
        spyOn(contentRatingAlertComponent, 'invokeContentRatingFormApi').and.stub();
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
        contentRatingAlertComponent.commentText = 'comment text';
        mockContentFeedbackService.sendFeedback = jest.fn(() => throwError({ error: 'API_ERROR' }));

        // act
        contentRatingAlertComponent.submit();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });

    describe('constructor ', () => {
        it('', () => {
            // act
            subscribeWithPriorityCallback();
            // assert
            expect(mockBackBtnFunc.unsubscribe).toBeCalled();
            expect(mockPopoverCtrl.dismiss).toBeCalled();
        });
    });

    describe('ionViewWillLeave', () => {
        it('should call unsubscribe', () => {
            // act
            contentRatingAlertComponent.ionViewWillLeave();
            // assert
            expect(mockBackBtnFunc.unsubscribe).toBeCalled();
        });
    });

    describe('getUserId', () => {
        it('should set userId to ""', () => {
            // arrange
            jest.spyOn(mockAppGlobalService, 'getSessionData').mockReturnValue(undefined);
            // act
            contentRatingAlertComponent.getUserId();
            // assert
            expect(contentRatingAlertComponent.userId).toEqual('');
        });
    });

    describe('rateContent', () => {
        it('should call createRatingForm', () => {
            // arrange
            spyOn(contentRatingAlertComponent, 'createRatingForm').and.stub();
            // act
            contentRatingAlertComponent.rateContent({});
            // assert
            expect(contentRatingAlertComponent.createRatingForm).toBeCalled();
        });
    });

    describe('showMessage', () => {
        it('should call translateMessage and showToast method', () => {
            // arrange
            const msg = 'Message To Display';
            // act
            contentRatingAlertComponent.showMessage(msg);
            // assert
            expect(mockCommonUtilService.translateMessage).toBeCalledWith(msg);
            expect(mockCommonUtilService.showToast).toBeCalled();
        });
    });

    describe('ratingOptsChanged', () => {
        it('should set showCommentBox to opposite of current value', () => {
            // arrange
            contentRatingAlertComponent.showCommentBox = true;
            // act
            contentRatingAlertComponent.ratingOptsChanged('other');
            // assert
            expect(contentRatingAlertComponent.showCommentBox).not.toEqual((!contentRatingAlertComponent.showCommentBox));
        });
    });

    describe('cancel', () => {
        it('should call dismiss', () => {
            // arrange
            // act
            contentRatingAlertComponent.cancel();
            // assert
            expect(mockPopoverCtrl.dismiss).toBeCalled();
        });
    });

    describe('closePopover', () => {
        it('should call dismiss', () => {
            // arrange
            // act
            contentRatingAlertComponent.closePopover();
            // assert
            expect(mockPopoverCtrl.dismiss).toBeCalled();
        });
    });

    describe('createRatingForm', () => {
        it('', () => {
            // arrange
            contentRatingAlertComponent.contentRatingOptions = {
                5: {
                    question: 'Would you like to tell us more?',
                    options: [
                        {
                            key: 'opt_1',
                            idx: 1,
                            value: 'Content is inaccurate'
                        }
                    ],
                    ratingText: 'Very Bad'
                }
            };
            // contentRatingAlertComponent.contentRatingOptions = ContentRatingOptions;
            // act
            contentRatingAlertComponent.createRatingForm(5);
            // assert
            expect(contentRatingAlertComponent.ratingMetaInfo.ratingText).toEqual('Very Bad');
            expect(contentRatingAlertComponent.ratingMetaInfo.ratingQuestion).toEqual('Would you like to tell us more?');
        });
    });

    describe('extractComments', () => {
        it('should extract comments', () => {
            // arrange
            contentRatingAlertComponent.ratingOptions = [
                {key: 'opt1', idx: 1, value: 'sample value'}
            ];
            // act
            contentRatingAlertComponent.extractComments('opt1');
            // assert
            expect(contentRatingAlertComponent.ratingOptions[0].isChecked).toBe(true);
        });
    });

    describe('invokeContentRatingFormApi', () => {
        it('should call form API', (done) => {
            // arrange
            const form = {
                    form: {
                        data: {
                            fields : [{1: {ratingText: 'poor'}}]
                        }
                    }
            };
            mockFormService.getForm = jest.fn(() => of(form as any));
            mockPreferences.getString = jest.fn(() => of('ka' as any));
            contentRatingAlertComponent.ratingOptions = [
                {key: 'opt1', idx: 1, value: 'sample value'}
            ];
            spyOn(contentRatingAlertComponent, 'createRatingForm').and.stub();
            spyOn(contentRatingAlertComponent, 'extractComments').and.stub();
            // act
            contentRatingAlertComponent.invokeContentRatingFormApi();
            // assert
            setTimeout(() => {
                expect(mockFormService.getForm).toHaveBeenCalled();
                done();
            }, 100);
        });
        it('should fallback to form in english in case of error', (done) => {
            // arrange
            mockFormService.getForm = jest.fn(() => throwError('err' as any));
            mockPreferences.getString = jest.fn(() => of('en' as any));
            contentRatingAlertComponent.ratingOptions = [
                {key: 'opt1', idx: 1, value: 'sample value'}
            ];
            spyOn(contentRatingAlertComponent, 'createRatingForm').and.stub();
            spyOn(contentRatingAlertComponent, 'extractComments').and.stub();
            // act
            contentRatingAlertComponent.invokeContentRatingFormApi();
            // assert
            setTimeout(() => {
                expect(mockFormService.getForm).toHaveBeenCalled();
                done();
            }, 100);
        });
        it('should call form in english', (done) => {
            // arrange
            const form = {
                    form: {
                        data: {
                            fields : [{1: {ratingText: 'poor'}}]
                        }
                    }
            };
            mockFormService.getForm = jest.fn(() => of(form as any));
            mockPreferences.getString = jest.fn(() => of('en' as any));
            contentRatingAlertComponent.ratingOptions = [
                {key: 'opt1', idx: 1, value: 'sample value'}
            ];
            spyOn(contentRatingAlertComponent, 'createRatingForm').and.stub();
            spyOn(contentRatingAlertComponent, 'extractComments').and.stub();
            // act
            contentRatingAlertComponent.getDefaultContentRatingFormApi();
            // assert
            setTimeout(() => {
                expect(mockFormService.getForm).toHaveBeenCalledWith(
                    {action: 'get', subType: 'en', type: 'contentfeedback'}
                );
                done();
            }, 100);
        });
    });

});
