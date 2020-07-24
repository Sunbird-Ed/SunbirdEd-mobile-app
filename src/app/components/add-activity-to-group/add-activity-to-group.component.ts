import { Component, Input } from '@angular/core';
import { GroupHandlerService } from '@app/services';
import { AddActivityToGroup } from '@app/app/my-groups/group.interface';

@Component({
    selector: 'add-activity-to-group',
    templateUrl: './add-activity-to-group.component.html',
    styleUrls: ['./add-activity-to-group.component.scss'],
})
export class AddActivityToGroupComponent {

    @Input() data: AddActivityToGroup;

    constructor(
        private groupHandlerService: GroupHandlerService
    ) {
    }

    async addActivityToGroup() {
        this.groupHandlerService.addActivityToGroup(this.data.groupId, this.data.activityId, this.data.activityType,
            this.data.pageId, this.data.corRelationList);
    }

}
