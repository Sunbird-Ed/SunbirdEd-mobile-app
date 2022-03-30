import { Platform } from '@ionic/angular';
import { QRScannerAlert } from './qrscanner-alert.page';

describe('QRScannerAlert', () => {
    let qrscannerAlert : QRScannerAlert;
    const mockPlatform: Partial<Platform> = {};

    beforeAll(() => {
        qrscannerAlert = new QRScannerAlert(
            mockPlatform as Platform
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
    it('Should create instatance', () => {
        qrscannerAlert['cancelKey'] = 'hide';
        expect(qrscannerAlert).toBeTruthy();
        expect(qrscannerAlert.cancelKey).toEqual('hide');
    });

    describe('tryAgain', () => {
        it('should not invoke tryAgain() of callback', () => {
            // arrange
            qrscannerAlert.callback = null;
            // act
            qrscannerAlert.tryAgain();
            // assert
            expect(qrscannerAlert.callback).toBeFalsy();
        });

        it('should invoke tryAgain() of callback', () => {
            // arrange
            qrscannerAlert.callback = {
                tryAgain: jest.fn(),
                cancel: jest.fn()
            };
            // act
            qrscannerAlert.tryAgain();
            // assert
            expect(qrscannerAlert.callback.tryAgain).toHaveBeenCalled();
        });
    });

    describe('cancel', () => {
        it('should not invoke cancel() of callback', () => {
            // arrange
            qrscannerAlert.callback = null;
            // act
            qrscannerAlert.cancel();
            // assert
            expect(qrscannerAlert.callback).toBeFalsy();
        });

        it('should invoke cancel() of callback', () => {
            // arrange
            qrscannerAlert.callback = {
                tryAgain: jest.fn(),
                cancel: jest.fn()
            }
            // act
            qrscannerAlert.cancel();
            // assert
            expect(qrscannerAlert.callback.cancel).toHaveBeenCalled();
        });
    });
});