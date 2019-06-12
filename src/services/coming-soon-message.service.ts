import { Inject, Injectable } from '@angular/core';
import {
  Content,
  ContentService,
  ChildContentRequest,
  FrameworkService,
  SharedPreferences,
  SystemSettingsService
} from 'sunbird-sdk';
import { PreferenceKey, SystemSettingsIds, ContentConstants } from '../app/app.constant';
import { CommonUtilService } from './common-util.service';

@Injectable()
export class ComingSoonMessageService {

  constructor(
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
    @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
    private commonUtilService: CommonUtilService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService
  ) {
  }

  async getComingSoonMessage(textBookUnitChannelId?: any, childData?: Content) {
    const currentChannelId = await this.frameworkService.getActiveChannelId().toPromise();

    if (childData.contentData.altMsg) {

      var comingSoonMsg = childData.contentData.altMsg.find((altMsg) => altMsg.key === ContentConstants.COMING_SOON_MSG);

    } else {
      for (let i = (childData.hierarchyInfo.length - 1); i >= 0; i--) {
        const option: ChildContentRequest = {
          contentId: childData.hierarchyInfo[i].identifier,
          hierarchyInfo: []
        };

        const data = await this.contentService.getChildContents(option).toPromise();

        if (data.contentData.altMsg) {
          comingSoonMsg = data.contentData.altMsg.find((altMsg) => altMsg.key === ContentConstants.COMING_SOON_MSG);
          break;
        }
      }
    }
    if (textBookUnitChannelId) {
      const selectedLanguage =
        await this.sharedPreferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();

      if (comingSoonMsg) {
        const messageTranslations = JSON.parse(comingSoonMsg.translations);
        return messageTranslations[selectedLanguage!] || comingSoonMsg.value;
      } else {
        const systemSettings =
          await this.systemSettingsService.getSystemSettings({ id: SystemSettingsIds.CONTENT_COMING_SOON_MSG }).toPromise();
        const tenantMessages: { rootOrgId: string, translations: string, value: string }[] = JSON.parse(systemSettings.value);
        const tenantMessage = tenantMessages.find((message) => message.rootOrgId === currentChannelId);
        if (tenantMessage) {
          const tenantMessageTranslations = JSON.parse(tenantMessage.translations);
          return tenantMessageTranslations[selectedLanguage!] || tenantMessage.value;
        }
      }
    }
    return this.commonUtilService.translateMessage('CONTENT_IS_BEEING_ADDED') + childData.contentData.name;
  }
}
