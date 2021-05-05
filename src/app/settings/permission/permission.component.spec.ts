import { PermissionComponent } from "./permission.component";
import { Location } from "@angular/common";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { RouterLinks } from "@app/app/app.constant";
import {
  AndroidPermission,
  AndroidPermissionsStatus,
  PermissionAskedEnum,
} from "@app/services/android-permissions/android-permission";
import { AndroidPermissionsService } from "@app/services/android-permissions/android-permissions.service";
import { AppGlobalService } from "@app/services/app-global-service.service";
import { AppHeaderService } from "@app/services/app-header.service";
import { CommonUtilService } from "@app/services/common-util.service";
import { SunbirdQRScanner } from "@app/services/sunbirdqrscanner.service";
import {
  Environment,
  InteractSubtype,
  InteractType,
  PageId,
} from "@app/services/telemetry-constants";
import { TelemetryGeneratorService } from "@app/services/telemetry-generator.service";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { Events, Platform } from "@ionic/angular";
import { of, throwError } from "rxjs";

describe("PermissionComponent", () => {
  let permissionComponent: PermissionComponent;
  const mockCommonUtilService: Partial<CommonUtilService> = {
    translateMessage: jest.fn(() => "sample-string"),
  };
  const mockSunbirdQRScanner: Partial<SunbirdQRScanner> = {};
  const mockAndroidPermissionsService: Partial<AndroidPermissionsService> = {};
  const mockAppGlobalService: Partial<AppGlobalService> = {};
  const mockAppHeaderService: Partial<AppHeaderService> = {};
  const mockEvents: Partial<Events> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockLocation: Partial<Location> = {};
  const mockAppVersion: Partial<AppVersion> = {
    getAppName: jest.fn(() => Promise.resolve("appName")),
  };
  const mockRouter: Partial<Router> = {
    getCurrentNavigation: jest.fn(() => ({
      extras: {
        state: {
          changePermissionAccess: true,
        },
      },
    })) as any,
  };
  const mockPlatform: Partial<Platform> = {};
  let subscribeWithPriorityCallback;
  const mockBackBtnFunc = { unsubscribe: jest.fn() };
  const subscribeWithPriorityData = jest.fn((val, callback) => {
    subscribeWithPriorityCallback = callback;
    return mockBackBtnFunc;
  });
  mockPlatform.backButton = {
    subscribeWithPriority: subscribeWithPriorityData,
  } as any;
  const mockActivatedRoute: Partial<ActivatedRoute> = {
    queryParams: of({}),
  };

  beforeAll(() => {
    permissionComponent = new PermissionComponent(
      mockCommonUtilService as CommonUtilService,
      mockSunbirdQRScanner as SunbirdQRScanner,
      mockAndroidPermissionsService as AndroidPermissionsService,
      mockAppGlobalService as AppGlobalService,
      mockAppHeaderService as AppHeaderService,
      mockEvents as Events,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockLocation as Location,
      mockAppVersion as AppVersion,
      mockRouter as Router,
      mockPlatform as Platform,
      mockActivatedRoute as ActivatedRoute
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create an instance of PermissionComponent", () => {
    expect(PermissionComponent).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should generate PAGEVIEW telemetry on ngOnit", () => {
      // arrange
      mockTelemetryGeneratorService.generatePageViewTelemetry = jest.fn(() =>
        throwError({ error: "error" })
      ) as any;
      // act
      permissionComponent.ngOnInit();
      // assert
      expect(
        mockTelemetryGeneratorService.generatePageViewTelemetry
      ).toHaveBeenCalledWith(PageId.PERMISSION, Environment.ONBOARDING, "");
    });
  });

  describe("ionViewWillLeave", () => {
    it("should call unsubscribe", () => {
      // arrange
      permissionComponent.backButtonFunc = undefined;
      // act
      permissionComponent.ionViewWillLeave();
      // assert
      expect(permissionComponent.backButtonFunc).toBeFalsy();
    });
  });

  describe("generateInteractEvent()", () => {
    it("should create interation event", () => {
      //arrange

      const values = new Map();
      values["permissionAllowed"] = true;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      //act
      permissionComponent.generateInteractEvent(true);
      //assert
      expect(
        mockTelemetryGeneratorService.generateInteractTelemetry
      ).toHaveBeenCalledWith(
        InteractType.TOUCH,
        InteractSubtype.GRANT_ACCESS_CLICKED,
        Environment.ONBOARDING,
        PageId.PERMISSION,
        undefined,
        values
      );
      // expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
    });
  });

  describe("skipAccess()", () => {
    it("generate interation event and navigate to profile settings", () => {
      //arrange
      permissionComponent.showProfileSettingPage = true;
      mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = true;
      mockRouter.navigate = jest.fn();
      permissionComponent.generateInteractEvent = jest.fn();
      const navigationExtras: NavigationExtras = {
        state: { hideBackButton: false },
      };
      //act
      permissionComponent.skipAccess();
      //assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [`/${RouterLinks.PROFILE_SETTINGS}`],
        navigationExtras
      );
    });

    it("generate interation event and navigate to tabs", () => {
      permissionComponent.showProfileSettingPage = false;
      mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = false;
      mockRouter.navigate = jest.fn();
      permissionComponent.generateInteractEvent = jest.fn();
      const navigationExtras: NavigationExtras = {
        state: { loginMode: "guest" },
      };
      //act
      permissionComponent.skipAccess();
      //assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ["/tabs"],
        navigationExtras
      );
    });
  });

  describe("handleHeaderEvents()", () => {
    it("should create backClicked event", () => {
      //arrange
      const event = {
        name: "back",
      };

      mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
      mockLocation.back = jest.fn();
      //act
      permissionComponent.handleHeaderEvents(event);
      //assert
      expect(
        mockTelemetryGeneratorService.generateBackClickedTelemetry
      ).toHaveBeenCalledWith(PageId.PERMISSION, Environment.ONBOARDING, true);
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe("stateChange()", () => {
    it("should create interation event", () => {
      //arrange
      const event = "event";
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockLocation.back = jest.fn();
      //act
      permissionComponent.stateChange(event);
      //assert
      expect(
        mockTelemetryGeneratorService.generateInteractTelemetry
      ).toHaveBeenLastCalledWith(
        InteractType.TOUCH,
        InteractSubtype.APP_PERMISSION_SETTING_CLICKED,
        Environment.ONBOARDING,
        PageId.PERMISSION
      );
      expect(mockLocation.back).toHaveBeenLastCalledWith();
    });
  });

  describe("grantAccess()", () => {
    it("should grant access to camera, recordAudio and Storage", (done) => {
      //arrange
      permissionComponent.showProfileSettingPage = true;
      permissionComponent.generateInteractEvent = jest.fn();
      mockAppGlobalService.setIsPermissionAsked = jest.fn();
      mockAndroidPermissionsService.checkPermissions = jest.fn(() =>
        of([
          {
            hasPermission: false,
            isPermissionAlwaysDenied: false,
          },
        ])
      ); 
      mockCommonUtilService.translateMessage = jest.fn(() => "sample-camera");
      mockAndroidPermissionsService.requestPermissions = jest.fn(() =>
        of([
          {
            hasPermission: false,
            isPermissionAlwaysDenied: true,
          },
        ])
      );
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      //act
      permissionComponent.grantAccess();
      //assert
      setTimeout(() => {
        expect(
          mockAppGlobalService.setIsPermissionAsked
        ).toHaveBeenNthCalledWith(1, PermissionAskedEnum.isCameraAsked, true);
        expect(
          mockAppGlobalService.setIsPermissionAsked
        ).toHaveBeenNthCalledWith(
          2,
          PermissionAskedEnum.isRecordAudioAsked,
          true
        );
        expect(
          mockAppGlobalService.setIsPermissionAsked
        ).toHaveBeenNthCalledWith(3, PermissionAskedEnum.isStorageAsked, true);

        expect(permissionComponent.generateInteractEvent).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe("handleBackButton()", () => {
    it("should ", () => {
      // arrange
      permissionComponent.shouldGenerateEndTelemetry = true;
      mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((x, callback) => callback()),
      };
      mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
      mockLocation.back = jest.fn();
      const unsubscribeFn = jest.fn();
      permissionComponent.backButtonFunc = {
        unsubscribe: unsubscribeFn,
      } as any;

      // act
      permissionComponent.handleBackButton();
      // assert

      expect(
        mockTelemetryGeneratorService.generateBackClickedTelemetry
      ).toHaveBeenCalledWith(PageId.PERMISSION, Environment.ONBOARDING, false);
      expect(mockLocation.back).toHaveBeenCalled();
      expect(unsubscribeFn).toHaveBeenCalled();
    });
  });
});
