import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonUtilService } from '../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { CorReleationDataType, Environment, InteractSubtype, InteractType, PageId, ImpressionType } from '../../../services/telemetry-constants';
import {
  ContentSearchCriteria,
  ContentSearchResult,
  ContentService,
  SearchType,
  GetSuggestedFrameworksRequest,
  CachedItemRequestSourceFrom,
  FrameworkCategoryCodesGroup,
  FrameworkUtilService,
  CorrelationData
} from '@project-sunbird/sunbird-sdk';
import { ExploreConstants, RouterLinks, Search } from '../../../app/app.constant';
import { Router } from '@angular/router';
import { ContentUtil } from '../../../util/content-util';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../../../services/navigation-handler.service';

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

  private getRelevantContents() {
    this.fetchContentResult(this.searchRequest).then(content => {
      this.relevantContentList = content
    }).catch(e => console.log(e));
  }

  private getSimilarContents() {
    try {
      const similarContentRequest: ContentSearchCriteria = { ...this.searchRequest };

      if (this.selectedFramework.board && this.defaultBoard.length && this.selectedFramework.board.find(e => e === this.defaultBoard[0])) {
        this.getBoardList(this.searchRequest.board && this.searchRequest.board[0]).then(boardList => {
          similarContentRequest.board = boardList
        }).catch(e => console.log(e))
      } else {
        similarContentRequest.board = this.defaultBoard[0];
      }
      similarContentRequest.mode = 'soft';

      similarContentRequest.primaryCategories = this.getPrimaryCategoryList();
      this.fetchContentResult(similarContentRequest).then(contentList => {
        contentList.sort((a) => {
          const val = (a['primaryCategory'] !== this.searchRequest.primaryCategories[0]) ? 1 : -1;
          return val;
        });
        this.similarContentList = contentList;
        this.isLoading = false;
      }).catch(e => console.log(e));
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
          contentList[i]['cardImg'] = ContentUtil.getAppIcon(contentList[i].appIcon,
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

  async navigateToTextBookDetailPage(event) {
    const item = event.data;
    const index = event.index;
    const identifier = item.contentId || item.identifier;
    const corRelationList = [{ id: item.name, type: CorReleationDataType.SUBJECT }];
    const values = {};
    values['sectionName'] = item.subject;
    values['positionClicked'] = index;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.HOME,
      PageId.EXPLORE_MORE_CONTENT,
      ContentUtil.getTelemetryObject(item),
      values,
      ContentUtil.generateRollUp(undefined, identifier),
      corRelationList);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      await this.navService.navigateToDetailPage(
        item,
        { content: item, corRelation: corRelationList }
      );
    } else {
      await this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI');
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

    await this.router.navigate([`/${RouterLinks.FAQ_HELP}`], {
      state: {
        corRelation: this.corRelation
      }
    });
  }

  private getPrimaryCategoryList() {
    const primaryCategoryConfig: any = this.formInput.find(e => e.code === 'primaryCategory');
    const primaryCategoryList = [];
    const list = (primaryCategoryConfig && primaryCategoryConfig.templateOptions && primaryCategoryConfig.templateOptions.options) || [];
    list.forEach(element => {
      primaryCategoryList.push(element.value);
    });
    return primaryCategoryList;
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
