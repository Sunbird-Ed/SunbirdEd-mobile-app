import { TestBed } from '@angular/core/testing';
import { FilePathService } from './file.service';
import { Platform } from '@ionic/angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FilePaths } from './file';
import { of } from 'rxjs';

// Mock Platform class
class MockPlatform {
  is(platform: string) {
    return platform === 'ios'; // You can customize it based on the test case
  }
}

describe('FilePathService', () => {
  let service: FilePathService;
  const mockPlatform: Partial<Platform> = {
    is: jest.fn(() => true) // Mock platform is iOS for the default case
  };

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        FilePathService,
        { provide: Platform, useClass: MockPlatform }
      ]
    });
    service = TestBed.inject(FilePathService);
    jest.spyOn(mockPlatform, 'is');
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFolderPath method', () => {
    it('should return DOCUMENTS folder path for iOS', async () => {
      // arrange
      const mockUri = 'mock:/documents';
      spyOn(Filesystem, 'getUri').and.returnValue(Promise.resolve({ uri: mockUri }));

      // act
      const uri = await service.getFilePath(FilePaths.DOCUMENTS);

      // assert
      expect(uri).toBe(mockUri);
      expect(Filesystem.getUri).toHaveBeenCalledWith({ path: '', directory: Directory.Documents });
    });

    it('should return CACHE folder path for iOS', async () => {
      // arrange
      const mockUri = 'mock:/cache';
      spyOn(Filesystem, 'getUri').and.returnValue(Promise.resolve({ uri: mockUri }));

      // act
      const uri = await service.getFilePath(FilePaths.CACHE);

      // assert
      expect(uri).toBe(mockUri);
      expect(Filesystem.getUri).toHaveBeenCalledWith({ path: '', directory: Directory.Cache });
    });

    it('should throw error for unsupported directory', async () => {
      try {
        await service.getFilePath('unsupported' as any);
      } catch (error) {
        expect(error).toEqual(new Error('Unsupported directory'));
      }
    });

    it('should return EXTERNAL_STORAGE folder path for Android', async () => {
      // Mock platform for Android
      mockPlatform.is = jest.fn().mockReturnValue(false); // Simulate Android

      const mockUri = 'mock:/android/storage';
      spyOn(Filesystem, 'getUri').and.returnValue(Promise.resolve({ uri: mockUri }));

      // act
      const uri = await service.getFilePath(FilePaths.ASSETS);

      // assert
      expect(uri).toBe(mockUri);
      expect(Filesystem.getUri).toHaveBeenCalledWith({ path: '', directory: Directory.ExternalStorage });
    });

    it('should handle error when Filesystem.getUri fails', async () => {
      // arrange
      spyOn(Filesystem, 'getUri').and.returnValue(Promise.reject('Filesystem error'));

      // act & assert
      await expect(service.getFilePath(FilePaths.DOCUMENTS)).rejects.toEqual('Filesystem error');
    });
  });
});
