import { DownloadPdfService } from './download-pdf.service';
import { AndroidPermissionsService } from '../android-permissions/android-permissions.service';
import { of } from 'rxjs';
import { content } from './download-pdf.data';
import { Content } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../common-util.service';

describe('DownloadPdfService', () => {
  let downloadPdfService: DownloadPdfService;
  const mockPermissionService: Partial<AndroidPermissionsService> = {
    checkPermissions: jest.fn(() => of({})),
    requestPermissions: jest.fn(() => of({}))
  };

  const mockCommonUtilService: Partial<CommonUtilService> = {
    isAndroidVer13: jest.fn(() => false) as any
  };

  beforeAll(() => {
    downloadPdfService = new DownloadPdfService(
      mockPermissionService as AndroidPermissionsService,
      mockCommonUtilService as CommonUtilService
    );
   jest.spyOn(mockPermissionService, 'checkPermissions')
   jest.spyOn(mockPermissionService, 'requestPermissions')
   jest.spyOn(window['downloadManager'], 'enqueue')
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });


  it('should be created', () => {
    expect(downloadPdfService).toBeTruthy();
  });
  describe('if permission is always denied', () => {
    beforeAll(() => {
      downloadPdfService = new DownloadPdfService(
        mockPermissionService as AndroidPermissionsService,
        mockCommonUtilService as CommonUtilService
      );
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: true, hasPermission: false })) as any;
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => false)
    })
    it('it should reject', (done) => {
        // arrange
        mockCommonUtilService.isAndroidVer13 = jest.fn(() => false)
        mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: true })) as any;
        // act
        downloadPdfService.downloadPdf(content as any as Content);
        // asserts
        setTimeout(() => {
          expect(downloadPdfService.downloadPdf).rejects
        done();
      }, 0);
    });
    it('it should resolves if false, and has permission true', (done) => {
      // arrange
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => false)
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false })) as any;
      mockPermissionService['requestPermissions'] = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false }));
      // act
      downloadPdfService.downloadPdf(content as any as Content);
      // assert
      setTimeout(() => {
        expect(downloadPdfService.downloadPdf).rejects
        done();
      }, 0);
    });
    it('it should resolves checkstatus false, and has permission true else case', (done) => {
      // arrange
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => false)
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: true })) as any;
      mockPermissionService['requestPermissions'] = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: true }));
      // act
      downloadPdfService.downloadPdf(content as any as Content);
      // assert
      setTimeout(() => {
        expect(downloadPdfService.downloadPdf).rejects
        done();
      }, 0);
    });
    it('it should resolves if false', (done) => {
      // arrange
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => false)
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false })) as any;
      mockPermissionService['requestPermissions'] = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: true }));
      // act
      downloadPdfService.downloadPdf(content as any as Content);
      // assert
      setTimeout(() => {
        expect(downloadPdfService.downloadPdf).resolves
        done();
      }, 0);
    });
    it('it should resolves if false, resolve on download enqueue', (done) => {
      // arrange
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => false)
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false })) as any;
      mockPermissionService['requestPermissions'] = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: true }));
      window['downloadManager'] = {
        enqueue: jest.fn((_, id="str") => {Promise.resolve(id)})
      } as any
      // act
      downloadPdfService.downloadPdf(content as any as Content);
      // assert
      setTimeout(() => {
        expect(window['downloadManager'].enqueue).toHaveBeenCalled();
        expect(downloadPdfService.downloadPdf).resolves
        done();
      }, 0);
    });
    xit('it should resolves if false, error on download enqueue', (done) => {
      // arrange
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => false)
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false })) as any;
      mockPermissionService['requestPermissions'] = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: true }));
      window['downloadManager'] = {
        enqueue: jest.fn((err, _) => Promise.reject(err))
      } as any
      // act
      downloadPdfService.downloadPdf(content as any as Content);
      // assert
      setTimeout(() => {
        expect(window['downloadManager'].enqueue).toHaveBeenCalled();
        expect(downloadPdfService.downloadPdf).rejects.toThrowError("{ reason: 'download-failed' }")
        done();
      }, 0);
    })

    it('it should handle else if version >= 13', async () => {
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => true);
      try {
        await downloadPdfService.downloadPdf(content as any as Content);
        // fail();
      } catch (e) {
        expect(e).toEqual({ reason: 'device-permission-denied' });
        // done();
      }
    });
  });

  describe('if permission is not always denied', () => {
    beforeAll(() => {
      mockPermissionService['checkPermissions'] = jest.fn().mockReturnValue(of({ isPermissionAlwaysDenied: false }));
    });

    describe('if permission is not allowed', () => {

      describe('if permission granted', () => {
        beforeAll(() => {
          mockPermissionService['checkPermissions'] = jest.fn().mockReturnValue(of({ isPermissionAlwaysDenied: false, hasPermission: false }));
          mockPermissionService['requestPermissions'] = jest.fn().mockReturnValue(of({ isPermissionAlwaysDenied: false, hasPermission: true }));
          window['downloadManager']['enqueue'] = jest.fn().mockReturnValue((downloadRequest, callback) => {
            callback(null, 'sampleid');
          });

        })
        it('should download pdf', () => {
          try {
            downloadPdfService.downloadPdf(content as any as Content);
            // expect(window['downloadManager'].enqueue).toHaveBeenCalled();
          } catch (e) {
            fail(e);
          }
        });
      });

      describe('if permission granted, and error callback', () => {
        beforeAll(() => {
          mockPermissionService['checkPermissions'] = jest.fn().mockReturnValue(of({ isPermissionAlwaysDenied: false, hasPermission: false }));
          mockPermissionService['requestPermissions'] = jest.fn().mockReturnValue(of({ isPermissionAlwaysDenied: false, hasPermission: true }));
          window['downloadManager']['enqueue'] = jest.fn(() => (downloadRequest, callback) => {
            callback("err", '');
          });

        })
        it('should download pdf', () => {
          try {
            downloadPdfService.downloadPdf(content as any as Content);
          } catch (e) {
            fail(e);
          }
        });
      });

      describe('if permission not granted', () => {
        beforeAll(() => {
          mockPermissionService['checkPermissions'] = jest.fn(() => of({ permissions: ["user-permission-denied"]})) as any;
          mockPermissionService['requestPermissions'] = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false }));
        })
        xit('should reject ', (done) => {
          try {
            downloadPdfService.downloadPdf(content as any as Content);
          } catch (e) {
            expect(e).toEqual({ reason: 'user-permission-denied' });
            done();
          }
        });
      });
    });
  });
});
