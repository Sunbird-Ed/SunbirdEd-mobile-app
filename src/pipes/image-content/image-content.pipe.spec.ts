import { Platform } from '@ionic/angular';
import { ImageContentPipe } from './image-content.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('ImageContentPipe', () => {
  let imageContentPipe: ImageContentPipe;

  const mockPlatform: Partial<Platform> = {}
  const mockDomSanitizer: Partial<DomSanitizer> = {}
  
  beforeAll(() => {
    imageContentPipe = new ImageContentPipe(
      mockDomSanitizer as DomSanitizer,
      mockPlatform as Platform
    );
  })

  it('create an instance', () => {
    expect(imageContentPipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should transform image for ios platform', () => {
      // arrange
      mockPlatform.is = jest.fn((fn) => fn == 'ios')
      mockDomSanitizer.bypassSecurityTrustUrl = jest.fn()
      // act
      imageContentPipe.transform({contentData: {appIcon: 'appicon'}}, [])
      // assert
    })

    it('should transform image for android platform', () => {
      // arrange
      mockPlatform.is = jest.fn((fn) => fn == 'android')
      // act
      imageContentPipe.transform({contentData: {appIcon: 'appicon'}}, [])
      // assert
    })
  })
});