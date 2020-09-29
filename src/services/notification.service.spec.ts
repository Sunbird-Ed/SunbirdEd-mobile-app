import { NotificationService } from './notification.service';
import { UtilityService } from './utility-service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';

describe('LocalCourseService', () => {
  let notificationService: NotificationService;

  const mockUtilityService: Partial<UtilityService> = {};
  const mockFormnFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
  const mockAppVersion: Partial<AppVersion> = {};
  const mockLocalNotifications: Partial<LocalNotifications> = {};
  const mockSplaschreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {};

  beforeAll(() => {
    notificationService = new NotificationService(
      mockUtilityService as UtilityService,
      mockFormnFrameworkUtilService as FormAndFrameworkUtilService,
      mockAppVersion as AppVersion,
      mockLocalNotifications as LocalNotifications,
      mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of NotificationService', () => {
    expect(notificationService).toBeTruthy();
  });

  describe('setNotificationDetails', () => {
    it('should set the External Url when notification type is ExternalId', (done) => {
      // arrange
      const data = { actionData: { actionType: 'extURL', deepLink: 'someLink' } };
      // act
      notificationService.setNotificationDetails(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Update App', (done) => {
      // arrange
      const data = { actionData: { actionType: 'updateApp' } };
      mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('app_id'));
      // act
      notificationService.setNotificationDetails(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Course Update', (done) => {
      // arrange
      const data = { actionData: { actionType: 'courseUpdate', identifier: 'courseId' } };
      // act
      notificationService.setNotificationDetails(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Content Update', (done) => {
      // arrange
      const data = { actionData: { actionType: 'contentUpdate', identifier: 'contentId' } };
      // act
      notificationService.setNotificationDetails(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Book Update', (done) => {
      // arrange
      const data = { actionData: { actionType: 'bookUpdate', identifier: 'bookId' } };
      // act
      notificationService.setNotificationDetails(data);
      // asset
      done();
    });
  });

  describe('handleNotification', () => {
    it('should navigate to contents page when contentId is set', () => {
      // arrange
      const data = { actionData: { actionType: 'contentUpdate', identifier: 'contentId' } };
      mockSplaschreenDeeplinkActionHandlerDelegate.navigateContent = jest.fn();
      // act
      notificationService.setNotificationDetails(data);
      notificationService.handleNotification();
      // assert
      expect(mockSplaschreenDeeplinkActionHandlerDelegate.navigateContent).toHaveBeenCalled();
    });

    it('should navigate playstore when Appid is set', () => {
      // arrange
      const data = { actionData: { actionType: 'updateApp' } };
      mockUtilityService.openPlayStore = jest.fn(() => Promise.resolve(undefined));
      // act
      notificationService.setNotificationDetails(data);
      notificationService.handleNotification();
      // assert
      expect(mockUtilityService.openPlayStore).toHaveBeenCalled();
    });

    it('should open browser page when External url is set', () => {
      // arrange
      const data = { actionData: { actionType: 'extURL', deepLink: 'someLink' } };
      spyOn(window, 'open').and.stub();
      // act
      notificationService.setNotificationDetails(data);
      notificationService.handleNotification();
      // assert
      expect(window.open).toHaveBeenCalledWith('someLink');
    });

    it('should skip if ids are not set', (done) => {
      // arrange
      // act
      notificationService.handleNotification();
      // assert
      done();
    });
  });



});
