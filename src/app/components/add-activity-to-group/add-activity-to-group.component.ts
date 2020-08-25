import { Component, Input } from '@angular/core';
import { GroupHandlerService, CommonUtilService } from '@app/services';
import { AddActivityToGroup } from '@app/app/my-groups/group.interface';

@Component({
    selector: 'add-activity-to-group',
    templateUrl: './add-activity-to-group.component.html',
    styleUrls: ['./add-activity-to-group.component.scss'],
})
export class AddActivityToGroupComponent {

    @Input() data: AddActivityToGroup;

    constructor(
        private groupHandlerService: GroupHandlerService,
        private commonUtilService: CommonUtilService
    ) {
    }

    async addActivityToGroup() {
        if (this.data.activityList) {
            const activityExist = this.data.activityList.find(activity => activity.id === this.data.activityId);
            if (activityExist) {
              this.commonUtilService.showToast('ACTIVITY_ALREADY_ADDED_IN_GROUP');
              return;
            }
        }
        this.groupHandlerService.addActivityToGroup(this.data.groupId, this.data.activityId, this.data.activityType,
            this.data.pageId, this.data.corRelationList, this.data.noOfPagesToRevertOnSuccess);
    }

}
