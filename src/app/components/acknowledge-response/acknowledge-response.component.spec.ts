import { AcknowledgeResponseComponent } from './acknowledge-response.component';
import {
    CommonUtilService,
} from '../../../services';
describe('', () => {
    let acknowledgeResponseComponent: AcknowledgeResponseComponent;
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };

    beforeAll(() => {
        acknowledgeResponseComponent = new AcknowledgeResponseComponent(
            mockCommonUtilService
        );
    });

    describe('initialisation', () => {
        it('constructor initialisation', () => {
            // assert
            expect(acknowledgeResponseComponent).toBeTruthy();
        });
    });

    describe('ngOninit', () => {
        it('should initialize the appName', (done) => {
            // act
            acknowledgeResponseComponent.ngOnInit().then(() => {
                // assert
                expect(acknowledgeResponseComponent.appName).toEqual('Sunbird');
                done();
            });

        });
    });

    describe('ngDestroy', () => {
        it('should call emit', () => {
            // arrange
            acknowledgeResponseComponent.popupDismiss.emit = jest.fn();
            // act
            acknowledgeResponseComponent.ngOnDestroy();
            // assert
            expect(acknowledgeResponseComponent.popupDismiss.emit).toBeCalled();
        });
    });
});
