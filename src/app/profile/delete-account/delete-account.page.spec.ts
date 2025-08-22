import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { DeleteAccountPage } from './delete-account.page';

describe('DeleteAccountPage', () => {
  let component: DeleteAccountPage;
  let fixture: ComponentFixture<DeleteAccountPage>;

  const mockRouter = {
    getCurrentNavigation: () => ({
      extras: {
        state: {
          profile: { userId: 'test-user', roles: [] }
        }
      }
    }),
    navigate: jest.fn()
  };

  const mockProfileService = {
    getActiveProfileSession: () => of({ userId: 'test-user', uid: 'test-uid' }),
    deleteUser: () => of({ result: { response: 'SUCCESS' } }),
    deleteProfileData: () => of(true)
  };

  const mockSystemSettingsService = {
    getSystemSettings: () => of({ value: 'false' })
  };

  const mockCommonUtilService = {
    getLoader: () => Promise.resolve({
      present: () => Promise.resolve(),
      dismiss: () => Promise.resolve()
    }),
    showToast: () => Promise.resolve(),
    translateMessage: (key: string) => key
  };

  const mockHeaderService = {
    getDefaultPageConfig: () => ({}),
    updatePageConfig: jest.fn()
  };

  const mockTelemetryGeneratorService = {
    generateImpressionTelemetry: jest.fn(),
    generateInteractTelemetry: jest.fn(),
    generateBackClickedTelemetry: jest.fn()
  };

  const mockLogoutHandler = {
    onLogout: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteAccountPage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: 'PROFILE_SERVICE', useValue: mockProfileService },
        { provide: 'SYSTEM_SETTINGS_SERVICE', useValue: mockSystemSettingsService },
        { provide: 'CommonUtilService', useValue: mockCommonUtilService },
        { provide: 'AppHeaderService', useValue: mockHeaderService },
        { provide: 'TelemetryGeneratorService', useValue: mockTelemetryGeneratorService },
        { provide: 'LogoutHandlerService', useValue: mockLogoutHandler }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with delete conditions', () => {
    expect(component.deleteConditions).toBeDefined();
    expect(component.deleteConditions.length).toBeGreaterThan(0);
  });

  it('should enable submit button when all conditions are checked', () => {
    component.deleteConditions.forEach(condition => {
      component.onConditionChange(condition, true);
    });
    
    expect(component.enableSubmitBtn).toBe(true);
  });

  it('should disable submit button when not all conditions are checked', () => {
    component.onConditionChange(component.deleteConditions[0], true);
    
    expect(component.enableSubmitBtn).toBe(false);
  });
});
