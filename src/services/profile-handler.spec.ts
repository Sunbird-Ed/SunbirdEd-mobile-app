import { ProfileHandler } from './profile-handler';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { of } from 'rxjs';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { PreferenceKey } from '@app/app/app.constant';

describe('ProfileHandler', () => {
    let profileHandler: ProfileHandler;

    const mockSharedPreference: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('student'))
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getFormFields: jest.fn(() => Promise.resolve([
            {
                code: 'student',
                name: 'Student',
                searchFilter: [
                    'Student'
                ],
                attributes: {
                    mandatory: [
                        'board',
                        'medium',
                        'gradeLevel'
                    ],
                    optional: [
                        'subject'
                    ]
                }
            },
            {
                code: 'teacher',
                name: 'Teacher',
                searchFilter: [
                    'Teacher'
                ],
                attributes: {
                    mandatory: [
                        'board',
                        'medium',
                        'gradeLevel'
                    ],
                    optional: [
                        'subject'
                    ]
                }
            },
            {
                code: 'administrator',
                name: 'Admin',
                searchFilter: [
                    'Administrator'
                ],
                attributes: {
                    mandatory: [
                        'board'
                    ],
                    optional: []
                }
            }
        ]))
    };



    beforeAll(() => {
        profileHandler = new ProfileHandler(
            mockSharedPreference as SharedPreferences,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of ProfileHandler', () => {
        // arrange
        // act
        // assert
        expect(profileHandler).toBeTruthy();
    });

    describe('getSupportedProfileAttributes', () => {
        it('should return categories map if userType is not available', (done) => {
            // arrange
            // act
            profileHandler.getSupportedProfileAttributes().then((response) => {
                // assert
                expect(mockSharedPreference.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
                expect(response).toEqual({
                    board: 'board',
                    medium: 'medium',
                    gradeLevel: 'gradeLevel'
                });
                done();
            });
        });

        it('should return categories map if userType is  available', (done) => {
            // arrange
            // act
            profileHandler.getSupportedProfileAttributes(false, 'student').then((response) => {
                // assert
                expect(response).toEqual({
                    board: 'board',
                    medium: 'medium',
                    gradeLevel: 'gradeLevel'
                });
                done();
            });
        });

        it('should return categories map  along with option category if showOPtionAttributes parameter is true', (done) => {
            // arrange
            // act
            profileHandler.getSupportedProfileAttributes(true, 'student').then((response) => {
                // assert
                expect(response).toEqual({
                    board: 'board',
                    medium: 'medium',
                    gradeLevel: 'gradeLevel',
                    subject: 'subject'
                });
                done();
            });
        });
    });

    describe('getAudience', () => {
        it('should return supported audience of given userType', (done) => {
            // arrange
            // act
            profileHandler.getAudience('student').then((response) => {
                // assert
                expect(response).toEqual(['Student']);
                done();
            });
        });
    });

});
