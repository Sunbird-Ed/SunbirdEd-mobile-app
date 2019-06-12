// import {
//   App,
//   ToastController
// } from 'ionic-angular';
// import {
//   TestBed,
//   inject
// } from '@angular/core/testing';
// import { } from 'jasmine';
// import {
//   ServiceProvider,
//   TelemetryService,
//   ContentService,
//   PageId,
//   CorrelationData,
//   InteractSubtype,
//   Environment,
//   TelemetryObject,
//   InteractType,
//   Mode,
//   SharedPreferences
// } from 'sunbird';
// import { Config } from 'ionic-angular';
// import { Platform } from 'ionic-angular';

// import { TelemetryGeneratorService } from '../../service/telemetry-generator.service';
// import { QRScannerResultHandler } from './qrscanresulthandler.service';
// import { Network } from '@ionic-native/network';
// import { CommonUtilService } from '../../service/common-util.service';
// import {
//   TranslateService,
//   TranslateModule,
//   TranslateLoader,
//   TranslateFakeLoader
// } from '@ngx-translate/core';
// import {
//   AppMock, ToastControllerMockNew, DeepLinkerMock
// } from '../../../test-config/mocks-ionic';
// import { mockRes } from '../qrscanner/qrscanresulthandler.service.spec.data';
// import { NetworkMock } from 'ionic-mocks';
// import { LoadingController } from 'ionic-angular';
// import { Events } from 'ionic-angular';
// import { PopoverController } from 'ionic-angular';
// import { DeepLinker } from 'ionic-angular';

// describe('QRScannerResultHandler', () => {
//   let service: QRScannerResultHandler;
//   const VALID_DIALCODE_LINK = 'https://staging.open-sunbird.org/dial/SAMPLE';
//   const VALID_CONTENT_LINK = 'https://staging.open-sunbird.org/play/content/SAMPLE';
//   const VALID_COLLECTION_LINK = 'https://staging.open-sunbird.org/play/collection/SAMPLE';
//   const VALID_COURSE_LINK = 'https://staging.open-sunbird.org/learn/course/SAMPLE';

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         TranslateModule.forRoot({
//           loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
//         })
//       ],
//       providers: [
//         QRScannerResultHandler, ServiceProvider, Config, LoadingController,
//         SharedPreferences, Events, PopoverController,
//         Platform, TelemetryGeneratorService, TelemetryService,
//         Network, QRScannerResultHandler, ContentService,
//         CommonUtilService, ToastController, TranslateService,
//         { provide: DeepLinker, useValue: DeepLinkerMock},
//         { provide: App, useClass: AppMock },
//         { provide: ToastController, useFactory: () => ToastControllerMockNew.instance() },
//         { provide: Network, useFactory: () => NetworkMock.instance('none') },
//       ]
//     });
//   });

//   beforeEach(inject([QRScannerResultHandler], (qrscanresulthandler: QRScannerResultHandler) => {
//     service = qrscanresulthandler;
//   }));

//   it('#isDialCode should validate a valid dialcode link', () => {
//     const result: Boolean = service.isDialCode(VALID_DIALCODE_LINK);
//     expect(result).toBe(true);
//   });

//   it('#isDialCode should validate a invalid dialcode link', () => {
//     const result: Boolean = service.isDialCode(VALID_CONTENT_LINK);
//     expect(result).toBe(false);
//   });

//   it('#isDialCode should validate a invalid dialcode link', () => {
//     const result: Boolean = service.isDialCode('XYZ');
//     expect(result).toBe(false);
//   });

//   it('#isContentId should validate valid content link', () => {
//     const result: Boolean = service.isContentId(VALID_CONTENT_LINK);
//     expect(result).toBe(true);
//   });

//   it('#isContentId should validate valid collection link', () => {
//     const result: Boolean = service.isContentId(VALID_COLLECTION_LINK);
//     expect(result).toBe(true);
//   });

//   it('#isContentId should validate valid course link', () => {
//     const result: Boolean = service.isContentId(VALID_COURSE_LINK);
//     expect(result).toBe(true);
//   });

//   it('#isContentId should validate invalid  link', () => {
//     const result: Boolean = service.isContentId('XYX');
//     expect(result).toBe(false);
//   });

//   it('should validate dialcode link', () => {
//     const result: Boolean = service.isContentId(VALID_DIALCODE_LINK);
//     expect(result).toBe(false);
//   });

//   it('#handleDialCode should handle valid dialcode', () => {
//     spyOn(service, 'generateQRScanSuccessInteractEvent').and.callThrough().and.callFake((success) => {
//     });
//     service.handleDialCode(PageId.COURSES, VALID_DIALCODE_LINK);
//     expect(service.generateQRScanSuccessInteractEvent).toHaveBeenCalledWith(VALID_DIALCODE_LINK, 'SearchResult', 'SAMPLE');
//   });

//   it('#handleContentId should handle valid  course contentId  and navigate to Coursedetails page', () => {
//     const contentService = TestBed.get(ContentService);
//     spyOn(contentService, 'getContentDetail').and.callFake(({ }, success, error) => {
//       return success(mockRes.sampleCourseDetailsResponse);
//     });
//     spyOn(service, 'generateQRScanSuccessInteractEvent').and.callThrough().and.callFake((success) => {
//     });
//     spyOn(service, 'navigateToDetailsPage').and.callThrough();
//     service.handleContentId(PageId.COURSES, VALID_CONTENT_LINK);
//     const corRelationList: Array<CorrelationData> = new Array<CorrelationData>();
//     const corRelation: CorrelationData = new CorrelationData();
//     corRelation.id = 'do_sample';
//     corRelation.type = 'qr';
//     corRelationList.push(corRelation);
//     expect(service.generateQRScanSuccessInteractEvent).toHaveBeenCalledWith(VALID_CONTENT_LINK, 'ContentDetail', 'SAMPLE');
//     expect(service.navigateToDetailsPage).toHaveBeenCalledWith(JSON.parse(mockRes.sampleCourseDetailsResponse).result, corRelationList);
//   });

//   it('#handleContentId should handle valid  collection contentId  and navigate to Collectiondetails page', () => {
//     const app = TestBed.get(App);
//     const contentService = TestBed.get(ContentService);
//     spyOn(contentService, 'getContentDetail').and.callFake(({ }, success, error) => {
//       return success(mockRes.sampleCollectionDetailsResponse);
//     });
//     spyOn(service, 'generateQRScanSuccessInteractEvent').and.callThrough().and.callFake((success) => {
//     });
//     spyOn(service, 'navigateToDetailsPage').and.callThrough();
//     service.handleContentId(PageId.COURSES, VALID_CONTENT_LINK);
//     const corRelationList: Array<CorrelationData> = new Array<CorrelationData>();
//     const corRelation: CorrelationData = new CorrelationData();
//     corRelation.id = 'do_sample';
//     corRelation.type = 'qr';
//     corRelationList.push(corRelation);
//     expect(service.generateQRScanSuccessInteractEvent).toHaveBeenCalledWith(VALID_CONTENT_LINK, 'ContentDetail', 'SAMPLE');
//     expect(service.navigateToDetailsPage).toHaveBeenCalledWith(JSON.parse(mockRes.sampleCollectionDetailsResponse).result, corRelationList);
//   });

//   it('#handleContentId should handle valid  contentId  and navigate to ContentDetails page', () => {
//     const contentService = TestBed.get(ContentService);
//     spyOn(contentService, 'getContentDetail').and.callFake(({ }, success, error) => {
//       return success(mockRes.sampleContentDetailsResponse);
//     });
//     spyOn(service, 'generateQRScanSuccessInteractEvent').and.callThrough().and.callFake((success) => {
//     });
//     spyOn(service, 'navigateToDetailsPage').and.callThrough();
//     service.handleContentId(PageId.COURSES, VALID_CONTENT_LINK);
//     const corRelationList: Array<CorrelationData> = new Array<CorrelationData>();
//     const corRelation: CorrelationData = new CorrelationData();
//     corRelation.id = 'do_sample';
//     corRelation.type = 'qr';
//     corRelationList.push(corRelation);
//     expect(service.generateQRScanSuccessInteractEvent).toHaveBeenCalledWith(VALID_CONTENT_LINK, 'ContentDetail', 'SAMPLE');
//     expect(service.navigateToDetailsPage).toHaveBeenCalledWith(JSON.parse(mockRes.sampleContentDetailsResponse).result, corRelationList);
//   });

//   it('#handleContentId should handle error condition from getCOntentDetialsAPI', () => {
//     const contentService = TestBed.get(ContentService);
//     const commonUtilService = TestBed.get(CommonUtilService);
//     spyOn(commonUtilService, 'showToast').and.callThrough();
//     spyOn(service, 'generateQRScanSuccessInteractEvent').and.callThrough().and.callFake((success) => {
//     });
//     spyOn(contentService, 'getContentDetail').and.callFake(({ }, success, error) => {
//       return error();
//     });
//     service.handleContentId(PageId.COURSES, VALID_CONTENT_LINK);
//     expect(commonUtilService.showToast).toHaveBeenCalledWith('UNKNOWN_QR');
//   });

//   it('#handleInvalidQRCode should handle invalid  QRcode', () => {
//     spyOn(service, 'generateQRScanSuccessInteractEvent').and.callThrough().and.callFake((success) => {
//     });
//     spyOn(service, 'generateEndEvent').and.callThrough().and.callFake((success) => {
//     });
//     service.handleInvalidQRCode(PageId.COURSES, 'XYZ');
//     expect(service.generateQRScanSuccessInteractEvent).toHaveBeenCalledWith('XYZ', 'UNKNOWN', undefined);
//     expect(service.generateEndEvent).toHaveBeenCalledWith(PageId.COURSES, 'XYZ');
//   });

//   it('#generateQRScanSuccessInteractEvent should generate telemetry for given arguments', () => {
//     const telemetryGeneratorService = TestBed.get(TelemetryGeneratorService);
//     spyOn(telemetryGeneratorService, 'generateInteractTelemetry');
//     service.generateQRScanSuccessInteractEvent('SAMPLE', 'ContentDetail', 'SAMPLE');
//     const values = new Map();
//     values['NetworkAvailable'] = 'Y';
//     values['ScannedData'] = 'SAMPLE';
//     values['Action'] = 'ContentDetail';

//     const telemetryObject: TelemetryObject = new TelemetryObject();
//     telemetryObject.id = 'SAMPLE';
//     telemetryObject.type = 'qr';
//     expect(telemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER, InteractSubtype.QRCodeScanSuccess,
//       Environment.HOME,
//       PageId.QRCodeScanner, telemetryObject,
//       values);
//   });

//   it('#generateQRScanSuccessInteractEvent should generate telemetry for given arguments(if dial code is not available)', () => {
//     const telemetryGeneratorService = TestBed.get(TelemetryGeneratorService);
//     spyOn(telemetryGeneratorService, 'generateInteractTelemetry');
//     service.generateQRScanSuccessInteractEvent('SAMPLE', 'ContentDetail', undefined);
//     const values = new Map();
//     values['NetworkAvailable'] = 'Y';
//     values['ScannedData'] = 'SAMPLE';
//     values['Action'] = 'ContentDetail';

//     const telemetryObject: TelemetryObject = new TelemetryObject();
//     expect(telemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER, InteractSubtype.QRCodeScanSuccess,
//       Environment.HOME,
//       PageId.QRCodeScanner, telemetryObject,
//       values);
//   });

//   it('#generateEndEvent should generate telemetry for given arguments', () => {
//     const telemetryGeneratorService = TestBed.get(TelemetryGeneratorService);
//     spyOn(telemetryGeneratorService, 'generateEndTelemetry');
//     service.generateEndEvent(PageId.COURSES, 'SAMPLE');
//     const telemetryObject: TelemetryObject = new TelemetryObject();
//     telemetryObject.id = 'SAMPLE';
//     telemetryObject.type = 'qr';
//     expect(telemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith('qr',
//       Mode.PLAY,
//       PageId.COURSES,
//       Environment.HOME,
//       telemetryObject);
//   });

// });
