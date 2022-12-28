export namespace NsContent {
  export interface IContinueLearningData extends IContent {
    continueData: any
  }

  export interface IContinueLearningDataReq {
    request: {
      userId: string | undefined,
      courseId: string,
      contentIds: string[],
      batchId: string | undefined | null
      fields?: string[]
    }
  }

  export interface IContent {
    platform?: any
    addedOn: string
    appIcon: string
    artifactUrl: string
    averageRating?: any
    body?: string
    certificationList?: IRelatedContentMeta[]
    certificationStatus?: TCertificationStatus
    certificationSubmissionDate?: string
    certificationUrl: string
    children: IContent[]
    childrenClassifiers?: string[]
    clients?: IClient[]
    collections?: IContent[]
    completionPercentage?: number | null
    completionStatus?: number
    complexityLevel: string
    contentId: string
    contentType: EContentTypes
    contentUrlAtSource: string
    creatorContacts: ICreator[]

    creatorDetails: ICreator[]
    creatorLogo: string
    creatorPosterImage: string
    creatorThumbnail: string

    curatedTags: string[]
    description: string
    displayContentType: EDisplayContentTypes // For UI
    downloadUrl?: string
    duration: number
    exclusiveContent?: boolean
    expiryDate?: string
    equivalentCertifications?: IRelatedContentMeta[]
    hasAccess: boolean
    hasAssessment?: string
    idealScreenSize?: string
    identifier: string
    introductoryVideo?: string
    introductoryVideoIcon?: string
    learningTrack?: string
    isExternal: boolean
    isIframeSupported: 'Yes' | 'No' | 'Maybe'
    isInIntranet?: boolean
    keywords?: string[]
    kArtifacts?: IRelatedContentMeta[]
    lastUpdatedOn: string
    learningMode?: TLearningMode
    learningObjective: string
    labels?: string[]
    locale?: string
    hasTranslations?: { identifier: string; locale: string }[]
    isTranslationOf?: { identifier: string; locale: string }[]
    me_totalSessionsCount: number
    mediaType: string
    mimeType: EMimeTypes
    minWingspanVersion?: string
    msArtifactDetails?: IMSArtifactDetails
    mode?: ETagType
    name: string
    nextCertificationAttemptDate?: string
    playgroundInstructions?: string
    playgroundResources?: IResourcePlayground[]
    postContents?: IPrePostContent[]
    posterImage?: string
    preContents?: IPrePostContent[]
    preRequisites: string
    price?: {
      currency: string
      value: number
    }
    primaryCategory: string,
    proctorUrl?: string
    progress?: IMarkAsCompleteProgress
    publishedOn: string
    recentCertificationAttemptScore?: number
    recommendationReasons?: string[]
    region?: string[]
    registrationUrl?: string
    registrationInstructions?: string
    resourceCategory?: string[]
    resourceType: string
    size?: number
    skills: ISkill[]
    softwareRequirements?: IResourceDetail[]
    sourceName: string
    sourceShortName: string
    sourceIconUrl?: string
    sourceUrl?: string
    ssoEnabled?: boolean
    status:
    | 'Draft'
    | 'InReview'
    | 'QualityReview'
    | 'Reviewed'
    | 'Processing'
    | 'Live'
    | 'Deleted'
    | 'MarkedForDeletion'
    | 'Expired'
    subTitle?: string
    subTitles?: ISubtitle[]
    studyMaterials?: IRelatedContentMeta[]
    systemRequirements?: string[]
    tags: ITag[]
    topics: IContentTopic[]
    totalLikes?: { [key: string]: number }
    totalRating?: number
    track: ITrack[]
    uniqueLearners?: number
    viewCount?: { [key: string]: number }
    reason?: string // required for Knowledge board
    trainingLHubCount?: number // for LHub trainings
    verifiers?: {
      // required for External Certifications
      name: string
      email: string
      id: string
    }[]
    references?: { url: string; title: string }[]
    resumePage?: number // For player WebModule in UI
    [key: string]: any
  }

  export interface IContentResponse {
    id: string,
    params: any,
    responseCode: string,
    result: {
      content: IContent
    },
    ts: string,
    ver: string
  }

  export interface IBatch {
    batchId: string,
    createdBy: string,
    endDate: string | null,
    enrollmentType: string,
    identifier: string,
    name: string,
    startDate: string,
    status: number
    cert_templates: null
    collectionId: string
    courseId: string
    createdDate: string
    createdFor: string[]
    description: null
    enrollmentEndDate: string | null
    id: string
    mentors: string[] | null
    tandc: null
    updatedDate: string | null
  }

  export interface IBatchListResponse {
    content?: IBatch[]
    count?: number,
    enrolled?: boolean,
  }

  export interface ICourse {
    active: true
    addedBy: string
    batch: IBatch
    batchId: string
    certificates: []
    collectionId: string
    completedOn: string | null
    completionPercentage: number | null
    completionStatus?: number
    content: IContent
    contentId: string
    contentStatus: any
    courseId: string
    courseLogoUrl: string
    courseName: string
    dateTime: number
    description: string
    enrolledDate: string
    issuedCertificates: []
    lastReadContentId: string | null
    lastReadContentStatus: string | null
    leafNodesCount: number
    progress: number
    status: number
    userId: string
  }

  export interface IContentMinimal {
    appIcon: string
    artifactUrl: string
    complexityLevel: string
    contentType: EContentTypes
    description: string
    displayContentType?: EDisplayContentTypes
        completionPercentage: number | null
    duration: number
    identifier: string
    hasAccess?: boolean
    isInIntranet?: boolean
    learningMode?: TLearningMode
    mimeType: EMimeTypes
    name: string
    creatorDetails: ICreator[]
    creatorContacts: ICreator[]
    PosterImage: string
    resourceType?: string
    totalRating?: number
  }

  export interface ICollectionHierarchyResponse {
    data: IContent
    hasMore: boolean
    totalContents: number
  }

  export interface IRelatedContentMeta {
    identifier: string
    name: string
  }

  type TCertificationStatus = 'ongoing' | 'passed' | 'canAttempt' | 'cannotAttempt'
  export type TLearningMode = 'Self-Paced' | 'Instructor-Led' | 'Open' | 'Closed'

  interface IMarkAsCompleteProgress {
    progressStatus: 'open' | 'started' | 'completed'
    showMarkAsComplete: boolean
    markAsCompleteReason: string
    progressSupported: boolean
    progress: number | null
  }

  interface ITag {
    id: string
    type: string
    value: string
  }
  interface IMSArtifactDetails {
    channelId: string
    videoId: string
  }
  interface IClient {
    displayName: string
    id: string
    name: string
  }
  interface ISubtitle {
    srclang: string
    label: string
    url: string
  }
  interface IPrePostContent {
    identifier: string
    name: string
  }
  interface IResourceDetail {
    title?: string
    url?: string
  }
  interface IResourcePlayground {
    appIcon: string
    artifactUrl: string
    identifier: string
    name: string
  }
  interface ITrack {
    id: string
    name: string
    status: string
    visibility: string
  }
  interface ISkill {
    id: string
    category: string
    skill: string
    name: string
  }
  export interface ICreator {
    id: string
    name: string
    email: string
  }
  export interface IContentTopic {
    identifier: string
    name: string
  }
  // API Based

  export interface IContact {
    id: string
    name: string
    email: string
  }

  export interface IViewerContinueLearningRequest {
    resourceId: string
    contextPathId: string
    data: string
    dateAccessed: number
    contextType?: string
  }

  export enum EContentTypes {
    PROGRAM = 'Learning Path',
    CHANNEL = 'Channel',
    COURSE = 'Course',
    KNOWLEDGE_ARTIFACT = 'Knowledge Artifact',
    KNOWLEDGE_BOARD = 'Knowledge Board',
    LEARNING_JOURNEY = 'Learning Journeys',
    MODULE = 'Collection',
    RESOURCE = 'Resource',
  }

  export enum EResourcePrimaryCategories {
    LEARNING_RESOURCE = 'Learning Resource',
  }

  export enum EMiscPlayerSupportedCollectionTypes {
    PLAYLIST = 'Playlist',
  }
  export const PLAYER_SUPPORTED_COLLECTION_TYPES: string[] = [
    EContentTypes.COURSE,
    EContentTypes.MODULE,
    EContentTypes.PROGRAM,
    EMiscPlayerSupportedCollectionTypes.PLAYLIST,
  ]
  export const KB_SUPPORTED_CONTENT_TYPES: EContentTypes[] = [
    EContentTypes.COURSE,
    EContentTypes.MODULE,
    EContentTypes.PROGRAM,
    EContentTypes.RESOURCE,
  ]
  export const PLAYLIST_SUPPORTED_CONTENT_TYPES: EContentTypes[] = [
    EContentTypes.COURSE,
    EContentTypes.MODULE,
    EContentTypes.PROGRAM,
    EContentTypes.RESOURCE,
  ]
  export enum EMimeTypes {
    COLLECTION = 'application/vnd.ekstep.content-collection',
    ZIP = 'application/vnd.ekstep.html-archive',
    HTML = 'application/html',
    HTML_TEXT = 'text/html',
    ILP_FP = 'application/ilpfp',
    IAP = 'application/iap-assessment',
    M4A = 'audio/m4a',
    MP3 = 'audio/mpeg',
    MP4 = 'video/mp4',
    M3U8 = 'application/x-mpegURL',
    INTERACTION = 'video/interactive',
    PDF = 'application/pdf',
    QUIZ = 'application/json',
    DRAG_DROP = 'application/drag-drop',
    HTML_PICKER = 'application/htmlpicker',
    WEB_MODULE = 'application/web-module',
    WEB_MODULE_EXERCISE = 'application/web-module-exercise',
    YOUTUBE = 'video/x-youtube',
    HANDS_ON = 'application/integrated-hands-on',
    RDBMS_HANDS_ON = 'application/rdbms',
    CLASS_DIAGRAM = 'application/class-diagram',
    CHANNEL = 'application/channel',
    COLLECTION_RESOURCE = 'resource/collection',
    APPLICATION_JSON = 'application/json',
    // Added on UI Only
    CERTIFICATION = 'application/certification',
    PLAYLIST = 'application/playlist',
    TEXT_WEB = 'text/x-url',
    UNKNOWN = 'application/unknown',
  }
  export enum EDisplayContentTypes {
    ASSESSMENT = 'ASSESSMENT',
    AUDIO = 'AUDIO',
    CERTIFICATION = 'CERTIFICATION',
    CHANNEL = 'Channel',
    CLASS_DIAGRAM = 'CLASS_DIAGRAM',
    COURSE = 'COURSE',
    DEFAULT = 'DEFAULT',
    DRAG_DROP = 'DRAG_DROP',
    EXTERNAL_CERTIFICATION = 'EXTERNAL_CERTIFICATION',
    EXTERNAL_COURSE = 'EXTERNAL_COURSE',
    GOALS = 'GOALS',
    HANDS_ON = 'HANDS_ON',
    IAP = 'IAP',
    INSTRUCTOR_LED = 'INSTRUCTOR_LED',
    INTERACTIVE_VIDEO = 'INTERACTIVE_VIDEO',
    KNOWLEDGE_ARTIFACT = 'KNOWLEDGE_ARTIFACT',
    MODULE = 'MODULE',
    PDF = 'PDF',
    PLAYLIST = 'PLAYLIST',
    PROGRAM = 'PROGRAM',
    QUIZ = 'QUIZ',
    RESOURCE = 'RESOURCE',
    RDBMS_HANDS_ON = 'RDBMS_HANDS_ON',
    VIDEO = 'VIDEO',
    WEB_MODULE = 'WEB_MODULE',
    WEB_PAGE = 'WEB_PAGE',
    YOUTUBE = 'YOUTUBE',
    KNOWLEDGE_BOARD = 'Knowledge Board',
    LEARNING_JOURNEY = 'Learning Journeys',
  }
  // for UI
  export enum EFilterCategory {
    ALL = 'ALL',
    LEARN = 'LEARN',
    PRACTICE = 'PRACTICE',
    ASSESS = 'ASSESS',
  }

  // for UI
  export enum ETagType {
    NEWLY_ADDED = 'NEWLY ADDED',
  }
}
