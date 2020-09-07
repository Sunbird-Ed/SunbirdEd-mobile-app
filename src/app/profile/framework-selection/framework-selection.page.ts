import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FrameworkCommonFormConfigBuilder } from '@app/services/common-form-config-builders/framework-common-form-config-builder';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { FieldConfig } from 'common-form-elements';

@Injectable({ providedIn: 'root' })
export class FrameworkSelectionDelegateService {
  delegate?: FrameworkSelectionActionsDelegate;
}

export interface FrameworkSelectionActionsDelegate {
  onFrameworkSelectionSubmit(formInput?: any, formOutput?: any, router?: Router, commonUtilService?: CommonUtilService);
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

  constructor(
    private router: Router,
    private frameworkCommonFormConfigBuilder: FrameworkCommonFormConfigBuilder,
    private appHeaderService: AppHeaderService,
    public commonUtilService: CommonUtilService,
    private frameworkSelectionDelegateService: FrameworkSelectionDelegateService
  ) {
    this.getNavParams();
  }

  getNavParams() {
    const paramData = this.router.getCurrentNavigation().extras && this.router.getCurrentNavigation().extras.state;
    if (paramData) {
      this.title = paramData.title;
      this.subTitle = paramData.subTitle;
      this.formConfig = paramData.formConfig;
      this.formConfigInput = paramData.formConfig && Array.isArray(paramData.formConfig) ?
        JSON.parse(JSON.stringify(paramData.formConfig)) : [];
      this.submitDetails = paramData.submitDetails;
    }
  }

  ngOnInit(): void {
    this.initilizeFormConfig();
    this.appHeaderService.showHeaderWithBackButton();
  }

  ngOnDestroy(): void {
    this.frameworkSelectionDelegateService.delegate = undefined;
  }

  initilizeFormConfig() {
    if (this.formConfig) {
      this.formConfig.forEach(ele => {
        if (ele.templateOptions.dataSrc) {
          this.converDataSrcToClosure(ele);
        }
      });
    }
  }

  valueChanged(event) {
    console.log(event);
    this.selectedFrameworkData = event;
  }

  statusChanged(event) {
    this.isFrameworkFormValid = event.isValid;
  }

  submitForm() {
    if (this.frameworkSelectionDelegateService.delegate) {
      this.frameworkSelectionDelegateService.delegate.onFrameworkSelectionSubmit(
        this.formConfigInput, this.selectedFrameworkData, this.router, this.commonUtilService
      );
    }
  }

  converDataSrcToClosure(ele) {
    const dataSrc = ele.templateOptions.dataSrc;
    switch (dataSrc.marker) {
      case 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES':
        ele.templateOptions.options = this.getClosure('board');
        break;
      case 'FRAMEWORK_CATEGORY_TERMS':
        ele.templateOptions.options = this.getClosure(dataSrc.params.categoryCode);
        break;
    }
  }

  getClosure(type: string) {
    switch (type) {
      case 'board':
        return this.frameworkCommonFormConfigBuilder.getBoardConfigOptionsBuilder();
      case 'medium':
        return this.frameworkCommonFormConfigBuilder.getMediumConfigOptionsBuilder();
      case 'grade':
        return this.frameworkCommonFormConfigBuilder.getGradeConfigOptionsBuilder();
      case 'subject':
        return this.frameworkCommonFormConfigBuilder.getSubjectConfigOptionsBuilder();
    }
  }

}
