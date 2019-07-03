import { LoadingController } from '@ionic/angular';
import { Content, Profile, ContentDelete } from 'sunbird-sdk';
import { OnInit } from '@angular/core';

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
    // downloadService: DownloadService;
    // contentService: ContentService;
    // eventBusService: EventBusService;

    storageInfo: AppStorageInfo;
    downloadedContents: Content[];
    // migration-TODO
    // loader?: Loading
    loader?: any

    ionViewWillEnter();
    ionViewWillLeave();

    deleteContents(emitedContents: EmitedContents): void;
    onSortCriteriaChange(sortAttribute: SortAttribute): void;
}
