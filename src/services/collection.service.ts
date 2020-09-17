import { Injectable, Inject } from '@angular/core';
import {
  Content, ContentService, ContentDetailRequest, ChildContentRequest
} from 'sunbird-sdk';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Environment, InteractSubtype, PageId } from './telemetry-constants';
import { CommonUtilService } from '@app/services';


@Injectable()
export class CollectionService {

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private commonUtilService: CommonUtilService
  ) {
  }

  async fetchCollectionData(id): Promise<Content> {
    const option: ContentDetailRequest = {
      contentId: id,
      attachFeedback: true,
      emitUpdateIfAny: true,
      attachContentAccess: true
    };

    try {
      const data = await this.contentService.getContentDetails(option).toPromise();
      if (this.commonUtilService.networkInfo.isNetworkAvailable || !data.isAvailableLocally) {
        return this.getCourseHierarchy(option);
      } else {
        return this.getChildContents(id);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  private async getCourseHierarchy(request: ContentDetailRequest): Promise<Content> {
    return this.contentService.getContentHeirarchy(request).toPromise();
  }

  private async getChildContents(id): Promise<Content> {
    const option: ChildContentRequest = {
      contentId: id,
      hierarchyInfo: null
    };
    return this.contentService.getChildContents(option).toPromise();
  }

}
