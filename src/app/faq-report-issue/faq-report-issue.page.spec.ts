import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqReportIssuePage } from './faq-report-issue.page';

describe('FaqReportIssuePage', () => {
  let component: FaqReportIssuePage;
  let fixture: ComponentFixture<FaqReportIssuePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqReportIssuePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqReportIssuePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
