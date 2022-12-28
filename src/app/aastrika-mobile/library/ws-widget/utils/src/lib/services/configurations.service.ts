import { Injectable } from '@angular/core'
import { BehaviorSubject, ReplaySubject } from 'rxjs'
import { environment } from '../../../../../../../../../src/environments/environment'
import { NsPage } from '../resolvers/page.model'
import { NsAppsConfig, NsInstanceConfig, NsUser } from './configurations.model'
import { IUserPreference } from './user-preference.model'

let instanceConfigPath: string | null = window.location.host
// let locationHost: string | null = window.location.host

if (!environment.production && Boolean(environment.sitePath)) {
  // locationHost = environment.sitePath
  instanceConfigPath = environment.sitePath
}
@Injectable({
  providedIn: 'root',
})
export class ConfigurationsService {
  // update as the single source of truth

  appSetup = true
  // The url the user tried to access while landing in the app before accepting tnc
  userUrl = ''
  baseUrl = 'assets/configurations'
  sitePath = 'assets/configurations'
  // baseUrl = `assets/configurations/${(locationHost || window.location.host).replace(':', '_')}`
  // sitePath = `assets/configurations/${(instanceConfigPath || window.location.host).replace(
  //   ':',
  //   '_',
  // )}`
  hostPath = (instanceConfigPath || window.location.host).replace(':', '_')

  userRoles: Set<string> | null = null
  userGroups: Set<string> | null = null
  restrictedFeatures: Set<string> | null = null
  restrictedWidgets: Set<string> | null = null
  instanceConfig: NsInstanceConfig.IConfig | null = null
  appsConfig: NsAppsConfig.IAppsConfig | null = null
  rootOrg: string | null = null
  org: string[] | null = null
  activeOrg: string | null = ''
  isProduction = false
  hasAcceptedTnc = false
  profileDetailsStatus = false
  userPreference: IUserPreference | null = null
  userProfile: NsUser.IUserProfile | null = null
  userProfileV2: NsUser.IUserProfile | null = null
  nodebbUserProfile: NsUser.INodebbUserProfile | null = null
  // created to store complete user details sent by pid
  unMappedUser: any
  isAuthenticated = false
  isNewUser = false
  isActive = true

  // pinnedApps
  pinnedApps = new BehaviorSubject<Set<string>>(new Set())

  // Notifier
  prefChangeNotifier = new ReplaySubject<Partial<IUserPreference>>(1)
  tourGuideNotifier = new ReplaySubject<boolean>()
  authChangeNotifier = new ReplaySubject<boolean>(1)

  // Preference Related Values
  activeThemeObject: NsInstanceConfig.ITheme | null = null
  activeFontObject: NsInstanceConfig.IFontSize | null = null
  isDarkMode = false
  isIntranetAllowed = false
  isRTL = false
  activeLocale: NsInstanceConfig.ILocalsConfig | null = null
  activeLocaleGroup = ''
  completedActivity: string[] | null = null
  completedTour = false
  profileSettings = ['profilePicture', 'learningTime', 'learningPoints']

  primaryNavBar: Partial<NsPage.INavBackground> = {
    color: 'primary',
  }
  pageNavBar: Partial<NsPage.INavBackground> = {
    color: 'primary',
  }
  primaryNavBarConfig: NsInstanceConfig.IPrimaryNavbarConfig | null = null
}
