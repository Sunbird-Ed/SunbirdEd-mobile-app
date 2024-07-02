import { ImportPopoverComponent } from './import-popover.component';
import { NgZone } from '@angular/core';
import { NavParams, Platform, PopoverController } from '@ionic/angular';
import { FileSizePipe } from '../../../../pipes/file-size/file-size';
import {
    ContentEventType,
    EventsBusEvent,
    EventsBusService
} from '@project-sunbird/sunbird-sdk';
import { TelemetryGeneratorService, AppGlobalService } from '../../../../services';
import {
    Environment,
    ImpressionType,
    PageId,
    ID,
    InteractType
} from '../../../../services/telemetry-constants';
import { of } from 'rxjs';

describe('ImportPopoverComponent', () => {
    let importPopoverComponent: ImportPopoverComponent;
    const mockEventBusService: Partial<EventsBusService> = {
        events: jest.fn(() => of({}))
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        isOnBoardingCompleted: jest.fn(() => true)
    };
    const mockPopoverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {
    };
    const subscribeWithPriorityData = jest.fn((_, fn) => fn());
    mockPlatform.backButton = {
        subscribeWithPriority: subscribeWithPriorityData,

    } as any;
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'filName':
                    value = 'sample_fileName';
                    break;
                case 'size':
                    value = '12345';
                    break;
                case 'onLoadClicked':
                    value = jest.fn(() => {});
                    break;
            }
            return value;
        })
    };
    const mockFileSizePipe: Partial<FileSizePipe> = {
        transform: jest.fn()
    };
    const mockNgZone: Partial<NgZone> = {
        run : jest.fn((fn) => fn())
    };
    beforeAll(() => {
        importPopoverComponent = new ImportPopoverComponent(
            mockEventBusService as EventsBusService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockPopoverController as PopoverController,
            mockPlatform as Platform,
            mockNavParams as NavParams,
            mockFileSizePipe as FileSizePipe,
            mockNgZone as NgZone);
        importPopoverComponent.backButtonFunc = {
            unsubscribe: jest.fn(),
        } as any;
        importPopoverComponent.onLoadClicked = jest.fn(() => {});
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of ImportPopoverComponent', () => {
        expect(importPopoverComponent).toBeTruthy();
    });

    describe('ngOnInit()', () => {
        it('should generate  IMPRESSION telemetry on ngOnInit', () => {
            // arrange
            // act
            importPopoverComponent.ngOnInit();
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.VIEW,
                '',
                PageId.IMPORT_CONTENT_POPUP,
                Environment.HOME);
        });
    });

    describe('closePopover()', () => {
        it('should dismiss the PopOver', () => {
            // arrange
            importPopoverComponent.importingAndDisablingButton = false;
            // act
            importPopoverComponent.closePopover();
            // assert
            expect(mockPopoverController.dismiss).toHaveBeenCalled();
        });
    });

    describe('checkboxClicked()', () => {
        it('should set the deleteChecked value', () => {
            // arrange
            // act
            importPopoverComponent.checkboxClicked({ detail: { checked: true } } as any);
            // assert
            expect(importPopoverComponent.deleteChecked).toBeTruthy();
        });
    });

    describe('importInitiated()', () => {
        it('should generate INTERACT telemetry when import is initiated', () => {
            // arrange
            importPopoverComponent.deleteChecked = true;
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn(() => {
                    importPopoverComponent.backButtonFunc = {
                        unsubscribe: jest.fn()
                    } as any
                })
            } as any
            // act
            importPopoverComponent.importInitiated();
            importPopoverComponent.ngOnDestroy();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.DELETE_CHECKED, '',
                Environment.HOME,
                PageId.IMPORT_CONTENT_POPUP, undefined, undefined, undefined, undefined,
                ID.LOAD_CLICKED);
        });

        it('should update current and totalCount of imported content', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: ContentEventType.IMPORT_PROGRESS,
                payload: { currentCount: 1, totalCount: 10 }
            }));
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn(() => {
                    importPopoverComponent.backButtonFunc = {
                        unsubscribe: jest.fn()
                    } as any
                })
            }as any
            // act
            importPopoverComponent.importInitiated();

            // assert
            setTimeout(() => {
                expect(importPopoverComponent.currentCount).toEqual(1);
                expect(importPopoverComponent.totalCount).toEqual(10);
            }, 0);

        });

        it('should dismiss the popup  and emit isDeleteChecked: true', () => {
            // arrange
            importPopoverComponent.deleteChecked = true;
            mockEventBusService.events = jest.fn(() => of({
                type: ContentEventType.IMPORT_COMPLETED,
                payload: {}
            }));
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn(() => {
                    importPopoverComponent.backButtonFunc = {
                        unsubscribe: jest.fn()
                    } as any
                })
            }as any
            // act
            importPopoverComponent.importInitiated();

            // assert
            setTimeout(() => {
                expect(mockPopoverController.dismiss).toHaveBeenCalledWith({isDeleteChecked: true});
            }, 0);
        });

        it('should dismiss the popup  and emit isDeleteChecked: false', () => {
            // arrange
            importPopoverComponent.deleteChecked = false;
            mockEventBusService.events = jest.fn(() => of({
                type: ContentEventType.IMPORT_COMPLETED,
                payload: {}
            }));
            importPopoverComponent.backButtonFunc = {
                unsubscribe: jest.fn()
            } as any
            // act
            importPopoverComponent.importInitiated();

            // assert
            setTimeout(() => {
                expect(mockPopoverController.dismiss).toHaveBeenCalledWith({isDeleteChecked: false});
            }, 0);
        });
    });

});
