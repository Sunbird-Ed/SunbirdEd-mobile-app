import { LocationHandler } from './location-handler';
import { of } from 'rxjs';
import { ProfileService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { PreferenceKey } from '../app/app.constant';

describe('LocationHandler', () => {
    let locationHandler: LocationHandler;

    const mockSharedPreference: Partial<SharedPreferences> = {
    };

    const mockProfile = {
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
            }]
    };
    const mockProfileService: Partial<ProfileService> = {
        searchLocation: jest.fn(() => of(mockProfile.userLocations))
    };


    beforeAll(() => {
        locationHandler = new LocationHandler(
            mockSharedPreference as SharedPreferences,
            mockProfileService as ProfileService
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
            // act
            locationHandler.getAvailableLocation(mockProfile).then((response) => {
                // assert
                expect(response).toEqual(mockProfile.userLocations);
                done();
            });
        });

        it('should return location results if device location is available with stateId and districtId', (done) => {
            // arrange
            mockSharedPreference.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.DEVICE_LOCATION:
                        value = '{\"district\":\"sample_district\",\"districtId\":\"sample_id\",\"state\":\"sample_state\",\"stateId\":\"sample_id\"}'
                        break;
                }
                return of(value);
            });
            // act
            locationHandler.getAvailableLocation().then((response) => {
                // assert
                expect(response).toEqual([{
                    type: 'state',
                    code: 'sample_id',
                    name: 'sample_state',
                    id: 'sample_id'
                },
                    {
                        type: 'district',
                        code: 'sample_id',
                        name: 'sample_district',
                        id: 'sample_id'
                    }]);
                done();
            });
        });


        it('should return location results if device location is available without stateId and districtId', (done) => {
            // arrange
            mockSharedPreference.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.DEVICE_LOCATION:
                        value = '{\"district\":\"sample_district\",\"state\":\"sample_state\"}';
                        break;
                }
                return of(value);
            });
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

    });

    describe('isUserLocationAvalable', () => {
        it('should return true if userLocation is available', () => {
            // arrange
            // act
            expect(locationHandler.isUserLocationAvalable(mockProfile)).toBeTruthy();
        });
    });

});
