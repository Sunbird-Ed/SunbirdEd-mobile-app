import { NsContent } from './widget-content.model'

export namespace NSSearch {
  export interface IFeatureSearchConfig {
    tabs: IConfigContentStrip[]
  }
  export interface IFilterSearchRequest {
    contentType?: NsContent.EContentTypes[]
    creatorContacts?: string[]
    labels?: string[]
    resourceCategory?: string[]
    catalogPaths?: string[]
    lastUpdatedOn?: string[]
  }
  export interface ISearchRequest {
    filters?: IFilterSearchRequest
    query?: string
    isStandAlone?: boolean
    instanceCatalog?: boolean
    locale?: string[]
    pageNo?: number
    pageSize?: number
    uuid?: string
    rootOrg?: string
    // sort?: { lastUpdatedOn: 'desc' | 'asc' }[]
    sort?: { [key: string]: string }[]
  }

  export interface ISearchOrgRegionRecommendationRequest extends ISearchRequest {
    defaultLabel?: string
    preLabelValue?: string
  }

  export interface ISearchV6Request {
    visibleFilters?: ISearchV6VisibleFilters
    excludeSourceFields?: string[]
    includeSourceFields?: string[]
    sort?: ISearchSort[]
    query: string
    sourceFields?: string[]
    locale?: string[]
    pageNo?: number
    pageSize?: number
    filters?: ISearchV6Filters[]
    isStandAlone?: boolean
    didYouMean?: boolean
    request?: ISearchV6Request
  }

  export interface ISearchSort {
    [key: string]: 'asc' | 'desc'
  }

  export interface ISearchV6VisibleFilters {
    [key: string]: {
      displayName: string,
      order?: { [key: string]: 'asc' | 'desc' }[]
    }
  }

  export interface ISearchV6Filters {
    andFilters?: { [key: string]: string[] }[]
    notFilters?: { [key: string]: string[] }[]
  }
  export interface ISearchRedirection {
    f?: {
      [index: string]: string[]
    }
    q?: string
    tab?: string
  }
  export interface IConfigContentStrip {
    titleKey?: string
    title?: string
    reqRoles?: string[]
    reqFeatures?: string[]
    searchRedirection?: ISearchRedirection
    searchQuery?: ISearchRequest
    contentIds?: string[]
  }
  export interface ISearchApiResult {
    totalHits: number
    result: NsContent.IContent[]
    filters: IFilterUnitResponse[]
    notToBeShownFilters?: IFilterUnitResponse[]
    filtersUsed: string[]
  }
  export interface ISearchV6ApiResult {
    totalHits: number
    result: NsContent.IContent[]
    filtersUsed: string[]
    notVisibleFilters: string[]
    filters: IFilterUnitResponse[]
    queryUsed?: string
    doYouMean?: string
  }
  export interface IFilterUnitResponse {
    id?: string
    type: string
    displayName: string
    content: IFilterUnitContent[]
  }
  export interface IFilterUnitContent {
    type?: string
    id?: string
    displayName: string
    count: number
    children?: IFilterUnitContent[]
  }
  export interface ITypeUnitResponse {
    displayName: string
    type: string
    count: string
  }

  export interface ISearchV6RequestV2 {
    request: {
      filters: {
        primaryCategory: any,
        status: string
      },
      query: string,
      sort_by: { lastUpdatedOn: string },
      fields: string[],
      facets: string[]
    }
  }
  export interface ISearchV6ApiResultV2 {
    id: string
    ver: string
    ts: string
    params: IParamsContent
    responseCode: string
    result: ISearchData
    filters: IFilterUnitResponse[]
  }
  export interface IParamsContent {
    resmsgid: string
    msgid: string
    status: string
    err: string
    errmsg: string
  }
  export interface ISearchData {
    count: number
    content: NsContent.IContent[]
    facets: IFacetsData[]
  }
  export interface IFacetsData {
    values: IFacetsValues[]
    name: string
  }
  export interface IFacetsValues {
    name: string
    count: number
  }
  export interface IFacet {
    displayName: string,
    type: string,
    content: IContentFilter[],
  }
  export interface IContentFilter {
    displayName: string,
    type: string,
    count: number,
    id: string
  }

}
