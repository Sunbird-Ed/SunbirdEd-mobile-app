import { UpgradePopoverComponent } from './upgrade-popover.component';
import { PopoverController, NavParams } from '@ionic/angular';
import { Environment, ImpressionSubtype, ImpressionType, InteractSubtype, PageId, TelemetryGeneratorService } from '../../../../services';
import { InteractType } from '@project-sunbird/sunbird-sdk';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';

describe('UpgradePopoverComponent', () => {
    let upgradePopoverComponent: UpgradePopoverComponent;

    window.cordova.plugins = {
        InAppUpdateManager: {
            checkForImmediateUpdate: jest.fn((fn) => (fn = jest.fn()))
        }
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('some_string'))
    };
    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn()
    };

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'upgrade':
                    value = {
                        type: 'force',
                        optional: 'forceful',
                        title: 'We recommend that you upgrade to the latest version of Sunbird.',
                        desc: '',
                        actionButtons: [
                            {
                                action: 'yes',
                                label: 'Update Now',
                                link: 'https://play.google.com/store/apps/details?id=org.sunbird.app&hl=en'
                            },
                            {
                                action: 'no',
                                label: 'Cancel'
                            },
                            {
                                action: 'xyz',
                                label: 'Cancel'
                            }
                        ],
                        isOnboardingCompleted: true,
                        minVersionCode: 13,
                        maxVersionCode: 52,
                        currentAppVersionCode: 23,
                    };
                    break;
            }
            return value;
        })
    };

    beforeAll(() => {
        upgradePopoverComponent = new UpgradePopoverComponent(
            mockPopOverController as PopoverController,
            mockNavParams as NavParams,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppVersion as AppVersion
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of UpgradePopoverComponent', () => {
        expect(upgradePopoverComponent).toBeTruthy();
    });

    it('should close popover', () => {
        // arrange
        // act
        upgradePopoverComponent.cancel();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalled();
    });

    it('should invoke openPlayStore', () => {
        // arrange
        upgradePopoverComponent.upgradeType.type = 'optional';
        // act
        upgradePopoverComponent.upgradeApp('https://play.google.com/store/apps/details?id=org.sunbird.app');
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalled();
    });

    it('should invoke openPlayStore and upgradeType force', () => {
        // arrange
        upgradePopoverComponent.upgradeType.type = 'forced';
        // act
        upgradePopoverComponent.upgradeApp('https://play.google.com/store/apps/details?id=org.sunbird.app');
        // assert
        expect(mockPopOverController.dismiss).not.toHaveBeenCalled();
    });

    it('should generate impression and interact when popoup shows', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        upgradePopoverComponent.init();
        // assert
        setTimeout(() => {
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                ImpressionSubtype.UPGRADE_POPUP,
                PageId.UPGRADE_POPUP,
                Environment.HOME
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.FORCE_UPGRADE_INFO,
                Environment.HOME,
                PageId.UPGRADE_POPUP,
                undefined,
                {
                    minVersionCode: 13,
                    maxVersionCode: 52,
                    currentAppVersionCode: 23
                }
            );
            done();
        }, 0);
    });

});


describe('UpgradeComponent in deeplink ', () => {
    let upgradePopoverComponent: UpgradePopoverComponent;
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('some_string'))
    };
    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn()
    };

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'upgrade':
                    value = {
                        type: 'optional',
                        title: 'We recommend that you upgrade to the latest version of Sunbird.',
                        desc: '',
                        isOnboardingCompleted: false,
                        currentAppVersionCode: 1,
                        requiredVersionCode: 2
                    };
                    break;
            }
            return value;
        })
    };

    beforeAll(() => {
        upgradePopoverComponent = new UpgradePopoverComponent(
            mockPopOverController as PopoverController,
            mockNavParams as NavParams,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppVersion as AppVersion
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('isMandatoryUpgrade should be false when popoup shows', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        upgradePopoverComponent.init();
        // assert
        setTimeout(() => {
            expect(upgradePopoverComponent.isMandatoryUpgrade).toBeFalsy();
            done();
        }, 0);
    });

    it('should generate impression and interact event when init() called', (done) => {
        // arrange
        // act
        upgradePopoverComponent.init();

        setTimeout(() => {
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                ImpressionSubtype.DEEPLINK,
                PageId.UPGRADE_POPUP,
                Environment.ONBOARDING
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.OPTIONAL_UPGRADE,
                Environment.ONBOARDING,
                PageId.UPGRADE_POPUP,
                undefined,
                {
                    currentAppVersionCode: 1,
                    requiredVersionCode: 2
                }
            );
            done();
        }, 0);
    });

    it('should close popover', () => {
        // arrange
        // act
        upgradePopoverComponent.cancel();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalled();
    });


});

describe('UpgradeComponent in deeplink for deeplink upgrade scenario ', () => {
    let upgradePopoverComponent: UpgradePopoverComponent;
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('some_string'))
    };
    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn()
    };

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'upgrade':
                    value = {
                        type: 'optional',
                        title: 'We recommend that you upgrade to the latest version of Sunbird.',
                        desc: '',
                        isOnboardingCompleted: false,
                        currentAppVersionCode: 1,
                        requiredVersionCode: 2,
                        isFromDeeplink: true
                    };
                    break;
            }
            return value;
        })
    };

    beforeAll(() => {
        upgradePopoverComponent = new UpgradePopoverComponent(
            mockPopOverController as PopoverController,
            mockNavParams as NavParams,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppVersion as AppVersion
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('should generate deeplink upgradeinteract event when init() called', (done) => {
        // arrange
        // act
        upgradePopoverComponent.init();

        setTimeout(() => {
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                ImpressionSubtype.DEEPLINK,
                PageId.UPGRADE_POPUP,
                Environment.ONBOARDING
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.DEEPLINK_UPGRADE,
                Environment.ONBOARDING,
                PageId.UPGRADE_POPUP,
                undefined,
                {
                    currentAppVersionCode: 1,
                    requiredVersionCode: 2
                }
            );
            done();
        }, 0);
    });


});