import {CourseService} from '@project-sunbird/sunbird-sdk';
import {CertificateDownloadService} from 'sb-svg2pdf';
import {AppGlobalService, AppHeaderService, CommonUtilService} from '@app/services';
import {Router} from '@angular/router';
import {FileOpener} from '@ionic-native/file-opener/ngx';
import {ToastController} from '@ionic/angular';
import {CertificateViewPage} from './certificate-view.page';
import {ElementRef} from '@angular/core';
import {EMPTY, of} from 'rxjs';

describe('CertificateViewPage', () => {
    const mockCourseService: Partial<CourseService> = {
        getCurrentProfileCourseCertificateV2: jest.fn(() => of('data:image/svg+xml,<svg height="100" width="100">\n' +
            '  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />\n' +
            '  Sorry, your browser does not support inline SVG.  \n' +
            '</svg>')),
        downloadCurrentProfileCourseCertificateV2: jest.fn(() => of({ path: 'SOME_DOWNLOAD_PATH' }))
    };
    const mockCertificateDownloadService: Partial<CertificateDownloadService> = {
        buildBlob: jest.fn(() => Promise.resolve(new Blob())),
    };
    const mockAppHeaderService: Partial<AppHeaderService> = {
        headerEventEmitted$: EMPTY,
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

    let certificateViewPage: CertificateViewComponent;

    beforeAll(() => {
        certificateViewPage = new CertificateViewPage(
            mockCourseService as CourseService,
            mockCertificateDownloadService as CertificateDownloadService,
            mockAppHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockAppGlobalService as AppGlobalService,
            mockRouter as Router,
            mockFileOpener as FileOpener,
            mockToastController as ToastController,
        );
    });

    it('should be able to create an instance', () => {
        expect(CertificateViewPage).toBeTruthy();
    });

    describe('ngOnInit()', () => {
        it('should update header with title and kebab menu options for download', () => {
            spyOn(mockAppHeaderService, 'getDefaultPageConfig').and.returnValue({});
            spyOn(mockAppHeaderService, 'updatePageConfig').and.stub();

            certificateViewPage.ngOnInit();

            expect(mockAppHeaderService.updatePageConfig).toHaveBeenCalledWith({
                pageTitle: 'SOME_CERTIFICATE_NAME',
                showKebabMenu: true,
                kebabMenuOptions: [
                    { label: 'DOWNLOAD_AS_PDF', value: {} },
                    { label: 'DOWNLOAD_AS_PNG', value: {} },
                ],
                actionButtons: [],
                showBurgerMenu: false
            });
        });
    });

    describe('ngAfterViewInit', () => {
        it('should fetch and render certificate on screen', (done) => {
            const htmlElement = document.createElement('div');
            certificateViewPage.certificateContainer = new ElementRef(htmlElement);

            certificateViewPage.ngAfterViewInit();

            setTimeout(() => {
                expect(mockCourseService.getCurrentProfileCourseCertificateV2).toHaveBeenCalled();
                expect(certificateViewPage.certificateContainer.nativeElement.innerHTML).toBeTruthy();
                done();
            });
        });

        it('should listen for download_as_pdf events and download certificate accordingly', (done) => {
            const htmlElement = document.createElement('div');
            certificateViewPage.certificateContainer = new ElementRef(htmlElement);
            mockAppHeaderService.headerEventEmitted$ = of({
                name: 'kebabMenu',
                event: {
                    option: { label: 'DOWNLOAD_AS_PDF', value: {} }
                }
            });

            certificateViewPage.ngOnInit();
            certificateViewPage.ngAfterViewInit();

            setTimeout(() => {
                expect(mockCourseService.downloadCurrentProfileCourseCertificateV2).toHaveBeenCalledWith(expect.objectContaining({
                    fileName: expect.any(String),
                    mimeType: 'application/pdf',
                    blob: expect.any(Blob),
                }));
                expect(mockFileOpener.open).toHaveBeenCalledWith('SOME_DOWNLOAD_PATH', 'application/pdf');
                done();
            });
        });

        it('should listen for download_as_png events and download certificate accordingly', (done) => {
            const htmlElement = document.createElement('div');
            certificateViewPage.certificateContainer = new ElementRef(htmlElement);
            mockAppHeaderService.headerEventEmitted$ = of({
                name: 'kebabMenu',
                event: {
                    option: { label: 'DOWNLOAD_AS_PNG', value: {} }
                }
            });

            certificateViewPage.ngOnInit();
            certificateViewPage.ngAfterViewInit();

            setTimeout(() => {
                expect(mockCourseService.downloadCurrentProfileCourseCertificateV2).toHaveBeenCalledWith(expect.objectContaining({
                    fileName: expect.any(String),
                    mimeType: 'application/pdf',
                    blob: expect.any(Blob),
                }));
                expect(mockFileOpener.open).toHaveBeenCalledWith('SOME_DOWNLOAD_PATH', 'image/png');
                done();
            });
        });
    });
});
