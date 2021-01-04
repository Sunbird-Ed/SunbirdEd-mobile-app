import { Inject, Injectable } from '@angular/core';
import {
    CachedItemRequestSourceFrom,
    LocationSearchCriteria,
    LocationSearchResult,
    ProfileService,
    SharedPreferences
} from '@project-sunbird/sunbird-sdk';
import { Location, PreferenceKey } from '../app/app.constant';

@Injectable()
export class LocationHandler {
    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService
    ) { }

    public async getAvailableLocation(profile?): Promise<LocationSearchResult[]> {
        let locationResult: LocationSearchResult[] = [];
        if (profile && profile['userLocations'] && profile['userLocations'].length) {
            for (const userLocation of profile['userLocations']) {
                locationResult.push(userLocation);
            }
        } else if (await this.isDeviceLocationAvailable()) {
            locationResult = await this.getLocation(PreferenceKey.DEVICE_LOCATION);
        } else if (await this.isIpLocationAvailable()) {
            locationResult = await this.getLocation(PreferenceKey.IP_LOCATION);
        }

        return locationResult;

    }

    private async getLocation(preferenceKey: string) {
        const locationResult: LocationSearchResult[] = [];
        const location = JSON.parse(await this.preferences.getString(preferenceKey).toPromise());
        if (location.stateId && location.districtId) {
            locationResult.push({
                name: location.state,
                code: location.stateId,
                id: location.stateId,
                type: Location.TYPE_STATE
            });

            locationResult.push({
                name: location.district,
                code: location.districtId,
                id: location.districtId,
                type: Location.TYPE_DISTRICT
            });

        } else {
            const state = await this.getLocationDetails(Location.TYPE_STATE, location.state);
            const district = await this.getLocationDetails(Location.TYPE_DISTRICT, location.district, state.id);
            locationResult.push(state);
            locationResult.push(district);
        }
        return locationResult;
    }

    private async getLocationDetails(locationType: string, locationValue: string, parentLocationId?: string):
        Promise<LocationSearchResult> {
        const locationFilter = {
            type: locationType,
            ...((parentLocationId) ? { parentId: parentLocationId } : {})
        };

        const req: LocationSearchCriteria = {
            from: CachedItemRequestSourceFrom.CACHE,
            filters: locationFilter
        };
        const locations: LocationSearchResult[] = await this.profileService.searchLocation(req).toPromise();
        if (!locations || !Object.keys(locations).length) {
            return undefined;
        }
        return locations.find(s => (s.name === locationValue));

    }

    getUserLocation(profile: any) {
        const userLocation = {
            state: {},
            district: {}
        };
        if (profile && profile.userLocations && profile.userLocations.length) {
            for (let i = 0, len = profile.userLocations.length; i < len; i++) {
                if (profile.userLocations[i].type === 'state') {
                    userLocation.state = profile.userLocations[i];
                } else if (profile.userLocations[i].type === 'district') {
                    userLocation.district = profile.userLocations[i];
                }
            }
        }

        return userLocation;
    }

    isUserLocationAvalable(profile: any): boolean {
        const location = this.getUserLocation(profile);
        return !!(location && location.state && location.state['name'] && location.district && location.district['name']);
    }

    async isDeviceLocationAvailable(): Promise<boolean> {
        const deviceLoc = await this.preferences.getString(PreferenceKey.DEVICE_LOCATION).toPromise();
        return !!deviceLoc;
    }

    async isIpLocationAvailable(): Promise<boolean> {
        const deviceLoc = await this.preferences.getString(PreferenceKey.IP_LOCATION).toPromise();
        return !!deviceLoc;
    }
}
