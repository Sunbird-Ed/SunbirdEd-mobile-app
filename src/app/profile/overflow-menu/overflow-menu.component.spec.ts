import { OverflowMenuComponent } from "./overflow-menu.component";
import { Component } from "@angular/core";
import { NavParams, Platform, PopoverController } from "@ionic/angular";
import { of } from "rxjs";

describe("OverflowMenuComponent", () => {
  let overflowMenuComponent: OverflowMenuComponent;
  const mockNavParams: Partial<NavParams> = {
    get: jest.fn((arg) => {
      let value;
      switch (arg) {
        case "list":
          value = of([]);
          break;
        case "profile":
          value = of([]);
          break;
      }
      return value;
    }),
  };
  const mockPopoverCtrl: Partial<PopOverCtrl> = {};

  beforeAll(() => {
    overflowMenuComponent = new OverflowMenuComponent(
      mockNavParams as NavParams,
      mockPopoverCtrl as PopOverCtrl
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create an instance of OverflowMenuComponent", () => {
    expect(OverflowMenuComponent).toBeTruthy();
  });

  describe("showToast", () => {
    it("should get list", () => {
      // arrange
      mockNavParams.get = jest.fn((arg) => {
        let value;
        switch (arg) {
          case "list":
            value = of([]);
        }
        return value;
      });
      // act
      overflowMenuComponent.showToast();
    });
  });
});
