export enum AndroidPermission {
  CAMERA = 'android.permission.CAMERA',
  WRITE_EXTERNAL_STORAGE = 'android.permission.WRITE_EXTERNAL_STORAGE',
  ACCESS_FINE_LOCATION = 'android.permission.ACCESS_FINE_LOCATION',
  RECORD_AUDIO = 'android.permission.RECORD_AUDIO'
}

export interface AndroidPermissionsStatus {
  hasPermission?: boolean;
  isPermissionAlwaysDenied?: boolean;
}
export interface PermissionAsked {
  isCameraAsked: boolean;
  isStorageAsked: boolean;
  isRecordAudioAsked: boolean;
}
export enum PermissionAskedEnum {
isCameraAsked = 'isCameraAsked',
isStorageAsked = 'isStorageAsked',
isRecordAudioAsked = 'isRecordAudioAsked'
}
