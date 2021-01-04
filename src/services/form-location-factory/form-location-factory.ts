import { Injectable, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CachedItemRequestSourceFrom, LocationSearchCriteria, ProfileService } from '@project-sunbird/sunbird-sdk';
import { FieldConfigOptionsBuilder } from 'common-form-elements';
import { defer, of } from 'rxjs';
import { CommonUtilService, TelemetryGeneratorService } from '@app/services';
import { Location as LocationType } from '@app/app/app.constant';
import { distinctUntilChanged, startWith, switchMap, tap } from 'rxjs/operators';
import { Location } from '@project-sunbird/client-services/models/location';
@Injectable({ providedIn: 'root' })
export class FormLocationFactory {
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) { }
  buildStateListClosure(): FieldConfigOptionsBuilder<Location> {
    return (formControl: FormControl, _: FormControl, notifyLoading, notifyLoaded) => {
      return defer(async () => {
        const req: LocationSearchCriteria = {
          from: CachedItemRequestSourceFrom.SERVER,
          filters: {
            type: LocationType.TYPE_STATE
          }
        };
        notifyLoading();
        return await this.profileService.searchLocation(req).toPromise()
          .then((stateLocationList: Location[]) => {
            return stateLocationList.map((s) => ({ label: s.name, value: s }));
          })
          .catch((e) => {
            this.commonUtilService.showToast('NO_DATA_FOUND');
            console.error(e);
            return [];
          })
          .finally(() => {
            notifyLoaded();
          });
      });
    };
  }
  buildLocationListClosure(locationType: string): FieldConfigOptionsBuilder<Location> {
    return (formControl: FormControl, contextFormControl: FormControl, notifyLoading, notifyLoaded) => {
      if (!contextFormControl) {
        return of([]);
      }
      return contextFormControl.valueChanges.pipe(
        startWith(contextFormControl.value),
        distinctUntilChanged((a: Location, b: Location) => JSON.stringify(a) === JSON.stringify(b)),
        tap(() => {
          if (formControl.value) {
            formControl.patchValue(null);
          }
        }),
        switchMap(async (value) => {
          if (!value) {
            return [];
          }
          const req: LocationSearchCriteria = {
            from: CachedItemRequestSourceFrom.SERVER,
            filters: {
              type: locationType,
              parentId: (contextFormControl.value as Location).id
            }
          };
          notifyLoading();
          return await this.profileService.searchLocation(req).toPromise()
            .then((locationList: Location[]) => {
              return locationList.map((s) => ({ label: s.name, value: s }));
            })
            .catch((e) => {
              this.commonUtilService.showToast('NO_DATA_FOUND');
              console.error(e);
              return [];
            })
            .finally(() => {
              notifyLoaded();
            });
        })
      );
    };
  }
  // private generateTelemetryInteract(telemetryData) {
  //   this.telemetryGeneratorService.generateInteractTelemetry(
  //     telemetryData.type,
  //     telemetryData.subType,
  //     telemetryData.env,
  //     telemetryData.pageId,
  //     undefined,
  //     undefined,
  //     undefined,
  //     undefined,
  //     telemetryData.id
  //   );
  // }
}