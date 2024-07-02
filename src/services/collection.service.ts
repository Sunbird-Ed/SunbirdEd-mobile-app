import { Inject, Injectable } from '@angular/core';
import { CommonUtilService } from '../services/common-util.service';
import { ChildContentRequest, Content, ContentDetailRequest, ContentService } from '@project-sunbird/sunbird-sdk';

@Injectable()
export class CollectionService {

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private commonUtilService: CommonUtilService
  ) {
  }

  async fetchCollectionData(id, objectType): Promise<Content> {
    const option: ContentDetailRequest = {
      contentId: id,
      objectType,
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
