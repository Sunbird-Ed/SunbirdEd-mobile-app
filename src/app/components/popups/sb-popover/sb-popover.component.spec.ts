import { SbPopoverComponent } from './sb-popover.component';
import { PopoverController, Platform, NavParams } from '@ionic/angular';
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

    const mockPlatform: Partial<Platform> = {};
    let subscribeWithPriorityCallback;
    const mockBackBtnFunc = {unsubscribe: jest.fn()};
    const subscribeWithPriorityData = jest.fn((val, callback) => {
        subscribeWithPriorityCallback = callback;
        return mockBackBtnFunc;
    });
    mockPlatform.backButton = {
        subscribeWithPriority: subscribeWithPriorityData,
    } as any;

    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn()) as any
    };

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    beforeAll(() => {
        sbPopoverComponent = new SbPopoverComponent(
            mockNavParams as NavParams,
            mockPlatform as Platform,
            mockNgZone as NgZone,
            mockPopOverController as PopoverController
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
        it('should invoke handler method passed by navparams', (done) => {
            // arrange
            const btn = {
                isInternetNeededMessage: 'Message',
                btntext: 'button'
            };
            // act
            sbPopoverComponent.deleteContent(true, btn);
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });

        it('should close popover', (done) => {
            // arrange
            const btn = {
                isInternetNeededMessage: 'Message',
                btntext: 'button'
            };
            const handler = jest.fn();
            jest.spyOn(mockNavParams, 'get').mockReturnValue(handler);
            // act
            sbPopoverComponent.deleteContent(false, btn);
            // assert
            setTimeout(() => {
                expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ canDelete: false });
                expect(handler).toBeCalledWith(btn.btntext);
                done();
            }, 0);
        });

        it('should test else condition', async () => {
            // arrange
            jest.spyOn(mockNavParams, 'get').mockReturnValue(undefined);
            // act
            await sbPopoverComponent.deleteContent();
            // assert
        });
    });

    describe('ionViewWillEnter()', () => {
        it('should dismiss the popup when backButton is clicked', () => {
            // arrange
            sbPopoverComponent.disableDeviceBackButton = false
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => Promise.resolve()),
            } as any;

            const unsubscribeFn = jest.fn(() => Promise.resolve());
            sbPopoverComponent.backButtonFunc = {
                unsubscribe: unsubscribeFn
            } as any;
            mockPopOverController.dismiss = jest.fn()
            // act
            sbPopoverComponent.ionViewWillEnter();
            // assert
            setTimeout(() => {
                // expect(mockPopOverController.dismiss).toHaveBeenCalled();
                // expect(unsubscribeFn).toHaveBeenCalled();
                // done()
            }, 0);
        });

        it('should not dismiss the popup when backButton is clicked', () => {
            // arrange
            sbPopoverComponent.disableDeviceBackButton = true;
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn(() => Promise.resolve())),
            } as any;

            const unsubscribeFn = jest.fn(() => Promise.resolve());
            sbPopoverComponent.backButtonFunc = {
                unsubscribe: unsubscribeFn
            } as any;
            mockPopOverController.dismiss = jest.fn()
            // act
            sbPopoverComponent.ionViewWillEnter();
            // assert
            // expect(mockPopOverController.dismiss).not.toHaveBeenCalled();
            setTimeout(() => {
                // expect(unsubscribeFn).not.toHaveBeenCalled();
                // done()
            }, 0);
        });
    });

    describe('ngOnDestroy()', () => {
        it('should else cases', (done) => {
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
            done()
        });
        it('should unsubscribe all subscription', (done) => {
            // arrange
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn(() => Promise.resolve())),
            } as any;

            const unsubscribeFn = jest.fn(() => Promise.resolve());
            sbPopoverComponent.backButtonFunc = {
                unsubscribe: unsubscribeFn
            } as any;

            sbPopoverComponent.sbPopoverDynamicMainTitleSubscription = {
                unsubscribe: unsubscribeFn
            } as any;

            sbPopoverComponent.sbPopoverDynamicButtonDisabledSubscription = {
                unsubscribe: unsubscribeFn
            } as any;

            sbPopoverComponent.sbPopoverDynamicContentSubscription = {
                unsubscribe: unsubscribeFn
            } as any;

            // act
            sbPopoverComponent.ngOnDestroy();
            // assert
            setTimeout(() => {
                expect(unsubscribeFn).toHaveBeenCalledTimes(4);
                done()
            }, 0);
        });
    });

});