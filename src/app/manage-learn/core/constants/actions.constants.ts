export const actions = {
  PROJECT_ACTIONS: [
    {
      title: "DOWNLOAD",
      icon: "cloud-download",
      action: "download",
      color: 'primary'
    },
    {
      title: "SHARE",
      icon: "share",
      action: "share",
      color: 'primary'
    },
    {
      title: "EDIT",
      icon: "create",
      action: "edit",
      color: 'primary'
    },
    {
      title: "FRMELEMNTS_LBL_FILES",
      icon: "folder-open",
      action: "files",
      color: 'primary'
    },
    {
      title: "FRMELEMNTS_LBL_SYNCED",
      icon: "sync-circle",
      action: "synced",
      color: 'success'
    }
  ],
  SYNC_ACTION: {
    title: "FRMELEMNTS_LBL_SYNC",
    icon: "sync-circle",
    action: "sync",
    color: 'primary'
  },
  SYNCED_ACTION: {
    title: "FRMELEMNTS_LBL_SYNCED",
    icon: "sync-circle",
    action: "synced",
    color: 'success'
  },
  DOWNLOADED_ACTION: {
    title: "FRMELEMNTS_LBL_DOWNLOADED",
    icon: "checkmark-circle",
    action: "downloaded",
    color: 'success'
  },
  NOT_DOWNLOADED: {
      title: "DOWNLOAD",
      icon: "cloud-download",
      action: "download",
      color: 'primary'
  },
  SUBMITTED_PROJECT_ACTIONS: [
    {
      title: "SHARE",
      icon: "share",
      action: "share",
      color: 'primary'
    },
    {
      title: "FRMELEMNTS_LBL_FILES",
      icon: "folder-open",
      action: "files",
      color: 'primary'
    }
  ],

  TASK_FILE_DESCRIPTION:{
    label:'would you like to add any remarks or attach any files before you mark your task complete?'
  },
  PROJECT_FILE_DESCRIPTION:{
    label:'would you like to add any remarks or attach any files before you mark your task complete?'
  },
  FILE_UPLOAD_OPTIONS:[
    {
      title: "CAMERA",
      icon: "camera",
      action: "openCamera",
      color: 'primary'
    },
    {
      title: "GALLERY",
      icon: "images",
      action: "openGallery",
      color: 'primary'
    },
    {
      title: "FILES",
      icon: "document", 
      action: "openFiles",
      color: 'primary'
    },
    {
      title: "LINKS",
      icon: "link-outline", 
      action: "openLink",
      color: 'primary'
    }
  ]
}