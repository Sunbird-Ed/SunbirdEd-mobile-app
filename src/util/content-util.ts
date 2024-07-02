import { Rollup, Content, ContentData, TelemetryObject, CorrelationData, FilterValue, ContentSearchFilter } from '@project-sunbird/sunbird-sdk';
import { CorReleationDataType } from '../services/telemetry-constants';
import { TrackingEnabled } from '@project-sunbird/client-services/models';
import { MimeType } from '../app/app.constant';
import { CsContentType } from '@project-sunbird/client-services/services/content';
export class ContentUtil {


  /**
   * Returns values from ContentData in a comma-separated string
   *  @param ContentData contentData
   *  @param string[] properties
   *  @returns string
   */

  public static mergeProperties(contentData: ContentData, properties: string[]): string {
    let displayStr: string;
    properties.forEach(ele => {
      if (contentData[ele]) {
        contentData[ele] = this.arrayEmptyStringCheck(contentData[ele]);
        if (displayStr) {
          displayStr = displayStr + ', ' + contentData[ele];
        } else {
          displayStr = contentData[ele];
        }
      }
    });
    return displayStr;
  }

  public static arrayEmptyStringCheck(value: Array<string | number>): Array<string> | string | object {
    let returnValue: Array<string | number>;
    if (value.constructor === Array) {
      returnValue = value.filter((el) => {
        return el !== null && el !== '';
      });
      return returnValue;
    } else {
      return value;
    }
  }

  /**
   * Returns rollup
   * @param HierarchyInfo[] hierarchyInfoList
   * @param string identifier
   * @returns Rollup
   */
  public static generateRollUp(hierarchyInfoList, identifier): Rollup {
    const rollUp = new Rollup();
    if (!hierarchyInfoList) {
      rollUp.l1 = identifier;
    } else {
      for (let i = 0; i < hierarchyInfoList.length; i++) {
        const element = hierarchyInfoList[i];
        rollUp['l' + (i + 1)] = element.identifier;
      }
    }
    return rollUp;
  }

  /**
   * Returns apt app icon
   * @param string appIcon
   * @param string basePath
   * @param boolean isNetworkAvailable
   * @returns string
   */
  public static getAppIcon(appIcon: string, basePath: string, isNetworkAvailable: boolean): string {
    if (appIcon) {
      if (appIcon.startsWith('http')) {
        if (!isNetworkAvailable) {
          appIcon = 'assets/imgs/ic_launcher.png';
        }
      } else if (basePath) {
        appIcon = basePath + '/' + appIcon;
      }
    }
    return appIcon;
  }

  public static resolvePDFPreview(content: Content): { url: string, availableLocally: boolean } | undefined {
    let pdf: { url: string, availableLocally: boolean } | undefined;

    if (!content.contentData.itemSetPreviewUrl) {
      return undefined;
    }

    try {
      pdf = { url: (new URL(content.contentData.itemSetPreviewUrl)).toString(), availableLocally: false };
    } catch (e) {
      pdf = { url: content.basePath + content.contentData.itemSetPreviewUrl, availableLocally: true };
    }

    return pdf;
  }

  /**
   * Returns TelemetryObject
   * @param any content
   * @returns TelemetryObject
   */
  public static getTelemetryObject(content): TelemetryObject {
    const identifier = content.identifier || content.contentId;
    let primaryCategory = content.contentData ? content.contentData.primaryCategory : content.primaryCategory;
    if (!primaryCategory) {
      primaryCategory = content.contentData ? content.contentData.contentType : content.contentType;
    }
    const pkgVersion = content.contentData ? content.contentData.pkgVersion : content.pkgVersion;
    return new TelemetryObject(identifier, primaryCategory, pkgVersion || '');
  }

  public static extractBaseUrl(url: string): string {
    if (url) {
      const pathArray = url.split('/');
      const protocol = pathArray[0];
      const host = pathArray[2];
      if (protocol && host) {
        return protocol + '//' + host;
      } else {
        return '';
      }
    }
    return '';
  }


  public static genrateUTMCData(params: { [param: string]: any }): CorrelationData[] {
    const utmParams = {};
    const cData: CorrelationData[] = [];
    Object.entries(params).forEach(([key, value]) => {
      try {
        const url: URL = new URL(value);
        const overrideChannelSlug = url.searchParams.get('channel');
        if (overrideChannelSlug) {
          cData.push({
            id: overrideChannelSlug,
            type: CorReleationDataType.SOURCE
          });
        }
      } catch (e) {
      }
      if ((key === 'utm_campaign') || (key === 'channel')) {
        if (params[key] && !Array.isArray(params[key])) {
          cData.push({ id: params[key], type: CorReleationDataType.SOURCE });
        } else {
          // should generate error telemetry for duplicate campaign parameter
        }
      } else {
        const chengeKeyUpperCase = key.split('_').map((elem) => {
          return (elem.charAt(0).toUpperCase() + elem.slice(1));
        });
        utmParams[chengeKeyUpperCase.join('')] = value;
      }
    });

    for(const param in utmParams) {
      if (utmParams[param] && !Array.isArray(utmParams[param])) {
        cData.push({ id: utmParams[param], type: param });
      } else {
        // should generate error telemetry for duplicate campaign parameter
      }
    }
    return cData;
  }

  public static isTrackable(content) {
    content = !content.trackable ? ((content.contentData && content.contentData.trackable) ? content.contentData : content) : content;
    // -1 - content, 0 - collection, 1 - enrolled (Trackable)
    if (content.trackable && content.trackable.enabled) {
      if (content.trackable.enabled === TrackingEnabled.YES) {
        // Trackable
        // if istrackable is defined, and true
        return 1;
      } else if (content.mimeType === MimeType.COLLECTION) {
        // Collection
        return 0;
      } else {
        // Content
        return -1;
      }
    } else {
      if (content.contentType && content.contentType.toLowerCase() === CsContentType.COURSE.toLowerCase()) {
        // Trackable
        return 1;
      } else if (content.mimeType === MimeType.COLLECTION) {
        // Collection
        return 0;
      } else {
        // Content
        return -1;
      }
    }
  }

  public static getAudienceFilter(searchFilter: ContentSearchFilter, supportedUserTypesConfig: Array<any>): FilterValue[] {
    let audienceFilter = [];
    searchFilter.values.forEach((element) => {
      if (element.apply) {
        const userTypeConfig = supportedUserTypesConfig.find(supportedUserType => supportedUserType.code === element.name);
        if (userTypeConfig && userTypeConfig['searchFilter']) {
          audienceFilter = audienceFilter.concat(this.createAudienceFilter(userTypeConfig['searchFilter']));
        } else {
          audienceFilter.push(element);
        }
      }
    });
    return audienceFilter;
  }

  private static createAudienceFilter(audienceSearchFilter: string[]): FilterValue[] {
    const audienceFilter: FilterValue[] = [];
    audienceSearchFilter.forEach((element) => {
      audienceFilter.push({
        name: element,
        count: 0,
        apply: true
      });
    });
    return audienceFilter;
  }
}
