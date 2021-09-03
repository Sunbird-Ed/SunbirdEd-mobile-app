import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { LoaderService, ToastService } from '../../core';
import { DbService } from '../../core/services/db.service';
import { UtilsService } from '../../core/services/utils.service';
import { ContentDetailRequest, Content, ContentService } from 'sunbird-sdk';
import { NavigationService } from '@app/services/navigation-handler.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';

var environment = {
  db: {
    projects: 'project.db',
    categories: 'categories.db'
  },
  deepLinkAppsUrl: ''
};

@Component({
  selector: 'app-learning-resources',
  templateUrl: './learning-resources.page.html',
  styleUrls: ['./learning-resources.page.scss']
})
export class LearningResourcesPage {
  projectId;
  taskId: any;
  list;
  networkFlag: boolean;
  private backButtonFunc: Subscription;
  private _networkSubscription: Subscription;

  private _headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: [] as string[]
  };

  constructor(
    private routerparam: ActivatedRoute,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    private utils: UtilsService,
    private loader: LoaderService,
    private toast: ToastService,
    private db: DbService,
    private navigateService: NavigationService,
    private platform: Platform,
    private location: Location,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private commonUtilService: CommonUtilService
  ) // private openResources: OpenResourcesService
  {
    let data;
    routerparam.params.subscribe((param) => {
      this.projectId = param.id;
      this.taskId = param.taskId;
      this.getProjectFromLocal(this.projectId);
    });
    this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
    this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
        this.networkFlag = available;
      })
  }

  ngOnDestroy() {
    if(this._networkSubscription){
      this._networkSubscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    let data;
    this.translate
      .get(['FRMELEMNTS_LBL_LEARNING_RESOURCES']).subscribe((text) => {
        data = text;
      });
    this._headerConfig = this.headerService.getDefaultPageConfig();
    this._headerConfig.actionButtons = [];
    this._headerConfig.showHeader = true;
    this._headerConfig.showBurgerMenu = false;
    this._headerConfig.pageTitle = data['FRMELEMNTS_LBL_LEARNING_RESOURCES'];
    this.headerService.updatePageConfig(this._headerConfig);
    this.handleBackButton();
  }

  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10,() => {
        this.location.back();
        this.backButtonFunc.unsubscribe();
      }
    );
  }
  getProjectFromLocal(projectId) {
    this.db.query({ _id: projectId }).then(
      (success) => {
        this.list = success.docs.length ? success.docs[0] : [];
        if (this.taskId) {
          this.list = this.list.tasks.filter((t) => t._id == this.taskId)[0];
        }
      },
      error => {}
    );
  }
  openBodh(id) {
    if (!this.networkFlag) {
      this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
      return;
    }
    const req: ContentDetailRequest = {
      contentId: id,
      attachFeedback: false,
      attachContentAccess: false,
      emitUpdateIfAny: false
    };

    this.contentService
      .getContentDetails(req)
      .toPromise()
      .then(async (data: Content) => {
        this.navigateService.navigateToDetailPage(data, { content: data });
      });
  }
}
