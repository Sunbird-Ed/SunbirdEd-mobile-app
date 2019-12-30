import { Location } from '@angular/common';
import { CollectionChildComponent } from './collection-child.component';
import { NgZone } from '@angular/core';
import { CommonUtilService, ComingSoonMessageService, TelemetryGeneratorService } from '../../../services';
import { TextbookTocService } from '../../collection-detail-etb/textbook-toc-service';
import { PopoverController, Events } from '@ionic/angular';
import { Router } from '@angular/router';
import {
  mockChildContentData,
  mockCompletedContentStatusData,
  mockInCompleteContentStatusData
} from './collection-child.component.spec.data';
describe('CollectionChildComponent', () => {
  let collectionChildComponent: CollectionChildComponent;
  const mockZone: Partial<NgZone> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {
    convertFileSrc: jest.fn(() => '')
  };
  const mockPopoverCtrl: Partial<PopoverController> = {};
  const mockComingSoonMessageService: Partial<ComingSoonMessageService> = {};
  const mockRouter: Partial<Router> = {};
  const mockTextbookTocService: Partial<TextbookTocService> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockLocation: Partial<Location> = {};
  const mockEvents: Partial<Events> = {};


  beforeAll(() => {
    collectionChildComponent = new CollectionChildComponent(
      mockZone as NgZone,
      mockCommonUtilService as CommonUtilService,
      mockPopoverCtrl as PopoverController,
      mockComingSoonMessageService as ComingSoonMessageService,
      mockRouter as Router,
      mockTextbookTocService as TextbookTocService,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockLocation as Location,
      mockEvents as Events
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be craeate a instance of CollectionChildComponent', () => {
    expect(collectionChildComponent).toBeTruthy();
  });

  it('should return true if content  consumed as part of course is completed', () => {
    // arrange
    collectionChildComponent.isEnrolled = true;
    collectionChildComponent.childData = mockChildContentData;
    collectionChildComponent.contentStatusData = mockCompletedContentStatusData;
    // act

    // assert
    expect(collectionChildComponent.isContentCompleted).toBeTruthy();
  });

  it('should return false if course is not enrolled', () => {
    // arrange
    collectionChildComponent.isEnrolled = false;
    collectionChildComponent.childData = mockChildContentData;
    collectionChildComponent.contentStatusData = mockInCompleteContentStatusData;
    // act

    // assert
    expect(collectionChildComponent.isContentCompleted).toBeFalsy();
  });
});
