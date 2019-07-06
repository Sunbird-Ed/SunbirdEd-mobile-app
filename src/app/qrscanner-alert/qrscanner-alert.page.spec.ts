import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QrscannerAlertPage } from './qrscanner-alert.page';

describe('QrscannerAlertPage', () => {
  let component: QrscannerAlertPage;
  let fixture: ComponentFixture<QrscannerAlertPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QrscannerAlertPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrscannerAlertPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
