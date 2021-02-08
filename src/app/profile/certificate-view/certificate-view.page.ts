import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CourseCertificate} from '@project-sunbird/client-services/models';
import {CourseService} from 'sunbird-sdk';
import {CommonUtilService} from '@app/services/common-util.service';
import {filter, map, tap} from 'rxjs/operators';
import {AppGlobalService, AppHeaderService} from '@app/services';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {CertificateDownloadService} from 'sb-svg2pdf';
import {FileOpener} from '@ionic-native/file-opener/ngx';
import {ToastController} from '@ionic/angular';

@Component({
  selector: 'app-certificate-view',
  templateUrl: './certificate-view.page.html',
  styleUrls: ['./certificate-view.page.scss'],
  providers: [CertificateDownloadService]
})
export class CertificateViewPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('certificateContainer', {static: true}) certificateContainer: ElementRef;
  @ViewChild('scrollWrap', {static: true}) scrollWrap: ElementRef;

  private activeUserId: string;
  private actionEventsSubscription: Subscription;

  private pageData: {
    courseId: string;
    certificate: CourseCertificate;
  };

  private gestureState = {
    posX: 0,
    posY: 0,
    scale: 1,
    last_scale: 1,
    last_posX: 0,
    last_posY: 0,
    max_pos_x: 0,
    max_pos_y: 0,
    transform: ''
  };

  constructor(
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    private certificateDownloadService: CertificateDownloadService,
    private appHeaderService: AppHeaderService,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private router: Router,
    private fileOpener: FileOpener,
    private toastController: ToastController
  ) {
  }

  ngOnInit() {
    this.appGlobalService.getActiveProfileUid().then((activeUserId) => this.activeUserId = activeUserId);
    this.pageData = this.router.getCurrentNavigation().extras.state.request;

    const headerConfig = this.appHeaderService.getDefaultPageConfig();
    headerConfig.pageTitle = this.pageData.certificate.name;
    headerConfig.showKebabMenu = true;
    headerConfig.kebabMenuOptions = [
      { label: 'DOWNLOAD_AS_PDF', value: {} },
      { label: 'DOWNLOAD_AS_PNG', value: {} },
    ];
    headerConfig.actionButtons = [];
    headerConfig.showBurgerMenu = false;
    this.appHeaderService.updatePageConfig(headerConfig);
  }

  ngAfterViewInit() {
    this.loadCertificate();
    this.actionEventsSubscription = this.listenActionEvents();
  }

  ngOnDestroy() {
    this.actionEventsSubscription.unsubscribe();
  }

  public onGestureEvent(ev) {
    /* istanbul ignore next */
    (/* gesture based pan/zoom */() => {
      const el = this.scrollWrap.nativeElement;

      let {
        posX,
        posY,
        scale,
        last_scale,
        last_posX,
        last_posY,
        max_pos_x,
        max_pos_y,
        transform
      } = this.gestureState;

      // pan
      if (scale !== 1) {
        posX = last_posX + ev.deltaX;
        posY = last_posY + ev.deltaY;
        max_pos_x = Math.ceil((scale - 1) * el.clientWidth / 2);
        max_pos_y = Math.ceil((scale - 1) * el.clientHeight / 2);
        if (posX > max_pos_x) {
          posX = max_pos_x;
        }
        if (posX < -max_pos_x) {
          posX = -max_pos_x;
        }
        if (posY > max_pos_y) {
          posY = max_pos_y;
        }
        if (posY < -max_pos_y) {
          posY = -max_pos_y;
        }
      }


      // pinch
      if (ev.type === 'pinch') {
        scale = Math.max(.999, Math.min(last_scale * (ev.scale), 4));
      }
      if (ev.type === 'pinchend') {last_scale = scale; }

      // panend
      if (ev.type === 'panend') {
        last_posX = posX < max_pos_x ? posX : max_pos_x;
        last_posY = posY < max_pos_y ? posY : max_pos_y;
      }

      if (scale !== 1) {
        transform =
            'translate3d(' + posX + 'px,' + posY + 'px, 0) ' +
            'scale3d(' + scale + ', ' + scale + ', 1)';
      }

      if (transform) {
        el.style.webkitTransform = transform;
      }

      this.gestureState = {
        posX,
        posY,
        scale,
        last_scale,
        last_posX,
        last_posY,
        max_pos_x,
        max_pos_y,
        transform
      };
    })();
  }

  private async loadCertificate() {
    const loader = await this.commonUtilService.getLoader();
    loader.present();

    await this.courseService.getCurrentProfileCourseCertificateV2(this.pageData).pipe(
      tap(this.initCertificateTemplate.bind(this)),
    ).toPromise();

    loader.dismiss();
  }

  private initCertificateTemplate(template: string) {
    if (template.startsWith('data:image/svg+xml,')) {
      template = decodeURIComponent(template.replace(/data:image\/svg\+xml,/, '')).replace(/\<!--\s*[a-zA-Z0-9\-]*\s*--\>/g, '');
    }
    this.certificateContainer.nativeElement.innerHTML = template;
  }

  private listenActionEvents(): Subscription {
    const downloadCertificate = async (option) => {
      const toast = await this.toastController.create({
        message: this.commonUtilService.translateMessage('CERTIFICATE_DOWNLOAD_INFO')
      });
      await toast.present();

      try {
        const downloadRequest = await (async () => {
          const baseFileName = `${this.pageData.certificate.name}_${this.pageData.courseId}_${this.activeUserId}`;
          switch (option.label) {
            case 'DOWNLOAD_AS_PDF': {
              return {
                fileName: baseFileName + '.pdf',
                mimeType: 'application/pdf',
                blob: await this.certificateDownloadService.buildBlob(
                  this.certificateContainer.nativeElement.querySelector('svg'),
                  'pdf'
                )
              };
            }
            case 'DOWNLOAD_AS_PNG': {
              return {
                fileName: baseFileName + '.png',
                mimeType: 'image/png',
                blob: await this.certificateDownloadService.buildBlob(
                  this.certificateContainer.nativeElement.querySelector('svg'),
                  'png'
                )
              };
            }
            default: {
              toast.dismiss();
              throw new Error('INVALID_OPTION');
            }
          }
        })();

        const { path } = await this.courseService.downloadCurrentProfileCourseCertificateV2(downloadRequest).toPromise();
        await this.fileOpener.open(path, downloadRequest.mimeType);
      } catch (e) {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
        console.error(e);
      } finally {
        toast.dismiss();
      }
    };

    return this.appHeaderService.headerEventEmitted$.pipe(
      filter((e) => e.name === 'kebabMenu' && e.event && e.event.option),
      map((e) => e.event.option),
      tap(downloadCertificate.bind(this))
    ).subscribe();
  }
}


