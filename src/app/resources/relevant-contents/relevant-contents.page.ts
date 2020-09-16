import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CorReleationDataType, Environment, InteractSubtype, InteractType, PageId, ImpressionType } from '@app/services';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  ContentSearchCriteria,
  ContentSearchResult,
  ContentService,
  SearchType, TelemetryObject, GetSuggestedFrameworksRequest, CachedItemRequestSourceFrom, FrameworkCategoryCodesGroup, FrameworkUtilService, CorrelationData
} from 'sunbird-sdk';
import { ExploreConstants, RouterLinks, Search } from '@app/app/app.constant';
import { Router } from '@angular/router';
import { ContentUtil } from '@app/util/content-util';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '@app/services/navigation-handler.service';

enum ContentOrder {
  RELEVANT = 'RELEVANT',
  SIMILAR = 'SIMILAR',
}
@Component({
  selector: 'app-relevant-contents',
  templateUrl: './relevant-contents.page.html',
  styleUrls: ['./relevant-contents.page.scss'],
})
export class RelevantContentsPage implements OnInit, OnDestroy {
  private displayCount = 4;
  private formInput: any;
  private searchRequest: ContentSearchCriteria = {
    searchType: SearchType.SEARCH,
    facets: Search.FACETS_ETB,
    fields: ExploreConstants.REQUIRED_FIELDS
  };
  private selectedFramework = {
    board: [],
    medium: [],
    grade: [],
    subject: [],
    primaryCategory: [],
  };
  private paramsData: any;
  private defaultBoard = [];

  relevantContentList: Array<any> = [];
  similarContentList: Array<any>[];
  contentOrder = ContentOrder;
  relevantContentCount = this.displayCount;
  similarContentCount = this.displayCount;
  isLoading = false;
  corRelation: Array<CorrelationData> = [];

  constructor(
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    public commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private translate: TranslateService,
    private router: Router,
    private navService: NavigationService
  ) {
    this.getNavParam();
  }
  async ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.RELEVANT_CONTENTS,
      Environment.USER,
      undefined,
      undefined,
      undefined,
      undefined,
      this.corRelation);
  }

  private getNavParam() {
    this.isLoading = true;
    const navExtras = this.router.getCurrentNavigation().extras && this.router.getCurrentNavigation().extras.state;
    if (navExtras) {
      this.formInput = navExtras.formInput;
      this.corRelation = navExtras.corRelation;
      this.paramsData = navExtras.formOutput;
      this.selectedFramework.board = this.paramsData.board && this.paramsData.board.name ? [this.paramsData.board.name] : [];
      this.selectedFramework.medium = this.paramsData.medium && this.paramsData.medium.name ? [this.paramsData.medium.name] : [];
      this.selectedFramework.grade = this.paramsData.grade && this.paramsData.grade.name ? [this.paramsData.grade.name] : [];
      this.selectedFramework.subject = this.paramsData.subject && this.paramsData.subject.name ? [this.paramsData.subject.name] : [];
      this.selectedFramework.primaryCategory = [this.paramsData.primaryCategory];
    }
    this.getDefaultBoard();
    this.prepareContentRequest();
    this.getRelevantContents();
    this.getSimilarContents();
    this.corRelation.push({ id: PageId.RELEVANT_CONTENTS, type: CorReleationDataType.FROM_PAGE });
  }

  private prepareContentRequest() {
    this.searchRequest.board = this.selectedFramework.board;
    this.searchRequest.medium = this.selectedFramework.medium;
    this.searchRequest.grade = this.selectedFramework.grade;
    this.searchRequest.subject = this.selectedFramework.subject;
    this.searchRequest.primaryCategories = this.selectedFramework.primaryCategory;
    this.searchRequest.mode = 'hard';
  }

  private async getRelevantContents() {
    this.relevantContentList = await this.fetchContentResult(this.searchRequest);
  }

  private async getSimilarContents() {
    try {
      const similarContentRequest: ContentSearchCriteria = { ...this.searchRequest };

      if (this.selectedFramework.board && this.defaultBoard.length && this.selectedFramework.board.find(e => e === this.defaultBoard[0])) {
        similarContentRequest.board = await this.getBoardList(this.searchRequest.board && this.searchRequest.board[0]);
      } else {
        similarContentRequest.board = this.defaultBoard[0];
      }
      similarContentRequest.mode = 'soft';

      similarContentRequest.contentTypes = this.getContentTypeList();
      const contentList = await this.fetchContentResult(similarContentRequest);
      contentList.sort((a) => {
        const val = (a['contentType'] !== this.searchRequest.contentTypes[0]) ? 1 : -1;
        return val;
      });
      this.similarContentList = contentList;
      this.isLoading = false;
    } catch (e) {
      this.isLoading = false;
    }

  }

  private async fetchContentResult(request: ContentSearchCriteria): Promise<any[]> {
    try {
      const result: ContentSearchResult = await this.contentService.searchContent(request).toPromise();
      const contentList = result.contentDataList;
      if (contentList && contentList.length) {
        for (let i = 0; i < contentList.length; i++) {
          contentList[i].appIcon = ContentUtil.getAppIcon(contentList[i].appIcon,
            contentList[i]['basePath'], this.commonUtilService.networkInfo.isNetworkAvailable);
        }
      }
      return contentList || [];
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  ngOnDestroy(): void {

  }

  navigateToTextBookDetailPage(event) {
    const item = event.data;
    const index = event.index;
    const identifier = item.contentId || item.identifier;
    const telemetryObject: TelemetryObject = new TelemetryObject(identifier, item.contentType, item.pkgVersion);
    const corRelationList = [{ id: item.name, type: CorReleationDataType.SUBJECT }];
    const values = {};
    values['sectionName'] = item.subject;
    values['positionClicked'] = index;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.HOME,
      PageId.EXPLORE_MORE_CONTENT,
      telemetryObject,
      values,
      ContentUtil.generateRollUp(undefined, identifier),
      corRelationList);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      this.navService.navigateToDetailPage(
        item,
        { content: item, corRelation: corRelationList }
      );
    } else {
      this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI_1');
    }
  }

  viewMoreContent(type: ContentOrder) {
    if (type === this.contentOrder.RELEVANT) {
      this.relevantContentCount += this.displayCount;
    } else {
      this.similarContentCount += this.displayCount;
    }
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.VIEW_MORE_CLICKED,
      Environment.HOME,
      PageId.RELEVANT_CONTENTS)
  }

  async goToHelp() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.HELP_CLICKED,
      Environment.HOME,
      PageId.RELEVANT_CONTENTS);

    this.router.navigate([`/${RouterLinks.FAQ_HELP}`], {
      state: {
        corRelation: this.corRelation
    }});
  }

  private getContentTypeList() {
    const contentTypeConfig: any = this.formInput.find(e => e.code === 'contenttype');
    const contentTypeList = []
    const list = (contentTypeConfig && contentTypeConfig.templateOptions && contentTypeConfig.templateOptions.options) || [];
    list.forEach(element => {
      contentTypeList.push(element.value);
    });
    return contentTypeList;
  }

  private getDefaultBoard() {
    const boardConfig = this.formInput.find(e => e.code === 'board');
    this.defaultBoard = boardConfig && boardConfig.templateOptions && boardConfig.templateOptions.dataSrc &&
      boardConfig.templateOptions.dataSrc.params && boardConfig.templateOptions.dataSrc.params.relevantTerms ?
      boardConfig.templateOptions.dataSrc.params.relevantTerms : [];
  }

  private async getBoardList(board) {
    const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
      from: CachedItemRequestSourceFrom.CACHE,
      language: this.translate.currentLang,
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };

    try {
      const list = await this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise();
      const boardList = [];
      list.forEach(element => {
        if (element.name !== board) {
          boardList.push(element.name);
        }
      });

      return boardList || [];
    } catch (e) {
      return [];
    }
  }

}
