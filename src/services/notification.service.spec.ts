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
  const mockAppVersion: Partial<AppVersion> = {
    getAppName: jest.fn(() => Promise.resolve('sunbird'))
  };
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

  describe('setupLocalNotification', () => {
    it('should disabled localNotification', (done) => {
      // arrange
      const language = 'en';
      mockLocalNotifications.cancelAll = jest.fn(() => Promise.resolve({}));
      mockFormnFrameworkUtilService.getNotificationFormConfig = jest.fn(() => Promise.resolve([{
        code: 'localNotification',
        config: [{
          isEnabled: false,
          id: 1
        }]
      }]));
      mockLocalNotifications.getScheduledIds = jest.fn(() => Promise.resolve([1, 2, 3]));
      mockLocalNotifications.cancel = jest.fn(() => Promise.resolve({id: 1}));
      // act
      notificationService.setupLocalNotification(language);
      // assert
      setTimeout(() => {
        expect(mockLocalNotifications.cancelAll).toHaveBeenCalled();
        expect(mockFormnFrameworkUtilService.getNotificationFormConfig).toHaveBeenCalled();
        expect(mockLocalNotifications.getScheduledIds).toHaveBeenCalled();
        expect(mockLocalNotifications.cancel).toHaveBeenCalledWith(1);
        done();
      }, 0);
    });

    it('should invoked setLocalNotification() for ids', (done) => {
      // arrange
      const language = 'en';
      mockLocalNotifications.cancelAll = jest.fn(() => Promise.resolve({}));
      mockFormnFrameworkUtilService.getNotificationFormConfig = jest.fn(() => Promise.resolve([{
        code: 'localNotification',
        config: [{
          isEnabled: true,
          id: 2,
          title: JSON.stringify('hindi'),
          msg: JSON.stringify('hindi'),
          start: 'sample start'
        }]
      }]));
      mockLocalNotifications.getScheduledIds = jest.fn(() => Promise.resolve([3]));
      mockLocalNotifications.schedule = jest.fn();
      // act
      notificationService.setupLocalNotification(language);
      // assert
      setTimeout(() => {
        expect(mockLocalNotifications.cancelAll).toHaveBeenCalled();
        expect(mockFormnFrameworkUtilService.getNotificationFormConfig).toHaveBeenCalled();
        expect(mockLocalNotifications.getScheduledIds).toHaveBeenCalled();
        expect(mockLocalNotifications.schedule).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should invoked setLocalNotification() for ids is empty', (done) => {
      // arrange
      const language = 'en';
      mockLocalNotifications.cancelAll = jest.fn(() => Promise.resolve({}));
      mockFormnFrameworkUtilService.getNotificationFormConfig = jest.fn(() => Promise.resolve([{
        code: 'localNotification',
        config: [{
          isEnabled: true,
          id: 2,
          title: JSON.stringify('hindi'),
          msg: JSON.stringify('hindi'),
          start: 'dd/mm/yy 19:42:28 GMT+0530'
        }]
      }]));
      mockLocalNotifications.getScheduledIds = jest.fn(() => Promise.resolve([]));
      mockLocalNotifications.schedule = jest.fn();
      // act
      notificationService.setupLocalNotification(language);
      // assert
      setTimeout(() => {
        expect(mockLocalNotifications.cancelAll).toHaveBeenCalled();
        expect(mockFormnFrameworkUtilService.getNotificationFormConfig).toHaveBeenCalled();
        expect(mockLocalNotifications.getScheduledIds).toHaveBeenCalled();
        expect(mockLocalNotifications.schedule).toHaveBeenCalled();
        done();
      }, 0);
    });
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
