import { Inject, Injectable } from '@angular/core';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import {
  FrameworkService,
  PageAssembleService,
  Content,
  ContentDetailRequest,
  ContentService,
  CorrelationData,
  TelemetryObject,
  TelemetryService,
} from 'sunbird-sdk';
import { EventTopics, RouterLinks } from '../app/app.constant';

import { CommonUtilService } from './common-util.service';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  Mode,
  PageId,
  ObjectType,
  CorReleationDataType,
} from './telemetry-constants';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, Events } from '@ionic/angular';
import { AppGlobalService } from './app-global-service.service';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { ContentUtil } from '@app/util/content-util';
import * as qs from 'qs';
import { NavigationService } from './navigation-handler.service';

declare var cordova;

@Injectable()
export class QRScannerResultHandler {
  private static readonly CORRELATION_TYPE = 'qr';
  source: string;
  inAppBrowserRef: any;
  scannedUrlMap: object;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    @Inject('PAGE_ASSEMBLE_SERVICE') private pageAssembleService: PageAssembleService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private router: Router,
    private navCtrl: NavController,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private formFrameWorkUtilService: FormAndFrameworkUtilService,
    private navService: NavigationService
  ) {
  }

  async parseDialCode(scannedData: string): Promise<string | undefined> {
    const dailCodeRegExpression = await this.formFrameWorkUtilService.getDialcodeRegexFormApi();
    const execArray = (new RegExp(dailCodeRegExpression)).exec(scannedData);
    if (execArray && execArray.groups) {
      try {
        const url: URL = new URL(scannedData);
        const overrideChannelSlug = url.searchParams.get('channel');

        if (overrideChannelSlug) {
          this.frameworkService.searchOrganization({
            filters: {
              slug: overrideChannelSlug,
              isRootOrg: true
            } as any
          }).toPromise().then((result) => {
            const org: any = result.content && result.content[0];

            if (org) {
              this.pageAssembleService.setPageAssembleChannel({
                channelId: org.id
              });

              setTimeout(() => {
                this.events.publish(EventTopics.COURSE_PAGE_ASSEMBLE_CHANNEL_CHANGE);
              }, 500);
            }
          });
        }
      } catch (e) {
        console.error(e);
      }

      this.scannedUrlMap = execArray.groups;
      return execArray.groups[Object.keys(execArray.groups).find((key) => !!execArray.groups[key])];
    }
    return undefined;
  }

  isContentId(scannedData: string): boolean {
    const results = scannedData.split('/');
    const type = results[results.length - 2];
    const action = results[results.length - 3];
    const scope = results[results.length - 4];
    return (type === 'content' && scope === 'public') ||
      (action === 'play' && (type === 'collection' || type === 'content')) ||
      (action === 'explore-course' && type === 'course');
  }

  handleDialCode(source: string, scannedData, dialCode: string) {
    this.source = source;
    this.generateQRScanSuccessInteractEvent(scannedData, 'SearchResult', dialCode);
    const telemetryObject = new TelemetryObject(dialCode, 'qr', ' ');
    const utmUrl = scannedData.slice(scannedData.indexOf('?') + 1);
    const params: {[param: string]: string} = qs.parse(utmUrl);
    const cData: Array<CorrelationData> = [];

    if (utmUrl !== scannedData) {
      ContentUtil.genrateUTMCData(params).forEach((element) => {
        cData.push(element);
      });
    }
    const corRelationData: CorrelationData[] = [{
      id: CorReleationDataType.SCAN,
      type: CorReleationDataType.ACCESS_TYPE
    }];
    if (cData && cData.length) {
      this.telemetryService.updateCampaignParameters(cData);
      this.telemetryGeneratorService.generateUtmInfoTelemetry(params, PageId.QRCodeScanner, telemetryObject, corRelationData);
    }
    const navigationExtras: NavigationExtras = {
      state: {
        dialCode,
        corRelation: this.getCorRelationList(dialCode, QRScannerResultHandler.CORRELATION_TYPE, scannedData),
        source: this.source,
        shouldGenerateEndTelemetry: true
      }
    };
    this.generateImpressionEvent(this.source, dialCode);
    this.navCtrl.navigateForward([`/${RouterLinks.SEARCH}`], navigationExtras);
  }

  handleContentId(source: string, scannedData: string) {
    this.source = source;
    const results = scannedData.split('/');
    const contentId = results[results.length - 1];
    this.generateQRScanSuccessInteractEvent(scannedData, 'ContentDetail', contentId);
    const utmUrl = scannedData.slice(scannedData.indexOf('?') + 1);
    const params: {[param: string]: string} = qs.parse(utmUrl);
    const cData: CorrelationData[] = [];

    if (utmUrl !== scannedData) {
      ContentUtil.genrateUTMCData(params).forEach((element) => {
       cData.push(element);
     });
   }
    const request: ContentDetailRequest = {
      contentId
    };
    this.contentService.getContentDetails(request).toPromise()
      .then((content: Content) => {
        const corRelationData: CorrelationData[] = [{
          id: CorReleationDataType.SCAN,
          type: CorReleationDataType.ACCESS_TYPE
        }];
        if (cData && cData.length) {
          this.telemetryService.updateCampaignParameters(cData);
          this.telemetryGeneratorService.generateUtmInfoTelemetry(params,
            PageId.QRCodeScanner, ContentUtil.getTelemetryObject(content), corRelationData);
        }

        this.navigateToDetailsPage(content,
          this.getCorRelationList(content.identifier, QRScannerResultHandler.CORRELATION_TYPE, scannedData));
        this.telemetryGeneratorService.generateImpressionTelemetry(
          ImpressionType.VIEW, ImpressionSubtype.QR_CODE_VALID,
          PageId.QRCodeScanner,
          Environment.HOME,
          contentId, ObjectType.QR, ''
        );
      }).catch(() => {
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
        } else {
          this.commonUtilService.showToast('UNKNOWN_QR');
          this.telemetryGeneratorService.generateImpressionTelemetry(
            ImpressionType.VIEW, ImpressionSubtype.INVALID_QR_CODE,
            PageId.QRCodeScanner,
            Environment.HOME,
            contentId, ObjectType.QR, ''
          );
        }
      });
  }

  handleCertsQR(source: string, scannedData: string) {
    this.generateQRScanSuccessInteractEvent(scannedData, 'OpenBrowser', undefined, {
      certificateId: scannedData.split('/certs/')[1], scannedFrom: 'mobileApp'
    });
    this.telemetryService.buildContext().subscribe(context => {
      scannedData = scannedData + '?clientId=android&context=' + encodeURIComponent(JSON.stringify(context));
      this.inAppBrowserRef = cordova.InAppBrowser.open(scannedData, '_blank', 'zoom=no');
      this.inAppBrowserRef.addEventListener('loadstart', (event) => {
        if (event.url) {
          if (event.url.includes('explore-course')) {
            this.inAppBrowserRef.close();
            this.events.publish('return_course');
          }
        }
      });
    });
  }

  handleInvalidQRCode(source: string, scannedData: string) {
    this.source = source;
    this.generateQRScanSuccessInteractEvent(scannedData, 'UNKNOWN', undefined);
    this.generateEndEvent(this.source, scannedData);
  }

  getCorRelationList(identifier: string, type: string, scannedData): Array<CorrelationData> {
    const corRelationList: Array<CorrelationData> = new Array<CorrelationData>();
    corRelationList.push({id: identifier, type});
    corRelationList.push({
      id: ContentUtil.extractBaseUrl(scannedData),
      type: CorReleationDataType.SOURCE
    });
    return corRelationList;
  }

  navigateToDetailsPage(content, corRelationList) {
    const navigationExtras: NavigationExtras = {
      state: {
        content,
        corRelation: corRelationList,
        source: this.source,
        shouldGenerateEndTelemetry: true
      }
    };

    this.navService.navigateToDetailPage(
      content,
      navigationExtras.state
    );
  }

  generateQRScanSuccessInteractEvent(scannedData, action, dialCode?, certificate?:
    { certificateId: string, scannedFrom: 'mobileApp' | 'genericApp' }) {
    const values = new Map();
    values['networkAvailable'] = this.commonUtilService.networkInfo.isNetworkAvailable ? 'Y' : 'N';
    values['scannedData'] = scannedData;
    values['action'] = action;
    values['compatibile'] = (action === 'OpenBrowser' || action === 'SearchResult' || action === 'ContentDetail') ? 1 : 0;
    if (this.scannedUrlMap) {
      values['dialCodeType'] = this.scannedUrlMap['sunbird'] ? 'standard' : 'non-standard';
    }
    let telemetryObject: TelemetryObject;

    if (dialCode) {
      telemetryObject = new TelemetryObject(dialCode, 'qr', undefined);
    }
    if (certificate) {
      values['scannedFrom'] = certificate.scannedFrom;
      telemetryObject = new TelemetryObject(certificate.certificateId, 'certificate', undefined);
    }

    const corRelationList: Array<CorrelationData> = [{
      id: ContentUtil.extractBaseUrl(scannedData),
      type: CorReleationDataType.SOURCE
    }];

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.QRCodeScanSuccess,
      Environment.HOME,
      PageId.QRCodeScanner, telemetryObject,
      values,
      undefined,
      corRelationList
    );
  }

  generateEndEvent(pageId: string, qrData: string) {
    if (pageId) {
      const telemetryObject = new TelemetryObject(qrData, QRScannerResultHandler.CORRELATION_TYPE, undefined);

      this.telemetryGeneratorService.generateEndTelemetry(
        QRScannerResultHandler.CORRELATION_TYPE,
        Mode.PLAY,
        pageId,
        Environment.HOME,
        telemetryObject
      );
    }
  }

  private generateImpressionEvent(source, dialCode) {
    const corRelationList: Array<CorrelationData> = [];
    corRelationList.push({id: dialCode, type: CorReleationDataType.QR});
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.PAGE_REQUEST, '',
      PageId.QR_BOOK_RESULT,
      source ? Environment.ONBOARDING : Environment.HOME, '', '', '',
      undefined,
      corRelationList);
  }
}
