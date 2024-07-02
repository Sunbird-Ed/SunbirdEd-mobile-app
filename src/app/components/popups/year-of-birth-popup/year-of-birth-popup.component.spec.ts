import { NavParams, PopoverController } from '@ionic/angular';
import { YearOfBirthPopupComponent } from './year-of-birth-popup.component';
import { ProfileService } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService} from '../../../../services';
import { of, throwError } from 'rxjs';

describe('YearOfBirthPopupComponent', () => {
    let yearOfBirthPopupComponent: YearOfBirthPopupComponent;
    const mockNavParams: Partial<NavParams> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockPopOverCtrl: Partial<PopoverController> = {};
    const mockProfileService: Partial<ProfileService> = {};

    beforeAll(() => {
        yearOfBirthPopupComponent = new YearOfBirthPopupComponent(
            mockProfileService as ProfileService,
            mockPopOverCtrl as PopoverController,
            mockNavParams as NavParams,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of yearOfBirthPopupComponent', () => {
        expect(yearOfBirthPopupComponent).toBeTruthy();
    });

    it('should return list of year', () => {
        yearOfBirthPopupComponent.ngOnInit();
        const yearsLength = yearOfBirthPopupComponent.birthYearOptions.length;
        expect(yearsLength).toBeGreaterThan(100);
    });

    describe('submit', () => {
        it('should return success message for profile update', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockNavParams.get = jest.fn(() => ({ uid: 'sample-uid'})) as any
            yearOfBirthPopupComponent.selectedYearOfBirth = 2021;
            mockProfileService.updateServerProfile = jest.fn(() => of({
                body: {
                    result: {
                        response: 'SUCCESS',
                        error: {}
                    }
                }
            }));
            mockPopOverCtrl.dismiss = jest.fn();
            // act
            yearOfBirthPopupComponent.submit();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(mockNavParams.get).toHaveBeenCalled();
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return error message for profile update', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockNavParams.get = jest.fn(() => ({ uid: 'sample-uid'})) as any
            yearOfBirthPopupComponent.selectedYearOfBirth = 2021;
            mockProfileService.updateServerProfile = jest.fn(() => throwError({
               error: {err: 'FAILED'}
            }));
            mockPopOverCtrl.dismiss = jest.fn();
            // act
            yearOfBirthPopupComponent.submit();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(mockNavParams.get).toHaveBeenCalled();
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
});