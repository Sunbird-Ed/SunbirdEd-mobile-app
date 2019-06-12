import {
  sharedPreferencesMock,
  fileMock
} from '../__tests__/mocks';
import {AppRatingService} from './app-rating.service';
import {Observable} from "rxjs";

describe('AppRatingService', () => {
  let appRatingService: AppRatingService;
  beforeEach(() => {
    appRatingService = new AppRatingService(
      sharedPreferencesMock as any, fileMock as any
    );
    jest.resetAllMocks();
  });

  it('should Load Instance at the beginning', () => {
    expect(appRatingService).toBeTruthy();
  });

  xit('should check initialDate from sharedPreferences if value not present calls setInitialDate', (done) => {
    // arrange
    sharedPreferencesMock.getString.mockImplementation((key: string) => {
      if (key === undefined) {
        return Observable.of('app_rating_date');
      }
      return Observable.of('');
    });
    // act
    appRatingService.checkInitialDate();
    // assert
    setTimeout(() => {
      expect(sharedPreferencesMock.getString).toHaveBeenCalledWith('app_rating_date');
      done();
    }, 0);
  });
  it('should trigger FileCtrl.writeFile() when writeFile() is called', () => {
    // arrange
    fileMock.writeFile.mockResolvedValue(true);
    // act
    appRatingService.writeFile('SAMPLE_FILE');
    // assert
    expect(fileMock.writeFile).toHaveBeenCalledWith("undefined/sunbird-app-rating", "app-rating.doc", "APP-Rating = SAMPLE_FILE", {"replace": true});
  });

  it('should trigger readAsText() when checkReadFile() is called', () => {
    // arrange
    fileMock.readAsText.mockResolvedValue(true);
    // act
    appRatingService.checkReadFile();
    // assert
    expect(fileMock.readAsText).toHaveBeenCalledWith("undefined/sunbird-app-rating", "app-rating.doc");
  });

  it('should check for rateLaterCount when rateLaterClickedCount() is triggered', () => {
    // arrange
    spyOn(appRatingService, 'checkRateLaterCount').and.returnValue(0);
    // act
    appRatingService.rateLaterClickedCount();
    // assert
    expect(appRatingService['rateLaterClickCount']).toEqual(0);
  });

  it('should put value in Preference when increaseRateLaterClickedCount() is called', (done) => {
    // arrange
    sharedPreferencesMock.putString.mockImplementation((key: string) => {
      if (key === 'app_rate_later_clicked') {
        return Observable.of("1");
      }
      return Observable.of('');
    });
    // act
    appRatingService.increaseRateLaterClickedCount(1);
    // assert
    setTimeout(() => {
      expect(sharedPreferencesMock.putString).toHaveBeenCalledWith('app_rate_later_clicked', "1");
      done();
    }, 0);
  });

  it('should getString() and if value is present calls increaseRateLaterClickedCount() and return update value', (done) => {
    // arrange
    sharedPreferencesMock.getString.mockImplementation((key: string) => {
      if (key === 'app_rate_later_clicked') {
        return Observable.of('1');
      }
      return Observable.of('');
    });
    spyOn(appRatingService, 'increaseRateLaterClickedCount').and.returnValue('1');
    // act
    appRatingService.checkRateLaterCount();
    // assert
    setTimeout(() => {
      expect(sharedPreferencesMock.getString).toHaveBeenCalledWith('app_rate_later_clicked');
      expect(appRatingService.increaseRateLaterClickedCount).toHaveBeenCalled();
      done();
    }, 0);
  });

  it('should call getString from preference and if value is undefined calls increaseRateLaterCount & increases it', (done) => {
    // arrange
    sharedPreferencesMock.getString.mockImplementation((key: string) => {
      if (key === undefined) {
        return Observable.of(undefined);
      }
      return Observable.of('2');
    });
    spyOn(appRatingService, 'increaseRateLaterClickedCount').and.returnValue('2');
    // act
    appRatingService.checkRateLaterCount();
    // assert
    setTimeout(() => {
      expect(sharedPreferencesMock.getString).toHaveBeenCalledWith('app_rate_later_clicked');
      expect(appRatingService.increaseRateLaterClickedCount).toHaveBeenCalledWith(3);
      done();
    });
  });
});
