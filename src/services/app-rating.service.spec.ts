import { AppRatingService } from './app-rating.service';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { PreferenceKey, StoreRating } from '../app/app.constant';
import { of } from 'rxjs';

describe('AppRatingService', () => {
    let appRatingService: AppRatingService;

    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFile: Partial<File> = {};

    beforeAll(() => {
        appRatingService = new AppRatingService(
            mockSharedPreferences as SharedPreferences,
            mockFile as File
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of AppRatingService', () => {
        // assert
        expect(appRatingService).toBeTruthy();
    });

    describe('checkInitialDate', () => {
        it('should set intitial date if not set', (done) => {
            // arragne
            mockSharedPreferences.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.APP_RATING_DATE:
                        value = undefined;
                        break;
                }
                return of(value);
            });
            mockSharedPreferences.putString = jest.fn(() => of(undefined));

            // act
            appRatingService.checkInitialDate();

            // assert
            setTimeout(() => {
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.APP_RATING_DATE);
                // expect(mockSharedPreferences.putString).toBeCalledWith(PreferenceKey.APP_RATING_DATE, '');
                done();
            }, 0);
        });

        it('should not intitial date if already set', (done) => {
            // arragne
            mockSharedPreferences.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.APP_RATING_DATE:
                        value = 'some_date';
                        break;
                }
                return of(value);
            });

            // act
            appRatingService.checkInitialDate();

            // assert
            setTimeout(() => {
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.APP_RATING_DATE);
                done();
            }, 0);
        });
    });

    it('setEndStoreRate', (done) => {
        // arrange
        mockFile.createDir = jest.fn(() => (Promise.resolve(undefined)));
        mockFile.writeFile = jest.fn(() => (Promise.resolve(undefined)));

        // act
        appRatingService.setEndStoreRate(1);

        // assert
        setTimeout(() => {
            expect(mockFile.createDir).toHaveBeenCalledWith(undefined, StoreRating.FOLDER_NAME, true);
            expect(mockFile.writeFile).toHaveBeenCalledWith(
                undefined + '/' + StoreRating.FOLDER_NAME,
                StoreRating.FILE_NAME, StoreRating.FILE_TEXT + ' = ' + 1,
                { replace: true }
            );
            done();
        }, 0);
    });

    describe('rateLaterClickedCount', () => {
        it('should set increaseRateLaterClickedCount to 1 if not set', (done) => {
            // arragne
            mockSharedPreferences.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.APP_RATE_LATER_CLICKED:
                        value = undefined;
                        break;
                }
                return of(value);
            });
            mockSharedPreferences.putString = jest.fn(() => of(undefined));

            // act
            appRatingService.rateLaterClickedCount();

            // assert
            setTimeout(() => {
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.APP_RATE_LATER_CLICKED);
                expect(mockSharedPreferences.putString).toBeCalledWith(PreferenceKey.APP_RATE_LATER_CLICKED, '1');
                done();
            }, 0);
        });

        it('should set increaseRateLaterClickedCount to +1 if set', (done) => {
            // arragne
            mockSharedPreferences.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.APP_RATE_LATER_CLICKED:
                        value = 2;
                        break;
                }
                return of(value);
            });
            mockSharedPreferences.putString = jest.fn(() => of(undefined));

            // act
            appRatingService.rateLaterClickedCount();

            // assert
            setTimeout(() => {
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.APP_RATE_LATER_CLICKED);
                expect(mockSharedPreferences.putString).toBeCalledWith(PreferenceKey.APP_RATE_LATER_CLICKED, '3');
                done();
            }, 0);
        });
    });

});
