import { AcknowledgeResponseComponent } from './acknowledge-response.component';

describe('', () => {
    let acknowledgeResponseComponent: AcknowledgeResponseComponent;
    const mockAcknowledgeResponseComponent: Partial<AcknowledgeResponseComponent> = {};

    beforeAll(() => {
        acknowledgeResponseComponent = new AcknowledgeResponseComponent(
            mockAcknowledgeResponseComponent as any
        );
    });

    describe('initialisation', () => {
        it('constructor initialisation', () => {
            // assert
            expect(acknowledgeResponseComponent).toBeTruthy();
        }) 
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