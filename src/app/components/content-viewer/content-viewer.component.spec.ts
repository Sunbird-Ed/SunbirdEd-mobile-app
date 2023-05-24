import { ModalController } from '@ionic/angular';
import { ContentViewerComponent } from '../content-viewer/content-viewer.component';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { promises } from 'dns';
import { of } from 'rxjs';

describe('ContentViewerComponent', () => {
    let contentViewerComponent: ContentViewerComponent;


    const mockScreenOrientation: Partial<ScreenOrientation> = {
        unlock: jest.fn(),
        ORIENTATIONS: {
            LANDSCAPE: 'LANDSCAPE',
            PORTRAIT: 'PORTRAIT' } as any,
        lock: jest.fn(() => Promise.resolve([]))

    };

    const mockStatusBar: Partial<StatusBar> = {
    };

    const mockModalController: Partial<ModalController> = {
    };

   

    beforeAll(() => {
        contentViewerComponent = new ContentViewerComponent(
            mockScreenOrientation as ScreenOrientation,
            mockStatusBar as StatusBar,
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
    it('should hide statusbar', () => {
        // arrange
        mockStatusBar.hide = jest.fn(); 
        // act
        contentViewerComponent.ngOnInit();
        // assert 
        setTimeout(() => {
            expect( mockStatusBar.hide).toHaveBeenCalled();
            expect( mockScreenOrientation.lock).toHaveBeenCalled();
        }, 0);
    });
});

describe('ionViewWillLeave', () => {
    it('should show statusbar', () => {
        // arrange
        mockStatusBar.show = jest.fn(); 
        // act
        contentViewerComponent.ionViewWillLeave();
        // assert 
        expect( mockStatusBar.show).toHaveBeenCalled();
        expect( mockScreenOrientation.unlock).toHaveBeenCalled();
        expect( mockScreenOrientation.lock).toHaveBeenCalled();
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
});