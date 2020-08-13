import { ManageUserProfilesPage } from './manage-user-profiles.page';
import {
  ProfileService,
  SharedPreferences
} from 'sunbird-sdk';
import { Router } from '@angular/router';
import { AppHeaderService } from '../../../services/app-header.service';
import { CommonUtilService } from '../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { TncUpdateHandlerService } from '../../../services/handlers/tnc-update-handler.service';
import { Events, Platform, PopoverController } from '@ionic/angular';
import { Location } from '@angular/common';

describe('ManageUserProfilesPage', () => {

  let manageUserProfilesPage: ManageUserProfilesPage;

  const mockProfileService: Partial<ProfileService> = {};
  const mockSharedPreferences: Partial<SharedPreferences> = {};
  const mockAppHeaderService: Partial<AppHeaderService> = {};
  const mockRouter: Partial<Router> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockEvents: Partial<Events> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockPlatform: Partial<Platform> = {};
  const mockLocation: Partial<Location> = {};
  const mockPopoverController: Partial<PopoverController> = {};
  const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {};

  beforeAll(() => {
    manageUserProfilesPage = new ManageUserProfilesPage(
        mockProfileService as ProfileService,
        mockSharedPreferences as SharedPreferences,
        mockAppHeaderService as AppHeaderService,
        mockRouter as Router,
        mockCommonUtilService as CommonUtilService,
        mockEvents as Events,
        mockTelemetryGeneratorService as TelemetryGeneratorService,
        mockPlatform as Platform,
        mockLocation as Location,
        mockPopoverController as PopoverController,
        mockTncUpdateHandlerService as TncUpdateHandlerService
    );
  });

});
