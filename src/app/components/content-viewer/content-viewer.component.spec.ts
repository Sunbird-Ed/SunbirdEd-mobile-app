import { ContentViewerComponent } from "./content-viewer.component";
import { ModalController } from "@ionic/angular";
import { Component, Input, OnInit } from "@angular/core";
import { ScreenOrientation } from "@ionic-native/screen-orientation/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

describe("UserTypeSelectionPage", () => {
  let contentViewerComponent: ContentViewerComponent;
  const mockScreenOrientation: Partial<ScreenOrientation> = {
    unlock: jest.fn(),
    ORIENTATIONS: {
      PORTRAIT: "PORTRAIT",
      LANDSCAPE: "LANDSCAPE",
    } as any,
    lock: jest.fn(() => Promise.resolve([])),
  };
  const mockStatusBar: Partial<StatusBar> = {};
  const mockModalController: Partial<ModalController> = {};

  beforeAll(() => {
    contentViewerComponent = new ContentViewerComponent(
      mockScreenOrientation as ScreenOrientation,
      mockStatusBar as StatusBar,
      mockModalController as ModalController
    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should be create a instance of ContentViewerComponent", () => {
    expect(ContentViewerComponent).toBeTruthy();
  });

  it("ionViewWillLeave ", () => {
    //arrange
    mockStatusBar.show = jest.fn();
    mockScreenOrientation.unlock = jest.fn();
    mockScreenOrientation.lock = jest.fn();
    //act
    contentViewerComponent.ionViewWillLeave();
    //assert
    expect(mockStatusBar.show).toHaveBeenCalled();
    expect(mockScreenOrientation.unlock).toHaveBeenCalled();
    expect(mockScreenOrientation.lock).toHaveBeenCalledWith(
      mockScreenOrientation.ORIENTATIONS.PORTRAIT
    );
  });

  it("ngOnInit ", () => {
    //arrange
    mockStatusBar.hide = jest.fn();
    mockScreenOrientation.lock = jest.fn();
    //act
    contentViewerComponent.ngOnInit();
    //assert
    expect(mockStatusBar.hide).toHaveBeenCalled();
    expect(mockScreenOrientation.lock).toHaveBeenCalledWith(
      mockScreenOrientation.ORIENTATIONS.LANDSCAPE
    );
  });
});
