import { Inject, Injectable } from '@angular/core';
import { Location } from '@angular/common';
import {
  AddActivitiesRequest, GroupService
} from 'sunbird-sdk';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import {
  Environment, InteractSubtype, InteractType, ID
} from '../telemetry-constants';
import { GroupErrorCodes } from '@app/app/app.constant';

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
      this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
      return;
    }

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ADD_TO_GROUP_CLICKED,
      Environment.GROUP,
      pageId,
      undefined, undefined, undefined, undefined, corRelationList);

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
        this.commonUtilService.showToast('ADD_ACTIVITY_ERROR_MSG');
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
      // if (e.body && e.body.error && e.body.error.activities && e.body.error.activities[0] === GroupErrorCodes.EXCEEDED_ACTIVITY_MAX_LIMIT) {
      //   this.commonUtilService.showToast('ERROR_MAXIMUM_ACTIVITY_COUNT_EXCEEDS');
      // } else {
      this.commonUtilService.showToast('ADD_ACTIVITY_ERROR_MSG');
      // }
      this.location.back();
    }
  }
}
