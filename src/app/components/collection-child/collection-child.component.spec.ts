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
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';
import { Content } from 'sunbird-sdk';
import { EventTopics } from '@app/app/app.constant';
import { of } from 'rxjs';
import { MimeType, ContentType } from '../../app.constant';

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
    jest.resetAllMocks();
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
    expect(mockTextbookTocService.setTextbookIds).toHaveBeenCalledWith({ rootUnitId: undefined, contentId: 'sampleId', unit: undefined });
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
    mockEvents.publish = jest.fn();
    // act
    collectionChildComponent.playContent(mockContentData);
    setTimeout(() => {
      // assert
      expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.CONTENT_TO_PLAY, { content: mockContentData });
      done();
    }, 0);

  });

  describe('showComingSoonPopup()', () => {
    it('should not display coming soon popover for mimeType other than collection', (done) => {
      // arrange
      mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
      } as any)));
      const childData = {
        contentData: {
          mimeType: ''
        }
      } as any;
      // mockCommonUtilService.translateMessage = jest.fn(() => '');
      mockComingSoonMessageService.getComingSoonMessage = jest.fn(() => Promise.resolve('COMING SOON MESSAGE'));
      collectionChildComponent.showComingSoonPopup(childData);
      // act
      setTimeout(() => {
        // assert
        expect(mockPopoverCtrl.create).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    describe('should display coming soon popover for mimeType collection', () => {
      it('sbPopoverMainTitle should be COMING SOON MESSAGE', (done) => {
        // arrange
        mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
          present: jest.fn(() => Promise.resolve({})),
          onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
        } as any)));
        const childData = {
          contentData: {
            mimeType: MimeType.COLLECTION
          }
        } as any;
        mockCommonUtilService.translateMessage = jest.fn(() => 'COMING SOON MESSAGE');
        mockComingSoonMessageService.getComingSoonMessage = jest.fn(() => Promise.resolve('COMING SOON MESSAGE'));
        collectionChildComponent.showComingSoonPopup(childData);
        // act
        setTimeout(() => {
          // assert
          expect(mockPopoverCtrl.create).toHaveBeenCalled();
          expect(mockPopoverCtrl.create).toHaveBeenCalledWith(expect.objectContaining({
            componentProps: expect.objectContaining({
              sbPopoverMainTitle: 'COMING SOON MESSAGE'
            })
          }));
          done();
        }, 0);
      });
      it('sbPopoverMainTitle should be CONTENT_IS_BEEING_ADDED + content name', (done) => {
        // arrange
        mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
          present: jest.fn(() => Promise.resolve({})),
          onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
        } as any)));
        const childData = {
          contentData: {
            name: 'CONTENT_NAME',
            mimeType: MimeType.COLLECTION
          }
        } as any;
        mockCommonUtilService.translateMessage = jest.fn((key, fields) => {
          switch (key) {
            case 'CONTENT_COMMING_SOON':
              return 'CONTENT_COMMING_SOON';
            case 'CONTENT_IS_BEEING_ADDED':
              return 'CONTENT_IS_BEEING_ADDED ' + fields;
            case 'OKAY':
              return 'OKAY';
          }
        });
        mockComingSoonMessageService.getComingSoonMessage = jest.fn(() => Promise.resolve(''));
        collectionChildComponent.showComingSoonPopup(childData);
        // act
        setTimeout(() => {
          // assert
          expect(mockPopoverCtrl.create).toHaveBeenCalled();
          expect(mockPopoverCtrl.create).toHaveBeenCalledWith(expect.objectContaining({
            componentProps: expect.objectContaining({
              sbPopoverHeading: 'CONTENT_COMMING_SOON',
              sbPopoverMainTitle: 'CONTENT_IS_BEEING_ADDED CONTENT_NAME',
              actionsButtons: expect.arrayContaining([
                expect.objectContaining({
                  btntext: 'OKAY'
                })
              ])
            })
          }));
          done();
        }, 0);
      });
    });
  });

  describe('getContentTypeIcon()', () => {
    describe('should get content type icon', () => {
      it('Should get self access icon for conetnt type SelfAssess', () => {
        // arrange
        const content = {
          contentData: {
            contentType: ContentType.SELF_ASSESS
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.contentData.contentType).toEqual(ContentType.SELF_ASSESS);
        expect(contentTypeIcon).toBe('./assets/imgs/selfassess.svg');
      });
      it('Should get touch icon for conetnt type other than SelfAssess', () => {
        // arrange
        const content = {
          contentData: {
            contentType: ContentType.RESOURCE
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.contentData.contentType).toEqual(ContentType.RESOURCE);
        expect(contentTypeIcon).toBe('./assets/imgs/touch.svg');
      });
      it('Should get doc icon for mimeTypes application/pdf', () => {
        // arrange
        const content = {
          mimeType: 'application/pdf',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('application/pdf');
        expect(contentTypeIcon).toBe('./assets/imgs/doc.svg');
      });
      it('Should get doc icon for mimeTypes application/epub', () => {
        // arrange
        const content = {
          mimeType: 'application/epub',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('application/epub');
        expect(contentTypeIcon).toBe('./assets/imgs/doc.svg');
      });
      it('Should get doc icon for mimeTypes application/msword', () => {
        // arrange
        const content = {
          mimeType: 'application/msword',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('application/msword');
        expect(contentTypeIcon).toBe('./assets/imgs/doc.svg');
      });
      it('Should get play icon for mimeTypes video/avi', () => {
        // arrange
        const content = {
          mimeType: 'video/avi',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('video/avi');
        expect(contentTypeIcon).toBe('./assets/imgs/play.svg');
      });
      it('Should get play icon for mimeTypes video/mpeg', () => {
        // arrange
        const content = {
          mimeType: 'video/mpeg',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('video/mpeg');
        expect(contentTypeIcon).toBe('./assets/imgs/play.svg');
      });
      it('Should get play icon for mimeTypes video/quicktime', () => {
        // arrange
        const content = {
          mimeType: 'video/quicktime',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('video/quicktime');
        expect(contentTypeIcon).toBe('./assets/imgs/play.svg');
      });
      it('Should get play icon for mimeTypes video/3gpp', () => {
        // arrange
        const content = {
          mimeType: 'video/3gpp',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('video/3gpp');
        expect(contentTypeIcon).toBe('./assets/imgs/play.svg');
      });
      it('Should get play icon for mimeTypes video/mpeg', () => {
        // arrange
        const content = {
          mimeType: 'video/mpeg',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('video/mpeg');
        expect(contentTypeIcon).toBe('./assets/imgs/play.svg');
      });
      it('Should get play icon for mimeTypes video/mp4', () => {
        // arrange
        const content = {
          mimeType: 'video/mp4',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('video/mp4');
        expect(contentTypeIcon).toBe('./assets/imgs/play.svg');
      });
      it('Should get play icon for mimeTypes video/ogg', () => {
        // arrange
        const content = {
          mimeType: 'video/ogg',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('video/ogg');
        expect(contentTypeIcon).toBe('./assets/imgs/play.svg');
      });
      it('Should get play icon for mimeTypes video/webm', () => {
        // arrange
        const content = {
          mimeType: 'video/webm',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('video/webm');
        expect(contentTypeIcon).toBe('./assets/imgs/play.svg');
      });
      it('Should get touch icon for mimeTypes application/vnd.ekstep.ecml-archive', () => {
        // arrange
        const content = {
          mimeType: 'application/vnd.ekstep.ecml-archive',
          contentData: {
          }
        } as any;
        // act
        const contentTypeIcon = collectionChildComponent.getContentTypeIcon(content);
        // assert
        expect(content.mimeType).toEqual('application/vnd.ekstep.ecml-archive');
        expect(contentTypeIcon).toBe('./assets/imgs/touch.svg');
      });
    });
  });

});
