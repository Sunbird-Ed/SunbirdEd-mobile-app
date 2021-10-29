import { ModalController } from '@ionic/angular';
import { ContentViewerComponent } from '../content-viewer/content-viewer.component';
import { StatusBar } from '@ionic-native/status-bar/ngx';

describe('ContentViewerComponent', () => {
    let contentViewerComponent: ContentViewerComponent;

    const mockScreenOrientation: Partial<ScreenOrientation> = {
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

});