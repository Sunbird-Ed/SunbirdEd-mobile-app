import { LocationHandler } from './location-handler';
import { of } from 'rxjs';
import { FrameworkService, ProfileService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { PreferenceKey } from '../app/app.constant';

describe('LocationHandler', () => {
    let locationHandler: LocationHandler;

    const mockSharedPreference: Partial<SharedPreferences> = {
    };

    let mockProfile = {
        userLocations: [{
            type: 'state',
            code: 'sample_code',
            name: 'sample_state',
            id: 'sample_id'
        },
        {
            type: 'district',
            code: 'sample_code',
            name: 'sample_district',
            id: 'sample_id'
        },
        {
            type: 'block',
            code: 'sample_code',
            name: 'sample_block',
            id: 'sample_id'
        },
        {
            type: 'cluster',
            code: 'sample_code',
            name: 'sample_cluster',
            id: 'sample_id'
        }]
    };
    const mockProfileService: Partial<ProfileService> = {
        searchLocation: jest.fn(() => of())
    };
    const mockFrameworkService: Partial<FrameworkService> = {
        searchOrganization: jest.fn(() => of({
            count: 10,
            content: [{
                id: 'sample_id',
                externalId: 'sample_externalId'
            }]
        })) as any
    };


    beforeAll(() => {
        locationHandler = new LocationHandler(
            mockSharedPreference as SharedPreferences,
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of LocationHandler', () => {
        // arrange
        // act
        // assert
        expect(locationHandler).toBeTruthy();
    });
    describe('getAvailableLocation', () => {
        it('should return location results from profile userLocation', (done) => {
            // arrange
            mockSharedPreference.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.DEVICE_LOCATION:
                        value = undefined;
                        break;
                    case PreferenceKey.IP_LOCATION:
                        value = undefined;
                        break;
                }
                return of(value);
            });
            // act
            locationHandler.getAvailableLocation(mockProfile, true).then((response) => {
                // assert
                expect(response).toEqual(mockProfile.userLocations);
                done();
            });
        });
        it('should get avaliable location for logged in user and ip location available', (done) => {
            // arrange
            mockSharedPreference.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.DEVICE_LOCATION:
                        value = undefined;
                        break;
                    case PreferenceKey.IP_LOCATION:
                        value = '{\"district\":\"sample_district\"}';
                        break;
                }
                return of(value);
            });
            // act
            locationHandler.getAvailableLocation({}, true).then((response) => {
                // assert
                done();
            })
        })
        it('should return location results if device location is available with stateId and districtId', (done) => {
            // arrange
            mockSharedPreference.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.DEVICE_LOCATION:
                        value = '{\"district\":\"sample_district\",\
                        "districtId\":\"sample_id\",\"state\":\"sample_state\",\"stateId\":\"sample_id\",\
                    "block\":\"sample_block\",\"blockId\":\"blockId\",\"cluster\":\"sample_cluster\",\"clusterId\":\"clusterId\",\"school\":\"sample_school\",\"schoolId\":\"schoolId\"}';
                        break;
                }
                return of(value);
            });
            // act
            locationHandler.getAvailableLocation().then((response) => {
                // assert
                expect(response).toEqual([{ "code": "sample_id", "id": "sample_id", "name": "sample_state", "type": "state" }, { "code": "sample_id", "id": "sample_id", "name": "sample_district", "type": "district" },
                { "code": "blockId", "id": "blockId", "name": "sample_block", "type": "block" }, { "code": "clusterId", "id": "clusterId", "name": "sample_cluster", "type": "cluster" },
                { "code": "schoolId", "id": "schoolId", "name": "sample_school", "type": "school" }]);
                done();
            });
        });
        it('should return location results if device location is available without stateId and districtId', (done) => {
            // arrange
            mockSharedPreference.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.DEVICE_LOCATION:
                        value = '{\"district\":\"sample_district\",\"state\":\"sample_state\",\"block\":\"sample_block\",\"cluster\":\"sample_cluster\",\"school\":\"sample_school\"}';
                        break;
                }
                return of(value);
            });
            mockProfileService.searchLocation = jest.fn(() => of(mockProfile.userLocations));
            // act
            locationHandler.getAvailableLocation().then((response) => {
                // assert
                expect(response).toEqual([
                    { type: 'state', code: 'sample_code', name: 'sample_state', id: 'sample_id' },
                    { type: 'district', code: 'sample_code', name: 'sample_district', id: 'sample_id' },
                    { type: 'block', code: 'sample_code', name: 'sample_block', id: 'sample_id' },
                    { type: 'cluster', code: 'sample_code', name: 'sample_cluster', id: 'sample_id' },
                    { type: 'school', code: 'sample_externalId', name: 'sample_school', id: 'sample_externalId' }]);
                done();
            });
        });
        it('should return location results if IP location is available', (done) => {
            // arrange
            mockSharedPreference.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.DEVICE_LOCATION:
                        value = undefined;
                        break;
                    case PreferenceKey.IP_LOCATION:
                        value = '{\"district\":\"sample_district\",\"state\":\"sample_state\"}';
                        break;
                }
                return of(value);
            });
            mockFrameworkService.searchOrganization = jest.fn(() => of({
                count: 10,
                content: [{
                    id: 'sample_id'
                }]
            })) as any;
            mockProfileService.searchLocation = jest.fn(() => of(mockProfile.userLocations));
            // act
            locationHandler.getAvailableLocation().then((response) => {
                // assert
                expect(response).toEqual([{
                    type: 'state',
                    code: 'sample_code',
                    name: 'sample_state',
                    id: 'sample_id'
                },
                {
                    type: 'district',
                    code: 'sample_code',
                    name: 'sample_district',
                    id: 'sample_id'
                }]);
                done();
            });
        });
        it('should get avaliable location for logged in user and ip location available', (done) => {
            // arrange
            mockSharedPreference.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.DEVICE_LOCATION:
                        value = '{\"district\":\"sample_district\",\"districtId\":\"sample_id\",\"state\":\"sample_state\",\"stateId\":\"sample_id\",\"block\":\"sample_block\"}';
                        break;
                    case PreferenceKey.IP_LOCATION:
                        value = undefined;
                        break;
                }
                return of(value);
            });
            mockFrameworkService.searchOrganization = jest.fn(() => of({
                count: 10,
                content: [{
                    id: 'sample_id'
                }]
            })) as any;
            // act
            locationHandler.getAvailableLocation({}, true).then((response) => {
                // assert
                done();
            })
        })
        it('should get avaliable location for logged in user and device and ip location not available', (done) => {
            // arrange
            mockSharedPreference.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.DEVICE_LOCATION:
                        value = undefined;
                        break;
                    case PreferenceKey.IP_LOCATION:
                        value = undefined;
                        break;
                }
                return of(value);
            });
            mockFrameworkService.searchOrganization = jest.fn(() => of({
                count: 10,
                content: [{
                    id: 'sample_id'
                }]
            })) as any;
            // act
            locationHandler.getAvailableLocation({}, true).then((response) => {
                // assert
                done();
            })
        })
        it('should get avaliable location for else cndtn without device and ip location', (done) => {
            // arrange
            mockSharedPreference.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.DEVICE_LOCATION:
                        value = undefined;
                        break;
                    case PreferenceKey.IP_LOCATION:
                        value = undefined;
                        break;
                }
                return of(value);
            });
            mockFrameworkService.searchOrganization = jest.fn(() => of({
                count: 10,
                content: [{
                    id: 'sample_id'
                }]
            })) as any;
            // act
            locationHandler.getAvailableLocation({}, false).then((response) => {
                // assert
                done();
            })
        })
    });
    describe('isUserLocationAvalable', () => {
        it('should return true if userLocation is available', () => {
            // arrange
            // act
            expect(locationHandler.isUserLocationAvalable(mockProfile)).toBeTruthy();
        });

        it('should return false if userLocation is not available', () => {
            // arrange
            // act
            expect(locationHandler.isUserLocationAvalable({})).toBeFalsy();
        });
    });
    describe('getLocationList', () => {
        it('should return locationList for school', (done) => {
            // arrange
            const request = {
                filters: {
                    parentId: 'sample-parent-id',
                    type: 'school'
                }
            };
            mockFrameworkService.searchOrganization = jest.fn(() => of({
                content: [{
                    externalId: 'sample-id',
                    orgName: 'sample-org'
                }]
            })) as any;
            // act
            locationHandler.getLocationList(request);
            // assert
            setTimeout(() => {
                expect(mockFrameworkService.searchOrganization).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should return undefined for not external id for locationList for school', (done) => {
            // arrange
            const request = {
                filters: {
                    parentId: 'sample-parent-id',
                    type: 'school'
                }
            };
            mockFrameworkService.searchOrganization = jest.fn(() => of({
                content: [{
                    orgName: 'sample-org'
                }]
            })) as any;
            // act
            locationHandler.getLocationList(request);
            // assert
            setTimeout(() => {
                expect(mockFrameworkService.searchOrganization).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should return locationList for state', (done) => {
            // arrange
            const request = {
                filters: {
                    parentId: 'sample-parent-id',
                    type: 'state'
                }
            };
            mockProfileService.searchLocation = jest.fn(() => of([{
                code: 'state-code',
                name: 'state-name',
                type: 'sample-type',
                id: 'state-id'
            }]));
            // act
            locationHandler.getLocationList(request);
            // assert
            setTimeout(() => {
                expect(mockProfileService.searchLocation).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('getLocationDetails', () => {
        it('should return undefined for no location details', () => {
            // arrange
            mockProfileService.searchLocation = jest.fn(() => of({})) as any;
            // act
            locationHandler.getLocationDetails('cluster', 'school', 'loc-id')
            // assert
        })
    })
});
