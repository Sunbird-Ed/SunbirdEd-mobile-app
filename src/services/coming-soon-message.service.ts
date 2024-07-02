import { Inject, Injectable } from '@angular/core';
import {
  Content,
  ContentService,
  ChildContentRequest,
  SharedPreferences,
  SystemSettingsService
} from '@project-sunbird/sunbird-sdk';
import { PreferenceKey, SystemSettingsIds, ContentConstants } from '../app/app.constant';

@Injectable()
export class ComingSoonMessageService {

  constructor(
    @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
    @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService
  ) {
  }

  async getComingSoonMessage(content: Content) {
    let comingSoonMsg;
    let data;

    if (content.contentData.altMsg) {
      comingSoonMsg = content.contentData.altMsg.find((altMsg) => altMsg.key === ContentConstants.COMING_SOON_MSG);
    } else {
      for (let i = (content.hierarchyInfo.length - 1); i >= 0; i--) {
        const option: ChildContentRequest = {
          contentId: content.hierarchyInfo[i].identifier,
          hierarchyInfo: []
        };

        data = await this.contentService.getChildContents(option).toPromise();

        if (data.contentData.altMsg) {
          comingSoonMsg = data.contentData.altMsg.find((altMsg) => altMsg.key === ContentConstants.COMING_SOON_MSG);
          break;
        }
      }
    }

    const selectedLanguage =
      await this.sharedPreferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();

    if (comingSoonMsg) {
      const messageTranslations = JSON.parse(comingSoonMsg.translations);
      return messageTranslations[selectedLanguage] || comingSoonMsg.value;
    } else {
      if (data && data.contentData && data.contentData.channel) {
        const systemSettings =
          await this.systemSettingsService.getSystemSettings({ id: SystemSettingsIds.CONTENT_COMING_SOON_MSG }).toPromise();
        const tenantMessages = JSON.parse(systemSettings.value);
        const tenantMessage = tenantMessages.find((message) => message.rootOrgId === data.contentData.channel);
        if (tenantMessage) {
          const tenantMessageTranslations = JSON.parse(tenantMessage.translations);
          return tenantMessageTranslations[selectedLanguage] || tenantMessage.value;
        }
      }
      return undefined;
    }
  }
}
