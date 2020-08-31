import { CourseCompletionPopoverComponent } from './sb-course-completion-popup.component';
import { PopoverController, NavParams } from '@ionic/angular';
import { CommonUtilService } from '../../../../services';

describe('CourseCompletionPopoverComponent', () => {

    let courseCompletionPopoverComponent: CourseCompletionPopoverComponent;

    const mockPopOverCtrl: Partial<PopoverController> = {};
    const mockNavParams: Partial<NavParams> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};

    beforeAll(() => {
        courseCompletionPopoverComponent = new CourseCompletionPopoverComponent(
            mockPopOverCtrl as PopoverController,
            mockNavParams as NavParams,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of courseCompletionPopoverComponent', () => {
        expect(courseCompletionPopoverComponent).toBeTruthy();
    });

    it('ionViewWillEnter', () => {
        // arrange
        mockNavParams.get = jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'isCertified':
                    value = false;
                    break;
                case 'certificateDescription':
                    value = 'certificate description';
                    break;
            }
            return value;
        });
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };

        // act
        courseCompletionPopoverComponent.ionViewWillEnter();

        // assert
        expect(mockNavParams.get).toHaveBeenNthCalledWith(1, 'isCertified');
        expect(mockNavParams.get).toHaveBeenNthCalledWith(2, 'certificateDescription');
        expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
    });

    it('close', () => {
        // arrange
        mockPopOverCtrl.dismiss = jest.fn();

        // act
        courseCompletionPopoverComponent.close();

        // assert
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
    });
});
