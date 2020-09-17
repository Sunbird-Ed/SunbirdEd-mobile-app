import { SbPopoverComponent } from './sb-popover.component';
import { PopoverController, Platform, NavParams } from '@ionic/angular';
import { CommonUtilService } from '@app/services/common-util.service';
import { NgZone } from '@angular/core';
import { of } from 'rxjs';

describe('SbPopoverComponent', () => {
    let sbPopoverComponent: SbPopoverComponent;
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'actionsButtons':
                    value = [
                        {
                            btntext: 'OKAY',
                            btnClass: 'popover-color',
                            btnDisabled$: of([])
                        }
                    ];
                    break;
                case 'content':
                    value = {
                        identifier: 'identifier'
                    };
                    break;
                case 'sbPopoverDynamicContent':
                    value = of([]);
                    break;
                case 'sbPopoverDynamicMainTitle':
                    value = of([]);
                    break;
                case 'btnDisabled':
                    value = of([]);
                    break;
                case 'isChild':
                    value = true;
                    break;
                case 'handler':
                    value = () => {
                    };
                    break;
            }
            return value;
        })
    };

    const mockPlatform: Partial<Platform> = {
    };

    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn()
    };

    beforeAll(() => {
        sbPopoverComponent = new SbPopoverComponent(
            mockNavParams as NavParams,
            mockPlatform as Platform,
            mockNgZone as NgZone,
            mockPopOverController as PopoverController,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of SbInsufficientStoragePopupComponent', () => {
        expect(sbPopoverComponent).toBeTruthy();
    });

    it('should poulate all properties provided in navparams', () => {
        expect(sbPopoverComponent.actionsButtons).toBeDefined();
        expect(sbPopoverComponent.sbPopoverDynamicContent$).toBeDefined();
        expect(sbPopoverComponent.sbPopoverDynamicMainTitle$).toBeDefined();
    });

    describe('closePopOver()', () => {
        it('should close popover', () => {
            // arrange
            // act
            sbPopoverComponent.closePopover(true);
            // assert
            expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ closeDeletePopOver: true });
        });
    });

    describe('deleteContent()', () => {
        it('should invoke handler method passed by navparams', async (done) => {
            // arrange
            const btn = {
                isInternetNeededMessage: 'Message',
                btntext: 'button'
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            // act
            await sbPopoverComponent.deleteContent(true, btn);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toBeCalledWith(btn.isInternetNeededMessage);
                done();
            }, 0);
        });

        it('should close popover', async (done) => {
            // arrange
            const btn = {
                isInternetNeededMessage: 'Message',
                btntext: 'button'
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const handler = jest.fn();
            jest.spyOn(mockNavParams, 'get').mockReturnValue(handler);
            // act
            await sbPopoverComponent.deleteContent(false, btn);
            // assert
            setTimeout(() => {
                expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ canDelete: false });
                expect(handler).toBeCalledWith(btn.btntext);
                done();
            }, 0);
        });

        it('should test else condition', async () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            jest.spyOn(mockNavParams, 'get').mockReturnValue(undefined);
            // act
            await sbPopoverComponent.deleteContent();
            // assert
        });
    });

    describe('ionViewWillEnter()', () => {
        it('should dismiss the popup when backButton is clicked', () => {
            // arrange
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;

            const unsubscribeFn = jest.fn();
            sbPopoverComponent.backButtonFunc = {
                unsubscribe: unsubscribeFn
            } as any;
            // act
            sbPopoverComponent.ionViewWillEnter();
            // assert
            expect(mockPopOverController.dismiss).toHaveBeenCalled();
            expect(unsubscribeFn).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy()', () => {
        it('should else cases', () => {
            // arrange
            const unsubscribeFn = jest.fn();

            sbPopoverComponent.sbPopoverDynamicMainTitleSubscription = undefined;

            sbPopoverComponent.sbPopoverDynamicButtonDisabledSubscription = undefined;

            sbPopoverComponent.sbPopoverDynamicContentSubscription = undefined;

            sbPopoverComponent.backButtonFunc = undefined;

            // act
            sbPopoverComponent.ngOnDestroy();
            // assert
            expect(unsubscribeFn).toHaveBeenCalledTimes(0);
        });

        it('should unsubscribe all subscription', () => {
            // arrange
            const unsubscribeFn = jest.fn();

            sbPopoverComponent.sbPopoverDynamicMainTitleSubscription = {
                unsubscribe: unsubscribeFn
            } as any;

            sbPopoverComponent.sbPopoverDynamicButtonDisabledSubscription = {
                unsubscribe: unsubscribeFn
            } as any;

            sbPopoverComponent.sbPopoverDynamicContentSubscription = {
                unsubscribe: unsubscribeFn
            } as any;

            sbPopoverComponent.backButtonFunc = {
                unsubscribe: unsubscribeFn
            } as any;

            // act
            sbPopoverComponent.ngOnDestroy();
            // assert
            expect(unsubscribeFn).toHaveBeenCalledTimes(4);
        });
    });

});

describe('SbPopoverComponent', () => {
    let sbPopoverComponent: SbPopoverComponent;
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'actionsButtons':
                    value = [
                        {
                            btntext: 'OKAY',
                            btnClass: 'popover-color',
                            btnDisabled$: undefined
                        }
                    ];
                    break;
                case 'content':
                    value = undefined;
                    break;
                case 'sbPopoverDynamicContent':
                    value = undefined;
                    break;
                case 'sbPopoverDynamicMainTitle':
                    value = undefined;
                    break;
                case 'btnDisabled':
                    value = of([]);
                    break;
                case 'isChild':
                    value = false;
                    break;
                case 'handler':
                    value = () => {
                    };
                    break;
            }
            return value;
        })
    };

    const mockPlatform: Partial<Platform> = {
    };

    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn()
    };

    beforeAll(() => {
        sbPopoverComponent = new SbPopoverComponent(
            mockNavParams as NavParams,
            mockPlatform as Platform,
            mockNgZone as NgZone,
            mockPopOverController as PopoverController,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of SbInsufficientStoragePopupComponent', () => {
        expect(sbPopoverComponent.isChild).toBeFalsy();
        expect(sbPopoverComponent.sbPopoverDynamicMainTitle$).toBeFalsy();
        expect(sbPopoverComponent.sbPopoverDynamicContent$).toBeFalsy();
    });

});
