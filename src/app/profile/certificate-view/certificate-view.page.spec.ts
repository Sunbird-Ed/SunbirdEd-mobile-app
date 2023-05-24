import {CertificateService, CourseService} from '@project-sunbird/sunbird-sdk';
import {CertificateDownloadService} from 'sb-svg2pdf';
import {AppGlobalService, AppHeaderService, CommonUtilService, TelemetryGeneratorService} from '../../../services';
import {Router} from '@angular/router';
import {FileOpener} from '@awesome-cordova-plugins/file-opener/ngx';
import {Platform, PopoverController, ToastController} from '@ionic/angular';
import {CertificateViewPage} from './certificate-view.page';
import {ElementRef} from '@angular/core';
import {EMPTY, of} from 'rxjs';

describe('CertificateViewPage', () => {
    const mockCertificateService: Partial<CertificateService> = {
        getCertificate: jest.fn(() => of('data:image/svg+xml,<svg height="100" width="100">\n' +
        '  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />\n' +
        '  Sorry, your browser does not support inline SVG.  \n' +
            '</svg>')),
        downloadCertificate: jest.fn(() => of({ path: 'SOME_DOWNLOAD_PATH' }))
    } as any;
    const mockCertificateDownloadService: Partial<CertificateDownloadService> = {
        buildBlob: jest.fn(() => Promise.resolve(new Blob())),
    };
    const mockAppHeaderService: Partial<AppHeaderService> = {
        getDefaultPageConfig: jest.fn(() => ({})),
        updatePageConfig: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(),
        translateMessage: jest.fn(() => 'MESSAGE'),
        getLoader: jest.fn(() => Promise.resolve({
            present: jest.fn(),
            dismiss: jest.fn()
        }))
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getActiveProfileUid: jest.fn(() => Promise.resolve('SOME_UID')),
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    request: {
                        courseId: 'SOME_COURSE_ID',
                        certificate: {
                            name: 'SOME_CERTIFICATE_NAME',
                            lastIssuedOn: new Date().toDateString(),
                            token: 'SOME_CERTIFICATE_TOKEN',
                        }
                    }
                }
            }
        }))
    };
    const mockFileOpener: Partial<FileOpener> = {
        open: jest.fn(() => Promise.resolve())
    };
    const mockToastController: Partial<ToastController> = {
        create: jest.fn(() => Promise.resolve({
            present: jest.fn(),
            dismiss: jest.fn()
        }))
    };
    const mockPopoverController: Partial<PopoverController> = {};
    const mockPlatform: Partial<Platform> = { is: jest.fn(platform => platform === 'ios') };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
    };
  
    let certificateViewPage: CertificateViewPage;

    beforeAll(() => {
        certificateViewPage = new CertificateViewPage(
            mockCertificateService as CertificateService,
            mockCertificateDownloadService as CertificateDownloadService,
            mockAppHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockAppGlobalService as AppGlobalService,
            mockRouter as Router,
            mockFileOpener as FileOpener,
            mockToastController as ToastController,
            mockPopoverController as PopoverController,
            mockPlatform as Platform,
            mockTelemetryGeneratorService as TelemetryGeneratorService
        );
    });

    it('should be able to create an instance', () => {
        expect(CertificateViewPage).toBeTruthy();
    });

    describe('ngOnInit()', () => {
        it('should update header with title and kebab menu options for download', () => {
            // arrange
            mockAppHeaderService.showHeaderWithBackButton = jest.fn();
            // act
            certificateViewPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('ngAfterViewInit()', () => {
        it('should fetch and render certificate on screen', (done) => {
            const htmlElement = document.createElement('div');
            certificateViewPage.certificateContainer = new ElementRef(htmlElement);

            certificateViewPage.ngAfterViewInit();

            setTimeout(() => {
                done();
            });
        });
    });
    
    describe('ngOnDestroy()', () => {
        it('should unsubscribe header events',  () => {
            const htmlElement = document.createElement('div');
            certificateViewPage.certificateContainer = new ElementRef(htmlElement);
            certificateViewPage.ngAfterViewInit();
            certificateViewPage.ngOnDestroy();
        });
    });

    describe('showCertificateMenu()', () => {
        it('should skip the download', (done) => {
            const htmlElement = document.createElement('div');
            certificateViewPage.certificateContainer = new ElementRef(htmlElement);
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: null }))
            } as any)));
            certificateViewPage.pageData = {
                certificate: {
                    name: 'sample'
                } as any,
                courseId: 'sample_id'
            };
            certificateViewPage['activeUserId'] = 'user_id';

            certificateViewPage.showCertificateMenu({});

            expect(mockPopoverController.create).toHaveBeenCalled();
            setTimeout(() => {
                done();
            });
        });

        it('should skip the download if the type is not PDF or PNG', (done) => {
            const htmlElement = document.createElement('div');
            certificateViewPage.certificateContainer = new ElementRef(htmlElement);
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { option: { label: 'JPEG', value: {} } } }))
            } as any)));
            certificateViewPage.pageData = {
                certificate: {
                    name: 'sample'
                } as any,
                courseId: 'sample_id'
            };
            certificateViewPage['activeUserId'] = 'user_id';

            certificateViewPage.showCertificateMenu({});

            expect(mockPopoverController.create).toHaveBeenCalled();
            setTimeout(() => {
                done();
            });
        });

        it('should listen for download_as_pdf events and download certificate accordingly', (done) => {
            const htmlElement = document.createElement('div');
            certificateViewPage.certificateContainer = new ElementRef(htmlElement);
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { option: { label: 'PDF', value: {} } } }))
            } as any)));
            certificateViewPage.pageData = {
                certificate: {
                    name: 'sample'
                } as any,
                courseId: 'sample_id'
            };
            certificateViewPage['activeUserId'] = 'user_id';

            certificateViewPage.showCertificateMenu({});

            expect(mockPopoverController.create).toHaveBeenCalled();
            setTimeout(() => {
                expect(mockFileOpener.open).toHaveBeenCalledWith('SOME_DOWNLOAD_PATH', 'application/pdf');
                done();
            });
        });

        it('should listen for download_as_pdf events and download certificate accordingly', (done) => {
            const htmlElement = document.createElement('div');
            certificateViewPage.certificateContainer = new ElementRef(htmlElement);
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { option: { label: 'PNG', value: {} } } }))
            } as any)));
            certificateViewPage.pageData = {
                certificate: {
                    name: 'sample'
                } as any,
                courseId: 'sample_id'
            };
            certificateViewPage['activeUserId'] = 'user_id';

            certificateViewPage.showCertificateMenu({});

            expect(mockPopoverController.create).toHaveBeenCalled();
            setTimeout(() => {
                expect(mockFileOpener.open).toHaveBeenCalledWith('SOME_DOWNLOAD_PATH', 'image/png');
                done();
            });
        });

        it('should call present toast message when listenActionEvents called upon', () =>{
            // arrange
        mockToastController.create = jest.fn(() => {
            return Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({}))
            });
        }) as any;
        // act
        certificateViewPage.showCertificateMenu({});
        setTimeout(() => {
            expect(mockToastController.create).toHaveBeenCalled();
        }, 0);
        })
    })   
});
