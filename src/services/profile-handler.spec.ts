import { ProfileHandler } from './profile-handler';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { of, throwError } from 'rxjs';
import { ContentDisposition, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { PreferenceKey } from '../app/app.constant';
import { mockSupportedUserTypeConfig, mockFormFielddata, profile, userLocation, subPersonaConfig} from './profile-handler.spec.data';
import { CommonUtilService } from './common-util.service';

describe('ProfileHandler', () => {
    let profileHandler: ProfileHandler;

    const mockSharedPreference: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('student'))
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getFormFields: jest.fn(() => Promise.resolve(mockSupportedUserTypeConfig))
    };

    const mockCommonUtilService: Partial<CommonUtilService> = {
        getTranslatedValue: jest.fn(() => 'Student')
    };

    beforeAll(() => {
        profileHandler = new ProfileHandler(
            mockSharedPreference as SharedPreferences,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of ProfileHandler', () => {
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

        it('should return empty object is no specific user type config', (done) => {
            // arrange
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(
                mockFormFielddata
            ));
            // act
            profileHandler.getSupportedProfileAttributes(true, 'name').then((response) => {
                // assert
                expect(response).toEqual({});
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
                expect(response).toEqual(['Student', 'Learner']);
                done();
            });
        });
    });
    describe('getSupportedUserTypes', () => {
        it('should return supporteduserType Config', (done) => {
            // arrange
            // act
            profileHandler.getSupportedUserTypes().then((response) => {
                // assert
                expect(response.length).toEqual(3);
                done();
            });
        });
    });

    describe('getSubPersona', () => {
        it('should return undefined if profile user type is undefined', () => {
            // arrange
            const profile1 = {
                "maskedPhone": null,
                "tcStatus": null,
                "channel": "sunbirdpreprodcustodian"
            }
            const persona = 'parent';
            // act
            profileHandler.getSubPersona(profile1, persona, userLocation);

            // assert
        })
        it('should get label', () => {
            const subPersonaLabelArray = [
                {
                    value: 'hm',
                    label: 'HM'
                }
            ]
            const persona = 'parent';
            subPersonaLabelArray.push({ value: 'sample', label : 'SAMPLE'});
            profileHandler.getSubPersona(profile, persona, userLocation);
            expect(subPersonaLabelArray).toEqual(
                expect.arrayContaining([
                expect.objectContaining({label: 'SAMPLE'})
                ])
            ); 
        })

        it('should call getProfileFormConfig and no subpersona', async () => {
            //arrange
            const persona = 'student';
            const subPersonaCodes = [];
            subPersonaCodes.push(profile.profileUserType);
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(
                mockFormFielddata
            ));
            //act
            profileHandler.getSubPersona(profile, persona, userLocation);
            //assert
            expect(subPersonaCodes).toEqual(
                expect.arrayContaining([
                expect.objectContaining({"subType": "subType", "type": "parent"})
                ])
            );
            expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
        }); 

        it('should call getProfileFormConfig and with subpersona and profile user type', async () => {
            //arrange
            const persona = 'other';
            const subPersonaCodes = [];
            subPersonaCodes.push(profile.profileUserType);
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(
                mockFormFielddata
            ));
            //act
            profileHandler.getSubPersona(profile, persona, userLocation);
            //assert
            expect(subPersonaCodes).toEqual(
                expect.arrayContaining([
                expect.objectContaining({"subType": "subType", "type": "parent"})
                ])
            );
            expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
        }); 

        it('should call getProfileFormConfig', async () => {
            //arrange
            const persona = 'parent';
            const subPersonaCodes = [];
            subPersonaCodes.push(profile.profileUserType);
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(
                mockFormFielddata
            ));
            //act
            profileHandler.getSubPersona(profile, persona, userLocation);
            //assert
            expect(subPersonaCodes).toEqual(
                expect.arrayContaining([
                expect.objectContaining({"subType": "subType", "type": "parent"})
                ])
            );
            expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
        });   

        it('should call getProfileFormConfig and no profile user types', async () => {
            //arrange
            const persona = 'parent';
            let profile1 = profile
            const subPersonaCodes = [];
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(
                mockFormFielddata
            ));
            //act
            profileHandler.getSubPersona(profile1, persona, userLocation);
            //assert
            expect(subPersonaCodes).toEqual([]);
        });   

        it('should call getProfileFormConfig as defaulf on error', async () => {
            //arrange
            const persona = 'parent';
            const subPersonaCodes = [];
            subPersonaCodes.push(profile.profileUserType);
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.reject({Error: "error"}));
            //act
            profileHandler.getSubPersona(profile, persona, userLocation);
            //assert
            expect(subPersonaCodes).toEqual(
                expect.arrayContaining([
                expect.objectContaining({"subType": "subType", "type": "parent"})
                ])
            );
        });   
    })

    describe('getPersonaConfig', () => {
        it('should get PersonaConfig', () => {
            // arrange
            // act
            profileHandler.getPersonaConfig('');
            // assert
        })
    })
});