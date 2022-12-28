import { NsWidgetResolver } from '../../../../resolver/src/public-api'
import { NsPage } from '../resolvers/page.model'
export namespace NsInstanceConfig {
  export interface IConfig {
    authoring: {
      doUniqueCheck: boolean
      isMultiStepFlow: boolean
      allowExpiry: boolean
      allowRestore: boolean
      allowReview: boolean
      allowPublish: boolean
      allowRedo: boolean
      newDesign: boolean
      allowedContentType: string[]
      urlPatternMatching: {
        allowReplace: boolean
        source: string
        pattern: string
        allowIframe: boolean
      }[]
    }
    appSetup: boolean
    chatBotUrl: string
    defaultFontsize: string
    defaultThemeClass: string
    defaultLocale: string
    disablePidCheck?: boolean
    fontSizes: IFontSize[]
    isContentDownloadAvailable: boolean
    indexHtmlMeta: IIndexHtmlMeta
    keycloak: IKeycloak
    locals: ILocalsConfig[]
    microsoft: IMicrosoft
    telemetryConfig: ITelemetryConfig
    themes: ITheme[]
    logos: ILogos
    sources?: ISourceLogo[]
    mailIds: IMailIds
    details: IDetails
    validMailIdExtensionsForMailMe: string[]
    defaultFeatureConfigs: {
      error: string
    }
    backgrounds: {
      primaryNavBar: NsPage.INavBackground
      pageNavBar: NsPage.INavBackground
    }
    featuredApps: string[]
    primaryNavBarConfig: IPrimaryNavbarConfig
    org: string[]
    rootOrg: string
    intranetIframeUrls?: string[]
    showNavBarInSetup?: boolean
    intranetUrlToCheck?: string
    introVideo: IPath
    tourVideo: IPath
    isDownloadableSource?: IPath
    isDownloadableIosResource?: IPath
    isDownloadableAndroidResource?: IPath
    sourceFieldsUserAutocomplete?: string[]
    forgotPasswordConfig?: IForgotPassword
  }

  export interface IForgotPassword {
    local?: string
    enterprise?: string
    social?: string
  }
  export interface ISourceLogo {
    sourceName?: string
    sourceId?: string
    logo?: string
  }
  export interface IPath {
    [key: string]: string
  }

  export interface IIndexHtmlMeta {
    description?: string
    openSearchUrl?: string
    webmanifest: string
    xIcon?: string
    pngIcon?: string
  }
  export interface IFontSize {
    baseFontSize: string
    fontClass: string
    scale: number
  }
  export interface IKeycloak {
    defaultidpHint: 'E' | 'N' | 'S'
    isLoginHidden: boolean
    bearerExcludedUrls: string[]
    clientId: string
    key: string
    realm: string
    url: string
    changePasswordUrl?: string
    onLoad?: 'check-sso' | 'login-required'
  }
  export interface ILocalsConfig {
    isAvailable: boolean
    isEnabled: boolean
    locals: string[]
    path: string
    isRTL: boolean
  }
  export interface IMicrosoft {
    clientId: string
    defaultEmailId: string
    tenant: string
    validEmailExtensions: string[]
    isConfigured: boolean
  }
  export interface ITheme {
    color: IThemeColor
    themeFile: string
    themeClass: string
    themeName: string
  }

  export interface IThemeColor {
    accent: string
    primary: string
    warn: string
  }
  export interface ILogos {
    app: string
    appTransparent: string
    aboutFooter: string
    aboutHeader: string
    appBottomNav: string
    company: string
    developedBy: string
    poweredBy: string
    defaultContent: string
    defaultSourceLogo: string
    landingLogo: string
    navbarLogo?: string
    playListLogo?: string
    thumpsUp?: string

  }
  export interface IMailIds {
    contactUs: string
    default: string
    support: string
  }
  export interface IDetails {
    appName: string
  }
  export interface IPrimaryNavbarConfig {
    mediumScreen: IPrimaryNavBarScreen
    smallScreen: IPrimaryNavBarScreen
  }
  interface IPrimaryNavBarScreen {
    left: IPrimaryNavBarSide[]
    right: IPrimaryNavBarSide[]
  }
  interface IPrimaryNavBarSide {
    type: 'widgetButton' | 'featureButton'
    config: NsWidgetResolver.IRenderConfigWithAnyData | NsPage.INavLink
  }

  export interface ITelemetryConfig {
    pdata: {
      id: string
      ver: string
      pid: string
    }
    object: {
      ver: string
      id: string | undefined
    }
    uid: string | null
    authtoken?: string
    env: string
    channel: string
    batchsize: number
    host: string
    endpoint: string
    apislug: string
    sid: string
  }
}

export namespace NsAppsConfig {
  export type TIconType = 'mat-icon' | 'url'

  export interface IAppsConfig {
    groups: IGroup[]
    features: { [id: string]: IFeature }
    tourGuide?: string[][]
  }

  export interface IGroup {
    id: string
    iconType: string
    icon: string
    keywords: string[]
    name: string
    toolTip: string
    featureIds: string[]
    stripBackground?: string
    hasRole: string[]
  }

  // export interface IGroupWithFeatures extends IGroup {
  //   features: IFeature[]
  // }
  export interface IFeature {
    name: string
    id: string
    url: string
    permission: string | string[] | { all: string[]; some: string[]; none: string[] }
    iconType: TIconType
    icon: string
    keywords: string[]
    toolTip: string
    accessKey: string
    status?: 'earlyAccess' | 'live' | 'alpha' | 'beta'
    shortName: string
    description?: string
    badgeEndpoint?: string
    mobileAppFunction?: string
    color?: string
    target?: string
  }
}

export namespace NsUser {
  export interface IUserProfile {
    userId: string
    email?: string
    departmentName?: string
    userName?: string
    givenName?: string
    country?: null | string
    unit?: string | null
    source_profile_picture?: null | string
    dealerCode?: null | string
    isManager?: boolean
    lastName?: string
    firstName?: string
    surName?: string
    middleName?: string
    profileImage?: string
    rootOrgId?: string
    rootOrgName?: string
    phone?: string
    language?: null | string
  }
  export interface IUserPidProfile {
    kid_updated: boolean
    user: IUser
  }
  export interface INodebbUserProfile {
    username: string
    email: string
  }
  export interface IUserPidProfileV2 {
    kid_updated: boolean
    result: {
      response: IUserV2
    }
  }

  export interface IUserPidProfileVer2 {
    result: {
      UserProfile: IUserVer2[]
    }
  }

  interface ISourceData {
    GID: string
    SNAMPRE: string
    SNAMADD: string
    LASTNAME: string
    SN: string
    GIVENNAME: string
    NICKNAME: string
    PREFERREDSN: string
    PERSONALTITLE: string
    MOBILE: string
    MAIL: string
    DEPARTMENTTEXT: string
    COSTLOCATIONUNIT: string
    COSTLOCATION: string
    ORGID: string
    MGMTRESP: string
    UTC: string
    CNAMEENG: string
    LNAMEINT: string
    USERTYPE: string
    STATUS: string
    CONTRACTSTATUS: string
  }

  interface IUser {
    wid: string
    root_org: string
    org: string
    is_active?: any
    account_expiry_date?: any
    kid: string
    imported_source_name: string
    source_id: string
    username?: any
    first_name: string
    last_name: string
    middle_name?: any
    known_as: string
    salutation?: any
    email: string
    gender?: any
    dob?: any
    languages_known?: any
    preferred_language?: any
    source_profile_picture?: any
    residence_country: string
    residence_state?: any
    residence_city: string
    contact_phone_number_office?: any
    contact_phone_number_home?: any
    contact_phone_number_personal: string
    employement_status?: any
    contract_type?: any
    job_title?: any
    job_role?: any
    department_name: string
    unit_name?: any
    organization_location_country?: any
    organization_location_state?: any
    organization_location_city?: any
    time_inserted: Date
    time_updated: Date
    json_unmapped_fields?: any
    source_data: ISourceData
  }

  interface IUserV2 {
    surName: any
    maskedPhone: string
    rootOrgName: string
    subject: []
    channel: string
    language: []
    updatedDate: string
    managedBy: string
    flagsValue: number
    id: string
    recoveryEmail: string
    identifier: string
    thumbnail: string
    profileVisibility: []
    updatedBy: string
    accesscode: string
    locationIds: []
    externalIds: []
    registryId: string
    rootOrgId: string
    prevUsedEmail: string
    firstName: string
    tncAcceptedOn: string
    phone: string
    dob: string
    grade: []
    currentLoginTime: string
    userType: string
    status: number
    lastName: string
    gender: string
    roles: string[]
    prevUsedPhone: string
    stateValidated: boolean
    isDeleted: boolean
    organisations: IOrg[]
    countryCode: string
    maskedEmail: string
    tempPassword: string
    email: string
    rootOrg: IRootOrg
    profileSummary: string
    phoneVerified: boolean
    recoveryPhone: string
    userName: string
    userId: string
    lastLoginTime: string
    emailVerified: true
    framework: {}
    createdDate: string
    createdBy: string
    location: string
    tncAcceptedVersion: string
  }

  interface IRootOrg {
    dateTime: string
    preferredLanguage: string
    keys: {}
    channel: string
    approvedBy: string
    description: string
    updatedDate: string
    addressId: string
    orgType: string
    provider: string
    orgCode: string
    locationId: string
    theme: string
    id: string
    isApproved: boolean
    communityId: string
    slug: string
    email: string
    isSSOEnabled: boolean
    thumbnail: string
    updatedBy: string
    orgName: string
    locationIds: []
    externalId: string
    isRootOrg: boolean
    rootOrgId: string
    imgUrl: string
    approvedDate: string
    orgTypeId: string
    homeUrl: string
    isDefault: boolean
    createdDate: string
    contactDetail: string
    parentOrgId: string
    createdBy: string
    hashTagId: string
    noOfMembers: string
    status: number
  }

  interface IOrg {
    updatedBy: string
    organisationId: string
    orgName: string
    addedByName: string
    addedBy: string
    roles: string[]
    approvedBy: string
    updatedDate: string
    userId: string
    approvaldate: string
    isDeleted: boolean
    parentOrgId: string
    hashTagId: string
    isRejected: boolean
    position: string
    id: string
    orgjoindate: string
    isApproved: boolean
    orgLeftDate: string
  }

  interface IUserVer2 {
    'firstname': string,
    'motherTongue': string,
    'secondaryEmail': string,
    'gender': string,
    '@type': string,
    'mobile': number,
    'middlename': string,
    'telephone': number,
    'osid': string,
    'primaryEmailType': string,
    'knownLanguages': ILanguages[],
    'wid': string,
    'nationality': string,
    'surname': string,
    'dob': string,
    'category': string,
    'primaryEmail': string,
    'maritalStatus': string,
    'residenceAddress': string,
    'result': any
  }

  export interface ILanguages {
    name: string
  }

}
