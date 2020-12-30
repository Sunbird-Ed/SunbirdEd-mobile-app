import { Injectable, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CachedItemRequestSourceFrom, LocationSearchCriteria, ProfileService } from '@project-sunbird/sunbird-sdk';
import { FieldConfigOption } from 'common-form-elements';
import { defer, of } from 'rxjs';
import { CommonUtilService } from '../common-util.service';
import { Location as loc } from '../../app/app.constant';
import { TelemetryGeneratorService } from '../telemetry-generator.service';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FormLocationFactory {

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) { }

  buildStateListClosure(stateCode?, stateList?, availableLocationState?): any {
    return (formControl: FormControl, _: FormControl, notifyLoading, notifyLoaded) => {
      return defer(async () => {

        const formStateList: FieldConfigOption<string>[] = [];
        let selectedState;

        const loader = await this.commonUtilService.getLoader();
        await loader.present();
        const req: LocationSearchCriteria = {
          from: CachedItemRequestSourceFrom.SERVER,
          filters: {
            type: loc.TYPE_STATE
          }
        };
        try {
          if (!stateList) {
            stateList = await this.profileService.searchLocation(req).toPromise();
          }

          if (stateList && Object.keys(stateList).length) {

            stateList.forEach(stateData => {
              formStateList.push({ label: stateData.name, value: stateData.code });
            });

            if (availableLocationState) {
              selectedState = stateList.find(s =>
                (s.name === availableLocationState)
              );
            }

            setTimeout(() => {
              formControl.patchValue(stateCode || (selectedState && selectedState.code) || null);
            }, 0);

          } else {
            this.commonUtilService.showToast('NO_DATA_FOUND');
          }
        } catch (e) {
          console.log(e);
        } finally {
          loader.dismiss();
        }
        return formStateList;
      });
    };
  }

  buildDistrictListClosure(districtCode?, stateList?, availableLocationDistrict?, isFormLoaded?): any {
    return (formControl: FormControl, contextFormControl: FormControl, notifyLoading, notifyLoaded) => {
      if (!contextFormControl) {
        return of([]);
      }

      return contextFormControl.valueChanges.pipe(
        distinctUntilChanged(),
        tap(() => {
          formControl.patchValue(null);
        }),
        switchMap((value) => {
          return defer(async () => {
            const formDistrictList: FieldConfigOption<string>[] = [];
            let selectedDistrict;

            const loader = await this.commonUtilService.getLoader();
            await loader.present();

            const selectdState = this.getStateIdFromCode(contextFormControl.value, stateList);

            const req: LocationSearchCriteria = {
              from: CachedItemRequestSourceFrom.SERVER,
              filters: {
                type: loc.TYPE_DISTRICT,
                parentId: selectdState && selectdState.id
              }
            };
            try {
              const districtList = await this.profileService.searchLocation(req).toPromise();

              if (districtList && Object.keys(districtList).length) {

                districtList.forEach(districtData => {
                  formDistrictList.push({ label: districtData.name, value: districtData.code });
                });

                if (!isFormLoaded) {
                  if (availableLocationDistrict) {
                    selectedDistrict = districtList.find(s =>
                      (s.name === availableLocationDistrict)
                    );
                  }

                  setTimeout(() => {
                    formControl.patchValue(districtCode || (selectedDistrict && selectedDistrict.code) || null);
                  }, 0);
                } else {
                  setTimeout(() => {
                    formControl.patchValue(null);
                  }, 0);
                }

              } else {
                // this.availableLocationDistrict = '';
                // this.districtList = [];
                this.commonUtilService.showToast('NO_DATA_FOUND');
              }
            } catch (e) {
              console.error(e);
            } finally {
              loader.dismiss();
            }
            return formDistrictList;
          });
        })
      );
    };
  }

  private getStateIdFromCode(code, stateList) {
    if (stateList && stateList.length) {
      const selectedState = stateList.find(state => state.code === code);
      return selectedState;
    }
    return null;
  }

  private generateTelemetryInteract(telemetryData) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      telemetryData.type,
      telemetryData.subType,
      telemetryData.env,
      telemetryData.pageId,
      undefined,
      undefined,
      undefined,
      undefined,
      telemetryData.id
    );
  }

}
