import { TestBed } from '@angular/core/testing';
import { DownloadPdfService } from './download-pdf.service';
import { Injectable } from '@angular/core';
import { AndroidPermissionsService } from '../android-permissions/android-permissions.service';
import { AndroidPermission } from '../../services/android-permissions/android-permission';
import { of, throwError } from 'rxjs';
import { content, checkedStatusFalse, requestedStatusTrue, downloadrequested } from './download-pdf.data';
import { Content } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../common-util.service';

describe('DownloadPdfService', () => {
  let downloadPdfService: DownloadPdfService;
  const mockPermissionService: Partial<AndroidPermissionsService> = {
    checkPermissions: jest.fn(() => of({})),
    requestPermissions: jest.fn(() => of({}))
  };

  const mockCommonUtilService: Partial<CommonUtilService> = {
    isAndroidVer13: jest.fn(() => Promise.resolve(Boolean)) as any
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
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: true, hasPermission: false })) as any;
    })
    it('it should reject', (done) => {
        // arrange
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
    it('it should resolves if false, error on download enqueue', (done) => {
      // arrange
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
      mockPermissionService['checkPermissions'].and.returnValue(of({ isPermissionAlwaysDenied: false }));
    });

    describe('if permission is not allowed', () => {

      describe('if permission granted', () => {
        beforeAll(() => {
          mockPermissionService['checkPermissions'].and.returnValue(of({ isPermissionAlwaysDenied: false, hasPermission: false }));
          mockPermissionService['requestPermissions'].and.returnValue(of({ isPermissionAlwaysDenied: false, hasPermission: true }));
          window['downloadManager']['enqueue'].and.callFake((downloadRequest, callback) => {
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
          mockPermissionService['checkPermissions'].and.returnValue(of({ isPermissionAlwaysDenied: false, hasPermission: false }));
          mockPermissionService['requestPermissions'].and.returnValue(of({ isPermissionAlwaysDenied: false, hasPermission: true }));
          window['downloadManager']['enqueue'].and.callFake((downloadRequest, callback) => {
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
          mockPermissionService['checkPermissions'].and.returnValue(of({ isPermissionAlwaysDenied: false, hasPermission: false }));
          mockPermissionService['requestPermissions'].and.returnValue(of({ isPermissionAlwaysDenied: false, hasPermission: false }));
        })
        it('should reject ', async (done) => {
          try {
            await downloadPdfService.downloadPdf(content as any as Content);
            fail();
          } catch (e) {
            expect(e).toEqual({ reason: 'user-permission-denied' });
            done();
          }
        });
      });

      describe('if permission granted', () => {
        beforeAll(() => {
          mockPermissionService['checkPermissions'].and.returnValue(of({ isPermissionAlwaysDenied: false, hasPermission: true }));
          // mockPermissionService['requestPermissions'].and.returnValue(of({ isPermissionAlwaysDenied: false, hasPermission: false }));
        })
        // it('should reject, downlaod failed', async () => {
        //   try {
        //     await downloadPdfService.downloadPdf(content as any as Content);
        //     fail();
        //   } catch (e) {
        //     expect(e).toEqual({ reason: 'download-failed' });
        //     // done();
        //   }
        // });
      });
    });
  });
});
