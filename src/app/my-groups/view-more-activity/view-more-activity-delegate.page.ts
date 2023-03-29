import { GroupActivity } from '@project-sunbird/sunbird-sdk';

export class ViewMoreActivityDelegateService {
    delegate?: ViewMoreActivityActionsDelegate;
}

export interface ViewMoreActivityActionsDelegate {
    onViewMoreCardClick(event: Event, activity: GroupActivity);
    onViewMoreCardMenuClick(event: Event, activity: GroupActivity): Promise<boolean>;
}