import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FrameworkCommonFormConfigBuilder } from '../../../services/common-form-config-builders/framework-common-form-config-builder';
import { AppHeaderService } from '../../../services/app-header.service';
import { CommonUtilService } from '../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import {
  CorReleationDataType,
  PageId,
  ImpressionType, Environment
} from '../../../services/telemetry-constants';
import { CorrelationData } from '@project-sunbird/sunbird-sdk';
import { FieldConfigOptionsBuilder } from '../../../app/components/common-forms/field-config';

@Injectable({ providedIn: 'root' })
export class FrameworkSelectionDelegateService {
  delegate?: FrameworkSelectionActionsDelegate;
}

export interface FrameworkSelectionActionsDelegate {
  onFrameworkSelectionSubmit(formInput?: any,
    formOutput?: any, router?: Router,
    commonUtilService?: CommonUtilService, telemetryGeneratorService?: TelemetryGeneratorService, corRelation?: Array<CorrelationData>);
}

@Component({
  selector: 'app-framework-selection',
  templateUrl: './framework-selection.page.html',
  styleUrls: ['./framework-selection.page.scss'],
})
export class FrameworkSelectionPage implements OnInit, OnDestroy {

  private formConfigInput;

  title: string;
  subTitle: string;
  formConfig; any;
  submitDetails: { label?: string, navigateTo?: string };
  isFrameworkFormValid = false;
  selectedFrameworkData: any;
  corRelation: Array<CorrelationData> = [];

  constructor(
    private router: Router,
    private frameworkCommonFormConfigBuilder: FrameworkCommonFormConfigBuilder,
    private appHeaderService: AppHeaderService,
    public commonUtilService: CommonUtilService,
    private frameworkSelectionDelegateService: FrameworkSelectionDelegateService,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) {
    this.getNavParams();
  }

  getNavParams() {
    const paramData = this.router.getCurrentNavigation().extras && this.router.getCurrentNavigation().extras.state;
    if (paramData) {
      this.title = paramData.title;
      this.subTitle = paramData.subTitle;
      this.formConfig = paramData.formConfig;
      this.corRelation = paramData.corRelation;
      this.formConfigInput = paramData.formConfig && Array.isArray(paramData.formConfig) ?
        JSON.parse(JSON.stringify(paramData.formConfig)) : [];
      this.submitDetails = paramData.submitDetails;
    }
    this.corRelation.push({ id: PageId.FRAMEWORK_SELECTION, type: CorReleationDataType.FROM_PAGE });
  }

  async ngOnInit(): Promise<void> {
    this.initializeFormConfig();
    await this.appHeaderService.showHeaderWithBackButton();
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.FRAMEWORK_SELECTION,
      Environment.USER,
      undefined,
      undefined,
      undefined,
      undefined,
      this.corRelation);
  }

  ngOnDestroy(): void {
    this.frameworkSelectionDelegateService.delegate = undefined;
  }

  initializeFormConfig() {
    if (this.formConfig) {
      this.formConfig.forEach(ele => {
        if (ele.templateOptions.dataSrc) {
          this.convertDataSrcToClosure(ele);
        }
      });
    }
  }

  valueChanged(event) {
    this.selectedFrameworkData = event;
  }

  statusChanged(event) {
    this.isFrameworkFormValid = event.isValid;
  }

  submitForm() {
    if (this.frameworkSelectionDelegateService.delegate) {
      this.frameworkSelectionDelegateService.delegate.onFrameworkSelectionSubmit(
        this.formConfigInput, this.selectedFrameworkData, this.router, this.commonUtilService,
        this.telemetryGeneratorService, this.corRelation
      );
    }
  }

  convertDataSrcToClosure(ele) {
    const dataSrc = ele.templateOptions.dataSrc;
    switch (dataSrc.marker) {
      case 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES':
        ele.templateOptions.options = this.getClosure('board');
        break;
      case 'FRAMEWORK_CATEGORY_TERMS':
        ele.templateOptions.options = this.getClosure(dataSrc.params.categoryCode, !!(ele.children && ele.children.other));
        break;
    }
  }

  getClosure(type: string, enableOtherOption?: boolean): FieldConfigOptionsBuilder<any> {
    switch (type) {
      case 'board':
        return this.frameworkCommonFormConfigBuilder.getBoardConfigOptionsBuilder();
      case 'medium':
        return this.frameworkCommonFormConfigBuilder.getMediumConfigOptionsBuilder();
      case 'grade':
        return this.frameworkCommonFormConfigBuilder.getGradeConfigOptionsBuilder();
      case 'subject':
        return this.frameworkCommonFormConfigBuilder.getSubjectConfigOptionsBuilder(null, enableOtherOption);
    }
  }

}
