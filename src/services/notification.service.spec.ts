import { NotificationService } from './notification.service';
import { UtilityService } from './utility-service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { TelemetryService } from '@project-sunbird/sunbird-sdk';
import { Events } from '@ionic/angular';

describe('LocalCourseService', () => {
  let notificationService: NotificationService;
  const mockTelemetryService: Partial<TelemetryService> = {
    updateCampaignParameters: jest.fn()
  };
  const mockUtilityService: Partial<UtilityService> = {};
  const mockFormnFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
  const mockAppVersion: Partial<AppVersion> = {
    getAppName: jest.fn(() => Promise.resolve('sunbird'))
  };
  const mockLocalNotifications: Partial<LocalNotifications> = {};
  const mockSplaschreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {};
  const mockEvents: Partial<Events> = {
    publish: jest.fn()
  };

  beforeAll(() => {
    notificationService = new NotificationService(
      mockTelemetryService as TelemetryService,
      mockUtilityService as UtilityService,
      mockFormnFrameworkUtilService as FormAndFrameworkUtilService,
      mockAppVersion as AppVersion,
      mockLocalNotifications as LocalNotifications,
      mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate,
      mockEvents as Events
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

  describe('setNotificationParams', () => {
    it('should set the External Url when notification type is ExternalId', (done) => {
      // arrange
      const data = { actionData: { actionType: 'extURL', deepLink: 'someLink' } };
      // act
      notificationService.setNotificationParams(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Update App', (done) => {
      // arrange
      const data = { actionData: { actionType: 'updateApp' } };
      mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('app_id'));
      // act
      notificationService.setNotificationParams(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Course Update', (done) => {
      // arrange
      const data = { actionData: { actionType: 'courseUpdate', identifier: 'courseId' } };
      // act
      notificationService.setNotificationParams(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Content Update', (done) => {
      // arrange
      const data = { actionData: { actionType: 'contentUpdate', identifier: 'contentId' } };
      // act
      notificationService.setNotificationParams(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Book Update', (done) => {
      // arrange
      const data = { actionData: { actionType: 'bookUpdate', identifier: 'bookId' } };
      // act
      notificationService.setNotificationParams(data);
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
      notificationService.setNotificationParams(data);
      notificationService.handleNotification();
      // assert
      expect(mockSplaschreenDeeplinkActionHandlerDelegate.navigateContent).toHaveBeenCalled();
    });

    it('should navigate playstore when Appid is set', () => {
      // arrange
      const data = { actionData: { actionType: 'updateApp' } };
      mockUtilityService.openPlayStore = jest.fn(() => Promise.resolve(undefined));
      // act
      notificationService.setNotificationParams(data);
      notificationService.handleNotification();
      // assert
      expect(mockUtilityService.openPlayStore).toHaveBeenCalled();
    });

    it('should open browser page when External url is set', () => {
      // arrange
      const data = { actionData: { actionType: 'extURL', deepLink: 'someLink' } };
      spyOn(window, 'open').and.stub();
      // act
      notificationService.setNotificationParams(data);
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
