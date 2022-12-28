import { Component, OnInit, Input } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Subject } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '../../library/ws-widget/utils/src/public-api'
import { WidgetContentService } from '../../library/ws-widget/collection/src/public-api'

@Component({
  selector: 'ws-public-toc-banner',
  templateUrl: './public-toc-banner.component.html',
  styleUrls: ['./public-toc-banner.component.scss'],
})
export class PublicTocBannerComponent implements OnInit {
  @Input() content: any
  tocConfig: any = null
  routelinK = 'license'
  public unsubscribe = new Subject<void>()
  currentLicenseData: any
  licenseName: any
  license = 'CC BY'
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private widgetContentSvc: WidgetContentService,
    private configSvc: ConfigurationsService
    ) {
  }

  ngOnInit() {
    console.log('content', this.content)
    this.fetchTocConfig()

    this.route.queryParams.subscribe(params => {
      //this.licenseName = params['license'] || this.license
      this.licenseName = this.license
      this.getLicenseConfig()
    })
  }
  fetchTocConfig() {
    this.http.get('assets/configurations/feature/toc.json').pipe().subscribe((res: any) => {
      this.tocConfig = res
    })
  }

  getLicenseConfig() {
    const licenseurl = `https://sphere.aastrika.org/assets/configurations/license.meta.json`
    //const licenseurl = `${this.configSvc.sitePath}/license.meta.json`
    this.widgetContentSvc.fetchConfig(licenseurl).pipe().subscribe(data => {
      const licenseData = data
      if (licenseData) {
        this.currentLicenseData = licenseData.licenses.filter((license: any) => license.licenseName === this.licenseName)
      }
    },
      (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.getLicenseConfig()
        }
      })
  }
}
