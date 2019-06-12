declare enum DownloadStatus {
  STATUS_FAILED = 0x00000010,
  STATUS_PAUSED = 0x00000004,
  STATUS_PENDING = 0x00000001,
  STATUS_RUNNING = 0x00000002,
  STATUS_SUCCESSFUL = 0x00000008
}

interface EnqueueRequest {
  uri: string;
  title: string;
  description: string;
  mimeType: string;

  visibleInDownloadsUi: true;
  notificationVisibility: number;

  // Either of the next three properties
  destinationInExternalFilesDir?: {
    dirType: string;
    subPath: string;
  };
  destinationInExternalPublicDir?: {
    dirType: string;
    subPath: string;
  };
  destinationUri?: string;

  headers: { [key: string]: string }[];
}

interface EnqueueFilter {
  ids?: string[];
  status?: DownloadStatus;
}

interface EnqueuedEntry {
  id: string;
  title: string;
  description: string;
  mediaType: string;
  localFilename: string;
  localUri: string;
  mediaproviderUri: string;
  uri: string;
  lastModifiedTimestamp: number;
  status: DownloadStatus;
  reason: number;
  bytesDownloadedSoFar: number;
  totalSizeBytes: number;
}

declare var downloadManager: {
  enqueue: (enqueueRequest: EnqueueRequest, callback?: (err, id: string) => void) => void;
  query: (filter: EnqueueFilter | undefined, callback?: (err, entries: EnqueuedEntry[]) => void) => void;
  remove: (ids: string[], callback?: (err, removeCount: number) => void) => void;
};
