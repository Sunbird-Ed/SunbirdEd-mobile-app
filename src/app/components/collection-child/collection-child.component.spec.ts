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
import { MimeType, ContentType, RouterLinks } from '../../app.constant';

describe('CollectionChildComponent', () => {
  let collectionChildComponent: CollectionChildComponent;
  const mockZone: Partial<NgZone> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {
    convertFileSrc: jest.fn(() => '')
  };
  const mockPopoverCtrl: Partial<PopoverController> = {};
  const mockComingSoonMessageService: Partial<ComingSoonMessageService> = {};
  let mockRouter: Partial<Router> = {
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

  const constructComponent = () => {
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
  };

  beforeAll(() => {
    constructComponent();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be create a instance of CollectionChildComponent', () => {
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
    // act
    collectionChildComponent.setContentId(id);
    // assert
    expect(mockLocation.back).toHaveBeenCalled();
    expect(mockTextbookTocService.setTextbookIds).toHaveBeenCalledWith({ rootUnitId: undefined, contentId: id, unit: undefined });
    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
      InteractType.TOUCH,
      InteractSubtype.SUBUNIT_CLICKED,
      Environment.HOME,
      PageId.TEXTBOOK_TOC,
      undefined,
      { unitClicked: id },
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
      it('sbPopoverMainTitle should be CONTENT_IS_BEING_ADDED + content name', (done) => {
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
              sbPopoverMainTitle: 'CONTENT_IS_BEEING_ADDED ' + {content_name: 'content_name'},
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

  describe('navigateToDetailsPage()', () => {
    afterAll(() => {
      mockRouter = {
        url: RouterLinks.TEXTBOOK_TOC
      };
      constructComponent();
    });
    it('If user is in textbook toc page Should go back to previous page and generate interact telemetry', () => {
      // arrange
      mockRouter = {
        url: RouterLinks.TEXTBOOK_TOC
      };
      constructComponent();
      mockLocation.back = jest.fn();
      const content = {
        identifier: 'some_identifier'
      };
      // act
      collectionChildComponent.navigateToDetailsPage(content, '');
      // assert
      expect(mockLocation.back).toHaveBeenCalled();
      expect(mockTextbookTocService.setTextbookIds)
        .toHaveBeenCalledWith({ rootUnitId: undefined, contentId: 'some_identifier' });
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
        InteractType.TOUCH,
        InteractSubtype.CONTENT_CLICKED,
        Environment.HOME,
        PageId.TEXTBOOK_TOC,
        undefined,
        { contentClicked: content.identifier },
        undefined,
        undefined);
    });
    it('If user is in enrolled course detail page and not enrolled, Should publish courseToc:content-clicked with ', () => {
      // arrange
      mockRouter = {
        url: RouterLinks.ENROLLED_COURSE_DETAILS
      };
      constructComponent();
      collectionChildComponent.isEnrolled = false;
      const content = {
        identifier: 'some_identifier'
      };
      // act
      collectionChildComponent.navigateToDetailsPage(content, '');
      // assert
      expect(mockEvents.publish)
        .toHaveBeenCalledWith('courseToc:content-clicked', expect.objectContaining({
          isBatchNotStarted: undefined, isEnrolled: false
        }));
    });
    it('If user is in enrolled course detail page and enrolled and batch is started,' +
      'Should publish courseToc:content-clicked with ', () => {
        // arrange
        mockRouter = {
          url: RouterLinks.ENROLLED_COURSE_DETAILS
        };
        constructComponent();
        collectionChildComponent.isEnrolled = true;
        collectionChildComponent.isBatchNotStarted = true;
        const content = {
          identifier: 'some_identifier'
        };
        // act
        collectionChildComponent.navigateToDetailsPage(content, '');
        // assert
        expect(mockEvents.publish)
          .toHaveBeenCalledWith('courseToc:content-clicked', expect.objectContaining({
            isBatchNotStarted: true, isEnrolled: true
          }));
      });
    describe('if router is other than TEXTBOOK_TOC and ENROLLED_COURSE_DETAILS', () => {
      beforeAll(() => {
        mockRouter = {
          url: '',
          navigate: jest.fn()
        };
        constructComponent();
      });
      afterAll(() => {
        mockRouter = {
          url: RouterLinks.TEXTBOOK_TOC
        };
        constructComponent();
      });
      it('Should go to course page if contentType is course', () => {
        // arrange
        const content = {
          identifier: 'some_identifier',
          contentType: ContentType.COURSE
        };
        mockZone.run = jest.fn((fn) => fn());
        // act
        collectionChildComponent.navigateToDetailsPage(content, '');
        // assert
      });
      it('Shpuld go to collection detail etb page if mimeType is application/vnd.ekstep.content-collection', () => {
        // arrange
        const content = {
          identifier: 'some_identifier',
          mimeType: MimeType.COLLECTION,
          contentType: ContentType.TEXTBOOK
        };
        mockZone.run = jest.fn((fn) => fn());
        // act
        collectionChildComponent.navigateToDetailsPage(content, '');
        // assert
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          expect.arrayContaining([RouterLinks.COLLECTION_DETAIL_ETB]),
          expect.objectContaining({
            state: expect.objectContaining({
              content,
              depth: ''
            })
          })
        );
      });
      it('Should go to content detail page if mimeType is not application/vnd.ekstep.content-collection' +
        'content type is other than TextBook and SelfAssess', () => {
          // arrange
          const content = {
            identifier: 'some_identifier',
            contentType: ContentType.RESOURCE,
            contentData: {
              contentType: ContentType.RESOURCE
            }
          };
          mockZone.run = jest.fn((fn) => fn());
          // act
          collectionChildComponent.navigateToDetailsPage(content, '');
          // assert
          expect(mockTextbookTocService.setTextbookIds).toHaveBeenCalledWith({
            rootUnitId: undefined, contentId: content.identifier, unit: undefined
          });
          expect(mockRouter.navigate).toHaveBeenCalledWith(
            expect.arrayContaining([RouterLinks.CONTENT_DETAILS]),
            expect.objectContaining({
              state: expect.objectContaining({
                isChildContent: true,
                content,
                depth: ''
              })
            })
          );
          expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.CONTENT_CLICKED,
            Environment.HOME,
            PageId.COLLECTION_DETAIL,
            undefined,
            { contentClicked: content.identifier },
            undefined,
            undefined);
        });
      it('Should show redo assessment and should go to content detail page if mimeType is not ' +
        'application/vnd.ekstep.content-collection content type is SelfAssess', (done) => {
          // arrange
          mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
            present: jest.fn(() => Promise.resolve({})),
            onDidDismiss: jest.fn(() => Promise.resolve({ data: { isLeftButtonClicked: false } }))
          } as any)));
          mockCommonUtilService.translateMessage = jest.fn((key) => {
            switch (key) {
              case 'REDO_ASSESSMENT':
                return 'REDO_ASSESSMENT';
              case 'TRAINING_ENDED_REDO_ASSESSMENT':
                return 'TRAINING_ENDED_REDO_ASSESSMENT';
              case 'SKIP':
                return 'SKIP';
              case 'REDO':
                return 'REDO';
            }
          });
          const content = {
            identifier: 'some_identifier',
            contentType: ContentType.SELF_ASSESS,
            contentData: {
              contentType: ContentType.SELF_ASSESS
            },
            status: '2'
          };
          collectionChildComponent.batch = {
            status: 2
          };
          mockZone.run = jest.fn((fn) => fn());
          // act
          collectionChildComponent.navigateToDetailsPage(content, '');
          // assert
          setTimeout(() => {
            // assert
            expect(mockPopoverCtrl.create).toHaveBeenCalled();
            expect(mockPopoverCtrl.create).toHaveBeenCalledWith(expect.objectContaining({
              componentProps: expect.objectContaining({
                sbPopoverHeading: 'REDO_ASSESSMENT',
                sbPopoverMainTitle: 'TRAINING_ENDED_REDO_ASSESSMENT',
                actionsButtons: expect.arrayContaining([
                  expect.objectContaining({
                    btntext: 'SKIP'
                  }),
                  expect.objectContaining({
                    btntext: 'REDO'
                  })
                ])
              })
            }));
            expect(mockTextbookTocService.setTextbookIds).toHaveBeenCalledWith({
              rootUnitId: undefined, contentId: content.identifier, unit: undefined
            });
            expect(mockRouter.navigate).toHaveBeenCalledWith(
              expect.arrayContaining([RouterLinks.CONTENT_DETAILS]),
              expect.objectContaining({
                state: expect.objectContaining({
                  isChildContent: true,
                  content,
                  depth: ''
                })
              })
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
              InteractType.TOUCH,
              InteractSubtype.CONTENT_CLICKED,
              Environment.HOME,
              PageId.COLLECTION_DETAIL,
              undefined,
              { contentClicked: content.identifier },
              undefined,
              undefined);
            done();
          }, 0);
        });
      it('Should show start assessment and should go to content detail page if mimeType is not ' +
        'application/vnd.ekstep.content-collection content type is SelfAssess and content.status not available', (done) => {
          // arrange
          mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
            present: jest.fn(() => Promise.resolve({})),
            onDidDismiss: jest.fn(() => Promise.resolve({ data: { isLeftButtonClicked: false } }))
          } as any)));
          mockCommonUtilService.translateMessage = jest.fn((key) => {
            switch (key) {
              case 'START_ASSESSMENT':
                return 'START_ASSESSMENT';
              case 'TRAINING_ENDED_START_ASSESSMENT':
                return 'TRAINING_ENDED_START_ASSESSMENT';
              case 'SKIP':
                return 'SKIP';
              case 'START':
                return 'START';
            }
          });
          const content = {
            identifier: 'some_identifier',
            contentType: ContentType.SELF_ASSESS,
            contentData: {
              contentType: ContentType.SELF_ASSESS
            }
          };
          collectionChildComponent.batch = {
            status: 2
          };
          mockZone.run = jest.fn((fn) => fn());
          // act
          collectionChildComponent.navigateToDetailsPage(content, '');
          // assert
          setTimeout(() => {
            // assert
            expect(mockPopoverCtrl.create).toHaveBeenCalled();
            expect(mockPopoverCtrl.create).toHaveBeenCalledWith(expect.objectContaining({
              componentProps: expect.objectContaining({
                sbPopoverHeading: 'START_ASSESSMENT',
                sbPopoverMainTitle: 'TRAINING_ENDED_START_ASSESSMENT',
                actionsButtons: expect.arrayContaining([
                  expect.objectContaining({
                    btntext: 'SKIP'
                  }),
                  expect.objectContaining({
                    btntext: 'START'
                  })
                ])
              })
            }));
            expect(mockTextbookTocService.setTextbookIds).toHaveBeenCalledWith({
              rootUnitId: undefined, contentId: content.identifier, unit: undefined
            });
            expect(mockRouter.navigate).toHaveBeenCalledWith(
              expect.arrayContaining([RouterLinks.CONTENT_DETAILS]),
              expect.objectContaining({
                state: expect.objectContaining({
                  isChildContent: true,
                  content,
                  depth: ''
                })
              })
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
              InteractType.TOUCH,
              InteractSubtype.CONTENT_CLICKED,
              Environment.HOME,
              PageId.COLLECTION_DETAIL,
              undefined,
              { contentClicked: content.identifier },
              undefined,
              undefined);
            done();
          }, 0);
        });
      it('Should show start assessment and should not go to content detail page if user clicked on skip and ' +
        'mimeType is not application/vnd.ekstep.content-collection content type is SelfAssess and content.status not available', (done) => {
          // arrange
          mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
            present: jest.fn(() => Promise.resolve({})),
            onDidDismiss: jest.fn(() => Promise.resolve({ data: { } }))
          } as any)));
          mockCommonUtilService.translateMessage = jest.fn((key) => {
            switch (key) {
              case 'START_ASSESSMENT':
                return 'START_ASSESSMENT';
              case 'TRAINING_ENDED_START_ASSESSMENT':
                return 'TRAINING_ENDED_START_ASSESSMENT';
              case 'SKIP':
                return 'SKIP';
              case 'START':
                return 'START';
            }
          });
          const content = {
            identifier: 'some_identifier',
            contentType: ContentType.SELF_ASSESS,
            contentData: {
              contentType: ContentType.SELF_ASSESS
            }
          };
          collectionChildComponent.batch = {
            status: 2
          };
          mockZone.run = jest.fn((fn) => fn());
          // act
          collectionChildComponent.navigateToDetailsPage(content, '');
          // assert
          setTimeout(() => {
            // assert
            expect(mockPopoverCtrl.create).toHaveBeenCalled();
            expect(mockPopoverCtrl.create).toHaveBeenCalledWith(expect.objectContaining({
              componentProps: expect.objectContaining({
                sbPopoverHeading: 'START_ASSESSMENT',
                sbPopoverMainTitle: 'TRAINING_ENDED_START_ASSESSMENT',
                actionsButtons: expect.arrayContaining([
                  expect.objectContaining({
                    btntext: 'SKIP'
                  }),
                  expect.objectContaining({
                    btntext: 'START'
                  })
                ])
              })
            }));
            expect(mockTextbookTocService.setTextbookIds).not.toHaveBeenCalled();
            expect(mockRouter.navigate).not.toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).not.toHaveBeenCalled();
            done();
          }, 0);
        });
    });
  });

  it('should check for latestParent name if available then check for hierarchyInfo', () => {
      // arrange
      collectionChildComponent.childData = mockChildContentData;
      mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
      collectionChildComponent.stckyindex = 0;
      collectionChildComponent.latestParentNodes = [
          {
              hierarchyInfo: [
                  {
                      identifier: 'do_123',
                      contentType: 'textbook'
                  },
                  {
                      identifier: 'do098',
                      contentType: 'resources'
                  }
              ]
          }
      ];
      mockEvents.publish = jest.fn();
      collectionChildComponent.latestParentName = 'sample_name';
      // act
      collectionChildComponent.ngOnInit();
      // assert
      expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.TOC_COLLECTION_CHILD_ID, {id: 'do_21274246255366963214046'});
  });

});
