import { CorrelationData } from '@project-sunbird/sunbird-sdk';


export interface AddActivityToGroup {
    groupId: string;
    activityId: string;
    activityType: string;
    pageId: string;
    corRelationList: Array<CorrelationData>;
}
