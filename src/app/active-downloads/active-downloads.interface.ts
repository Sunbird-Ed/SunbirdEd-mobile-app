import {ContentDownloadRequest, DownloadRequest} from 'sunbird-sdk';
import {OnInit} from '@angular/core';
import {Observable} from 'rxjs';

export interface ActiveDownloadsInterface extends OnInit {
    // eventBusService: EventBusService
    // contentService: ContentService
    // downloadService: DownloadService
    // networkConnectivity

    activeDownloadRequests$: Observable<ContentDownloadRequest[]>;

    cancelAllDownloads(): void;
    cancelDownload(downloadRequest: DownloadRequest): void;

  getContentDownloadProgress(contentId: string): number;
}
