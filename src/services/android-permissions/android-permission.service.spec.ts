import { AndroidPermissionsService } from '../android-permissions/android-permissions.service';
import { AndroidPermission, AndroidPermissionsStatus, PermissionAskedEnum } from '../android-permissions/android-permission';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
declare const cordova;

describe('AndroidPermissionsService', () => {
    let androidPermissionsService: AndroidPermissionsService;
    beforeAll(() => {
        androidPermissionsService = new AndroidPermissionsService();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of AndroidPermissionsService', () => {
        expect(androidPermissionsService).toBeTruthy();
    });

    describe('checkPermissions()', () => {
        it('should return required permission information', (done) => {
            // arrange
            cordova.plugins.permissions.checkPermission = jest.fn((_, success, error) => {
                success({
                    hasPermission: true,
                    isPermissionAlwaysDenied: true
                });
            });

            cordova.plugins.diagnostic.getPermissionAuthorizationStatus = jest.fn((success, error, _) => {
                success('DENIED_ALWAYS');
            });
            // act n assert
            androidPermissionsService.checkPermissions([
                AndroidPermission.CAMERA,
                AndroidPermission.WRITE_EXTERNAL_STORAGE,
                AndroidPermission.RECORD_AUDIO
            ]).subscribe((response) => {
                expect(response).toEqual({
                    'android.permission.CAMERA': {
                        hasPermission: true,
                        isPermissionAlwaysDenied: true
                    },
                    'android.permission.WRITE_EXTERNAL_STORAGE': {
                        hasPermission: true,
                        isPermissionAlwaysDenied: true
                    },
                    'android.permission.RECORD_AUDIO': {
                        hasPermission: true,
                        isPermissionAlwaysDenied: true
                    }
                });
                done();
            });
        });

        it('should throw error if the plugin error throws an error', (done) => {
            // arrange
            cordova.plugins.permissions.checkPermission = jest.fn((_, success, error) => {
                error({
                    hasPermission: true,
                    isPermissionAlwaysDenied: true
                });
            });

            cordova.plugins.diagnostic.getPermissionAuthorizationStatus = jest.fn((success, error, _) => {
                success('DENIED_ALWAYS');
            });
            // act n assert
            androidPermissionsService.checkPermissions([
                AndroidPermission.CAMERA,
                AndroidPermission.WRITE_EXTERNAL_STORAGE,
                AndroidPermission.RECORD_AUDIO
            ]).pipe(
                catchError(() => {
                    done();
                    return of({});
                })
            ).subscribe((response) => {
            });
        });
    });

    describe('requestPermission()', () => {
        it('should return required permission information for request permission', (done) => {
            // arrange
            cordova.plugins.permissions.requestPermissions = jest.fn((_, success, error) => {
                success({
                    hasPermission: true,
                    isPermissionAlwaysDenied: true
                });
            });

            cordova.plugins.diagnostic.getPermissionAuthorizationStatus = jest.fn((success, error, _) => {
                success('NOT_REQUESTED');
            });
            // act n assert
            androidPermissionsService.requestPermission(AndroidPermission.CAMERA).subscribe((response) => {
                expect(response).toEqual(
                    {
                        hasPermission: true,
                        isPermissionAlwaysDenied: false
                    }
                );
                done();
            });
        });

        it('should handle the error scenario when plugin throws an error', (done) => {
            // arrange
            cordova.plugins.permissions.requestPermissions = jest.fn((_, success, error) => {
                error({
                    hasPermission: true,
                    isPermissionAlwaysDenied: true
                });
            });

            cordova.plugins.diagnostic.getPermissionAuthorizationStatus = jest.fn((success, error, _) => {
                success('NOT_REQUESTED');
            });
            // act n assert
            androidPermissionsService.requestPermission(AndroidPermission.CAMERA).pipe(
                catchError(() => {
                    done();
                    return of({});
                })
            ).subscribe((response) => {
            });
        });
    });

    describe('requestPermissions()', () => {
        it('should return required permission information for request permissions', (done) => {
            // arrange
            cordova.plugins.permissions.requestPermissions = jest.fn((_, success, error) => {
                success({
                    hasPermission: true,
                    isPermissionAlwaysDenied: true
                });
            });

            cordova.plugins.diagnostic.getPermissionAuthorizationStatus = jest.fn((success, error, _) => {
                success('NOT_REQUESTED');
            });
            // act n assert
            androidPermissionsService.requestPermissions([AndroidPermission.CAMERA]).subscribe((response) => {
                expect(response).toEqual(
                    {
                        hasPermission: true,
                        isPermissionAlwaysDenied: true
                    }
                );
                done();
            });
        });

        it('should handle the error scenario when plugin throws an error', (done) => {
            // arrange
            cordova.plugins.permissions.requestPermissions = jest.fn((_, success, error) => {
                error({
                    hasPermission: true,
                    isPermissionAlwaysDenied: true
                });
            });

            cordova.plugins.diagnostic.getPermissionAuthorizationStatus = jest.fn((success, error, _) => {
                error('NOT_REQUESTED');
            });
            // act n assert
            androidPermissionsService.requestPermissions([AndroidPermission.CAMERA]).pipe(
                catchError(() => {
                    done();
                    return of({});
                })
            ).subscribe((response) => {
            });
        });
    });

    describe('getAlwaysDeniedStatus()', () => {
        it('should reject the result', (done) => {
            // arrange
            cordova.plugins.diagnostic.getPermissionAuthorizationStatus = jest.fn((success, error, _) => {
                error('DENIED_ALWAYS');
            });
            // act n assert
            androidPermissionsService['getAlwaysDeniedStatus'](
                AndroidPermission.CAMERA
               ).catch((response) => {
                   done();
            });
        });

    });
});
