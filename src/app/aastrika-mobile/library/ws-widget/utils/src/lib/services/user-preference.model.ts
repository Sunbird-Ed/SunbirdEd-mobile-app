export interface IUserPreference {
  selectedTheme: string
  selectedFont: string
  selectedLocale: string
  isDarkMode: boolean
  isIntranetAllowed?: boolean
  isRTL: boolean
  colorPallet: string[]
  defaultCardType: string
  pinnedApps: string
  selectedLangGroup?: string
  completedActivity: string[]
  completedTour?: boolean
  profileSettings: string[]
}

export interface IProfile {
  showProfilePicture: boolean
  showUserInterest: boolean
  showKbFollowed: boolean
  showPlaylist: boolean
  showAuthoredByMe: boolean
  showReviewedByMe: boolean
  showBadgeDetails: boolean
  showBlogs: boolean
  showQnA: boolean
  // showLearningTime: boolean
  // showLearningPoints: boolean
  // showLastViewed: boolean
  // showGoals: boolean
  // showTopicsFollowed: boolean
  // showAssessmentDetails: boolean
  // showCertificationDetails: boolean
  // showUserSkills: boolean
}
