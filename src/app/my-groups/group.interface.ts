import { CorrelationData, Group, GroupActivity } from '@project-sunbird/sunbird-sdk';


export interface AddActivityToGroup {
    groupId: string;
    activityId: string;
    activityType: string;
    pageId: string;
    corRelationList: Array<CorrelationData>;
    activityList?: GroupActivity[];
    source?: string;
    noOfPagesToRevertOnSuccess?: number;
}

export interface ActivityData {
    group: Group,
    activity: any,
    isGroupCreatorOrAdmin: boolean
}
