import { ToastNavigationComponent } from "./toast-navigation.component";
import { Platform, NavParams, PopoverController } from "@ionic/angular";
import { of } from "rxjs";

describe("toastnavigationComponent", () => {
  let toastnavigationComponent: ToastNavigationComponent;
  const mockNavParams: Partial<NavParams> = {
    get: jest.fn((arg) => {
      let value;
      switch (arg) {
        case "message":
          value = of([]);
          break;
        case "description":
          value = of([]);
          break;
        case "btnText":
          value = of([]);
          break;
      }
      return value;
    }),
  };

  const mockPlatform: Partial<Platform> = {};
  let subscribeWithPriorityCallback;
  const mockBackButtonFunc = { unsubscribe: jest.fn() };
  const subscribeWithPriorityData = jest.fn((val, callback) => {
    subscribeWithPriorityCallback = callback;
    return mockBackButtonFunc;
  });
  mockPlatform.backButton = {
    subscribeWithPriority: subscribeWithPriorityData,
  } as any;
  const mockPopCtrl: Partial<PopoverController> = {};

  beforeAll(() => {
    toastnavigationComponent = new ToastNavigationComponent(
      mockNavParams as NavParams,
      mockPlatform as Platform,
      mockPopCtrl as PopoverController
    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create an instance of ToastNavigationComponent", () => {
    expect(ToastNavigationComponent).toBeTruthy();
  });

  describe("ionViewWillEnter()", () => {
    it("should ", () => {
      // arrange
      mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((x, callback) => callback()),
      };
      mockPopCtrl.dismiss = jest.fn();
      const unsubscribeFn = jest.fn();
      toastnavigationComponent.backButtonFunc = {
        unsubscribe: unsubscribeFn,
      } as any;

      // act
      toastnavigationComponent.ionViewWillEnter();
      // assert
      expect(mockPopCtrl.dismiss).toHaveBeenCalled();
      expect(unsubscribeFn).toHaveBeenCalled();
    });
  });

  describe("ngOnDestroy", () => {
    it("should call unsubscribe", () => {
      // arrange
      toastnavigationComponent.backButtonFunc = undefined;
      // act
      toastnavigationComponent.ngOnDestroy();
      // assert
      expect(toastnavigationComponent.backButtonFunc).toBeFalsy();
    });
  });

  describe("onSuccessClick", () => {
    it("should call dismiss", () => {
      mockPopCtrl.dismiss = jest.fn();
      // act
      toastnavigationComponent.onSuccessClick();
      // assert
      expect(mockPopCtrl.dismiss).toHaveBeenCalledWith(true);
    });
  });
});
