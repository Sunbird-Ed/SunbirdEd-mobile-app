import { OnInit } from '@angular/core';
import { Content, ContentDelete } from '@project-sunbird/sunbird-sdk';

export interface AppStorageInfo {
    usedSpace: number;
    availableSpace: number;
}

export interface EmitedContents {
    selectedContentsInfo: any;
    selectedContents: ContentDelete[];
}

type SortAttribute = [keyof Content];

export interface DownloadManagerPageInterface extends OnInit {

    storageInfo: AppStorageInfo;
    downloadedContents: Content[];
    // loader?: Loading
    loader?: any

    ionViewWillEnter();
    ionViewWillLeave();

    deleteContents(emitedContents: EmitedContents): void;
    onSortCriteriaChange(sortAttribute: SortAttribute): void;
}
