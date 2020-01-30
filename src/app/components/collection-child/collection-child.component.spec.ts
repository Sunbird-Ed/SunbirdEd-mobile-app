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
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';
import {Content} from 'sunbird-sdk';
import {EventTopics} from '@app/app/app.constant';
describe('CollectionChildComponent', () => {
  let collectionChildComponent: CollectionChildComponent;
  const mockZone: Partial<NgZone> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {
    convertFileSrc: jest.fn(() => '')
  };
  const mockPopoverCtrl: Partial<PopoverController> = {};
  const mockComingSoonMessageService: Partial<ComingSoonMessageService> = {};
  const mockRouter: Partial<Router> = {
    url: 'textbook-toc'
  };
  const mockTextbookTocService: Partial<TextbookTocService> = {
    setTextbookIds: jest.fn()
  };
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateInteractTelemetry: jest.fn(),
  };
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

  it('should set textbookIds', () => {
    // arrange
    mockLocation.back = jest.fn();
    const id = 'sampleId';
    const values = new Map();
    values['unitClicked'] = id;
    // act
    collectionChildComponent.setContentId(id);
    // assert
    expect(mockLocation.back).toHaveBeenCalled();
    expect(mockTextbookTocService.setTextbookIds).toHaveBeenCalledWith({ rootUnitId: undefined, contentId: 'sampleId', unit: undefined});
    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
      InteractType.TOUCH,
      InteractSubtype.SUBUNIT_CLICKED,
      Environment.HOME,
      PageId.TEXTBOOK_TOC,
      undefined,
      values,
      undefined,
      undefined);
  });

  it('should getContentMetaData and publish events', (done) => {
    // arrange
    const mockContentData: Content = {
      identifier: 'sample_doId',
      contentData: {
        identifier: 'sample_identifier',
        name: 'content_name',
        appIcon: 'sample_icon'
      }
    };
    mockEvents.publish = jest.fn( );
    // act
    collectionChildComponent.playContent(mockContentData);
    setTimeout(() => {
      // assert
      expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.CONTENT_TO_PLAY, {content: mockContentData});
      done();
    }, 0);

  });
});
