import { Observable } from 'rxjs';
import { FormControl, AsyncValidatorFn } from '@angular/forms';
import { QueryList } from '@angular/core';

export enum FieldConfigInputType {
  INPUT = 'input',
  CHECKBOX = 'checkbox',
  SELECT = 'select',
  LABEL = 'label',
  NESTED_SELECT = 'nested_select',
  NESTED_GROUP = 'nested_group'
}

export enum FieldConfigValidationType {
  REQUIRED = 'required',
  MAXLENGTH = 'maxLength',
  MINLENGTH = 'minLength',
  PATTERN = 'pattern'
}

export type FieldConfigOptionsBuilder<T> =
  (control: FormControl, context?: FormControl, notifyLoading?: () => void, notifyLoaded?: () => void) =>
    Observable<FieldConfigOption<T>[]> | Promise<FieldConfigOption<T>[]>;

export type AsyncValidatorFactory = (marker: string, triggers: QueryList<HTMLElement>) => AsyncValidatorFn;

export interface FieldConfigOption<T> {
  label: string;
  value: T;
  extras?: T;
}

export interface FieldConfigOptionAssociations<T> {
  [key: string]: FieldConfigOption<T>[];
}

export interface FieldConfig<T> {
  code: string;
  type: FieldConfigInputType | string;
  default?: any;
  context?: string;
  children?: FieldConfig<T>[];
  templateOptions: {
    type?: string,
    label?: string,
    placeHolder?: string,
    prefix?: string,
    multiple?: boolean,
    hidden?: boolean,
    showIcon?: {
      show?: boolean,
      image?: {
        active: string,
        inactive: string,
      },
      direction: string
    },
    options?: FieldConfigOption<T>[] | FieldConfigOptionsBuilder<T> | FieldConfigOptionAssociations<T>,
    labelHtml?: {
      contents: string,
      values?: {[key: string]: string}
    }
  };
  validations?: {
    type: FieldConfigValidationType | string,
    value?: string | boolean | number | RegExp,
    message?: string
  }[];
  asyncValidation?: {
    marker: string,
    message?: string,
    trigger?: string,
    asyncValidatorFactory?: AsyncValidatorFactory
  };
}
