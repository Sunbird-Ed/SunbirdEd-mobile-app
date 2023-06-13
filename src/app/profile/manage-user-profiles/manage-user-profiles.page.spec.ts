import { ManageUserProfilesPage } from './manage-user-profiles.page';
import {
  ProfileService,
  SharedPreferences
} from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import { AppHeaderService } from '../../../services/app-header.service';
import { CommonUtilService } from '../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { TncUpdateHandlerService } from '../../../services/handlers/tnc-update-handler.service';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '../../../util/events';
import { Location } from '@angular/common';
import { of, Subscription } from 'rxjs';

describe('ManageUserProfilesPage', () => {

  let manageUserProfilesPage: ManageUserProfilesPage;

  const mockProfileService: Partial<ProfileService> = {
    getActiveSessionProfile: jest.fn(() => of({
      uid: 'sample_uid'
    })),
    managedProfileManager: {
      getManagedServerProfiles: jest.fn(() => of([
        {
          id: 'sample_uid_1'
        },
        {
          id: 'sample_uid_2'
        },
      ])),
    }
  };
  const mockSharedPreferences: Partial<SharedPreferences> = {};
  const mockAppHeaderService: Partial<AppHeaderService> = {};
  const mockRouter: Partial<Router> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockEvents: Partial<Events> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockPlatform: Partial<Platform> = {};
  const mockLocation: Partial<Location> = {};
  const mockPopOverController: Partial<PopoverController> = {};
  const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {};

  beforeAll(() => {
    manageUserProfilesPage = new ManageUserProfilesPage(
        mockProfileService as ProfileService,
        mockSharedPreferences as SharedPreferences,
        mockAppHeaderService as AppHeaderService,
        mockRouter as Router,
        mockCommonUtilService as CommonUtilService,
        mockEvents as Events,
        mockTelemetryGeneratorService as TelemetryGeneratorService,
        mockPlatform as Platform,
        mockLocation as Location,
        mockPopOverController as PopoverController,
        mockTncUpdateHandlerService as TncUpdateHandlerService
    );
  });

  describe('ngOnInit()', () => {
    it('should get the app name', (done) => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of('app-name'));
      // act
      manageUserProfilesPage.ngOnInit();
      // assert
      setTimeout(() => {
        expect(mockSharedPreferences.getString).toHaveBeenCalledWith('app_name');
        done();
      }, 0);
    });
  });

  describe('ionViewWillEnter()', () => {
    it('should initiate the backbutton events and the telemetry events', () => {
      // arrange
      mockAppHeaderService.showHeaderWithBackButton = jest.fn();
      const data = {name: 'back'};
      const mockHeaderEventsSubscription = { unsubscribe: jest.fn() } as Partial<Subscription>;
      mockAppHeaderService.headerEventEmitted$ = {
        subscribe: jest.fn((fn) =>  {fn(data); return mockHeaderEventsSubscription; })
      } as any;
      let subscribeWithPriorityCallback;
      const mockBackBtnFunc = {unsubscribe: jest.fn()};
      const subscribeWithPriorityData = jest.fn((val, callback) => {
        subscribeWithPriorityCallback = callback;
        return mockBackBtnFunc;
      });
      mockPlatform.backButton = {
        subscribeWithPriority: subscribeWithPriorityData,
    } as any;
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
      mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
      // act
      manageUserProfilesPage.ionViewWillEnter();
      // assert
      setTimeout(() => {
        expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalled();
      }, 0);
    });
  });

  describe('ionViewWillLeave()', () => {
    it('should unsubscribe to the backbutton events', () => {
      // arrange
      manageUserProfilesPage['headerObservable'] = null;
      const mockbackButtonFuncSubscription = { unsubscribe: jest.fn() } as Partial<Subscription>;
      manageUserProfilesPage['backButtonFunc'] = mockbackButtonFuncSubscription as any;
      // act
      manageUserProfilesPage.ionViewWillLeave();
      // assert
      expect(manageUserProfilesPage['backButtonFunc'].unsubscribe).toHaveBeenCalled();
    });

    it('should unsubscribe to the header events', () => {
      // arrange
      const mockHeaderEventsSubscription = { unsubscribe: jest.fn() } as Partial<Subscription>;
      manageUserProfilesPage['headerObservable'] = mockHeaderEventsSubscription as any;
      manageUserProfilesPage['backButtonFunc'] = null;
      // act
      manageUserProfilesPage.ionViewWillLeave();
      // assert
      expect(manageUserProfilesPage['headerObservable'].unsubscribe).toHaveBeenCalled();
    });
  });

  describe('selectUser()', () => {
    it('should temporarily save the selected user details', () => {
      // arrange
      const userDeatils = {
        uid: 'userId'
      };
      // act
      manageUserProfilesPage.selectUser(userDeatils, 1);
      // assert
      expect(manageUserProfilesPage['selectedUser'].uid).toEqual(userDeatils.uid);
      expect(manageUserProfilesPage.selectedUserIndex).toEqual(1);
    });
  });

  describe('addUser()', () => {
    it('should navigate to add new users page on click of add user if device is online', () => {
      // arrange
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockCommonUtilService.networkInfo = {
        isNetworkAvailable: true
      };
      mockRouter.navigate = jest.fn();
      // act
      manageUserProfilesPage.addUser();
      // assert
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should not navigate to add new users page on click of add user if device is offline', () => {
      // arrange
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockCommonUtilService.networkInfo = {
        isNetworkAvailable: false
      };
      mockCommonUtilService.showToast = jest.fn();
      mockRouter.navigate = jest.fn();
      // act
      manageUserProfilesPage.addUser();
      // assert
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
      expect(mockCommonUtilService.showToast).toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('switchUser()()', () => {
    it('should skip switching user, if there is no selected user', () => {
      // arrange
      manageUserProfilesPage['selectedUser'] = null;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      // act
      manageUserProfilesPage.switchUser();
      // assert
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).not.toHaveBeenCalled();
    });

    it('should switching user, if there is no selected user', (done) => {
      // arrange
      manageUserProfilesPage['selectedUser'] = { id: 'uid' };
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockProfileService.managedProfileManager = {
        switchSessionToManagedProfile: jest.fn(() => of())
      };
      mockEvents.publish = jest.fn(() => []);
      mockTncUpdateHandlerService.checkForTncUpdate = jest.fn();
      mockRouter.navigate = jest.fn();
      mockCommonUtilService.translateMessage = jest.fn();
      mockPopOverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
    } as any)));
        // act
      manageUserProfilesPage.switchUser();
      // assert
      setTimeout(() => {
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        expect(mockEvents.publish).toHaveBeenCalled();
        expect(mockTncUpdateHandlerService.checkForTncUpdate).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

});
