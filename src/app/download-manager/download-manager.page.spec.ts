import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadManagerPage } from './download-manager.page';

describe('DownloadManagerPage', () => {
  let component: DownloadManagerPage;
  let fixture: ComponentFixture<DownloadManagerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadManagerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
