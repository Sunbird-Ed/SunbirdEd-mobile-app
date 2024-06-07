import { ModalController } from '@ionic/angular';
import { ContentViewerComponent } from '../content-viewer/content-viewer.component';
import { of } from 'rxjs';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';

jest.mock('@capacitor/screen-orientation', () => {
    return {
      ...jest.requireActual('@capacitor/screen-orientation'), // Use actual implementation for other properties
      ScreenOrientation: {
        unlock: jest.fn(),
        lock: jest.fn()
      } // Mocking ScreenOrientation to simulate its unavailability
    };
});

jest.mock('@capacitor/status-bar', () => {
    return {
      ...jest.requireActual('@capacitor/status-bar'), // Use actual implementation for other properties
      StatusBar: {
        hide: jest.fn(),
        show: jest.fn()
      }
    };
});

describe('ContentViewerComponent', () => {
    let contentViewerComponent: ContentViewerComponent;

    const mockModalController: Partial<ModalController> = {};

    beforeAll(() => {
        contentViewerComponent = new ContentViewerComponent(
            mockModalController as ModalController
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of contentViewerComponent', () => {
        expect(contentViewerComponent).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should hide statusbar', (done) => {
            // arrange
            ScreenOrientation.lock = jest.fn(fn => Promise.resolve()) as any
            StatusBar.hide = jest.fn(() => Promise.resolve()) as any
            // act
            contentViewerComponent.ngOnInit();
            // assert 
            setTimeout(() => {
                expect(StatusBar.hide).toHaveBeenCalled();
                expect(ScreenOrientation.lock).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('ionViewWillLeave', () => {
        it('should show statusbar', () => {
            // arrange
            StatusBar.show = jest.fn(); 
            // act
            contentViewerComponent.ionViewWillLeave();
            // assert 
            expect(StatusBar.show).toHaveBeenCalled();
            expect(ScreenOrientation.unlock).toHaveBeenCalled();
        });
    });


    describe('eventHandler', () => {
        it('if event equals exit', () =>{
            //arrange
            mockModalController.dismiss = jest.fn(() => of(undefined)) as any;
            const event = 'EXIT';
            // act
            contentViewerComponent.eventHandler(event);
            // assert 
            expect( mockModalController.dismiss).toHaveBeenCalled();
        })

        it('if event type equals exit', () =>{
            //arrange
            mockModalController.dismiss = jest.fn(() => of(undefined)) as any;
            const event = {
                edata : {
                    type : 'EXIT'
                }
            }
            // act
            contentViewerComponent.eventHandler(event);
            // assert 
            expect( mockModalController.dismiss).toHaveBeenCalled();
        })

        it('if event not equals exit', async () =>{
            //arrange
            const event = {
                edata : {
                    type : ''
                }
            }
            // act
            const data = await contentViewerComponent.eventHandler(event);
            // assert 
            setTimeout(() => {
                expect( data ).toBe({});
            }, 0);
        })
    });

    describe('playWebVideoContent', () => {
        it('should playWebVideoContent, event listener', () => {
            // arrange
            contentViewerComponent.playerConfig = {
                content: {},
                config: {},
                metadata: {}
            }
            contentViewerComponent.video = {
                nativeElement: {
                    append: jest.fn()
                }
            }
            const ele = {
                setAttribute: jest.fn(), 
                addEventListener: jest.fn((_, f1) => f1({ detail: {edata: {}}}))
            }
            document.createElement = jest.fn(() => {return ele}) as any,
            // act
            contentViewerComponent.playWebVideoContent()
            // assert
        })

        it('should playWebVideoContent, event listener, else case', () => {
            // arrange
            contentViewerComponent.playerConfig = {
                content: {},
                config: {},
                metadata: {}
            }
            contentViewerComponent.video = {
                nativeElement: {
                    append: jest.fn()
                }
            }
            const ele = {
                setAttribute: jest.fn(), 
                addEventListener: jest.fn((_, f1) => f1({ }))
            }
            document.createElement = jest.fn(() => {return ele}) as any,
            // act
            contentViewerComponent.playWebVideoContent()
            // assert
        })

        it('should playWebVideoContent, else case', () => {
            // arrange
            contentViewerComponent.playerConfig = ''
            contentViewerComponent.video = {
                nativeElement: {
                    append: jest.fn()
                }
            }
            // act
            contentViewerComponent.playWebVideoContent()
            // assert
        })
    })
});