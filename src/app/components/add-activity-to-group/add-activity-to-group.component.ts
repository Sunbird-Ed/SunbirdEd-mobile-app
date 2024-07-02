import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonUtilService } from '../../../services/common-util.service';
import { GroupHandlerService } from '../../../services/group/group-handler.service';
import { CsGroupAddableBloc, CsGroupAddableState } from '@project-sunbird/client-services/blocs';
import { Observable, of } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'add-activity-to-group',
    templateUrl: './add-activity-to-group.component.html',
    styleUrls: ['./add-activity-to-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddActivityToGroupComponent implements OnInit {

    @Input() identifier: string;
    @Input() pageId: string;
    state$: Observable<CsGroupAddableState | undefined>;

    constructor(
        private groupHandlerService: GroupHandlerService,
        private commonUtilService: CommonUtilService
    ) {
    }

    ngOnInit() {
        if (CsGroupAddableBloc.instance.initialised) {
            this.state$ = CsGroupAddableBloc.instance.state$.pipe(
                filter((state) => state && state.pageIds.includes(this.pageId))
            );
        } else {
            this.state$ = of(undefined);
        }
    }

    async addActivityToGroup(state: CsGroupAddableState) {
        if (state.params.activityList) {
            const activityExist = state.params.activityList.find(activity => activity.id === this.identifier);
            if (activityExist) {
                this.commonUtilService.showToast('ACTIVITY_ALREADY_ADDED_IN_GROUP');
                return;
            }
        }
        await this.groupHandlerService.addActivityToGroup(state.groupId, this.identifier, state.params.activityType,
            this.pageId, state.params.corRelation, state.params.noOfPagesToRevertOnSuccess);
    }

}
