import {Inject, Injectable} from '@angular/core';
import {FormControl} from '@angular/forms';
import {FieldConfigOption, FieldConfigOptionsBuilder} from 'common-form-elements';
import {defer, EMPTY, of} from 'rxjs';
import {catchError, distinctUntilChanged, switchMap, tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {
  CachedItemRequestSourceFrom,
  FrameworkCategoryCode,
  FrameworkCategoryCodesGroup,
  FrameworkService,
  FrameworkUtilService,
  GetFrameworkCategoryTermsRequest,
  GetSuggestedFrameworksRequest,
  Profile
} from '@project-sunbird/sunbird-sdk';
import {AliasBoardName} from '../../pipes/alias-board-name/alias-board-name';

@Injectable({
  providedIn: 'root'
})
export class FrameworkCommonFormConfigBuilder {

  constructor(
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    private translate: TranslateService,
    private alisaBoard: AliasBoardName
  ) { }

  getBoardConfigOptionsBuilder(profile?: Profile): FieldConfigOptionsBuilder<{ name: string, code: string, deafult?: any }> {
     return ((control: FormControl, _, notifyLoading, notifyLoaded) => {
      return defer(async () => {
        notifyLoading();
        const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
          from: CachedItemRequestSourceFrom.SERVER,
          language: this.translate.currentLang,
          requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
        };

        const list = await this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise();
        const options: FieldConfigOption<{ name: string, code: string }>[] = [];
        list.forEach(element => {
          const value: FieldConfigOption<{ name: string, code: string }> = {
            label: this.alisaBoard.transform(element.name),
            value: {
              name: element.name,
              code: element.identifier
            }
          };
          options.push(value);

          // assign default value for board [optional]
          if (profile && profile.syllabus && profile.syllabus.length
            && profile.syllabus[0] === element.identifier) {
            control.patchValue(value.value);
          }
        });
        notifyLoaded();
        return options;
      }).pipe(
        catchError((e) => {
          console.error(e);
          notifyLoaded();
          return EMPTY;
        })
      );
    });
  }

  getMediumConfigOptionsBuilder(profile?: Profile): FieldConfigOptionsBuilder<{ name: string, code: string, frameworkCode: string }> {
    return ((control: FormControl, context: FormControl, notifyLoading, notifyLoaded) => {
      if (!context) {
        return of([]);
      }
      return context.valueChanges.pipe(
        distinctUntilChanged((v1, v2) => {
          return this.valueComparator(v1 && v1.code, v2 && v2.code);
        }),
        tap(notifyLoading),
        switchMap((value) => {
          if (!value) {
            return of([]);
          }
          const userInput: { name: string, code: string } = value;
          return defer(async () => {
            const framework = await this.frameworkService.getFrameworkDetails({
              from: CachedItemRequestSourceFrom.SERVER,
              frameworkId: userInput.code,
              requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            }).toPromise();

            const boardCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
              frameworkId: userInput.code,
              requiredCategories: [FrameworkCategoryCode.BOARD],
              currentCategoryCode: FrameworkCategoryCode.BOARD,
              language: this.translate.currentLang
            };

            const boardTerm = (await this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise()).
              find(b => b.name === userInput.name);

            const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
              frameworkId: framework.code,
              requiredCategories: [FrameworkCategoryCode.MEDIUM],
              prevCategoryCode: FrameworkCategoryCode.BOARD,
              currentCategoryCode: FrameworkCategoryCode.MEDIUM,
              language: this.translate.currentLang,
              selectedTermsCodes: [boardTerm.code]
            };

            const list = await this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise();
            const options: FieldConfigOption<{ name: string, code: string, frameworkCode: string }>[] = [];
            list.forEach(element => {
              const value: FieldConfigOption<{ name: string, code: string, frameworkCode: string }> = {
                label: element.name,
                value: {
                  name: element.name,
                  code: element.code,
                  frameworkCode: framework.code
                }
              };
              options.push(value);

              if (!context.dirty && profile && profile.medium && profile.medium.length
                && profile.medium[0] === element.code) {
                control.patchValue(value.value);
              }
            });
            return options;
          });
        }),
        tap(notifyLoaded),
        catchError((e) => {
          console.error(e);
          notifyLoaded();
          return EMPTY;
        })
      );
    });
  }

  getGradeConfigOptionsBuilder(profile?: Profile): FieldConfigOptionsBuilder<{ name: string, code: string, frameworkCode: string }> {
    return ((control: FormControl, context: FormControl, notifyLoading, notifyLoaded) => {
      if (!context) {
        return of([]);
      }
      return context.valueChanges.pipe(
        distinctUntilChanged((v1, v2) => {
          return this.valueComparator(v1 && v1.code, v2 && v2.code);
        }),
        tap(notifyLoading),
        switchMap((value) => {
          if (!value) {
            return of([]);
          }
          const userInput: { name: string, code: string, frameworkCode: string } = value;
          return defer(async () => {
            const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
              frameworkId: userInput.frameworkCode,
              requiredCategories: [FrameworkCategoryCode.GRADE_LEVEL],
              prevCategoryCode: FrameworkCategoryCode.MEDIUM,
              currentCategoryCode: FrameworkCategoryCode.GRADE_LEVEL,
              language: this.translate.currentLang,
              selectedTermsCodes: [context.value.code]
            };

            const list = (await this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise());
            const options: FieldConfigOption<{ name: string, code: string, frameworkCode: string }>[] = [];
            list.forEach(element => {
              const value: FieldConfigOption<{ name: string, code: string, frameworkCode: string }> = {
                label: element.name,
                value: {
                  name: element.name,
                  code: element.code,
                  frameworkCode: userInput.frameworkCode
                }
              };
              options.push(value);

              if (!context.dirty && profile && profile.grade && profile.grade.length
                && profile.grade[0] === element.code) {
                control.patchValue(value.value);
              }
            });
            return options;
          });
        }),
        tap(notifyLoaded),
        catchError((e) => {
          console.error(e);
          notifyLoaded();
          return EMPTY;
        })
      );

    });
  }

  getSubjectConfigOptionsBuilder(profile?: Profile, enableOtherAsOption?: boolean): FieldConfigOptionsBuilder<{ name: string, code: string, frameworkCode: string }> {
    return ((control: FormControl, context: FormControl, notifyLoading, notifyLoaded) => {
      if (!context) {
        return of([]);
      }
      return context.valueChanges.pipe(
          distinctUntilChanged((v1, v2) => {
            return this.valueComparator(v1 && v1.code, v2 && v2.code);
          }),
          tap(notifyLoading),
          switchMap((value) => {
          if (!value) {
            return of([]);
          }
          const userInput: { name: string, code: string, frameworkCode: string } = value;
          return defer(async () => {
            const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
              frameworkId: userInput.frameworkCode,
              requiredCategories: [FrameworkCategoryCode.SUBJECT],
              prevCategoryCode: FrameworkCategoryCode.GRADE_LEVEL,
              currentCategoryCode: FrameworkCategoryCode.SUBJECT,
              language: this.translate.currentLang,
              selectedTermsCodes: [context.value.code]
            };

            const list = (await this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise());
            const options: FieldConfigOption<{ name: string, code: string, frameworkCode: string } | 'other'>[] = [];
            list.forEach(element => {
              const value: FieldConfigOption<{ name: string, code: string, frameworkCode: string }> = {
                label: element.name,
                value: {
                  name: element.name,
                  code: element.code,
                  frameworkCode: userInput.frameworkCode
                }
              };
              options.push(value);

              if (!context.dirty && profile && profile.subject && profile.subject.length
                  && profile.subject[0] === element.code) {
                control.patchValue(value.value);
              }
            });

            if (enableOtherAsOption) {
              options.push({
                label: 'Other',
                value: 'other'
              });
            }

            return options;
          });
        }),
        tap(notifyLoaded),
        catchError((e) => {
          console.error(e);
          notifyLoaded();
          return EMPTY;
        })
      );
    });
  }

  private valueComparator(v1: any, v2: any): boolean {
    if (typeof v1 === 'object' && typeof v2 === 'object') {
      return (JSON.stringify(v1) !== JSON.stringify(v2));
    } else if (v1 === v2) {
      return true;
    } else if (!v1 && !v2) {
      return true;
    }
    return false;
  }

}
