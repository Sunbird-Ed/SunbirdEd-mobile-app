import { Inject, Injectable } from '@angular/core';
import {
    CachedItemRequestSourceFrom,
    FrameworkService,
    LocationSearchCriteria,
    LocationSearchResult,
    Organization,
    ProfileService,
    SharedPreferences
} from '@project-sunbird/sunbird-sdk';
import { Location, PreferenceKey } from '../app/app.constant';

@Injectable()
export class LocationHandler {
    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService
    ) { }

    public async getAvailableLocation(profile?, isLoggedIn?): Promise<LocationSearchResult[]> {
        let locationResult: LocationSearchResult[] = [];
        if (profile && profile['userLocations'] && profile['userLocations'].length) {
            for (const userLocation of profile['userLocations']) {
                locationResult.push(userLocation);
            }
        } else {
            if (isLoggedIn) {
                if (await this.isIpLocationAvailable()) {
                    locationResult = await this.getLocation(PreferenceKey.IP_LOCATION);
                } else if (await this.isDeviceLocationAvailable()) {
                    locationResult = await this.getLocation(PreferenceKey.DEVICE_LOCATION);
                }
            } else {
                if (await this.isDeviceLocationAvailable()) {
                    locationResult = await this.getLocation(PreferenceKey.DEVICE_LOCATION);
                } else if (await this.isIpLocationAvailable()) {
                    locationResult = await this.getLocation(PreferenceKey.IP_LOCATION);
                }
            }
        }
        return locationResult || [];

    }

    private async getLocation(preferenceKey: string) {
        const locationResult: LocationSearchResult[] = [];
        const location = JSON.parse(await this.preferences.getString(preferenceKey).toPromise());
        if (location && location.stateId && location.districtId) {
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

            if (location.blockId) {
                locationResult.push({
                    name: location.block,
                    code: location.blockId,
                    id: location.blockId,
                    type: Location.TYPE_BLOCK
                });
            }

            if (location.clusterId) {
                locationResult.push({
                    name: location.cluster,
                    code: location.clusterId,
                    id: location.clusterId,
                    type: Location.TYPE_CLUSTER
                });
            }

            if (location.schoolId) {
                locationResult.push({
                    name: location.school,
                    code: location.schoolId,
                    id: location.schoolId,
                    type: Location.TYPE_SCHOOL
                });
            }

        } else {
            if (location && location.state) {
                const state = await this.getLocationDetails(Location.TYPE_STATE, location.state);
                if(state && state.id){
                    locationResult.push(state);
                    if(location.district){
                        const district = await this.getLocationDetails(Location.TYPE_DISTRICT, location.district, state.id);
                        locationResult.push(district);
                        let block, cluster, school;
                        if (location.block) {
                            block = await this.getLocationDetails(Location.TYPE_BLOCK, location.block, district.id);
                            locationResult.push(block);
                        }
        
                        if (location.block && location.cluster) {
                            cluster = await this.getLocationDetails(Location.TYPE_CLUSTER, location.cluster, block.id);
                            locationResult.push(cluster);
                        }
        
                        if (location.block && location.cluster && location.school) {
                            school = await this.getLocationDetails(Location.TYPE_SCHOOL, location.school, cluster.id);
                            locationResult.push(school);
                        }
                    }
                }
                
            }
        }
        return locationResult;
    }

    public async getLocationDetails(locationType: string, locationValue: string, parentLocationId?: string):
        Promise<LocationSearchResult> {
        const locationFilter = {
            type: locationType,
            ...((parentLocationId) ? { parentId: parentLocationId } : {})
        };
        let locations: LocationSearchResult[];
        if (locationType === Location.TYPE_SCHOOL) {
            const orgSearchRequest = {
                filters: {
                  'orgLocation.id': parentLocationId,
                  isSchool: true
                }
              };
            let schoolDetails = [];
            await this.frameworkService.searchOrganization(orgSearchRequest).toPromise().then((data) => {
                schoolDetails = data.content.map((org: Organization) => {
                    if (org && org.externalId) {
                        return {code: org.externalId, name: (org.orgName || locationValue), type: Location.TYPE_SCHOOL, id: org.externalId};
                    }
                });
            });
            locations = schoolDetails;
        } else {
            const req: LocationSearchCriteria = {
                from: CachedItemRequestSourceFrom.CACHE,
                filters: locationFilter
            };
            locations = await this.profileService.searchLocation(req).toPromise();
        }
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

    async getLocationList(request): Promise<LocationSearchResult[]> {
        const locationType = request.filters.type;
        const parentLocationId = request.filters.parentId;
        const locationFilter = {
            type: locationType,
            ...((parentLocationId) ? { parentId: parentLocationId } : {})
        };
        let locations: LocationSearchResult[];
        if (locationType === Location.TYPE_SCHOOL) {
            const orgSearchRequest = {
                filters: {
                  'orgLocation.id': parentLocationId,
                  isSchool: true
                }
              };
            let schoolDetails = [];
            await this.frameworkService.searchOrganization(orgSearchRequest).toPromise().then((data) => {
                schoolDetails = data.content.map((org: Organization) => {
                    if (org && org.externalId) {
                        return {code: org.externalId, name: org.orgName , type: Location.TYPE_SCHOOL, id: org.externalId};
                    }
                });
            });
            locations = schoolDetails;
        } else {
            const req: LocationSearchCriteria = {
                from: CachedItemRequestSourceFrom.SERVER,
                filters: locationFilter
            };
            locations = await this.profileService.searchLocation(req).toPromise();
        }
        return locations;
    }
}
