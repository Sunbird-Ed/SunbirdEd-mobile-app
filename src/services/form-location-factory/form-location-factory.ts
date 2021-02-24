import { Inject, Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Location as LocationType } from '@app/app/app.constant';
import { CommonUtilService, TelemetryGeneratorService } from '@app/services';
import { Location } from '@project-sunbird/client-services/models/location';
import { CachedItemRequestSourceFrom, LocationSearchCriteria, ProfileService } from '@project-sunbird/sunbird-sdk';
import { FieldConfig, FieldConfigOptionsBuilder } from 'common-form-elements-v8';
import { concat, defer, iif, of } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FormLocationFactory {
  private userLocationCache: { [request: string]: Location[] | undefined } = {};
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) { }
  buildStateListClosure(config: FieldConfig<any>, initial = false): FieldConfigOptionsBuilder<Location> {
    return (formControl: FormControl, _: FormControl, notifyLoading, notifyLoaded) => {
      return defer(async () => {
        const req: LocationSearchCriteria = {
          from: CachedItemRequestSourceFrom.SERVER,
          filters: {
            type: LocationType.TYPE_STATE
          }
        };
        notifyLoading();
        return this.fetchUserLocation(req)
          .then((stateLocationList: Location[]) => {
            notifyLoaded();
            const list = stateLocationList.map((s) => ({ label: s.name, value: s }));
            if (config.default && initial) {
              const option = list.find((o) => o.value.id === config.default.id || o.label === config.default.name);
              formControl.patchValue(option ? option.value : null, { emitModelToViewChange: false });
              formControl.markAsPristine();
              config.default['code'] = option ? option.value['code'] : config.default['code'];
            }
            initial = false;
            return list;
          })
          .catch((e) => {
            notifyLoaded();
            this.commonUtilService.showToast('NO_DATA_FOUND');
            console.error(e);
            return [];
          });
      });
    };
  }
  buildLocationListClosure(config: FieldConfig<any>, initial = false): FieldConfigOptionsBuilder<Location> {
    const locationType = config.templateOptions['dataSrc']['params']['id'];
    return (formControl: FormControl, contextFormControl: FormControl, notifyLoading, notifyLoaded) => {
      if (!contextFormControl) {
        return of([]);
      }
      return iif(
        () => initial,
        contextFormControl.valueChanges,
        concat(
          of(contextFormControl.value),
          contextFormControl.valueChanges
        )
      ).pipe(
        distinctUntilChanged((a: Location, b: Location) => {
          return !!(!a && !b ||
            !a && b ||
            !b && a ||
            a.code === b.code);
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
          return await this.fetchUserLocation(req).then((locationList: Location[]) => {
            notifyLoaded();
            const list = locationList.map((s) => ({ label: s.name, value: s }));
            if (config.default && initial && !formControl.value) {
              const option = list.find((o) => o.value.id === config.default.id);
              formControl.patchValue(option ? option.value : null);
              formControl.markAsPristine();
              config.default['code'] = option ? option.value['code'] : config.default['code'];
            }
            initial = false;
            return list;
          })
            .catch((e) => {
              notifyLoaded();
              this.commonUtilService.showToast('NO_DATA_FOUND');
              console.error(e);
              return [];
            });
        })
      );
    };
  }

  private async fetchUserLocation(request: any): Promise<Location[]> {
    const serialized = JSON.stringify(request);
    if (this.userLocationCache[serialized]) {
      return this.userLocationCache[serialized];
    }
    return this.profileService.searchLocation(request).toPromise()
      .then((response) => {
        this.userLocationCache[serialized] = response;
        return response;
      });
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
