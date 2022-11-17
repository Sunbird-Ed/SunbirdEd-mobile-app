export const mockContent = {
   identifier :  'do_212936404296335360119' ,
   contentData : {
     ownershipType : [
       'createdBy'
    ],
     totalQuestions: 10,
     mimeType : 'application/vnd.ekstep.ecml-archive',
     gradeLevel : [
       'Class 9' ,
       'Class 10 '
    ],
     version : 2,
     streamingUrl : ' https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/ecml/do_212936404296335360119-latest' ,
     medium : [
       'English' ,
       'Hindi'
    ],
     resourceType :  'Teach'
  },
   isUpdateAvailable : false,
   mimeType :  'application/vnd.ekstep.ecml-archive' ,
   basePath :  '/_app_file_' ,
   contentType :  'resource' ,
   isAvailableLocally : false,
   rollup : {
     l1 :  'do_212936404296335360119'
  }
} as any;

export const mockPlayerConfigData = {
   metadata : mockContent,
   config : {
     showEndPage : false,
     endPage : [
      {
         template :  'assessment' ,
         contentType : [
           'SelfAssess'
        ]
      }
    ],
     splash : {
       webLink : ''  ,
       text : ''  ,
       icon : ''  ,
       bgImage : ' assets/icons/splacebackground_1.png'
    },
     overlay : {
       enableUserSwitcher : true,
       showUser : false
    },
     plugins : [
      {
         id :  'org.sunbird.player.endpage' ,
         ver :  '1.1' ,
         type :  'plugin'
      }
    ]
  },
   context : {
     did :  'ef37fc07aee31d87b386a408e0e4651e00486618' ,
     origin :  'https://staging.ntp.net.in' ,
     pdata : {
       id :  'staging.sunbird.app' ,
       pid :  'sunbird.app' ,
       ver :  '2.7.197staging-debug'
    },
     objectRollup : {
       l1 :  'do_212936404296335360119'
    },
     sid :  'e33e1b95-e6e5-400f-b438-35df4b65ee73' ,
     actor : {
       type :  'User' ,
       id :  '7ebe9375-425e-4325-ba39-eac799871ed4'
    },
     deeplinkBasePath : ''   ,
     cdata : [
      {
         id : ' 29c9c790-3845-11ea-8647-8b09062a2e3d' ,
         type :  'API'
      },
      {
         id :  'SearchResult' ,
         type :  'Section'
      },
      {
         id :  'streaming' ,
         type :  'PlayerLaunch'
      }
    ],
     channel :  '505c7c48ac6dc1edc9b08f21db5a571d'
  },
   appContext : {
     local : true,
     server : false,
     groupId : ''
  },
   data : {},
   uid :  '7ebe9375-425e-4325-ba39-eac799871ed4'
} as any;


