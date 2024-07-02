
import { DownloadsTabComponent } from './downloads-tab.component';
import {
    AppHeaderService,
    CommonUtilService,
    NavigationService,
    TelemetryGeneratorService
} from '../../../services';
import { PopoverController } from '@ionic/angular';
import { Events } from '../../../util/events';
import { of } from 'rxjs';
import { Environment, InteractSubtype, PageId, InteractType, ActionButtonType } from '../../../services/telemetry-constants';

describe('DownloadManagerPage', () => {
    let downloadsTabComponent: DownloadsTabComponent;

    const mockPopOverController: Partial<PopoverController> = {};
    mockPopOverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        dismiss: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({})),
    } as any)));

    const mockCommonUtilService: Partial<CommonUtilService> = {
        convertFileSrc: jest.fn(() => 'sample_image_path'),
        translateMessage: jest.fn(() => 'sample_translation'),
        getAppName: jest.fn(() => Promise.resolve('Sunbird')),
        showToast: jest.fn(),
        fileSizeInMB: jest.fn(() => '1MB'),
    };
    const dismissFn = jest.fn(() => Promise.resolve({}));
    const presentFn = jest.fn(() => Promise.resolve({}));
    mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
    }));

    const mockEvents: Partial<Events> = {
        publish: jest.fn(),
        unsubscribe: jest.fn()
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn(),
        generatePageViewTelemetry: jest.fn()
    };

    const mockNavService: Partial<NavigationService> = {
        navigateToDetailPage: jest.fn()
    };

    const mockAppHeaderService: Partial<AppHeaderService> = {
        showHeaderWithBackButton: jest.fn(),
        showHeaderWithHomeButton: jest.fn(),
        headerEventEmitted$: of('')
    };

    beforeAll(() => {
        downloadsTabComponent = new DownloadsTabComponent(
            mockPopOverController as PopoverController,
            mockCommonUtilService as CommonUtilService,
            mockEvents as Events,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockNavService as NavigationService,
            mockAppHeaderService as AppHeaderService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of DownloadsTabComponent', () => {
        // arrange
        // assert
        expect(downloadsTabComponent).toBeTruthy();
    });

    describe('ngOnInit', () => {

        it('should not dismiss the popup if deleteAllPopupPresent is false', () => {
            // arrange
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = false;
            // act
            downloadsTabComponent.ngOnInit();
            // assert
            expect(downloadsTabComponent.deleteAllConfirm.dismiss).not.toHaveBeenCalled();
        });

        it('should  dismiss the popup if deleteAllPopupPresent is true', () => {
            // arrange
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = true;
            // act
            downloadsTabComponent.ngOnInit();
            // assert
            expect(downloadsTabComponent.deleteAllConfirm.dismiss).toHaveBeenCalled();
        });
    });

    describe('showDeletePopup', () => {

        it('should  show single content delete confirmation popup', (done) => {
            // arrange
            // act
            downloadsTabComponent.showDeletePopup('do_id1').then(() => {
                // assert
                expect(mockPopOverController.create).toHaveBeenCalled();
                done();
            });
        });

        it('should  invoke delete content API on click of confirmation button', (done) => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: '' } })),
            } as any)));
            downloadsTabComponent.deleteContents = { emit: jest.fn() } as any;
            // act
            downloadsTabComponent.showDeletePopup('do_id1').then(() => {
                // assert
                expect(downloadsTabComponent.deleteContents.emit).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledTimes(2);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.DELETE_CLICKED,
                    Environment.DOWNLOADS,
                    PageId.DOWNLOADS
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.TOUCH,
                    InteractSubtype.ACTION_BUTTON_CLICKED,
                    Environment.DOWNLOADS,
                    PageId.SINGLE_DELETE_CONFIRMATION_POPUP,
                    {
                        id: 'do_id1',
                        type: 'Course',
                        version: '1'
                    },
                    { type: 'positive' }
                );
                done();
            });
        });

        it('should  not invoke delete content API for any other actions', (done) => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { shouldRemove: true } })),
            } as any)));
            downloadsTabComponent.deleteContents = { emit: jest.fn() } as any;
            // act
            downloadsTabComponent.showDeletePopup('do_id1').then(() => {
                // assert
                expect(downloadsTabComponent.deleteContents.emit).not.toHaveBeenCalled();
                done();
            });
        });

        it('should  invoke delete content API on click of confirmation button for bulk delete', (done) => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } })),
            } as any)));
            downloadsTabComponent.deleteContents = { emit: jest.fn() } as any;
            // act
            downloadsTabComponent.showDeletePopup().then(() => {
                // assert
                expect(downloadsTabComponent.deleteContents.emit).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.ACTION_BUTTON_CLICKED,
                    Environment.DOWNLOADS,
                    PageId.BULK_DELETE_CONFIRMATION_POPUP,
                    undefined,
                    { type: 'positive' }
                );
                done();
            });
        });

        it('should  invoke delete content API on click of confirmation button for bulk delete, return if no network', (done) => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {isInternetNeededMessage: 'network'} } })),
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            mockCommonUtilService.showToast = jest.fn()
            downloadsTabComponent.deleteContents = { emit: jest.fn() } as any;
            // act
            downloadsTabComponent.showDeletePopup().then(() => {
                // assert
                done();
            });
        });

        it('should  invoke delete content API on click of confirmation button for bulk delete, handle else if network available', (done) => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {isInternetNeededMessage: 'network'} } })),
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            mockCommonUtilService.showToast = jest.fn()
            downloadsTabComponent.deleteContents = { emit: jest.fn() } as any;
            // act
            downloadsTabComponent.showDeletePopup().then(() => {
                // assert
                expect(downloadsTabComponent.deleteContents.emit).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.ACTION_BUTTON_CLICKED,
                    Environment.DOWNLOADS,
                    PageId.BULK_DELETE_CONFIRMATION_POPUP,
                    undefined,
                    { type: 'positive' }
                );
                done();
            });
        });

        it('should  unselect the selected contents when close is clicked', (done) => {
            // arrange
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = true;
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { closeDeletePopOver: true } })),
            } as any)));
            downloadsTabComponent.deleteContents = { emit: jest.fn() } as any;
            // act
            downloadsTabComponent.showDeletePopup().then(() => {
                // assert
                expect(downloadsTabComponent.deleteAllConfirm.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: null });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.UNSELECT_ALL_CLICKED,
                    Environment.DOWNLOADS,
                    PageId.DOWNLOADS
                );
                done();
            });
        });


        it('should  unselect the selected contents when close is clicked but should not invoke dismiss if deleteAllPopupPresent is false', (done) => {
            // arrange
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = false;
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { closeDeletePopOver: true } })),
            } as any)));
            downloadsTabComponent.deleteContents = { emit: jest.fn() } as any;
            // act
            downloadsTabComponent.showDeletePopup().then(() => {
                // assert
                expect(downloadsTabComponent.deleteAllConfirm.dismiss).not.toHaveBeenCalledWith({ isLeftButtonClicked: null });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.UNSELECT_ALL_CLICKED,
                    Environment.DOWNLOADS,
                    PageId.DOWNLOADS
                );
                done();
            });
        });

        it('should  unselect the selected contents when data is undefibned from delete popup', (done) => {
            // arrange
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = true;
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined })),
            } as any)));
            downloadsTabComponent.deleteContents = { emit: jest.fn() } as any;
            // act
            downloadsTabComponent.showDeletePopup().then(() => {
                // assert
                expect(downloadsTabComponent.deleteAllConfirm.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: null });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.UNSELECT_ALL_CLICKED,
                    Environment.DOWNLOADS,
                    PageId.DOWNLOADS
                );
                done();
            });
        });

        it('should not  unselect the selected contents when close is cliked from delete popup', (done) => {
            // arrange
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = true;
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { closeDeletePopOver: true } })),
            } as any)));
            downloadsTabComponent.deleteContents = { emit: jest.fn() } as any;
            // act
            downloadsTabComponent.showDeletePopup('do_id1').then(() => {
                // assert
                expect(downloadsTabComponent.deleteAllConfirm.dismiss).not.toHaveBeenCalledWith({ isLeftButtonClicked: null });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).not.toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.UNSELECT_ALL_CLICKED,
                    Environment.DOWNLOADS,
                    PageId.DOWNLOADS
                );
                done();
            });
        });
    });

    describe('showSortOptions', () => {

        it('should show sort Popup', () => {
            // arrange
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = false;
            // act
            downloadsTabComponent.showSortOptions({});
            // assert
            expect(mockPopOverController.create).toHaveBeenCalled();
        });

        it('should  emit the sortChanged event of sort option is selected', () => {
            // arrange
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = true;
            downloadsTabComponent.selectedFilter = 'CONTENT_SIZE';
            downloadsTabComponent.sortCriteriaChanged = { emit: jest.fn() } as any;
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { content: 'LAST_VIEWED' } })),
            } as any)));
            // act
            downloadsTabComponent.showSortOptions({}).then(() => {
                // assert
                expect(downloadsTabComponent.sortCriteriaChanged.emit).toHaveBeenCalledWith({ content: 'LAST_VIEWED' });
            });
        });

        it('should  not emit the sortChanged event if sort option is same as previous', () => {
            // arrange
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = true;
            downloadsTabComponent.selectedFilter = 'CONTENT_SIZE';
            downloadsTabComponent.sortCriteriaChanged = { emit: jest.fn() } as any;
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { content: 'CONTENT_SIZE' } })),
            } as any)));
            // act
            downloadsTabComponent.showSortOptions({}).then(() => {
                // assert
                expect(downloadsTabComponent.sortCriteriaChanged.emit).not.toHaveBeenCalledWith({ content: 'LAST_VIEWED' });
            });
        });

        it('should  not emit the sortChanged event if nothing is selected', () => {
            // arrange
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = true;
            downloadsTabComponent.selectedFilter = 'CONTENT_SIZE';
            downloadsTabComponent.sortCriteriaChanged = { emit: jest.fn() } as any;
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined })),
            } as any)));
            // act
            downloadsTabComponent.showSortOptions({}).then(() => {
                // assert
                expect(downloadsTabComponent.sortCriteriaChanged.emit).not.toHaveBeenCalledWith({ content: 'LAST_VIEWED' });
            });
        });
    });

    describe('selectAllContents', () => {

        it('should publish  events of selected contents', () => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = true;
            // act
            downloadsTabComponent.selectAllContents();
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(
                'selectedContents:changed',
                { selectedContents: { count: 2, totalSize: NaN } });
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                InteractType.TOUCH,
                InteractSubtype.SELECT_ALL_CLICKED,
                Environment.DOWNLOADS,
                PageId.DOWNLOADS
            );
        });

        it('should show bulk delete popup', () => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { content: 'LAST_VIEWED' } })),
            } as any)));
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = false;
            // act
            downloadsTabComponent.selectAllContents();
            // assert
            expect(mockPopOverController.create).toHaveBeenCalled();
        });

        it('should unselect all selected content when popup is dismissed', () => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { isLeftButtonClicked: null } })),
            } as any)));
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = false;
            // act
            downloadsTabComponent.selectAllContents();
            // assert
            expect(downloadsTabComponent.deleteAllConfirm.dismiss).not.toHaveBeenCalledWith({ isLeftButtonClicked: null });
        });

        it('should unselect all selected content when cancel is clicked', () => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            mockPopOverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { isLeftButtonClicked: true } })),
            } as any)));
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = false;
            // act
            downloadsTabComponent.selectAllContents();
            // assert
            setTimeout(() => {
                expect(downloadsTabComponent.deleteAllConfirm.dismiss).not.toHaveBeenCalledWith({ isLeftButtonClicked: null });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.TOUCH,
                    InteractSubtype.ACTION_BUTTON_CLICKED,
                    Environment.DOWNLOADS,
                    PageId.BULK_DELETE_POPUP, undefined,
                    { type: ActionButtonType.NEGATIVE }
                );
            }, 0);
        });
    });

    describe('toggleContentSelect', () => {

        it('should publish  events of selected contents', () => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            },
            {
                identifier: 'do_id2',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = true;
            // act
            downloadsTabComponent.toggleContentSelect({ detail: { checked: true } }, 0);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(
                'selectedContents:changed',
                { selectedContents: { count: 1, totalSize: NaN } });
        });

        it('should publish  events of selected contents', () => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = true;
            // act
            downloadsTabComponent.toggleContentSelect({ detail: { checked: true } }, 0);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(
                'selectedContents:changed',
                { selectedContents: { count: 1, totalSize: NaN } });
        });

        it('should dismiss the popup', () => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = true;
            // act
            downloadsTabComponent.toggleContentSelect({ detail: { checked: false } }, 0);
            // assert
            expect(downloadsTabComponent.deleteAllConfirm.dismiss).toHaveBeenCalled();
        });

        it('should not dismiss the popup', () => {
            // arrange
            downloadsTabComponent.downloadedContents = [{
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            }];
            downloadsTabComponent.deleteAllConfirm = { dismiss: jest.fn() };
            downloadsTabComponent.deleteAllPopupPresent = false;
            // act
            downloadsTabComponent.toggleContentSelect({ detail: { checked: false } }, 0);
            // assert
            expect(downloadsTabComponent.deleteAllConfirm.dismiss).not.toHaveBeenCalled();
        });

    });

    describe('navigateToDetailsPage', () => {

        it('should publish  events of selected contents', () => {
            // arrange
            const content = {
                identifier: 'do_id1',
                primaryCategory: 'Course',
                pkgVersion: '1'
            };
            // act
            downloadsTabComponent.navigateToDetailsPage(content);
            // assert
            expect(mockNavService.navigateToDetailPage).toHaveBeenCalledWith(content, { content });
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                Environment.DOWNLOADS,
                PageId.DOWNLOADS,
                {id: 'do_id1', type: 'Course', version: '1'},
                undefined,
                {l1: 'do_id1'},
                [{id: 'Downloads', type: 'Section'}]
            );
        });

    });
});