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
    let subscribeWithPriorityCallback;
    const mockBackBtnFunc = {unsubscribe: jest.fn()};
     const subscribeWithPriorityData = jest.fn((val, callback) => {
        subscribeWithPriorityCallback = callback;
        return mockBackBtnFunc;
    });
    const mockPlatform: Partial<Platform> = {
        backButton: {
            subscribeWithPriority: subscribeWithPriorityData,
        } 
    }as any;    
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
        it('should unsubscribe backButtonFunc', (done) => {
            // arrange
            toastNavigationComponent['backButtonFunc'] = {
                unsubscribe: jest.fn(),

            } as any;
            // act
            toastNavigationComponent.ngOnDestroy();
            // assert
            setTimeout(() => {
                expect(toastNavigationComponent['backButtonFunc'].unsubscribe).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('ionViewWillEnter', () =>{
        it('should unsubscribe backButtonFunc', () => {
            // arrange
            const mockBackBtnFunc = {unsubscribe: jest.fn()};
            const subscribeWithPriorityData = jest.fn((val, callback) => {
               subscribeWithPriorityCallback = callback;
               return mockBackBtnFunc;
           });
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            mockPopoverController.dismiss = jest.fn();
            // act
            toastNavigationComponent.ionViewWillEnter();
            // assert
            expect(subscribeWithPriorityData).toBeTruthy();
            setTimeout(() => {
                expect(mockPopoverController.dismiss).toHaveBeenCalled();
            }, 0);
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