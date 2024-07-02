import {
  AfterViewInit, Component, EventEmitter, Input,
  OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChildren
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonUtilService } from '../../../services/common-util.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, scan, tap } from 'rxjs/operators';
import {
  FieldConfig, FieldConfigInputType, FieldConfigOption,
  FieldConfigOptionsBuilder, FieldConfigValidationType
} from './field-config';
import { ValueComparator } from './value-comparator';

@Component({
  selector: 'app-common-forms',
  templateUrl: './common-forms.component.html',
  styleUrls: ['./common-forms.component.scss'],
})
export class CommonFormsComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Output() initialize = new EventEmitter();
  @Output() finalize = new EventEmitter();
  @Output() valueChanges = new EventEmitter();
  @Output() statusChanges = new EventEmitter();
  @Output() dataLoadStatus = new EventEmitter<'LOADING' | 'LOADED'>();
  @Input() config;
  @Input() dataLoadStatusDelegate = new Subject<'LOADING' | 'LOADED'>();
  @ViewChildren('validationTrigger') validationTriggers: QueryList<HTMLElement>;

  formGroup: FormGroup;
  FieldConfigInputType = FieldConfigInputType;
  ValueComparator = ValueComparator;
  optionsMap$: { [code: string]: Observable<FieldConfigOption<any>[]> } = {};
  requiredFieldsMap: { [code: string]: boolean } = {};

  private statusChangesSubscription: Subscription;
  private valueChangesSubscription: Subscription;
  private dataLoadStatusSinkSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private commonUtilService: CommonUtilService
  ) { }

  ngOnDestroy(): void {
    this.finalize.emit();
    if (this.statusChangesSubscription) {
      this.statusChangesSubscription.unsubscribe();
    }
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
    if (this.dataLoadStatusSinkSubscription) {
      this.dataLoadStatusSinkSubscription.unsubscribe();
    }
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      if ((changes['config'].currentValue && changes['config'].firstChange) || changes['config'].previousValue !== changes['config'].currentValue) {
        this.initializeForm();

        changes['config'].currentValue.forEach((config: FieldConfig<any>) => {
          if (config.validations && config.validations.length) {
            this.requiredFieldsMap[config.code] = !!config.validations.find(val => val.type === FieldConfigValidationType.REQUIRED);
          }
          if (!config.templateOptions) {
            return;
          }
          if (!config.templateOptions.options) {
            config.templateOptions.options = [];
          }
          if (this.isOptionsClosure(config.templateOptions.options)) {
            this.optionsMap$[config.code] = (config.templateOptions.options as FieldConfigOptionsBuilder<any>)(
              this.formGroup.get(config.code) as FormControl,
              this.formGroup.get(config.context) as FormControl,
              () => this.dataLoadStatusDelegate.next('LOADING'),
              () => this.dataLoadStatusDelegate.next('LOADED')
            ) as any;
          }
        });
      }
    }
    if (this.dataLoadStatusSinkSubscription) {
      this.dataLoadStatusSinkSubscription.unsubscribe();
    }
    if (this.statusChangesSubscription) {
      this.statusChangesSubscription.unsubscribe();
    }
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
    this.dataLoadStatusSinkSubscription = this.dataLoadStatusDelegate.pipe(
      scan<'LOADING' | 'LOADED', { loadingCount: 0, loadedCount: 0 }>((acc, event) => {
        if (event === 'LOADED') {
          acc.loadedCount++;
        } else {
          acc.loadingCount++;
        }
        return acc;
      }, { loadingCount: 0, loadedCount: 0 }),
      map<{ loadingCount: 0, loadedCount: 0 }, 'LOADING' | 'LOADED'>((aggregates) => {
        if (aggregates.loadingCount !== aggregates.loadedCount) {
          return 'LOADING';
        }
        return 'LOADED';
      }),
      distinctUntilChanged(),
      tap((result) => {
        if (result === 'LOADING') {
          this.dataLoadStatus.emit('LOADING');
        } else {
          this.dataLoadStatus.emit('LOADED');
        }
      })
    ).subscribe();
    this.statusChangesSubscription = this.formGroup.statusChanges.pipe(
      tap((v) => {
        this.statusChanges.emit({
          isPristine: this.formGroup.pristine,
          isDirty: this.formGroup.dirty,
          isInvalid: this.formGroup.invalid,
          isValid: this.formGroup.valid
        });
      })
    ).subscribe();
    this.valueChangesSubscription = this.formGroup.valueChanges.pipe(
      tap((v) => {
        this.valueChanges.emit(v);
      })
    ).subscribe();
  }

  ngAfterViewInit() {
    this.config.forEach(element => {
      if (element.asyncValidation && element.asyncValidation.asyncValidatorFactory && this.formGroup.get(element.code)) {
        this.formGroup.get(element.code).setAsyncValidators(element.asyncValidation.asyncValidatorFactory(
          element.asyncValidation.marker,
          this.validationTriggers
        ));
      }
    });
  }

  onNestedFormFinalize(nestedFormGroup: FormGroup, fieldConfig: FieldConfig<any>) {
    if (!this.formGroup.get('children') || !this.formGroup.get(`children.${fieldConfig.code}`)) {
      return;
    }
    (this.formGroup.get('children') as FormGroup).removeControl(fieldConfig.code);
    if (!Object.keys((this.formGroup.get('children') as FormGroup).controls).length) {
      this.formGroup.removeControl('children');
    }
  }
  onNestedFormInitialize(nestedFormGroup: FormGroup, fieldConfig: FieldConfig<any>) {
    if (!this.formGroup.get('children')) {
      this.formGroup.addControl('children', new FormGroup({}));
    }
    (this.formGroup.get('children') as FormGroup).addControl(fieldConfig.code, nestedFormGroup);
  }
  private initializeForm() {
    if (!this.config.length) {
      console.error('FORM LIST IS EMPTY');
      return;
    }
    const formGroupData = {};
    this.config.forEach((element: any, index) => {
      if (element.type !== FieldConfigInputType.LABEL) {
        const formValueList = this.prepareFormValidationData(element, index);
        formGroupData[element.code] = formValueList;
      }
    });
    this.formGroup = this.formBuilder.group(formGroupData);
    this.initialize.emit(this.formGroup);
  }
  private prepareFormValidationData(element: FieldConfig<any>, index) {
    const formValueList = [];
    const validationList = [];
    let defaultVal: any = '';
    switch (element.type) {
      case FieldConfigInputType.INPUT:
        defaultVal = element.templateOptions.type === 'number' ?
          (element.default && Number.isInteger(element.default) ? element.default : 0) :
          (element.default && (typeof element.default) === 'string' ? element.default : '');
        break;
      case FieldConfigInputType.SELECT:
      case FieldConfigInputType.NESTED_SELECT:
        defaultVal = element.templateOptions.multiple ?
          (element.default && Array.isArray(element.default) ? element.default : []) : (element.default || null);
        break;
      case FieldConfigInputType.CHECKBOX:
        defaultVal = false || !!element.default;
        break;
    }
    formValueList.push(defaultVal);
    if (element.validations && element.validations.length) {
      element.validations.forEach((data, i) => {
        switch (data.type) {
          case FieldConfigValidationType.REQUIRED:
            if (element.type === FieldConfigInputType.CHECKBOX) {
              validationList.push(Validators.requiredTrue);
            } else if (element.type === FieldConfigInputType.SELECT || element.type === FieldConfigInputType.NESTED_SELECT) {
              validationList.push((c) => {
                if (element.templateOptions.multiple) {
                  return c.value && c.value.length ? null : 'error';
                }
                return !!c.value ? null : 'error';
              });
            } else {
              validationList.push(Validators.required);
            }
            break;
          case FieldConfigValidationType.PATTERN:
            validationList.push(Validators.pattern(element.validations[i].value as string));
            break;
          case FieldConfigValidationType.MINLENGTH:
            validationList.push(Validators.minLength(element.validations[i].value as number));
            break;
          case FieldConfigValidationType.MAXLENGTH:
            validationList.push(Validators.maxLength(element.validations[i].value as number));
            break;
        }
      });
    }
    formValueList.push(Validators.compose(validationList));
    return formValueList;
  }

  isOptionsArray(options: any) {
    return Array.isArray(options);
  }

  isOptionsClosure(options: any) {
    return typeof options === 'function';
  }

  handleLinkClick(event: MouseEvent) {
    if (event.target && event.target['hasAttribute'] && (event.target as HTMLAnchorElement).hasAttribute('href')) {
      this.commonUtilService.openLink((event.target as HTMLAnchorElement).getAttribute('href'));
    }
  }

}
