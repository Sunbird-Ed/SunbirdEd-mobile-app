import { NsContent } from '../_services/widget-content.model'

export namespace NsContentConstants {
  export const EMBEDDABLE_CONTENT_TYPES = new Set<NsContent.EMimeTypes>([
    NsContent.EMimeTypes.MP3,
    NsContent.EMimeTypes.MP4,
    NsContent.EMimeTypes.PDF,
  ])
  export const ALLOW_MAIL_ME = new Set<string>(['Leave Behind'])
  export const VALID_PRACTICE_RESOURCES = new Set([
    'Exercise',
    'Capstone Project',
    'Tryout',
  ])
  export const VALID_ASSESSMENT_RESOURCES = new Set(['Quiz', 'Assessment'])
}
