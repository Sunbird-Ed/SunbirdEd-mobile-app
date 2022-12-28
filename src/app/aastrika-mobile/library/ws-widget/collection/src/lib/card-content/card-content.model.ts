import { NsContent } from '../_services/widget-content.model'

export namespace NsCardContent {
  export interface ICard {
    content: NsContent.IContent
    cardSubType: TCardSubType
    context: { pageSection: string; position?: number }
    intranetMode?: 'greyOut' | 'hide'
    deletedMode?: 'greyOut' | 'hide'
    likes?: number
    contentTags?: IContentTags
  }

  export interface IContentTags {
    daysSpan?: number
    excludeContentType?: NsContent.EContentTypes[]
    excludeMimeType?: string[]
    tag: string
    criteriaField?: string
  }

  export type TCardSubType =
    | 'standard'
    | 'minimal'
    | 'space-saving'
    | 'card-user-details'
    | 'basic-info'
    | 'basic-details'
    | 'card-description-back'

  export enum EContentStatus {
    LIVE = 'Live',
    EXPIRED = 'Expired',
    DELETED = 'Deleted',
    MARK_FOR_DELETION = 'MarkedForDeletion',
  }
}
