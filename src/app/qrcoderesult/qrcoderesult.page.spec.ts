import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QrcoderesultPage } from './qrcoderesult.page';

describe('QrcoderesultPage', () => {
  let component: QrcoderesultPage;
  let fixture: ComponentFixture<QrcoderesultPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QrcoderesultPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrcoderesultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
