import {NavParams} from '@ionic/angular';

import {ShowVendorAppsComponent} from './show-vendor-apps.component';
import {TelemetryGeneratorService, UtilityService} from '@app/services';

describe('ShowVendorAppsComponent', () => {
    let showVendorAppsComponent: ShowVendorAppsComponent;
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'content':
                    value = {
                        artifactUrl: 'https://sample'
                    };
                    break;
                case 'appLists':
                    value = [
                        {
                            name: 'Google Bolo',
                            logo: 'https://img.icons8.com/doodle/48/000000/league-of-legends.png',
                            provider: {
                                name: 'Google',
                                copyright: '',
                                license: ''
                            },
                            android: {
                                packageId: 'io.ionic.sender',
                                appVersion: '54',
                                compatibilityVer: ''
                            },
                            ios: {
                                packageId: '',
                                appVersion: '',
                                urlScheme: '',
                                compatibilityVer: ''
                            },
                            target: {
                                mimeType: [
                                    'application/pdf'
                                ],
                                primaryCategory: [
                                    'LearningResource'
                                ]
                            }
                        },
                    ];
                    break;
            }
        })
    };
    const mockUtilityService: Partial<UtilityService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

    beforeAll(() => {
        showVendorAppsComponent = new ShowVendorAppsComponent(
            mockNavParams as NavParams,
            mockUtilityService as UtilityService,
            mockTelemetryGeneratorService as TelemetryGeneratorService
        );
    });

    it('should provide instance of showVendorAppsComponent', () => {
        expect(showVendorAppsComponent).toBeTruthy();
    });
});
