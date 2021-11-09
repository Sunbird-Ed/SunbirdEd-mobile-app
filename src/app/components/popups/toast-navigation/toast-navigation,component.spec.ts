import { NavParams, Platform, PopoverController } from '@ionic/angular';
import { ToastNavigationComponent } from './toast-navigation.component';


describe('ToastNavigationComponent', () => {
    let toastNavigationComponent: ToastNavigationComponent;
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'message':
                    value = [{id: 'sampleId', type: 'textbook'}];
                    break;
                case 'description':
                    value = [{id: 'sampleId', type: 'textbook'}];
                    break;
                case 'btnText':
                    value = [{id: 'sampleId', type: 'textbook'}];
                    break;
                };
            return value;
        })
    };

    const mockPlatform: Partial<Platform> = {};
    const mockPopoverController: Partial<PopoverController> = {};


beforeAll(() => {
    toastNavigationComponent = new ToastNavigationComponent(
      mockNavParams as NavParams,
      mockPlatform as Platform,
      mockPopoverController as PopoverController
    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

        it('Should instanciate ToastNavigationComponent', () => {
            expect(toastNavigationComponent).toBeTruthy();
        });

        describe('ngOnDestroy', () =>{
        it('should unsubscribe backButtonFunc', () => {
            // arrange
            toastNavigationComponent['backButtonFunc'] = {
                unsubscribe: jest.fn(),

            } as any;
            // act
            toastNavigationComponent.ngOnDestroy();
            // assert
            expect(toastNavigationComponent['backButtonFunc'].unsubscribe).toHaveBeenCalled();
        });
    });

    describe('ionViewWillEnter', () =>{
        it('should unsubscribe backButtonFunc', () => {
            // arrange
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            toastNavigationComponent['backButtonFunc'] = {
                unsubscribe: jest.fn(),

            } as any;
            mockPopoverController.dismiss = jest.fn();
            // act
            toastNavigationComponent.ionViewWillEnter();
            // assert
            expect(subscribeWithPriorityData).toBeTruthy();
            expect(mockPopoverController .dismiss).toHaveBeenCalled();
        });
    });

        it('should dismiss', () =>{
        //arrange
        mockPopoverController.dismiss = jest.fn();
        //act
        toastNavigationComponent.onSuccessClick();
        //assert
        expect(mockPopoverController .dismiss).toHaveBeenCalled();

        })

    });