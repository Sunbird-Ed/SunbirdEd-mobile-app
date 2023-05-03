import { ContentDeleteHandler } from '../../services/content/content-delete-handler';
import { TelemetryGeneratorService, CommonUtilService } from '../../services';
import { InteractSubtype, Environment, PageId, ImpressionType, InteractType } from '../../services/telemetry-constants';
import { FileSizePipe } from '../../pipes/file-size/file-size';
import { of, throwError } from 'rxjs';
import { ContentService, Content, TelemetryObject } from '@project-sunbird/sunbird-sdk';
import { PopoverController } from '@ionic/angular';
import { Events } from '../../util/events';
import { ContentInfo } from './content-info';
describe('ContentDeleteHandler', () => {
    let contentDeleteHandler: ContentDeleteHandler;
    const mockContentService: Partial<ContentService> = {
        deleteContent: jest.fn(() => of({ status: 1 } as any))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn()
    };

    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(),
        translateMessage: jest.fn()
    };

    const dismissFn = jest.fn(() => Promise.resolve());
    const presentFn = jest.fn(() => Promise.resolve());
    mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
    }));
    const mockFileSizePipe: Partial<FileSizePipe> = {
        transform: jest.fn()
    };

    const mockPopoverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    mockPopoverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
    } as any)));

    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };

    const telemetryObject = new TelemetryObject('do_123', 'Resource', '1');
    const content = {
        contentData: {
            name: 'Sample_Name'
        }
    } as Content;

    beforeAll(() => {
        contentDeleteHandler = new ContentDeleteHandler(
            mockContentService as ContentService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockFileSizePipe as FileSizePipe,
            mockPopoverController as PopoverController,
            mockEvents as Events,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of ContentDeleteHandler', () => {
        expect(contentDeleteHandler).toBeTruthy();
    });

    describe('deleteContent()', () => {
        it('should delete the content and show MSG_RESOURCE_DELETED TOAST', (done) => {
            // arrange
            // act
            contentDeleteHandler.deleteContent('do_123', true, { telemetryObject } as ContentInfo, 'content-detail');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                InteractSubtype.DELETE_CLICKED,
                Environment.HOME,
                'content-detail',
                telemetryObject,
                undefined,
                undefined,
                undefined);
            setTimeout((() => {
                expect(mockEvents.publish).toHaveBeenCalledWith('savedResources:update', {
                    update: true
                });
                expect(mockContentService.deleteContent).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('MSG_RESOURCE_DELETED');
                done();
            }), 0);
        });


        it('should  show CONTENT_DELETE_FAILED TOAST if content not found', (done) => {
            // arrange
            mockContentService.deleteContent = jest.fn(() => of({ status: -1 } as any));
            // act
            contentDeleteHandler.deleteContent('do_123', true, { telemetryObject } as ContentInfo, 'content-detail');
            // assert
            setTimeout((() => {
                expect(mockContentService.deleteContent).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CONTENT_DELETE_FAILED');
                done();
            }), 0);
        });

        it('should  show CONTENT_DELETE_FAILED TOAST and dismiss the loader in case of API failure', (done) => {
            // arrange
            mockContentService.deleteContent = jest.fn(() => throwError('API_ERROR'));
            // act
            contentDeleteHandler.deleteContent('do_123', true, { telemetryObject } as ContentInfo, 'content-detail');
            // assert
            setTimeout((() => {
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CONTENT_DELETE_FAILED');
                done();
            }), 0);
        });

    });

    describe('showContentDeletePopup()', () => {
        it('should show Delete Popup', () => {
            // arrange
            jest.spyOn(contentDeleteHandler, 'deleteContent').mockImplementation();
            // act
            contentDeleteHandler.showContentDeletePopup(content, true, { telemetryObject } as ContentInfo, 'content-detail');
            // assert
            expect(mockPopoverController.create).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.VIEW, 'content-detail',
                PageId.SINGLE_DELETE_CONFIRMATION_POPUP,
                Environment.HOME,
                telemetryObject.id,
                telemetryObject.type,
                telemetryObject.version,
                undefined,
                undefined);
        });

        it('should invoke delete() on click of  delete button in Delete popup', (done) => {
            // arrange
            jest.spyOn(contentDeleteHandler, 'deleteContent').mockImplementation();
            // act
            contentDeleteHandler.showContentDeletePopup(content, true, { telemetryObject } as ContentInfo, 'content-detail');
            // assert
            setTimeout(() => {
                expect(contentDeleteHandler.deleteContent).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show Delete Popup if sizeOnDevice is available', () => {
            // arrange
            content['sizeOnDevice'] = 1000;
            jest.spyOn(contentDeleteHandler, 'deleteContent').mockImplementation();
            // act
            contentDeleteHandler.showContentDeletePopup(content, true, { telemetryObject } as ContentInfo, 'content-detail');
            // assert
            expect(mockPopoverController.create).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.VIEW, 'content-detail',
                PageId.SINGLE_DELETE_CONFIRMATION_POPUP,
                Environment.HOME,
                telemetryObject.id,
                telemetryObject.type,
                telemetryObject.version,
                undefined,
                undefined);
        });

        it('should not invoke deleteCOntent if popup doesnot send canDelete', () => {
            // arrange
            content['sizeOnDevice'] = 1000;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: {} }))
            } as any)));
            const deleteContentMock = jest.spyOn(contentDeleteHandler, 'deleteContent');
            deleteContentMock .mockImplementation();
            // act
            contentDeleteHandler.showContentDeletePopup(content, true, { telemetryObject } as ContentInfo, 'content-detail');
            // assert
            expect(mockPopoverController.create).toHaveBeenCalled();
            expect(deleteContentMock).not.toHaveBeenCalled();
        });

        it('should not invoke deleteCOntent if popup send canDelete true, and btn', () => {
            // arrange
            content['sizeOnDevice'] = 1000;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: {canDelete: true, btn: ''} }))
            } as any)));
            const deleteContentMock = jest.spyOn(contentDeleteHandler, 'deleteContent');
            deleteContentMock .mockImplementation();
            // act
            contentDeleteHandler.showContentDeletePopup(content, true, { telemetryObject } as ContentInfo, 'content-detail');
            // assert
            expect(mockPopoverController.create).toHaveBeenCalled();
            expect(deleteContentMock).not.toHaveBeenCalled();
        });

        it('should not invoke deleteCOntent if popup send canDelete true, and btn  object', () => {
            // arrange
            content['sizeOnDevice'] = 1000;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: {canDelete: true, btn: {isInternetNeededMessage: 'network'}} }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            mockCommonUtilService.showToast = jest.fn()
            const deleteContentMock = jest.spyOn(contentDeleteHandler, 'deleteContent');
            deleteContentMock .mockImplementation();
            // act
            contentDeleteHandler.showContentDeletePopup(content, true, { telemetryObject } as ContentInfo, 'content-detail');
            // assert
            expect(mockPopoverController.create).toHaveBeenCalled();
            expect(deleteContentMock).not.toHaveBeenCalled();
        });

        it('should not invoke deleteCOntent if popup send canDelete true, and btn  object, with network available ', () => {
            // arrange
            content['sizeOnDevice'] = 1000;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: {canDelete: true, btn: {isInternetNeededMessage: 'network'}} }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const deleteContentMock = jest.spyOn(contentDeleteHandler, 'deleteContent');
            deleteContentMock .mockImplementation();
            // act
            contentDeleteHandler.showContentDeletePopup(content, true, { telemetryObject } as ContentInfo, 'content-detail');
            // assert
            expect(mockPopoverController.create).toHaveBeenCalled();
            expect(deleteContentMock).not.toHaveBeenCalled();
        });

    });
});