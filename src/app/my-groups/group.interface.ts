import { CorrelationData, GroupActivity } from '@project-sunbird/sunbird-sdk';


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
