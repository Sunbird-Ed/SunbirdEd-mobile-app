import { FormBuilder } from '@angular/forms';
import {Component, Inject, NgZone, OnDestroy, OnInit, ViewChild, Input} from '@angular/core';
import { NavParams, Platform, ModalController } from '@ionic/angular';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {CorReleationDataType, Environment, InteractSubtype, InteractType, PageId} from '@app/services';
import {Location} from '@angular/common';
import {Subscription} from 'rxjs';
import {
  ContentSearchCriteria,
  ContentSearchResult,
  ContentService,
  SearchType, TelemetryObject
} from 'sunbird-sdk';
import {ContentType, ExploreConstants, RouterLinks, Search} from '@app/app/app.constant';
import {Router} from '@angular/router';
import {ContentUtil} from '@app/util/content-util';
@Component({
  selector: 'app-explore-books-sort',
  templateUrl: './explore-books-sort.component.html',
  styleUrls: ['./explore-books-sort.component.scss'],
})
export class ExploreBooksSortComponent implements OnInit, OnDestroy {
  @Input() boardList: string[];
  @Input() mediumList: string[];
  @Input() gradeList: string[];
  @Input() curLang: string;
  storyAndWorksheets: Array<any>;
  unregisterBackButton: Subscription;
  searchRequest: ContentSearchCriteria = {
    searchType: SearchType.SEARCH
  };
  appName = '';
  public imageSrcMap = new Map();
  defaultImg: string;
  constructor(
    private platform: Platform,
    public commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private location: Location,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private ngZone: NgZone,
    private router: Router
  ) {
    this.initForm();
    this.defaultImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_launcher.png');
  }
  async ngOnInit() {
    this.handleBackButton(false);
    this.appName = await this.commonUtilService.getAppName();
  }

  initForm() {
    this.getRelevantTextBooks();
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(11, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
          PageId.EXPLORE_MORE_CONTENT,
          Environment.HOME,
          false);
      this.modalCtrl.dismiss(null);
    });
  }

  private getRelevantTextBooks() {
    this.searchRequest.board = this.boardList ? this.boardList : null;
    this.searchRequest.medium = this.mediumList ? this.mediumList : null;
    this.searchRequest.grade = this.gradeList ? this.gradeList : null;
    this.searchRequest.facets = Search.FACETS_ETB;
    this.searchRequest.mode = 'hard';
    this.searchRequest.contentTypes = [ContentType.TEXTBOOK];
    this.searchRequest.fields = ExploreConstants.REQUIRED_FIELDS;
    this.contentService.searchContent(this.searchRequest).toPromise()
        .then((result: ContentSearchResult) => {
          this.ngZone.run(() => {
            this.storyAndWorksheets = result.contentDataList;
            for (let i = 0; i < this.storyAndWorksheets.length; i++) {
              // check if locally available
                const content = this.storyAndWorksheets[i];
                if (content.appIcon) {
                  if (content.appIcon.includes('http:') || content.appIcon.includes('https:')) {
                    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
                      content.cardImg = content.appIcon;
                    } else {
                      this.imageSrcMap.set(content.identifier, content.appIcon);
                      content.appIcon = this.defaultImg;
                    }
                  } else if (content.basePath) {
                    content.appIcon = content.basePath + '/' + content.appIcon;
                  }
                }
            }
          });
        });
  }

  handleBackButton(isNavBack: boolean) {
    if (isNavBack) {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.EXPLORE_MORE_CONTENT, Environment.HOME, true);
      this.modalCtrl.dismiss(null);
    }

  }

  ngOnDestroy(): void {
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }
  navigateToTextBookDetailPage(event) {
    const item = event.data;
    const index = event.index;
    const identifier = event.data.contentId || event.data.identifier;
    const telemetryObject: TelemetryObject = new TelemetryObject(identifier, item.contentType, item.pkgVersion);
    const corRelationList = [{ id: event.data.name, type: CorReleationDataType.SUBJECT }];
    const values = {};
    values['sectionName'] = item.subject;
    values['positionClicked'] = index;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.CONTENT_CLICKED,
        Environment.HOME,
        PageId.LIBRARY,
        telemetryObject,
        values,
        ContentUtil.generateRollUp(undefined, identifier),
        corRelationList);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      this.modalCtrl.dismiss(null);
      this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], { state: { content: item, corRelation: corRelationList } });
    } else {
      this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI_1');
    }
  }
  navigateToTextbookPage(items) {
    const identifier = items.contentId || items.identifier;
    let telemetryObject: TelemetryObject;
    telemetryObject = new TelemetryObject(identifier, items.contentType, undefined);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.VIEW_MORE_CLICKED,
        Environment.HOME,
        PageId.LIBRARY,
        telemetryObject);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || items.isAvailableLocally) {
      this.modalCtrl.dismiss(null);
      this.router.navigate([RouterLinks.TEXTBOOK_VIEW_MORE], {
        state: {
          content: items,
          subjectName: ''
        }
      });
    } else {
      this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI_1');
    }
  }
}
