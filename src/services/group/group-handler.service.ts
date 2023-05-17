import { Inject, Injectable } from '@angular/core';
import { Location } from '@angular/common';
import {
  AddActivitiesRequest, GroupService
} from '@project-sunbird/sunbird-sdk';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { CommonUtilService } from '../../services/common-util.service';
import {
  Environment, InteractSubtype, InteractType, ID
} from '../telemetry-constants';
import { GroupErrorCodes } from '../../app/app.constant';

@Injectable({
  providedIn: 'root'
})
export class GroupHandlerService {
  constructor(
    @Inject('GROUP_SERVICE') private groupService: GroupService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private location: Location,
  ) {
  }

  public async addActivityToGroup(
    groupId: string,
    activityId: string,
    activityType,
    pageId,
    corRelationList,
    noOfPagesToRevertOnSuccess?: number
  ) {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
      return;
    }

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_ACTIVITY,
      InteractSubtype.ADD_TO_GROUP_CLICKED,
      Environment.GROUP,
      pageId,
      undefined, undefined, undefined, corRelationList, ID.SELECT_ACTIVITY);

    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.INITIATED,
      '',
      Environment.GROUP,
      pageId,
      undefined,
      undefined,
      undefined,
      corRelationList,
      ID.ADD_ACTIVITY_TO_GROUP);
    const addActivitiesRequest: AddActivitiesRequest = {
      groupId,
      addActivitiesRequest: {
        activities: [
          {
            id: activityId,
            type: activityType
          }
        ]
      }
    };

    try {
      const addActivityResponse = await this.groupService.addActivities(addActivitiesRequest).toPromise();

      await loader.dismiss();
      if (addActivityResponse.error
        && addActivityResponse.error.activities
        && addActivityResponse.error.activities.length) {
        if (addActivityResponse.error.activities[0].errorCode === GroupErrorCodes.EXCEEDED_ACTIVITY_MAX_LIMIT) {
          this.commonUtilService.showToast('ERROR_MAXIMUM_ACTIVITY_COUNT_EXCEEDS');
        } else {
          this.commonUtilService.showToast('ADD_ACTIVITY_ERROR_MSG');
        }
        this.location.back();
      } else {
        this.commonUtilService.showToast('ADD_ACTIVITY_SUCCESS_MSG');
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.SUCCESS,
          '',
          Environment.GROUP,
          pageId,
          undefined,
          undefined,
          undefined,
          corRelationList,
          ID.ADD_ACTIVITY_TO_GROUP
        );
        window.history.go(noOfPagesToRevertOnSuccess || -2);
      }
    } catch (e) {
      console.error(e);
      await loader.dismiss();
      this.commonUtilService.showToast('ADD_ACTIVITY_ERROR_MSG');
      this.location.back();
    }
  }
}
