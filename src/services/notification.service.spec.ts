import { NotificationService } from './notification.service';
import { UtilityService } from './utility-service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { TelemetryService, NotificationService as SdkNotificationService, GroupService, ProfileService, ContentService } from '@project-sunbird/sunbird-sdk';
import { Events } from '@app/util/events';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Event, Router } from '@angular/router';
import { NotificationServiceV2 } from '@project-sunbird/sunbird-sdk/notification-v2/def/notification-service-v2';
import { NavigationService } from './navigation-handler.service';
import { of } from 'rxjs';
import { CommonUtilService } from './common-util.service';

describe('LocalCourseService', () => {
  let notificationService: NotificationService;
  const mockTelemetryService: Partial<TelemetryService> = {
    updateCampaignParameters: jest.fn()
  };
  const mockGroupService: Partial<GroupService> = {};
  const mockProfileService: Partial<ProfileService> = {};
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
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockSdkNotificationService: Partial<SdkNotificationService> = {};
  const mockRouter: Partial<Router> = {
    navigate: jest.fn()
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
    showToast: jest.fn()
  };
  const mockNotificationServiceV2: Partial<NotificationServiceV2> = {};
  const mockNavigationService: Partial<NavigationService> = {
    navigateToTrackableCollection: jest.fn(),
    navigateTo: jest.fn(),
    navigateToDetailPage: jest.fn()
  };
  const mockContentService: Partial<ContentService> = {};  

  beforeAll(() => {
    notificationService = new NotificationService(
      mockTelemetryService as TelemetryService,
      mockNotificationServiceV2 as NotificationServiceV2,
      mockGroupService as GroupService,
      mockProfileService as ProfileService,
      mockContentService as ContentService,
      mockUtilityService as UtilityService,
      mockFormnFrameworkUtilService as FormAndFrameworkUtilService,
      mockAppVersion as AppVersion,
      mockLocalNotifications as LocalNotifications,
      mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockRouter as Router,
      mockEvents as Events,
      mockNavigationService as NavigationService,
      mockCommonUtilService as CommonUtilService 
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
      const data = { action: { type: 'extURL', additionalInfo:{ deepLink: 'someLink' } } };
      // act
      notificationService.setNotificationParams(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Update App', (done) => {
      // arrange
      const data = {  action: { type: 'updateApp' } };
      mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('app_id'));
      // act
      notificationService.setNotificationParams(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Course Update', (done) => {
      // arrange
      const data = {  action: { type: 'courseUpdate', additionalInfo:{ identifier: 'courseId' } }};
      // act
      notificationService.setNotificationParams(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Content Update', (done) => {
      // arrange
      const data = {  action: { type: 'contentUpdate', additionalInfo:{ identifier: 'contentId' }} };
      // act
      notificationService.setNotificationParams(data);
      // asset
      done();
    });

    it('should set the External Url when notification type is Book Update', (done) => {
      // arrange
      const data = {  action: { type: 'bookUpdate', additionalInfo:{ identifier: 'bookId' }} };
      // act
      notificationService.setNotificationParams(data);
      // asset
      done();
    });
  });

  describe('handleNotification', () => {
    it('should navigate to contents page when contentId is set', () => {
      // arrange
      const data = {  action: { type: 'contentUpdate', additionalInfo:{ identifier: 'contentId' }} };
      mockSplaschreenDeeplinkActionHandlerDelegate.navigateContent = jest.fn();
      // act
      notificationService.setNotificationParams(data);
      notificationService.handleNotification();
      // assert
      expect(mockSplaschreenDeeplinkActionHandlerDelegate.navigateContent).toHaveBeenCalled();
    });

    it('should navigate playstore when Appid is set', () => {
      // arrange
      const data = {action: { type: 'updateApp' } };
      mockUtilityService.openPlayStore = jest.fn(() => Promise.resolve(undefined));
      // act
      notificationService.setNotificationParams(data);
      notificationService.handleNotification();
      // assert
      expect(mockUtilityService.openPlayStore).toHaveBeenCalled();
    });

    it('should open browser page when External url is set', () => {
      // arrange
      const data = { action: { type: 'extURL', additionalInfo:{ deepLink: 'someLink' } } };
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

  describe('redirectNotification', () => {
    it('should redirect to apprpriate page onclick of notification', () => {
      // arrange
      const notification = {
        id: 'some-id',
        action: {
          additionalInfo: {
            group: {
              id: 'some-id'
            }
          },
          type: 'member-added'
        }
      }
      // action
      notificationService.redirectNotification(notification)
      // assert
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should redirect to appropriate page onclick of notification', (done) => {
      // arrange
      const notification = {
        id: 'some-id',
        action: {
          additionalInfo: {
            group: {
              id: 'some-id'
            },
            activity: {
              type: 'course',
              id: 'some-id'
            }
          },
          type: 'group-activity-added'
        }
      };
      const groupDetails = {
        activitiesGrouped: [
          {
            title: 'course',
            items: [
              {
                id: 'some-id',
                activityInfo: {
                  id: 'activity-id'
                }
              }
            ]
          }
        ]
      } as any
      mockGroupService.getById = jest.fn(() => of(groupDetails));
      // action
      notificationService.redirectNotification(notification)
      // assert
      setTimeout(() => {
        expect(mockGroupService.getById).toHaveBeenCalled()
        expect(mockNavigationService.navigateToDetailPage).toHaveBeenCalled();
        done()
      });
    });

  })



});
