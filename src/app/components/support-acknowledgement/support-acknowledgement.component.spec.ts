import {SupportAcknowledgement} from './support-acknowledgement.component';
import {TranslateService} from '@ngx-translate/core';

describe('SupportAcknowledgement', () => {
    let supportAcknowledgement: SupportAcknowledgement;
    const mockTranslateService: Partial<TranslateService> = {};
    beforeAll(() => {
        supportAcknowledgement = new SupportAcknowledgement(
            mockTranslateService as any
        );
    });

    describe('initialise', () => {
        it('constructor initialisation', () => {
            // assert
            expect(supportAcknowledgement).toBeTruthy();
        });
    });

    describe('openDialpad', () => {
        it('should call open', () => {
            // arrange
            window.open = jest.fn();
            // act
            supportAcknowledgement.boardContact = {
                contactinfo: {
                    number: '92739821734'
                }
            };
            supportAcknowledgement.openDialpad();
            // assert
            expect(window.open).toBeCalled();
        });
    });

    describe('close popup', () => {
        it('should emit an event to close popup', () => {
            supportAcknowledgement.closeEvents = {emit : jest.fn()};
            // act
            supportAcknowledgement.close();

            // assert
            expect(supportAcknowledgement.closeEvents.emit).toHaveBeenCalledWith(true);
        });
    });
});
