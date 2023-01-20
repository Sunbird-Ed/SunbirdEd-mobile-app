export const actions = {
  PROJECT_ACTIONS: [
    {
      title: "DOWNLOAD",
      icon: "cloud-download",
      action: "download",
      color: 'primary',
      id:'download'
    },
    {
      title: "SHARE",
      icon: "share",
      action: "share",
      color: 'primary',
      id:'share'
    },
    {
      title: "EDIT",
      icon: "create",
      action: "edit",
      color: 'primary',
      id:'edit'
    },
    {
      title: "FRMELEMNTS_LBL_FILES",
      icon: "folder-open",
      action: "files",
      color: 'primary',
      id:'files'
    },
    {
      title: "FRMELEMNTS_LBL_SYNCED",
      icon: "sync-circle",
      action: "synced",
      color: 'success',
      id:'synced'
    }
  ],
  SYNC_ACTION: {
    title: "FRMELEMNTS_LBL_SYNC",
    icon: "sync-circle",
    action: "sync",
    color: 'primary',
    id:'sync'
  },
  SYNCED_ACTION: {
    title: "FRMELEMNTS_LBL_SYNCED",
    icon: "sync-circle",
    action: "synced",
    color: 'success',
    id:'sync'
  },
  DOWNLOADED_ACTION: {
    title: "FRMELEMNTS_LBL_DOWNLOADED",
    icon: "checkmark-circle",
    action: "downloaded",
    color: 'success',
    id:'downloaded'
  },
  NOT_DOWNLOADED: {
      title: "DOWNLOAD",
      icon: "cloud-download",
      action: "download",
      color: 'primary',
      id:'download'
  },
  SUBMITTED_PROJECT_ACTIONS: [
    {
      title: "SHARE",
      icon: "share",
      action: "share",
      color: 'primary',
      id:'share'
    },
    {
      title: "FRMELEMNTS_LBL_FILES",
      icon: "folder-open",
      action: "files",
      color: 'primary',
      id:'files'
    }
  ],

  CERTIFICATE_ACTION:{
    title: "CERTIFICATE",
    icon: "ribbon",
    action: "certificate",
    color: 'success',
    id:'certificate'
  },

  TASK_FILE_DESCRIPTION:{
    label:'FRMELEMNTS_LBL_TASK_ATTACHMENTS_DESCRIPTION'
  },
  PROJECT_FILE_DESCRIPTION:{
    label:'FRMELEMNTS_LBL_PROJECT_ATTACHMENTS_DESCRIPTION'
  },
  FILE_UPLOAD_OPTIONS:[
    {
      title: "CAMERA",
      icon: "camera",
      action: "openCamera",
      color: 'primary',
      id:'camera'
    },
    {
      title: "FRMELEMNTS_LBL_GALLERY",
      icon: "images",
      action: "openGallery",
      color: 'primary',
      id:'images'
    },
    {
      title: "FRMELEMNTS_LBL_FILES",
      icon: "document", 
      action: "openFiles",
      color: 'primary',
      id:'document'
    },
    {
      title: "FRMELEMNTS_LBL_LINKS",
      icon: "link-outline", 
      action: "openLink",
      color: 'primary',
      id:'openLink'
    }
  ]
}