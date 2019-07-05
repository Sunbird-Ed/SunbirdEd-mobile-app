import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageSettingsPage } from './storage-settings.page';

describe('StorageSettingsPage', () => {
  let component: StorageSettingsPage;
  let fixture: ComponentFixture<StorageSettingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorageSettingsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
