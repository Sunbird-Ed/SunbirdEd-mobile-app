import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of, throwError, Subject, BehaviorSubject } from 'rxjs'
import { catchError, retry, map } from 'rxjs/operators'
import { ConfigurationsService } from '../../../../utils/src/public-api'
import { NsContentStripMultiple } from '../content-strip-multiple/content-strip-multiple.model'
import { NsContent } from './widget-content.model'
import { NSSearch } from './widget-search.model'

// TODO: move this in some common place
const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const PUBLIC_SLAG = '/apis/public/v8'
const API_END_POINTS = {
  CONTENT: `${PROTECTED_SLAG_V8}/content`,
  AUTHORING_CONTENT: `/apis/authApi/hierarchy`,
  LATEST_HOMEPAGE_COURSE: `/apis/public/v8/homePage/latestCourses`,
  CONTENT_LIKES: `${PROTECTED_SLAG_V8}/content/likeCount`,
  SET_S3_COOKIE: `${PROTECTED_SLAG_V8}/content/setCookie`,
  SET_S3_IMAGE_COOKIE: `${PROTECTED_SLAG_V8}/content/setImageCookie`,
  FETCH_MANIFEST: `${PROTECTED_SLAG_V8}/content/getWebModuleManifest`,
  FETCH_WEB_MODULE_FILES: `${PROTECTED_SLAG_V8}/content/getWebModuleFiles`,
  MULTIPLE_CONTENT: `${PROTECTED_SLAG_V8}/content/multiple`,
  CONTENT_SEARCH_V5: `${PROTECTED_SLAG_V8}/content/searchV5`,
  PUBLIC_CONTENT_SEARCH: `${PUBLIC_SLAG}/publicContent/v1/search`,
  CONTENT_SEARCH_V6: `/apis/proxies/v8/sunbirdigot/read`,
  CONTENT_SEARCH_REGION_RECOMMENDATION: `${PROTECTED_SLAG_V8}/content/searchRegionRecommendation`,
  CONTENT_HISTORY: `${PROTECTED_SLAG_V8}/user/history`,
  CONTENT_HISTORYV2: `/apis/proxies/v8/read/content-progres`,
  USER_CONTINUE_LEARNING: `${PROTECTED_SLAG_V8}/user/history/continue`,
  CONTENT_RATING: `${PROTECTED_SLAG_V8}/user/rating`,
  COLLECTION_HIERARCHY: (type: string, id: string) =>
    `${PROTECTED_SLAG_V8}/content/collection/${type}/${id}`,
  REGISTRATION_STATUS: `${PROTECTED_SLAG_V8}/admin/userRegistration/checkUserRegistrationContent`,
  MARK_AS_COMPLETE_META: (contentId: string) => `${PROTECTED_SLAG_V8}/user/progress/${contentId}`,
  COURSE_BATCH_LIST: `/apis/proxies/v8/learner/course/v1/batch/list`,
  ENROLL_BATCH: `/apis/proxies/v8/learner/course/v1/enrol`,
  GOOGLE_AUTHENTICATE: `/apis/public/v8/google/callback`,
  LOGIN_USER: `/apis/public/v8/emailMobile/auth`,
  FETCH_USER_ENROLLMENT_LIST: (userId: string | undefined) =>
    // tslint:disable-next-line: max-line-length
    `/apis/proxies/v8/learner/course/v1/user/enrollment/list/${userId}?orgdetails=orgName,email&licenseDetails=name,description,url&fields=contentType,topic,name,channel,mimeType,appIcon,gradeLevel,resourceType,thumbnail,identifier,medium,pkgVersion,board,subject,trackable,posterImage,duration,creatorLogo,license&batchDetails=name,endDate,startDate,status,enrollmentType,createdBy,certificates`,
}

@Injectable({
  providedIn: 'root',
})
export class WidgetContentService {
  private messageSource = new Subject<any>()
  public currentMessage = this.messageSource.asObservable()
  public _updateValue = new BehaviorSubject<any>(undefined)
  // Observable navItem stream
  updateValue$ = this._updateValue.asObservable()
  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService
  ) { }

  fetchMarkAsCompleteMeta(identifier: string): Promise<any> {
    const url = API_END_POINTS.MARK_AS_COMPLETE_META(identifier)
    return this.http.get(url).toPromise()
  }
  changeMessage(message: string) {
    this.messageSource.next(message)
  }
  // fetchContent(
  //   contentId: string,
  //   hierarchyType: 'all' | 'minimal' | 'detail' = 'detail',
  //   additionalFields: string[] = [],
  // ): Observable<NsContent.IContent> {
  //   console.log('Fetch content 666')
  //   const url = `${API_END_POINTS.CONTENT}/${contentId}?hierarchyType=${hierarchyType}`
  //   return this.http
  //     .post<NsContent.IContent>(url, { additionalFields })
  //     .pipe(retry(1))
  // }

  // tslint:disable-next-line:max-line-length
  fetchUserBatchList(userId: string | undefined): Observable<NsContent.ICourse[]> {
    let path = ''
    path = API_END_POINTS.FETCH_USER_ENROLLMENT_LIST(userId)
    return this.http
      .get(path)
      .pipe(
        catchError(this.handleError),
        map(
          (data: any) => data.result.courses
        )
      )
  }

  fetchHierarchyContent(contentId: string): Observable<NsContent.IContent> {
    const url = `/apis/proxies/v8/action/content/v3/hierarchy/${contentId}?hierarchyType=detail`
    const apiData = this.http
      .get<NsContent.IContent>(url)
      .pipe(retry(1))
    return apiData
  }

  processCertificate(req: any): Observable<any> {
    const url = `/apis/proxies/v8/course/batch/cert/v1/issue/`
    return this.http.post<any>(url, req)
  }

  downloadCertificateAPI(certificateId: string): Observable<any> {
    const url = `/apis/proxies/v8/certreg/v2/certs/download/${certificateId}`
    const apiData = this.http
      .get<any>(url)
      .pipe(retry(1))
    return apiData
  }

  getCertificateAPI(certificateId: string): Observable<any> {
    const url = `/apis/proxies/v8/certreg/v2/certs/download/${certificateId}`
    const apiData = this.http
      .get<any>(url)
      .pipe(retry(1), map(res => this._updateValue.next({ [certificateId]: res.result.printUri })))
    return apiData
  }

  fetchContent(
    contentId: string,
    hierarchyType: 'all' | 'minimal' | 'detail' = 'detail',
    _additionalFields: string[] = [],
    primaryCategory?: string | null,
  ): Observable<NsContent.IContent> {
    // const url = `${API_END_POINTS.CONTENT}/${contentId}?hierarchyType=${hierarchyType}`
    let url = ''
    if (primaryCategory && this.isResource(primaryCategory)) {
      url = `/apis/proxies/v8/action/content/v3/read/${contentId}`
    } else {
      url = `/apis/proxies/v8/action/content/v3/hierarchy/${contentId}?hierarchyType=${hierarchyType}`
    }
    // return this.http
    //   .post<NsContent.IContent>(url, { additionalFields })
    //   .pipe(retry(1))
    const apiData = this.http
      .get<NsContent.IContent>(url)
      .pipe(retry(1))
    // if (apiData && apiData.result) {
    //   return apiData.result.content
    // }
    return apiData
  }

  isResource(primaryCategory: string) {
    if (primaryCategory) {
      const isResource = primaryCategory === NsContent.EResourcePrimaryCategories.LEARNING_RESOURCE
      return isResource
    }
    return false
  }

  fetchAuthoringContent(contentId: string): Observable<NsContent.IContent> {
    const url = `${API_END_POINTS.AUTHORING_CONTENT}/${contentId}`
    return this.http.get<NsContent.IContent>(url).pipe(retry(1))
  }
  fetchMultipleContent(ids: string[]): Observable<NsContent.IContent[]> {
    return this.http.get<NsContent.IContent[]>(
      `${API_END_POINTS.MULTIPLE_CONTENT}/${ids.join(',')}`,
    )
  }
  fetchCollectionHierarchy(type: string, id: string, pageNumber: number = 0, pageSize: number = 1) {
    return this.http.get<NsContent.ICollectionHierarchyResponse>(
      `${API_END_POINTS.COLLECTION_HIERARCHY(
        type,
        id,
      )}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    )
  }
  enrollUserToBatch(req: any) {
    return this.http
      .post(API_END_POINTS.ENROLL_BATCH, req)
      .toPromise()
  }

  fetchContentLikes(contentIds: { content_id: string[] }) {
    return this.http
      .post<{ [identifier: string]: number }>(API_END_POINTS.CONTENT_LIKES, contentIds)
      .toPromise()
  }
  fetchContentRatings(contentIds: { contentIds: string[] }) {
    return this.http
      .post(`${API_END_POINTS.CONTENT_RATING}/rating`, contentIds)
      .toPromise()
  }

  fetchContentHistory(contentId: string): Observable<NsContent.IContinueLearningData> {
    return this.http.get<NsContent.IContinueLearningData>(
      `${API_END_POINTS.CONTENT_HISTORY}/${contentId}`,
    )
  }

  fetchContentHistoryV2(req: NsContent.IContinueLearningDataReq): Observable<NsContent.IContinueLearningData> {
    req.request.fields = ['progressdetails']
    return this.http.post<NsContent.IContinueLearningData>(
      `${API_END_POINTS.CONTENT_HISTORYV2}/${req.request.courseId}`, req
    )
  }
  async continueLearning(id: string, collectionId?: string, collectionType?: string): Promise<any> {
    return new Promise(async resolve => {
      if (collectionType &&
        collectionType.toLowerCase() === 'playlist') {
        const reqBody = {
          contextPathId: collectionId ? collectionId : id,
          resourceId: id,
          data: JSON.stringify({
            timestamp: Date.now(),
            contextFullPath: [collectionId, id],
          }),
          dateAccessed: Date.now(),
          contextType: 'playlist',
        }
        await this.saveContinueLearning(reqBody).toPromise().catch().finally(() => {
          resolve(true)
        }
        )
      } else {
        const reqBody = {
          contextPathId: collectionId ? collectionId : id,
          resourceId: id,
          data: JSON.stringify({ timestamp: Date.now() }),
          dateAccessed: Date.now(),
        }
        await this.saveContinueLearning(reqBody).toPromise().catch().finally(() => {
          resolve(true)
        })
      }
    })
  }
  saveContinueLearning(content: NsContent.IViewerContinueLearningRequest): Observable<any> {
    const url = API_END_POINTS.USER_CONTINUE_LEARNING
    return this.http.post<any>(url, content)
  }

  setS3Cookie(
    contentId: string,
    // _path: string,
  ): Observable<any> {
    return this.http
      .post(API_END_POINTS.SET_S3_COOKIE, { contentId })
      .pipe(catchError(_err => of(true)))
  }

  setS3ImageCookie(): Observable<any> {
    return this.http.post(API_END_POINTS.SET_S3_IMAGE_COOKIE, {}).pipe(catchError(_err => of(true)))
  }

  fetchManifest(url: string): Observable<any> {
    return this.http.post(API_END_POINTS.FETCH_MANIFEST, { url })
  }
  fetchWebModuleContent(url: string): Observable<any> {
    return this.http.get(`${API_END_POINTS.FETCH_WEB_MODULE_FILES}?url=${encodeURIComponent(url)}`)
  }
  search(req: NSSearch.ISearchRequest): Observable<NSSearch.ISearchApiResult> {
    req.query = req.query || ''
    return this.http.post<NSSearch.ISearchApiResult>(API_END_POINTS.CONTENT_SEARCH_V5, {
      request: req,
    })
  }

  searchRegionRecommendation(
    req: NSSearch.ISearchOrgRegionRecommendationRequest,
  ): Observable<NsContentStripMultiple.IContentStripResponseApi> {
    req.query = req.query || ''
    req.preLabelValue =
      (req.preLabelValue || '') +
      ((this.configSvc.userProfile && this.configSvc.userProfile.country) || '')
    req.filters = {
      ...req.filters,
      labels: [req.preLabelValue || ''],
    }
    return this.http.post<NsContentStripMultiple.IContentStripResponseApi>(
      API_END_POINTS.CONTENT_SEARCH_REGION_RECOMMENDATION,
      { request: req },
    )
  }
  searchV6(req: NSSearch.ISearchV6Request) {
    req.query = req.query || ''
    req.sort = [
      {
        lastUpdatedOn: 'desc',
      },
    ]
    return this.http.post<NSSearch.ISearchV6ApiResult>(API_END_POINTS.PUBLIC_CONTENT_SEARCH, req)
  }

  publicContentSearch(req: NSSearch.ISearchV6Request) {
    req.query = req.query || ''
    return this.http.post<NSSearch.ISearchV6ApiResult>(API_END_POINTS.PUBLIC_CONTENT_SEARCH,
                                                       req,
    )
  }
  fetchContentRating(contentId: string): Observable<{ rating: number }> {
    return this.http.get<{ rating: number }>(`${API_END_POINTS.CONTENT_RATING}/${contentId}`)
  }
  deleteContentRating(contentId: string): Observable<any> {
    return this.http.delete(`${API_END_POINTS.CONTENT_RATING}/${contentId}`)
  }
  addContentRating(contentId: string, data: { rating: number }): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.CONTENT_RATING}/${contentId}`, data)
  }

  getFirstChildInHierarchy(content: NsContent.IContent): NsContent.IContent {
    if (!(content.children || []).length) {
      return content
    }
    if (
      content.contentType === 'Learning Path' &&
      !(content.artifactUrl && content.artifactUrl.length)
    ) {
      const child = content.children[0]
      return this.getFirstChildInHierarchy(child)
    }
    if (
      content.contentType === 'Resource' ||
      content.contentType === 'Knowledge Artifact' ||
      content.contentType === 'Learning Path'
    ) {
      return content
    }
    const firstChild = content.children[0]
    const resultContent = this.getFirstChildInHierarchy(firstChild)
    return resultContent
  }

  getRegistrationStatus(source: string): Promise<{ hasAccess: boolean; registrationUrl?: string }> {
    return this.http.get<any>(`${API_END_POINTS.REGISTRATION_STATUS}/${source}`).toPromise()
  }

  fetchConfig(url: string) {
    return this.http.get<any>(url)
  }

  loginAuth(req: any): Observable<any> {
  return this.http.post<any>(API_END_POINTS.LOGIN_USER, req).pipe(retry(1),
                                                                  map(
          (data: any) => data
        )
      )
  }
  googleAuthenticate(req: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.GOOGLE_AUTHENTICATE, req).pipe(catchError(this.handleError))
  }
  handleError(error: HttpErrorResponse) {
    return throwError(error)
  }
  fetchCourseBatches(req: any): Observable<NsContent.IBatchListResponse> {
    return this.http
      .post<NsContent.IBatchListResponse>(API_END_POINTS.COURSE_BATCH_LIST, req)
      .pipe(
        retry(1),
        map(
          (data: any) => data.result.response
        )
      )
  }

  getLatestCourse() {
    return this.http.get<any>(`${API_END_POINTS.LATEST_HOMEPAGE_COURSE}`)
  }
}
