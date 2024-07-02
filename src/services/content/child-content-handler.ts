import { Injectable, Inject } from '@angular/core';
import { ContentService, ChildContentRequest, Content, HierarchyInfo } from '@project-sunbird/sunbird-sdk';

@Injectable({
    providedIn: 'root'
})
export class ChildContentHandler {
    public contentHierarchyInfo: HierarchyInfo[];
    constructor(@Inject('CONTENT_SERVICE') private contentService: ContentService) {
    }

    /**
     * Initiate the getChildContent call
     */
    public setChildContents(parentIdentifier: string, level: number, identifier: string): void {
        const option: ChildContentRequest = {
            contentId: parentIdentifier,
            hierarchyInfo: null,
            level
        };
        this.contentService.getChildContents(option).toPromise()
            .then((data: any) => {
                this.contentHierarchyInfo = this.getContentHierarchyInfo(identifier, data);
            })
            .catch((error: string) => {
            });
    }

    /**
     * Iteratively fetches the hierarchy of the given contentId
     */
    private getContentHierarchyInfo(identifier: string, childContentInfo: Content): HierarchyInfo[] {
        let hierarchyInfo: HierarchyInfo[];
        if (childContentInfo && childContentInfo.children && childContentInfo.children.length) {
            for (const element of childContentInfo.children) {
                if (!hierarchyInfo && element.identifier === identifier) {
                    return element.hierarchyInfo;
                } else if (!hierarchyInfo) {
                    hierarchyInfo = this.getContentHierarchyInfo(identifier, element);
                    if (hierarchyInfo) {
                        return hierarchyInfo;
                    }
                }
            }
        }
    }
}
