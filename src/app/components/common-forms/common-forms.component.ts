import { Component, Input, OnInit, Output, Inject, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { CommonUtilService } from '@app/services/common-util.service';
import { SharedPreferences } from 'sunbird-sdk';

enum InputType {
  INPUT = 'input',
  CHECKBOX = 'checkbox',
  SELECT = 'select',
  LABEL = 'label'
}

enum ValidationType {
  REQUIRED = 'required',
  PATTERN = 'pattern',
  MINLENGTH = 'minLength',
  MAXLENGTH = 'maxLength'
}

@Component({
  selector: 'app-common-forms',
  templateUrl: './common-forms.component.html',
  styleUrls: ['./common-forms.component.scss'],
})
export class CommonFormsComponent implements OnInit {

// template
// value
// value changes
// submit
// reset

  @Input() formList: any = [];
  @Output() onFormDataChange = new EventEmitter();

  commonFormGroup: FormGroup;
  formInputTypes = InputType;
  formValidationTypes = ValidationType;
  appName = '';

  constructor(
    @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
    private formBuilder: FormBuilder,
    private commonUtilService: CommonUtilService,
  ) { }

  ngOnInit(): void {
    this.initilizeForm();
    this.sharedPreferences.getString('app_name').toPromise().then(value => {
      this.appName = value;
    });
  }

  initilizeForm() {
    if (!this.formList.length) {
      console.error('FORM LIST IS EMPTY');
      return;
    }
    const formGroupData = {};
    this.formList.forEach((element: any) => {
      if (element.type !== this.formInputTypes.LABEL) {
        const formValueList = this.prepareFormValidationData(element);
        formGroupData[element.code] = formValueList;
      }
    });

    this.commonFormGroup = this.formBuilder.group(formGroupData);
  }

  /**
   * @return [''/0/[]/false, Validator.required]
   */
  private prepareFormValidationData(element) {
    const formValueList = [];
    const validationList = [];

    let defaultVal: any = '';
    switch (element.type) {
      case this.formInputTypes.INPUT:
        defaultVal = element.templateOptions.type === 'number' ? 0 : '';
        break;
      case this.formInputTypes.SELECT:
        defaultVal = element.templateOptions.multiple ? [] : '';
        break;
      case this.formInputTypes.CHECKBOX:
        defaultVal = false;
        break;
    }
    formValueList.push(defaultVal);

    if (element.validations && element.validations.length) {
      element.validations.forEach(data => {
        switch (data.type) {
          case this.formValidationTypes.REQUIRED:
            validationList.push(element.type === this.formInputTypes.CHECKBOX ? Validators.requiredTrue : Validators.required);
            break;
          case this.formValidationTypes.PATTERN:
            validationList.push(Validators.pattern(element.validations.pattern));
            break;
          case this.formValidationTypes.MINLENGTH:
            validationList.push(Validators.minLength(element.validations.minLength));
            break;
          case this.formValidationTypes.MAXLENGTH:
            validationList.push(Validators.minLength(element.validations.minLength));
            break;
        }
      });
    }

    formValueList.push(Validators.compose(validationList));

    return formValueList;
  }

  fetchInterfaceOption(fieldName) {
    return {
      header: this.commonUtilService.translateMessage(fieldName).toLocaleUpperCase(),
      cssClass: 'select-box',
      animated: false
    };
  }

  onInputChange(event) {
    setTimeout(() => {
      this.onFormDataChange.emit(this.commonFormGroup);
    }, 0);
  }

  initilizeInputData(data) {
    this.commonFormGroup.patchValue({[data.code]: data.value});
  }

  initilizeFormData(data) {
    for (let index = 0; index < this.formList.length; index++) {
      const formDetails = this.formList[index];
      if (formDetails.code === data.code && formDetails.templateOptions && formDetails.templateOptions.link &&
        formDetails.templateOptions.link.label) {
        this.setFormData(index, data.path, data.value);
      }

      if (formDetails.code === data.code && formDetails.templateOptions && formDetails.templateOptions.options) {
        this.setFormData(index, data.path, data.value);
      }
    }
  }

  setFormData(index, path, value) {
    path.reduce((a, b, level) => {
        if (typeof a[b] === 'undefined' && level !== path.length - 1) {
            a[b] = {};
            return a[b];
        }
        if (level === path.length - 1) {
            a[b] = value;
            return value;
        }
        return a[b];
    }, this.formList[index]);
    console.log(this.formList[index]);
}

  showInAppBrowser(url) {
    this.commonUtilService.openLink(url);
  }

  handleClick(event: MouseEvent) {
    if (event.target && event.target['hasAttribute'] && (event.target as HTMLAnchorElement).hasAttribute('href')) {
      this.commonUtilService.openLink((event.target as HTMLAnchorElement).getAttribute('href'));
    }
  }

  checkDisableCondition(formElement) {
    if (formElement.templateOptions && formElement.templateOptions.prefill && formElement.templateOptions.prefill.length) {
      for (let index = 0; index < formElement.templateOptions.prefill.length; index++) {
        if (!(this.commonFormGroup.value[formElement.templateOptions.prefill[index].key]).length) {
          return true;
        }
      }
    }
    return false;
  }

}
