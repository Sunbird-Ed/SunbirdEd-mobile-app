import { DomSanitizer } from '@angular/platform-browser';
import { ImageContentPipe } from './image-content.pipe';
import { Platform } from '@ionic/angular';

describe('ImageContentPipe', () => {
  const mockSanitizer: Partial<DomSanitizer> = {};
  const mockPlatform: Partial<Platform> = {};
  it('create an instance', () => {
    const pipe = new ImageContentPipe(
      mockSanitizer as DomSanitizer,
      mockPlatform as Platform
    );
    expect(pipe).toBeTruthy();
  });
});
