import { NotificationService } from './notification.service';
import { UtilityService } from './utility-service';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { TelemetryService, NotificationService as SdkNotificationService, GroupService, ProfileService, ContentService } from '@project-sunbird/sunbird-sdk';
import { Events } from '../util/events';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Event, Router } from '@angular/router';
import { NotificationServiceV2 } from '@project-sunbird/sunbird-sdk/notification-v2/def/notification-service-v2';
import { NavigationService } from './navigation-handler.service';
import { of, throwError } from 'rxjs';
import { CommonUtilService } from './common-util.service';
import { RouterLinks } from '../app/app.constant';

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
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateInteractTelemetry: jest.fn()
  };
  const mockSdkNotificationService: Partial<SdkNotificationService> = {};
  const mockRouter: Partial<Router> = {
    navigate: jest.fn()
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
    showToast: jest.fn()
  };
  const mockNotificationServiceV2: Partial<NotificationServiceV2> = {
    notificationDelete: jest.fn(),
    notificationUpdate: jest.fn(() => of())
  };
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

  describe('fetchNotificationList', () => {
    it('should fetchNotificationList', (done) => {
      // arrange
      mockProfileService.getActiveSessionProfile = jest.fn(() => of({}))
      mockNotificationServiceV2.notificationRead = jest.fn(() => of({}))
      // act
      notificationService.fetchNotificationList()
      // assert
      setTimeout(() => {
        expect(mockNotificationServiceV2.notificationRead).toHaveBeenCalled();
        done();
      }, 0);
    })
  })

  describe('handleNotificationClick', () => {
    it('should handle Notification Click return if no data action', () => {
      // arrange
      const notifData = {
        event: "" as any,
        data: {
          id: "someId",
          actionData: {
              identifier: "someIdentifier",
              deepLink: [],
              contentURL: "content url",
              openPlayer: true
          },
        }
      }
      jest.spyOn(notificationService, 'updateNotification').mockImplementation();
      // act
      notificationService.handleNotificationClick(notifData)
      // assert
    })
    it('should handle Notification Click', () => {
      // arrange
      const notifData = {
        event: "" as any,
        data: {
          id: "someId",
          actionData: {
              identifier: "someIdentifier",
              deepLink: [],
              contentURL: "content url",
              openPlayer: true
          },
          action: {
            category: "someCategory",
            deepLink: []
          }
        }
      }
      jest.spyOn(notificationService, 'updateNotification').mockImplementation();
      // act
      notificationService.handleNotificationClick(notifData)
      // assert
    })
  })

  describe('deleteNotification', () => {
    it('should delete Notification', (done) => {
      // arrange
      const notif = {
        data: {
          id: "someId",
          actionData: {
              identifier: "someIdentifier",
              deepLink: [],
              contentURL: "content url",
              openPlayer: true
          },
          action: {
            category: "some_category"
          }
        }
      }
      mockNotificationServiceV2.notificationDelete = jest.fn(() => of());
      mockEvents.publish = jest.fn(() => of())
      // act
      notificationService.deleteNotification(notif)
      // assert
      setTimeout(() => {
        done();
      }, 0);
    })
    it('should catch error on delete Notification', (done) => {
      // arrange
      const notif = {
        data: {
          id: "someId",
          actionData: {
              identifier: "someIdentifier",
              deepLink: [],
              contentURL: "content url",
              openPlayer: true
          },
          action: {
            category: "some_category"
          }
        }
      }
      mockNotificationServiceV2.notificationDelete = jest.fn(() => throwError({error:"SOMETHING_WENT_WRONG"}));
      // act
      notificationService.deleteNotification(notif)
      // assert
      setTimeout(() => {
        done();
      }, 0);
    })
  })

  describe('clearAllNotifications', () => {
    it('should clear AllNotifications', (done) => {
      // arrange
      const notifData = {
        event: "" as any, 
        data: [{
          id: "someId",
          userId: "someUserId",
          action: {
            category: "someCategory"
          }
        }]
      }
      mockNotificationServiceV2.notificationDelete = jest.fn(() => of());
      mockEvents.publish = jest.fn();
      // act
      notificationService.clearAllNotifications(notifData)
      // assert
      setTimeout(() => {
        done();
      }, 0);
    })
    it('should catch error on clear AllNotifications', (done) => {
      // arrange
      const notifData = {
        event: "" as any, 
        data: [{
          id: "someId",
          userId: "someUserId",
          action: {
            category: "someCategory"
          }
        }]
      }
      mockNotificationServiceV2.notificationDelete = jest.fn(() => throwError({error: "SOMETHING_WENT_WRONG"}));
      mockEvents.publish = jest.fn();
      // act
      notificationService.clearAllNotifications(notifData)
      // assert
      setTimeout(() => {
        done();
      }, 0);
    })
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
          start: 'sample start',
          interval: "some_interval",
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

    it('should invoked setLocalNotification() for ids on undefined satrt case', (done) => {
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
          start: '',
          interval: 123
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

    it('should invoked setLocalNotification() for undefined title and msg to catch error case', (done) => {
      // arrange
      const language = 'en';
      mockLocalNotifications.cancelAll = jest.fn(() => Promise.resolve({}));
      mockFormnFrameworkUtilService.getNotificationFormConfig = jest.fn(() => Promise.resolve([{
        code: 'localNotification',
        config: [{
          isEnabled: true,
          id: 2,
          start: 'dd/mm/yy 19:42:28 GMT+0530',
          occurance: 2
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
          title: 'hindi',
          msg: 'hindi',
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

    it('should invoked setLocalNotification() for payloads and language is empty', (done) => {
      // arrange
      const language = '';
      const payload = true;
      mockLocalNotifications.getScheduledIds = jest.fn(() => Promise.resolve([]));
      mockLocalNotifications.schedule = jest.fn();
      // act
      notificationService.setupLocalNotification(language, payload);
      // assert
      setTimeout(() => {
        done();
      }, 0);
    });
  });

  describe('setNotificationParams', () => {
    it('should set action type if the action data present when type is contentURL', (done) => {
      // arrange
      const data = { actionData: { actionType: 'contentURL', contentURL: "some_URL" } };
      // act
      notificationService.setNotificationParams(data);
      // assert
      done();
    })
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
    it('should set the search option and navigate to category list', (done) => {
      // arrange
      const data = { actionData:{actionType: "search", options: {filter: "", facets: ""}}};
      mockContentService.formatSearchCriteria = jest.fn(() => {}) as any
      const params = {
        formField: {
          facet:"",
          facets: "",
          filter: "",
          searchCriteria: undefined
        },
        fromLibrary: false
      };
      mockRouter.navigate = jest.fn();
      // act
      notificationService.setNotificationParams(data);
      // assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.CATEGORY_LIST], { state: params })
      done();
    })
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
     jest.spyOn(window, 'open').mockImplementation();
      // act
      notificationService.setNotificationParams(data);
      notificationService.handleNotification();
      // assert
      expect(window.open).toHaveBeenCalledWith('someLink');
    });
    it('should handle deeplink content url', (done) => {
      //arrange
      const data = {actionData: {contentUrl : "some_url"}};
      mockSplaschreenDeeplinkActionHandlerDelegate.onAction = jest.fn();
      // act
      notificationService.setNotificationParams(data);
      notificationService.handleNotification();
      // assert
      done();
    })
    it('should publish a event to profile if action type is certificate', (done) => {
      //arrange
      const data = {action: {type : "certificateUpdate"}};
      mockSplaschreenDeeplinkActionHandlerDelegate.onAction = jest.fn();
      // act
      notificationService.setNotificationParams(data);
      notificationService.handleNotification();
      // assert
      done();
    })
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
      mockGroupService.getById = jest.fn(() => throwError({error: ""}));
      // action
      notificationService.redirectNotification(notification)
      // assert
      setTimeout(() => {
        expect(mockGroupService.getById).toHaveBeenCalled()
        done()
      });
    });
  })

  describe('updateNotification', () => {
    it('should update notiifcation', () => {
      // arrange
      const notifData = {
        id: "some_id",
        userId:"some_userId"
      }
      // act
      notificationService.updateNotification(notifData);
      // assert
    })
  })
});
