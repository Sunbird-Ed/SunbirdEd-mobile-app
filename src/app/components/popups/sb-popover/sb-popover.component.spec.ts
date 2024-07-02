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

    const mockPlatform: Partial<Platform> = {
    };

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
            setTimeout(() => {
                expect(unsubscribeFn).toHaveBeenCalled();
            }, 0);
        });

        it('should not dismiss the popup when backButton is clicked', () => {
            // arrange
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;
            sbPopoverComponent.disableDeviceBackButton = true;
            const unsubscribeFn = jest.fn();
            sbPopoverComponent.backButtonFunc = {
                unsubscribe: unsubscribeFn
            } as any;
            // act
            sbPopoverComponent.ionViewWillEnter();
            // assert
            expect(mockPopOverController.dismiss).not.toHaveBeenCalled();
            expect(unsubscribeFn).not.toHaveBeenCalled();
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