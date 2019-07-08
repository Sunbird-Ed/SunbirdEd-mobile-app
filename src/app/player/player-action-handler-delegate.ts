export interface HierarchyInfo {
    contentType: string;
    identifier: string;
}
export interface User {
    uid: string;
}
export interface PlayerActionHandlerDelegate {
    onContentNotFound(identifier: string, hierarchyInfo: Array<HierarchyInfo>);
    onUserSwitch(user: User);
}
