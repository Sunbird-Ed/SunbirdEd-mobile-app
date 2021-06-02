import {SignInCardComponent} from './sign-in-card.component';
import {ProfileService, AuthService, SharedPreferences, Profile, ProfileType, ProfileSource, SignInError} from 'sunbird-sdk';
import {
    CommonUtilService, AppGlobalService, TelemetryGeneratorService,
    ContainerService, FormAndFrameworkUtilService
} from '../../../services';
import {NavController} from '@ionic/angular';
import {Events} from '@app/util/events';
import {NgZone} from '@angular/core';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {of, throwError} from 'rxjs';
import {SbProgressLoader} from '../../../services/sb-progress-loader.service';
import {Router} from '@angular/router';
import {SegmentationTagService} from '../../../services/segmentation-tag/segmentation-tag.service';
import {RouterLinks} from '@app/app/app.constant';

jest.mock('sunbird-sdk', () => {
    const actual = require.requireActual('sunbird-sdk');
    return {
        ...actual,
        WebviewLoginSessionProvider() {
        }
    };
});

jest.mock('@app/app/module.service', () => {
    const actual = require.requireActual('@app/app/module.service');
    return {
        ...actual,
        initTabs: jest.fn().mockImplementation(() => {
        })
    };
});

describe('SignInCardComponent', () => {
    let signInCardComponent: SignInCardComponent;
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };
    const mockRouter: Partial<Router> = {};

    beforeAll(() => {
        signInCardComponent = new SignInCardComponent(
            mockAppVersion as AppVersion,
            mockRouter as Router,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of SignInCardComponent', () => {
        expect(signInCardComponent).toBeTruthy();
    });

    describe('sign-in', () => {
        it('should check for the source and then navigate to sign-in page', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            signInCardComponent.signIn({source: 'profile'});
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN], {state: {source: 'profile'}});
        });
    });
});
