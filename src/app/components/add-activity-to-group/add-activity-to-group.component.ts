import { filter } from 'rxjs/operators';
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { GroupHandlerService, CommonUtilService } from '@app/services';
import { AddActivityToGroup } from '@app/app/my-groups/group.interface';
import {CsGroupAddableBloc, CsGroupAddableState} from '@project-sunbird/client-services/blocs';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'add-activity-to-group',
    templateUrl: './add-activity-to-group.component.html',
    styleUrls: ['./add-activity-to-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddActivityToGroupComponent implements OnInit {

    // data: any;
    // private csGroupAddableBloc: CsGroupAddableBloc;
    @Input() identifier: string;
    @Input() pageId: string;
    state$: Observable<CsGroupAddableState | undefined>;

    constructor(
        private groupHandlerService: GroupHandlerService,
        private commonUtilService: CommonUtilService
    ) {
        // this.csGroupAddableBloc = CsGroupAddableBloc.instance;
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
        this.groupHandlerService.addActivityToGroup(state.params.groupId, this.identifier, state.params.activityType,
            this.pageId, state.params.corRelationList, state.params.noOfPagesToRevertOnSuccess);
    }

}
